import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
  CONFIG_FILES,
  SIDEBAR_CLIP,
  ATTRIBUTES
} from './constants';
import { haConfigRequest, addJsonExtendedRoute } from './utilities';
import { SELECTORS } from './selectors';

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

test('Hiting Enter with items focused should select the proper item', async ({ page }) => {

  await visitHome(page);
  await page.waitForTimeout(600);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS).focus();
  await page.waitForTimeout(600);

  await page.keyboard.press('Enter');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).toHaveClass(SELECTED_CLASSNAME);
  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).not.toHaveClass(SELECTED_CLASSNAME);
  
  await page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES).focus();
  await page.waitForTimeout(600);

  await page.keyboard.press('Enter');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES)).toHaveClass(SELECTED_CLASSNAME);
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

test('Restore the scroll after clicking on an element', async ({ page }) => {

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

test('Restore the scroll after pressing Enter with an element focused', async ({ page }) => {

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

  await page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS).focus();
  await page.keyboard.press('Enter');
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

test('Navigate focused items with the up and down arrows', async ({ page }) => {

  await visitHome(page);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.OVERVIEW).focus();

  await page.keyboard.press('ArrowDown');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.GOOGLE)).toBeFocused();

  await page.keyboard.press('ArrowDown');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS)).toBeFocused();

  await page.keyboard.press('ArrowUp');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.GOOGLE)).toBeFocused();

  await page.keyboard.press('ArrowUp');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.OVERVIEW)).toBeFocused();

  await page.keyboard.press('ArrowUp');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.DEV_TOOLS)).toBeFocused();

  await page.keyboard.press('ArrowUp');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG)).toBeFocused();

  await page.keyboard.press('ArrowDown');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.DEV_TOOLS)).toBeFocused();

  await page.keyboard.press('ArrowDown');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.OVERVIEW)).toBeFocused();

});

test('Navigate focused items with tabs', async ({ page }) => {

  await visitHome(page);

  await page.locator(SELECTORS.SIDEBAR_ITEMS.OVERVIEW).focus();

  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.SIDEBAR_PAPER_ICON_ITEMS.GOOGLE)).toBeFocused();

  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.SIDEBAR_PAPER_ICON_ITEMS.INTEGRATIONS)).toBeFocused();

  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.SIDEBAR_PAPER_ICON_ITEMS.GOOGLE)).toBeFocused();

  await page.keyboard.press('Tab');

  await page.locator(SELECTORS.SIDEBAR_PAPER_ICON_ITEMS.OVERVIEW).focus();

  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toBeFocused();

  await page.keyboard.up('Shift');
  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.OVERVIEW)).toBeFocused();

  await page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG).focus();

  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.SIDEBAR_PAPER_ICON_ITEMS.DEV_TOOLS)).toBeFocused();

  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.NOTIFICATIONS)).toBeFocused();

  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.PROFILE)).toBeFocused();

  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.NOTIFICATIONS)).toBeFocused();

  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.SIDEBAR_PAPER_ICON_ITEMS.DEV_TOOLS)).toBeFocused();

});

test('Pressing tab without being in the sidebar will not select any item', async ({ page }) => {

  await visitHome(page);

  await page.evaluate(() => {
    const selected = document.activeElement;
    if (selected && selected instanceof HTMLElement) {
      selected.blur();
    }
  });

  await page.keyboard.press('Tab');

  await expect(page.locator(SELECTORS.SIDEBAR_ITEMS.OVERVIEW)).not.toBeFocused();

});

test('Tooltip behaviour in new items', async ({ page }) => {

  await visitHome(page);

  await page.locator(SELECTORS.SIDEBAR_PAPER_ICON_ITEMS.GOOGLE).hover();

  await expect(page.locator(SELECTORS.TOOLTIP)).not.toBeVisible();

  await page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON).click();

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toHaveAttribute('expanded');

  await page.locator(SELECTORS.SIDEBAR_PAPER_ICON_ITEMS.GOOGLE).hover();

  await expect(page.locator(SELECTORS.TOOLTIP)).toBeVisible();

  await expect(page.locator(SELECTORS.TOOLTIP)).toContainText('Google');

  await page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON).click();

});