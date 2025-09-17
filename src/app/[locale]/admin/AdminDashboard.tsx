'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ProductManager from './ProductManager'
import ScansList from './ScansList'
import type { Product } from '@/src/lib/types/database'

type ScanWithProduct = {
  id: string
  email: string
  product_id: string
  scanned_at: string
  locale: string | null
  products?: { name: string }
}

type Props = {
  initialProducts: Product[]
  initialScans: ScanWithProduct[]
}

export default function AdminDashboard({ initialProducts, initialScans }: Props) {
  const t = useTranslations('Admin')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'products' | 'scans'>('products')

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
          </div>
        </div>

        {activeTab === 'products' ? (
          <ProductManager initialProducts={initialProducts} />
        ) : (
          <ScansList initialScans={initialScans} />
        )}
      </div>
    </div>
  )
}