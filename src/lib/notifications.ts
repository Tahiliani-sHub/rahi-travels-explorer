import { Resend } from 'resend';

export type NotificationType = 'booking_confirmed' | 'payment_successful' | 'cancellation_confirmed' | 'error' | 'info';

export type NotificationPayload = {
  type: NotificationType;
  email: string;
  name: string;
  subject: string;
  message: string;
  data?: Record<string, any>;
};

export async function sendNotification(
  resend: InstanceType<typeof Resend>,
  senderEmail: string,
  payload: NotificationPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const html = generateNotificationHtml(payload);

    const response = await resend.emails.send({
      from: senderEmail,
      to: payload.email,
      subject: payload.subject,
      html
    });

    return {
      success: true,
      id: response.data?.id
    };
  } catch (error) {
    console.error('Notification send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification'
    };
  }
}

function generateNotificationHtml(payload: NotificationPayload): string {
  const baseStyle = `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
    .content { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
    .footer { color: #777; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
    strong { color: #007bff; }
  `;

  let headerTitle = 'Notification';
  let headerIcon = '📧';

  switch (payload.type) {
    case 'booking_confirmed':
      headerTitle = 'Booking Confirmed';
      headerIcon = '✅';
      break;
    case 'payment_successful':
      headerTitle = 'Payment Successful';
      headerIcon = '💳';
      break;
    case 'cancellation_confirmed':
      headerTitle = 'Cancellation Confirmed';
      headerIcon = '❌';
      break;
    case 'error':
      headerTitle = 'Alert';
      headerIcon = '⚠️';
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${baseStyle}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${headerIcon} ${headerTitle}</h1>
            <p>Hello ${payload.name},</p>
          </div>

          <div class="content">
            <p>${payload.message}</p>
            ${payload.data ? `
              <div style="background: white; padding: 10px; border-left: 3px solid #007bff; margin: 10px 0;">
                ${Object.entries(payload.data)
                  .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                  .join('')}
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>© 2026 Rahi Travels - Premium Tunisia Travel Booking Platform</p>
            <p>This is an automated email. Please do not reply directly.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
