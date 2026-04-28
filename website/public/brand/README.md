# Kroni brand assets

Wordmark = "Kroni" set in Newsreader 600 (semibold) followed by a 28-px gold dot.
The dot is the visual signature — it carries the brand on its own.

## Files

| File                       | Use                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `kroni-logo.svg`           | Primary lockup. Dark wordmark on light background. Default for web, marketing, docs. |
| `kroni-logo-dark.svg`      | Same lockup, sand-50 wordmark. Use on `ink-900` / dark backgrounds.                  |
| `kroni-mark.svg`           | Standalone gold dot. Favicon, app icon mask, social avatar, tiny placements.         |

All wordmark SVGs reference Google Fonts at runtime. They render correctly in any browser, in Figma (auto-fetches Newsreader), and in any tool that renders SVG via a browser engine.

## Colors

```
text       #1F1C14   (sand-900)
text-dark  #FBFAF6   (sand-50)
dot        #F5B015   (gold-500)
```

## Sizing in product

- **Header** (web): wordmark 22 px, dot 6 px, baseline aligned. See `website/app/_components/SiteHeader.tsx`.
- **Hero**: wordmark 56 px, dot 14 px, optical-aligned slightly above baseline.
- **Footer**: wordmark 18 px, dot 5 px.

## Convert SVG → PNG

The font is loaded via `@import url(fonts.googleapis.com/...)`. Standalone PNG converters that don't run a browser engine (e.g. `librsvg`/`rsvg-convert`) won't fetch the font and will fall back to Times. Three reliable options:

1. **Figma** (recommended for pixel-perfect PNG export):
   - Paste the SVG into a Figma canvas; Figma auto-loads Newsreader.
   - Right-click the layer → Export → PNG @1x/2x/3x.

2. **Browser screenshot** (fast):
   - Open the SVG in Chrome / Edge → DevTools → Capture node screenshot.

3. **Inkscape** (offline, batch):
   - `inkscape kroni-logo.svg --export-type=png --export-dpi=300 --export-filename=kroni-logo.png`
   - Inkscape rasterises with full font support if Newsreader is installed locally; otherwise install via Google Fonts → "Add to Inkscape".

## When you want true outline-only SVGs (no font dependency)

Open `kroni-logo.svg` in Figma or Inkscape, select the wordmark, and run **Object → Path → Object to Path** (Inkscape) or **Outline Stroke / Flatten** (Figma). Export as SVG. The result is pixel-identical and ships zero font weight.
