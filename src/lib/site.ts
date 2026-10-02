export const SITE = {
  title: 'Vishal Biyani',
  description: 'Writing on payments, capital markets and building software with AI.',
  author: 'Vishal Biyani',
  url: process.env.SITE_URL ?? 'https://blog.biyani.xyz',
  portfolio: 'https://vishal.biyani.xyz',
  repo: 'https://github.com/biyani701/blog',
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** "15 November 2023" from "2023-11-15". */
export const formatDate = (isoDate: string) => dateFormat.format(new Date(`${isoDate}T00:00:00Z`))
