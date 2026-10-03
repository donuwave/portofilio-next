import { BackLink } from "@/shared/ui/back-link";
import { AdminRequestsList } from "@/widgets/admin-requests-list/ui/admin-requests-list";

export function AdminRequestsView() {
  return (
    <div>
      <BackLink href="/admin">Админка</BackLink>
      <h1 className="mb-6 text-2xl font-semibold">Заявки</h1>
      <AdminRequestsList />
    </div>
  );
}
