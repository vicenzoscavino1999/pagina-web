# Operations Runbook

Date: 2026-03-04  
Project: `delivery-web-page`

## 1. Objetivo

Definir un procedimiento minimo y repetible para:

- liberar cambios frontend sin regresiones visibles;
- verificar salud del deploy real;
- responder incidentes con rollback rapido.

## 2. Pre-Deploy Gate

Antes de desplegar a produccion, ejecutar:

1. `npm run ci:core`
2. `npm run ci:extended`
3. `npm run ci:extended:strict` (si se requiere release formal con Lighthouse bloqueante)
4. `npm run security:runtime` (vulnerabilidades runtime high/critical)

En GitHub Actions, para release formal:

1. `workflow_dispatch` en `CI`
2. `lane = release`
3. `release_version = x.y.z`
4. confirmar jobs verdes en `Release Gate`

Referencia de proceso completo: `docs/RELEASE_PROCESS.md`.

## 3. Post-Deploy Health Check

Comando manual:

```bash
npm run ops:release-check -- --url https://tu-dominio.com
```

Este chequeo valida:

- respuesta 2xx de home;
- headers de seguridad esperados;
- contrato DOM critico;
- referencias a assets optimizados;
- disponibilidad de `manifest.webmanifest` y `registerSW.js`.

Automatizacion en GitHub Actions:

- Workflow: `.github/workflows/post-deploy-health.yml`
- Manual: input `target_url`
- Programado diario: usa repo variable `PRODUCTION_URL`

## 4. Runtime Monitoring (Frontend)

Integrado en bootstrap de app: `src/app/runtimeMonitor.ts`.
Endpoint serverless en deploy: `api/telemetry/runtime`.

Comportamiento:

- captura `window.error` y `unhandledrejection`;
- redacciona secretos comunes (`token`, `password`, `secret`) y correos;
- deduplica eventos repetidos;
- aplica limite de eventos por sesion.
- envia a `/api/telemetry/runtime` en `production` aun sin config explicita.

Variables opcionales:

- `VITE_RUNTIME_MONITORING_ENDPOINT` (override del endpoint frontend)
- `VITE_RUM_METRICS_ENDPOINT` (override del endpoint frontend)
- `VITE_APP_VERSION`
- `RUNTIME_MONITOR_FORWARD_ENDPOINT` (env de servidor, forwarding)
- `RUM_METRICS_FORWARD_ENDPOINT` (env de servidor, forwarding)
- `TELEMETRY_FORWARD_ENDPOINT` (fallback para ambos handlers)
- `MONITORING_ALERT_WEBHOOK_URL` (alertas)
- `MONITORING_ALERT_WINDOW_MS` (dedupe de alertas server-side, por defecto 5 min)

Si no hay forwarding configurado, los handlers aceptan eventos y responden `202`
sin bloquear UX. Alertas son opcionales.

## 5. Incident Response

### 5.1 Severidad

- `SEV-1`: caida total, home inaccesible, bug critico de conversion.
- `SEV-2`: degradacion parcial, tracking o navegacion principal afectada.
- `SEV-3`: defectos visuales o no bloqueantes.

### 5.2 Flujo

1. Confirmar incidente con `ops:release-check` sobre URL real.
2. Revisar ultimo deploy en Vercel.
3. Si es `SEV-1/SEV-2`, ejecutar rollback inmediato desde dashboard Vercel (promote previous deployment).
4. Re-ejecutar `ops:release-check`.
5. Revisar webhook de alertas y payloads forwardeados para identificar `appVersion` y URL afectadas.
6. Abrir issue postmortem con:
   - impacto;
   - ventana temporal;
   - causa raiz;
   - accion preventiva.

## 6. Exit Criteria de Incidente

Se considera cerrado cuando:

1. `ops:release-check` pasa en produccion.
2. `e2e:smoke` y `e2e:a11y` pasan en CI.
3. Se documenta causa raiz y fix preventivo.

## 7. Seguimiento de Performance Real

Revisar dashboard de RUM semanalmente (ver `docs/WEB_VITALS_DASHBOARD.md`) y en cada release relevante:

1. validar p75 de `LCP`, `INP`, `CLS`;
2. comparar `appVersion` nuevo vs previo;
3. abrir ticket de performance si hay regresion >20% en p75.
