import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: any) {
  const blog = await getCollection("blog");
  const sortedBlog = blog.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: "Blog",
    description: "A minimal blog about software, writing, and ideas",
    site: context.site,
    items: sortedBlog.map((post) => ({
      title: post.data.title,
      description: post.data.subtitle,
      pubDate: post.data.date,
      link: `/blog/${post.slug}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
