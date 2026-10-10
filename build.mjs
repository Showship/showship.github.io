#!/usr/bin/env node
/**
 * Showship website build. No dependencies.
 *
 *   node build.mjs
 *
 * src/pages/*.html   page fragments (front matter + HTML), rendered inside the site layout
 * src/docs/*.md      documentation pages (front matter + Markdown), rendered with sidebar and TOC
 * src/assets/**      copied as is to dist/assets
 * src/static/**      copied as is to the site root (for example a Google Search Console verification file)
 *
 * Every internal link is relative to the page that contains it, so the output works at any
 * GitHub Pages base path (user site, project site, custom domain) and from a local server.
 * Two environment variables tune the output (the Pages workflow sets both):
 *   SITE_BASE  path the site is served under, for 404.html only ("/" or "/repo/"). Default "/".
 *   SITE_URL   full public URL without trailing slash. Enables canonical, Open Graph and sitemap.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "site.config.json"), "utf8"));

const BASE = (() => {
  let b = process.env.SITE_BASE || "/";
  if (!b.startsWith("/")) b = "/" + b;
  if (!b.endsWith("/")) b += "/";
  return b;
})();
const SITE_URL = (process.env.SITE_URL || "").replace(/\/+$/, "");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const read = (...p) => fs.readFileSync(path.join(...p), "utf8");
const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/_/g, "-").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || "section";
const stripTags = (h) => h.replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

function parseFront(text) {
  const m = text.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: text.replace(/\r\n/g, "\n").slice(m[0].length) };
}

function humanSize(bytes) {
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

// {{root}} and {{docs}} are relative prefixes for the page being rendered.
function fill(text, root) {
  return text
    .replace(/\{\{root\}\}/g, root)
    .replace(/\{\{docs\}\}/g, root + "docs/")
    .replace(/\{\{repo\}\}/g, cfg.repo)
    .replace(/\{\{issues\}\}/g, cfg.issues)
    .replace(/\{\{npm\}\}/g, cfg.npm)
    .replace(/\{\{license\}\}/g, cfg.license)
    .replace(/\{\{size:([^}]+)\}\}/g, (_, f) => humanSize(fs.statSync(path.join(SRC, f)).size));
}

// ---------- Markdown ----------

function inline(src) {
  const codes = [];
  let s = src.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, href) => `<img src="${href}" alt="${alt}" loading="lazy">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => `<a href="${href}"${/^https?:/.test(href) ? ' rel="noopener"' : ""}>${t}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
}

function codeBlock(lang, code) {
  const label = lang || "text";
  return `<div class="code"><div class="code-bar"><span>${esc(label)}</span><button type="button" class="copy" hidden>Copy</button></div><pre tabindex="0"><code>${esc(code)}</code></pre></div>`;
}

const LIST_RE = /^(\s*)([-*]|\d+\.)\s+(.*)$/;

function renderList(lines) {
  const first = lines[0].match(LIST_RE);
  const base = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(LIST_RE);
    if (!m || m[1].length !== base) break;
    const item = { text: [m[3]], sub: [] };
    i++;
    while (i < lines.length && lines[i].trim()) {
      const nm = lines[i].match(LIST_RE);
      if (nm && nm[1].length <= base) break;
      if (nm || item.sub.length) item.sub.push(lines[i]);
      else item.text.push(lines[i].trim());
      i++;
    }
    items.push(item);
    if (i < lines.length && !lines[i].trim()) i++;
  }
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((it) => `<li>${inline(it.text.join(" "))}${it.sub.length ? renderList(it.sub) : ""}</li>`).join("")}</${tag}>`;
}

function renderMarkdown(md, page) {
  const lines = md.split("\n");
  const out = [];
  const used = new Set();
  let current = null;
  const startSection = (h, id) => { current = { h, id, x: [] }; page.sections.push(current); };
  const push = (html) => { out.push(html); if (current) current.x.push(stripTags(html)); };
  startSection(page.title, "");

  const isSep = (l) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l || "");
  const splitRow = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
  const blockStart = (l, next) => /^```/.test(l) || /^#{2,4}\s/.test(l) || (l.startsWith("|") && isSep(next)) || l.startsWith(">") || LIST_RE.test(l) || /^---+$/.test(l.trim());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = line.match(/^```(\S*)\s*$/))) {
      const code = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++;
      push(codeBlock(m[1], code.join("\n")));
    } else if ((m = line.match(/^(#{2,4})\s+(.*)$/))) {
      const level = m[1].length;
      const text = stripTags(inline(m[2]));
      let id = slugify(text), n = 2;
      while (used.has(id)) id = `${slugify(text)}-${n++}`;
      used.add(id);
      page.headings.push({ level, text, id });
      startSection(text, id);
      out.push(`<h${level} id="${id}">${inline(m[2])} <a class="anchor" href="#${id}" aria-label="Link to ${esc(text)}">#</a></h${level}>`);
      i++;
    } else if (line.startsWith("|") && isSep(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(splitRow(lines[i++]));
      push(`<div class="table-wrap" role="region" aria-label="Table, scrolls sideways on small screens" tabindex="0"><table><thead><tr>${head.map((c) => `<th scope="col">${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    } else if (line.startsWith(">")) {
      const q = [];
      while (i < lines.length && lines[i].startsWith(">")) q.push(lines[i++].replace(/^>\s?/, ""));
      const k = q[0].match(/^\[!(NOTE|TIP|WARNING)\]\s*$/);
      if (k) {
        const inner = { headings: [], sections: [], title: "" };
        const label = { NOTE: "Note", TIP: "Tip", WARNING: "Warning" }[k[1]];
        push(`<aside class="callout callout-${k[1].toLowerCase()}"><p class="callout-label">${label}</p>${renderMarkdown(q.slice(1).join("\n"), inner)}</aside>`);
      } else {
        push(`<blockquote>${renderMarkdown(q.join("\n"), { headings: [], sections: [], title: "" })}</blockquote>`);
      }
    } else if (LIST_RE.test(line)) {
      const block = [];
      while (i < lines.length && (lines[i].trim() === "" ? LIST_RE.test(lines[i + 1] || "") : LIST_RE.test(lines[i]) || /^\s+\S/.test(lines[i]))) block.push(lines[i++]);
      push(renderList(block.filter((l) => l.trim())));
    } else if (/^---+$/.test(line.trim())) {
      push("<hr>");
      i++;
    } else if (line.startsWith("<")) {
      const raw = [];
      while (i < lines.length && lines[i].trim()) raw.push(lines[i++]);
      push(raw.join("\n"));
    } else {
      const para = [];
      while (i < lines.length && lines[i].trim() && !(para.length && blockStart(lines[i], lines[i + 1]))) para.push(lines[i++].trim());
      push(`<p>${inline(para.join(" "))}</p>`);
    }
  }
  return out.join("\n");
}

// ---------- Layout ----------

const ICON = {
  search: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12.8 12.8 17 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  menu: '<svg class="i-bars" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><svg class="i-x" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="m4.5 4.5 11 11m0-11-11 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="m4.5 4.5 11 11m0-11-11 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  theme: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 3a7 7 0 0 1 0 14Z" fill="currentColor"/></svg>',
};

// The brand mark has three ribbons (violet, teal, coral; widths 14:10:7) plus an amber dot. Keep this to three lines. The lowest line sits on the bottom edge of the 400x122 viewBox so a ribbon band meets the next section with no gap.
const TRAIL_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><g id="trail-paths" fill="none" stroke-linecap="round"><path d="M0 109C120 107 250 79 400 7" stroke="#6C4CF5" stroke-width="10" vector-effect="non-scaling-stroke"/><path d="M0 115C130 113 260 91 400 23" stroke="#10A6A0" stroke-width="7" vector-effect="non-scaling-stroke"/><path d="M0 120C140 119 270 103 400 39" stroke="#FF6B4A" stroke-width="5" vector-effect="non-scaling-stroke"/></g></defs></svg>`;

const assetHash = (rel) => crypto.createHash("md5").update(fs.readFileSync(path.join(SRC, rel))).digest("hex").slice(0, 8);

const NAV = (root) => [
  ["Documentation", `${root}docs/`, "docs"],
  ["Demo", `${root}#demo`, ""],
  ["Slides", `${root}#slides`, ""],
  ["Designs", `${root}designs/`, "designs"],
  ["Install", `${root}#install`, ""],
];

// JSON-LD needs absolute URLs, so it is only written when SITE_URL is known (the Pages workflow sets it).
const ldScript = (graph) => !SITE_URL || !graph || !graph.length ? "" :
  `\n<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
const crumbs = (items) => ({ "@type": "BreadcrumbList", itemListElement: items.map(([name, rel], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE_URL}/${rel}` })) });

function head({ title, description, root, canonicalPath, noindex, ld }) {
  const url = SITE_URL && canonicalPath !== undefined ? `${SITE_URL}/${canonicalPath}` : "";
  const robots = noindex ? "noindex" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">${cfg.googleSiteVerification ? `\n<meta name="google-site-verification" content="${esc(cfg.googleSiteVerification)}">` : ""}
<meta name="theme-color" content="#F7F4EE" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#100E2C" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${root}assets/img/showship-mark.svg" type="image/svg+xml">
<link rel="icon" href="${root}assets/img/showship-icon-48.png" type="image/png" sizes="48x48">
<link rel="icon" href="${root}assets/img/showship-icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="${root}assets/img/showship-icon-180.png">${url ? `\n<link rel="canonical" href="${url}">\n<meta property="og:url" content="${url}">` : ""}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.name)}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">${SITE_URL ? `\n<meta property="og:image" content="${SITE_URL}/assets/img/og.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="Showship deck designs: a dark title slide with colour ribbons, an executive summary and phase bars.">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${esc(title)}">\n<meta name="twitter:description" content="${esc(description)}">\n<meta name="twitter:image" content="${SITE_URL}/assets/img/og.png">` : ""}
<link rel="preload" href="${root}assets/fonts/Poppins-SemiBold.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="${root}assets/fonts/Poppins-Bold.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="${root}assets/css/site.css?v=${assetHash("assets/css/site.css")}">
<script>document.documentElement.classList.add("has-js");try{var t=localStorage.getItem("showship-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
<script src="${root}assets/js/site.js?v=${assetHash("assets/js/site.js")}" defer></script>${ldScript(ld)}
</head>`;
}

function header(root, current) {
  const links = NAV(root).map(([label, href, key]) => `<a href="${href}"${key && key === current ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap bar">
<a class="brand" href="${root === "" ? "./" : root}" aria-label="Showship, home">
<img class="logo logo-light" src="${root}assets/img/showship-logo-compact.svg" alt="" width="161" height="34">
<img class="logo logo-dark" src="${root}assets/img/showship-logo-compact-dark.svg" alt="" width="161" height="34">
</a>
<nav class="primary" id="primary-nav" aria-label="Main">${links}<a href="${cfg.repo}" rel="noopener">GitHub</a></nav>
<div class="tools">
<button type="button" class="tool" id="search-open" hidden aria-label="Search the documentation" aria-keyshortcuts="/">${ICON.search}<span class="tool-label">Search</span><kbd aria-hidden="true">/</kbd></button>
<button type="button" class="tool tool-icon" id="theme-toggle" hidden aria-label="Switch theme">${ICON.theme}</button>
<button type="button" class="tool tool-icon menu-btn" id="menu-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">${ICON.menu}</button>
</div>
</div>
</header>`;
}

function footer(root) {
  return `<footer class="site-footer">
<div class="wrap foot">
<p class="foot-brand"><img src="${root}assets/img/showship-mark.svg" alt="" width="28" height="28"><span><strong>Showship</strong> shows what you shipped. MIT licensed, by Soe Moe Oo.</span></p>
<nav aria-label="Footer"><a href="${root}docs/">Documentation</a><a href="${root}docs/install/">Install</a><a href="${root}docs/quick-start/">Quick start</a><a href="${root}designs/">Designs</a><a href="${root}docs/task-trackers/">Task trackers</a><a href="${cfg.repo}" rel="noopener">GitHub</a><a href="${cfg.npm}" rel="noopener">npm</a><a href="${cfg.issues}" rel="noopener">Report an issue</a></nav>
</div>
</footer>`;
}

const SEARCH_DIALOG = `<dialog id="search-dialog" aria-label="Search the documentation">
<form method="dialog" class="search-form" role="search">
<label for="search-input" class="sr-only">Search the documentation</label>
<input id="search-input" type="text" role="searchbox" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="Search the documentation">
<button class="search-close" value="close" aria-label="Close search" title="Close (Esc)">${ICON.close}</button>
</form>
<p id="search-status" class="search-status" role="status">Type to search the documentation.</p>
<ul id="search-results" class="search-results"></ul>
</dialog>`;

function shell({ title, description, root, current, body, canonicalPath, noindex, bodyClass, ld }) {
  return `<!doctype html>
<html lang="en" data-root="${root}">
${head({ title, description, root, canonicalPath, noindex, ld })}
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
${TRAIL_DEFS}
${header(root, current)}
${body}
${footer(root)}
${SEARCH_DIALOG}
</body>
</html>
`;
}

// ---------- Build ----------

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}
const write = (rel, text) => {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
};

fs.rmSync(DIST, { recursive: true, force: true });
copyDir(path.join(SRC, "assets"), path.join(DIST, "assets"));
// src/static/ is copied to the site root as is: verification files, favicon.ico, and so on.
if (fs.existsSync(path.join(SRC, "static"))) copyDir(path.join(SRC, "static"), DIST);
write(".nojekyll", "");
if (cfg.cname) write("CNAME", cfg.cname + "\n");

// Documentation
const slugs = cfg.docs.flatMap((g) => g.pages);
const docPages = slugs.map((slug) => {
  const file = path.join(SRC, "docs", (slug || "index") + ".md");
  if (!fs.existsSync(file)) throw new Error(`Missing docs page for "${slug}": ${path.relative(ROOT, file)}`);
  const { meta, body } = parseFront(read(file));
  if (!meta.title) throw new Error(`${path.relative(ROOT, file)} needs a title in its front matter`);
  const group = cfg.docs.find((g) => g.pages.includes(slug)).group;
  return { slug, title: meta.title, seoTitle: meta.seoTitle || "", description: meta.description || "", group, body };
});

const searchIndex = [];
docPages.forEach((p, idx) => {
  const depth = p.slug ? 2 : 1;
  const root = "../".repeat(depth);
  const out = p.slug ? `docs/${p.slug}/index.html` : "docs/index.html";
  const page = { title: p.title, headings: [], sections: [] };
  const content = renderMarkdown(fill(p.body, root), page);

  const navHtml = cfg.docs.map((g) => `<div class="nav-group"><p class="nav-title">${esc(g.group)}</p><ul>${g.pages.map((s) => {
    const t = docPages.find((d) => d.slug === s).title;
    return `<li><a href="${root}docs/${s ? s + "/" : ""}"${s === p.slug ? ' aria-current="page"' : ""}>${esc(t)}</a></li>`;
  }).join("")}</ul></div>`).join("");

  const toc = page.headings.filter((h) => h.level <= 3);
  const tocHtml = toc.filter((h) => h.level === 2).length >= 2
    ? `<aside class="toc" aria-label="On this page"><p class="nav-title">On this page</p><ul>${toc.map((h) => `<li class="l${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ul></aside>`
    : `<aside class="toc" aria-hidden="true"></aside>`;

  const prev = docPages[idx - 1], next = docPages[idx + 1];
  const pager = `<nav class="pager" aria-label="Previous and next page">${prev ? `<a class="prev" href="${root}docs/${prev.slug ? prev.slug + "/" : ""}"><span>Previous</span>${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a class="next" href="${root}docs/${next.slug ? next.slug + "/" : ""}"><span>Next</span>${esc(next.title)}</a>` : "<span></span>"}</nav>`;

  const body = `<div class="wrap docs">
<aside class="side"><nav aria-label="Documentation">${navHtml}</nav></aside>
<details class="side-m"><summary>Documentation menu</summary><nav aria-label="Documentation, mobile">${navHtml}</nav></details>
<main id="main" class="doc">
<header class="doc-head">
<svg class="doc-trail" viewBox="0 0 400 122" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#trail-paths"/></svg>
<p class="crumb">${esc(p.group)}</p>
<h1>${esc(p.title)}</h1>
${p.description ? `<p class="lead">${esc(p.description)}</p>` : ""}
</header>
<div class="prose">
${content}
</div>
${pager}
</main>
${tocHtml}
</div>`;

  write(out, shell({
    title: !p.slug && p.seoTitle ? p.seoTitle : p.seoTitle ? `${p.seoTitle} · ${cfg.name} docs` : p.slug ? `${p.title} · ${cfg.name} docs` : `${cfg.name} documentation`,
    description: p.description || cfg.description,
    root, current: "docs", body, canonicalPath: p.slug ? `docs/${p.slug}/` : "docs/",
    ld: [crumbs([[cfg.name, ""], ["Documentation", "docs/"], ...(p.slug ? [[p.title, `docs/${p.slug}/`]] : [])])],
  }));
  searchIndex.push({ t: p.title, g: p.group, u: `docs/${p.slug ? p.slug + "/" : ""}`, s: page.sections.map((s) => ({ h: s.h, i: s.id, x: s.x.join(" ").slice(0, 1200) })) });
});
write("assets/search-index.json", JSON.stringify(searchIndex));

// Structured data for the home page. Sitelinks are chosen by Google, not declared, but a named WebSite and
// a clear description of the product help it understand what the site is.
const homeLd = () => [
  { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: cfg.name, alternateName: "Showship progress report decks", url: `${SITE_URL}/`, description: cfg.description, inLanguage: "en" },
  {
    "@type": "SoftwareApplication", "@id": `${SITE_URL}/#software`, name: cfg.name, url: `${SITE_URL}/`, description: cfg.description,
    applicationCategory: "DeveloperApplication", operatingSystem: "Any system that runs Node.js 18 or newer",
    softwareRequirements: "Node.js 18 or newer, git, GitHub CLI", isAccessibleForFree: true, license: cfg.license,
    author: { "@type": "Person", name: cfg.author.name, url: cfg.author.url }, sameAs: [cfg.repo, cfg.npm],
  },
];

// Free-standing pages: index.html is the home page, 404.html is the not-found page,
// any other src/pages/<name>.html becomes <name>/index.html.
const pageFiles = fs.readdirSync(path.join(SRC, "pages")).filter((f) => f.endsWith(".html"));
const extraPages = [];
for (const f of pageFiles) {
  const { meta, body } = parseFront(read(SRC, "pages", f));
  const name = f.replace(/\.html$/, "");
  const is404 = name === "404", isHome = name === "index";
  const root = is404 ? BASE : isHome ? "./" : "../";
  const out = is404 ? "404.html" : isHome ? "index.html" : `${name}/index.html`;
  if (!is404 && !isHome) extraPages.push(`${name}/`);
  write(out, shell({
    title: meta.title, description: meta.description || cfg.description, root, current: meta.current || "",
    body: fill(body, root), canonicalPath: is404 ? undefined : isHome ? "" : `${name}/`, noindex: is404, bodyClass: meta.bodyClass,
    ld: is404 ? undefined : isHome ? homeLd() : [crumbs([[cfg.name, ""], [meta.crumb || meta.title.split(" · ")[0], `${name}/`]])],
  }));
}

// Crawlers
if (SITE_URL) {
  const urls = ["", ...extraPages, ...docPages.map((p) => `docs/${p.slug ? p.slug + "/" : ""}`)];
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${SITE_URL}/${u}</loc></url>`).join("\n")}\n</urlset>\n`);
  write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

console.log(`Built ${docPages.length} docs pages + ${pageFiles.length} pages into dist/ (base ${BASE}${SITE_URL ? ", url " + SITE_URL : ""})`);
