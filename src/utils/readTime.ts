const WORDS_PER_MINUTE = 220;

export function readTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/import\s+[^;\n]+from\s+['"][^'"]+['"];?/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~`-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function readTimeLabel(body: string | undefined): string {
  const minutes = readTime(body);
  return `${minutes} min read`;
}
