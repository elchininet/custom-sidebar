import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import { haConfigRequest, fulfillJson } from './utilities';
import { SELECTORS } from './selectors';

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
        clip: SIDEBAR_CLIP,
        // Temporary fix until Home Assistant 2024.4.x arrives
        threshold: 1,
        maxDiffPixels: 80
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