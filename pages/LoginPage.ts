import { expect, type Page } from '@playwright/test';

export class LoginPage {
  private readonly adminUsername =
    process.env.ORANGEHRM_ADMIN_USERNAME ?? 'Admin';
  private readonly adminPassword =
    process.env.ORANGEHRM_ADMIN_PASSWORD ?? 'admin123';

  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
    await expect(this.page.getByRole('button', { name: 'Login' })).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async loginAsAdmin(): Promise<void> {
    await this.login(this.adminUsername, this.adminPassword);
  }

  async expectVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login/);
    await expect(this.page.getByRole('button', { name: 'Login' })).toBeVisible();
  }
}