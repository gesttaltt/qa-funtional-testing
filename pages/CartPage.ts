import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.continueShoppingButton = page.locator('#continue-shopping');
    this.checkoutButton = page.locator('#checkout');
  }

  itemByName(name: string): Locator {
    return this.cartItems.filter({ hasText: name });
  }

  async removeItem(name: string) {
    await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
