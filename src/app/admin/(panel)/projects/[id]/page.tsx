import { AdminProjectEditView } from "@/views/admin-project-edit/ui/admin-project-edit-view";

export default async function AdminProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProjectEditView projectId={id} />;
}
