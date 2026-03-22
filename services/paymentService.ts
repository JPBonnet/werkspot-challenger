// Stripe payment integration service
// Uses expo-stripe-sdk for card processing

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

interface Receipt {
  id: string;
  jobId: string;
  amount: number;
  tax: number;
  total: number;
  paidAt: string;
  serviceName: string;
  professionalName: string;
}

export async function createPaymentIntent(amount: number): Promise<PaymentIntent> {
  // In production: const { data } = await apiClient.post('/api/payments/intent', { amount, currency: 'eur' });
  return {
    id: `pi_${Date.now()}`,
    amount,
    currency: 'eur',
    status: 'pending',
  };
}

export async function processPayment(paymentIntentId: string, _cardDetails: { number: string; expiry: string; cvc: string }): Promise<PaymentResult> {
  // In production: use Stripe SDK confirmPayment with clientSecret
  // const { paymentIntent } = await confirmPayment(clientSecret, { paymentMethodType: 'Card' });
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
  return {
    success: true,
    paymentId: paymentIntentId,
  };
}

export function generateReceipt(jobId: string, amount: number, tax: number, serviceName: string, professionalName: string): Receipt {
  return {
    id: `rcpt_${Date.now()}`,
    jobId,
    amount,
    tax,
    total: amount + tax,
    paidAt: new Date().toISOString(),
    serviceName,
    professionalName,
  };
}

export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
