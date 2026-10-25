"use client";

import { useEffect, useState, type FormEvent } from "react";
import { updateProject } from "@/entities/project/api/project-api";
import { useTechIcons } from "@/entities/project/lib/use-tech-icons";
import type { ProjectAdmin, ProjectStatus, RepoLink } from "@/entities/project/model/admin-types";
import { ApiClientError } from "@/shared/api/http";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { LocalizedTextField } from "@/shared/ui/localized-text-field";
import { TechIcon } from "@/shared/ui/tech-icon";
import { MediaPickerField } from "@/widgets/media-picker-field/ui/media-picker-field";

function TechStackEditor({ techStack, onChange }: { techStack: string[]; onChange: (value: string[]) => void }) {
  const [draft, setDraft] = useState("");
  // The icon of what is being typed shows up as you type (after a short pause), before it is added.
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setTyped(draft), 250);
    return () => clearTimeout(timer);
  }, [draft]);
  const icons = useTechIcons([...techStack, typed]);
  const draftIcon = typed.trim() ? icons[typed.trim()] : null;

  function add() {
    const value = draft.trim();
    if (value && !techStack.includes(value)) onChange([...techStack, value]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700"
          >
            {icons[tech] && <TechIcon path={icons[tech]!.path} className="h-3.5 w-3.5" />}
            {tech}
            <button
              type="button"
              onClick={() => onChange(techStack.filter((t) => t !== tech))}
              aria-label={`Удалить ${tech}`}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          title={draftIcon ? draftIcon.title : draft.trim() ? "Для этого названия иконки нет, будет показан только текст" : undefined}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-zinc-300 text-zinc-500 dark:border-zinc-700"
        >
          {draftIcon ? <TechIcon path={draftIcon.path} className="h-4 w-4" /> : null}
        </span>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Новая технология"
          className="max-w-xs"
        />
        <Button type="button" variant="secondary" onClick={add}>
          Добавить
        </Button>
      </div>
    </div>
  );
}

/** Links to the project's source code; the public page shows them as a block of their own. */
function RepoLinksEditor({ repos, onChange }: { repos: RepoLink[]; onChange: (value: RepoLink[]) => void }) {
  function update(index: number, patch: Partial<RepoLink>) {
    onChange(repos.map((repo, i) => (i === index ? { ...repo, ...patch } : repo)));
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium tracking-wide text-zinc-500">Ссылки на код (GitHub)</span>
      {repos.map((repo, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2">
          <Input
            value={repo.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="Название, например Frontend"
            className="w-44"
            aria-label="Название ссылки"
          />
          <Input
            value={repo.url}
            onChange={(e) => update(index, { url: e.target.value })}
            placeholder="https://github.com/…"
            className="min-w-0 flex-1"
            aria-label="Адрес ссылки"
          />
          <Button type="button" variant="secondary" onClick={() => onChange(repos.filter((_, i) => i !== index))}>
            Убрать
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => onChange([...repos, { label: "", url: "" }])}>
        Добавить ссылку
      </Button>
    </div>
  );
}

export function AdminProjectForm({
  project,
  onSaved,
}: {
  project: ProjectAdmin;
  onSaved: (project: ProjectAdmin) => void;
}) {
  const [form, setForm] = useState(project);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSavedAt(null);
    try {
      const updated = await updateProject(project.id, {
        slug: form.slug,
        title: form.title,
        description: form.description,
        tag: form.tag,
        coverId: form.coverId,
        demoVideoId: form.demoVideoId,
        repos: form.repos.filter((repo) => repo.label.trim() || repo.url.trim()),
        techStack: form.techStack,
        status: form.status,
        order: form.order,
      });
      setForm((f) => ({ ...f, ...updated }));
      onSaved(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось сохранить проект");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <Field label="Slug">
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
      </Field>

      <Field label="Обложка">
        <MediaPickerField
          type="image"
          value={form.cover}
          onChange={(media) => setForm({ ...form, cover: media, coverId: media?.id ?? null })}
        />
      </Field>

      <Field label="Демо-видео (показывается в самом начале страницы проекта)">
        <MediaPickerField
          type="video"
          value={form.demoVideo}
          onChange={(media) => setForm({ ...form, demoVideo: media, demoVideoId: media?.id ?? null })}
        />
      </Field>

      <LocalizedTextField label="Название" value={form.title} onChange={(title) => setForm({ ...form, title })} />

      <LocalizedTextField
        label="Описание"
        value={form.description}
        onChange={(description) => setForm({ ...form, description })}
        multiline
        markdown
      />

      <LocalizedTextField
        label="Тег (для кого продукт)"
        value={form.tag ?? { ru: "", en: "" }}
        onChange={(tag) => setForm({ ...form, tag: tag.ru || tag.en ? tag : null })}
      />

      <Field label="Стек технологий">
        <TechStackEditor techStack={form.techStack} onChange={(techStack) => setForm({ ...form, techStack })} />
      </Field>

      <RepoLinksEditor repos={form.repos} onChange={(repos) => setForm({ ...form, repos })} />

      <Field label="Статус">
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="draft">Черновик</option>
          <option value="published">Опубликован</option>
        </select>
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {savedAt && <p className="text-sm text-green-600">Сохранено.</p>}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Сохранение..." : "Сохранить"}
      </Button>
    </form>
  );
}
