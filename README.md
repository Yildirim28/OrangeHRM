# OrangeHRM Playwright POM Project

This project uses Playwright with TypeScript and the Page Object Model (POM)
pattern to automate an employee account lifecycle on the public OrangeHRM demo
application.

The automated scenario performs these actions:

1. Opens the OrangeHRM login page.
2. Logs in with the demo administrator account.
3. Opens the PIM module.
4. Creates a new employee with login credentials.
5. Logs out from the administrator account.
6. Logs in with the newly created employee account.
7. Verifies that the correct employee is signed in.
8. Logs out from the employee account.

## Project Structure

```text
OrangeHRM/
|-- pages/
|   |-- DashboardPage.ts
|   |-- LoginPage.ts
|   `-- PimPage.ts
|-- tests/
|   `-- example.spec.ts
|-- .github/
|   `-- workflows/
|       `-- playwright.yml
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- playwright.config.ts
|-- tsconfig.json
`-- README.md
```

## Page Object Model

The Page Object Model keeps page selectors and UI operations outside the test
file. The test describes the business workflow, while page objects contain the
details required to interact with OrangeHRM.

### `pages/LoginPage.ts`

`LoginPage` owns authentication-page behavior.

- `open()` navigates to `/web/index.php/auth/login` and verifies that the login
  button is visible.
- `loginAsAdmin()` logs in with the administrator username and password stored
  in the page object. The defaults are `Admin` and `admin123`.
- `login(username, password)` fills the username and password fields and submits
  the form for a supplied account, including the newly created employee.
- `expectVisible()` verifies that logout returned the browser to the login page.

The same page object is used for both administrator and employee login because
both account types use the same OrangeHRM login form. The admin credentials are
private fields in `LoginPage` and support environment-variable overrides.

### `pages/PimPage.ts`

`PimPage` owns employee creation in the Personnel Information Management (PIM)
module.

- `openAddEmployee()` opens PIM and navigates to the Add Employee form.
- `createEmployee(employee)` fills the employee's name and employee ID, enables
  Create Login Details, fills the new account credentials, saves the employee,
  and verifies that OrangeHRM opens the Personal Details page.
- `field(label)` is a private locator helper that finds an input by the label in
  its OrangeHRM input group.

The `EmployeeCredentials` interface defines the data required to create an
employee:

```ts
interface EmployeeCredentials {
  employeeId: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}
