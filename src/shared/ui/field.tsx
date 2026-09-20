import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium tracking-wide text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
