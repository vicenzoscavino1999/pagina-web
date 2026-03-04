# Web Vitals Dashboard

Date: 2026-03-04  
Project: `delivery-web-page`

## 1. Objective

Measure real-user performance (RUM) and keep actionable alerts per release.

## 2. Data Source

Frontend emits Web Vitals from `src/app/webVitalsMonitor.ts` to:

- `VITE_RUM_METRICS_ENDPOINT` (if explicitly configured)
- production fallback: `/api/telemetry/web-vitals`

Serverless intake endpoint:

- `api/telemetry/web-vitals`
- optional forwarding to external platform via `RUM_METRICS_FORWARD_ENDPOINT`
- optional fallback forwarder via `TELEMETRY_FORWARD_ENDPOINT`

Per-event payload fields:

- `name` (`CLS`, `INP`, `LCP`, `FCP`, `TTFB`)
- `value`
- `rating` (`good`, `needs-improvement`, `poor`)
- `delta`
- `id`
- `navigationType` (if present)
- `url`
- `userAgent`
- `environment`
- `appVersion`
- `timestamp`

## 3. KPIs and Suggested SLOs

Target p75 in `production`:

1. LCP <= 2500 ms
2. INP <= 200 ms
3. CLS <= 0.10
4. FCP <= 1800 ms
5. TTFB <= 800 ms

Quality guardrails:

1. `poor` rating share < 10% per metric
2. >20% week-over-week increase triggers regression review

## 4. Minimum Dashboard Views

1. 7d and 30d trends per metric (p50/p75/p95)
2. Rating distribution (`good`, `needs-improvement`, `poor`)
3. Breakdown by `appVersion`, `navigationType`, and URL path
4. Top pages with worst p75 INP and LCP

## 5. Alerts

Platform-level alerts:

1. `LCP p75 > 3000 ms` for 30 minutes
2. `INP p75 > 250 ms` for 30 minutes
3. `% poor > 15%` for any metric over 60 minutes

Server-side immediate alert (optional):

1. Configure `MONITORING_ALERT_WEBHOOK_URL`
2. Trigger when incoming event is `poor` for `LCP`, `INP`, or `CLS`
3. Alert dedupe window controlled by `MONITORING_ALERT_WINDOW_MS` (default 5 min)

## 6. Fast Investigation Protocol

1. Filter dashboard by latest `appVersion`.
2. Confirm whether degradation is localized by URL path or navigation type.
3. Validate artifact and budgets:
   - `npm run build`
   - `npm run perf:budgets`
4. Roll back if impact is sustained and affects a primary KPI.
