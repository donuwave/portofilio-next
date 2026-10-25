import type { LocalizedText } from "@/shared/lib/localized-text";
import { Field } from "./field";
import { Input } from "./input";
import { MarkdownTextarea } from "./markdown-textarea";
import { Textarea } from "./textarea";

type LocalizedTextFieldProps = {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
  /** Multiline text that is markdown: adds a preview tab and a syntax hint. */
  markdown?: boolean;
};

export function LocalizedTextField({ label, value, onChange, multiline, markdown }: LocalizedTextFieldProps) {
  if (multiline && markdown) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MarkdownTextarea label={`${label} (RU)`} value={value.ru} onChange={(ru) => onChange({ ...value, ru })} />
        <MarkdownTextarea label={`${label} (EN)`} value={value.en} onChange={(en) => onChange({ ...value, en })} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label={`${label} (RU)`}>
        {multiline ? (
          <Textarea rows={3} value={value.ru} onChange={(e) => onChange({ ...value, ru: e.target.value })} />
        ) : (
          <Input value={value.ru} onChange={(e) => onChange({ ...value, ru: e.target.value })} />
        )}
      </Field>
      <Field label={`${label} (EN)`}>
        {multiline ? (
          <Textarea rows={3} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
        ) : (
          <Input value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
        )}
      </Field>
    </div>
  );
}
