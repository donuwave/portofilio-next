"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  addCaseMedia,
  createCase,
  deleteCase,
  fetchCaseMedia,
  fetchCasesAdmin,
  removeCaseMedia,
  updateCase,
} from "@/entities/case/api/case-api";
import type { CaseAdmin, CaseCreateInput, CaseMediaEntry } from "@/entities/case/model/admin-types";
import type { Media } from "@/entities/media/model/types";
import { ApiClientError } from "@/shared/api/http";
import type { LocalizedText } from "@/shared/lib/localized-text";
import { Button } from "@/shared/ui/button";
import { LocalizedTextField } from "@/shared/ui/localized-text-field";
import { MediaPicker } from "@/widgets/media-picker/ui/media-picker";

const EMPTY_LOCALIZED: LocalizedText = { ru: "", en: "" };

function CaseMediaManager({ caseId }: { caseId: string }) {
  const [items, setItems] = useState<CaseMediaEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  function load() {
    fetchCaseMedia(caseId)
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить медиа"));
  }

  useEffect(load, [caseId]);

  async function handleRemove(mediaId: string) {
    try {
      await removeCaseMedia(caseId, mediaId);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось убрать файл");
    }
  }

  async function handleAdd(media: Media | null) {
    setPickerOpen(false);
    if (!media) return;
    try {
      await addCaseMedia(caseId, media.id);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось добавить файл");
    }
  }

  return (
    <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500">МЕДИА КЕЙСА</p>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {items?.map((item) => (
          <div key={item.mediaId} className="relative h-20 w-20">
            {item.media.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.media.path} alt="" className="h-full w-full rounded-md border border-zinc-300 object-cover dark:border-zinc-700" />
            ) : (
              <video src={item.media.path} className="h-full w-full rounded-md border border-zinc-300 object-cover dark:border-zinc-700" />
            )}
            <button
              type="button"
              onClick={() => handleRemove(item.mediaId)}
              aria-label="Убрать из кейса"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-400 dark:border-zinc-700"
        >
          + Добавить
        </button>
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleAdd} />
    </div>
  );
}

type FormMode = { type: "closed" } | { type: "create" } | { type: "edit"; caseEntry: CaseAdmin };

export function AdminCasesList({ projectId }: { projectId: string }) {
  const [cases, setCases] = useState<CaseAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>({ type: "closed" });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  function load() {
    fetchCasesAdmin(projectId)
      .then(setCases)
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить кейсы"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function handleSaved() {
    setFormMode({ type: "closed" });
    load();
  }

  async function handleDelete(caseEntry: CaseAdmin) {
    if (!confirm(`Удалить кейс «${caseEntry.title.ru}»?`)) return;
    try {
      await deleteCase(caseEntry.id);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось удалить кейс");
    }
  }

  async function handleMove(caseEntry: CaseAdmin, direction: -1 | 1) {
    const index = cases.findIndex((c) => c.id === caseEntry.id);
    const swapWith = cases[index + direction];
    if (!swapWith) return;

    setReorderingId(caseEntry.id);
    setError(null);
    try {
      await Promise.all([
        updateCase(caseEntry.id, { order: swapWith.order }),
        updateCase(swapWith.id, { order: caseEntry.order }),
      ]);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось изменить порядок");
    } finally {
      setReorderingId(null);
    }
  }

  if (isLoading) return <p className="text-sm text-zinc-500">Загрузка кейсов...</p>;

  const nextOrder = cases.length > 0 ? Math.max(...cases.map((c) => c.order)) + 1 : 0;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {cases.map((caseEntry, index) =>
          formMode.type === "edit" && formMode.caseEntry.id === caseEntry.id ? (
            <CaseFormBound
              key={caseEntry.id}
              projectId={projectId}
              initial={caseEntry}
              nextOrder={nextOrder}
              onCancel={() => setFormMode({ type: "closed" })}
              onSaved={handleSaved}
            />
          ) : (
            <div key={caseEntry.id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{caseEntry.title.ru || "Без названия"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleMove(caseEntry, -1)}
                    disabled={index === 0 || reorderingId !== null}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleMove(caseEntry, 1)}
                    disabled={index === cases.length - 1 || reorderingId !== null}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setExpandedId(expandedId === caseEntry.id ? null : caseEntry.id)}
                  >
                    {expandedId === caseEntry.id ? "Скрыть медиа" : "Медиа"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setFormMode({ type: "edit", caseEntry })}>
                    Изменить
                  </Button>
                  <Button type="button" variant="danger" onClick={() => handleDelete(caseEntry)}>
                    Удалить
                  </Button>
                </div>
              </div>
              {expandedId === caseEntry.id && <CaseMediaManager caseId={caseEntry.id} />}
            </div>
          )
        )}
        {cases.length === 0 && formMode.type !== "create" && <p className="text-sm text-zinc-500">Кейсов пока нет.</p>}
      </div>

      {formMode.type === "create" ? (
        <CaseFormBound
          projectId={projectId}
          initial={null}
          nextOrder={nextOrder}
          onCancel={() => setFormMode({ type: "closed" })}
          onSaved={handleSaved}
        />
      ) : (
        <Button type="button" variant="secondary" onClick={() => setFormMode({ type: "create" })}>
          Добавить кейс
        </Button>
      )}
    </div>
  );
}

// Bound wrapper so CaseForm (which doesn't know its projectId) can call
// createCase with the right id — kept separate from CaseForm itself so that
// component stays a plain, projectId-agnostic title/description editor.
function CaseFormBound({
  projectId,
  initial,
  nextOrder,
  onCancel,
  onSaved,
}: {
  projectId: string;
  initial: CaseAdmin | null;
  nextOrder: number;
  onCancel: () => void;
  onSaved: (caseEntry: CaseAdmin) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? EMPTY_LOCALIZED);
  const [description, setDescription] = useState(initial?.description ?? EMPTY_LOCALIZED);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const payload: CaseCreateInput = { title, description, order: initial?.order ?? nextOrder };
      const saved = initial ? await updateCase(initial.id, payload) : await createCase(projectId, payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось сохранить кейс");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-zinc-300 p-4 dark:border-zinc-700">
      <LocalizedTextField label="Название кейса" value={title} onChange={setTitle} />
      <LocalizedTextField label="Описание" value={description} onChange={setDescription} multiline />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
