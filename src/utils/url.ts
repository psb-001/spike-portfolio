/**
 * Base-path aware URL helper.
 *
 * The site is served from a sub-path on GitHub Pages
 * (https://psb-001.github.io/spike-portfolio/), so every internal link has to
 * carry the `base` prefix Astro was configured with. `url("/projects")` is the
 * only way links should be written in components.
 */

/** Returns the `base` prefix without a trailing slash ("" when deployed at root). */
function base(): string {
  const raw = import.meta.env.BASE_URL ?? "/";
  return raw.replace(/\/+$/, "");
}

/** Build a site-root-relative URL that respects Astro's `base` config. */
export function url(path: string): string {
  const prefix = base();
  if (!path || path === "/") return `${prefix}/` || "/";
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${prefix}${suffix}`;
}