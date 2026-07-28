import { test, expect } from '../fixtures/authenticated-test';
import checkoutValidationCases from '../fixtures/data/checkout-validation-cases.json';
import checkoutCarts from '../fixtures/data/checkout-carts.json';

const toNumber = (text: string) => parseFloat(text.replace(/[^0-9.]/g, ''));

test.describe('Checkout - flujo completo de compra', () => {
  test('completa la compra preservando el precio del producto y vacía el carrito al volver', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    const inventoryPrice = await test.step('leer el precio del producto en inventory', async () =>
      (await inventoryPage.priceOf('Sauce Labs Backpack').textContent()) ?? '');

    await test.step('agregar el producto y llegar a checkout step one', async () => {
      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.checkout();
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });

    await test.step('completar la información de envío', async () => {
      await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('verificar que el resumen preserva el precio visto en inventory', async () => {
      // el precio mostrado en el resumen debe ser el mismo que el usuario vio en inventory,
      // no un valor recalculado o desactualizado
      await expect(checkoutPage.summaryItemNames).toHaveText(['Sauce Labs Backpack']);
      await expect(checkoutPage.summaryItemPrices).toHaveText([inventoryPrice]);
    });

    await test.step('finalizar la compra', async () => {
      await checkoutPage.finish();
      await expect(page).toHaveURL(/checkout-complete\.html/);
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });

    await test.step('volver a productos y verificar que el carrito quedó vacío', async () => {
      await checkoutPage.backToProducts();
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.cartBadge).toHaveCount(0);
    });
  });
});

test.describe('Checkout - validación de datos requeridos', () => {
  test.beforeEach(async ({ page, inventoryPage, cartPage }) => {
    await test.step('llegar a checkout step one con un producto en el carrito', async () => {
      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.checkout();
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
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
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      const inventoryPrices: Record<string, number> = {};

      await test.step('agregar los productos al carrito y registrar sus precios en inventory', async () => {
        for (const product of cart.products) {
          const priceText = await inventoryPage.priceOf(product).textContent();
          inventoryPrices[product] = toNumber(priceText ?? '');
          await inventoryPage.addToCart(product);
        }
      });

      await test.step('llegar al resumen de checkout', async () => {
        await inventoryPage.goToCart();
        await cartPage.checkout();
        await checkoutPage.fillInfo('Jonathan', 'Verdun', '12345');
        await expect(page).toHaveURL(/checkout-step-two\.html/);
      });

      const summaryPrices =
        await test.step('verificar que cada precio del resumen coincide con el de inventory', async () => {
          // cada precio del resumen debe coincidir con el que el producto tenía en inventory,
          // no solo ser matemáticamente consistente consigo mismo
          const summaryNames = await checkoutPage.summaryItemNames.allTextContents();
          const prices = (await checkoutPage.summaryItemPrices.allTextContents()).map(toNumber);
          summaryNames.forEach((name, index) => {
            expect(prices[index]).toBeCloseTo(inventoryPrices[name], 2);
          });
          return prices;
        });

      await test.step('verificar subtotal, impuesto y total', async () => {
        const expectedSubtotal = summaryPrices.reduce((sum, price) => sum + price, 0);
        const subtotal = toNumber((await checkoutPage.subtotalLabel.textContent()) ?? '');
        const tax = toNumber((await checkoutPage.taxLabel.textContent()) ?? '');
        const total = toNumber((await checkoutPage.totalLabel.textContent()) ?? '');

        expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
        expect(total).toBeCloseTo(subtotal + tax, 2);
      });
    });
  }
});
