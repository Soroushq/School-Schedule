import './globals.css'
import { Metadata } from 'next'
import Navbar from './components/Navbar'
import { ClientScheduleSyncObserver, ClientAnalyticsTracker, ClientPrivacyAgreement } from './ClientComponents'
import ClientLayout from './ClientLayout'
import { Suspense } from 'react'
import PageLoading from '@/components/PageLoading'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata: Metadata = {
  title: 'برنامه ساز مدرسه',
  description: 'نرم افزار برنامه سازی مدرسه و کلاس',
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
      <body className="transition-colors duration-300 ease-in-out">
        <ThemeProvider>
          <Suspense fallback={null}>
            <PageLoading />
          </Suspense>
          <ClientPrivacyAgreement />
          <Navbar />
          <ClientScheduleSyncObserver />
          <ClientAnalyticsTracker />
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
