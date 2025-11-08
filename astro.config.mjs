import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import expressiveCode from "astro-expressive-code";

export default defineConfig({
  site: "https://tarasyarema.com",
  integrations: [
    expressiveCode({
      theme: "github-light",
      styleOverrides: {
        codeFontSize: "0.875em",
        codepadding: "1.25rem 1.5rem",
      },
    }),
    mdx({
      syntaxHighlight: false,
    }),
    sitemap(),
  ],
  output: "static",
});