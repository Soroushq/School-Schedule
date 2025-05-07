import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "برنامه هفتگی مدرسه",
  description: "برنامه زمانی هفتگی مدرسه",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
