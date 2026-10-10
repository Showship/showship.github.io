# Showship website

Static website and documentation for [Showship](https://github.com/Soe-Moe/showship), deployed to GitHub Pages. No framework and no dependencies: a small Node script turns Markdown docs and HTML page fragments into plain files.

The design follows the Showship `paper` deck style (see `DESIGN.md` in the Showship repo): paper and ink, rules instead of cards, one violet accent, and the ship-trail ribbons as the only decoration. Light and dark themes both work, and the choice is remembered.

## Run it locally

Needs Node.js 18 or newer.

```bash
npm run dev          # builds, serves dist/ at http://localhost:8080 and rebuilds when src/ changes
npm run build        # one build into dist/
npm run check        # build, then verify links, anchors, alt text, headings and em dashes
```

## Deploy to GitHub Pages

This folder is meant to be the root of its own repository (the workflow lives in `.github/workflows/`).

1. Push the repository to GitHub.
2. In **Settings, Pages, Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow by hand). `.github/workflows/pages.yml` builds, checks and deploys.

The site URL is `https://<user>.github.io/<repo>/`, or `https://<user>.github.io/` if the repo is named `<user>.github.io`. Nothing needs editing for either case:

- Every link on every page is relative to that page, so the site works under any base path and from a plain local server.
- The workflow passes the real base path and URL to the build (`SITE_BASE`, `SITE_URL`). They are used for `404.html` (GitHub Pages serves it from any depth, so it needs absolute paths) and for canonical links, Open Graph tags, `sitemap.xml` and `robots.txt`.
- `.nojekyll` is written to the output so Pages serves the files untouched.

### Custom domain

1. Put the domain in `site.config.json` as `"cname": "showship.example.com"`. The build writes it to `dist/CNAME`.
2. Add the DNS records GitHub documents for custom domains, and set the domain under Settings, Pages.

The workflow then builds with base path `/` automatically.

## Where things live

```text
site.config.json          name, repo links, docs navigation order, optional CNAME
build.mjs                 the build: layout, Markdown renderer, search index, sitemap
src/pages/index.html      home page (HTML fragment with front matter)
src/pages/404.html        not-found page
src/docs/*.md             documentation, one Markdown file per page (index.md is the Introduction)
src/assets/               CSS, JS, fonts, images and example decks, copied to dist/assets
scripts/serve.mjs         local server with rebuild on change
scripts/check-site.mjs    post-build checks (also run in CI)
scripts/sync-assets.mjs   copies brand files, previews and example decks from the Showship repo
```

### Writing documentation

Each docs page starts with front matter and uses plain Markdown:

```markdown
---
title: Page title
description: One sentence, shown under the title and used for search and meta tags.
---

## A section

Text, `code`, lists, tables, fenced code blocks (with a Copy button) and callouts:

> [!NOTE]
> Also `[!TIP]` and `[!WARNING]`.
```

- Link between pages with `{{docs}}slug/`, for example `[Install]({{docs}}install/)`, and to assets with `{{root}}assets/...`. These expand to a path relative to the page. Other tokens: `{{repo}}`, `{{issues}}`, `{{npm}}`, `{{license}}`, `{{size:assets/downloads/file.pptx}}`.
- To add a page, create `src/docs/<slug>.md` and add `<slug>` to a group in `site.config.json`. The sidebar, previous and next links, "On this page" list and search index follow from that.
- Headings `##` to `####` get anchors. Underscores in headings become hyphens in the anchor (`review_insights` is `#review-insights`).
- Avoid em dashes. `npm run check` fails if one appears in page text.

### Refreshing assets from the Showship repo

```bash
npm run sync:assets            # reads ../showship; pass another path as the first argument
```

It copies the logo and icon files, converts the slide previews to WebP, copies the example decks, and copies the Poppins weights from `~/Library/Fonts`. It needs `sharp`, which it takes from the Showship repo (`cd ../showship/skill/scripts && npm install`). The results are committed, so CI never runs it.

## SEO and Google sitelinks

What the build already does for every page:

- A unique `<title>` and meta description (the check fails if one is missing, duplicated, or outside 70 to 160 characters for descriptions and 65 for titles), one `<h1>`, descriptive link text, and alt text on every image.
- With `SITE_URL` set (the workflow sets it): canonical links, Open Graph and Twitter tags, a `sitemap.xml` listing every page, `robots.txt` pointing at it, and JSON-LD structured data: `WebSite` and `SoftwareApplication` on the home page, `BreadcrumbList` on the designs page and every docs page.
- `404.html` is `noindex`. Favicons come in 48 and 192 px as well as SVG, because Google asks for a multiple of 48 px.
- Real pages for the things people search for (`/docs/install/`, `/docs/quick-start/`, `/docs/configuration/`, `/docs/task-trackers/`, `/designs/`), each linked from the header or footer with plain-language names. Sitelinks are built from this kind of structure.

What only you can do:

1. **Sitelinks are chosen by Google.** They cannot be declared or forced. They usually appear once the site is indexed and has enough traffic and clear structure, which takes weeks. The work above only makes the site eligible.
2. **Use a stable address.** A project site at `<user>.github.io/<repo>/` works, but Google handles a site at the root of a domain best. Prefer a custom domain (see above) or a repo named `<user>.github.io`, and keep it permanent, because a change restarts indexing.
3. **Register the site in [Google Search Console](https://search.google.com/search-console).** Add the property, verify it (paste the token into `googleSiteVerification` in `site.config.json`, which writes the meta tag), then submit `<site>/sitemap.xml`. Use URL inspection on the home page to request indexing.
4. **Check the structured data** with the [Rich Results Test](https://search.google.com/test/rich-results) and keep the page titles and descriptions in `src/docs/*.md` front matter specific.
5. **Earn links.** Link to the site from the Showship README, the npm page and the GitHub repo description. That helps more than any tag.

## Notes

- The demo video is self-hosted in `src/assets/video/` (MP4 plus a poster frame, about 9 MB). It was copied from the GitHub attachment used in the Showship README, because those links are signed and expire. To replace it, overwrite `showship-demo.mp4`. The poster is a designed title card, `showship-demo-poster.webp` (1600 px wide); replace it the same way. The three numbered lines in the Demo section describe what the video shows, so update them if the video changes.
- Search is client-side over `assets/search-index.json`, which the build generates from the docs. Buttons that need JavaScript (search, theme, copy) are hidden until the script runs, so the pages read fine without it.
- Fonts are self-hosted (Poppins, SIL Open Font License) so visitors make no third-party requests.
