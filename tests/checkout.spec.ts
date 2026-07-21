import { test, expect } from '../fixtures/test-base';
import { users } from '../fixtures/users';
import checkoutValidationCases from '../fixtures/data/checkout-validation-cases.json';
import checkoutCarts from '../fixtures/data/checkout-carts.json';

const toNumber = (text: string) => parseFloat(text.replace(/[^0-9.]/g, ''));

test.describe('Checkout - flujo completo de compra', () => {
  test('completa la compra preservando el precio del producto y vacía el carrito al volver', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    const inventoryPrice = await inventoryPage
      .itemByName('Sauce Labs Backpack')
      .locator('.inventory_item_price')
      .textContent();

    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    // el precio mostrado en el resumen debe ser el mismo que el usuario vio en inventory,
    // no un valor recalculado o desactualizado
    await expect(checkoutPage.summaryItemNames).toHaveText(['Sauce Labs Backpack']);
    await expect(checkoutPage.summaryItemPrices).toHaveText([inventoryPrice ?? '']);

    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');

    await checkoutPage.backToProducts();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });
});

test.describe('Checkout - validación de datos requeridos', () => {
  test.beforeEach(async ({ page, loginPage, inventoryPage, cartPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  for (const testCase of checkoutValidationCases) {
    test(`rechaza el checkout: ${testCase.name}`, async ({ checkoutPage }) => {
      await checkoutPage.fillInfo(testCase.firstName, testCase.lastName, testCase.postalCode);

      await expect(checkoutPage.errorMessage).toContainText(testCase.expectedError);
    });
  }

  test('acepta campos con solo espacios en blanco sin validarlos (bug conocido)', async ({
    page,
    checkoutPage,
  }) => {
    await checkoutPage.fillInfo('   ', '   ', '   ');

    // el checkout debería exigir contenido real, pero el "required" de SauceDemo
    // no hace trim: un valor de solo espacios se acepta como válido
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.errorMessage).toHaveCount(0);
  });
});

test.describe('Checkout - cálculo de precio total', () => {
  for (const cart of checkoutCarts) {
    test(`el total del resumen coincide con subtotal + impuesto: ${cart.name}`, async ({
      page,
      loginPage,
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      await loginPage.goto();
      await loginPage.login(users.standard.username, users.standard.password);

      const inventoryPrices: Record<string, number> = {};
      for (const product of cart.products) {
        const priceText = await inventoryPage
          .itemByName(product)
          .locator('.inventory_item_price')
          .textContent();
        inventoryPrices[product] = toNumber(priceText ?? '');
        await inventoryPage.addToCart(product);
      }

      await inventoryPage.goToCart();
      await cartPage.checkout();
      await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');
      await expect(page).toHaveURL(/checkout-step-two\.html/);

      // cada precio del resumen debe coincidir con el que el producto tenía en inventory,
      // no solo ser matemáticamente consistente consigo mismo
      const summaryNames = await checkoutPage.summaryItemNames.allTextContents();
      const summaryPrices = (await checkoutPage.summaryItemPrices.allTextContents()).map(toNumber);
      summaryNames.forEach((name, index) => {
        expect(summaryPrices[index]).toBeCloseTo(inventoryPrices[name], 2);
      });

      const expectedSubtotal = summaryPrices.reduce((sum, price) => sum + price, 0);
      const subtotal = toNumber((await checkoutPage.subtotalLabel.textContent()) ?? '');
      const tax = toNumber((await checkoutPage.taxLabel.textContent()) ?? '');
      const total = toNumber((await checkoutPage.totalLabel.textContent()) ?? '');

      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });
  }
});
