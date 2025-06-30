-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  tier TEXT NOT NULL,
  weight TEXT NOT NULL,
  color_theme TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tier)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_state TEXT,
  delivery_zip TEXT,
  is_delivery BOOLEAN DEFAULT false,
  delivery_notes TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'other'))
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  tier TEXT NOT NULL,
  weight TEXT NOT NULL,
  color_theme TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_tier ON products(tier);

-- Insert standard products
INSERT INTO products (name, description, price, tier, weight, color_theme, image_url, is_active)
VALUES
  ('Starter Tier Art', 'Single digital print + complimentary top-shelf gift.', 25.00, 'Starter', '3.5g', 'Pink', '/images/products/starter.jpg', true),
  ('Classic Tier Art', 'Double art series with signature + two curated gifts.', 45.00, 'Classic', '7g', 'Violet', '/images/products/classic.jpg', true),
  ('Black Tier Art', 'Limited collection prints + four premium gifts.', 75.00, 'Black', '14g', 'Black/Gray', '/images/products/black.jpg', true),
  ('Ultra Tier Art', 'Exclusive gallery pieces + eight premium selections.', 140.00, 'Ultra', '28g', 'Purple/Indigo', '/images/products/ultra.jpg', true)
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  weight = EXCLUDED.weight,
  color_theme = EXCLUDED.color_theme,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active;
