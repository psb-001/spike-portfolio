/**
 * ============================================================================
 * SITE CONFIG - THE SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 * Everything the captain can edit lives here. Components read from this file
 * and never hardcode copy, links, projects or numbers.
 *
 * To update the site (bio, projects, socials, "now watching"), edit THIS file
 * only. No component code needs to change.
 */

export interface SocialLink {
  /** Slug used to pick an icon from `Icon.astro`. */
  readonly network: "github" | "linkedin" | "instagram" | "email" | "link";
  /** Visible label in the sidebar / footer. */
  readonly label: string;
  /** Absolute URL. */
  readonly url: string;
  /** Optional username shown next to the icon. */
  readonly handle?: string;
}

export interface Project {
  readonly name: string;
  readonly description: string;
  readonly tech: readonly string[];
  readonly url: string;
  readonly stars?: number;
  /** Set false to keep a project in the repo but hide it from /projects. */
  readonly featured?: boolean;
}

export interface EducationEntry {
  readonly degree: string;
  readonly institution: string;
  readonly period: string;
  readonly detail?: string;
}

export interface ExperienceEntry {
  readonly role: string;
  readonly organisation: string;
  readonly period: string;
  readonly detail: string;
}

export const siteConfig = {
  /** Shown in the masthead, the sidebar and the footer. */
  name: "Prathamesh Bhujbal",
  aka: ["Spike", "Pratham"],
  title: "Computer Engineering Student",
  /** One-line summary used for <title> suffixes and meta descriptions. */
  tagline: "Computer engineering student, movie nerd and open source builder.",
  bio:
    "Computer engineering student, movie nerd, and open source builder. Currently studying at MES Mukundadaslohya College of Engineering and serving as Software Head at the CDC Club. I love building things that make life a little more beautiful.",
  /** Shown under the name in the sidebar. */
  location: "Pune, India",
  college: "MES Mukundadaslohya College of Engineering",
  role: "Software Head, CDC Club",
  internship: "DRDODIAT (details coming soon)",
  avatar: "/profile.jpg",

  social: [
    {
      network: "github",
      label: "GitHub",
      handle: "psb-001",
      url: "https://github.com/psb-001",
    },
    {
      network: "linkedin",
      label: "LinkedIn",
      handle: "prathamesh-bhujbal-psb",
      url: "https://www.linkedin.com/in/prathamesh-bhujbal-psb",
    },
    {
      network: "instagram",
      label: "Instagram",
      handle: "spike._001",
      url: "https://www.instagram.com/spike._001/",
    },
  ] as SocialLink[],

  /**
   * "Now watching" - change `tmdbId` and `type` and rebuild. The poster is
   * fetched at build time by `scripts/fetch-movie.mjs`; the API key lives in
   * the TMDB_API_KEY environment variable and never reaches the browser.
   *
   * tmdbId 1399 = Game of Thrones (tv).
   */
  currentlyWatching: {
    tmdbId: 1399,
    type: "tv" as "movie" | "tv",
  },

  /**
   * Masthead navigation (the site name in the masthead is already a link home).
   * Edit freely - paths are relative to the site root.
   */
  nav: [
    { title: "Projects", url: "/projects" },
    { title: "About", url: "/about" },
  ],

  education: [
    {
      degree: "B.E. Computer Engineering",
      institution: "MES Mukundadaslohya College of Engineering",
      period: "2024 - Present",
      detail: "Second year undergraduate.",
    },
    {
      degree: "Secondary / Higher Secondary",
      institution: "Maharashtra State Board",
      period: "Completed",
      detail: "Science stream.",
    },
  ] as EducationEntry[],

  experience: [
    {
      role: "Software Head",
      organisation: "CDC Club - Career Development Cell",
      period: "Present",
      detail:
        "Lead the club's software work: maintaining the club's web platform and tooling, and helping run technical events and workshops for students.",
    },
    {
      role: "Intern",
      organisation: "DRDODIAT",
      period: "Present",
      detail: "Details coming soon.",
    },
  ] as ExperienceEntry[],

  skills: {
    languages: ["TypeScript", "JavaScript", "Svelte", "Python", "Kotlin", "HTML", "CSS"],
    frameworks: ["Astro", "Electron", "React", "Node.js"],
    tools: ["Git", "GitHub Actions", "Vite", "npm"],
    interests: ["Film & series", "Open source", "Productivity tooling", "UI polish"],
  },

  /** Shown in the sidebar widget and the home page. */
  nowWatchingHeading: "Now watching",

  projects: [
    {
      name: "minimaldoro",
      description:
        "Elegant desktop countdown timer & event tracker for Windows. Pin widgets to your desktop, get reminders, and never miss what matters.",
      tech: ["Svelte", "Electron", "TypeScript"],
      url: "https://github.com/psb-001/minimaldoro",
      stars: 0,
    },
    {
      name: "cinephile",
      description:
        "Local, open-source watch tracker for cinephiles: one commit per watched movie and per episode, plus a 3D blu-ray cupboard for your collection.",
      tech: ["TypeScript", "Node.js", "SQLite"],
      url: "https://github.com/psb-001/cinephile",
      stars: 0,
    },
    {
      name: "Manga-Counselor",
      description:
        "A web app that helps you find what to read next - browse, track and get recommendations from your own library.",
      tech: ["TypeScript", "Web"],
      url: "https://github.com/psb-001/Manga-Counselor",
      stars: 0,
    },
    {
      name: "DEVWRAP",
      description:
        "A developer portfolio wrapper: pull a year of GitHub activity and present it as a clean, shareable developer profile.",
      tech: ["TypeScript"],
      url: "https://github.com/psb-001/DEVWRAP",
      stars: 0,
    },
    {
      name: "paperadda",
      description: "A Kotlin project - a small, self-hosted place to keep and search your own documents.",
      tech: ["Kotlin"],
      url: "https://github.com/psb-001/paperadda",
      stars: 0,
    },
    {
      name: "iTantra-evidence",
      description:
        "Evidence for SIH26173: accuracy, noise, speech output and on-device measurements for iTantra.",
      tech: ["Python", "Speech", "On-device ML"],
      url: "https://github.com/psb-001/iTantra-evidence",
      stars: 0,
    },
    {
      name: "Experiment-Generator",
      description:
        "Generates ready-to-run experiment setups - a small tool for turning an idea into something you can measure.",
      tech: ["JavaScript"],
      url: "https://github.com/psb-001/Experiment-Generator",
      stars: 0,
    },
  ] as Project[],
} as const;

export type SiteConfig = typeof siteConfig;