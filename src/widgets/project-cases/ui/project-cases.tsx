import { CaseItem } from "@/entities/case/ui/case-item";
import type { Case } from "@/entities/case/model/types";

export function ProjectCases({ cases }: { cases: Case[] }) {
  if (cases.length === 0) return null;

  return (
    <section aria-label="Кейсы">
      {cases.map((caseItem, index) => (
        <CaseItem key={caseItem.id} item={caseItem} index={index} isLast={index === cases.length - 1} />
      ))}
    </section>
  );
}
