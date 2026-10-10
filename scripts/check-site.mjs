#!/usr/bin/env node
/**
 * Checks dist/ after a build: every internal link, image, script and stylesheet resolves to a file,
 * every #anchor exists, each page has one h1, a title and a description, images have alt text,
 * and no em dash appears in page text.
 *
 *   node scripts/check-site.mjs        (run `node build.mjs` first, or use `npm run check`)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SITE_URL = (process.env.SITE_URL || "").replace(/\/+$/, "");
const BASE = (() => { let b = process.env.SITE_BASE || "/"; if (!b.startsWith("/")) b = "/" + b; return b.endsWith("/") ? b : b + "/"; })();
if (!fs.existsSync(DIST)) { console.error("dist/ not found. Run `node build.mjs` first."); process.exit(1); }

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(DIST);
const pages = files.filter((f) => f.endsWith(".html"));
const problems = [];
const idCache = new Map();
const idsOf = (file) => {
  if (!idCache.has(file)) idCache.set(file, new Set([...fs.readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idCache.get(file);
};
const rel = (f) => path.relative(DIST, f);
const titles = new Map(), descs = new Map();

for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  const here = rel(page);
  const is404 = here === "404.html";
  const is404Page = here === "404.html";
  const tMatch = html.match(/<title>([^<]+)<\/title>/), dMatch = html.match(/<meta name="description" content="([^"]*)"/);
  if (tMatch && !is404Page) {
    const t = tMatch[1], d = dMatch ? dMatch[1] : "";
    if (t.length > 65) problems.push(`${here}: title is ${t.length} characters, Google shows about 60 (${t})`);
    if (d.length < 70 || d.length > 160) problems.push(`${here}: description is ${d.length} characters, aim for 70 to 160`);
    if (titles.has(t)) problems.push(`${here}: same title as ${titles.get(t)}`); else titles.set(t, here);
    if (descs.has(d)) problems.push(`${here}: same description as ${descs.get(d)}`); else descs.set(d, here);
    if (!/<meta name="robots" content="index/.test(html)) problems.push(`${here}: missing indexable robots meta`);
    if (!/showship-icon-48\.png/.test(html)) problems.push(`${here}: missing 48px favicon link`);
    if (SITE_URL) {
      const canon = html.match(/<link rel="canonical" href="([^"]+)"/);
      const expect = SITE_URL + "/" + (here === "index.html" ? "" : here.replace(/index\.html$/, ""));
      if (!canon) problems.push(`${here}: missing canonical`); else if (canon[1] !== expect) problems.push(`${here}: canonical ${canon[1]} should be ${expect}`);
      for (const prop of ["og:title", "og:description", "og:image", "og:url"]) if (!html.includes(`property="${prop}"`)) problems.push(`${here}: missing ${prop}`);
      const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      if (!ld.length) problems.push(`${here}: missing JSON-LD`);
      for (const m of ld) {
        try {
          const j = JSON.parse(m[1]);
          const types = (j["@graph"] || [j]).map((n) => n["@type"]);
          if (here === "index.html" && !(types.includes("WebSite") && types.includes("SoftwareApplication"))) problems.push(`${here}: JSON-LD should have WebSite and SoftwareApplication, has ${types}`);
          if (here !== "index.html" && !types.includes("BreadcrumbList")) problems.push(`${here}: JSON-LD should have a BreadcrumbList`);
          for (const n of j["@graph"] || []) for (const li of n.itemListElement || []) if (!String(li.item).startsWith(SITE_URL)) problems.push(`${here}: breadcrumb item is not an absolute site URL: ${li.item}`);
        } catch (e) { problems.push(`${here}: invalid JSON-LD (${e.message})`); }
      }
    }
  }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${here}: ${h1} h1 elements`);
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${here}: missing title`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${here}: missing description`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) problems.push(`${here}: image without alt: ${m[0].slice(0, 80)}`);
  const text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
  if (text.includes("—")) problems.push(`${here}: contains an em dash`);
  if (/(^|\s)--(\s|$)/.test(text)) problems.push(`${here}: contains a spaced double hyphen`);

  for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    let url = m[1].replace(/&amp;/g, "&");
    if (!url || /^(https?:|mailto:|data:|javascript:)/.test(url)) continue;
    const [pathPart, hash] = url.split("#");
    const cleaned = pathPart.split("?")[0];
    let target;
    if (!cleaned) target = page;
    else if (cleaned.startsWith("/")) {
      if (!cleaned.startsWith(BASE)) { problems.push(`${here}: absolute link outside the base path: ${url}`); continue; }
      target = path.join(DIST, cleaned.slice(BASE.length));
    } else target = path.resolve(path.dirname(page), cleaned);
    if (!is404 && cleaned.startsWith("/")) problems.push(`${here}: root-absolute link on a normal page (breaks under a base path): ${url}`);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target)) { problems.push(`${here}: broken link ${url}`); continue; }
    if (hash && target.endsWith(".html") && !idsOf(target).has(hash)) problems.push(`${here}: missing anchor ${url}`);
  }
}

const search = path.join(DIST, "assets", "search-index.json");
if (!fs.existsSync(search)) problems.push("assets/search-index.json missing");
for (const f of ["assets/css/site.css", "assets/js/site.js", ".nojekyll", "404.html", "index.html"]) if (!fs.existsSync(path.join(DIST, f))) problems.push(`${f} missing`);

if (SITE_URL) {
  const sm = fs.existsSync(path.join(DIST, "sitemap.xml")) ? fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8") : "";
  if (!sm) problems.push("sitemap.xml missing");
  for (const page of pages) {
    const r = rel(page);
    if (r === "404.html") continue;
    const loc = SITE_URL + "/" + (r === "index.html" ? "" : r.replace(/index\.html$/, ""));
    if (!sm.includes(`<loc>${loc}</loc>`)) problems.push(`sitemap.xml is missing ${loc}`);
  }
  const rb = fs.existsSync(path.join(DIST, "robots.txt")) ? fs.readFileSync(path.join(DIST, "robots.txt"), "utf8") : "";
  if (!rb.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) problems.push("robots.txt does not point to the sitemap");
}
console.log(`Checked ${pages.length} pages, ${files.length} files${SITE_URL ? ", with SEO checks for " + SITE_URL : " (set SITE_URL to include canonical, structured data and sitemap checks)"}.`);
if (problems.length) { console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`); process.exit(1); }
console.log("No problems found.");
