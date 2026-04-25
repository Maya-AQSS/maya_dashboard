import { test, expect } from './fixtures/auth';

test.describe('Dashboard principal', () => {
  test('muestra widgets tras login', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('main')).toBeVisible();
  });
});
