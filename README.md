# QA Funcional — SauceDemo

Suite de pruebas funcionales end-to-end para [saucedemo.com](https://www.saucedemo.com), construida con [Playwright](https://playwright.dev/) + TypeScript siguiendo el patrón Page Object Model.

## Cobertura

- **Login**: credenciales válidas, usuario bloqueado, contraseña incorrecta, campos vacíos.
- **Inventory**: ordenamiento por nombre y precio, agregar/quitar productos, badge del carrito.
- **Cart**: contenido del carrito, remover ítems, continuar comprando.
- **Checkout**: flujo completo de compra, validación de campos requeridos.

## Estructura

```
pages/      Page Objects (locators + acciones por pantalla)
fixtures/   Datos de prueba y fixture custom de Playwright
tests/      Specs organizados por flujo de negocio
```

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
