// Collects Open Graph previews for every external link in the posts and the about page.
// Writes public/link-previews.json, which the desktop hover popover loads on first use.
//
//   pnpm link-previews            fetch only links that have no preview yet
//   pnpm link-previews --refresh  fetch every link again
//
// Run it after adding or changing links, then commit the JSON.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "public/link-previews.json");
const SOURCES = [
  ...readdirSync(join(ROOT, "src/content/blog"))
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => join(ROOT, "src/content/blog", f)),
  join(ROOT, "src/pages/about.astro"),
];
const refresh = process.argv.includes("--refresh");

const urls = new Set();
for (const file of SOURCES) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)|href="(https?:\/\/[^"]+)"/g)) {
    urls.add(m[1] || m[2]);
  }
}

const previews = existsSync(OUT) && !refresh ? JSON.parse(readFileSync(OUT, "utf8")) : {};

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ")
    .trim();

function meta(html, keys) {
  for (const key of keys) {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i"),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m && m[1].trim()) return decode(m[1]);
    }
  }
  return null;
}

async function fetchPreview(url) {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; link-preview-bot/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !type.includes("html")) throw new Error(`${res.status} ${type}`);
  const html = (await res.text()).slice(0, 500_000);
  const title = meta(html, ["og:title", "twitter:title"]) || decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || "");
  const description = meta(html, ["og:description", "twitter:description", "description"]);
  let image = meta(html, ["og:image", "og:image:url", "twitter:image", "twitter:image:src"]);
  if (image) image = new URL(image, res.url).href;
  const siteName = meta(html, ["og:site_name", "application-name"]);
  return {
    title: title || null,
    description: description ? description.slice(0, 300) : null,
    image: image && image.startsWith("https://") ? image : null,
    siteName,
  };
}

let fetched = 0;
let failed = 0;
for (const url of [...urls].sort()) {
  if (previews[url] && !refresh) continue;
  try {
    previews[url] = await fetchPreview(url);
    fetched += 1;
    console.log(`ok    ${url}`);
  } catch (error) {
    // Keep a stub so the popover still shows the site name and host.
    previews[url] = { title: null, description: null, image: null, siteName: null };
    failed += 1;
    console.log(`fail  ${url} (${error.message})`);
  }
}

// Drop previews for links that no longer exist in any source.
for (const url of Object.keys(previews)) if (!urls.has(url)) delete previews[url];

const sorted = Object.fromEntries(Object.entries(previews).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\n${urls.size} links, ${fetched} fetched, ${failed} failed -> public/link-previews.json`);
