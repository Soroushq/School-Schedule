import './globals.css'
import { Metadata } from 'next'
import Navbar from './components/Navbar'
import { ThemeProvider } from '@/context/ThemeContext'
import { UserRoleProvider } from '@/context/UserRoleContext'
import AnalyticsInitializer from '@/components/AnalyticsInitializer'
import { ClientScheduleSyncObserver, ClientPrivacyAgreement } from './ClientComponents'
import ClientLayout from './ClientLayout'
import { Suspense } from 'react'
import PageLoading from '@/components/PageLoading'

export const metadata: Metadata = {
  title: 'سیستم برنامه‌ریزی مدرسه',
  description: 'برنامه‌ریزی مدرسه',
  icons: {
    icon: [
      { url: '/photos/icon-black.png', media: '(prefers-color-scheme: light)' },
      { url: '/photos/icon-white.png', media: '(prefers-color-scheme: dark)' }
    ],
    apple: [
      { url: '/photos/icon-black.png', media: '(prefers-color-scheme: light)' },
      { url: '/photos/icon-white.png', media: '(prefers-color-scheme: dark)' }
    ],
    shortcut: [
      { url: '/photos/icon-black.png', media: '(prefers-color-scheme: light)' },
      { url: '/photos/icon-white.png', media: '(prefers-color-scheme: dark)' }
    ]
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="transition-colors duration-300 ease-in-out bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <UserRoleProvider>
            <Suspense fallback={null}>
              <PageLoading />
            </Suspense>
            <ClientPrivacyAgreement />
            <Navbar />
            <ClientScheduleSyncObserver />
            <ClientLayout>{children}</ClientLayout>
            <AnalyticsInitializer />
          </UserRoleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
