# Functional QA — SauceDemo

[![Playwright Tests](https://github.com/gesttaltt/qa-funtional-testing/actions/workflows/playwright.yml/badge.svg)](https://github.com/gesttaltt/qa-funtional-testing/actions/workflows/playwright.yml)

End-to-end functional test suite for [saucedemo.com](https://www.saucedemo.com), built with [Playwright](https://playwright.dev/) + TypeScript following the Page Object Model pattern.

**Live report:** https://gesttaltt.github.io/qa-funtional-testing/

## Coverage

- **Login**: valid credentials plus a data-driven battery of invalid cases (empty fields, wrong password, locked-out user).
- **Inventory**: sorting by name and price, adding/removing products, cart badge.
- **Cart**: cart contents, removing items, continue shopping.
- **Checkout**: full purchase flow with cross-screen price integrity (inventory → cart → checkout summary must show the same price) and cart-clears-on-completion check; required-field validation (data-driven) plus a documented quirk where whitespace-only fields bypass validation; total price calculation, verified per-item against inventory, across different cart sizes (data-driven).
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

Repetitive cases (invalid login variants, checkout validation, cart combinations) live as JSON under `fixtures/data/` and are looped over inside each spec with a `for` to generate one independent test per case — so adding a new case just means editing the JSON, not touching test code.

Data-driven cases are only added when they exercise genuinely different app behavior. An earlier version of this suite parametrized the full purchase flow across several "customer profiles" (different names, postal code formats) — dropped after verifying that SauceDemo's checkout never reflects that input anywhere in the UI, so the variants were tripling test count without adding coverage. The remaining checkout e2e test is a single, deeper case instead.

## Usage

```bash
npm install
npx playwright install        # download the browsers

npm test                      # run the full suite (chromium, firefox, webkit)
npm run test:ui                # interactive UI mode
npm run test:headed            # run with a visible browser
npm run report                 # open the latest Playwright HTML report
```

## Allure reports

Every run also writes raw results to `allure-results/` via the `allure-playwright` reporter. Requires a Java runtime (used by the Allure CLI).

```bash
npm run allure:serve      # generate + open a report in one step (temp dir)
npm run allure:generate   # build a static report into allure-report/
npm run allure:open       # open the last generated allure-report/
```

## CI

Every push/PR to `main` runs the full suite on GitHub Actions (`.github/workflows/playwright.yml`) and publishes both the Playwright HTML report and the generated Allure report as artifacts. On pushes to `main`, a second job regenerates the Allure report — carrying over trend history from the previously deployed site — and publishes it to GitHub Pages at https://gesttaltt.github.io/qa-funtional-testing/.
