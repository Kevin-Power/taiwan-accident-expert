import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '台灣車禍事故處理專家 — 安全處置、證據蒐集、程序導航',
  description: '依據台灣交通法規，提供事故現場安全處置、可移車判斷、蒐證清單、資料申請時效提醒、文件生成等全流程導航。',
  applicationName: '台灣車禍事故處理專家',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '車禍專家',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#dc2626',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
