import Stripe from 'stripe';
import { env } from '../config/env.js';

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

export async function createStripePaymentLink({
  publicId,
  amountMinor,
  currency,
  patientEmail,
  successUrl,
  cancelUrl,
}) {
  if (!stripe) {
    return {
      url: `https://example-pay.local/checkout/${publicId}`,
      providerPaymentId: `mock-${publicId}`,
      checkoutSessionId: `mock-session-${publicId}`,
      mock: true,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: patientEmail,
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: `Clinic Booking ${publicId}` },
          unit_amount: amountMinor,
        },
        quantity: 1,
      },
    ],
    metadata: { requestPublicId: publicId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return {
    url: session.url,
    providerPaymentId: session.payment_intent ? String(session.payment_intent) : null,
    checkoutSessionId: session.id,
    mock: false,
  };
}

export function parseStripeWebhook(rawBody, signature) {
  if (!stripe || !env.stripeWebhookSecret) {
    if (Buffer.isBuffer(rawBody)) {
      return JSON.parse(rawBody.toString('utf8'));
    }
    return rawBody;
  }

  return stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
}
