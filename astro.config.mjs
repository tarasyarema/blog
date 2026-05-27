import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import expressiveCode from "astro-expressive-code";

export default defineConfig({
  site: "https://www.tarasyarema.com",
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      styleOverrides: {
        codeFontSize: "0.875em",
        codePaddingBlock: "1.25rem",
        codePaddingInline: "1.5rem",
        borderRadius: "2px",
      },
    }),
    mdx({
      syntaxHighlight: false,
    }),
    sitemap(),
  ],
  output: "static",
});