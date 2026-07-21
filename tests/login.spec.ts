import { test, expect } from '../fixtures/test-base';
import { users } from '../fixtures/users';

test.describe('Login', () => {
  test('permite iniciar sesión con credenciales válidas', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('bloquea al usuario locked_out_user con un mensaje de error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('rechaza una contraseña incorrecta', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, 'wrong_password');

    await expect(loginPage.errorMessage).toContainText('Username and password do not match');
  });

  test('exige usuario y contraseña', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', '');

    await expect(loginPage.errorMessage).toContainText('Username is required');
  });
});
