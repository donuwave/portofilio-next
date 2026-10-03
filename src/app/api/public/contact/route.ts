import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { notifyTelegram } from "@/lib/telegram";
import { contactRequestSchema } from "@/lib/validation";

// This is the only endpoint anyone can write to, so it's rate limited per IP.
// In memory is enough for a single-instance personal site; a restart only
// resets the counters.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function rateLimit(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) throw new ApiError(429, "Слишком много заявок, попробуйте позже");
  hits.push(now);
  recent.set(ip, hits);
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    rateLimit(ip);

    const { website, ...data } = contactRequestSchema.parse(await parseJsonBody(request));
    // A filled honeypot is a bot. Answer as if it worked so it doesn't retry.
    if (website) return NextResponse.json({ ok: true }, { status: 201 });

    await prisma.contactRequest.create({ data });
    await notifyTelegram(`Новая заявка с сайта\n\nИмя: ${data.name}\nКонтакт: ${data.contact}\n\n${data.message}`);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
