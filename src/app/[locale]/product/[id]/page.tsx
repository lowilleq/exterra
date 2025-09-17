import { notFound } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import ProductDisplay from './ProductDisplay'
import type { Product } from '@/src/lib/types/database'

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export default async function ProductPage({ params }: Props) {
  const { id, locale } = await params
  const supabase = await createClient()

  // Fetch product from Supabase
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ProductDisplay
          product={product as Product}
          locale={locale}
        />
      </div>
    </div>
  )
}