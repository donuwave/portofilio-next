import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { LogoutButton } from "./logout-button";

export default async function AdminDashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Админка</h1>
        <LogoutButton />
      </div>
      <p>Вы вошли как {session?.email}.</p>
      <p style={{ color: "#666" }}>
        Разделы «Профиль», «Проекты» и «Файлы» появятся на следующем этапе.
      </p>
    </main>
  );
}
