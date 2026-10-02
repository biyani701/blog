import { loadPosts } from '@/lib/posts'
import { SITE } from '@/lib/site'

export const dynamic = 'force-static'

const escape = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)

/** RSS 2.0 of the published posts. */
export async function GET() {
  const posts = await loadPosts({ drafts: false })
  const items = posts
    .map((post) => {
      const link = `${SITE.url}/posts/${post.slug}`
      return `<item><title>${escape(post.title)}</title><link>${link}</link><guid>${link}</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><description>${escape(post.summary)}</description></item>`
    })
    .join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escape(SITE.title)}</title><link>${SITE.url}</link><description>${escape(SITE.description)}</description>${items}</channel></rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
