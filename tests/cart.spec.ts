import { test, expect } from '../fixtures/test-base';
import { users } from '../fixtures/users';

test.describe('Cart', () => {
  test.beforeEach(async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/cart\.html/);
  });

  test('muestra los productos agregados', async ({ cartPage }) => {
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.itemNames).toContainText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
  });

  test('permite quitar un producto del carrito', async ({ cartPage }) => {
    await cartPage.removeItem('Sauce Labs Backpack');

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.itemNames).toContainText(['Sauce Labs Bike Light']);
  });

  test('continue shopping vuelve al listado de productos', async ({ page, cartPage }) => {
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
  });
});
