# Test Order Command

## Local Development Server

First, start your dev server:
```bash
npm run dev
```

Then run this test order:

```bash
curl -X POST http://localhost:3000/api/place-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": {
          "id": "classic",
          "name": "Classic Tier Art",
          "price": 45,
          "tier": "Classic",
          "weight": "7g",
          "color_theme": "Purple"
        },
        "strain": {
          "name": "Moroccan Peach",
          "type": "sativa",
          "thcLow": 18,
          "thcHigh": 22
        },
        "quantity": 1
      }
    ],
    "deliveryDetails": {
      "name": "Test Customer",
      "phone": "2025551234",
      "email": "test@canne.app",
      "address": "1600 Pennsylvania Avenue NW",
      "city": "Washington",
      "zipCode": "20500",
      "timePreference": "ASAP (60-90 min)",
      "specialInstructions": "TEST ORDER - Please verify Discord webhook"
    },
    "total": 45,
    "hasDelivery": true,
    "status": "pending"
  }'
```

## Production Test

For production (https://canne.app):

```bash
curl -X POST https://canne.app/api/place-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": {
          "id": "classic",
          "name": "Classic Tier Art",
          "price": 45,
          "tier": "Classic",
          "weight": "7g",
          "color_theme": "Purple"
        },
        "strain": {
          "name": "Moroccan Peach",
          "type": "sativa",
          "thcLow": 18,
          "thcHigh": 22
        },
        "quantity": 1
      }
    ],
    "deliveryDetails": {
      "name": "Test Customer",
      "phone": "2025551234",
      "email": "test@canne.app",
      "address": "1600 Pennsylvania Avenue NW",
      "city": "Washington",
      "zipCode": "20500",
      "timePreference": "ASAP (60-90 min)",
      "specialInstructions": "TEST ORDER - Discord webhook test"
    },
    "total": 45,
    "hasDelivery": true,
    "status": "pending"
  }'
```

## Expected Response

```json
{
  "success": true,
  "orderId": "uuid-here",
  "orderNumber": "CN-20250101-1234",
  "message": "Order placed successfully"
}
```

## Discord Notification

You should receive a Discord notification with:
- 🎉 New Order Received!
- Order number
- Customer details
- Items ordered
- Total amount
- Delivery address
- Preferred time

## Verify in Admin

1. Go to `/admin/orders`
2. Check "Pending" tab
3. Look for order number CN-XXXXXXXX-XXXX
4. Verify all details are correct

## Alternative: Use the Website

1. Go to https://canne.app
2. Add items to cart
3. Go to checkout
4. Fill in delivery details:
   - Name: Test Customer
   - Phone: (202) 555-1234
   - Email: test@canne.app
   - Address: 1600 Pennsylvania Avenue NW
   - City: Washington
   - ZIP: 20500
5. Check age verification boxes
6. Click "Place Order"
7. Check Discord for notification
8. Check admin panel for order
