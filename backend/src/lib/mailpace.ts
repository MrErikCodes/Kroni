import { getConfig } from '../config.js';
import { logger } from './logger.js';

// Mailpace's send endpoint. Confirmed against
// https://docs.mailpace.com/reference/send (POST, JSON in / out, auth via
// `MailPace-Server-Token` header). Domain in `from` must match the token.
const MAILPACE_SEND_URL = 'https://app.mailpace.com/api/v1/send';

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Optional reply-to address; falls through to Mailpace's `replyto` field. */
  replyTo?: string;
}

export interface SendMailResult {
  /** Mailpace's internal email id; useful for log correlation. */
  id: string;
}

export class MailpaceError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'MailpaceError';
  }
}

interface MailpaceSuccessBody {
  id: number | string;
  status: string;
}

/**
 * Send a transactional email via Mailpace. Uses native `fetch` (Node 22+).
 * On non-2xx, throws `MailpaceError` with the upstream status + body so
 * callers (the Clerk webhook handler) can decide whether to swallow + log
 * or surface to Sentry. Successes return Mailpace's message id.
 */
export async function sendMail(
  params: SendMailParams,
): Promise<SendMailResult> {
  const cfg = getConfig();
  const from = `${cfg.MAILPACE_FROM_NAME} <${cfg.MAILPACE_FROM_EMAIL}>`;

  // Mailpace's request shape: `htmlbody` + `textbody` (one or both),
  // optional `replyto`. Subject + to are straightforward.
  const body: Record<string, unknown> = {
    from,
    to: params.to,
    subject: params.subject,
    htmlbody: params.html,
    textbody: params.text,
  };
  if (params.replyTo) body.replyto = params.replyTo;

  let res: Response;
  try {
    res = await fetch(MAILPACE_SEND_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'MailPace-Server-Token': cfg.MAILPACE_API_TOKEN,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Network-level failure (DNS, TLS, refused connection). Wrap so the
    // caller still sees a typed error rather than a raw `TypeError`.
    logger.error({ err, to: params.to }, 'mailpace fetch failed');
    throw new MailpaceError(0, null, `mailpace network error: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    logger.error(
      { status: res.status, body: parsed, to: params.to, subject: params.subject },
      'mailpace send rejected',
    );
    throw new MailpaceError(
      res.status,
      parsed,
      `mailpace send failed (status ${res.status})`,
    );
  }

  const data = parsed as MailpaceSuccessBody | null;
  if (!data || data.id == null) {
    logger.warn({ body: parsed, to: params.to }, 'mailpace returned ok but no id');
    throw new MailpaceError(res.status, parsed, 'mailpace response missing id');
  }

  logger.info(
    { id: data.id, status: data.status, to: params.to, subject: params.subject },
    'mailpace send accepted',
  );
  return { id: String(data.id) };
}
