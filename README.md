TimelineJS3
============

TimelineJS v3: A Storytelling Timeline built in JavaScript.  https://timeline.knightlab.com

## Overview

TimelineJS is a tool designed to help people with minimal technical skill tell rich, dynamic stories on the web. Most people will create timelines using the [official authoring tool](http://timeline.knightlab.com/#make) and embed their creations using a snip of HTML code offered at the end of that process. 

For users of these content management systems (CMSes), there are plugins to facilitate the embedding process:

* [Wordpress](https://wordpress.org/plugins/knight-lab-timelinejs/)
* [MediaWiki](https://www.mediawiki.org/wiki/Extension:Modern_Timeline)
* [Drupal](https://www.drupal.org/docs/8/modules/views-timelinejs)


## Getting Started

General users of TimelineJS should consult [timeline.knightlab.com](https://timeline.knightlab.com) for instructions and documentation. Information on GitHub is primarily directed at those who are interested in working with the TimelineJS source code.

The [authoritative documentation list](https://timeline.knightlab.com/docs/) is also on the main website, but here are some direct links which may be useful:

* [Available media types](https://timeline.knightlab.com/docs/media-types.html), relevant to users of any technical level
* [Instantiate a Timeline in your page instead of using an embed](https://timeline.knightlab.com/docs/instantiate-a-timeline.html)
* [Configuration options](https://timeline.knightlab.com/docs/options.html) (for more technical users)
* [JSON configuration file format](https://timeline.knightlab.com/docs/json-format.html) for those who prefer not to use Google Sheets

## Modern JSON-first runtime

This fork is adding a parallel modern runtime for Symfony/AssetMapper-friendly use cases. The first checkpoint lives under `src/modern/` and intentionally avoids a local npm build for consuming apps. It imports as native browser ESM, fetches timeline JSON from an endpoint or static file, and renders events, eras, media, captions, groups, and overlay chips.

Run the static demo from the repository root:

```bash
php -S 127.0.0.1:8011 -t .
```

Then open:

```text
http://127.0.0.1:8011/demo/static/index.html
```

Relevant files:

* `src/modern/index.js` - no-build ESM renderer
* `src/modern/timeline.css` - modern CSS for the prototype runtime
* `demo/static/timeline.json` - JSON feed matching the endpoint contract
* `docs/zm-endpoint.md` - JSON shape expected from zm/API Platform
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
