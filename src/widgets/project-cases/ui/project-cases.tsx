import { CaseItem } from "@/entities/case/ui/case-item";
import type { Case } from "@/entities/case/model/types";
import { SectionHeading } from "@/shared/ui/section-heading";

export function ProjectCases({ cases }: { cases: Case[] }) {
  if (cases.length === 0) return null;

  return (
    <section id="project-cases">
      <SectionHeading index={1} label="Кейсы" />
      <div className="mt-14">
        {cases.map((caseItem, index) => (
          <CaseItem key={caseItem.id} item={caseItem} index={index} isLast={index === cases.length - 1} />
        ))}
      </div>
    </section>
  );
}
