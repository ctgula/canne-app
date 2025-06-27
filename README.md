# Cannè - Digital Art & Gifts Platform

A premium I-71 compliant gifting web application built for Washington, D.C. Customers purchase digital artwork and receive complimentary cannabis gifts with their orders.

## 🎨 Features

### Customer Experience
- **Beautiful Product Gallery**: Premium digital artwork with clear gift information
- **Mobile-First Design**: Clean, ice cream shop-inspired aesthetic
- **Smart Cart System**: Automatic delivery threshold calculation ($40+)
- **Smooth Checkout**: Simple delivery details form
- **Order Confirmation**: Clear next steps and delivery information

### Admin Dashboard
- **Order Management**: View, track, and update order statuses
- **Revenue Analytics**: Total revenue, order count, and pending orders
- **Customer Details**: Full contact and delivery information
- **Status Updates**: Easy order status management

### Legal Compliance
- **I-71 Compliant**: No cannabis sales, only digital art with complimentary gifts
- **Clear Pricing**: Transparent gift tiers and delivery thresholds
- **Age Verification**: 21+ confirmation during checkout

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (React) with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API with useReducer
- **Icons**: Lucide React
- **Database**: Ready for Supabase integration
- **Deployment**: Optimized for Vercel

## 📦 Gift Tiers

| Art Price | Gift Amount | Free Delivery |
|-----------|-------------|---------------|
| $25       | 3.5g        | ❌            |
| $40       | 7g          | ✅            |
| $50       | 10g         | ✅            |
| $65       | 14g         | ✅            |
| $140      | 28g         | ✅            |

*Free delivery on orders $40 and above*

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and Setup**
   ```bash
   cd canne-app
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Navigate to `http://localhost:3000`

### Project Structure
```
src/
├── app/                    # Next.js 14 app router
│   ├── api/orders/        # Order API endpoints
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout form
│   ├── admin/             # Admin dashboard
│   └── page.tsx           # Homepage
├── components/            # Reusable UI components
│   ├── Header.tsx         # Navigation header
│   └── ProductCard.tsx    # Product display card
├── hooks/                 # React hooks
│   └── use-cart.tsx       # Cart state management
├── lib/                   # Utility functions
│   └── cart-utils.ts      # Cart calculations
├── types/                 # TypeScript definitions
│   └── index.ts           # App interfaces
└── data/                  # Static data
    └── products.ts        # Product catalog
```

## 🎯 Key Pages

### Homepage (`/`)
- Hero section with value propositions
- Product grid with gift information
- Mobile-optimized design

### Cart (`/cart`)
- Item management with quantity controls
- Delivery threshold indicators
- Order summary with totals

### Checkout (`/checkout`)
- Customer contact form
- Delivery address collection
- Time preference selection
- Order completion flow

### Admin Dashboard (`/admin`)
- Order listing and management
- Revenue and analytics overview
- Customer contact information
- Status update controls

## 📱 Mobile-First Design

The application is built with a mobile-first approach:
- Responsive grid layouts
- Touch-friendly buttons and controls
- Readable typography and spacing
- Optimized images and icons

## 🔧 Customization

### Adding Products
Update `src/data/products.ts` with new artwork:
```typescript
{
  id: 'unique-id',
  name: 'Artwork Name',
  description: 'Beautiful description',
  price: 50,
  artworkUrl: '/path/to/image',
  giftSize: '10g',
  hasDelivery: true
}
```

### Styling Changes
Modify `src/app/globals.css` for theme updates:
- Custom color variables
- Component classes
- Responsive breakpoints

### API Integration
Replace mock data in `src/app/api/orders/route.ts` with:
- Database connections (Supabase recommended)
- Email/SMS notifications
- Payment processing
- Inventory management

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   Add to Vercel dashboard:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

### Other Platforms
- **Netlify**: Deploy from Git with build command `npm run build`
- **Railway**: Connect repository and deploy
- **DigitalOcean**: Use App Platform for automatic deployments

## 🔐 Security Considerations

### For Production
- [ ] Add proper authentication for admin dashboard
- [ ] Implement CSRF protection
- [ ] Set up API rate limiting
- [ ] Use HTTPS everywhere
- [ ] Validate all user inputs
- [ ] Implement proper error handling

### Legal Compliance
- [ ] Add age verification modal
- [ ] Include terms of service
- [ ] Add privacy policy
- [ ] Implement delivery tracking
- [ ] Set up customer ID verification

## 🗄 Database Schema (Supabase)

When ready to add a database, create these tables:

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  artwork_url TEXT,
  gift_size TEXT NOT NULL,
  has_delivery BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_zip TEXT NOT NULL,
  time_preference TEXT NOT NULL,
  special_instructions TEXT,
  total DECIMAL(10,2) NOT NULL,
  has_delivery BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

## 📞 Support

For questions or support:
- Review the code comments for implementation details
- Check the TypeScript interfaces in `src/types/`
- Examine the component structure for customization

## 📄 License

This project is built for educational and business purposes. Ensure compliance with local laws and regulations regarding cannabis gifting and digital commerce.

---

**Built with ❤️ for the Cannè platform**
