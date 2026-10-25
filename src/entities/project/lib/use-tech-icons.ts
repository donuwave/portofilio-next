"use client";

import { useEffect, useState } from "react";
import { fetchTechIcons } from "../api/project-api";
import type { TechIconData } from "../model/admin-types";

// Remembered across renders and forms, so a name is looked up once per page load.
const known = new Map<string, TechIconData | null>();

/**
 * The icon for each technology name, looked up on the server as names appear. A name that is
 * still being looked up (or has no icon) is simply absent from the result.
 */
export function useTechIcons(names: string[]): Record<string, TechIconData | null | undefined> {
  const [, bump] = useState(0);
  const wanted = names.map((name) => name.trim()).filter(Boolean);
  const key = wanted.join("|");

  useEffect(() => {
    const missing = key.split("|").filter((name) => name && !known.has(name));
    if (missing.length === 0) return;
    let cancelled = false;
    fetchTechIcons(missing)
      .then((icons) => {
        for (const name of missing) known.set(name, icons[name] ?? null);
        if (!cancelled) bump((n) => n + 1);
      })
      .catch(() => {
        // The icons are decoration: if the lookup fails, the names still work.
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return Object.fromEntries(wanted.map((name) => [name, known.get(name)]));
}
