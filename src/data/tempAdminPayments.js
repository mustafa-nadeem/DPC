/**
 * Demo / design-review data for Admin → Payments (not used unless REACT_APP_DEMO_ADMIN_PAYMENTS=true).
 * Edit this file to change the “temp” set.
 */
export const DEMO_ADMIN_PAYMENT_KPIS = {
  paidTodayGbp: 120,
  paidTodayMeta: '1 confirmed payment',
  pendingGbp: 190,
  pendingMeta: '2 links awaiting payment',
  overdueCount: 1,
  overdueMeta: 'Needs follow-up',
};

export const DEMO_ADMIN_PAYMENTS = [
  {
    id: 'REQ-1042',
    patient: 'Sarah Bennett',
    amount: 'GBP 95.00',
    status: 'Payment Pending',
    method: 'Stripe link',
    updated: 'Today 09:08',
  },
  {
    id: 'REQ-1041',
    patient: 'Michael Khan',
    amount: 'GBP 120.00',
    status: 'Confirmed',
    method: 'Stripe paid',
    updated: 'Today 08:02',
  },
  {
    id: 'REQ-1040',
    patient: 'Olivia Shaw',
    amount: 'GBP 95.00',
    status: 'Payment Pending',
    method: 'Stripe link',
    updated: 'Yesterday',
  },
  {
    id: 'REQ-1037',
    patient: 'Anya Patel',
    amount: 'GBP 200.00',
    status: 'Declined',
    method: 'N/A',
    updated: 'Yesterday',
  },
];

export const EMPTY_PAYMENT_KPIS = {
  paidTodayGbp: 0,
  paidTodayMeta: 'No confirmed payments today',
  pendingGbp: 0,
  pendingMeta: 'No pending links',
  overdueCount: 0,
  overdueMeta: 'None',
};
