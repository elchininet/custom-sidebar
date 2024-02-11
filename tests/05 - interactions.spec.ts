import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
  SELECTORS,
  CONFIG_FILES,
  SIDEBAR_CLIP
} from './constants';
import { haConfigRequest } from './utilities';

const SELECTED_CLASSNAME = /(^|\s)iron-selected(\s|$)/;

test.beforeAll(async () => {
  await haConfigRequest(CONFIG_FILES.BASIC);
});

test('Clicking on items with the same root path should select the proper item', async ({ page }) => {

  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
  await expect(page).toHaveScreenshot('01-sidebar.png', {
    clip: SIDEBAR_CLIP
  });

  await page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG).click();

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS)).not.toHaveClass(SELECTED_CLASSNAME);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS).click();

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES).click();

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS).click();

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);

});

test('Visit a URL that matches with multiple items should select the proper item', async ({ page }) => {

  await page.goto('/config');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS)).not.toHaveClass(SELECTED_CLASSNAME);

  await page.goto('/config/integrations');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS)).not.toHaveClass(SELECTED_CLASSNAME);

  await page.goto('/config/entities');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS)).not.toHaveClass(SELECTED_CLASSNAME);

  await page.goto('/config/automation');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS)).toHaveClass(SELECTED_CLASSNAME);

});

test('Do not move the clicked item outside the viewport', async ({ page }) => {

  await page.setViewportSize({ width: 1024, height: 500 });

  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
  await expect(page).toHaveScreenshot('02-sidebar-small-viewport.png', {
    clip: {
      ...SIDEBAR_CLIP,
      height: 378
    }
  });

  await page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS).click({ delay: 150 });
  await page.waitForTimeout(100);

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).toBeInViewport();

});