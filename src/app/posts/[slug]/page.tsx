import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { findPost, loadPosts } from '@/lib/posts'
import { formatDate } from '@/lib/site'

// Every slug and alias is generated at build time; anything else is a 404.
export const dynamicParams = false

export async function generateStaticParams() {
  const posts = await loadPosts()
  return posts.flatMap((post) => [post.slug, ...post.aliases].map((slug) => ({ slug })))
}

export async function generateMetadata(props: PageProps<'/posts/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const found = await findPost(slug)
  if (!found) return {}
  const { post } = found
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.summary, publishedTime: post.date },
  }
}

export default async function PostPage(props: PageProps<'/posts/[slug]'>) {
  const { slug } = await props.params
  const found = await findPost(slug)
  if (!found) notFound()
  if (found.redirect) permanentRedirect(`/posts/${found.post.slug}`)
  const { post } = found

  return (
    <article>
      <header>
        <h1 className="text-3xl font-semibold leading-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read · {post.topics.join(', ')}
        </p>
      </header>
      {post.headings.length > 2 && (
        <nav aria-label="On this page" className="mt-8 rounded-lg border border-rule p-4 text-sm">
          <p className="font-semibold">On this page</p>
          <ul className="mt-2 flex flex-col gap-1">
            {post.headings.map((heading) => (
              <li key={heading.id} className={heading.depth === 3 ? 'pl-4' : undefined}>
                <a href={`#${heading.id}`} className="text-muted hover:text-foreground">
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {/* Sanitised in src/lib/markdown.ts: raw HTML in the source is dropped. */}
      <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  )
}
