import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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
    console.log('🚀 Creating Cash App order with data:', orderData);
    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    console.log('📡 Response status:', response.status, response.statusText);
    const result: CashAppOrderResponse = await response.json();
    console.log('📦 Response data:', result);
    
    if (response.ok && result.short_code) {
      console.log('✅ Order created successfully with code:', result.short_code);
      return result.short_code;
    } else {
      console.error('❌ Cash App order creation failed:', {
        status: response.status,
        error: result.error,
        fullResponse: result
      });
      toast.error(`Order creation failed: ${result.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error creating Cash App order:', error);
    toast.error('Network error. Please check your connection and try again.');
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
