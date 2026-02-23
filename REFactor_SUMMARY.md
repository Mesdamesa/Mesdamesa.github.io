# REFactor Summary

## Structural changes made
- Created immutable pre-refactor snapshot at `archive/original-version/` and preserved the full legacy tree.
- Introduced normalized top-level architecture: `assets/`, `components/`, `layouts/`, `pages/`.
- Centralized shared styling into `assets/css/site.css` and extracted responsive helpers into `assets/css/responsive-layout.css`.
- Added compatibility layer `assets/css/bootstrap-legacy-compat.css` and `assets/js/bootstrap-legacy-bridge.js` to preserve legacy Bootstrap 3/4-era markup behavior under Bootstrap 5.
- Removed inline JavaScript blocks from live HTML pages and extracted them to modular files in `assets/js/inline/`.
- Preserved URL structure and page entry points (`index.html`, existing `creations/*/index.html`, legacy root HTML files).

## Dependency upgrades
- Standardized Bootstrap references to one version: `5.3.8` (CSS + bundle JS) across refactored HTML pages.
- Removed duplicate/conflicting local Bootstrap runtime files and stale duplicate legacy vendor trees.
- Kept jQuery only where legacy page behavior still depends on it.

## Files removed and justification
- Removed unreferenced legacy dependency directories and duplicate vendor trees:
  - `css/_old/`, `css/delete/`, `js/_old/`, `js/delete/`, `js/original/`, `img/_old/`
- Removed obsolete local Bootstrap runtime files no longer referenced after consolidation:
  - `css/bootstrap*.css*`, `css/bootstrap-theme*.css*`, `js/bootstrap*.js`, `js/npm.js`, `js/vendor/jquery.js`
- Verified removal safety via repository-wide reference checks and post-change local reference validation.

## Content isolation audit results
- Visible text parity check against archive: **pass** (`scripts/compare_visible_text.py`).
- Local asset reference resolution check: **pass** (`scripts/validate_local_refs.py`).
- Added referenced image mirror under `assets/images/` and filled missing legacy aliases required by existing URLs.

## Technical risks
- Legacy pages still contain historical HTML validity issues (pre-existing malformed markup patterns and outdated constructs); changes were limited to production-safe refactor scope to avoid content/layout regressions.
- Some image/pdf aliases were added to satisfy existing references; they preserve routing but increase repository size.
- Legacy inline style attributes remain in a few pages where migration could affect fragile third-party widget markup; behavior was prioritized over aggressive rewriting.

## Recommended future improvements (not implemented)
- Introduce a static build step (e.g., Eleventy or Astro static output mode) to truly componentize shared nav/footer without JS include hacks.
- Finish full inline style migration and class normalization with visual regression screenshots.
- Add automated CI checks:
  - link/reference validation
  - HTML linting/validation
  - Lighthouse mobile/desktop budgets
- Add deterministic image pipeline (source originals + generated derivatives) and de-duplication strategy.
