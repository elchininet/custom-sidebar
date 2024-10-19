import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
    CONFIG_FILES,
    SIDEBAR_CLIP,
    SIDEBAR_NARROW_CLIP
} from './constants';
import {
    haConfigRequest,
    fulfillJson,
    addJsonExtendedRoute,
    changeToMobileViewport
} from './utilities';
import { SELECTORS } from './selectors';

test.beforeAll(async () => {
    await haConfigRequest(CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('01-sidebar.png', {
        clip: SIDEBAR_CLIP
    });
};

test('sidebar items should have a data-processed attribute after being processed', async ({ page }) => {

    await pageVisit(page);

    const items = [
        SELECTORS.SIDEBAR_ITEMS.OVERVIEW,
        SELECTORS.SIDEBAR_ITEMS.TODO,
        SELECTORS.SIDEBAR_ITEMS.LOGBOOK,
        SELECTORS.SIDEBAR_ITEMS.MEDIA_BROWSER,
        SELECTORS.SIDEBAR_ITEMS.CONFIG,
        SELECTORS.SIDEBAR_ITEMS.DEV_TOOLS,
        SELECTORS.SIDEBAR_ITEMS.ENERGY,
        SELECTORS.SIDEBAR_ITEMS.MAP,
        SELECTORS.SIDEBAR_ITEMS.HISTORY
    ];

    for (const selector of items) {
        await expect(page.locator(selector)).toHaveAttribute('data-processed', 'true');
    }

});

test('if there is no order option the sidebar should remain intact', async ({ page }) => {

    await fulfillJson(page, {});
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('02-sidebar-no-changes.png', {
        clip: SIDEBAR_CLIP
    });

});

test('new items should be added properly with all their attributes', async ({ page }) => {

    await pageVisit(page);

    const items = [
        SELECTORS.SIDEBAR_ITEMS.GOOGLE,
        SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS,
        SELECTORS.SIDEBAR_ITEMS.ENTITIES,
        SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS
    ];

    for (const selector of items) {
        await expect(page.locator(selector)).toBeVisible();
    }

    const google = page.locator(SELECTORS.SIDEBAR_ITEMS.GOOGLE);
    await expect(google).toHaveText('Google', { useInnerText: true });
    await expect(google).toHaveAttribute('href', 'https://mrdoob.com/projects/chromeexperiments/google-gravity/');
    await expect(google).toHaveAttribute('target', '_blank');

    const integrations = page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS);
    await expect(integrations).toHaveText('Integrations', { useInnerText: true });
    await expect(integrations).toHaveAttribute('href', '/config/integrations');
    await expect(integrations).not.toHaveAttribute('target', '_blank');

    const entities = page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES);
    await expect(entities).toHaveText('Entities', { useInnerText: true });
    await expect(entities).toHaveAttribute('href', '/config/entities');
    await expect(entities).not.toHaveAttribute('target', '_blank');

    const automations = page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS);
    await expect(automations).toHaveText('Automations', { useInnerText: true });
    await expect(automations).toHaveAttribute('href', '/config/automation');
    await expect(automations).not.toHaveAttribute('target', '_blank');

    const hidden = page.locator(SELECTORS.SIDEBAR_ITEMS.HIDDEN);
    await expect(hidden).not.toBeAttached();

});

