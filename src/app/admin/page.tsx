import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Админка</h1>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        <li>
          <Link href="/admin/profile" className="underline">
            Профиль
          </Link>
        </li>
        <li>
          <Link href="/admin/files" className="underline">
            Файлы
          </Link>
        </li>
      </ul>
      <p className="mt-4 text-sm text-zinc-500">Раздел «Проекты» появится на следующем этапе.</p>
    </div>
  );
}
