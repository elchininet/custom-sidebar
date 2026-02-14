import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Sidebar } from '../src/types';
import { CONFIG_FILES, HREFS, SELECTORS } from './constants';
import { haConfigRequest } from './ha-services';
import {
    addJsonExtendedRoute,
    navigateHome,
    noCacheRoute,
    waitForLogMessage,
    waitForLogMessages
} from './utilities';
import { getSidebarItem } from './selectors';

interface HASidebar extends Sidebar {
    hass: {
        config: {
            state: string;
        };
    };
    shouldUpdate: (changedProps: Map<string, unknown>) => boolean;
}

const PREFIX = 'custom-sidebar debug:';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

test.beforeEach(noCacheRoute);

const pageVisit = async (page: Page, withDebug = false): Promise<void> => {
    await page.goto(
        withDebug
            ? '/?cs_debug'
            : '/'
    );
};

test.describe('Debug messages', () => {

    test('debug messages shoud not be logged', async ({ page }) => {

        await pageVisit(page);

        const logs = await waitForLogMessages(page);

        expect(logs).toEqual(
            expect.not.arrayContaining([
                expect.stringContaining(`${PREFIX} Starting the plugin...`)
            ])
        );

    });

    test('debug messages shoud be logged', async ({ page }) => {

        await pageVisit(page, true);

        const logs = await waitForLogMessages(page);

        expect(logs).toEqual(
            expect.arrayContaining([
                expect.stringContaining(`${PREFIX} Starting the plugin...`),
                expect.stringContaining(`${PREFIX} Executing plugin logic...`)
            ])
        );

    });

    test('ha-sidebar shouldUpdate should return false when hass.config.state is not "RUNNING"', async ({ page }) => {

        const sidebar = page.locator(SELECTORS.HA_SIDEBAR);
        const configState = 'DUMMY';

        await pageVisit(page, true);

        await waitForLogMessage(page, `${PREFIX} Patching the sidebar shouldUpdate method...`);

        const shouldUpdateIsTrue = await sidebar.evaluate((sidebar: HASidebar) => {
            return sidebar.shouldUpdate(new Map([
                ['hass', {}]
            ]));
        });

        expect(shouldUpdateIsTrue).toBe(true);

        const shouldUpdateIsFalsePromise = sidebar.evaluate((sidebar: HASidebar, configState: string) => {
            const configStateBackup = sidebar.hass.config.state;
            sidebar.hass.config.state = configState;
            const result = sidebar.shouldUpdate(new Map([
                ['hass', {}]
            ]));
            sidebar.hass.config.state = configStateBackup;
            return result;
        }, configState);

        await waitForLogMessage(page, `${PREFIX} Home Assistant config state is ${configState}. Cancelling the update!`);

        expect(await shouldUpdateIsFalsePromise).toBe(false);

    });

});

test.describe('Analytics', () => {

    enum CLICKED {
        OVERVIEW = 'sidebar_item_clicked: Overview',
        INTEGRATIONS = 'sidebar_item_clicked: Integrations',
        CONFIG = 'sidebar_item_clicked: Settings'
    }

    enum VISITED {
        ACTIVITY = 'panel_visited: /logbook',
        CONFIG = 'panel_visited: /config',
        OVERVIEW = 'panel_visited: /lovelace',
        INTEGRATIONS = 'panel_visited: /config/integrations'
    }

    const clickOnElements = async (page: Page) => {
        await navigateHome(page);

        await page.waitForTimeout(1000);

        await getSidebarItem(page, HREFS.INTEGRATIONS).click();

        await page.waitForTimeout(1000);

        await getSidebarItem(page, HREFS.OVERVIEW).click();

        await page.waitForTimeout(1000);

        await getSidebarItem(page, HREFS.CONFIG).click();

        await page.waitForTimeout(1000);

        await page.goto('/logbook');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HA_LOGBOOK)).toBeVisible();

        await page.waitForTimeout(1000);
    };

    test('analytics should not be logged', async ({ page }) => {

        await clickOnElements(page);

        const logbookEntries = page.locator(SELECTORS.ENTRY_CONTAINER).filter({
            has: page.locator('button', { hasText: 'custom-sidebar' })
        });

        await expect(logbookEntries).toHaveCount(0);

    });

    test('all analytics messages should be logged properly when analytics is true', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            analytics: true
        });

        await clickOnElements(page);

        const logbookEntries = page.locator(SELECTORS.ENTRY_CONTAINER).filter({
            has: page.locator('button', { hasText: 'custom-sidebar' })
        });

        await expect(logbookEntries).toContainText([
            VISITED.ACTIVITY,
            VISITED.CONFIG,
            CLICKED.CONFIG,
            VISITED.OVERVIEW,
            CLICKED.OVERVIEW,
            VISITED.INTEGRATIONS,
            CLICKED.INTEGRATIONS,
            VISITED.OVERVIEW
        ]);

    });

    test('only panel_visited analytics messages should be logged if analytics.panel_visited is true', async ({ page }) => {

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
            VISITED.ACTIVITY,
            VISITED.CONFIG,
            VISITED.OVERVIEW,
            VISITED.INTEGRATIONS,
            VISITED.OVERVIEW
        ]);

    });

    test('only sidebar_item_clicked analytics messages should be logged if analytics.sidebar_item_clicked is true', async ({ page }) => {

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