export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T = void>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);

  if (!res.ok) {
    let message = res.statusText;
    let details: unknown;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
      details = body?.details;
      // Validation errors: say which field and why, not just "Validation failed".
      const fieldErrors = (details as { fieldErrors?: Record<string, string[]> } | undefined)?.fieldErrors;
      const first = fieldErrors && Object.entries(fieldErrors).find(([, errors]) => errors?.length);
      if (first) message = `${first[0]}: ${first[1][0]}`;
    } catch {
      // response body wasn't JSON; fall back to statusText
    }
    throw new ApiClientError(res.status, message, details);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
