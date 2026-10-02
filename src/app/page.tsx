import Link from 'next/link'
import { loadPosts } from '@/lib/posts'
import { formatDate } from '@/lib/site'

export default async function Home() {
  const posts = await loadPosts()
  return (
    <>
      <h1 className="text-3xl font-semibold">Writing</h1>
      <p className="mt-2 text-muted">Notes on payments, capital markets and building software with AI.</p>
      <ol className="mt-10 flex flex-col gap-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <article>
              <h2 className="text-xl font-semibold">
                <Link href={`/posts/${post.slug}`} className="hover:text-accent">
                  {post.title}
                </Link>
                {post.draft && <span className="ml-2 rounded bg-surface px-2 py-0.5 text-sm font-normal text-muted">Draft</span>}
              </h2>
              <p className="mt-1 text-sm text-muted">
                <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read · {post.topics.join(', ')}
              </p>
              <p className="mt-2">{post.summary}</p>
            </article>
          </li>
        ))}
      </ol>
    </>
  )
}
