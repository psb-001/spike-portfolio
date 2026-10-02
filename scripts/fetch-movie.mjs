#!/usr/bin/env node
/**
 * Fetch the "now watching" poster from TMDB and write `src/data/now-watching.json`.
 *
 * - Reads the TMDB id + type from `src/config/site.ts` (the single source of
 *   truth the captain edits).
 * - Reads the API key from the `TMDB_API_KEY` environment variable. The key is
 *   NEVER written to the repository or to the generated data - it only exists in
 *   the build process.
 * - Supports both a TMDB v3 API key and a v4 read access token.
 * - Downloads the poster into `public/posters/` so the deployed site does not
 *   hot-link TMDB (and works even if TMDB rate-limits later).
 *
 * The script is intentionally forgiving: a missing key or a failed request keeps
 * the previously generated data (or the committed placeholder) so the site can
 * always be built.
 *
 * Usage:  node scripts/fetch-movie.mjs [--force]
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_FILE = path.join(ROOT, "src", "config", "site.ts");
const OUTPUT_FILE = path.join(ROOT, "src", "data", "now-watching.json");
const POSTER_DIR = path.join(ROOT, "public", "posters");
const POSTER_FILE = path.join(POSTER_DIR, "now-watching.jpg");
const API_BASE = "https://api.themoviedb.org/3";

/** Re-fetch at most once per this window, so `prebuild` + CI step don't double up. */
const CACHE_TTL_MS = 30 * 60 * 1000;

const force = process.argv.includes("--force") || process.env.TMDB_FORCE === "1";

const log = (message) => console.log(`[now-watching] ${message}`);
const warn = (message) => console.warn(`[now-watching] WARN ${message}`);

/**
 * Pull `currentlyWatching` out of site.ts.
 *
 * The config is TypeScript, so it cannot be imported directly on every Node
 * version this runs on. A narrow regex keeps the script dependency-free; the
 * shapes below are validated explicitly so a config change surfaces as an error
 * instead of a silently wrong build.
 */
async function readWatchingConfig() {
  const source = await readFile(CONFIG_FILE, "utf8");
  const block = source.match(/currentlyWatching\s*:\s*\{([\s\S]*?)\}/);

  if (!block) {
    throw new Error(`No "currentlyWatching" block found in ${path.relative(ROOT, CONFIG_FILE)}`);
  }

  const tmdbId = block[1].match(/tmdbId\s*:\s*(\d+)/)?.[1];
  const type = block[1].match(/type\s*:\s*["'](movie|tv)["']/)?.[1];

  if (!tmdbId) {
    throw new Error(
      `No numeric "tmdbId" found in the currentlyWatching block of ${path.relative(ROOT, CONFIG_FILE)}`,
    );
  }
  if (!type) {
    throw new Error(
      `No "type" ("movie" or "tv") found in the currentlyWatching block of ${path.relative(ROOT, CONFIG_FILE)}`,
    );
  }

  return { tmdbId: Number(tmdbId), type };
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT_FILE, "utf8"));
  } catch {
    return null;
  }
}

/** True when the committed data already matches the config and is fresh enough. */
function isFresh(existing, { tmdbId, type }) {
  if (force || !existing || existing.status !== "ok") return false;
  if (existing.id !== tmdbId || existing.type !== type) return false;
  if (!existing.poster && !existing.posterUrl) return false;
  if (!existing.fetchedAt) return false;
  return Date.now() - Date.parse(existing.fetchedAt) < CACHE_TTL_MS;
}

async function tmdbFetch(pathname, searchParams, apiKey) {
  const url = new URL(`${API_BASE}/${pathname}`);
  for (const [key, value] of Object.entries(searchParams)) url.searchParams.set(key, value);

  // v4 read access tokens are JWTs and go in the Authorization header; v3 API
  // keys travel as a query parameter.
  const useBearer = apiKey.startsWith("eyJ");
  if (!useBearer) url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      ...(useBearer ? { authorization: `Bearer ${apiKey}` } : {}),
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`TMDB responded ${response.status} ${response.statusText}${detail ? ` - ${detail.slice(0, 200)}` : ""}`);
  }

  return response.json();
}

function summarise(data, type) {
  const title = data.title || data.name || "Untitled";
  const release =
    type === "tv" ? data.first_air_date : data.release_date || data.first_air_date || "";
  const year = release ? Number(String(release).slice(0, 4)) : null;

  return {
    id: data.id,
    type,
    title,
    tagline: data.tagline || null,
    overview: data.overview || null,
    poster: null, // filled in after the download step
    posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : null,
    year: Number.isFinite(year) ? year : null,
    rating: typeof data.vote_average === "number" ? data.vote_average : null,
    genres: Array.isArray(data.genres) ? data.genres.map((genre) => genre.name) : [],
    tmdbUrl: `https://www.themoviedb.org/${type}/${data.id}`,
    fetchedAt: new Date().toISOString(),
    status: "ok",
    error: null,
  };
}

/** Cache the poster next to the site so pages never depend on TMDB being up. */
async function downloadPoster(entry) {
  if (!entry.posterUrl) return entry;

  const response = await fetch(entry.posterUrl, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    warn(`Could not download the poster (${response.status}); the site will hot-link TMDB.`);
    return entry;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(POSTER_DIR, { recursive: true });
  await writeFile(POSTER_FILE, bytes);
  return { ...entry, poster: "/posters/now-watching.jpg" };
}

async function main() {
  const { tmdbId, type } = await readWatchingConfig();
  log(`Config: ${type} ${tmdbId}`);

  const existing = await readExisting();

  if (isFresh(existing, { tmdbId, type })) {
    log(`Reusing freshly fetched data for "${existing.title}" (use --force to refresh).`);
    return;
  }

  const apiKey = (process.env.TMDB_API_KEY ?? "").trim();
  if (!apiKey) {
    warn("TMDB_API_KEY is not set - keeping the existing now-watching data.");
    warn("Copy .env.example to .env and add your key to fetch the real poster.");
    if (!existsSync(OUTPUT_FILE)) {
      // Nothing to keep: still let the build succeed, the widget renders its
      // placeholder state without a data file only if one is imported.
      throw new Error(`Neither TMDB_API_KEY nor ${path.relative(ROOT, OUTPUT_FILE)} is available.`);
    }
    return;
  }

  let entry;
  try {
    const data = await tmdbFetch(`${type}/${tmdbId}`, { language: "en-US" }, apiKey);
    entry = await downloadPoster(summarise(data, type));
  } catch (error) {
    // A bad key or a flaky network must not take the whole site down.
    warn(`${error.message} - keeping the existing now-watching data.`);
    return;
  }

  await writeFile(OUTPUT_FILE, `${JSON.stringify(entry, null, 2)}\n`, "utf8");

  log(
    `Saved "${entry.title}"${entry.year ? ` (${entry.year})` : ""} to ${path.relative(ROOT, OUTPUT_FILE)}` +
      (entry.poster ? ` (poster cached)` : ` (no poster for this title)`),
  );
}

main().catch((error) => {
  console.error(`[now-watching] ERROR ${error.message}`);
  process.exitCode = 1;
});