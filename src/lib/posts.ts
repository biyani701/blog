import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { z } from 'zod'
import { renderMarkdown, type RenderedMarkdown } from './markdown'

// Posts are Markdown files in content/posts with YAML front matter. Every page is prerendered, so the reads are
// build-time only and kept out of file tracing (turbopackIgnore). Publishing is a merge to main: a post with
// `draft: true` is shown by `next dev` only. Every validation failure names the file and the field.

export const POSTS_DIR = join(process.cwd(), 'content', 'posts')

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use lower-case-kebab')
const text = z.string().trim().min(1)

export const postMetaSchema = z.object({
  slug,
  title: text,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD'),
  topics: z.array(text).min(1),
  summary: text,
  /** Old identifiers (vishal.biyani.xyz/blogs/:id) that redirect here. */
  aliases: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
})

export type PostMeta = z.infer<typeof postMetaSchema>
export type Post = PostMeta & RenderedMarkdown & { readingMinutes: number }

export class PostError extends Error {
  override name = 'PostError'
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

/** Parses and validates one post. `file` is the name used in errors and must match the slug. */
export async function parsePost(file: string, source: string): Promise<Post> {
  const match = FRONT_MATTER.exec(source)
  if (!match) throw new PostError(`${file}: missing front matter`)
  const result = postMetaSchema.safeParse(parseYaml(match[1]!))
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${file}: ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    throw new PostError(message.join('\n'))
  }
  const meta = result.data
  if (basename(file, '.md') !== meta.slug) throw new PostError(`${file}: slug: must match the file name`)
  const rendered = await renderMarkdown(match[2]!)
  return { ...meta, ...rendered, readingMinutes: Math.max(1, Math.round(rendered.words / 220)) }
}

/** Drafts are visible in development only. */
export const showDrafts = () => process.env.NODE_ENV === 'development'

/** Every post, newest first, without drafts unless `drafts` is true. */
export async function loadPosts({ drafts = showDrafts(), dir = POSTS_DIR } = {}): Promise<Post[]> {
  const files = (await readdir(/* turbopackIgnore: true */ dir)).filter((name) => name.endsWith('.md'))
  const posts = await Promise.all(files.map(async (name) => parsePost(`content/posts/${name}`, await readFile(join(/* turbopackIgnore: true */ dir, name), 'utf8'))))

  const seen = new Map<string, string>()
  for (const post of posts) {
    for (const key of [post.slug, ...post.aliases]) {
      const owner = seen.get(key)
      if (owner) throw new PostError(`content/posts/${post.slug}.md: "${key}" is already used by ${owner}`)
      seen.set(key, post.slug)
    }
  }

  return posts.filter((post) => drafts || !post.draft).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}

/** The post whose slug or alias is `key`; `redirect` is true when `key` is an alias. */
export async function findPost(key: string, options?: Parameters<typeof loadPosts>[0]) {
  const posts = await loadPosts(options)
  const post = posts.find((p) => p.slug === key || p.aliases.includes(key))
  return post && { post, redirect: post.slug !== key }
}
