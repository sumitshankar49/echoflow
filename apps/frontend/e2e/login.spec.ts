import { expect, test } from '@playwright/test';

test('user can sign in and navigate to dashboard', async ({ page }) => {
  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }),
    });
  });

  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-1',
        email: 'candy@example.com',
        name: 'Candy User',
      }),
    });
  });

  await page.goto('/login');

  await page.locator('input[type="email"]').fill('candy@example.com');
  await page.locator('input[type="password"]').fill('StrongPass123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
});
