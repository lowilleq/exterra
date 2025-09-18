'use client'

import { useTranslations } from 'next-intl'

export default function QRScanner() {
  const t = useTranslations('HomePage')

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Instructions for QR scanning */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-2">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h3 className="font-semibold text-gray-800">{t('scanInstructions')}</h3>
        <p className="text-sm text-gray-600">
          {t('openCameraApp')}
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{t('iosAndroidHint')}</span>
        </div>
      </div>
    </div>
  )
}