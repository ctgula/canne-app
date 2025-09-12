import { useRouter } from 'next/navigation';

export interface CashAppOrderData {
  amount_cents: number;
  customer_phone?: string;
}

export interface CashAppOrderResponse {
  short_code: string;
  error?: string;
}

/**
 * Creates a Cash App order and redirects to payment page
 */
export async function createCashAppOrder(orderData: CashAppOrderData): Promise<string | null> {
  try {
    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    const result: CashAppOrderResponse = await response.json();
    
    if (response.ok && result.short_code) {
      return result.short_code;
    } else {
      console.error('Cash App order creation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Network error creating Cash App order:', error);
    return null;
  }
}

/**
 * Hook to handle Cash App payment flow
 */
export function useCashAppPayment() {
  const router = useRouter();

  const initiatePayment = async (amount: number, phone?: string) => {
    const shortCode = await createCashAppOrder({
      amount_cents: Math.round(amount * 100), // Convert dollars to cents
      customer_phone: phone
    });

    if (shortCode) {
      router.push(`/pay/${encodeURIComponent(shortCode)}`);
      return true;
    } else {
      alert('Failed to create payment order. Please try again.');
      return false;
    }
  };

  return { initiatePayment };
}

/**
 * Utility to convert cart total to Cash App payment
 */
export function convertCartToCashAppPayment(cartTotal: number, customerPhone?: string) {
  return {
    amount_cents: Math.round(cartTotal * 100),
    customer_phone: customerPhone
  };
}
