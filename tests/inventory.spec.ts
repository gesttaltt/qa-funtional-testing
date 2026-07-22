import { test, expect } from '../fixtures/authenticated-test';

test.describe('Inventory', () => {
  test('ordena los productos por nombre A-Z y Z-A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    const namesAsc = await inventoryPage.itemNames.allTextContents();
    expect(namesAsc).toEqual([...namesAsc].sort());

    await inventoryPage.sortBy('za');
    const namesDesc = await inventoryPage.itemNames.allTextContents();
    expect(namesDesc).toEqual([...namesAsc].sort().reverse());
  });

  test('ordena los productos por precio ascendente y descendente', async ({ inventoryPage }) => {
    const toNumber = (text: string) => parseFloat(text.replace('$', ''));

    await inventoryPage.sortBy('lohi');
    const pricesAsc = (await inventoryPage.itemPrices.allTextContents()).map(toNumber);
    expect(pricesAsc).toEqual([...pricesAsc].sort((a, b) => a - b));

    await inventoryPage.sortBy('hilo');
    const pricesDesc = (await inventoryPage.itemPrices.allTextContents()).map(toNumber);
    expect(pricesDesc).toEqual([...pricesAsc].sort((a, b) => b - a));
  });

  test('agregar y quitar un producto actualiza el badge del carrito', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });
});
