import type { LocalizedText } from "@/shared/lib/localized-text";
import { Field } from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

type LocalizedTextFieldProps = {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
};

export function LocalizedTextField({ label, value, onChange, multiline }: LocalizedTextFieldProps) {
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
