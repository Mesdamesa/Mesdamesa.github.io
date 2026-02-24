# REFactor Summary

## Structural changes made
- Created immutable pre-refactor snapshot at `archive/original-version/` and preserved the full legacy tree.
- Introduced normalized top-level architecture: `assets/`, `components/`, `layouts/`, `pages/`.
- Centralized shared styling into `assets/css/site.css` and extracted responsive helpers into `assets/css/responsive-layout.css`.
- Added compatibility layer `assets/css/bootstrap-legacy-compat.css` and `assets/js/bootstrap-legacy-bridge.js` to preserve legacy Bootstrap 3/4-era markup behavior under Bootstrap 5.
- Removed inline JavaScript blocks from live HTML pages and extracted them to modular files in `assets/js/inline/`.
- Preserved live entry points used by the current site crawl from `index.html` and normalized local asset paths to relative references for consistent rendering.
- Pruned repository contents to files required by the current rendered site graph (homepage plus linked creation pages and their assets), while keeping legacy material in `archive/original-version/`.

## Dependency upgrades
- Standardized Bootstrap references to one version: `5.3.3` (CSS + bundle JS) across live HTML pages.
- Removed duplicate/conflicting local Bootstrap runtime files and stale duplicate legacy vendor trees.
- Kept jQuery only where legacy page behavior still depends on it.

## Files removed and justification
- Removed unreferenced legacy dependency directories and duplicate vendor trees:
  - `css/_old/`, `css/delete/`, `js/_old/`, `js/delete/`, `js/original/`, `img/_old/`
- Removed obsolete local Bootstrap runtime files no longer referenced after consolidation:
  - `css/bootstrap*.css*`, `css/bootstrap-theme*.css*`, `js/bootstrap*.js`, `js/npm.js`, `js/vendor/jquery.js`
- Removed all files not reachable from the current `index.html` dependency graph (1010 files in the latest prune pass), including obsolete duplicate mirrors under `assets/images/` and unused legacy root pages.
- Verified removal safety via repository-wide reference checks and post-change local reference validation.

## Content isolation audit results
- Local asset reference resolution check after prune: **pass** (`missing_count 0` for all non-archive `.html` and `.css` local refs).
- Homepage crawl includes linked creation pages and their dependent images/PDF/video assets, including `srcset` resources.
- Live-site styling dependencies (Bootstrap + `assets/css/site.css` + imported responsive CSS + referenced image assets) remain present and linked.

## Technical risks
- Legacy pages still contain historical HTML validity issues (pre-existing malformed markup patterns and outdated constructs); changes were limited to production-safe refactor scope to avoid content/layout regressions.
- Current cleanup is intentionally crawl-based from `index.html`; pages not linked from the current homepage were removed from the live tree and now exist only in archive.
- Third-party CDN availability (Bootstrap, fonts, tracking) still affects runtime rendering independently of local asset integrity.

## Recommended future improvements (not implemented)
- Introduce a static build step (e.g., Eleventy or Astro static output mode) to truly componentize shared nav/footer without JS include hacks.
- Finish full inline style migration and class normalization with visual regression screenshots.
- Add automated CI checks:
  - link/reference validation
  - HTML linting/validation
  - Lighthouse mobile/desktop budgets
- Add deterministic image pipeline (source originals + generated derivatives) and de-duplication strategy.
