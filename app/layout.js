import { Exo_2, Space_Mono } from 'next/font/google'
import './globals.css'

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo2',
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
      <body className={`${exo2.variable} ${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  )
}