import { type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { test, expect } from '../fixtures/test-base';
import { test as authedTest } from '../fixtures/authenticated-test';

// Violaciones preexistentes de SauceDemo (verificado en vivo), fuera de nuestro control:
// - landmark-one-main / page-has-heading-one / region: deuda de estructura de documento en
//   todas las pantallas.
// - select-name: el <select> de orden en inventory no tiene nombre accesible; queda documentado
//   aparte en el describe "bug conocido" de abajo en vez de duplicarse acá.
// Se excluyen para que la suite falle solo ante violaciones nuevas/regresiones.
const KNOWN_RULES = ['landmark-one-main', 'page-has-heading-one', 'region', 'select-name'];

async function expectNoNewViolations(page: Page) {
  const results = await new AxeBuilder({ page }).disableRules(KNOWN_RULES).analyze();

  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

test.describe('Accesibilidad', () => {
  test('login no tiene violaciones nuevas de accesibilidad', async ({ page, loginPage }) => {
    await loginPage.goto();

    await expectNoNewViolations(page);
  });

  authedTest('inventory no tiene violaciones nuevas de accesibilidad', async ({ page }) => {
    await expectNoNewViolations(page);
  });

  authedTest(
    'cart no tiene violaciones nuevas de accesibilidad',
    async ({ page, inventoryPage }) => {
      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();

      await expectNoNewViolations(page);
    }
  );

  authedTest(
    'checkout-step-one no tiene violaciones nuevas de accesibilidad',
    async ({ page, inventoryPage, cartPage }) => {
      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.checkout();

      await expectNoNewViolations(page);
    }
  );

  authedTest(
    'checkout-step-two no tiene violaciones nuevas de accesibilidad',
    async ({ page, inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.checkout();
      await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');

      await expectNoNewViolations(page);
    }
  );

  authedTest(
    'checkout-complete no tiene violaciones nuevas de accesibilidad',
    async ({ page, inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.checkout();
      await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');
      await checkoutPage.finish();

      await expectNoNewViolations(page);
    }
  );
});

test.describe('Accesibilidad - bug conocido', () => {
  authedTest(
    'el selector de orden en inventory no tiene nombre accesible (bug conocido)',
    async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .include('[data-test="product-sort-container"]')
        .analyze();

      const violationIds = results.violations.map((v) => v.id);
      expect(violationIds).toContain('select-name');
    }
  );
});
