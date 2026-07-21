import { test, expect } from '../fixtures/test-base';
import { users } from '../fixtures/users';
import checkoutValidationCases from '../fixtures/data/checkout-validation-cases.json';
import customers from '../fixtures/data/customers.json';
import checkoutCarts from '../fixtures/data/checkout-carts.json';

test.describe('Checkout - flujo completo de compra', () => {
  for (const customer of customers) {
    test(`completa una compra de punta a punta: ${customer.name}`, async ({
      page,
      loginPage,
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      await loginPage.goto();
      await loginPage.login(users.standard.username, users.standard.password);
      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.checkout();
      await expect(page).toHaveURL(/checkout-step-one\.html/);

      await checkoutPage.fillInfo(customer.firstName, customer.lastName, customer.postalCode);
      await expect(page).toHaveURL(/checkout-step-two\.html/);

      await checkoutPage.finish();

      await expect(page).toHaveURL(/checkout-complete\.html/);
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });
  }
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
      for (const product of cart.products) {
        await inventoryPage.addToCart(product);
      }
      await inventoryPage.goToCart();
      await cartPage.checkout();
      await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');
      await expect(page).toHaveURL(/checkout-step-two\.html/);

      const toNumber = (text: string) => parseFloat(text.replace(/[^0-9.]/g, ''));
      const itemPrices = (await checkoutPage.summaryItemPrices.allTextContents()).map(toNumber);
      const expectedSubtotal = itemPrices.reduce((sum, price) => sum + price, 0);

      const subtotal = toNumber((await checkoutPage.subtotalLabel.textContent()) ?? '');
      const tax = toNumber((await checkoutPage.taxLabel.textContent()) ?? '');
      const total = toNumber((await checkoutPage.totalLabel.textContent()) ?? '');

      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });
  }
});
