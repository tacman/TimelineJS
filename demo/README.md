## Demo pages

- `demo/static/index.html` - no-build timeline demo that reads `timeline.json`
- `demo/story/index.html` - no-build exhibit story demo that reads an ordered block/connector JSON document

Start a local server from the repository root:

```bash
php -S 127.0.0.1:8011 -t .
```

Then open:

- `http://127.0.0.1:8011/demo/static/index.html`
- `http://127.0.0.1:8011/demo/story/index.html`
