import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

function buildTemplate(type, payload) {
  switch (type) {
    case 'request_acknowledgement':
      return {
        subject: `Request received (${payload.publicId})`,
        html: `<p>Hi ${payload.firstName}, your request ${payload.publicId} has been received.</p>`,
      };
    case 'request_more_information':
      return {
        subject: `More information needed (${payload.publicId})`,
        html: `<p>We need more information for request ${payload.publicId}.</p>`,
      };
    case 'request_declined':
      return {
        subject: `Update for request ${payload.publicId}`,
        html: `<p>Your request ${payload.publicId} has been declined or referred elsewhere.</p>`,
      };
    case 'payment_link':
      return {
        subject: `Payment link for ${payload.publicId}`,
        html: `<p>Please complete payment: <a href="${payload.paymentLinkUrl}">${payload.paymentLinkUrl}</a></p>`,
      };
    case 'payment_confirmed':
      return {
        subject: `Booking confirmed (${payload.publicId})`,
        html: `<p>Your booking is confirmed. Thank you for your payment.</p>`,
      };
    default:
      return { subject: 'Clinic update', html: '<p>Portal update</p>' };
  }
}

export async function sendTemplatedEmail({ to, type, payload }) {
  const template = buildTemplate(type, payload);

  if (!resend) {
    return {
      queued: true,
      provider: 'console',
      to,
      subject: template.subject,
    };
  }

  const result = await resend.emails.send({
    from: env.emailFrom,
    to,
    subject: template.subject,
    html: template.html,
  });

  return { queued: true, provider: 'resend', result };
}
