import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/shared/components/providers';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import { cn } from "@/lib/utils";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'EchoFlow',
  description: 'Your personal productivity space',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans', plusJakartaSans.variable, spaceGrotesk.variable)}>
      <body className="theme antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
