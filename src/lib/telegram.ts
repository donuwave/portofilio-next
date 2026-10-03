/**
 * Sends a message to the owner's Telegram chat. Optional: without
 * TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID it does nothing, and a failed send is
 * logged rather than thrown — the request is already saved by then, so a
 * Telegram outage must not turn into an error for whoever submitted it.
 */
export async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error("Telegram notify failed:", response.status, await response.text());
  } catch (err) {
    console.error("Telegram notify failed:", err);
  }
}
