import { getDictionary, getLocale } from "@/shared/i18n/get-locale";
import { localizePath } from "@/shared/i18n/localize-path";
import type { Locale } from "@/shared/i18n/config";
import { PageBackLink } from "@/shared/ui/page-back-link";

type LegalContent = Record<Locale, { title: string; body: string }>;

export async function LegalView({ content }: { content: LegalContent }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { title, body } = content[locale];
  const blocks = body.split(/\n{2,}/);

  return (
    <main className="mx-auto max-w-[48rem] px-6 pb-24 pt-24 sm:px-12">
      <PageBackLink href={localizePath("/", locale)}>{dict.projects.back}</PageBackLink>

      <h1 className="font-display text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.2] text-[#ece5d6]">{title}</h1>

      <div className="mt-10 space-y-5 text-[1.0625rem] leading-[1.75] text-[#cfc8b8]">
        {blocks.map((block, index) =>
          block.startsWith("## ") ? (
            <h2 key={index} className="pt-4 text-xl font-medium text-[#ece5d6]">
              {block.slice(3)}
            </h2>
          ) : (
            <p key={index} className="whitespace-pre-line">
              {block}
            </p>
          )
        )}
      </div>
    </main>
  );
}
