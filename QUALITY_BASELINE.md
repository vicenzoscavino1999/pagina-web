# Quality Baseline

Date: 2026-03-04  
Project: `delivery-web-page`

## Commands executed

- `npm run typecheck`
- `npm run lint`
- `npm run test:core`
- `npm run test:coverage`
- `npm run build`
- `npm run e2e:smoke`

## Baseline results

### Static checks

- Typecheck: pass
- Lint: pass (`--max-warnings=0`)

### Unit and integration tests

- Core suite: 6 files, 23 tests, all passing
- Coverage suite: 33 files, 134 tests, all passing

Coverage summary (`vitest --coverage`):

- Statements: 97.77%
- Branches: 99.09%
- Functions: 98.80%
- Lines: 97.77%

### E2E smoke

- Playwright smoke core: 6/6 passing

### Build

- Production build: pass (`vite build`)
- Main JS chunk (gzip): ~73.27 kB
- Main CSS chunk (gzip): ~11.95 kB
- Deferred CSS chunk (gzip): ~10.19 kB

### Lighthouse (latest local report)

Source report: `.lighthouseci/localhost--2026_03_04_18_40_37.report.json`

- Performance: 0.89
- Accessibility: 0.95
- Best Practices: 0.96
- SEO: 1.00
- LCP: 1.0 s
- CLS: 0.019
- TBT: 210 ms

## Known quality debt at baseline

- Duplicated core smoke scenarios across `e2e/smoke.core.spec.ts` and `e2e/smoke.spec.ts`.
- Coverage config uses curated include list (`all: false`), not full-repo coverage.
- Lighthouse workflow is informational in CI for non-release lanes.

## Phase 2 updates (2026-03-04)

- Coverage hardening applied:
  - `all: true`
  - include: `src/**/*.ts`
  - thresholds: `statements 90`, `lines 90`, `branches 90`, `functions 85`
- Visual regression hardening applied:
  - removed global `img { visibility: hidden }`
  - waits for section images to settle/decode before snapshots
  - hero cinematic snapshot neutralizes dynamic canvas/webgl layers to avoid GPU flakiness
- Validation after updates:
  - `npm run test:coverage`: pass
  - `npm run e2e:visual`: pass (12/12)

## Phase 3 updates (2026-03-04)

- Content rendering hardening:
  - Added `src/modules/content/sanitize.ts`.
  - Escaped dynamic text/attributes before interpolation into `innerHTML`.
  - Restricted HTML-enabled copy rendering to line-break-only fields (`<br>`).
  - Sanitized potentially dangerous dynamic `href`, class and percentage values in templates.
- Schema hardening:
  - `siteContentSchema` now rejects HTML tags in plain text fields.
  - `*Html` fields accept only line-break tags.
  - Added schema tests for malicious HTML rejection.
