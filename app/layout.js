import { Syne, Space_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
})

export const metadata = {
  title: 'GitHub Wrapped',
  description: 'Spotify Wrapped but for your GitHub activity',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  )
}