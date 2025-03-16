import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES } from './constants';
import { haConfigRequest } from './ha-services';
import { SELECTORS } from './selectors';

const PREFIX = 'custom-sidebar debug:';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page, withDebug = false): Promise<void> => {
    await page.goto(
        withDebug
            ? '/?cs_debug'
            : '/'
    );
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

test('Debug messages shoud not be logged', async ({ page }) => {

    const logs: string[] = [];

    page.on('console', message => {
        if (['log', 'startGroup', 'endGroup'].includes(message.type())) {
            logs.push(message.text());
        }
    });

    await pageVisit(page);

    expect(logs).toEqual(
        expect.not.arrayContaining([
            `${PREFIX} HAQuerySelector init executed`
        ])
    );

});

test('@testing Debug messages shoud be logged', async ({ page }) => {

    const logs: string[] = [];

    page.on('console', message => {
        if (['log', 'startGroup', 'endGroup'].includes(message.type())) {
            logs.push(message.text());
        }
    });

    await pageVisit(page, true);

    expect(logs).toEqual(
        expect.not.arrayContaining([
            `${PREFIX} HAQuerySelector init executed`,
            `${PREFIX} Starting the plugin...`,
            `${PREFIX} Executing plugin logic...`
        ])
    );

});