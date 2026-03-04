# Release Process

Date: 2026-03-04  
Project: `delivery-web-page`

## 1. Objetivo

Estandarizar la preparacion de releases con:

1. notas de cambios reproducibles;
2. checklist minimo de readiness;
3. artefactos claros para deploy y auditoria.

## 2. Flujo local recomendado

1. Generar notas para la version objetivo:

```bash
npm run release:notes -- --version 1.4.0
```

2. Actualizar changelog:

```bash
npm run release:changelog -- --version 1.4.0
```

3. Ejecutar readiness check:

```bash
npm run release:readiness -- --version 1.4.0
```

4. Correr carriles de calidad:

```bash
npm run ci:core
npm run ci:extended
npm run security:runtime
```

## 3. Flujo en CI (release lane)

Workflow: `.github/workflows/ci.yml` (manual `workflow_dispatch`).

Inputs:

1. `lane = release` (o `all`)
2. `release_version = 1.4.0` (recomendado)

Jobs clave:

1. `Release Preparation`
   - genera `release-notes.md`
   - verifica `release-readiness`
   - publica artefacto con `release-notes.md` y `CHANGELOG.md`
2. `Release Security`
   - bloquea vulnerabilidades runtime `high/critical`
3. `Release Gate`
   - consolida todos los jobs requeridos del release lane

## 4. Artefactos de release

Cada release manual debe dejar:

1. `release-notes.md` (artifact CI o archivo local)
2. `CHANGELOG.md` actualizado
3. evidencia de calidad (jobs verdes en lane `release`)
