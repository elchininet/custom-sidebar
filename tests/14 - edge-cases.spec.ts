import { test, expect } from 'playwright-test-coverage';
import {
    CONFIG_FILES,
    JSON_PATH,
    SIDEBAR_CLIP
} from './constants';
import { haConfigRequest } from './ha-services';
import {
    fulfillJson,
    navigateHome,
    noCacheRoute,
    waitForMainElements,
    waitForErrors,
    waitForWarnings
} from './utilities';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

test.beforeEach(noCacheRoute);

test('if there is a match the item should be marked and ignored by subsequent matches', async ({ page }) => {

    await fulfillJson(page, {
        order: [
            {
                item: 'er', // it should match also with "Energy" but it matches first with "overview"
                name: 'Overview matched'
            },
            {
                item: 'g', // it should match also with "/energy" but it matches first with "/logbook"
                name: 'Activity matched',
                match: 'href'
            },
            {
                item: 'e', // it also matches with "Overview" and "Energy" but as they were already matched, they are ignored
                name: 'Energy matched'
            }
        ]
    });

    await navigateHome(page);

    await expect(page).toHaveScreenshot('multiple-matches.png', {
        clip: SIDEBAR_CLIP
    });

});

test('non new-items that don\'t match a sidebar item should trigger a warning', async ({ page }) => {

    const MESSAGE = 'custom-sidebar: you have an order item in your configuration that didn\'t match any sidebar item:';

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

    await page.goto('/');

    const warnings = await waitForWarnings(page);

    expect(warnings).toContain(`${MESSAGE} "medium"`);
    expect(warnings).toContain(`${MESSAGE} "logboek"`);
    expect(warnings).not.toContain(`${MESSAGE} "bazinga"`);

});

test('if loadig the config takes too much time, the _panelLoaded should wait for the config without generating an error', async ({ page }) => {
    await page.route(JSON_PATH, async route => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
    });
    page.goto('/');
    const errors = await waitForErrors(page, 5000);
    await waitForMainElements(page);
    expect(errors.length).toBe(0);
});