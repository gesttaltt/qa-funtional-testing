import { type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { test, expect } from '../fixtures/test-base';
import { test as authedTest } from '../fixtures/authenticated-test';
import { users } from '../fixtures/users';

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
      await authedTest.step('agregar un producto y abrir el carrito', async () => {
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await inventoryPage.goToCart();
      });

      await expectNoNewViolations(page);
    }
  );

  authedTest(
    'checkout-step-one no tiene violaciones nuevas de accesibilidad',
    async ({ page, inventoryPage, cartPage }) => {
      await authedTest.step('llegar a checkout step one', async () => {
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await inventoryPage.goToCart();
        await cartPage.checkout();
      });

      await expectNoNewViolations(page);
    }
  );

  authedTest(
    'checkout-step-two no tiene violaciones nuevas de accesibilidad',
    async ({ page, inventoryPage, cartPage, checkoutPage }) => {
      await authedTest.step('llegar a checkout step two', async () => {
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await inventoryPage.goToCart();
        await cartPage.checkout();
        await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');
      });

      await expectNoNewViolations(page);
    }
  );

  authedTest(
    'checkout-complete no tiene violaciones nuevas de accesibilidad',
    async ({ page, inventoryPage, cartPage, checkoutPage }) => {
      await authedTest.step('completar la compra', async () => {
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await inventoryPage.goToCart();
        await cartPage.checkout();
        await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');
        await checkoutPage.finish();
      });

      await expectNoNewViolations(page);
    }
  );
});

test.describe('Accesibilidad - navegación por teclado', () => {
  test('el login se puede completar y enviar íntegramente con teclado', async ({
    page,
    loginPage,
  }) => {
    // el scan de axe-core detecta marcado, no orden de tabulación ni si el submit
    // realmente funciona sin mouse; esto cubre esa parte del flujo.
    await loginPage.goto();
    // el primer Tab justo después del goto() puede dispararse antes de que el
    // documento asiente foco (visto flaky en CI, no reproducido en local); esperar
    // a que el input esté realmente visible evita esa carrera sin dejar de ser
    // 100% teclado.
    await expect(loginPage.usernameInput).toBeVisible();

    await test.step('tabular a username y escribirlo', async () => {
      await page.keyboard.press('Tab');
      await expect(loginPage.usernameInput).toBeFocused();
      await page.keyboard.type(users.standard.username);
    });

    await test.step('tabular a password y escribirlo', async () => {
      await page.keyboard.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();
      await page.keyboard.type(users.standard.password);
    });

    await test.step('tabular al botón de login y enviar con Enter', async () => {
      await page.keyboard.press('Tab');
      await expect(loginPage.loginButton).toBeFocused();

      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/inventory\.html/);
    });
  });
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