- Deployment hardening:
  - Added `vercel.json` security headers (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`).
- Validation after updates:
  - `npm run lint`: pass
  - `npm run test:core`: pass
  - `npm run test:coverage`: pass
  - `npm run e2e:smoke`: pass
  - `npm run e2e:visual`: pass (12/12)

## Phase 4 updates (2026-03-04)

- Performance budget gate added:
  - script: `scripts/check-performance-budgets.mjs`
  - npm script: `npm run perf:budgets`
  - integrated in `ci:core`, `ci:extended` and CI workflow jobs (`core-quality`, `extended-quality`)
- Media runtime optimization:
  - removed heavy source originals from runtime path `public/media`
  - responsive assets generated under `public/media/optimized`
  - content fallbacks updated to optimized assets (`siteContent`, `index.html`)
- Validation after updates:
  - `npm run build`: pass
  - `npm run perf:budgets`: pass
  - Budget report (latest):
    - Main JS gzip: 77.15 KiB (limit 90 KiB)
    - Total JS gzip: 87.17 KiB (limit 110 KiB)
    - Main CSS gzip: 20.90 KiB (limit 24 KiB)
    - Largest referenced media file: 698.44 KiB (limit 800 KiB)
    - Total referenced media size: 2854.68 KiB (limit 3072 KiB)
    - Files > 1 MiB in `public/media`: 0

## Phase 5 updates (2026-03-04)

- Accessibility quality gate added with Axe + Playwright:
  - new spec: `e2e/a11y.spec.ts`
  - npm script: `npm run e2e:a11y`
  - CI job: `Extended E2E Accessibility` (schedule + release lane)
  - release gate now requires a11y job success
- Rule severity strategy:
  - blocks only Axe impacts `serious` and `critical` to keep daily iteration practical
- Validation after updates:
  - `npm run e2e:a11y`: pass
  - `npm run test:core`: pass
  - `npm run e2e:smoke`: pass
  - `npm run e2e:visual`: pass (12/12)
  - `npm run build`: pass
  - `npm run perf:budgets`: pass

## Phase 6 updates (2026-03-04)

- Operations and observability hardening:
  - Added browser runtime monitor: `src/app/runtimeMonitor.ts`.
    - Captures `window.error` and `unhandledrejection`.
    - Redacts common sensitive tokens (`token`, `password`, `secret`) and emails.
    - Applies deduplication window and per-session event cap.
    - Sends only when monitoring endpoint is configured.
  - Wired monitor in bootstrap: `src/main.ts`.
  - Added test coverage for runtime monitor: `tests/RuntimeMonitor.test.ts`.
  - Added release health checker script: `scripts/check-release-health.mjs`.
    - Validates real deployed URL for:
      - availability (2xx)
      - security headers
      - critical DOM markers
      - optimized media references
      - manifest and `registerSW.js` reachability
  - Added operations script: `npm run ops:release-check`.
  - Added post-deploy workflow: `.github/workflows/post-deploy-health.yml`.
    - Manual execution (`target_url`)
    - Daily schedule using repo variable `PRODUCTION_URL`
  - Added operations runbook: `docs/OPERATIONS_RUNBOOK.md`.
  - Added optional env vars in `.env.example`:
    - `VITE_RUNTIME_MONITORING_ENDPOINT`
    - `VITE_APP_VERSION`

- Validation after updates:
  - `npm run lint`: pass
  - `npm run test:core`: pass
  - `npm run build`: pass
  - `npm run perf:budgets`: pass

## Phase 7 updates (2026-03-04)

- Supply-chain security hardening:
  - Added runtime dependency vulnerability check:
    - script: `scripts/check-runtime-dependencies.mjs`
    - command: `npm run security:runtime`
    - blocks `high`/`critical` severities from `npm audit --omit=dev`
  - Added Dependabot automation:
    - file: `.github/dependabot.yml`
    - weekly updates for `npm` and `github-actions`
    - grouped update strategy for tooling/build/runtime dependencies
  - Release lane hardening:
    - added `Release Security` job in `.github/workflows/ci.yml`
    - `Release Gate` now requires `Release Security`
    - keeps daily iteration fast by applying this gate only to `release` / `all` manual lanes

- Validation after updates:
  - `npm run security:runtime`: pass
  - `npm run lint`: pass
  - `npm run test:core`: pass
  - `npm run e2e:smoke`: pass
  - `npm run e2e:a11y`: pass
  - `npm run build`: pass
  - `npm run perf:budgets`: pass

## Phase 8 updates (2026-03-04)

- Real User Monitoring (RUM) for Web Vitals:
  - Added `src/app/webVitalsMonitor.ts`.
  - Captures `CLS`, `INP`, `LCP`, `FCP`, `TTFB` using `web-vitals`.
  - Sends metrics only when `VITE_RUM_METRICS_ENDPOINT` is configured.
  - Includes deduplication and per-session cap to avoid noisy telemetry.
  - Sanitizes URL query params for common sensitive keys.
- Bootstrap integration:
  - `src/main.ts` now installs both runtime error monitor and Web Vitals monitor.
- Test coverage:
  - Added `tests/WebVitalsMonitor.test.ts` covering:
    - payload construction/sanitization
    - optional mode with no endpoint
    - transport dispatch
    - deduplication
    - session cap
    - graceful import failure handling
- Ops documentation:
  - Added `docs/WEB_VITALS_DASHBOARD.md` with KPI targets and alerting guidance.
  - Extended runbook with RUM env var + performance follow-up protocol.

- Validation after updates:
  - `npm run security:runtime`: pass
  - `npm run lint`: pass
  - `npm run test:core`: pass
  - `npm run test:coverage`: pass
  - `npm run e2e:smoke`: pass
  - `npm run e2e:a11y`: pass
  - `npm run e2e:visual`: pass
  - `npm run build`: pass
  - `npm run perf:budgets`: pass

## Phase 9 updates (2026-03-04)

- Release management automation:
  - Added release notes generator: `scripts/generate-release-notes.mjs`.
    - commit-based sections (`features`, `fixes`, `perf`, `security`, etc.)
    - supports output file and changelog prepend mode
  - Added release readiness validator: `scripts/check-release-readiness.mjs`.
    - validates version format, required release docs/files, and release-notes presence
  - Added initial changelog file: `CHANGELOG.md`
- CI release lane hardening:
  - Extended `workflow_dispatch` input with `release_version`.
  - Added `Release Preparation` job in `.github/workflows/ci.yml`:
    - generates `release-notes.md`
    - runs release readiness check
    - uploads `release-notes.md` + `CHANGELOG.md` as artifact
  - `Release Gate` now requires `Release Preparation`.
- Operational docs:
  - Added `docs/RELEASE_PROCESS.md`.
  - Linked release versioning flow in `README.md` and `docs/OPERATIONS_RUNBOOK.md`.
  - Added package scripts:
    - `release:notes`
    - `release:changelog`
    - `release:readiness`

- Validation after updates:
  - `node scripts/generate-release-notes.mjs --version 1.0.0 --out .tmp-release-notes.md`: pass
  - `node scripts/check-release-readiness.mjs --version 1.0.0 --notes-file .tmp-release-notes.md`: pass
  - `npm run lint`: pass
  - `npm run test:core`: pass
  - `npm run e2e:smoke`: pass
  - `npm run e2e:a11y`: pass
  - `npm run build`: pass
  - `npm run perf:budgets`: pass
  - `npm run security:runtime`: pass
