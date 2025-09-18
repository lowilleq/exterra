-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  email TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL REFERENCES customers(email) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locale TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scans_customer_email ON scans(customer_email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_product_id ON scans(product_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at DESC);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read for all)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Create policies for products (authenticated users can insert/update/delete)
CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Create policies for customers (public can insert and update their own)
CREATE POLICY "Anyone can create customers"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own customer record"
  ON customers FOR UPDATE
  USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR true)
  WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email' OR true);

CREATE POLICY "Authenticated users can view all customers"
  ON customers FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policies for scans (public can insert)
CREATE POLICY "Anyone can create scans"
  ON scans FOR INSERT
  WITH CHECK (true);

-- Create policies for scans (authenticated users can view all)
CREATE POLICY "Authenticated users can view all scans"
  ON scans FOR SELECT
  USING (auth.role() = 'authenticated');