'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ProductManager from './ProductManager'
import ScansList from './ScansList'
import CustomersList from './CustomersList'
import type { Product } from '@/src/lib/types/database'

type ScanWithProduct = {
  id: string
  customer_email: string
  product_id: string
  scanned_at: string
  locale: string | null
  products?: { name: string }
  customers?: {
    email: string
    first_name: string
    last_name: string
  }
}

type CustomerWithScans = {
  email: string
  first_name: string
  last_name: string
  created_at: string
  last_seen_at: string
  scans: Array<{
    id: string
    scanned_at: string
    locale: string | null
    products?: {
      id: string
      name: string
      price: number
    }
  }>
}

type Props = {
  initialProducts: Product[]
  initialScans: ScanWithProduct[]
  initialCustomers: CustomerWithScans[]
}

export default function AdminDashboard({ initialProducts, initialScans, initialCustomers }: Props) {
  const t = useTranslations('Admin')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'products' | 'scans' | 'customers'>('products')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              {t('logoutButton')}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-2 px-4 ${
                activeTab === 'products'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('products')}
            </button>
            <button
              onClick={() => setActiveTab('scans')}
              className={`pb-2 px-4 ${
                activeTab === 'scans'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('scans')}
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`pb-2 px-4 ${
                activeTab === 'customers'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('customers')}
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <ProductManager initialProducts={initialProducts} />
        ) : activeTab === 'scans' ? (
          <ScansList initialScans={initialScans} />
        ) : (
          <CustomersList initialCustomers={initialCustomers} />
        )}
      </div>
    </div>
  )
}