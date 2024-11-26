import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import { haConfigRequest } from './ha-services';
import { fulfillJson } from './utilities';
import { SELECTORS } from './selectors';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

test('if multiple items match the same element the last one should be used', async ({ page }) => {

    await fulfillJson(page, {
        order: [
            {
                item: 'er',
                name: 'Overview matched'
            },
            {
                item: 'lo',
                name: 'Logbook matched'
            },
            {
                item: 'oo',
                name: 'Dev matched'
            }
        ]
    });

    await pageVisit(page);

    await expect(page).toHaveScreenshot('01-multiple-matches.png', {
        clip: SIDEBAR_CLIP
    });

});

test('Non new-items that don\'t match a sidebar item should trigger a warning', async ({ page }) => {

    const MESSAGE = 'custom-sidebar: you have an order item in your configuration that didn\'t match any sidebar item:';
    const warnings: string[] = [];

    await fulfillJson(page, {
        order: [
            {
                item: 'medium',
                order: 1
            },
            {
                item: 'bazinga',
                new_item: true,
                href: '/bazinga',
                icon: 'mdi:nuke',
                order: 2
            },
            {
                item: 'logboek',
                order: 3
            }
        ]
    });

    page.on('console', message => {
        if (message.type() === 'warning') {
            warnings.push(message.text());
        }
    });

    await pageVisit(page);

    expect(warnings).toEqual(
        expect.arrayContaining([
            `${MESSAGE} "medium"`,
            `${MESSAGE} "logboek"`
        ])
    );

    expect(warnings).toEqual(
        expect.not.arrayContaining([
            `${MESSAGE} "bazinga"`
        ])
    );

});