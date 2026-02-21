# Postal Express SAC - Frontend Landing

## Stack
- Vite 5 + TypeScript 5 (strict)
- Tailwind CSS v4
- Zod (validacion de contenido)
- Vitest 2 (unit tests)
- Playwright (E2E smoke)
- ESLint + Prettier
- GitHub Actions CI

## Scope
Proyecto frontend puro (sin backend productivo). El widget de tracking usa una simulacion local en `src/modules/TrackingForm.ts`.
Todo el copy de negocio visible se centraliza en `src/content/siteContent.ts` y se inyecta via `src/modules/ContentHydrator.ts`.

## Estructura
```text
src/
  app/       Bootstrap y orquestacion de lifecycle
  modules/   Componentes de comportamiento UI
  content/   Fuente central de contenido de negocio
  utils/     Helpers compartidos (EventBus, dom, math)
  types/     Contratos TypeScript
  styles/    Estilos globales y por seccion
tests/       Tests unitarios
e2e/         Tests E2E smoke (Playwright)
  visual.spec.ts-snapshots/ Baselines para regresion visual
.github/     Pipeline CI
```

## Calidad
- TypeScript estricto (`tsconfig.json`)
- Lint estricto (`eslint.config.js`)
- Tests unitarios en capas criticas:
  - `tests/App.test.ts`
  - `tests/EventBus.test.ts`
  - `tests/ContentHydrator.test.ts`
  - `tests/SiteContentSchema.test.ts`
  - `tests/TrackingForm.test.ts`
  - `tests/ParallaxEngine.test.ts`

## Scripts
- `npm run dev`: servidor de desarrollo
- `npm run build`: typecheck + build de produccion
- `npm run preview`: preview del build
- `npm run typecheck`: validacion TypeScript
- `npm run lint`: analisis estatico
- `npm run test`: tests unitarios
- `npm run test:coverage`: tests con cobertura
- `npm run e2e`: tests E2E smoke (chromium)
- `npm run e2e:install`: instala browser de Playwright
- `npm run e2e:visual:update`: actualiza snapshots base de regresion visual
- `npm run lhci`: ejecuta Lighthouse CI con presupuesto

## Lighthouse Budget Actual
- Performance >= 75
- Accessibility >= 90
- Best Practices >= 90
- SEO >= 95

Siguiente escalon recomendado (cuando se estabilice el score en CI):
- Performance >= 80
- Accessibility >= 92
- Best Practices >= 95
- SEO >= 98

## CI
Pipeline en `.github/workflows/ci.yml`:
1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test:coverage`
5. `npm run build`
6. `npx playwright install --with-deps chromium`
7. `npm run e2e`
8. `npm run lhci`
