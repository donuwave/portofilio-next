"use client";

import { useState, type FormEvent } from "react";
import { submitContactRequest } from "@/entities/contact-request/api/contact-request-api";
import { ApiClientError } from "@/shared/api/http";
import { useDictionary, useLocalizedPath } from "@/shared/i18n/locale-provider";

const fieldClass =
  "w-full border-b border-[#3a372f] bg-transparent pb-3 pt-1 text-[#ece5d6] placeholder:text-[#5c584f] focus:border-[#e2451f] focus:outline-none";

export function ContactForm() {
  const dict = useDictionary().contact.form;
  const localizedPath = useLocalizedPath();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError(null);
    try {
      await submitContactRequest({
        name: String(data.get("name") ?? ""),
        contact: String(data.get("contact") ?? ""),
        message: String(data.get("message") ?? ""),
        consent: true,
        website: String(data.get("website") ?? ""),
      });
      form.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof ApiClientError && err.status === 429 ? dict.rateLimited : dict.error);
    }
  }

  if (status === "sent") {
    return (
      <div className="border-t border-[#3a372f] pt-6">
        <p className="font-display text-2xl text-[#ece5d6]">{dict.sentTitle}</p>
        <p className="mt-3 text-[#b8b1a3]">{dict.sentText}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-[#8a8378] underline underline-offset-4 hover:text-[#ece5d6]"
        >
          {dict.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <label className="block">
        <span className="text-sm text-[#8a8378]">{dict.name}</span>
        <input name="name" required maxLength={100} autoComplete="name" className={`${fieldClass} mt-2`} />
      </label>
      <label className="block">
        <span className="text-sm text-[#8a8378]">{dict.contact}</span>
        <input name="contact" required minLength={3} maxLength={200} className={`${fieldClass} mt-2`} />
      </label>
      <label className="block">
        <span className="text-sm text-[#8a8378]">{dict.message}</span>
        <textarea name="message" required minLength={5} maxLength={4000} rows={4} className={`${fieldClass} mt-2 resize-none`} />
      </label>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-[#8a8378]">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 h-4 w-4 shrink-0 accent-[#e2451f]"
        />
        <span>
          {dict.consentPrefix}{" "}
          <a href={localizedPath("/consent")} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-[#ece5d6]">
            {dict.consentLink}
          </a>{" "}
          {dict.consentMiddle}{" "}
          <a href={localizedPath("/privacy")} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-[#ece5d6]">
            {dict.privacyLink}
          </a>
        </span>
      </label>
      {/* Honeypot: off-screen for people, still filled in by naive bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0" />

      {error && <p className="text-sm text-[#e2451f]">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-[#ece5d6] px-7 py-3 font-medium text-[#141312] transition-colors hover:bg-[#e2451f] hover:text-[#ece5d6] disabled:opacity-60"
      >
        {status === "sending" ? dict.sending : dict.submit}
      </button>
    </form>
  );
}
