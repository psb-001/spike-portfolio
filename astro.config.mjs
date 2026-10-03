import { defineConfig } from "astro/config";

// The site is served from https://psb-001.github.io/spike-portfolio/, so every
// asset and link is prefixed with `/spike-portfolio`. Override BASE_PATH when
// previewing at the domain root (BASE_PATH=/ npm run build).
const base = process.env.BASE_PATH ?? "/spike-portfolio";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://psb-001.github.io",
  base,
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  devToolbar: {
    enabled: false,
  },
});