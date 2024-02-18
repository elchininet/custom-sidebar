import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import {
  haConfigRequest,
  haSwitchStateRequest,
  haSelectStateRequest,
  getSidebarItemSelector
} from './utilities';
import { SELECTORS } from './selectors';

const ENERGY_ITEM = getSidebarItemSelector('energy');
const ENERGY_ITEM_TEXT = `${ENERGY_ITEM} .item-text`;
const ENERGY_ITEM_NOTIFICATION_COLLAPSED = `${ENERGY_ITEM} ${SELECTORS.ITEM_NOTIFICATION_COLLAPSED}`;
const ENERGY_ITEM_NOTIFICATION = `${ENERGY_ITEM} ${SELECTORS.ITEM_NOTIFICATION}`;
const FAN_ITEM = getSidebarItemSelector('fan');
const FAN_ITEM_NOTIFICATION_COLLAPSED = `${FAN_ITEM} ${SELECTORS.ITEM_NOTIFICATION_COLLAPSED}`;
const FAN_ITEM_NOTIFICATION = `${FAN_ITEM} ${SELECTORS.ITEM_NOTIFICATION}`;

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

  await expect(page).toHaveScreenshot('01-sidebar-templates.png', {
    clip: SIDEBAR_CLIP
  });

  await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('2');

  await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('1');
  await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('1');

});

test('Templates update entity for name and title', async ({ page }) => {

  await pageVisit(page);

  await haSwitchStateRequest(true);

  await expect(page).toHaveScreenshot('02-sidebar-templates-name-title.png', {
    clip: SIDEBAR_CLIP
  });

  await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (on)');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('2');

  await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('1');
  await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('1');

  await haSwitchStateRequest(false);

  await expect(page).toHaveScreenshot('01-sidebar-templates.png', {
    clip: SIDEBAR_CLIP
  });

  await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('2');

  await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('1');
  await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('1');

});

test('Templates update entity for notifications', async ({ page }) => {

  await pageVisit(page);

  await haSelectStateRequest(2);

  await expect(page).toHaveScreenshot('02-sidebar-templates-notification-2.png', {
    clip: SIDEBAR_CLIP
  });

  await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('4');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('4');

  await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
  await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('2');

  await haSelectStateRequest(3);

  await expect(page).toHaveScreenshot('02-sidebar-templates-notification-3.png', {
    clip: SIDEBAR_CLIP
  });

  await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('6');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('6');

  await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('3');
  await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('3');

  await haSelectStateRequest(1);

  await expect(page).toHaveScreenshot('01-sidebar-templates.png', {
    clip: SIDEBAR_CLIP
  });

  await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
  await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('2');

  await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('1');
  await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('1');

});