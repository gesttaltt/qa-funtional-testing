import { test, expect } from '../fixtures/test-base';
import { users } from '../fixtures/users';
import loginCases from '../fixtures/data/login-cases.json';

test.describe('Login', () => {
  test('permite iniciar sesión con credenciales válidas', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
  });

  for (const testCase of loginCases) {
    test(`rechaza el login: ${testCase.name}`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(testCase.username, testCase.password);

      await expect(loginPage.errorMessage).toContainText(testCase.expectedError);
    });
  }
});
