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

    enum CLICKED {
        OVERVIEW = 'sidebar_item_clicked: Overview',
        INTEGRATIONS = 'sidebar_item_clicked: Integrations',
        CONFIG = 'sidebar_item_clicked: Settings'
    }

    enum VISITED {
        LOGBOOK = 'panel_visited: /logbook',
        CONFIG = 'panel_visited: /config',
        OVERVIEW = 'panel_visited: /lovelace',
        INTEGRATIONS = 'panel_visited: /config/integrations'
    }

    const clickOnElements = async (page: Page) => {
        await pageVisit(page);

        await page.waitForTimeout(1000);

        await page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS).click();

        await page.waitForTimeout(1000);

        await page.locator(SELECTORS.SIDEBAR_ITEMS.OVERVIEW).click();

        await page.waitForTimeout(1000);

        await page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG).click();

        await page.waitForTimeout(1000);

        await page.goto('/logbook');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HA_LOGBOOK)).toBeVisible();

        await page.waitForTimeout(1000);
    };

    test('Analytics should not be logged', async ({ page }) => {

        await clickOnElements(page);

        const logbookEntries = page.locator(SELECTORS.ENTRY_CONTAINER).filter({
            has: page.locator('button', { hasText: 'custom-sidebar' })
        });

        await expect(logbookEntries).toHaveCount(0);

    });

    test('All analytics messages should be logged properly when analytics is true', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            analytics: true
        });

        await clickOnElements(page);

        const logbookEntries = page.locator(SELECTORS.ENTRY_CONTAINER).filter({
            has: page.locator('button', { hasText: 'custom-sidebar' })
        });

        await expect(logbookEntries).toContainText([
            VISITED.LOGBOOK,
            VISITED.CONFIG,
            CLICKED.CONFIG,
            VISITED.OVERVIEW,
            CLICKED.OVERVIEW,
            VISITED.INTEGRATIONS,
            CLICKED.INTEGRATIONS,
            VISITED.OVERVIEW
        ]);

    });

    test('Only panel_visited analytics messages should be logged if analytics.panel_visited is true', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            analytics: {
                panel_visited: true
            }
        });

        await clickOnElements(page);

        const logbookEntries = page.locator(SELECTORS.ENTRY_CONTAINER).filter({
            has: page.locator('button', { hasText: 'custom-sidebar' })
        });

        await expect(logbookEntries).toContainText([
            VISITED.LOGBOOK,
            VISITED.CONFIG,
            VISITED.OVERVIEW,
            VISITED.INTEGRATIONS,
            VISITED.OVERVIEW
        ]);

    });

    test('Only sidebar_item_clicked analytics messages should be logged if analytics.sidebar_item_clicked is true', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            analytics: {
                sidebar_item_clicked: true
            }
        });

        await clickOnElements(page);

        const logbookEntries = page.locator(SELECTORS.ENTRY_CONTAINER).filter({
            has: page.locator('button', { hasText: 'custom-sidebar' })
        });

        await expect(logbookEntries).toContainText([
            CLICKED.CONFIG,
            CLICKED.OVERVIEW,
            CLICKED.INTEGRATIONS
        ]);

    });

});