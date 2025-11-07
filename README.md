# taras

A minimal blog built with [Astro](https://astro.build).

## Features

- Static site generation
- MDX support for blog posts
- Tag-based categorization
- RSS feed
- Privacy-friendly analytics with Plausible
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

### Build

```bash
pnpm build
```

## Writing Posts

Create new posts in `src/content/blog/` with `.mdx` extension:

```mdx
---
title: Post Title
subtitle: Optional subtitle
date: 2025-11-08
tags: [tag1, tag2]
---

# Your content here
```

## Deployment

The site is static and can be deployed to any static hosting (Vercel, Netlify, GitHub Pages, etc.).

## License

MIT
