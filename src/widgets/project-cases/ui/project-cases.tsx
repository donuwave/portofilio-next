import { CaseItem } from "@/entities/case/ui/case-item";
import type { Case } from "@/entities/case/model/types";

export function ProjectCases({ cases }: { cases: Case[] }) {
  if (cases.length === 0) return null;

  return (
    <section>
      {cases.map((caseItem) => (
        <CaseItem key={caseItem.id} item={caseItem} />
      ))}
    </section>
  );
}
