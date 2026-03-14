import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'coZap — Alumni Poli',
  description: 'Plataforma de comunicação da comunidade Alumni Poli',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
