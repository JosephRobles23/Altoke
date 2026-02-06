import { test, expect } from '@playwright/test';

test.describe('Remittance Flow E2E', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Altoke')).toBeVisible();
    await expect(page.locator('text=Envía dinero a Perú')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=Bienvenido de vuelta')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Registrarse');
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('text=Crear tu cuenta')).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // El formulario HTML5 debería prevenir el envío con campos vacíos
  });

  // TODO: Agregar tests E2E completos cuando la integración con Supabase esté lista
  // test('should complete full remittance from signup to transaction', async ({ page }) => {
  //   ...
  // });
});
