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
