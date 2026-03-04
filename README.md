# Postal Express SAC - Frontend Landing

## Stack
- Vite 5 + TypeScript 5 (strict)
- Tailwind CSS v4
- Zod (validacion de contenido)
- Vitest 2 (unit/integration)
- Playwright (smoke + a11y + visual, matriz Chromium/Firefox/WebKit)
- ESLint + Prettier
- Runtime monitor (frontend, endpoint opcional)
- Web Vitals RUM (`web-vitals`, endpoint opcional)
- GitHub Actions CI

## Scope
Proyecto frontend puro (sin backend productivo). El widget de tracking usa una simulacion local en `src/modules/TrackingForm.ts`.
Todo el copy de negocio visible se centraliza en `src/content/siteContent.ts` y se inyecta via `src/modules/ContentHydrator.ts`.
Para observabilidad en deploy, incluye funciones serverless en `api/telemetry/*`.

## Estructura
```text
src/
  app/       Bootstrap y orquestacion de lifecycle
  modules/   Componentes de comportamiento UI
  content/   Fuente central de contenido de negocio
  utils/     Helpers compartidos (EventBus, dom, math)
  types/     Contratos TypeScript
  styles/    Estilos globales y por seccion
tests/       Tests unitarios e integracion
e2e/         Smoke + a11y + visual regression (Playwright)
api/         Endpoints serverless de observabilidad (runtime + web vitals)
.github/     Pipelines CI
```

## Lanes De Calidad
### Core (bloqueante para PR)
- `npm run ci:core`
- Incluye: `typecheck`, `lint`, `test:core`, `build`, `e2e:smoke`

### Extended (auditoria completa)
- `npm run ci:extended`
- Incluye: `typecheck`, `lint`, `test:coverage`, `build`, `e2e:smoke:extended`, `e2e:a11y`, `e2e:visual`
- Cobertura real sobre `src/**/*.ts` (`all: true`) con thresholds globales:
  - `statements >= 90`
  - `lines >= 90`
  - `branches >= 90`
  - `functions >= 85`

### Extended Strict (incluye Lighthouse)
- `npm run ci:extended:strict`
- Incluye todo el carril `extended` + `lhci`

### Release Gate (bloqueante para deploy)
- Trigger por GitHub Actions (`workflow_dispatch`, lane `release` o `all`)
- Requiere aprobar:
  - `Core Quality`
  - `Core E2E Smoke`
  - `Extended Quality`
  - `Extended E2E Smoke`
  - `Extended E2E Accessibility`
  - `Extended E2E Visual`
  - `Extended Lighthouse` (bloqueante en release)

## Scripts Clave
- `npm run dev`: servidor de desarrollo
- `npm run build`: typecheck + build de produccion
- `npm run typecheck`: validacion TypeScript
- `npm run lint`: analisis estatico
- `npm run test:core`: suite minima bloqueante
- `npm run test:extended`: suite completa de Vitest
- `npm run test:coverage`: suite completa con cobertura
- `npm run e2e:smoke`: smoke core bloqueante (Chromium)
- `npm run e2e:smoke:extended`: smoke completo (Chromium + Firefox + WebKit)
- `npm run e2e:a11y`: auditoria Axe en estados clave (Chromium + Firefox + WebKit)
- `npm run e2e:visual`: regresion visual (Chromium)
- `npm run e2e:visual:update`: actualiza snapshots base
- `npm run lhci`: auditoria Lighthouse desktop + mobile (3 corridas por perfil)
- `npm run lhci:desktop`: auditoria Lighthouse desktop
- `npm run lhci:mobile`: auditoria Lighthouse mobile
- `npm run ops:release-check -- --url https://tu-dominio.com`: verificacion post-deploy en URL real
- `npm run security:runtime`: auditoria de vulnerabilidades runtime (high/critical)
- `npm run release:notes -- --version 1.4.0`: genera `release-notes.md`
- `npm run release:changelog -- --version 1.4.0`: genera notas y actualiza `CHANGELOG.md`
- `npm run release:readiness -- --version 1.4.0`: valida checklist minimo de release

## Visual Regression
- Las capturas visuales ya no ocultan todas las imagenes globalmente.
- Se estabiliza por test con:
  - `prefers-reduced-motion`
  - desactivacion de animaciones/transiciones
  - espera explicita de carga/decode de imagenes por seccion

