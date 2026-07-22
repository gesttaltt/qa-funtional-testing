import { test, expect } from '../fixtures/authenticated-test';

test.describe('Cart', () => {
  let inventoryPrices: Record<string, string>;

  test.beforeEach(async ({ page, inventoryPage }) => {
    const backpackPrice = await inventoryPage
      .itemByName('Sauce Labs Backpack')
      .locator('.inventory_item_price')
      .textContent();
    const bikeLightPrice = await inventoryPage
      .itemByName('Sauce Labs Bike Light')
      .locator('.inventory_item_price')
      .textContent();
    inventoryPrices = {
      'Sauce Labs Backpack': backpackPrice ?? '',
      'Sauce Labs Bike Light': bikeLightPrice ?? '',
    };

    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/cart\.html/);
  });

  test('muestra los productos agregados con el mismo precio que en inventory', async ({
    cartPage,
  }) => {
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.itemNames).toContainText([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
    ]);

    // el precio en el carrito debe ser el mismo que el usuario vio en inventory,
    // no un valor recalculado o desactualizado
    await expect(cartPage.itemPrices).toHaveText([
      inventoryPrices['Sauce Labs Backpack'],
      inventoryPrices['Sauce Labs Bike Light'],
    ]);
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
