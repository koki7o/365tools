import './globals.css'

export const metadata = {
  title: 'Chore Assignment Rotator',
  description: 'A modern tool for managing and rotating household chores',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
