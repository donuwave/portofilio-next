import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return jsonError(err.status, err.message, err.details);
  }
  if (err instanceof ZodError) {
    return jsonError(400, "Validation failed", err.flatten());
  }
  if (err instanceof SyntaxError) {
    return jsonError(400, "Invalid JSON body");
  }
  console.error(err);
  return jsonError(500, "Internal server error");
}

export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
}
