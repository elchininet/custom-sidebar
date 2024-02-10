import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { HomeAssistant } from 'home-assistant-javascript-templates';
import { SELECTORS, CONFIG_FILES } from './constants';
import { haConfigRequest, fulfillJson } from './utilities';

test.beforeAll(async () => {
    await haConfigRequest(CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

test('Multiple items match the same element', async ({ page }) => {

  await fulfillJson(page, {
    order: [
        {
            item: 'er',
            name: 'Overview matched'
        },
        {
            item: 'lo',
            name: "Logbook matched"
        },
        {
            item: 'oo',
            name: "Dev matched"
        }
    ]
  });

  await pageVisit(page);

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('01-multiple-matches.png');

});