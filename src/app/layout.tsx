import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "برنامه هفتگی مدرسه",
  description: "برنامه زمانی هفتگی مدرسه",
  icons: {
    icon: '/photos/favicon.png',
    apple: '/photos/favicon.png',
    shortcut: '/photos/favicon.png'
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
