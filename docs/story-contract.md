# Story Contract

The canonical story definition no longer lives in this TimelineJS fork.

Use the standalone contract repository instead:

```text
https://github.com/tacman/story-contract
```

That repository defines the framework-neutral JSON/YAML story model for:

- OpenFoto and zm bookmarks
- saved searches
- authored story blocks
- reference expansion
- JSON-LD identity and export
- projections such as story pages, Omeka S, TimelineJS, and static HTML

PHP/Symfony-specific authoring, persistence, reference resolution, Twig
components, and export services belong in:

```text
https://github.com/survos/exhibit-bundle
```

This TimelineJS fork should only consume or demonstrate projections from the
story contract. It should not be treated as the source of truth for the story
definition.
