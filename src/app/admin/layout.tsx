import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { LogoutButton } from "./logout-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  // proxy.ts already guards /admin/:path*; this redirect is defense in depth.
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="font-medium hover:underline">
            Админка
          </Link>
          <Link href="/admin/profile" className="hover:underline">
            Профиль
          </Link>
          <Link href="/admin/experience" className="hover:underline">
            Опыт
          </Link>
          <Link href="/admin/projects" className="hover:underline">
            Проекты
          </Link>
          <Link href="/admin/files" className="hover:underline">
            Файлы
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{session.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
