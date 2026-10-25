import { CaseItem } from "@/entities/case/ui/case-item";
import type { Case } from "@/entities/case/model/types";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/get-locale";
import { SectionHeading } from "@/shared/ui/section-heading";

export function ProjectCases({ cases, locale, index = 1 }: { cases: Case[]; locale: Locale; index?: number }) {
  if (cases.length === 0) return null;

  return (
    <section id="project-cases">
      <SectionHeading index={index} label={getDictionary(locale).projects.cases} />
      <div className="mt-14">
        {cases.map((caseItem, index) => (
          <CaseItem key={caseItem.id} item={caseItem} locale={locale} isLast={index === cases.length - 1} />
        ))}
      </div>
    </section>
  );
}
