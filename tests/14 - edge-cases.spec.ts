import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
    CONFIG_FILES,
    SELECTORS,
    SIDEBAR_CLIP
} from './constants';
import { haConfigRequest } from './ha-services';
import { fulfillJson } from './utilities';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

test('if there is a match the item should be marked and ignored by subsequent matches', async ({ page }) => {

    await fulfillJson(page, {
        order: [
            {
                item: 'er', // it should match also with "Developer tools" but it matches first with "overview"
                name: 'Overview matched'
            },
            {
                item: 'lo', // it should match also with "/developer-tools" but it matches first with "/logbook"
                name: 'Activity matched',
                match: 'href'
            },
            {
                item: 'oo', // it also matches with "/logbook" but as "Activity" was already matched, it is ignored
                name: 'Dev matched',
                match: 'href'
            }
        ]
    });

    await pageVisit(page);

    await expect(page).toHaveScreenshot('multiple-matches.png', {
        clip: SIDEBAR_CLIP
    });

});

test('non new-items that don\'t match a sidebar item should trigger a warning', async ({ page }) => {

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

    await page.waitForTimeout(1000);

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

    page.removeAllListeners();

});