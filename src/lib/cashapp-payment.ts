import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export interface CashAppOrderData {
  amount_cents: number;
  customer_phone?: string;
  order_id?: string;
}

export interface CashAppOrderResponse {
  short_code: string;
  order_id?: string;
  error?: string;
}

/**
 * Creates a Cash App order and redirects to payment page
 */
export async function createCashAppOrder(orderData: CashAppOrderData): Promise<{ shortCode: string; orderId?: string } | null> {
  try {
    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    const result: CashAppOrderResponse = await response.json();
    
    if (response.ok && result.short_code) {
      return { shortCode: result.short_code, orderId: result.order_id };
    } else {
      toast.error(result.error || 'Order creation failed');
      return null;
    }
  } catch (error) {
    console.error('Network error creating Cash App order:', error);
    toast.error('Network error. Please check your connection and try again.');
    return null;
  }
}

/**
 * Hook to handle Cash App payment flow
 */
export function useCashAppPayment() {
  const router = useRouter();

  const initiatePayment = async (amount: number, phone?: string, orderId?: string) => {
    const result = await createCashAppOrder({
      amount_cents: Math.round(amount * 100),
      customer_phone: phone,
      order_id: orderId
    });

    if (result) {
      router.push(`/pay/${encodeURIComponent(result.shortCode)}`);
      return true;
    } else {
      toast.error('Failed to create payment order. Please try again.');
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
