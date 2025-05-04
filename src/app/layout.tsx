import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "برنامه زمانی مدرسه",
  description: "برنامه زمانی هفتگی مدرسه",
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
