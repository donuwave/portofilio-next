import { NextResponse } from "next/server";
import { findTechIcon } from "@/shared/lib/tech-icons";

export const runtime = "nodejs";

/** GET /api/tech-icons?names=React,Next.js -> { "React": {...icon}, "Next.js": {...icon}, "Foo": null } (admin only, see proxy.ts). */
export async function GET(request: Request) {
  const names = (new URL(request.url).searchParams.get("names") ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 50);
  return NextResponse.json(Object.fromEntries(names.map((name) => [name, findTechIcon(name)])));
}