```

### `pages/DashboardPage.ts`

`DashboardPage` owns authenticated-session checks and logout behavior.

- `expectLoaded()` verifies the administrator dashboard after admin login.
- `expectEmployeeSession()` waits for the authenticated user menu and verifies
  that the browser is no longer on an authentication URL.
- `expectUserName(name)` verifies the displayed employee name.
- `logout()` opens the user menu, clicks Logout, and verifies the login URL.

The employee session does not use `expectLoaded()` because an OrangeHRM ESS
employee can land on Personal Details instead of the administrator Dashboard.
The visible authenticated user menu is therefore the reliable session check.

## Test Scenario

The complete scenario is in `tests/example.spec.ts`:

```ts
test(
  'admin creates an employee who can log in and log out',
  async ({ page }) => {
  // Create page objects.
  // Generate unique employee data.
  // Log in as admin.
  // Create the employee account.
  // Log out as admin.
  // Log in as the employee, verify identity, and log out.
});
```

Playwright `test.step()` calls divide the scenario into readable report steps:

1. `Log in with the OrangeHRM demo account`
2. `Create a new employee account`
3. `Log out from the admin account`
4. `Log in and log out with the new employee account`

## Unique Test Data

OrangeHRM's public demo is shared by many users. Reusing a fixed employee ID or
username can cause duplicate-data validation errors. The test creates a unique
numeric suffix from the current timestamp and a random two-digit value.

For every run, it generates values similar to these:

```text
Employee ID:  9451234567
First name:   Playwright
Last name:    User9451234567
Username:     pw9451234567
Password:     Pw@9451234567Aa
```

The password contains uppercase letters, lowercase letters, numbers, and a
special character to satisfy OrangeHRM's password requirements.

## Playwright Configuration

`playwright.config.ts` contains the project-wide test settings.

| Setting | Value | Purpose |
| --- | --- | --- |
| `testDir` | `./tests` | Locates test specifications. |
| `timeout` | `90_000` | Allows for a slow shared demo server. |
| `workers` | `1` | Prevents concurrent state-changing tests. |
| `baseURL` | OrangeHRM demo URL | Allows page objects to use relative paths. |
| `actionTimeout` | `15_000` | Limits individual UI actions. |
| `navigationTimeout` | `30_000` | Allows time for OrangeHRM navigation. |
| `trace` | `on-first-retry` | Captures diagnostic traces on retries. |
| `screenshot` | `only-on-failure` | Saves screenshots for failed tests. |
| `video` | `retain-on-failure` | Retains video only when a test fails. |
| Browser project | Chromium | Runs with a Desktop Chrome device profile. |

CI runs receive two retries. Local runs do not retry, so failures are visible
immediately during development.

## Demo Account and Environment Variables

By default, the test uses the public OrangeHRM demo environment:

```text
URL:      https://opensource-demo.orangehrmlive.com
Username: Admin
Password: admin123
```

The defaults can be overridden with environment variables:

```bash
export ORANGEHRM_BASE_URL='https://opensource-demo.orangehrmlive.com'
export ORANGEHRM_ADMIN_USERNAME='Admin'
export ORANGEHRM_ADMIN_PASSWORD='admin123'
```

Because `playwright.config.ts` imports `dotenv/config`, the same values can be
placed in a local `.env` file:

```dotenv
ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_ADMIN_USERNAME=Admin
ORANGEHRM_ADMIN_PASSWORD=admin123
```

Do not commit real credentials. The project's `.gitignore` excludes `.env`.

## Installation

Install project dependencies:

```bash
npm install
```

Install the Chromium browser used by the configured Playwright project:

```bash
npx playwright install chromium
```

## Running Tests

Run the test in headless mode:

```bash
npm test
```

Run it with the browser visible:

```bash
npm run test:headed
```

Open Playwright's interactive UI mode:

```bash
npm run test:ui
```

List tests without executing them:

```bash
npx playwright test --list
```

Check TypeScript without generating JavaScript files:

```bash
npx tsc --noEmit
```

## Reports and Failure Artifacts

The configuration uses both the terminal list reporter and the HTML reporter.
Open the latest HTML report with:

```bash
npm run report
```

When a test fails, Playwright stores diagnostics under `test-results/`, which
can include:

- A failure screenshot
- A retained browser video
- An error-context page snapshot
- A trace when a retry is enabled

Generated reports and test artifacts are excluded by `.gitignore`.

## Continuous Integration

`.github/workflows/playwright.yml` runs the project for pushes and pull requests
to `main` or `master`.

The workflow:

1. Checks out the repository.
2. Configures the latest Node.js LTS release.
3. Installs dependencies with `npm ci`.
4. Installs Playwright browsers and Linux dependencies.
5. Runs `npx playwright test`.
6. Uploads the HTML report as a GitHub Actions artifact.

## Reliability Notes

The public OrangeHRM demo is mutable and shared. It can occasionally respond
slowly or contain data created by other users. This project addresses those
conditions by:

- Generating a unique employee ID and username for every test run.
- Running with one worker because the scenario changes shared application data.
- Allowing 90 seconds for the complete scenario.
- Waiting for visible authenticated UI instead of transient redirect URLs.
- Verifying every major transition before continuing.

The test creates an employee but does not delete it. This is intentional because
the requirement is to prove that the newly created employee can authenticate.
For a private or persistent test environment, a cleanup flow or API teardown can
be added after employee logout.

## Verified Result

The project has been validated with TypeScript and tested against the live
OrangeHRM demo in both headed and headless Chromium. The latest standard run
completed the complete workflow successfully:

```text
1 passed (36.7s)
```
