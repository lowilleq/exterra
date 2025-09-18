'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/src/lib/supabase/client'
import QRCode from 'qrcode'
import type { Product } from '@/src/lib/types/database'

type Props = {
  initialProducts: Product[]
}

export default function ProductManager({ initialProducts }: Props) {
  const t = useTranslations('Admin')
  const [products, setProducts] = useState(initialProducts)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image_url: '',
    status: 'available' as 'available' | 'sold'
  })
  const [priceDisplay, setPriceDisplay] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      image_url: '',
      status: 'available'
    })
    setPriceDisplay('')
    setImageFile(null)
    setImagePreview(null)
    setIsAdding(false)
    setEditingId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatPriceInput = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '')

    // Ensure only one decimal point
    const parts = cleanValue.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2)
    }

    return cleanValue
  }

  const handlePriceChange = (value: string) => {
    const cleanedValue = formatPriceInput(value)
    setFormData({ ...formData, price: cleanedValue })

    // Format for display
    if (cleanedValue) {
      const numValue = parseFloat(cleanedValue)
      if (!isNaN(numValue)) {
        setPriceDisplay(new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2
        }).format(numValue))
      } else {
        setPriceDisplay('')
      }
    } else {
      setPriceDisplay('')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const filePath = `products/${fileName}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setUploadingImage(true)

    let imageUrl = formData.image_url

    // Upload image if a file was selected
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile)
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      } else {
        alert('Failed to upload image')
        setUploadingImage(false)
        return
      }
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description || null,
      image_url: imageUrl || null,
      status: formData.status
    }

    setUploadingImage(false)

    if (editingId) {
      // Update existing product
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingId)
        .select()
        .single()

      if (!error && data) {
        setProducts(products.map(p => p.id === editingId ? data : p))
      }
    } else {
      // Create new product
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (!error && data) {
        setProducts([data, ...products])
      }
    }

    resetForm()
  }

  const handleEdit = (product: Product) => {
    const priceString = product.price.toString()
    setFormData({
      name: product.name,
      price: priceString,
      description: product.description || '',
      image_url: product.image_url || '',
      status: product.status
    })

    // Set the price display
    if (priceString) {
      const numValue = parseFloat(priceString)
      if (!isNaN(numValue)) {
        setPriceDisplay(new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2
        }).format(numValue))
      }
    }

    // Clear any file selection when editing existing product
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setEditingId(product.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (!error) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const generateQRCode = async (product: Product) => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/nl/product/${product.id}`

    try {
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Create a new canvas for the combined image
      const combinedCanvas = document.createElement('canvas')
      const ctx = combinedCanvas.getContext('2d')!

      // Set dimensions
      combinedCanvas.width = 300
      combinedCanvas.height = 360

      // Draw white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height)

      // Draw QR code
      ctx.drawImage(canvas, 0, 0)

      // Draw product name
      ctx.fillStyle = 'black'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'

      // Wrap text if too long
      const maxWidth = 280
      const text = product.name
      const words = text.split(' ')
      let line = ''
      let y = 320

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, 150, y)
          line = words[n] + ' '
          y += 20
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 150, y)

      // Download the image
      combinedCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `qr-${product.name.replace(/\s+/g, '-').toLowerCase()}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      })
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('products')}</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {t('addProduct')}
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? t('editProduct') : t('addProduct')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('productName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('productPrice')} (EUR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {priceDisplay && (
                <p className="mt-1 text-sm text-gray-600">Preview: {priceDisplay}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('productDescription')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('productImage')}
              </label>

              <div className="space-y-2">
                {/* File upload */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    {t('chooseImage')}
                  </label>
                  {imageFile && (
                    <span className="text-sm text-gray-600">
                      {imageFile.name}
                    </span>
                  )}
                </div>

                {/* Image preview */}
                {(imagePreview || formData.image_url) && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">{t('imagePreview')}:</p>
                    <div className="relative w-32 h-32">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview || formData.image_url}
                        alt="Product preview"
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* URL input (optional fallback) */}
                <div>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder={t('orPasteImageUrl')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={!!imageFile}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('imageUploadHint')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('productStatus')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'sold' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={uploadingImage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploadingImage ? t('uploading') : t('saveButton')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={uploadingImage}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('cancelButton')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(product.price)}
                </p>
                {product.description && (
                  <p className="text-gray-500 text-sm mt-1">{product.description}</p>
                )}
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full
                  ${product.status === 'available' ? 'bg-green-100 text-green-800' :
                    product.status === 'sold' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                  {product.status}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => generateQRCode(product)}
                  className="text-blue-600 hover:text-blue-700"
                  title={t('generateQR')}
                >
                  {t('downloadQR')}
                </button>
                <button
                  onClick={() => handleEdit(product)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}