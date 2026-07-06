# TimelineJS Handoff

This repo is the right next focus for the timeline-with-media use case. Storyline was published as `@tacman1123/storyline@0.1.0`, but it is better treated as a future chart/y-axis experiment.

## Current Direction

Modernize TimelineJS as a JSON-first, Symfony/AssetMapper-friendly browser package:

- no local npm required for consuming Symfony apps
- zm/API Platform can produce timeline-friendly JSON from an endpoint
- the browser package imports native ESM and fetches that endpoint
- fresh modern CSS, no legacy browser support target
- Google Sheets/CSV should not be the primary path

## Files Added Before Restart

- `src/modern/index.js` - first no-build ESM renderer
- `src/modern/timeline.css` - fresh modern CSS prototype
- `demo/static/index.html` - static browser-module demo
- `demo/static/timeline.json` - local JSON feed with events and eras
- `demo/README.md` - demo instructions
- `docs/adr/0001-json-first-modern-runtime.md` - architecture decision draft
- `docs/zm-endpoint.md` - endpoint JSON contract for zm/API Platform
- `launcher.html` - local demo launcher

These files are not committed yet.

## Restart Checklist

From `~/tacman/TimelineJS`:

```bash
git status --short
php -S 127.0.0.1:8011 -t .
```

Open:

```text
http://127.0.0.1:8011/demo/static/index.html
```

If port 8011 is busy, use another port.

## Next Work

1. Visually verify the static demo on desktop and mobile.
2. Decide whether the overlay chip shape is enough for the first zm integration.
3. Update `package.json` only after the demo/runtime shape feels right.
4. Commit the modern demo/runtime as the first TimelineJS modernization checkpoint.
