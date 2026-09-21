import { BackLink } from "@/shared/ui/back-link";
import { AdminExperienceList } from "@/widgets/admin-experience-list/ui/admin-experience-list";

export function AdminExperienceView() {
  return (
    <div>
      <BackLink href="/admin">Админка</BackLink>
      <h1 className="mb-6 text-2xl font-semibold">Опыт</h1>
      <AdminExperienceList />
    </div>
  );
}
