import { getCollection } from "astro:content";
import { SITE_CONFIG } from "../config/site.config";

export async function GET() {
  const pages = await getCollection("pages", ({ id, data }) => id !== "example" && !data.noindex);
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  const urls = [
    { loc: "/", lastmod: new Date() },
    { loc: "/blog/", lastmod: new Date() },
    { loc: "/calculadora/", lastmod: new Date() },
    { loc: "/quiz/", lastmod: new Date() },
    { loc: "/raio-x-site/", lastmod: new Date() },
    ...pages.map((page) => ({
      loc: `/${page.id}/`,
      lastmod: page.data.publishedAt ?? new Date(),
    })),
    ...posts.map((post) => ({
      loc: `/blog/${post.id}/`,
      lastmod: post.data.updatedAt ?? post.data.publishedAt,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${new URL(url.loc, SITE_CONFIG.url).toString()}</loc>
    <lastmod>${new Date(url.lastmod).toISOString().slice(0, 10)}</lastmod>
  </url>`).join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
