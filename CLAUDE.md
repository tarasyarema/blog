# blog

Taras's personal blog (tarasyarema.com). Astro 7 + MDX, pnpm, deployed by Vercel on every push to `main`.

- `pnpm dev`: local server on http://localhost:4321 (runs as a daemon, stop it with `pnpm astro dev stop`).
- `pnpm build`: production build into `dist/` (delete `dist/` after a local check).
- Posts live in `src/content/blog/*.mdx`. Post images live in `src/img/<post>/`. Social preview images live in `public/img/<post>/`.

<important if="you add, change or remove an external link in a post (src/content/blog) or on the about page (src/pages/about.astro)">

Run `pnpm link-previews` and commit `public/link-previews.json` with the change. The desktop hover preview on links reads this file. A link that is not in the file shows no preview.

- The script fetches only links that have no preview yet. Use `pnpm link-previews --refresh` to fetch every link again.
- The script removes previews for links that are no longer in any post.
- A dead link gets an empty entry and shows no preview. The script prints it as `fail`.
</important>

<important if="you write or edit a post in src/content/blog">

Use the shared MDX components. Import each one at the top of the post.

- `BlogImage` for figures. Figures get automatic "FIG. N" numbers in page order. Do not write "Figure N." in the caption.
- `Hero` for the header image of a post (framed, click to zoom).
- `Statement` for definitions, lemmas, theorems, conjectures, axioms, properties and examples. `Proof` for proofs. Put the text on the same line as the tags, or MDX wraps it in a paragraph.
- `Ref` for a mention of a statement, for example `<Ref to="lemma-1">P-bounded Decisions lemma</Ref>`. The id is the kind in lower case, a hyphen and the number.
- `SwarmBanner` for the agent-swarm callout. Posts tagged `agent-swarm` get it automatically at the end. Place `<SwarmBanner />` in the post to put it somewhere else (the automatic one is then skipped).
- Set `image:` in the frontmatter (a path under `public/`, 1200x628) to show a thumbnail in the post lists and to set the social preview image.
</important>

<important if="you change how the post list looks (src/pages/index.astro or src/pages/tags/[tag].astro)">

Both pages render posts with `src/components/PostCard.astro`. The home page search also renders the same card markup in its inline script. Keep the two in sync.
</important>
