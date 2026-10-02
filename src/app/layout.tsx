import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { SITE } from '@/lib/site'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s · ${SITE.title}` },
  description: SITE.description,
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-rule">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="inline-flex min-h-11 items-center text-lg font-semibold">
              {SITE.title}
            </Link>
            <nav className="flex gap-4 text-muted">
              <a href={SITE.portfolio} className="inline-flex min-h-11 items-center hover:text-foreground">
                Portfolio
              </a>
              <a href="/feed.xml" className="inline-flex min-h-11 items-center hover:text-foreground">
                RSS
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-rule">
          <p className="mx-auto max-w-3xl px-4 py-6 text-sm text-muted">
            © {SITE.author}. The writing is copyright; the code is{' '}
            <a className="underline" href={SITE.repo}>
              open source
            </a>
            .
          </p>
        </footer>
      </body>
    </html>
  )
}
