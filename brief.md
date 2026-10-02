# Task: Build Astro Portfolio Website

## Captain's intent

Build a personal portfolio website for Prathamesh Bhujbal (aka Spike / Pratham) using the Astro framework. The site must replicate the exact look and feel of the Academic Pages Jekyll theme (same colors, fonts, layout, sidebar, responsive behavior). The site must be admin-editable — the captain should be able to change text, projects, social links, and other content from a single config file without touching component code.

The captain is a computer engineering student (2nd year at MES Mukundadaslohya College of Engineering), a movie nerd, Software Head at the CDC club (Career Development Cell) at his college, and currently doing an internship at DRDODIAT (details TBD — use a placeholder).

The site must include a "Now Watching" section that shows a small movie/series poster fetched from the TMDB API. The TMDB API key must be stored in an environment variable (not visible in frontend code). The captain will manually set what he's watching by changing a TMDB ID in the config.

Deploy the site to GitHub Pages. Push the code to `https://github.com/psb-001/spike-portfolio`.

## Firstmate spec

### Tech Stack
- **Astro** (latest version) with TypeScript
- **CSS** (no framework — hand-written to match Academic Pages exactly)
- **Node.js** for build tooling
- **GitHub Actions** for CI/CD deployment to GitHub Pages

### Design Requirements — Replicate Academic Pages Exactly

**Color Scheme (from Academic Pages `_sass/theme/_air_light.scss`):**
```css
--global-base-color: #0092ca;          /* Primary blue */
--global-bg-color: #eeeeee;            /* Light gray background */
--global-footer-bg-color: #0092ca;     /* Footer blue */
--global-border-color: #0092ca;        /* Border blue */
--global-text-color: #222831;          /* Dark text */
--global-link-color: #393e46;          /* Link color */
--global-link-color-hover: #1a1d23;    /* Link hover */
--global-text-color-light: #0092ca;    /* Light text */
--global-code-background-color: #fafafa;
--global-code-text-color: #005c7a;
```

**Typography:**
```css
font-family: -apple-system, ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", Arial, sans-serif;
```

**Layout:**
- Fixed sidebar on the left (on desktop, ≥1024px) with:
  - Circular author avatar (175px max, 50% border-radius)
  - Author name
  - Author bio
  - Social media links (LinkedIn, GitHub, Instagram)
- Main content area on the right
- Top navigation bar with site title
- Responsive: sidebar collapses to top on mobile (<1024px)
- Border radius: 4px
- Box shadow: 0 1px 1px rgba(0, 0, 0, 0.125)

**Pages:**
1. **Home/About** (`/`) — Bio, currently watching, quick intro
2. **Projects** (`/projects`) — Grid of project cards with name, description, tech, link
3. **About** (`/about`) — Detailed about page with education, experience, skills

### Admin-Editable Config

Create `src/config/site.ts` as the single source of truth for all editable content:

```typescript
export const siteConfig = {
  name: "Prathamesh Bhujbal",
  aka: ["Spike", "Pratham"],
  title: "Computer Engineering Student",
  bio: "...",
  college: "MES Mukundadaslohya College of Engineering",
  role: "Software Head, CDC Club",
  internship: "DRDODIAT (details coming soon)",
  avatar: "/profile.jpg",
  social: {
    linkedin: "https://www.linkedin.com/in/prathamesh-bhujbal-psb",
    github: "https://github.com/psb-001",
    instagram: "https://www.instagram.com/spike._001/",
  },
  currentlyWatching: {
    tmdbId: 1399,        // Captain changes this
    type: "tv",          // "movie" or "tv"
  },
  projects: [
    {
      name: "minimaldoro",
      description: "Elegant desktop countdown timer & event tracker for Windows...",
      tech: ["Svelte", "Electron", "TypeScript"],
      url: "https://github.com/psb-001/minimaldoro",
      stars: 0,
    },
    // ... more projects
  ],
};
```

### TMDB Integration

1. Create `.env.example` with `TMDB_API_KEY=your_key_here`
2. Create `scripts/fetch-movie.mjs` that:
   - Reads `TMDB_API_KEY` from environment
   - Reads the TMDB ID and type from `src/config/site.ts`
   - Fetches movie/series data from TMDB API
   - Generates `src/data/now-watching.json` with title, poster URL, etc.
3. Create `src/components/NowWatching.astro` that:
   - Reads from `src/data/now-watching.json`
   - Displays a small poster image with the title
   - Takes minimal space (sidebar widget or small section)
4. The build script runs before Astro build to fetch fresh data

### GitHub Actions Deployment

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: node scripts/fetch-movie.mjs
        env:
          TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Profile Photo
- Copy `/Users/prathameshbhujbal/portfolio/pratameshbhujbal.jpeg` to `public/profile.jpg`

### Project Structure
```
projects/spike-portfolio/
├── src/
│   ├── config/
│   │   └── site.ts
│   ├── components/
│   │   ├── Sidebar.astro
│   │   ├── Nav.astro
│   │   ├── ProjectCard.astro
│   │   ├── NowWatching.astro
│   │   └── Icon.astro
│   ├── layouts/
│   │   └── Base.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── projects.astro
│   │   └── about.astro
│   ├── styles/
│   │   └── global.css
│   └── data/
│       └── projects.ts
├── public/
│   └── profile.jpg
├── scripts/
│   └── fetch-movie.mjs
├── .env.example
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .gitignore
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

### Content to Include

**Bio:** "Computer engineering student, movie nerd, and open source builder. Currently studying at MES Mukundadaslohya College of Engineering and serving as Software Head at the CDC Club. I love building things that make life a little more beautiful."

**Projects to feature:**
1. minimaldoro — Svelte desktop countdown timer
2. cinephile — Open-source watch tracker for cinephiles
3. Other notable public repos from GitHub

**Social links:**
- LinkedIn: https://www.linkedin.com/in/prathamesh-bhujbal-psb
- GitHub: https://github.com/psb-001
- Instagram: https://www.instagram.com/spike._001/

### Delivery
- Create GitHub repo: `https://github.com/psb-001/spike-portfolio` (public)
- Push code to `main` branch
- Enable GitHub Pages (source: `gh-pages` branch or GitHub Actions)
- Site should be live at `https://psb-001.github.io/spike-portfolio/`

### Important Notes
- Do NOT ask the captain any questions — build everything with the provided content
- Use placeholder content for anything not specified (e.g., internship details)
- The site must be fully responsive (mobile + desktop)
- The design must match Academic Pages exactly — same colors, fonts, spacing, layout
- The config file must be the single source of truth for all editable content
- The TMDB API key must never be exposed in frontend code
