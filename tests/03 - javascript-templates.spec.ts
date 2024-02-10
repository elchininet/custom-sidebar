import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { SELECTORS, CONFIG_FILES } from './constants';
import {
  haConfigRequest,
  haSwitchStateRequest,
  haSelectStateRequest
} from './utilities';

test.beforeAll(async () => {
  await haConfigRequest(CONFIG_FILES.JS_TEMPLATES);
});

const pageVisit = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

test('Templates default', async ({ page }) => {

  await pageVisit(page);

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('01-sidebar-templates.png');

});

test('Templates update entity for name and title', async ({ page }) => {

  await pageVisit(page);

  await haSwitchStateRequest(true);

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('02-sidebar-templates-name-title.png');

  await haSwitchStateRequest(false);

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('01-sidebar-templates.png');

});

test('Templates update entity for notifications', async ({ page }) => {

  await pageVisit(page);

  await haSelectStateRequest(2);

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('02-sidebar-templates-notification-2.png');

  await haSelectStateRequest(3);

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('02-sidebar-templates-notification-3.png');

  await haSelectStateRequest(1);

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('01-sidebar-templates.png');

});