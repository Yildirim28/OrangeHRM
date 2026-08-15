import { expect, type Locator, type Page } from '@playwright/test';

export interface EmployeeCredentials {
  employeeId: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export class PimPage {
  constructor(private readonly page: Page) {}

  async openAddEmployee(): Promise<void> {
    await this.page.getByRole('link', { name: 'PIM' }).click();
    await expect(this.page.getByRole('heading', { name: 'PIM' })).toBeVisible();
    await this.page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(this.page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
  }

  async createEmployee(employee: EmployeeCredentials): Promise<void> {
    await this.page.getByPlaceholder('First Name').fill(employee.firstName);
    await this.page.getByPlaceholder('Last Name').fill(employee.lastName);
    await this.field('Employee Id').fill(employee.employeeId);

    await this.page.locator('.oxd-switch-input').click();
    await this.field('Username').fill(employee.username);
    await this.field('Password').fill(employee.password);
    await this.field('Confirm Password').fill(employee.password);
    await this.page.getByRole('button', { name: 'Save' }).click();

    await expect(this.page).toHaveURL(/\/pim\/viewPersonalDetails\/empNumber\//, {
      timeout: 30_000,
    });
    await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  }

  private field(label: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .locator('input');
  }
}