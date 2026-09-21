"use client";

import { useEffect, useState } from "react";
import { fetchProjectAdmin } from "@/entities/project/api/project-api";
import type { ProjectAdmin } from "@/entities/project/model/admin-types";
import { BackLink } from "@/shared/ui/back-link";
import { AdminCasesList } from "@/widgets/admin-cases-list/ui/admin-cases-list";
import { AdminProjectForm } from "@/widgets/admin-project-form/ui/admin-project-form";

export function AdminProjectEditView({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectAdmin(projectId)
      .then(setProject)
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить проект"))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  return (
    <div>
      <BackLink href="/admin/projects">Все проекты</BackLink>

      {isLoading && <p className="text-sm text-zinc-500">Загрузка...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {project && (
        <>
          <h1 className="mb-6 text-2xl font-semibold">{project.title.ru || project.slug}</h1>
          <AdminProjectForm project={project} onSaved={setProject} />

          <div className="mt-12 max-w-2xl border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold">Кейсы</h2>
            <AdminCasesList projectId={project.id} />
          </div>
        </>
      )}
    </div>
  );
}
