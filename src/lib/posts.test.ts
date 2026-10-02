import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findPost, loadPosts, parsePost } from './posts'

const post = (meta: string, body = 'Hello.\n\n## Section\n\nText.') => `---\n${meta}\n---\n\n${body}\n`
const meta = (slug: string, extra = '') =>
  `slug: "${slug}"\ntitle: "Title"\ndate: "2024-01-02"\ntopics: ["AI"]\nsummary: "Summary."${extra ? `\n${extra}` : ''}`

async function dirWith(files: Record<string, string>) {
  const dir = await mkdtemp(join(tmpdir(), 'posts-'))
  await Promise.all(Object.entries(files).map(([name, source]) => writeFile(join(dir, name), source)))
  return dir
}

describe('the seeded posts', () => {
  it('are the three articles from the portfolio, newest first, with the old /blogs ids as aliases', async () => {
    const posts = await loadPosts({ drafts: false })
    expect(posts.map((p) => p.slug)).toEqual(['ai-agents', 'payments-innovations-2023', 'ai-productivity-tools-2023'])
    expect(posts.every((p) => p.aliases.length > 0 && p.html.length > 0)).toBe(true)
  })

  it('resolve an alias to its post, flagged as a redirect', async () => {
    const found = await findPost('blog-1', { drafts: false })
    expect(found).toMatchObject({ post: { slug: 'ai-agents' }, redirect: true })
    expect(await findPost('ai-agents', { drafts: false })).toMatchObject({ redirect: false })
    expect(await findPost('nope', { drafts: false })).toBeUndefined()
  })
})

describe('parsePost', () => {
  it('renders the body with heading ids and counts reading time', async () => {
    const parsed = await parsePost('content/posts/x.md', post(meta('x')))
    expect(parsed.html).toContain('<h2 id="section">Section</h2>')
    expect(parsed.headings).toEqual([{ id: 'section', text: 'Section', depth: 2 }])
    expect(parsed.readingMinutes).toBe(1)
  })

  it('drops raw HTML from the source', async () => {
    const parsed = await parsePost('content/posts/x.md', post(meta('x'), 'Hi <script>alert(1)</script> there'))
    expect(parsed.html).not.toContain('<script')
  })

  it('names the file and field when the front matter is invalid', async () => {
    await expect(parsePost('content/posts/x.md', post('slug: "x"\ntitle: "T"'))).rejects.toThrow(/^content\/posts\/x\.md: date: /)
  })

  it('requires the slug to match the file name', async () => {
    await expect(parsePost('content/posts/other.md', post(meta('x')))).rejects.toThrow('slug: must match the file name')
  })
})

describe('loadPosts', () => {
  it('hides drafts unless asked', async () => {
    const dir = await dirWith({ 'a.md': post(meta('a')), 'b.md': post(meta('b', 'draft: true')) })
    expect((await loadPosts({ dir, drafts: false })).map((p) => p.slug)).toEqual(['a'])
    expect((await loadPosts({ dir, drafts: true })).map((p) => p.slug)).toEqual(['a', 'b'])
  })

  it('refuses an alias that another post already uses', async () => {
    const dir = await dirWith({ 'a.md': post(meta('a', 'aliases: ["old"]')), 'b.md': post(meta('b', 'aliases: ["old"]')) })
    await expect(loadPosts({ dir })).rejects.toThrow('"old" is already used by')
  })
})
