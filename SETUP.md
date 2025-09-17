# Setup Instructions

## 1. Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)

2. Once created, go to Settings → API and copy:
   - Project URL
   - Anon/Public Key

3. Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Go to SQL Editor in Supabase and run the schema from `supabase/schema.sql`

5. To create an admin user:
   - Go to Authentication → Users
   - Click "Invite user"
   - Enter an email and password
   - The user will receive an email to confirm their account

## 2. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## 3. Testing the Flow

1. **Create a Product** (as admin):
   - Go to http://localhost:3000/admin
   - Login with your admin credentials
   - Add a new product

2. **Generate QR Code**:
   - Click "Download QR" button next to a product
   - Print or save the QR code image

3. **Test Customer Flow**:
   - Scan the QR code (or manually visit `/nl/product/[product-id]`)
   - Enter email on first visit
   - Price will be shown
   - Subsequent visits won't require email for 7 days

## 4. Production Deployment (Vercel)

1. Push your code to GitHub

2. Import project to Vercel

3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)

4. Deploy

## Important Notes

- QR codes contain full URLs, so update `NEXT_PUBLIC_APP_URL` in production
- The admin panel is at `/admin` for any locale
- Customer emails are stored in cookies for 7 days
- All scans are tracked in the database