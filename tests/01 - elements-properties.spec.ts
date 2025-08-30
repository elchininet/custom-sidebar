import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
    CONFIG_FILES,
    HREFS,
    SELECTORS,
    SIDEBAR_CLIP
} from './constants';
import { haConfigRequest } from './ha-services';
import { fulfillJson } from './utilities';
import {
    getSidebarItem,
    getSidebarLinkSelector,
    getSidebarItemLinkFromLocator,
    links
} from './selectors';

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('sidebar.png', {
        clip: SIDEBAR_CLIP
    });
};

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

test('sidebar items should have a data-processed attribute after being processed', async ({ page }) => {

    await pageVisit(page);

    const links = [
        HREFS.OVERVIEW,
        HREFS.TODO,
        HREFS.ACTIVITY,
        HREFS.MEDIA_BROWSER,
        HREFS.CONFIG,
        HREFS.DEV_TOOLS,
        HREFS.ENERGY,
        HREFS.MAP,
        HREFS.HISTORY
    ];

    for (const href of links) {
        const item = getSidebarItem(page, href);
        await expect(item).toHaveAttribute('data-processed', 'true');
    }

});

test('new items should be added properly with all their attributes', async ({ page }) => {

    await pageVisit(page);

    const hrefs = [
        HREFS.GOOGLE,
        HREFS.INTEGRATIONS,
        HREFS.ENTITIES,
        HREFS.AUTOMATIONS
    ];

    for (const href of hrefs) {
        const item = getSidebarItem(page, href);
        await expect(item).toBeVisible();
    }

    const google = getSidebarItem(page, HREFS.GOOGLE);
    const googleLink = getSidebarItemLinkFromLocator(google);
    await expect(google).toHaveText('Google', { useInnerText: true });
    await expect(googleLink).toHaveAttribute('href', 'https://mrdoob.com/projects/chromeexperiments/google-gravity/');
    await expect(googleLink).toHaveAttribute('target', '_blank');

    const integrations = getSidebarItem(page, HREFS.INTEGRATIONS);
    const integrationsLink = getSidebarItemLinkFromLocator(integrations);
    await expect(integrations).toHaveText('Integrations', { useInnerText: true });
    await expect(integrationsLink).toHaveAttribute('href', '/config/integrations');
    await expect(integrationsLink).not.toHaveAttribute('target', '_blank');

    const entities = getSidebarItem(page, HREFS.ENTITIES);
    const entitiesLink = getSidebarItemLinkFromLocator(entities);
    await expect(entities).toHaveText('Entities', { useInnerText: true });
    await expect(entitiesLink).toHaveAttribute('href', '/config/entities');
    await expect(entitiesLink).not.toHaveAttribute('target', '_blank');

    const automations = getSidebarItem(page, HREFS.AUTOMATIONS);
    const automationsLink = getSidebarItemLinkFromLocator(automations);
    await expect(automations).toHaveText('Automations', { useInnerText: true });
    await expect(automationsLink).toHaveAttribute('href', '/config/automation');
    await expect(automationsLink).not.toHaveAttribute('target', '_blank');

    const hidden = getSidebarItem(page, HREFS.HIDDEN);
    await expect(hidden).toBeAttached();
    await expect(hidden).not.toBeVisible();

});

test('should change href and target of an existing item', async ({ page }) => {

    const PATH = '/config/system';

    await fulfillJson(page, {
        order: [
            {
                item: 'config',
                match: 'href',
                href: PATH,
                target: '_blank'
            }
        ]
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    const oldConfig = page.locator(links.CONFIG);
    const newConfig = page.locator(getSidebarLinkSelector(PATH));
    await expect(oldConfig).not.toBeAttached();
    await expect(newConfig).toHaveAttribute('target', '_blank');

});

test('should apply the order propely', async ({ page }) => {

    await pageVisit(page);

    const linkEntries = [
        [HREFS.OVERVIEW, '0'],
        [HREFS.GOOGLE, '1'],
        [HREFS.INTEGRATIONS, '2'],
        [HREFS.ENTITIES, '3'],
        [HREFS.AUTOMATIONS, '4'],
        [HREFS.TODO, '5'],
        [HREFS.ENERGY, '7'],
        [HREFS.MAP, '8'],
        [HREFS.HISTORY, '9'],
        [HREFS.ACTIVITY, '12'],
        [HREFS.MEDIA_BROWSER, '13'],
        [HREFS.CONFIG, '14'],
        [HREFS.DEV_TOOLS, '15']
    ];

    for (const linkEntry of linkEntries) {
        const [href, index] = linkEntry;
        await expect(getSidebarItem(page, href)).toHaveCSS('order', index);
    }
});

test('should hide items properly', async ({ page }) => {

    await pageVisit(page);

    const linksArray = [
        HREFS.ENERGY,
        HREFS.MAP,
        HREFS.HISTORY
    ];

    for (const href of linksArray) {
        const item = getSidebarItem(page, href);
        await expect(item).toBeAttached();
        await expect(item).not.toBeVisible();
    }

});

test('should set an icon in an existent element', async ({ page }) => {

    await fulfillJson(page, {
        order: [
            {
                item: 'activity',
                icon: 'mdi:bullseye-arrow'
            }
        ]
    });
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    const logbookItem = getSidebarItem(page, HREFS.ACTIVITY);

    const logBookIcon = logbookItem.locator(SELECTORS.HA_ICON);

    await expect(logBookIcon).toBeVisible();
    await expect(logBookIcon).toHaveAttribute('icon', 'mdi:bullseye-arrow');
    await expect(logBookIcon).toHaveAttribute('slot', 'start');

});