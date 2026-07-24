# TimelineJS tacman fork

Modern, no-build TimelineJS experiments and demos:

https://tacman.github.io/TimelineJS/

## Overview

This fork is based on [NUKnightLab/TimelineJS3](https://github.com/NUKnightLab/TimelineJS3) and is now focused on JSON-first, Symfony/AssetMapper-friendly runtime experiments. It does not support the Knight Lab authoring tool or Google Sheets publishing workflow. The GitHub Pages site shows the current work directly:

* [Timeline demo](https://tacman.github.io/TimelineJS/demo/static/index.html) - no-build runtime rendering events, eras, media, captions, groups, and overlay chips from a JSON feed
* [Exhibit story demo](https://tacman.github.io/TimelineJS/demo/story/index.html) - no-build runtime rendering a curated bookmark folder as ordered blocks with assets and connectors

## Getting Started

Run the static demos from the repository root:

```sh
php -S 127.0.0.1:8011 -t .
```

Then open:

```text
http://127.0.0.1:8011/demo/static/index.html
http://127.0.0.1:8011/demo/story/index.html
```

## Modern JSON-first runtime

This fork is adding parallel modern runtimes for Symfony/AssetMapper-friendly use cases. The first checkpoint lives under `src/modern/` and intentionally avoids a local npm build for consuming apps. The runtime expects application-owned JSON from an endpoint or static file, not generated embed code from the official authoring tool.

The portable story definition now lives in [tacman/story-contract](https://github.com/tacman/story-contract). That repository defines the framework-neutral JSON/YAML shape for authored stories built from bookmarks, saved searches, blocks, connections, and projections.

PHP/Symfony-specific authoring and publishing concerns live in [survos/exhibit-bundle](https://github.com/survos/exhibit-bundle): Doctrine persistence, OpenFoto/zm bookmark authoring, YAML import/export, reference resolution, Twig components, and projection exporters.

TimelineJS-compatible JSON remains useful as an adapter target, and the old format is documented by Knight Lab at [TimelineJS JSON format](https://timeline.knightlab.com/docs/json-format.html). It is not the canonical authoring format for these story tools.

The timeline renderer imports as native browser ESM and renders events, eras, media, captions, groups, and overlay chips. The exhibit-story runtime demonstrates one projection of the external story contract.

Relevant files:

* `src/modern/story.js` - no-build exhibit story renderer
* `src/modern/story.css` - exhibit story demo styles
* `demo/story/one-building-three-businesses.json` - FotoStory-shaped exhibit contract demo
* `docs/story-contract.md` - pointer to the external story contract and Symfony bundle repos
* `src/modern/index.js` - no-build timeline renderer
* `src/modern/timeline.css` - modern CSS for the prototype runtime
* `demo/static/timeline.json` - JSON feed matching the endpoint contract
* `docs/zm-endpoint.md` - timeline JSON shape expected from zm/API Platform
* `docs/adr/0001-json-first-modern-runtime.md` - architecture decision record

## Upstream TimelineJS

The original TimelineJS project and historical documentation live at [NUKnightLab/TimelineJS3](https://github.com/NUKnightLab/TimelineJS3). This fork keeps the upstream codebase available while the modern runtime evolves alongside it.

## API

For the original TimelineJS API, see [API.md](API.md). For the modern no-build runtime, start with `src/modern/index.js` and `src/modern/story.js`.

## Use via ES6 modules/webpack

To use in a project that uses ES6 modules and webpack, import the `Timeline` class and the CSS as follows

```js
import { Timeline } from '@knight-lab/timelinejs';
import '@knight-lab/timelinejs/dist/css/timeline.css';
```
