export interface NotificationPayload {
  recipientEmail: string;
  subject: string;
  body: string;
  eventType: 'shift_claimed' | 'shift_confirmed' | 'late_cancellation' | 'gap_alert';
}

export interface NotificationResult {
  delivered: boolean;
  provider: string;
  timestamp: string;
}

/**
 * Clean seam for club communications:
 * Figtree FC can swap email/SMS providers via env vars without touching app logic.
 */
export interface NotificationAdapter {
  readonly providerName: string;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}

/**
 * Default $0 Adapter: Logs messages cleanly for demo inspection & zero external cost.
 */
export class InAppLogAdapter implements NotificationAdapter {
  readonly providerName = 'in_app_log';

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();
    console.info(`[Notification:${this.providerName}] To: ${payload.recipientEmail} | ${payload.subject}`);
    return {
      delivered: true,
      provider: this.providerName,
      timestamp,
    };
  }
}

/**
 * Production Switch Adapter: Posts to club SMTP relay, Resend, or PowerAutomate webhook.
 */
export class WebhookSmtpAdapter implements NotificationAdapter {
  readonly providerName = 'webhook_smtp';

  constructor(
    private readonly webhookUrl: string,
    private readonly fromEmail: string
  ) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();
    if (!this.webhookUrl) {
      console.warn('[Notification:webhook_smtp] NOTIFICATION_WEBHOOK_URL missing, falling back to console log.');
      return { delivered: false, provider: this.providerName, timestamp };
    }

    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: this.fromEmail,
        to: payload.recipientEmail,
        subject: payload.subject,
        text: payload.body,
        eventType: payload.eventType,
      }),
    });

    return {
      delivered: res.ok,
      provider: this.providerName,
      timestamp,
    };
  }
}

export function getNotificationAdapter(): NotificationAdapter {
  const provider = process.env.NOTIFICATION_PROVIDER ?? 'in_app_log';
  if (provider === 'webhook_smtp') {
    return new WebhookSmtpAdapter(
      process.env.NOTIFICATION_WEBHOOK_URL ?? '',
      process.env.NOTIFICATION_FROM_EMAIL ?? 'volunteers@figtreefc.example.org.au'
    );
  }
  return new InAppLogAdapter();
}