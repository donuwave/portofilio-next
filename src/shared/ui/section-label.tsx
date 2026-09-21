import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs tracking-[0.25em] text-[#8a8378]">{children}</p>;
}
