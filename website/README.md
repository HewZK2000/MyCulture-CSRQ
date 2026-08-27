# MyCulture × CSRQ project site

The site contains the paper homepage and the dedicated MyCulture benchmark page.

## Local development

```bash
npm install
npm run dev
```

## Builds

- `npm run build` validates the Sites deployment build.
- `npm run build:github` produces a static GitHub Pages export in `out/`.

The repository-level GitHub Actions workflow deploys `website/out` on pushes to `main`.
