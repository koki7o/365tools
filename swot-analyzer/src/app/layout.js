import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SWOT Analyzer',
  description: 'A tool for creating and managing SWOT analyses',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-gray-50">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
