# blog

Vishal Biyani's writing, for **blog.biyani.xyz**. It was split out of the portfolio
([vishal-portfolio](https://github.com/biyani701/vishal-portfolio), bead `vishal-portfolio-9cm.16`), which links
here from its Work section.

## Architecture

- **Next.js 16** (App Router), deployed to **Vercel**. Every page is prerendered at build time.
- **Posts are Markdown files** in `content/posts/<slug>.md` with YAML front matter, validated by zod
  (`src/lib/posts.ts`). A bad post fails the build with the file and field in the message.
- **Markdown pipeline** (`src/lib/markdown.ts`, from the portfolio): GFM, sanitised HTML (raw HTML in a post is
  dropped), heading ids for the "On this page" list, and Shiki highlighting through CSS variables.
- **Routes:** `/` lists posts, `/posts/<slug>` shows one, and `/feed.xml` is RSS. An old portfolio id in
  `aliases` (for example `blog-1`) redirects permanently to the post.

## Writing and publishing

```yaml
---
slug: "my-post"            # must match the file name
title: "My post"
date: "2026-10-02"         # YYYY-MM-DD
topics: ["Payments"]
summary: "One sentence for the list, the feed and search results."
aliases: []                # old ids that should redirect here
draft: true                # shown by `pnpm dev` only
---
```

Publishing is a merge to `main`: remove `draft: true`, and Vercel deploys the post. An in-browser editor with
drafts and sign-in is in the backlog (`bd ready`).

## Development

```bash
pnpm install
pnpm dev         # http://localhost:3000, drafts visible
pnpm test        # vitest: post loading, validation, rendering
pnpm typecheck
pnpm lint
pnpm build
```

## Deploy (not set up yet)

1. Vercel → **Add New → Project** → import `biyani701/blog` (framework Next.js, no settings needed).
2. Set `SITE_URL=https://blog.biyani.xyz` for Production.
3. Add the domain `blog.biyani.xyz` in the project, then in Namecheap add `CNAME blog → cname.vercel-dns.com.`

## Licence

The code is under the MIT License ([LICENSE](LICENSE)). The posts in `content/posts` are © Vishal Biyani, all
rights reserved.
