# TimelineJS Modernization Handoff

This fork is being used to explore a modern, JSON-first story/exhibit runtime. The initial work started as TimelineJS modernization, but the product direction is now broader: TimelineJS is one chronological projection over a richer exhibit/story contract.

Storyline was published as `@tacman1123/storyline@0.1.0`, but it is better treated as a future chart/y-axis experiment. TimelineJS remains useful for timeline-with-media behavior, but the main content model should be an exhibit builder / FotoStory-style story document.

## Current Direction

Build a Symfony/AssetMapper-friendly browser package and a PHP/Twig content layer:

- PHP/Symfony owns content creation, curation, persistence, permissions, publishing, and server-rendered fallback HTML.
- Twig should use a modern Symfony UX Twig component, eventually something like `<twig:ExhibitStory :story="story" />`.
- JavaScript owns progressive enhancement and optional projections: timeline strip, slider, connector display, galleries, comparison blocks, lightboxes, graph/map views.
- Consuming Symfony apps should not need a local npm build for the first integration path.
- Google Sheets/CSV should not be the primary path.

## Committed Checkpoints

- `1c7e7b48 Add modern JSON timeline runtime`
  - Adds the no-build timeline runtime, demo, ADR, zm endpoint doc, launcher, and README notes.

## Current Uncommitted Checkpoint

The pending work in this commit adds the exhibit/story layer:

- `docs/story-contract.md` - contract for Story, Album, Asset, Block, Context, Connector, Projection, plus PHP/Twig vs JS boundary.
- `src/modern/story.js` - no-build ESM exhibit-story renderer for demos and early projection work.
- `src/modern/story.css` - exhibit-story demo styles.
- `demo/story/index.html` - static browser-module demo.
- `demo/story/one-building-three-businesses.json` - Fortepan FotoStory-inspired demo data for a folder of bookmarks ordered into story blocks with connectors.
- README, demo README, and launcher updates linking the story demo.

## Demo Startup

From `~/tacman/TimelineJS`:

```bash
git status --short
php -S 127.0.0.1:8011 -t .
```

Open:

```text
http://127.0.0.1:8011/launcher.html
http://127.0.0.1:8011/demo/static/index.html
http://127.0.0.1:8011/demo/story/index.html
```

If port `8011` is busy, use another port and adjust URLs accordingly.

## Verification Commands

```bash
node --check src/modern/index.js
node --check src/modern/story.js
node -e "JSON.parse(require('fs').readFileSync('demo/static/timeline.json','utf8')); console.log('timeline json ok')"
node -e "JSON.parse(require('fs').readFileSync('demo/story/one-building-three-businesses.json','utf8')); console.log('story json ok')"
node --input-type=module -e "import { readFileSync } from 'node:fs'; import('./src/modern/story.js').then(({ normalizeStory }) => { const story = normalizeStory(JSON.parse(readFileSync('demo/story/one-building-three-businesses.json', 'utf8'))); console.log(story.blocks.length, story.assets.size, story.connectors.size, story.projections.timeline.items.length); });"
```

Expected story normalization output:

```text
11 4 4 3
```

Node currently warns that `package.json` does not specify ESM module type. That is expected for now; package metadata should wait until the import/export surface is proven in a Symfony integration.

## Architectural Decision

The canonical content model should be the exhibit story contract, not TimelineJS event JSON. TimelineJSON is useful as a projection. The richer story document should support:

- a curated album/bookmark folder as the source pile
- ordered editorial blocks as the primary reading order
- assets with source and media URLs
- contexts as reusable explanatory notes
- connectors as explicit claims/relationships between assets, blocks, dates, people, places, businesses, and sources
- projections such as story page, timeline strip, slider, map, and graph

This lines up with Fortepan FotoStory and Omeka Exhibit Builder: content creation and curation are server-side editorial concerns; JS should enhance presentation.

## Next Work

1. Commit this exhibit-story checkpoint.
2. Create the first Symfony UX Twig component prototype in the target Symfony app or bundle, using `docs/story-contract.md` as the contract.
3. Have PHP render meaningful HTML for the same `one-building-three-businesses` shape before JS hydration.
4. Add a small `hydrateStory()` path to `src/modern/story.js` once real Twig markup exists.
5. Decide whether this stays in the TimelineJS fork or moves into a separate `@survos/exhibit-runtime` package.
6. Only update `package.json` exports after the first Symfony integration proves the import path.
