import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import QRScanner from '@/src/components/QRScanner';

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Ex Terra
            </h1>
            <p className="text-xl text-gray-700">
              <HomePageDescription />
            </p>
          </div>

          {/* QR Scanner Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
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
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                <ScanTitle />
              </h2>
              <p className="text-gray-600">
                <ScanDescription />
              </p>
            </div>

            <QRScanner />
          </div>

          {/* How it works section */}
          <div className="bg-white/60 backdrop-blur rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <HowItWorksTitle />
            </h3>
            <div className="space-y-3">
              <StepItem number="1" />
              <StepItem number="2" />
              <StepItem number="3" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with subtle admin link */}
      <footer className="mt-auto py-6 border-t border-gray-200 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">© 2025 Ex Terra</p>
            <Link
              href="/admin"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <AdminText />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomePageDescription() {
  const t = useTranslations('HomePage');
  return <>{t('description')}</>;
}

function ScanTitle() {
  const t = useTranslations('HomePage');
  return <>{t('scanTitle')}</>;
}

function ScanDescription() {
  const t = useTranslations('HomePage');
  return <>{t('scanDescription')}</>;
}

function HowItWorksTitle() {
  const t = useTranslations('HomePage');
  return <>{t('howItWorks')}</>;
}

function StepItem({ number }: { number: string }) {
  const t = useTranslations('HomePage');
  return (
    <div className="flex items-start space-x-3">
      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
        {number}
      </span>
      <p className="text-gray-600 text-sm">{t(`step${number}`)}</p>
    </div>
  );
}

function AdminText() {
  const t = useTranslations('HomePage');
  return <>{t('adminAccess')}</>;
}