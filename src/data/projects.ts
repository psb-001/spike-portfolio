/**
 * Project data access.
 *
 * The projects themselves live in `src/config/site.ts` (the single source of
 * truth for editable content). This module only exposes them in the shape the
 * components want, so there is never a second list to keep in sync.
 */
import { siteConfig, type Project } from "../config/site";

export type { Project };

/** Projects flagged `featured` (all of them, unless one opts out). */
export const projects: readonly Project[] = siteConfig.projects.filter(
  (project) => project.featured !== false,
);

/** Sponsors nothing here, but handy if projects ever gain a "hidden" flag. */
export const allProjects: readonly Project[] = siteConfig.projects;

/** Look up a project by name (case-insensitive). */
export function findProject(name: string): Project | undefined {
  return projects.find((project) => project.name.toLowerCase() === name.toLowerCase());
}