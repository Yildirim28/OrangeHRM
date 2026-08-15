import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard\/index/);
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  }

  async expectUserName(name: string): Promise<void> {
    await expect(this.page.locator('.oxd-userdropdown-name')).toHaveText(name);
  }

  async expectEmployeeSession(): Promise<void> {
    await expect(this.page.locator('.oxd-userdropdown-tab')).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page).not.toHaveURL(/\/auth\/(login|validate)/);
  }

  async logout(): Promise<void> {
    await this.page.locator('.oxd-userdropdown-tab').click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }
}