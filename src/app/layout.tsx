import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import PwaRegister from '@/components/PwaRegister';

export const viewport: Viewport = {
  themeColor: '#3E5C46',
};

export const metadata: Metadata = {
  title: 'منصة التكوين المتواصل | TadribPro',
  description: 'المنصة الوطنية للتكوين المتواصل للموظفين والتربصات - الجزائر',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'TadribPro',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