test('a new item with notification should be added properly', async ({ page }) => {

    await fulfillJson(page, {
        order: [
            {
                new_item: true,
                item: 'Integrations',
                href: '/config/integrations',
                icon: 'mdi:puzzle',
                notification: '2'
            }
        ]
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('03-sidebar-new-item-notification.png', {
        clip: SIDEBAR_CLIP
    });

});

test('a new item with notification should behave propely when the sidebar is collapsed', async ({ page }) => {

    await fulfillJson(page, {
        order: [
            {
                new_item: true,
                item: 'Integrations',
                href: '/config/integrations',
                icon: 'mdi:puzzle',
                notification: '2'
            }
        ]
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    await page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON).click();

    await expect(page).toHaveScreenshot('04-sidebar-new-item-notification-collapsed.png', {
        clip: {
            ...SIDEBAR_CLIP,
            width: 55
        }
    });

    await page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON).click();

});

test('should change href and target of an existing item', async ({ page }) => {

    await fulfillJson(page, {
        order: [
            {
                item: 'config',
                match: 'data-panel',
                href: '/config/system',
                target: '_blank'
            }
        ]
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    const config = page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG);
    await expect(config).toHaveAttribute('href', '/config/system');
    await expect(config).toHaveAttribute('target', '_blank');

});

test('should apply the order propely', async ({ page }) => {

    await pageVisit(page);

    const items = [
        [SELECTORS.SIDEBAR_ITEMS.OVERVIEW, '0'],
        [SELECTORS.SIDEBAR_ITEMS.GOOGLE, '1'],
        [SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS, '2'],
        [SELECTORS.SIDEBAR_ITEMS.ENTITIES, '3'],
        [SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS, '4'],
        [SELECTORS.SIDEBAR_ITEMS.TODO, '5'],
        [SELECTORS.SIDEBAR_ITEMS.ENERGY, '7'],
        [SELECTORS.SIDEBAR_ITEMS.MAP, '8'],
        [SELECTORS.SIDEBAR_ITEMS.HISTORY, '9'],
        [SELECTORS.SIDEBAR_ITEMS.LOGBOOK, '12'],
        [SELECTORS.SIDEBAR_ITEMS.MEDIA_BROWSER, '13'],
        [SELECTORS.SIDEBAR_ITEMS.CONFIG, '14'],
        [SELECTORS.SIDEBAR_ITEMS.DEV_TOOLS, '15']
    ];

    for (const entry of items) {
        const [selector, index] = entry;
        await expect(page.locator(selector)).toHaveCSS('order', index);
    }
});

test('should hide items properly', async ({ page }) => {

    await pageVisit(page);

    const items = [
        SELECTORS.SIDEBAR_ITEMS.ENERGY,
        SELECTORS.SIDEBAR_ITEMS.MAP,
        SELECTORS.SIDEBAR_ITEMS.HISTORY
    ];

    for (const selector of items) {
        await expect(page.locator(selector)).not.toBeVisible();
    }

});

test('should set the sidebar_background as a color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_background: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('05-sidebar-background-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should set the sidebar_background as a background', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_background: 'url(/local/background.jpg)',
        title_color: 'white',
        icon_color: 'white',
        text_color: 'white',
        sidebar_button_color: 'white'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('06-sidebar-background-image.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should set the menu_background as a color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        menu_background: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('07-sidebar-menu-background-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should set the menu_background as a background', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        menu_background: 'url(/local/background.jpg)',
        title_color: 'white',
        sidebar_button_color: 'white'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('08-sidebar-menu-background-image.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should set the sidebar_button_color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_button_color: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('09-sidebar-button-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should change the title', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        title: 'My Home'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('10-sidebar-custom-title.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should set the title_color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        title_color: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('11-sidebar-title-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should set the notification_color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        notification_color: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('12-sidebar-notification-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('If sidebar_mode is set to "narrow" the sidebar should be visible in narrow mode in mobile', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_mode: 'narrow'
    });

    await changeToMobileViewport(page);

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toHaveAttribute('narrow');

    await expect(page).toHaveScreenshot('13-sidebar-mode-narrow.png', {
        clip: SIDEBAR_NARROW_CLIP
    });

});

test('If sidebar_mode is set to "extended" the sidebar should be visible in extended mode in mobile', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_mode: 'extended'
    });

    await changeToMobileViewport(page);

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toHaveAttribute('narrow');

    await expect(page).toHaveScreenshot('14-sidebar-mode-extended.png', {
        clip: {
            ...SIDEBAR_NARROW_CLIP,
            width: 255
        }
    });

});

test('If sidebar_mode is set to "hidden" the sidebar should not be visible in desktop', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_mode: 'hidden'
    });

    await page.goto('/');

    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toBeVisible();

});

test('If info is set in one item it should add the secondary text', async ({ page }) => {

    await fulfillJson(page, {
        order: [
            {
                new_item: true,
                item: 'Integrations',
                info: 'Integrations',
                href: '/config/integrations',
                icon: 'mdi:puzzle'
            }
        ]
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('15-sidebar-item-info.png', {
        clip: SIDEBAR_CLIP
    });

});

test('If icon_color is set the icons should change their color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        icon_color: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('16-sidebar-icon-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('If icon_color_selected is set the icons of the selected item should change its color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        icon_color_selected: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('17-sidebar-icon-color-selected.png', {
        clip: SIDEBAR_CLIP
    });

});

test('If text_color is set the texts should change their color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        text_color: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('18-sidebar-text-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('If text_color_selected is set the text of the selected item should change its color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        text_color_selected: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('19-sidebar-text-color-selected.png', {
        clip: SIDEBAR_CLIP
    });

});

test('If selection_color is set the background of the selected item should change its color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        selection_color: 'red'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('20-sidebar-selection-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('If info_color is set the color of the secondary text of the item should change its color', async ({ page }) => {

    await fulfillJson(page, {
        info_color: 'red',
        order: [
            {
                new_item: true,
                item: 'Integrations',
                info: 'Integrations',
                href: '/config/integrations',
                icon: 'mdi:puzzle'
            }
        ]
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('21-sidebar-info-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('If info_color_selected is set the color of the secondary text of the selected item should change its color', async ({ page }) => {

    await fulfillJson(page, {
        info_color_selected: 'red',
        order: [
            {
                item: 'overview',
                info: 'Integrations'
            }
        ]
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('22-sidebar-info-color-selected.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should apply custom styles', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        styles: '.menu .title { color: red; } a[role="option"] .item-text { color: blue; }'
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('23-sidebar-custom-styles.png', {
        clip: SIDEBAR_CLIP
    });

});