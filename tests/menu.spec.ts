import { test, expect } from '../fixtures/test-base';
import { users } from '../fixtures/users';

test.describe('Menú de navegación', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
  });

  test('logout redirige al login y protege el acceso directo a inventory', async ({
    page,
    menu,
  }) => {
    await menu.logout();

    await expect(page).toHaveURL('https://www.saucedemo.com/');

    await page.goto('/inventory.html');
    await expect(page.locator('[data-test="error"]')).toContainText(
      "You can only access '/inventory.html' when you are logged in"
    );
  });

  test('reset app state vacía el carrito', async ({ inventoryPage, menu }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await menu.resetAppState();

    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });
});
