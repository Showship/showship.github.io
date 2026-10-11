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

const previews = ["showship-grid", "paper-grid", "ember-grid", "classic-grid", "modern-grid", "corporate-grid", "vivid-grid", "slide-dashboard", "slide-phase-bars", "slide-review-insights", "slide-attention", "slide-tracker", "slide-next-steps", "style-showship", "style-paper", "style-ember", "style-classic", "style-modern", "style-corporate", "style-vivid"];
for (const name of previews) {
  const to = out("img", `${name}.webp`);
  const info = await sharp(path.join(repo, "docs", `${name}.png`)).webp({ quality: 84 }).toFile(to);
  console.log("webp  ", path.relative(site, to), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
}

// Social preview: the style strip on the brand ink colour, 1200x630.
const og = await sharp(path.join(repo, "docs", "style-showship.png")).resize(1200, 630, { fit: "cover", position: "left", background: "#17153A" }).png().toFile(out("img", "og.png"));
console.log("png   src/assets/img/og.png", `${og.width}x${og.height}`);

// Fonts: the Showship deck styles use Poppins; ship the three weights the site uses.
const fontsDir = path.join(process.env.HOME || "", "Library", "Fonts");
for (const w of ["Medium", "SemiBold", "Bold"]) {
  const src = path.join(fontsDir, `Poppins-${w}.ttf`);
  if (fs.existsSync(src)) copy(src, out("fonts", `Poppins-${w}.ttf`));
  else console.warn(`skipped Poppins-${w}.ttf (not in ${fontsDir}; download from fonts.google.com/specimen/Poppins)`);
}
