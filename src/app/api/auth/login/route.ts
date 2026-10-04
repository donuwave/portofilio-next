import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

// Only failed attempts count, so the owner is never locked out by their own successful logins.
const failedLogins = createRateLimiter({ max: 8, windowMs: 15 * 60 * 1000 });

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (failedLogins.isBlocked(ip)) throw new ApiError(429, "Too many failed attempts, try again later");

    const body = await parseJsonBody(request);
    const { email, password } = loginSchema.parse(body);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!adminEmail || !adminPasswordHash) {
      throw new ApiError(500, "Admin credentials are not configured");
    }

    const emailMatches = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
    const passwordMatches = await compare(password, adminPasswordHash);

    if (!emailMatches || !passwordMatches) {
      failedLogins.record(ip);
      throw new ApiError(401, "Invalid email or password");
    }

    failedLogins.reset(ip);
    const token = await createSessionToken({ email: adminEmail });

    const response = NextResponse.json({ email: adminEmail });
    response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
