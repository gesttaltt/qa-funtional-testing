# Functional QA — SauceDemo

End-to-end functional test suite for [saucedemo.com](https://www.saucedemo.com), built with [Playwright](https://playwright.dev/) + TypeScript following the Page Object Model pattern.

## Coverage

- **Login**: valid credentials plus a data-driven battery of invalid cases (empty fields, wrong password, locked-out user).
- **Inventory**: sorting by name and price, adding/removing products, cart badge.
- **Cart**: cart contents, removing items, continue shopping.
- **Checkout**: full purchase flow across several customer profiles, required-field validation, total price calculation across different carts — all data-driven.
- **Menu**: logout and reset app state.
- **Special users**: known bugs for `problem_user` (broken image) and `error_user` (uncaught JS exception), tolerance for `performance_glitch_user`'s delay.

## Structure

```
pages/          Page Objects (locators + actions per screen)
fixtures/       Playwright custom fixture and user data
fixtures/data/  External JSON test data (data-driven testing)
tests/          Specs organized by business flow
```

## Data-driven testing

Repetitive cases (invalid login variants, checkout validation, customer profiles, cart combinations) live as JSON under `fixtures/data/` and are looped over inside each spec with a `for` to generate one independent test per case — so adding a new case just means editing the JSON, not touching test code.

## Usage

```bash
npm install
npx playwright install        # download the browsers

npm test                      # run the full suite (chromium, firefox, webkit)
npm run test:ui                # interactive UI mode
npm run test:headed            # run with a visible browser
npm run report                 # open the latest HTML report
```

## CI

Every push/PR to `main` runs the full suite on GitHub Actions (`.github/workflows/playwright.yml`) and publishes the HTML report as an artifact.
