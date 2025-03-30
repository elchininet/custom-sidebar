import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES } from './constants';
import { haConfigRequest } from './ha-services';
import { addJsonExtendedRoute } from './utilities';
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

test.describe('Debug messages', () => {

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

    test('Debug messages shoud be logged', async ({ page }) => {

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

});

test.describe('Analytics', () => {

    const clickOnElements = async (page: Page) => {
        await pageVisit(page);

        await page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS).click();

        await page.waitForTimeout(100);

        await page.locator(SELECTORS.SIDEBAR_ITEMS.OVERVIEW).click();

        await page.waitForTimeout(100);

        await page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG).click();

        await page.waitForTimeout(100);

        await page.goto('/logbook');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HA_LOGBOOK)).toBeVisible();
    };

    test('Analytics should not be logged', async ({ page }) => {

        await clickOnElements(page);

        const logbookEntries = page.locator(SELECTORS.ENTRY_CONTAINER).filter({
            has: page.locator('button', { hasText: 'custom-sidebar' })
        });

        await expect(logbookEntries).toHaveCount(0);

    });

    test('Analytics should be logged properly', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            analytics: true
        });

        await clickOnElements(page);

        const logbookEntries = page.locator(SELECTORS.ENTRY_CONTAINER).filter({
            has: page.locator('button', { hasText: 'custom-sidebar' })
        });

        await expect(logbookEntries).toHaveCount(3);

        await expect(logbookEntries).toContainText([
            'clicked on Settings',
            'clicked on Overview',
            'clicked on Integrations'
        ]);

    });

});