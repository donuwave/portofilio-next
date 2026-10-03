import { CaseItem } from "@/entities/case/ui/case-item";
import type { Case } from "@/entities/case/model/types";

export function ProjectCases({ cases }: { cases: Case[] }) {
  if (cases.length === 0) return null;

  return (
    <section id="project-cases" aria-labelledby="project-cases-title">
      <h2 id="project-cases-title" className="mb-10 text-sm text-[#8a8378]">
        Кейсы
      </h2>
      {cases.map((caseItem, index) => (
        <CaseItem key={caseItem.id} item={caseItem} index={index} isLast={index === cases.length - 1} />
      ))}
    </section>
  );
}
