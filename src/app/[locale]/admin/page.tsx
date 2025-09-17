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

  // Fetch recent scans
  const { data: scans } = await supabase
    .from('scans')
    .select('*, products(name)')
    .order('scanned_at', { ascending: false })
    .limit(50)

  return <AdminDashboard initialProducts={products || []} initialScans={scans || []} />
}