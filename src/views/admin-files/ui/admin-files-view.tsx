import { BackLink } from "@/shared/ui/back-link";
import { MediaLibrary } from "@/widgets/media-library/ui/media-library";

export function AdminFilesView() {
  return (
    <div>
      <BackLink href="/admin">Админка</BackLink>
      <h1 className="mb-6 text-2xl font-semibold">Файлы</h1>
      <MediaLibrary />
    </div>
  );
}
