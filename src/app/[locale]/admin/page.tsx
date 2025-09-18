import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch recent scans with customer information
  const { data: scans } = await supabase
    .from('scans')
    .select('*, products(name), customers(email, first_name, last_name)')
    .order('scanned_at', { ascending: false })
    .limit(50)

  // Fetch customers with their scan history
  const { data: customersRaw } = await supabase
    .from('customers')
    .select(`
      email,
      first_name,
      last_name,
      created_at,
      last_seen_at,
      scans:scans!customer_email (
        id,
        scanned_at,
        locale,
        products (
          id,
          name,
          price
        )
      )
    `)
    .order('created_at', { ascending: false })

  // Transform to match our expected type structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customers = (customersRaw || []).map((customer: any) => ({
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    created_at: customer.created_at,
    last_seen_at: customer.last_seen_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scans: (customer.scans || []).map((scan: any) => ({
      id: scan.id,
      scanned_at: scan.scanned_at,
      locale: scan.locale,
      products: scan.products || undefined
    }))
  }))

  return <AdminDashboard
    initialProducts={products || []}
    initialScans={scans || []}
    initialCustomers={customers}
  />
}