import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
  SELECTORS,
  CONFIG_FILES,
  SIDEBAR_CLIP,
  ATTRIBUTES
} from './constants';
import { haConfigRequest, addJsonExtendedRoute } from './utilities';

const SELECTED_CLASSNAME = /(^|\s)iron-selected(\s|$)/;

test.beforeAll(async () => {
  await haConfigRequest(CONFIG_FILES.BASIC);
});

const visitHome = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
  await expect(page).toHaveScreenshot('01-sidebar.png', {
    clip: SIDEBAR_CLIP
  });
};

test('Clicking on items with the same root path should select the proper item', async ({ page }) => {

  await visitHome(page);
  await page.waitForTimeout(600);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS).click();
  await page.waitForTimeout(600);

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);
  
  await page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES).click();
  await page.waitForTimeout(600);

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS).click();
  await page.waitForTimeout(600);

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG).click();
  await page.waitForTimeout(600);

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES)).not.toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS)).not.toHaveClass(SELECTED_CLASSNAME);

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
  await page.waitForTimeout(600);

  const scrollTopStart = await page.locator(SELECTORS.PAPER_LIST_BOX).evaluate(element => element.scrollTop);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS).click({ delay: 150 });
  await page.waitForTimeout(600);

  expect(
    await page.locator(SELECTORS.PAPER_LIST_BOX).evaluate(element => element.scrollTop)
  ).toBe(scrollTopStart);

});

test('By default it should be possible to edit the sidebar', async ({ page }) => {

  await visitHome(page);

  await page.locator(SELECTORS.TITLE).click({ delay: 1000 });

  await expect(page.locator(SELECTORS.TITLE)).not.toBeVisible();
  await expect(page.locator(SELECTORS.SIDEBAR_EDIT_BUTTON)).toBeVisible();

  await page.goto('/profile');

  await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

});

test('If sidebar_editable is set to true it should be possible to edit the sidebar', async ({ page }) => {

  await visitHome(page);

  await addJsonExtendedRoute(page, {
    sidebar_editable: true
  });

  await page.locator(SELECTORS.TITLE).click({ delay: 1000 });

  await expect(page.locator(SELECTORS.TITLE)).not.toBeVisible();
  await expect(page.locator(SELECTORS.SIDEBAR_EDIT_BUTTON)).toBeVisible();

  await page.goto('/profile');

  await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

});

test('If sidebar_editable is set to false it should not be possible to edit the sidebar', async ({ page }) => {

  await addJsonExtendedRoute(page, {
    sidebar_editable: false
  });

  await visitHome(page);

  await page.locator(SELECTORS.TITLE).click({ delay: 1000 });

  await expect(page.locator(SELECTORS.TITLE)).toBeVisible();
  await expect(page.locator(SELECTORS.SIDEBAR_EDIT_BUTTON)).not.toBeVisible();

  await page.goto('/profile');

  await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).toHaveAttribute(ATTRIBUTES.DISABLED);

});