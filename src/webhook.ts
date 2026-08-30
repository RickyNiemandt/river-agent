import type { D360WebhookBody, InboundMessage } from "./types";

/**
 * Extract inbound customer messages only.
 * Ignores statuses, errors, and empty change sets (delivery receipts, etc.).
 */
export function extractInboundMessages(body: D360WebhookBody): InboundMessage[] {
  const out: InboundMessage[] = [];
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;

      // Explicitly ignore status / error only payloads
      const hasMessages = Array.isArray(value.messages) && value.messages.length > 0;
      if (!hasMessages) continue;

      const contactByWa = new Map(
        (value.contacts ?? []).map((c) => [c.wa_id ?? "", c]),
      );

      for (const msg of value.messages ?? []) {
        if (!msg?.id || !msg.from) continue;
        const wa_id = msg.from;
        const contact = contactByWa.get(wa_id);
        const type = msg.type ?? "unknown";
        const text =
          type === "text" && msg.text?.body
            ? String(msg.text.body)
            : undefined;

        out.push({
          id: msg.id,
          from: msg.from,
          wa_id,
          profile_name: contact?.profile?.name,
          timestamp: msg.timestamp ?? String(Math.floor(Date.now() / 1000)),
          type,
          text,
          raw: msg,
          phone_number_id: value.metadata?.phone_number_id,
          display_phone_number: value.metadata?.display_phone_number,
        });
      }
    }
  }
  return out;
}
