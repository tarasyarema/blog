import { next, rewrite } from "@vercel/edge";

export const config = {
  matcher: "/blog/:slug*",
};

const PRODUCES = ["text/html", "text/markdown"] as const;

type AcceptEntry = { type: string; q: number; specificity: number };

function parseAccept(header: string): AcceptEntry[] {
  return header.split(",").map((raw) => {
    const parts = raw.trim().split(";").map((s) => s.trim());
    const type = parts[0].toLowerCase();
    let q = 1;
    for (const param of parts.slice(1)) {
      const [name, value] = param.split("=").map((s) => s.trim());
      if (name === "q") {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
      }
    }
    const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
    return { type, q, specificity };
  });
}

function matches(entry: AcceptEntry, candidate: string): boolean {
  if (entry.type === "*/*") return true;
  if (entry.type.endsWith("/*")) return candidate.startsWith(entry.type.slice(0, -1));
  return entry.type === candidate;
}

function preferredType(header: string | null): string | null {
  if (!header) return PRODUCES[0];
  const entries = parseAccept(header);
  if (entries.length === 0) return PRODUCES[0];

  let best: string | null = null;
  let bestQ = -1;
  let bestPosition = Infinity;

  for (const candidate of PRODUCES) {
    // RFC 9110 §12.5.1: most specific matching range wins, regardless of q,
    // so `text/html;q=0, */*;q=1` correctly rejects text/html.
    let matched: AcceptEntry | null = null;
    let matchedPosition = Infinity;
    for (let idx = 0; idx < entries.length; idx++) {
      const e = entries[idx];
      if (!matches(e, candidate)) continue;
      if (
        matched === null ||
        e.specificity > matched.specificity ||
        (e.specificity === matched.specificity && idx < matchedPosition)
      ) {
        matched = e;
        matchedPosition = idx;
      }
    }
    if (matched === null) continue;
    if (matched.q <= 0) continue;

    if (matched.q > bestQ || (matched.q === bestQ && matchedPosition < bestPosition)) {
      bestQ = matched.q;
      bestPosition = matchedPosition;
      best = candidate;
    }
  }

  return best;
}

function appendVaryAccept(headers: Headers): void {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", "Accept");
    return;
  }
  const tokens = existing.split(",").map((s) => s.trim().toLowerCase());
  if (!tokens.includes("accept")) {
    headers.set("Vary", `${existing}, Accept`);
  }
}

export default function middleware(request: Request): Response {
  const url = new URL(request.url);

  // Only negotiate canonical blog post URLs. Skip the .md variants
  // (so direct `/blog/foo.md` fetches pass through untouched) and any
  // non-/blog routes that slip past the matcher.
  const pathname = url.pathname.replace(/\/$/, "");
  const isBlogPost =
    pathname.startsWith("/blog/") &&
    pathname.slice("/blog/".length).length > 0 &&
    !pathname.endsWith(".md");

  if (!isBlogPost) {
    const passthrough = next();
    appendVaryAccept(passthrough.headers);
    return passthrough;
  }

  const chosen = preferredType(request.headers.get("accept"));

  const response =
    chosen === "text/markdown"
      ? rewrite(new URL(`${pathname}.md${url.search}`, url))
      : next();

  appendVaryAccept(response.headers);
  return response;
}
