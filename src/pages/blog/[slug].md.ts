import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { body: post.body, data: post.data },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { body, data } = props as {
    body: string;
    data: { title: string; subtitle: string; date: Date; tags: string[] };
  };

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(data.title)}`,
    `subtitle: ${JSON.stringify(data.subtitle)}`,
    `date: ${data.date.toISOString()}`,
    `tags: ${JSON.stringify(data.tags)}`,
    "---",
    "",
    "",
  ].join("\n");

  return new Response(frontmatter + body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept",
    },
  });
};
