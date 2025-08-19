import { NextRequest, NextResponse } from 'next/server';
// Ensure Node.js runtime (Edge may restrict outbound fetch or certain APIs)
export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables with detailed error messages
if (!supabaseUrl) {
  const errorMsg = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your Vercel environment variables.';
  console.error('❌ ENV ERROR:', errorMsg);
  throw new Error(errorMsg);
}

if (!supabaseServiceKey) {
  const errorMsg = 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please check your Vercel environment variables.';
  console.error('❌ ENV ERROR:', errorMsg);
  throw new Error(errorMsg);
}

console.log('✅ Environment variables validated successfully');

// Environment variables validated - ready for production

// Create admin client that bypasses RLS
let supabaseAdmin;
try {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Supabase admin client created successfully');
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
  throw new Error(`Failed to create Supabase client: ${error}`);
}

interface DeliveryDetails {
  name: string;
  email?: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  zipCode: string;
  timePreference: string;
  specialInstructions?: string;
  ageVerification?: boolean;
  termsAccepted?: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  artworkUrl?: string;
  giftSize?: string;
  hasDelivery?: boolean;
}

interface OrderItem {
  // Support both flat structure (legacy) and nested product structure (current)
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  artworkUrl?: string;
  giftSize?: string;
  hasDelivery?: boolean;
  quantity: number;
  // Nested product structure (current cart format)
  product?: Product;
  // Strain information
  strain?: {
    name: string;
    type: string;
    thcLow: number;
    thcHigh: number;
  };
}

interface OrderRequest {
  items: OrderItem[];
  deliveryDetails: DeliveryDetails;
  total: number;
  hasDelivery: boolean;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderRequest = await request.json();

