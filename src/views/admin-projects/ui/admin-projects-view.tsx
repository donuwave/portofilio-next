import { BackLink } from "@/shared/ui/back-link";
import { AdminProjectsList } from "@/widgets/admin-projects-list/ui/admin-projects-list";

export function AdminProjectsView() {
  return (
    <div>
      <BackLink href="/admin">Админка</BackLink>
      <h1 className="mb-6 text-2xl font-semibold">Проекты</h1>
      <AdminProjectsList />
    </div>
  );
}
