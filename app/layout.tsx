import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GeoShield - Eyes on Ground',
  description: 'Real-time disaster intelligence platform for Uttarakhand',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}