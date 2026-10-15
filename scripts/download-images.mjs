#!/usr/bin/env node
// =====================================================================
// Downloads freely licensed photos from Wikimedia Commons into images/
// and writes data/image-credits.json (who took each photo + licence).
//
//   node scripts/download-images.mjs            # fetch anything missing
//   node scripts/download-images.mjs --force    # re-fetch everything
//   node scripts/download-images.mjs drivers    # only one group
//
// Needs Node 18+ (built-in fetch). Sources live in data/image-sources.json.
// Runs automatically via .github/workflows/download-images.yml.
// =====================================================================

import { readFile, writeFile, mkdir, access, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES_FILE = path.join(ROOT, "data/image-sources.json");
const CREDITS_FILE = path.join(ROOT, "data/image-credits.json");

const USER_AGENT = "F1RaceHub/1.0 (https://github.com/ammara-tech/f1-race-hub-2026; image download script)";
const THUMB_WIDTH = 960;
const MIN_WIDTH = 400;
const OK_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

// Groups that hold logos: SVG allowed (downloaded as the original vector),
// small sizes are fine, and Commons searches look for drawings first.
const LOGO_GROUPS = new Set(["logos"]);
const LOGO_MIME = new Set(["image/svg+xml", "image/png", "image/webp"]);

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const ONLY = args.filter(a => !a.startsWith("--"));

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(host, params) {
  const url = new URL(`https://${host}/w/api.php`);
  Object.entries({ format: "json", formatversion: "2", ...params })
    .forEach(([k, v]) => url.searchParams.set(k, v));

  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) { await sleep(2000 * attempt); continue; }
    throw new Error(`${host} HTTP ${res.status}`);
  }
  throw new Error(`${host} kept failing`);
}

const stripHtml = s => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// Look up a Commons file and decide if it is usable.
async function commonsFile(fileName, logo = false) {
  const title = fileName.startsWith("File:") ? fileName : `File:${fileName}`;
  const data = await api("commons.wikimedia.org", {
    action: "query", titles: title, prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata", iiurlwidth: THUMB_WIDTH
  });
  const page = data.query?.pages?.[0];
  if (!page || page.missing) return null; // not on Commons → probably a non-free local file
  return toCandidate(page, logo);
}

function toCandidate(page, logo = false) {
  const info = page.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  if (meta.NonFree?.value === "true" || meta.NonFree?.value === true) return null;
  if (!(logo ? LOGO_MIME : OK_MIME).has(info.mime)) return null;
  if (!logo && info.width < MIN_WIDTH) return null;

  return {
    file: page.title,
    url: logo && info.mime === "image/svg+xml" ? info.url : (info.thumburl || info.url),
    page: info.descriptionurl,
    artist: stripHtml(meta.Artist?.value) || "Unknown",
    license: stripHtml(meta.LicenseShortName?.value) || "See source",
    width: info.width,
    height: info.height
  };
}

async function fromWikipedia(title, logo = false) {
  const data = await api("en.wikipedia.org", {
    action: "query", titles: title, redirects: "1",
    prop: "pageimages", piprop: "name", pilicense: "free"
  });
  const name = data.query?.pages?.[0]?.pageimage;
  return name ? commonsFile(name, logo) : null;
}

async function fromSearch(query, logo = false, match = null) {
  const filters = logo ? ["filetype:drawing", "filetype:bitmap"] : ["filetype:bitmap"];

  for (const filter of filters) {
    const data = await api("commons.wikimedia.org", {
      action: "query", generator: "search", gsrsearch: `${query} ${filter}`,
      gsrnamespace: "6", gsrlimit: "12", prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata", iiurlwidth: THUMB_WIDTH
    });
    const pages = (data.query?.pages || []).sort((a, b) => a.index - b.index);
    for (const page of pages) {
      const c = toCandidate(page, logo);
      // optional "match": the file name must contain this (regex, case-insensitive)
      if (c && (!match || new RegExp(match, "i").test(c.file))) return c;
    }
  }
  return null;
}

async function resolve(item, logo = false) {
  const sources = [...item.sources, { search: logo ? `${item.label} logo` : item.label }];
  for (const src of sources) {
    try {
      const c = src.file ? await commonsFile(src.file, logo)
        : src.wiki ? await fromWikipedia(src.wiki, logo)
        : src.search ? await fromSearch(src.search, logo, item.match)
        : null;
      if (c) return { ...c, via: JSON.stringify(src) };
    } catch (err) {
      console.warn(`   ! ${JSON.stringify(src)}: ${err.message}`);
    }
    await sleep(250);
  }
  return null;
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function download(url, dest) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) {
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
      return;
    }
    await sleep(2000 * attempt);
  }
  throw new Error(`download failed: ${url}`);
}

async function main() {
  const sources = JSON.parse(await readFile(SOURCES_FILE, "utf8"));
  const credits = (await exists(CREDITS_FILE))
    ? JSON.parse(await readFile(CREDITS_FILE, "utf8"))
    : {};

  const groups = Object.keys(sources).filter(k => !k.startsWith("_"))
    .filter(k => !ONLY.length || ONLY.includes(k));

  const missing = [];

  for (const group of groups) {
    console.log(`\n== ${group} ==`);
    credits[group] ||= {};
    await mkdir(path.join(ROOT, "images", group), { recursive: true });

    for (const item of sources[group]) {
      const existing = credits[group][item.slug];
      if (!FORCE && existing && await exists(path.join(ROOT, existing.src))) {
        console.log(`   = ${item.slug} (already have it)`);
        continue;
      }

      const found = await resolve(item, LOGO_GROUPS.has(group));
      if (!found) {
        console.log(`   x ${item.slug}: no free image found`);
        missing.push(`${group}/${item.slug}`);
        continue;
      }

      const ext = (path.extname(new URL(found.url).pathname) || ".jpg").toLowerCase().replace(".jpeg", ".jpg");
      const rel = `images/${group}/${item.slug}${ext}`;

      if (existing?.src && existing.src !== rel && await exists(path.join(ROOT, existing.src))) {
        await unlink(path.join(ROOT, existing.src));
      }

      await download(found.url, path.join(ROOT, rel));
      credits[group][item.slug] = {
        src: rel,
        label: item.label,
        title: found.file.replace(/^File:/, ""),
        artist: found.artist,
        license: found.license,
        page: found.page
      };
      console.log(`   + ${item.slug} ← ${found.file}  [${found.license}]  via ${found.via}`);
      await sleep(400);
    }
  }

  await writeFile(CREDITS_FILE, JSON.stringify(credits, null, 2) + "\n");
  console.log(`\nSaved credits to data/image-credits.json`);
  if (missing.length) console.log(`No image for: ${missing.join(", ")} (the site shows a placeholder)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