## Seguridad Frontend
- Sanitizacion de contenido dinamico en `src/modules/content/sanitize.ts`:
  - escape de texto/atributos
  - sanitizacion de `href`
  - sanitizacion de clases
  - HTML limitado solo a saltos de linea (`<br>`)
- Validacion reforzada de `siteContent` en `src/content/siteContentSchema.ts`:
  - campos de texto plano rechazan etiquetas HTML
  - campos `*Html` solo permiten `<br>`
- Headers de seguridad para despliegue en Vercel: `vercel.json` (CSP, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`).

## Operacion y Observabilidad
- Monitor de errores runtime en `src/app/runtimeMonitor.ts`:
  - captura `error` y `unhandledrejection`
  - redaccion basica de secretos/correos
  - deduplicacion y limite por sesion
- Monitor de performance real (RUM) en `src/app/webVitalsMonitor.ts`:
  - captura `CLS`, `INP`, `LCP`, `FCP`, `TTFB`
  - en `production` usa fallback `/api/telemetry/web-vitals` si no hay endpoint explicito
- Handler runtime: `api/telemetry/runtime`
- Handler web vitals: `api/telemetry/web-vitals`
- Configuracion opcional por entorno:
  - `VITE_RUNTIME_MONITORING_ENDPOINT`
  - `VITE_RUM_METRICS_ENDPOINT`
  - `VITE_APP_VERSION`
  - `RUNTIME_MONITOR_FORWARD_ENDPOINT`
  - `RUM_METRICS_FORWARD_ENDPOINT`
  - `TELEMETRY_FORWARD_ENDPOINT`
  - `MONITORING_ALERT_WEBHOOK_URL`
  - `MONITORING_ALERT_WINDOW_MS`
- Runbook operativo: `docs/OPERATIONS_RUNBOOK.md`
- Dashboard guidance de Web Vitals: `docs/WEB_VITALS_DASHBOARD.md`

## Supply Chain Security
- Dependabot activo para `npm` y `github-actions`: `.github/dependabot.yml`
- Auditoria de vulnerabilidades runtime (sin dev deps) en `scripts/check-runtime-dependencies.mjs`
- En release lane, CI bloquea despliegue si hay vulnerabilidades runtime `high/critical`

## CI En GitHub Actions
Pipeline en `.github/workflows/ci.yml`:
- `push` / `pull_request`: corre carril `core` (`Core Quality` + `Core E2E Smoke`)
- `schedule`: corre carril `extended` (`Extended Quality` + `Extended E2E Smoke` + `Extended E2E Accessibility` + `Extended E2E Visual` + `Extended Lighthouse`)
- `workflow_dispatch`: permite elegir `lane = core | extended | release | all`
  - para `release`/`all` acepta `release_version` (ej. `1.4.0`)
  - ejecuta `Release Preparation` (release notes + changelog artifact + readiness check)
- Workflow adicional de salud post-deploy: `.github/workflows/post-deploy-health.yml`
  - `workflow_dispatch` con `target_url`
  - `schedule` diario usando variable de repo `PRODUCTION_URL`
- En lane `release`, job adicional `Release Security` ejecuta `npm run security:runtime`

Notas:
- En `schedule` y en lane `extended`, `Extended Lighthouse` es informativo (`continue-on-error`) para no frenar iteracion diaria.
- En lane `release` (y `all` manual), Lighthouse es bloqueante y forma parte del gate final.
- En lane `extended`/`release`, smoke y a11y validan `chromium`, `firefox` y `webkit`.

## Release Management
- Changelog versionado en `CHANGELOG.md`.
- Generacion automatica de notas basada en commits:
  - script: `scripts/generate-release-notes.mjs`
  - salida recomendada: `release-notes.md`
- Checklist automatico de release readiness:
  - script: `scripts/check-release-readiness.mjs`
  - valida archivos operativos/seguridad y presencia de release notes
- Proceso formal de release: `docs/RELEASE_PROCESS.md`

## Lighthouse Budget Actual
- Performance desktop >= 75
- Performance mobile >= 70
- Accessibility >= 90
- Best Practices >= 90
- SEO >= 95
- LCP desktop <= 2500ms
- LCP mobile <= 3500ms
- CLS desktop <= 0.1
- CLS mobile <= 0.25
