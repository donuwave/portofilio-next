import type { Dictionary } from "@/shared/i18n/dictionaries";

export type NavItem = { key: keyof Dictionary["nav"]; href: string };

export const NAV_ITEMS: NavItem[] = [
  { key: "about", href: "#about" },
  { key: "experience", href: "#experience" },
  { key: "projects", href: "#projects" },
  { key: "contacts", href: "#contact" },
];
