import { test, expect } from 'playwright-test-coverage';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import { haConfigRequest } from './ha-services';
import {
    fulfillJson,
    navigateHome,
    noCacheRoute,
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
                item: 'er', // it also matches with "Energy" but it matches first with "Overview"
                name: 'Overview matched'
            },
            {
                item: 'e', // it should match with "Overview" but as it was already matched it is ignored and it picks "Energy"
                name: 'Energy matched'
            },
            {
                item: 'g', // it should match with "/energy" but as it was already matched it is ignored and it picks "Activity" (/logbook)
                name: 'Activity matched',
                match: 'href'
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
