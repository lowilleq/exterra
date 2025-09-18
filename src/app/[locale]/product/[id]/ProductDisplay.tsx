'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/i18n/navigation'
import { getCustomerEmail, setCustomerEmail, setCustomerName } from '@/src/lib/cookies'
import { createClient } from '@/src/lib/supabase/client'
import type { Product } from '@/src/lib/types/database'

type Props = {
  product: Product
  locale: string
}

export default function ProductDisplay({ product, locale }: Props) {
  const t = useTranslations('Product')
  const [email, setEmail] = useState('')
  const [hasEmail, setHasEmail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [firstNameInput, setFirstNameInput] = useState('')
  const [lastNameInput, setLastNameInput] = useState('')

  useEffect(() => {
    // Check if user already has email in cookies
    const storedEmail = getCustomerEmail()
    if (storedEmail) {
      setEmail(storedEmail)
      setHasEmail(true)
      // Record the scan
      recordScan(storedEmail, product.id, locale)
    }
  }, [product.id, locale])

  const recordScan = async (userEmail: string, productId: string, userLocale: string) => {
    const supabase = createClient()
    await supabase
      .from('scans')
      .insert({
        customer_email: userEmail,
        product_id: productId,
        locale: userLocale
      })
  }

  const createOrUpdateCustomer = async (email: string, firstName: string, lastName: string) => {
    const supabase = createClient()

    // Try to insert, if exists it will fail silently
    const { error: insertError } = await supabase
      .from('customers')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName
      })

    // If customer exists, update their last_seen_at
    if (insertError && insertError.code === '23505') { // Unique constraint violation
      await supabase
        .from('customers')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('email', email)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim() || !firstNameInput.trim() || !lastNameInput.trim()) return

    setIsLoading(true)
    try {
      // Save customer to database
      await createOrUpdateCustomer(emailInput, firstNameInput, lastNameInput)

      // Save email and names to cookies
      setCustomerEmail(emailInput)
      setCustomerName(firstNameInput, lastNameInput)
      setEmail(emailInput)
      setHasEmail(true)

      // Record the scan
      await recordScan(emailInput, product.id, locale)
    } catch (error) {
      console.error('Error saving email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale === 'fr' ? 'fr-FR' : 'nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-block mb-4 text-blue-600 hover:underline">
        ← {t('backToHome')}
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        {product.image_url && (
          <div className="relative w-full mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto max-h-96 object-contain rounded-lg bg-gray-50"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

        {product.description && (
          <p className="text-gray-600 mb-6">{product.description}</p>
        )}

        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
            ${product.status === 'available' ? 'bg-green-100 text-green-800' :
              product.status === 'sold' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'}`}>
            {t(`status.${product.status}`)}
          </span>
        </div>

        {!hasEmail ? (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">{t('emailRequired')}</h2>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('firstNameLabel')}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstNameInput}
                    onChange={(e) => setFirstNameInput(e.target.value)}
                    placeholder={t('firstNamePlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('lastNameLabel')}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastNameInput}
                    onChange={(e) => setLastNameInput(e.target.value)}
                    placeholder={t('lastNamePlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('emailLabel')}
                </label>
                <input
                  type="email"
                  id="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
              >
                {isLoading ? '...' : t('submitButton')}
              </button>
            </form>
          </div>
        ) : (
          <div className="border-t pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {t('price')}: {formatPrice(product.price)}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {email && `Viewing as: ${firstNameInput} ${lastNameInput}`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}