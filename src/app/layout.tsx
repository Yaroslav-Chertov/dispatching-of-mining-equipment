import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'ФОРК ИТ — Оптимизатор простоев',
  description: 'Система диспетчеризации горной техники',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Golos Text — основной шрифт (подзаголовки, текст, сноски).
          Oswald — fallback для заголовков когда Druk Wide не установлен локально.
          Druk Wide подключается через @font-face в globals.css (self-hosted файл).
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&family=Oswald:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
