"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createExperience, deleteExperience, updateExperience } from "@/entities/experience/api/experience-api";
import type { ExperienceAdmin, ExperienceCreateInput } from "@/entities/experience/model/admin-types";
import { fetchProfileAdmin } from "@/entities/profile/api/profile-api";
import { ApiClientError } from "@/shared/api/http";
import type { LocalizedText } from "@/shared/lib/localized-text";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { FramedImage } from "@/shared/ui/framed-image";
import { Input } from "@/shared/ui/input";
import { LocalizedTextField } from "@/shared/ui/localized-text-field";
import { ImageFramer } from "@/widgets/image-framer/ui/image-framer";
import { MediaPickerField } from "@/widgets/media-picker-field/ui/media-picker-field";

const EMPTY_LOCALIZED: LocalizedText = { ru: "", en: "" };

function toDateInputValue(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

function formatRange(dateFrom: string, dateTo: string | null) {
  const from = new Date(dateFrom).getFullYear();
  const to = dateTo ? new Date(dateTo).getFullYear() : "наст. время";
  return `${from} – ${to}`;
}

type FormState = {
  company: string;
  url: string;
  position: LocalizedText;
  dateFrom: string;
  dateTo: string;
  description: LocalizedText;
  logoId: string | null;
  logo: ExperienceAdmin["logo"];
  logoZoom: number;
  logoX: number;
  logoY: number;
};

function toFormState(entry: ExperienceAdmin | null): FormState {
  if (!entry) {
    return {
      company: "",
      url: "",
      position: EMPTY_LOCALIZED,
      dateFrom: "",
      dateTo: "",
      description: EMPTY_LOCALIZED,
      logoId: null,
      logo: null,
      logoZoom: 1,
      logoX: 0,
      logoY: 0,
    };
  }
  return {
    company: entry.company,
    url: entry.url ?? "",
    position: entry.position,
    dateFrom: toDateInputValue(entry.dateFrom),
    dateTo: entry.dateTo ? toDateInputValue(entry.dateTo) : "",
    description: entry.description,
    logoId: entry.logoId,
    logo: entry.logo,
    logoZoom: entry.logoZoom,
    logoX: entry.logoX,
    logoY: entry.logoY,
  };
}

function ExperienceForm({
  initial,
  nextOrder,
  onCancel,
  onSaved,
}: {
  initial: ExperienceAdmin | null;
  nextOrder: number;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.company.trim() || !form.dateFrom) {
      setError("Заполните компанию/учебное заведение и дату начала");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload: ExperienceCreateInput = {
        company: form.company,
        url: form.url.trim() || null,
        position: form.position,
        dateFrom: form.dateFrom,
        dateTo: form.dateTo || null,
        description: form.description,
        logoId: form.logoId,
        logoZoom: form.logoZoom,
        logoX: form.logoX,
        logoY: form.logoY,
        order: initial?.order ?? nextOrder,
      };
      if (initial) {
        await updateExperience(initial.id, payload);
      } else {
        await createExperience(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось сохранить запись");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-zinc-300 p-4 dark:border-zinc-700">
      <Field label="Компания / учебное заведение">
        <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
      </Field>

      <Field label="Ссылка на сайт (откроется в новой вкладке)">
        <Input
          type="url"
          placeholder="https://..."
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
      </Field>

      <Field label="Логотип">
        <MediaPickerField
          type="image"
          value={form.logo}
          onChange={(media) => setForm({ ...form, logo: media, logoId: media?.id ?? null, logoZoom: 1, logoX: 0, logoY: 0 })}
        />
        {form.logo && (
          <ImageFramer
            path={form.logo.path}
            zoom={form.logoZoom}
            x={form.logoX}
            y={form.logoY}
            onChange={({ zoom, x, y }) => setForm((f) => ({ ...f, logoZoom: zoom, logoX: x, logoY: y }))}
          />
        )}
      </Field>

      <LocalizedTextField
        label="Должность / степень"
        value={form.position}
        onChange={(position) => setForm({ ...form, position })}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Дата начала">
          <Input
            type="date"
            value={form.dateFrom}
            onChange={(e) => setForm({ ...form, dateFrom: e.target.value })}
            required
          />
        </Field>
        <Field label="Дата окончания (пусто = по наст. время)">
          <Input type="date" value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} />
        </Field>
      </div>

      <LocalizedTextField
        label="Описание"
        value={form.description}
        onChange={(description) => setForm({ ...form, description })}
        multiline
      />

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

type FormMode = { type: "closed" } | { type: "create" } | { type: "edit"; entry: ExperienceAdmin };

export function AdminExperienceList() {
  const [entries, setEntries] = useState<ExperienceAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>({ type: "closed" });
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  function load() {
    fetchProfileAdmin()
      .then((profile) => setEntries(profile.experience))
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить список"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved() {
    setFormMode({ type: "closed" });
    load();
  }

  async function handleDelete(entry: ExperienceAdmin) {
    if (!confirm(`Удалить запись «${entry.company}»?`)) return;
    try {
      await deleteExperience(entry.id);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось удалить запись");
    }
  }

  async function handleMove(entry: ExperienceAdmin, direction: -1 | 1) {
    const index = entries.findIndex((e) => e.id === entry.id);
    const swapWith = entries[index + direction];
    if (!swapWith) return;

    setReorderingId(entry.id);
    setError(null);
    try {
      await Promise.all([
        updateExperience(entry.id, { order: swapWith.order }),
        updateExperience(swapWith.id, { order: entry.order }),
      ]);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось изменить порядок");
    } finally {
      setReorderingId(null);
    }
  }

  if (isLoading) return <p className="text-sm text-zinc-500">Загрузка...</p>;

  const nextOrder = entries.length > 0 ? Math.max(...entries.map((e) => e.order)) + 1 : 0;

  return (
    <div className="max-w-2xl space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {entries.map((entry, index) =>
          formMode.type === "edit" && formMode.entry.id === entry.id ? (
            <ExperienceForm
              key={entry.id}
              initial={entry}
              nextOrder={nextOrder}
              onCancel={() => setFormMode({ type: "closed" })}
              onSaved={handleSaved}
            />
          ) : (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-300 bg-zinc-100 text-sm font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
                {entry.logo ? (
                  <FramedImage
                    path={entry.logo.path}
                    zoom={entry.logoZoom}
                    x={entry.logoX}
                    y={entry.logoY}
                    alt={entry.company}
                  />
                ) : (
                  entry.company.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.company}</p>
                <p className="truncate text-xs text-zinc-500">
                  {formatRange(entry.dateFrom, entry.dateTo)} · {entry.position.ru}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleMove(entry, -1)}
                  disabled={index === 0 || reorderingId !== null}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleMove(entry, 1)}
                  disabled={index === entries.length - 1 || reorderingId !== null}
                >
                  ↓
                </Button>
                <Button type="button" variant="secondary" onClick={() => setFormMode({ type: "edit", entry })}>
                  Изменить
                </Button>
                <Button type="button" variant="danger" onClick={() => handleDelete(entry)}>
                  Удалить
                </Button>
              </div>
            </div>
          )
        )}
        {entries.length === 0 && formMode.type !== "create" && (
          <p className="text-sm text-zinc-500">Записей пока нет.</p>
        )}
      </div>

      {formMode.type === "create" ? (
        <ExperienceForm
          initial={null}
          nextOrder={nextOrder}
          onCancel={() => setFormMode({ type: "closed" })}
          onSaved={handleSaved}
        />
      ) : (
        <Button type="button" onClick={() => setFormMode({ type: "create" })}>
          Добавить запись
        </Button>
      )}
    </div>
  );
}
