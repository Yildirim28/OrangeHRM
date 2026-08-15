import { test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { PimPage } from '../pages/PimPage';

test('admin creates an employee who can log in and log out', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const pimPage = new PimPage(page);

  const uniqueId = `${Date.now().toString().slice(-8)}${Math.floor(
    Math.random() * 100,
  )
    .toString()
    .padStart(2, '0')}`;
  const employee = {
    employeeId: uniqueId,
    firstName: 'Playwright',
    lastName: `User${uniqueId}`,
    username: `pw${uniqueId}`,
    password: `Pw@${uniqueId}Aa`,
  };

  await test.step('Log in with the OrangeHRM demo account', async () => {
    await loginPage.open();
    await loginPage.loginAsAdmin();
    await dashboardPage.expectLoaded();
  });

  await test.step('Create a new employee account', async () => {
    await pimPage.openAddEmployee();
    await pimPage.createEmployee(employee);
  });

  await test.step('Log out from the admin account', async () => {
    await dashboardPage.logout();
    await loginPage.expectVisible();
  });

  await test.step('Log in and log out with the new employee account', async () => {
    await loginPage.login(employee.username, employee.password);
    await dashboardPage.expectEmployeeSession();
    await dashboardPage.expectUserName(`${employee.firstName} ${employee.lastName}`);
    await dashboardPage.logout();
    await loginPage.expectVisible();
  });
});
