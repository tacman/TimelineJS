# zm Timeline Endpoint

TimelineJS modern should consume a JSON document from a Symfony or API Platform endpoint without a local JavaScript build step. The endpoint should return timeline-ready data, not Google Sheets or CSV data that still needs browser-side transformation.

## Route Shape

A practical first endpoint can be collection-scoped:

```text
GET /api/timelines/{code}
Accept: application/json
```

The response body should be a single timeline document:

```json
{
  "title": {
    "text": {
      "headline": "Collection timeline",
      "text": "Optional introduction. HTML is allowed only if the API owns sanitization."
    }
  },
  "accent": "#b43f3f",
  "eras": [],
  "events": []
}
```

## Event Contract

`events` is required and must contain at least one item.

```json
{
  "id": "artifact-123",
  "start_date": { "year": "1917", "month": "04", "day": "06" },
  "end_date": { "year": "1918", "month": "11", "day": "11" },
  "group": "War",
  "media": {
    "url": "https://example.test/media/artifact-123.jpg",
    "thumbnail": "https://example.test/media/artifact-123-thumb.jpg",
    "alt": "Short visual description",
    "caption": "Displayed caption",
    "credit": "Source or rights statement"
  },
  "text": {
    "headline": "United States enters the war",
    "text": "Displayed body copy."
  },
  "overlays": [
    { "label": "Repository", "value": "NARA" },
    { "label": "Confidence", "value": "0.92", "color": "#557a46" }
  ]
}
```

Supported date inputs:

- TimelineJS-style objects: `start_date.year`, `month`, `day`, `hour`, `minute`, `second`.
- ISO-like strings via `startDate` or `date` for simple API producers.
- `end_date` or `endDate` is optional.

Use strings for date parts to stay compatible with existing TimelineJS JSON examples. The renderer also accepts numbers.

## Era Contract

`eras` is optional. Eras are long spans shown near the navigation rail.

```json
{
  "id": "era-wwi",
  "start_date": { "year": "1914", "month": "07", "day": "28" },
  "end_date": { "year": "1918", "month": "11", "day": "11" },
  "text": { "headline": "World War I" }
}
```

An era without both valid dates is ignored by the current runtime.

## Media Rules

Prefer direct image or imgproxy URLs that the browser can load. The first modern renderer treats these as images when the URL ends in `apng`, `avif`, `gif`, `jpg`, `jpeg`, `png`, `svg`, or `webp`. Non-image URLs render as links.

For Symfony/AssetMapper consumption, `zm` should emit resolved public URLs rather than requiring TimelineJS to know about storage backends, local files, or Doctrine entities.

## HTML Policy

The browser runtime can render HTML in `title.text.text` and `event.text.text` for compatibility with TimelineJS content. API producers should sanitize HTML before returning it, or consumers can call:

```js
loadTimeline('#timeline', '/api/timelines/world-war-i', { allowHtml: false });
```

With `allowHtml: false`, rich text fields are rendered as plain text.

## Current Runtime Notes

The first modern runtime normalizes and returns the parsed timeline from `createTimeline()` and `loadTimeline()`. It currently renders:

- title headline and intro text
- event rail markers
- era labels
- event date ranges
- image media, thumbnail fallback, captions, and credits
- event text, group labels, and overlay chips

Package exports and `package.json` should wait until this contract is stable enough for a first Symfony app integration.
