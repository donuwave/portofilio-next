import { AdminProjectsList } from "@/widgets/admin-projects-list/ui/admin-projects-list";

export function AdminProjectsView() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Проекты</h1>
      <AdminProjectsList />
    </div>
  );
}
