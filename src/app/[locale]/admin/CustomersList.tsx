'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

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
  initialCustomers: CustomerWithScans[]
}

export default function CustomersList({ initialCustomers }: Props) {
  const t = useTranslations('Admin')
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const toggleCustomer = (email: string) => {
    setExpandedCustomer(expandedCustomer === email ? null : email)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t('customers')}</h2>

      <div className="space-y-4">
        {initialCustomers.map((customer) => (
          <div key={customer.email} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCustomer(customer.email)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>{t('lastSeen')}: {new Date(customer.last_seen_at).toLocaleDateString()}</span>
                    <span>{t('totalScans')}: {customer.scans.length}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedCustomer === customer.email ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {expandedCustomer === customer.email && (
              <div className="border-t border-gray-200">
                <div className="p-4">
                  <h4 className="font-semibold mb-3">{t('scanHistory')}</h4>
                  {customer.scans.length === 0 ? (
                    <p className="text-gray-500 text-sm">{t('noScansYet')}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              {t('scanProduct')}
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              {t('productPrice')}
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              {t('scanTime')}
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              {t('locale')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {customer.scans.map((scan) => (
                            <tr key={scan.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2">
                                {scan.products?.name || 'Unknown Product'}
                              </td>
                              <td className="px-3 py-2">
                                {scan.products?.price ? formatPrice(scan.products.price) : '-'}
                              </td>
                              <td className="px-3 py-2 text-gray-600">
                                {formatDate(scan.scanned_at)}
                              </td>
                              <td className="px-3 py-2 text-gray-600">
                                {scan.locale?.toUpperCase() || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {initialCustomers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            {t('noCustomersYet')}
          </div>
        )}
      </div>
    </div>
  )
}