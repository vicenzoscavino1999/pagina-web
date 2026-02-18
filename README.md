# GlobalLogistics — Landing Page

![CI](https://github.com/TU_USUARIO/delivery-web-page/actions/workflows/ci.yml/badge.svg)

## 🚀 Stack Técnico
- **Vite 5** + **TypeScript 5** (strict mode)
- **Tailwind CSS v4** (CLI, sin CDN)
- **Vitest 2** (unit tests)
- ESLint + Prettier
- GitHub Actions CI

## 📁 Estructura del Proyecto
```
src/
├── modules/  → Módulos de UI con responsabilidad única
├── types/    → Contratos TypeScript centralizados
├── utils/    → Helpers reutilizables (EventBus, math, dom)
└── styles/   → CSS con Tailwind
tests/        → Unit tests con Vitest
.github/      → CI pipeline
```

## 🏗️ Arquitectura
El proyecto utiliza una arquitectura modular basada en clases TypeScript independientes.
- **EventBus pattern:** Desacoplamiento de componentes mediante eventos (`scroll`, `resize`, `tracking:submit`, `tracking:success`).
- **Private class fields:** Encapsulamiento estricto con `#field`.
- **Performance:** Uso de `AbortController` para cancelar fetch requests y `IntersectionObserver` para animaciones eficientes.
- **CSS:** Variables CSS controladas por JavaScript para efectos de parallax y animaciones.

## ⚙️ Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción (TypeScript + Vite) |
| `npm run preview` | Previsualiza el build de producción |
| `npm run test` | Ejecuta los tests unitarios con Vitest |
| `npm run typecheck` | Validaciones de tipos TypeScript |
| `npm run lint` | Análisis estático con ESLint |
| `npm run format` | Formatea código con Prettier |

## 🧪 Tests
El proyecto cuenta con una suite de tests robusta (13 tests):
- **EventBus (3):** Verifica emisión, recepción y cancelación de eventos.
- **TrackingForm (6):** Valida lógica de formulario, sanitización, mocks de fetch y manejo de errores.
- **ParallaxEngine (4):** Prueba cálculos de movimiento y optimización móvil.

## 🔧 Setup

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/delivery-web-page.git
   cd delivery-web-page
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar entorno local:
   ```bash
   npm run dev
   ```

## 📦 Build de Producción

Para generar los archivos optimizados en `dist/`:

```bash
npm run build
```