    // Validate cart is not empty
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart cannot be empty' },
        { status: 400 }
      );
    }

    // Validate required delivery details
    if (!orderData.deliveryDetails || !orderData.deliveryDetails.name || !orderData.deliveryDetails.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Front-end DC ZIP validation (backup - main validation is in database trigger)
    const dcZipRegex = /^20(0\d\d|1\d\d)$/;
    if (!dcZipRegex.test(orderData.deliveryDetails.zipCode)) {
      return NextResponse.json(
        { success: false, error: 'Only Washington DC ZIP codes (20000-20199) are allowed' },
        { status: 400 }
      );
    }

    // Calculate totals with proper error handling and logging
    console.log('Order data items:', JSON.stringify(orderData.items, null, 2));
    console.log('Frontend submitted total:', orderData.total);
    
    const calculatedSubtotal = orderData.items.reduce((sum, item) => {
      // Handle both flat item structure and nested product structure
      const itemPrice = item.product ? 
        (typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price) || 0) :
        (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
      
      const itemQuantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
      const itemName = item.product ? item.product.name : item.name;
      const itemTotal = itemPrice * itemQuantity;
      
      console.log(`Item: ${itemName}, Price: ${itemPrice}, Quantity: ${itemQuantity}, Total: ${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    
    const calculatedDeliveryFee = orderData.hasDelivery ? 0 : 10;
    const calculatedTotal = calculatedSubtotal + calculatedDeliveryFee;
    
    console.log(`Backend calculated - Subtotal: ${calculatedSubtotal}, Delivery Fee: ${calculatedDeliveryFee}, Total: ${calculatedTotal}`);
    console.log(`Frontend submitted - Total: ${orderData.total}, HasDelivery: ${orderData.hasDelivery}`);
    
    // Use frontend total but validate it matches our calculation (with small tolerance for floating point)
    const totalDifference = Math.abs(calculatedTotal - orderData.total);
    if (totalDifference > 0.01) {
      console.error(`❌ Price mismatch! Backend calculated: ${calculatedTotal}, Frontend sent: ${orderData.total}, Difference: ${totalDifference}`);
      return NextResponse.json(
        { success: false, error: `Price calculation mismatch. Please refresh the page and try again. (Backend: $${calculatedTotal}, Frontend: $${orderData.total})` },
        { status: 400 }
      );
    }
    
    // Use frontend values to ensure consistency
    const subtotal = calculatedSubtotal;
    const deliveryFee = calculatedDeliveryFee;
    const total = orderData.total; // Use frontend total to ensure consistency
    
    // Backend guard: ensure total = subtotal + delivery_fee before insert
    const expectedTotal = subtotal + deliveryFee;
    const totalMismatch = Math.abs(total - expectedTotal);
    if (totalMismatch > 0.01) {
      console.error(`❌ Total calculation mismatch! Expected: ${expectedTotal}, Got: ${total}, Difference: ${totalMismatch}`);
      return NextResponse.json(
        { success: false, error: `Invalid total calculation. Expected $${expectedTotal.toFixed(2)}, got $${total.toFixed(2)}. Please refresh and try again.` },
        { status: 400 }
      );
    }
    
    console.log(`✅ Using consistent totals - Subtotal: ${subtotal}, Delivery Fee: ${deliveryFee}, Total: ${total}`);
    
    // Validate calculated totals
    if (isNaN(subtotal) || subtotal <= 0) {
      console.error('Invalid subtotal calculated:', subtotal);
      return NextResponse.json(
        { success: false, error: `Cannot process order with $0.00 subtotal. Please add items to your cart and try again.` },
        { status: 400 }
      );
    }

    // Prevent processing orders with zero or negative totals
    if (total <= 0) {
      console.error('Invalid total amount:', total);
      return NextResponse.json(
        { success: false, error: `Cannot process order with $${total.toFixed(2)} total. Please refresh the page and try again.` },
        { status: 400 }
      );
    }

    // Create customer record first (using verified schema fields)
    // Use unique email with timestamp to avoid duplicates during testing
    const customerEmail = orderData.deliveryDetails.email ? 
      `${orderData.deliveryDetails.email.split('@')[0]}_${Date.now()}@${orderData.deliveryDetails.email.split('@')[1]}` :
      `guest_${Date.now()}@canne.local`;
    
    const customerPayload = {
      first_name: orderData.deliveryDetails.name.split(' ')[0] || orderData.deliveryDetails.name,
      last_name: orderData.deliveryDetails.name.split(' ').slice(1).join(' ') || 'Guest',
      email: customerEmail,
      phone: orderData.deliveryDetails.phone
    };
    
    console.log('Customer payload:', JSON.stringify(customerPayload, null, 2));

    const { data: customerRecord, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert(customerPayload)
      .select('id')
      .single();

    if (customerError) {
      console.log('Customer creation error:', customerError);
      return NextResponse.json(
        { success: false, error: `Failed to create customer: ${customerError.message}` },
        { status: 500 }
      );
    }

    // Generate order number
    const orderNumber = `CN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create order with minimal essential fields that we know work
    const orderPayload = {
      customer_id: customerRecord.id,
      order_number: orderNumber,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total: total,
      status: 'pending',
      delivery_address_line1: orderData.deliveryDetails.address,
      delivery_city: orderData.deliveryDetails.city,
      delivery_state: 'DC',
      delivery_zip: orderData.deliveryDetails.zipCode
    };
    
    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select('id, created_at, status, total, subtotal, delivery_fee, order_number, delivery_address_line1, delivery_city, delivery_zip')
      .single();

    if (orderError) {
      // Handle DC ZIP validation error from database trigger
      if (orderError.message?.includes('Out-of-zone address')) {
        return NextResponse.json(
          { success: false, error: 'Only Washington DC ZIP codes (20000-20199) are allowed' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }

    // Debug: Log the items structure to understand the data format
    console.log('🔍 Order items structure:', JSON.stringify(orderData.items, null, 2));
    
    // Create order items with all required fields
    const orderItems = orderData.items.map((item, index) => {
      // Enhanced debugging for product ID extraction
      console.log(`🔍 Raw item ${index}:`, JSON.stringify(item, null, 2));
      
      const productId = item.product?.id || item.id;
      const unitPrice = item.product?.price || item.price;
      
      console.log(`🔍 Extracted data for item ${index}:`, {
        productId,
        unitPrice,
        quantity: item.quantity,
        itemStructure: Object.keys(item),
        hasProduct: !!item.product,
        productKeys: item.product ? Object.keys(item.product) : 'no product object'
      });
      
      if (!productId) {
        console.error(`❌ Missing product_id for item ${index}:`, JSON.stringify(item, null, 2));
        console.error(`❌ item.product:`, item.product);
        console.error(`❌ item.id:`, item.id);
        throw new Error(`Missing product_id for item ${index}. Item structure: ${JSON.stringify(item)}`);
      }
      
      return {
        order_id: orderRecord.id,
        product_id: productId,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
        strain: item.strain?.name || 'Moroccan Peach',
        thc_low: item.strain?.thcLow || 18,
        thc_high: item.strain?.thcHigh || 22
      };
    });
    
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Cleanup: Delete the order if items creation failed
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', orderRecord.id);

      return NextResponse.json(
        { success: false, error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      );
    }

    // Send Apple-level Discord notification with real database data
    try {
      const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
      console.log('🔔 Discord webhook environment check:', {
        webhookExists: !!discordWebhook,
        webhookLength: discordWebhook?.length || 0,
        webhookStart: discordWebhook?.substring(0, 50) || 'undefined',
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      });
      
      if (!discordWebhook) {
        console.error('❌ DISCORD_WEBHOOK environment variable is not set!');
        console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('DISCORD')));
        // Don't fail the order, just log the issue
      } else if (!discordWebhook.startsWith('https://discord.com/api/webhooks/')) {
        console.error('❌ DISCORD_WEBHOOK appears to be malformed:', discordWebhook.substring(0, 50));
      } else {
        console.log('✅ Discord webhook found, proceeding with notification...');
        // Fetch complete customer information from database
        const { data: customerData } = await supabaseAdmin
          .from('customers')
          .select('first_name, last_name, phone, email')
          .eq('id', customerRecord.id)
          .single();

        // Fetch complete order items with product details using proper JOIN
        const { data: orderItemsData, error: orderItemsError } = await supabaseAdmin
          .from('order_items')
          .select(`
            quantity,
            unit_price,
            total_price,
            product_id,
            products!inner (
              name,
              tier,
              description
            )
          `)
          .eq('order_id', orderRecord.id);

        console.log('Order items query result:', { orderItemsData, orderItemsError, orderId: orderRecord.id });

        const customerName = `${customerData?.first_name || ''} ${customerData?.last_name || ''}`.trim();
        const customerPhone = customerData?.phone || 'Not provided';
        
        // Import gifting map for consistent messaging
        const getTierInfo = (tier: string) => {
          const tierMap = {
            starter: {
              displayName: 'Starter',
              oneLiner: 'Single digital print + complimentary top-shelf gift',
              includedItems: ['Digital art print', '3.5g complimentary flower', 'Curated packaging']
            },
            classic: {
              displayName: 'Classic',
              oneLiner: 'Double art series with signature + two curated gifts',
              includedItems: ['Double art series', '7g complimentary flower', 'Signature packaging', 'Two curated gifts']
            },
            black: {
              displayName: 'Black',
              oneLiner: 'Limited collection prints + four premium gifts',
              includedItems: ['Limited collection prints', '14g premium flower', 'Four premium gifts', 'Exclusive packaging']
            },
            ultra: {
              displayName: 'Ultra',
              oneLiner: 'Exclusive gallery pieces + eight premium selections',
              includedItems: ['Exclusive gallery pieces', '28g premium flower collection', 'Eight premium selections', 'Gallery-grade packaging']
            }
          };
          return tierMap[tier.toLowerCase()] || tierMap.classic;
        };

        // Create detailed order items description with strain information
        const orderDetailsText = orderItemsData?.length > 0 ? orderItemsData.map(item => {
          const product = item.products;
          const tierInfo = getTierInfo(product?.tier || 'classic');
          const tierName = `${tierInfo.displayName} Collection`;
          
          // Find corresponding strain info from original order data
          const originalItem = orderData.items.find(orderItem => 
            orderItem.product?.id === item.product_id
          );
          const strainInfo = originalItem?.strain;
          
          const unitPrice = parseFloat(item.unit_price).toFixed(2);
          const totalPrice = parseFloat(item.total_price).toFixed(2);
          
          let itemDescription = `• **${item.quantity}x ${tierName}** - $${unitPrice} each = $${totalPrice} total`;
          
          if (strainInfo) {
            itemDescription += `\n   **Strain:** ${strainInfo.name} • ${strainInfo.type} • ${strainInfo.thcLow}–${strainInfo.thcHigh}% THC`;
          }
          
          itemDescription += `\n   **Includes:** ${tierInfo.oneLiner}`;
          
          return itemDescription;
        }).join('\n\n') : `No items found (Error: ${orderItemsError?.message || 'Unknown error'})`;

        const embed = {
          title: "🌿 New Cannè Order Received!",
          description: `Order **${orderRecord.order_number}** has been placed and is ready for processing.`,
          fields: [
            { 
              name: "👤 Customer Information", 
              value: `**Name:** ${customerName || 'Guest Customer'}\n**Phone:** ${customerPhone}\n**Email:** ${customerData?.email || 'Not provided'}`,
              inline: false 
            },
            { 
              name: "📍 Delivery Details", 
              value: `**Address:** ${orderRecord.delivery_address_line1}\n${orderRecord.delivery_city}, DC ${orderRecord.delivery_zip}\n**Preferred Time:** ${orderData.deliveryDetails.timePreference || 'Not specified'}`,
              inline: false 
            },
            { 
              name: "📦 Order Details", 
              value: orderDetailsText,
              inline: false 
            },
            { name: "Subtotal", value: `$${orderRecord.subtotal.toFixed(2)}`, inline: true },
            { name: "Delivery", value: orderRecord.delivery_fee > 0 ? `$${orderRecord.delivery_fee.toFixed(2)}` : 'FREE', inline: true },
            { name: "**Total**", value: `**$${orderRecord.total.toFixed(2)}**`, inline: true }
          ],
          timestamp: orderRecord.created_at,
          color: 0x8B5CF6,
          footer: { 
            text: "Cannè Art Collective • I-71 Compliant • Washington, DC",
            icon_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f33f.png"
          },
          thumbnail: {
            url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f4e6.png"
          }
        };
        
        // Add special instructions if provided
        if (orderData.deliveryDetails.specialInstructions) {
          embed.fields.push({
            name: "📝 Special Instructions",
            value: orderData.deliveryDetails.specialInstructions,
            inline: false
          });
        }
        
        console.log('📤 Sending Discord notification for order:', orderRecord.order_number);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const discordPayload = {
          username: "Cannè Order System",
          avatar_url: "https://raw.githubusercontent.com/twemoji/twemoji/master/assets/72x72/1f33f.png",
          embeds: [embed]
        };
        
        console.log('📦 Discord payload size:', JSON.stringify(discordPayload).length, 'characters');
        
        const discordResponse = await fetch(discordWebhook, {
          method: "POST",
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Canne-Order-System/1.0'
          },
          body: JSON.stringify(discordPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📬 Discord webhook response:', {
          status: discordResponse.status,
          statusText: discordResponse.statusText,
          ok: discordResponse.ok
        });
        
        if (!discordResponse.ok) {
          const errorText = await discordResponse.text();
          console.error('❌ Discord webhook failed:', {
            status: discordResponse.status,
            statusText: discordResponse.statusText,
            error: errorText,
            headers: Object.fromEntries(discordResponse.headers.entries())
          });
          
          // Log specific error types
          if (discordResponse.status === 400) {
            console.error('❌ Discord webhook: Bad Request - Check payload format');
          } else if (discordResponse.status === 401) {
            console.error('❌ Discord webhook: Unauthorized - Check webhook URL');
          } else if (discordResponse.status === 404) {
            console.error('❌ Discord webhook: Not Found - Webhook URL may be invalid');
          } else if (discordResponse.status === 429) {
            console.error('❌ Discord webhook: Rate Limited - Too many requests');
          } else if (discordResponse.status >= 500) {
            console.error('❌ Discord webhook: Server Error - Discord may be down');
          }
        } else {
          console.log('✅ Discord notification sent successfully!');
        }
      }
    } catch (error) {
      console.error('🚨 Discord notification failed with error:', {
        errorType: error?.constructor?.name || typeof error,
        errorMessage: error?.message || 'Unknown error',
        errorCode: error?.code,
        errorStack: error?.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
      });
      
      // Handle specific error types
      if (error?.name === 'AbortError') {
        console.error('❌ Discord webhook: Request timed out after 10 seconds');
      } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
        console.error('❌ Discord webhook: Network connection failed - DNS or connectivity issue');
      } else if (error?.code === 'ECONNRESET') {
        console.error('❌ Discord webhook: Connection reset by Discord servers');
      } else if (error?.message?.includes('fetch')) {
        console.error('❌ Discord webhook: Fetch API error - Network or CORS issue');
      } else {
        console.error('❌ Discord webhook: Unexpected error type');
      }
      
      // Don't fail the order because of Discord notification issues
      console.log('⚠️  Order was successful despite Discord notification failure');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      orderId: orderRecord.id,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('\n💥 Unexpected error in place-order API:');
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.log('=== ORDER SUBMISSION DEBUG END (ERROR) ===\n');
    
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
