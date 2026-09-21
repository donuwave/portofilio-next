import { BackLink } from "@/shared/ui/back-link";
import { AdminProfileForm } from "@/widgets/admin-profile-form/ui/admin-profile-form";

export function AdminProfileView() {
  return (
    <div>
      <BackLink href="/admin">Админка</BackLink>
      <h1 className="mb-6 text-2xl font-semibold">Профиль</h1>
      <AdminProfileForm />
    </div>
  );
}
