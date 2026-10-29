import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  // ВОТ ЗДЕСЬ МЕНЯЕТСЯ НАЗВАНИЕ ВКЛАДКИ
  title: "GigWork - Подработка", 
  description: "Платформа для поиска подработки и управления задачами",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GigWork",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}