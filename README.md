TimelineJS3
============

Based on TimelineJS v3, modernized with JSON-first no-build timeline and exhibit-story demos for Symfony/AssetMapper integrations.

Demo site: https://tacman.github.io/TimelineJS/

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

This fork is adding parallel modern runtimes for Symfony/AssetMapper-friendly use cases. The first checkpoint lives under `src/modern/` and intentionally avoids a local npm build for consuming apps. The runtime expects application-owned JSON from an endpoint or static file, not generated embed code.

For timelines, the required JSON shape follows the [TimelineJS JSON format documented by Knight Lab](https://timeline.knightlab.com/docs/json-format.html)

The minimum useful shape is:

```json
{
  "title": {
    "text": {
      "headline": "Collection timeline",
      "text": "Optional introduction"
    }
  },
  "eras": [],
  "events": [
    {
      "start_date": { "year": "1917", "month": "04", "day": "06" },
      "text": {
        "headline": "United States enters the war",
        "text": "Displayed body copy"
      },
      "media": {
        "url": "https://example.test/media/artifact-123.jpg",
        "caption": "Displayed caption",
        "credit": "Source or rights statement"
      }
    }
  ]
}
```

For exhibit stories, the required JSON shape is:

```json
{
  "story": {},
  "album": {},
  "assets": [],
  "blocks": [],
  "connectors": [],
  "contexts": [],
  "projections": {}
}
```

The timeline renderer imports as native browser ESM and renders events, eras, media, captions, groups, and overlay chips. The exhibit-story runtime models a curated bookmark folder as ordered blocks with assets, contexts, and connectors.

Relevant files:

* `src/modern/story.js` - no-build exhibit story renderer
* `src/modern/story.css` - exhibit story demo styles
* `demo/story/one-building-three-businesses.json` - FotoStory-shaped exhibit contract demo
* `docs/story-contract.md` - exhibit story contract and Symfony UX Twig component boundary
* `src/modern/index.js` - no-build timeline renderer
* `src/modern/timeline.css` - modern CSS for the prototype runtime
* `demo/static/timeline.json` - JSON feed matching the endpoint contract
* `docs/zm-endpoint.md` - timeline JSON shape expected from zm/API Platform
* `docs/adr/0001-json-first-modern-runtime.md` - architecture decision record

The package metadata is not changed yet. Decide the import path and exports only after the first Symfony integration proves the runtime surface.

## Contributing to TimelineJS
Are you trying to contribute to or develop TimelineJS3? [Here's where you should start.](https://github.com/NUKnightLab/TimelineJS3/blob/master/CONTRIBUTING.md)

## API

For users who instantiate a timeline in a page (as opposed to using the iframe embed model), [this page](https://github.com/NUKnightLab/TimelineJS3/blob/master/API.md) roughly documents TimelineJS's JavaScript API, but note that because TimelineJS's primary use case is the embedded iframe, some of these methods have not been thoroughly tested.

## Use via ES6 modules/webpack

To use in a project that uses ES6 modules and webpack, import the `Timeline` class and the CSS as follows

```js
import { Timeline } from '@knight-lab/timelinejs';
import '@knight-lab/timelinejs/dist/css/timeline.css';
```
