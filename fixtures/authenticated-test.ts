import { test as base } from './test-base';
import { LoginPage } from '../pages/LoginPage';
import { users } from './users';

export const test = base.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await use(page);
  },
});

export { expect } from './test-base';
