"use client";

import { useState } from "react";
import { Markdown } from "./markdown";
import { Textarea } from "./textarea";

const tabClass = (active: boolean) =>
  `rounded px-2 py-0.5 ${active ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`;

/** A textarea for markdown with a tab that shows it the way the site will (same renderer, same styles). */
export function MarkdownTextarea({
  label,
  value,
  onChange,
  rows = 8,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-zinc-500">{label}</span>
        <div className="flex gap-1 text-xs">
          <button type="button" onClick={() => setMode("edit")} className={tabClass(mode === "edit")}>
            Текст
          </button>
          <button type="button" onClick={() => setMode("preview")} className={tabClass(mode === "preview")}>
            Предпросмотр
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <>
          <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
          <p className="text-xs text-zinc-500">
            Markdown: <code>## заголовок</code> · <code>**жирный**</code> · <code>*курсив*</code> · <code>- список</code>{" "}
            · <code>[текст](https://…)</code> · <code>`код`</code>
          </p>
        </>
      ) : (
        <div className="min-h-[8rem] rounded-md bg-[#141312] p-4">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-zinc-500">Пока пусто</p>}
        </div>
      )}
    </div>
  );
}
