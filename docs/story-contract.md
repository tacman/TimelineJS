# Exhibit Story Contract

This contract describes a curated story or exhibit, not just a timeline. It is intended to support Fortepan FotoStory-like exhibits, Omeka-style exhibit builders, Symfony UX Twig components, and optional JavaScript projections such as timeline sliders or connector diagrams.

The canonical object is a story document assembled from a curated album of bookmarked assets. PHP owns creation, curation, persistence, permissions, publishing, and server-rendered HTML. JavaScript owns interaction and progressive enhancement.

## Boundary

PHP/Symfony should own:

- story records, drafts, revisions, publishing, and permissions
- album or bookmark folder membership
- asset metadata, captions, credits, rights, and resolved media URLs
- ordered blocks and section structure
- connectors between blocks, assets, dates, people, places, and claims
- reusable context blocks and editorial notes
- Symfony UX Twig components and server-rendered fallback HTML
- API endpoints that export the normalized story document

JavaScript should own:

- hydrating a rendered Twig story component
- rendering from JSON for static demos or embedded clients
- image comparison, galleries, carousels, lightboxes, and fit/fill controls
- scroll state, active block state, keyboard controls, and viewport behavior
- optional timeline, map, graph, and connector projections

Rule of thumb: editorial meaning belongs in PHP and the JSON contract. Interaction behavior belongs in JS.

## Top-level Shape

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

## Story

`story` describes the exhibit as a whole.

```json
{
  "id": "one-building-three-businesses",
  "title": "Three Businesses, One Building",
  "subtitle": "Broadie's, Harrison's, and Stauffer's Pharmacy",
  "dek": "A curated history of one Waverly storefront through photos, memories, and sources.",
  "status": "published",
  "credits": ["FotoStory by Paige Hibbs"],
  "source_url": "https://fortepan.us/exhibits/25-one-building-three-businesses"
}
```

## Album

`album` is the folder of bookmarked assets used to build the story. It can come from a FotoAlbum, a Zotero collection, a folder, a search result, or an application-specific curation list.

```json
{
  "id": "broadie-building-bookmarks",
  "title": "Broadie Building bookmarks",
  "asset_ids": ["FI0021005", "FI0022551"]
}
```

## Assets

Assets are durable references to photos, documents, videos, audio, or other media.

```json
{
  "id": "FI0021005",
  "type": "image",
  "title": "Waverly, IA, 1909",
  "date": "1909",
  "creator": "Waverly Public Library/Fortepan IA",
  "source_url": "https://fortepan.us/categories/all/FI0021005",
  "media_url": "",
  "rights": "CC-BY-SA 4.0",
  "caption": "The Broadie Building at 122 East Bremer."
}
```

`media_url` should be a browser-loadable image or derivative URL when available. `source_url` is the canonical record URL.

## Blocks

Blocks are the ordered editorial units of the exhibit. A rendered story is primarily the ordered `blocks` array, not chronological sorting.

Common block types:

- `hero`
- `section`
- `text`
- `image_text`
- `image_full`
- `gallery`
- `quote`
- `quote_group`
- `comparison`
- `timeline_strip`
- `connector_list`
- `credits`

A block can reference one asset, many assets, connectors, or contexts.

```json
{
  "id": "block-broadies-intro",
  "type": "image_text",
  "asset_id": "FI0022551",
  "title": "An entrepreneurial druggist anchors downtown Waverly",
  "body": "A. A. Broadie was a prolific businessman and druggist living in Waverly at the turn of the 20th century.",
  "context_ids": ["ctx-broadie-building"],
  "connector_ids": ["conn-same-building"]
}
```

## Contexts

Contexts are reusable explanatory notes. They may attach to the whole story, a block, an asset, a connector, or a projection.

```json
{
  "id": "ctx-broadie-building",
  "type": "place",
  "title": "122 East Bremer",
  "body": "The same downtown building anchors the Broadie's, Harrison's, and Stauffer's sections."
}
```

## Connectors

Connectors make relationships explicit. They are first-class editorial claims, not just display edges.

```json
{
  "id": "conn-business-succession-1957",
  "type": "business_succession",
  "from": "business-broadies",
  "to": "business-harrisons",
  "date": "1957",
  "label": "Broadie's space becomes part of Harrison's",
  "body": "Harrison's spread into the Broadie storefront after renovation work joined the adjacent spaces.",
  "confidence": 1
}
```

Useful connector types include:

- `same_place`
- `business_succession`
- `supports_claim`
- `documents`
- `mentions`
- `same_person_as`
- `part_of`
- `overlaps`
- `precedes`
- `contradicts`

## Projections

Projections describe optional views over the same story data. A projection may be a FotoStory page, a timeline strip, a map, a graph, or a comparison view.

```json
{
  "projections": {
    "story": { "component": "ExhibitStory" },
    "timeline": {
      "type": "strip",
      "items": [
        { "label": "Broadie's", "start": "1900", "end": "1950", "block_id": "section-broadies" },
        { "label": "Harrison's", "start": "1957", "end": "1973", "block_id": "section-harrisons" }
      ]
    }
  }
}
```

## Symfony UX Twig Component Target

A Symfony app should be able to render the story with a component such as:

```twig
<twig:ExhibitStory :story="story" />
```

The component should render meaningful HTML on the server. It can include a JSON script tag or API URL for hydration:

```twig
<article data-exhibit-story data-story-url="{{ path('api_story_show', { id: story.id }) }}">
  {# server-rendered blocks #}
</article>
```

The JavaScript package then enhances behavior:

```js
import { hydrateStory } from '@survos/exhibit-runtime';

hydrateStory('[data-exhibit-story]');
```

A pure JSON render path is still useful for demos, embeds, and tests:

```js
import { loadStory } from '@survos/exhibit-runtime';

loadStory('#story', '/api/stories/one-building-three-businesses');
```

## Current Static Demo

This repository includes a no-build demo that exercises the contract without Symfony:

```text
demo/story/index.html
demo/story/one-building-three-businesses.json
src/modern/story.js
src/modern/story.css
```

Run it from the repository root:

```bash
php -S 127.0.0.1:8011 -t .
```

Then open:

```text
http://127.0.0.1:8011/demo/story/index.html
```

The demo intentionally uses placeholder asset cards when `media_url` is empty. In a Symfony application, the exporter should provide resolved image derivative URLs, preferably through the app's existing media, storage, or imgproxy layer.

## Implementation Notes for the Next Developer

Start with the server-rendered component, not with a larger JavaScript app. A useful first Symfony implementation would include:

- an `ExhibitStory` UX Twig component that accepts the normalized story document or a Story entity/view model
- Twig templates for the first block types: `image_full`, `section`, `image_text`, `quote_group`, `timeline_strip`, `connector_list`, and `credits`
- a serializer or API endpoint that emits the same JSON shape as `demo/story/one-building-three-businesses.json`
- stable `data-*` attributes on rendered blocks, assets, contexts, and connectors for later JS hydration
- a tiny JS `hydrateStory()` enhancement pass after real Twig markup exists

Avoid making JavaScript the canonical editor or persistence format. The PHP model should stay authoritative for ordering, block content, connectors, permissions, drafts, and publishing. JavaScript should enhance interaction and optional projections over that content.
