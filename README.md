# Agent Gov Graph website

Static HTML, CSS and inline SVG. No framework, JavaScript runtime, package installation or compilation is required to serve the site.

## Local preview

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. The original project background and reference links remain at `background.html`.

## Validation

```sh
python3 scripts/validate.py
```

For browser checks, use an existing Playwright installation (optional development tooling only):

```sh
PLAYWRIGHT_PATH=/absolute/path/to/playwright CHROME_PATH=/absolute/path/to/chrome node scripts/browser-check.cjs
```

Run the preview server first. Browser checks cover 320, 390, 768, 1024 and 1440px layouts, anchor navigation, the background-page round trip, reduced motion and local request errors. Screenshots are saved in `validation/`. See `validation/REVIEW.md` for the design comparison and remaining differences.

## Release

The repository uses GitHub Pages from `main`, root directory. Review the redesign through its pull request. Merge and deployment require owner approval; this branch does not change publishing configuration. The static files themselves are the build output.
