---
title: Deck designs
description: The seven deck designs, their fonts, and how to set a design, brand colours and the Shipped with Showship mark.
seoTitle: Deck designs, fonts and brand colours
---

Seven designs, chosen to read well in a business meeting. Every slide type works in every design, from the same `report.json`. To compare them side by side, see the [designs gallery]({{root}}designs/).

Set the design once in `config.json` (`"style": "vivid"`), in the installer (`--style vivid`), or for a single report with `"style"` in that report's `report.json`. `theme` colours still override the design's palette, so you can keep a layout and use your brand colours.

## The seven designs

### Showship

The signature design. Every project gets its own colour, carried from the dashboard to the phase tracks, task tracker and next-steps table, so the audience can follow a project by colour alone. Semicircle gauges, pill-track phase charts, a waffle of done and open tasks, a milestone trail for timelines, and ship-trail ribbons on the title slides.

A small "Shipped with Showship" mark sits in the footer. Turn it off with `"signature": false` in `config.json` or `report.json`.

![Showship design preview]({{root}}assets/img/style-showship.webp)

[Preview of all Showship slides]({{root}}assets/img/showship-grid.webp) or [download the example deck]({{root}}assets/downloads/example-deck-showship.pptx).

### Paper

Set like a printed annual report. Paper background and navy ink, rules instead of cards, one big figure leading every slide, one colour per project, and coral red kept for risks only. Every slide type has its own composition. The `rows` template does not draw its illustrations in this design, so prefer a screenshot or plain rows.

![Paper design preview]({{root}}assets/img/style-paper.webp)

[Preview of all Paper slides]({{root}}assets/img/paper-grid.webp) or [download the example deck]({{root}}assets/downloads/example-deck-paper.pptx).

### Ember

A dark deck for rooms where the projector is the brightest thing. Graphite slides, content on flat lighter panels with no shadows or borders, one amber accent for the focal point, and coral red kept for risks only. Figures are set large in Georgia, and a big slide number sits in the header band.

Every slide type has its own composition: a hero panel with one giant figure on the dashboard, vertical pillars for progress, a zigzag trail for timelines, banded rows. The `rows` template does not draw its illustrations in this design, so prefer a screenshot or plain rows. The `theme.dark` colour recolours the whole deck, so give it a dark value.

![Ember design preview]({{root}}assets/img/style-ember.webp)

[Preview of all Ember slides]({{root}}assets/img/ember-grid.webp) or [download the example deck]({{root}}assets/downloads/example-deck-ember.pptx).

### Classic

Black and white editorial with its own layouts: no boxes, a lede column for the key message, large serif figures, numbered entries, a vertical timeline, phase lists instead of bar charts, heavy and hairline rules, and one deep green accent.

![Classic design preview]({{root}}assets/img/style-classic.webp)

[Download the example deck]({{root}}assets/downloads/example-deck.pptx).

### Modern

Dark title slides, lime accent, serif headings, soft cards.

![Modern design preview]({{root}}assets/img/style-modern.webp)

### Corporate

White with a navy panel, blue accent, clean sans-serif, and a footer with page numbers.

![Corporate design preview]({{root}}assets/img/style-corporate.webp)

### Vivid

A teal header band on every slide, orange accent, rounded cards.

![Vivid design preview]({{root}}assets/img/style-vivid.webp)

## Fonts

PowerPoint substitutes a font if it is not installed, so install the ones your design needs.

| Design | Heading font | Body font |
| --- | --- | --- |
| Showship, Paper | Poppins | Arial |
| Ember, Classic, Vivid | Georgia | Arial |
| Modern | Cambria | Calibri |
| Corporate | Arial | Arial |

[Poppins](https://fonts.google.com/specimen/Poppins) is a free Google font.

## Brand colours

The `theme` object overrides the palette of whichever design you pick. All values are hex without the `#`.

```json
"theme": {
  "dark": "141412",
  "accent": "A8CC3A",
  "accentLight": "D6E6A0",
  "warning": "E0A33A"
}
```

In the Showship and Paper designs a project keeps one colour on every slide. The colour is matched by the product name, so the agent starts every label, eyebrow and table row for a project with the same name (for example "ClinicBook · Patient App" and "ClinicBook: Status of Each Phase").

Optional `"color"` on a dashboard card or a `phase_bars` slide pins a project colour (hex).
