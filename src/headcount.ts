import type { SessionState } from "./types";

export type HeadcountBand = "1" | "2-10" | "11+";
export type ProductLine = "found" | "selling" | "river";

export function normalizeChat(text: string | undefined): string {
  if (!text) return "";
  return text
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[*_~`]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function parseHeadcount(text: string | undefined): HeadcountBand {
  const t = normalizeChat(text);
  if (!t) return "2-10";
  if (
    /\b(just\s+me|only\s+me|myself|solo|just\s+you|one\s+person|on\s+my\s+own)\b/.test(
      t,
    )
  ) {
    return "1";
  }
  if (/\b(big\s+team|large\s+team|corporate|50\+|hundred)\b/.test(t)) {
    return "11+";
  }
  if (/\b(small\s+team|handful|few\s+of\s+us|couple)\b/.test(t)) {
    return "2-10";
  }
  if (/\b11\s*\+|11\s*plus|eleven\s*plus\b/.test(t)) return "11+";
  const nums = t.match(/\d+/g)?.map((n) => Number(n)) ?? [];
  if (nums.length >= 2) {
    const hi = Math.max(...nums);
    if (hi >= 11) return "11+";
    if (hi <= 1) return "1";
    return "2-10";
  }
  if (nums.length === 1) {
    const n = nums[0];
    if (n <= 1) return "1";
    if (n >= 11) return "11+";
    return "2-10";
  }
  return "2-10";
}

export function pickProduct(session: SessionState): ProductLine {
  const blob = `${session.need || ""}`.toLowerCase();
  if (
    /shop|store|ecommerce|e-?commerce|woocommerce|shopify|payfast|yoco|catalogue|catalog/.test(
      blob,
    )
  ) {
    return "selling";
  }
  if (
    /linkedin|invisible|get\s*found|outreach|website|leads?\s*online|need\s*leads/.test(
      blob,
    )
  ) {
    return "found";
  }
  return "river";
}
