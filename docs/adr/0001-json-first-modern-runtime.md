# 0001: JSON-First Modern Runtime

## Status

Proposed

## Context

TimelineJS already models the desired storytelling surface better than Storyline: events, media, descriptions, eras, and date ranges are first-class. The modernization goal is to make that runtime easy to install in Symfony applications without a local JavaScript build.

Symfony or zm should produce timeline-friendly JSON from an endpoint. The browser package should render that JSON with native browser modules and fresh modern CSS.

## Decision

Add a parallel modern runtime under `src/modern/` and a no-build static demo under `demo/static/`.

This path is JSON-first and endpoint-friendly. It does not prioritize Google Sheets, CSV, legacy browser support, or the existing Webpack/LESS build.

## Consequences

- zm/API Platform can become the producer of timeline JSON.
- Symfony applications can install the library and point it at an endpoint.
- CSS can be rewritten as modern browser CSS instead of preserving legacy LESS internals.
- The existing TimelineJS runtime remains available while the modern runtime grows feature parity around the pieces we actually need.
