import { test, expect } from '../fixtures/test-base';
import { users } from '../fixtures/users';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page, loginPage, inventoryPage, cartPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('completa una compra de punta a punta', async ({ page, checkoutPage }) => {
    await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await checkoutPage.finish();

    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('exige nombre, apellido y código postal', async ({ checkoutPage }) => {
    await checkoutPage.fillInfo('', '', '');
    await expect(checkoutPage.errorMessage).toContainText('First Name is required');

    await checkoutPage.fillInfo('Jonathan', '', '');
    await expect(checkoutPage.errorMessage).toContainText('Last Name is required');

    await checkoutPage.fillInfo('Jonathan', 'Verdun', '');
    await expect(checkoutPage.errorMessage).toContainText('Postal Code is required');
  });
});

test.describe('Checkout - cálculo de precio total', () => {
  test('el total del resumen coincide con subtotal + impuesto de varios productos', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    await inventoryPage.addToCart('Sauce Labs Fleece Jacket');
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
});
