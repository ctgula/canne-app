import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';

// In a real app, this would connect to your database (Supabase, etc.)
// For now, we'll just simulate order creation

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Generate a mock order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the full order object
    const order: Order = {
      id: orderId,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real app, you would save this to your database
    console.log('New order received:', order);
    
    // Here you could also:
    // 1. Send confirmation email/SMS
    // 2. Notify admin dashboard
    // 3. Integrate with payment processing
    // 4. Store in Supabase/database

    return NextResponse.json(
      { 
        success: true, 
        orderId,
        message: 'Order created successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for fetching orders (for admin dashboard)
export async function GET() {
  try {
    // In a real app, you would fetch from your database
    // For now, return mock data
    const mockOrders: Order[] = [
      {
        id: 'ORD-1234567890-abc123',
        items: [
          {
            product: {
              id: '1',
              name: 'Sunset Dreams',
              description: 'Beautiful sunset artwork',
              price: 25,
              artworkUrl: '/placeholder.jpg',
              giftSize: '3.5g',
              hasDelivery: false,
            },
            quantity: 1,
          }
        ],
        deliveryDetails: {
          name: 'John Doe',
          phone: '(202) 555-0123',
          address: '123 Main St',
          city: 'Washington',
          zipCode: '20001',
          timePreference: 'afternoon',
          specialInstructions: 'Ring doorbell twice',
        },
        total: 35,
        hasDelivery: false,
        status: 'pending',
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
      }
    ];

    return NextResponse.json(
      { 
        success: true, 
        orders: mockOrders 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders' 
      },
      { status: 500 }
    );
  }
} 