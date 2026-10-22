#!/usr/bin/env node
/**
 * Copies brand files, slide previews and example decks from the Showship repo
 * into src/assets, converting the PNG previews to WebP.
 *
 * Usage: node scripts/sync-assets.mjs [path-to-showship-repo]   (default: ../showship)
 *
 * Needs `sharp`. It is resolved from the Showship repo's deck builder
 * (skill/scripts/node_modules), so run `npm install` there first.
 * The outputs are committed, so CI never needs this script.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "..");
const repo = path.resolve(process.argv[2] || path.join(site, "..", "showship"));
const require = createRequire(path.join(repo, "skill", "scripts", "package.json"));
const sharp = require("sharp");

const out = (...p) => path.join(site, "src", "assets", ...p);
const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log("copied", path.relative(site, to));
};

for (const f of ["showship-logo.svg", "showship-logo-dark.svg", "showship-mark.svg", "showship-icon-32.png", "showship-icon-180.png"]) {
  copy(path.join(repo, "brand", f), out("img", f));
}
// Google asks for a favicon whose size is a multiple of 48 px: make 48 and 192 from the 512 px icon.
for (const size of [48, 192]) {
  await sharp(path.join(repo, "brand", "showship-icon-512.png")).resize(size, size).png().toFile(out("img", `showship-icon-${size}.png`));
  console.log("png   src/assets/img/showship-icon-" + size + ".png");
}

// Header logo: the compact lockup has no tagline, which is unreadable at header size.
// The dark-theme copy only recolours the wordmark path from ink to paper; the tile and ribbons are untouched.
copy(path.join(repo, "brand", "showship-logo-compact.svg"), out("img", "showship-logo-compact.svg"));
const compact = fs.readFileSync(path.join(repo, "brand", "showship-logo-compact.svg"), "utf8");
fs.writeFileSync(out("img", "showship-logo-compact-dark.svg"), compact.replace(/(<path[^>]*fill=")#17153A(")/g, "$1#F7F4EE$2"));
console.log("wrote  src/assets/img/showship-logo-compact-dark.svg");
for (const f of fs.readdirSync(path.join(repo, "docs")).filter((n) => n.endsWith(".pptx"))) {
  copy(path.join(repo, "docs", f), out("downloads", f));
}

const previews = ["showship-grid", "paper-grid", "ember-grid", "summit-grid", "grove-grid", "classic-grid", "modern-grid", "corporate-grid", "vivid-grid", "slide-dashboard", "slide-phase-bars", "slide-review-insights", "slide-attention", "slide-tracker", "slide-task-detail", "slide-next-steps", "style-showship", "style-paper", "style-ember", "style-summit", "style-grove", "style-classic", "style-modern", "style-corporate", "style-vivid"];
for (const name of previews) {
  const to = out("img", `${name}.webp`);
  const info = await sharp(path.join(repo, "docs", `${name}.png`)).webp({ quality: 84 }).toFile(to);
  console.log("webp  ", path.relative(site, to), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
}

// Social preview, 1200x630: headline and description on paper, the demo poster as a rounded card with the install command.
// Text is drawn from SVG, so Poppins and Arial must be installed on the machine that runs this.
const OG = { w: 1200, h: 630, cw: 500, ch: 440, cx: 650, cy: 95 };
const ogCmd = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.cw}" height="${OG.ch}"><rect x="${(OG.cw - 300) / 2}" y="300" width="300" height="48" rx="24" fill="#17153a" fill-opacity="0.55" stroke="#ffc83d" stroke-width="2"/><text x="${OG.cw / 2}" y="332" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="22" fill="#ffc83d">npx showship@latest</text></svg>`;
const ogMask = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.cw}" height="${OG.ch}"><rect width="${OG.cw}" height="${OG.ch}" rx="28"/></svg>`;
const ogText = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.w}" height="${OG.h}"><g font-family="Poppins" font-weight="700" font-size="56" fill="#17153a"><text x="70" y="262">Progress decks</text><text x="70" y="326">from your</text><text x="70" y="390">GitHub activity</text></g><g font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#48465c"><text x="70" y="448">For your manager, client or CTO,</text><text x="70" y="482">in plain language.</text></g><text x="70" y="568" font-family="Poppins" font-weight="600" font-size="24" fill="#5b3fe0">showship.github.io</text></svg>`;
const ogCardRaw = await sharp(path.join(site, "src", "assets", "video", "showship-demo-poster.webp")).resize(OG.cw, OG.ch, { fit: "cover" }).composite([{ input: Buffer.from(ogCmd) }]).png().toBuffer();
const ogCard = await sharp(ogCardRaw).composite([{ input: Buffer.from(ogMask), blend: "dest-in" }]).png().toBuffer();
const ogCircles = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.w}" height="${OG.h}"><circle cx="640" cy="150" r="125" fill="#10a6a0" fill-opacity="0.18"/><circle cx="1020" cy="545" r="135" fill="#6c4cf5" fill-opacity="0.16"/></svg>`;
const ogLogo = await sharp(path.join(site, "src", "assets", "img", "showship-logo-compact.svg"), { density: 300 }).resize({ height: 46 }).png().toBuffer();
const og = await sharp({ create: { width: OG.w, height: OG.h, channels: 4, background: "#f7f4ee" } })
  .composite([{ input: Buffer.from(ogCircles) }, { input: ogLogo, left: 70, top: 70 }, { input: ogCard, left: OG.cx, top: OG.cy }, { input: Buffer.from(ogText) }])
  .png().toFile(out("img", "og.png"));
console.log("png   src/assets/img/og.png", `${og.width}x${og.height}`);

// Fonts: the Showship deck styles use Poppins; ship the three weights the site uses.
const fontsDir = path.join(process.env.HOME || "", "Library", "Fonts");
for (const w of ["Medium", "SemiBold", "Bold"]) {
  const src = path.join(fontsDir, `Poppins-${w}.ttf`);
  if (fs.existsSync(src)) copy(src, out("fonts", `Poppins-${w}.ttf`));
  else console.warn(`skipped Poppins-${w}.ttf (not in ${fontsDir}; download from fonts.google.com/specimen/Poppins)`);
}
