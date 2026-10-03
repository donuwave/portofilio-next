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
          <Link href="/admin/experience" className="underline">
            Опыт
          </Link>
        </li>
        <li>
          <Link href="/admin/projects" className="underline">
            Проекты
          </Link>
        </li>
        <li>
          <Link href="/admin/files" className="underline">
            Файлы
          </Link>
        </li>
        <li>
          <Link href="/admin/requests" className="underline">
            Заявки
          </Link>
        </li>
      </ul>
    </div>
  );
}
