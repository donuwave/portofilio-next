"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createProject, deleteProject, fetchProjectsAdmin, updateProject } from "@/entities/project/api/project-api";
import type { ProjectAdmin } from "@/entities/project/model/admin-types";
import { ApiClientError } from "@/shared/api/http";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AdminProjectsList() {
  const [projects, setProjects] = useState<ProjectAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [titleRu, setTitleRu] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  function load() {
    fetchProjectsAdmin()
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить список"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!titleRu.trim() || !slug.trim()) {
      setError("Заполните название и slug");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await createProject({
        slug,
        title: { ru: titleRu, en: "" },
        description: { ru: "", en: "" },
        coverId: null,
        techStack: [],
        status: "draft",
        order: projects.length > 0 ? Math.max(...projects.map((p) => p.order)) + 1 : 0,
      });
      setTitleRu("");
      setSlug("");
      setSlugEdited(false);
      setIsCreating(false);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось создать проект");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(project: ProjectAdmin) {
    if (!confirm(`Удалить проект «${project.slug}» вместе со всеми кейсами?`)) return;
    try {
      await deleteProject(project.id);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось удалить проект");
    }
  }

  async function handleMove(project: ProjectAdmin, direction: -1 | 1) {
    const index = projects.findIndex((p) => p.id === project.id);
    const swapWith = projects[index + direction];
    if (!swapWith) return;

    setReorderingId(project.id);
    setError(null);
    try {
      await Promise.all([
        updateProject(project.id, { order: swapWith.order }),
        updateProject(swapWith.id, { order: project.order }),
      ]);
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось изменить порядок");
    } finally {
      setReorderingId(null);
    }
  }

  if (isLoading) return <p className="text-sm text-zinc-500">Загрузка...</p>;

  return (
    <div className="max-w-3xl space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="flex items-center gap-4 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-300 bg-zinc-100 text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
              {project.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.cover.path} alt="" className="h-full w-full object-cover" />
              ) : (
                "Нет фото"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{project.title.ru || project.slug}</p>
              <p className="truncate text-xs text-zinc-500">
                /{project.slug} ·{" "}
                <span className={project.status === "published" ? "text-green-600" : "text-zinc-400"}>
                  {project.status === "published" ? "опубликован" : "черновик"}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleMove(project, -1)}
                disabled={index === 0 || reorderingId !== null}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleMove(project, 1)}
                disabled={index === projects.length - 1 || reorderingId !== null}
              >
                ↓
              </Button>
              <Link href={`/admin/projects/${project.id}`}>
                <Button type="button" variant="secondary">
                  Изменить
                </Button>
              </Link>
              <Button type="button" variant="danger" onClick={() => handleDelete(project)}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
        {projects.length === 0 && !isCreating && <p className="text-sm text-zinc-500">Проектов пока нет.</p>}
      </div>

      {isCreating ? (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-md border border-zinc-300 p-4 dark:border-zinc-700"
        >
          <Field label="Название (RU)">
            <Input
              value={titleRu}
              onChange={(e) => {
                setTitleRu(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
              required
            />
          </Field>
          <Field label="Slug">
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              required
            />
          </Field>
          <p className="text-xs text-zinc-500">
            Остальные поля (описание, обложка, стек, статус) — на странице проекта после создания.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Создание..." : "Создать"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsCreating(false)} disabled={isSaving}>
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" onClick={() => setIsCreating(true)}>
          Добавить проект
        </Button>
      )}
    </div>
  );
}
