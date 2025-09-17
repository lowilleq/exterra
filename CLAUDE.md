# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Interior store web app for QR-based price viewing. Customers scan QR codes on store items to view product details and prices. First-time visitors must provide email, then can browse unlimited products for 7 days.

## Commands

### Development
- `npm run dev` - Start the development server (http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

### TypeScript Validation
- `npx tsc --noEmit` - Run TypeScript type checking without emitting files

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router) with React 19
- **Backend**: Supabase (PostgreSQL database + Authentication)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS v4
- **Internationalization**: next-intl (Dutch default, French, English)

### Core Features

#### 1. Customer Flow
- Scan QR code → Land on `/[locale]/product/[id]` page
- First visit: Modal/form to enter email before seeing price
- After email: See all product details and prices instantly
- Session saved for 7 days via cookies
- Track all scans: email, product, timestamp

#### 2. Admin Panel (`/[locale]/admin`)
- **Authentication**: Supabase Auth for admin access
- **Product Management**:
  - Add Product: name, price, description, image, status
  - Product List: View all products with QR preview
  - Generate QR: Download QR code with product name for printing
- **Scan Tracking**: Table showing who scanned what and when

### Database Schema (Supabase)

```sql
-- Products table
products (
  id: uuid primary key,
  name: text,
  price: decimal,
  description: text,
  image_url: text,
  status: text, -- 'active', 'inactive', 'out_of_stock'
  created_at: timestamp
)

-- Scans table
scans (
  id: uuid primary key,
  email: text,
  product_id: uuid references products(id),
  scanned_at: timestamp,
  locale: text
)

-- Admin users (using Supabase Auth)
```

### Key Architectural Decisions

1. **QR Codes**: Contain full URLs (e.g., `https://domain.com/nl/product/uuid`) for instant redirection
2. **Session Management**: Cookie-based (7 days) storing email after first scan
3. **Internationalization**: Maintained with `[locale]` segment pattern, supporting nl/fr/en
4. **Authentication**: Supabase Auth for admin panel access

### Project Structure
```
/
├── messages/          # Localization JSON files
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── product/
│   │       │   └── [id]/  # Product detail pages
│   │       └── admin/     # Admin panel
│   ├── components/        # Shared components
│   ├── lib/              # Supabase client, utilities
│   ├── i18n/             # Internationalization config
│   └── middleware.ts     # Locale handling + auth checks
```