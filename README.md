# QA Funcional — SauceDemo

Suite de pruebas funcionales end-to-end para [saucedemo.com](https://www.saucedemo.com), construida con [Playwright](https://playwright.dev/) + TypeScript siguiendo el patrón Page Object Model.

## Cobertura

- **Login**: credenciales válidas y una batería data-driven de casos inválidos (campos vacíos, contraseña incorrecta, usuario bloqueado).
- **Inventory**: ordenamiento por nombre y precio, agregar/quitar productos, badge del carrito.
- **Cart**: contenido del carrito, remover ítems, continuar comprando.
- **Checkout**: flujo completo de compra sobre varios perfiles de cliente, validación de campos requeridos, cálculo de precio total sobre distintos carritos — todo data-driven.
- **Menú**: logout y reset app state.
- **Usuarios especiales**: bugs conocidos de `problem_user` (imagen rota) y `error_user` (excepción JS no capturada), tolerancia a la demora de `performance_glitch_user`.

## Estructura

```
pages/          Page Objects (locators + acciones por pantalla)
fixtures/       Fixture custom de Playwright y datos de usuarios
fixtures/data/  Datos de prueba externos en JSON (data-driven testing)
tests/          Specs organizados por flujo de negocio
```

## Data-driven testing

Los casos repetitivos (variantes de login inválido, validación de checkout, perfiles de cliente, combinaciones de carrito) viven como JSON en `fixtures/data/` y se recorren con un `for` dentro de cada spec para generar un test independiente por caso — así agregar un caso nuevo es editar el JSON, no tocar el código del test.

## Uso

```bash
npm install
npx playwright install        # descarga los navegadores

npm test                      # corre toda la suite (chromium, firefox, webkit)
npm run test:ui                # modo UI interactivo
npm run test:headed            # corre con navegador visible
npm run report                 # abre el último reporte HTML
```

## CI

Cada push/PR a `main` corre la suite completa en GitHub Actions (`.github/workflows/playwright.yml`) y publica el reporte HTML como artifact.
