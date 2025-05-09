import './globals.css'
import { Metadata } from 'next'
import Navbar from './components/Navbar'
import { ClientScheduleSyncObserver } from './ClientComponents'

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
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        <Navbar />
        <ClientScheduleSyncObserver />
        {children}
      </body>
    </html>
  )
}
