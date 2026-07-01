import './globals.css';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'People\'s Priorities',
  description: 'AI-powered citizen suggestion platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-slate-50 text-slate-900 antialiased selection:bg-indigo-200 selection:text-indigo-900`}>
        {children}
      </body>
    </html>
  )
}
