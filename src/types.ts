/** Env bindings for River Agent doorbell Worker. */
export interface Env {
  /** Optional — falls back to in-memory store for temporary preview deploys */
  RIVER_KV?: KVNamespace;

  /** "true" | "false" — default true until secrets wired */
  DRY_RUN: string;

  /**
   * worker = Path Direct (Worker sells via Messaging API) — default go-live
   * automation = wake Cursor only (needs River MCP /mcp send_message)
   * both = Worker reply + wake (avoid unless debugging)
   */
  REPLY_MODE?: string;

  D360_API_BASE: string;
  RATE_LIMIT_MAX: string;
  RATE_LIMIT_WINDOW_SECONDS: string;
  DEDUPE_TTL_SECONDS: string;
  SESSION_TTL_SECONDS: string;
  BRAND_NAME: string;
  PUBLIC_SITE: string;
  SALES_CONTACT_EMAIL: string;
  SALES_CONTACT_PHONE: string;

  /** Secrets — optional at type level so dry-run scaffold typechecks */
  CURSOR_WEBHOOK_URL?: string;
  CURSOR_API_KEY?: string;
  D360_API_KEY?: string;
  D360_PHONE_NUMBER_ID?: string;
  SEND_AUTH_TOKEN?: string;
}

export type QualifyStage = "need" | "timeline" | "fit" | "recommend" | "done";

export interface SessionState {
  wa_id: string;
  profile_name?: string;
  stage: QualifyStage;
  need?: string;
  timeline?: string;
  fit?: string;
  package_hint?: string;
  last_inbound_at?: string;
  last_message_id?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface InboundMessage {
  id: string;
  from: string;
  wa_id: string;
  profile_name?: string;
  timestamp: string;
  type: string;
  text?: string;
  raw: unknown;
  phone_number_id?: string;
  display_phone_number?: string;
}

export interface CursorWakePayload {
  source: "river-agent-doorbell";
  event: "whatsapp_inbound";
  dry_run: boolean;
  received_at: string;
  brand: string;
  public_site: string;
  sales: {
    contact_email: string;
    contact_phone: string;
    mode: "sell_only";
  };
  message: {
    id: string;
    from: string;
    wa_id: string;
    profile_name?: string;
    timestamp: string;
    type: string;
    text?: string;
  };
  session: SessionState;
  reply: {
    /** Primary: River Worker MCP wraps Messaging API (official 360dialog MCP is Hub-admin only) */
    primary: "river_mcp";
    mcp_path: "/mcp";
    mcp_tools: string[];
    note: string;
    send_path: "/send";
    send_note: string;
  };
}

/** Minimal Meta/360dialog Cloud API webhook shape */
export interface D360WebhookBody {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        contacts?: Array<{
          profile?: { name?: string };
          wa_id?: string;
        }>;
        messages?: Array<{
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
          [key: string]: unknown;
        }>;
        statuses?: unknown[];
        errors?: unknown[];
      };
    }>;
  }>;
}
