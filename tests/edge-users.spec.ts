import { test, expect } from '../fixtures/test-base';
import { users } from '../fixtures/users';

test.describe('Usuarios con comportamiento especial', () => {
  test('problem_user ve la misma imagen rota en todos los productos (bug conocido)', async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(users.problem.username, users.problem.password);

    const srcs = await inventoryPage.itemImages.evaluateAll((imgs) =>
      imgs.map((img) => img.getAttribute('src'))
    );

    expect(new Set(srcs).size).toBe(1);
  });

  test('performance_glitch_user puede iniciar sesión pese a la demora de carga', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);

    await expect(page).toHaveURL(/inventory\.html/, { timeout: 15000 });
  });

  test('error_user dispara una excepción JS no capturada al continuar en checkout (bug conocido)', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await loginPage.goto();
    await loginPage.login(users.error.username, users.error.password);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');

    expect(pageErrors.length).toBeGreaterThan(0);
  });
});
