import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import { haConfigRequest, addJsonExtendedRoute } from './utilities';
import { SELECTORS } from './selectors';

const getOrderItemWithColorOption = (option: string) => ({
    [option]: 'blue',
    order: [
        {
            new_item: true,
            item: 'Check',
            icon: 'mdi:bullseye-arrow',
            href: '/check',
            order: 0,
            [option]: 'red'
        }
    ]
});

test.beforeAll(async () => {
    await haConfigRequest(CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

test('should override the global icon_color option', async ({ page }) => {

    await addJsonExtendedRoute(
        page,
        getOrderItemWithColorOption('icon_color')
    );

    await pageVisit(page);
    await expect(page).toHaveScreenshot('01-color-overriding-icon-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should override the global icon_color_selected option', async ({ page }) => {

    await addJsonExtendedRoute(
        page,
        {
            icon_color_selected: 'blue',
            order: [
                {
                    item: 'overview',
                    icon_color_selected: 'red'
                }
            ]
        }
    );

    await pageVisit(page);
    await expect(page).toHaveScreenshot('02-color-overriding-icon-color-selected.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should override the global text_color option', async ({ page }) => {

    await addJsonExtendedRoute(
        page,
        getOrderItemWithColorOption('text_color')
    );

    await pageVisit(page);
    await expect(page).toHaveScreenshot('03-color-overriding-text-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should override the global text_color_selected option', async ({ page }) => {

    await addJsonExtendedRoute(
        page,
        {
            text_color_selected: 'blue',
            order: [
                {
                    item: 'overview',
                    text_color_selected: 'red'
                }
            ]
        }
    );

    await pageVisit(page);
    await expect(page).toHaveScreenshot('04-color-overriding-text-color-selected.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should override the global selection_color option', async ({ page }) => {

    await addJsonExtendedRoute(
        page,
        {
            selection_color: 'blue',
            order: [
                {
                    item: 'overview',
                    selection_color: 'red'
                }
            ]
        }
    );

    await pageVisit(page);
    await expect(page).toHaveScreenshot('05-color-overriding-selection-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should override the global info_color option', async ({ page }) => {

    await addJsonExtendedRoute(
        page,
        {
            info_color: 'blue',
            order: [
                {
                    new_item: true,
                    item: 'Check',
                    icon: 'mdi:bullseye-arrow',
                    href: '/check',
                    order: 0,
                    info: 'Some info',
                    info_color: 'red'
                }
            ]
        }
    );

    await pageVisit(page);
    await expect(page).toHaveScreenshot('06-color-overriding-info-color.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should override the global info_color_selected option', async ({ page }) => {

    await addJsonExtendedRoute(
        page,
        {
            info_color_selected: 'blue',
            order: [
                {
                    item: 'overview',
                    info: 'Some info',
                    info_color_selected: 'red'
                }
            ]
        }
    );

    await pageVisit(page);
    await expect(page).toHaveScreenshot('07-color-overriding-info-color-selected.png', {
        clip: SIDEBAR_CLIP
    });

});

test('should override the global notification_color option', async ({ page }) => {

    await addJsonExtendedRoute(
        page,
        {
            notification_color: 'blue',
            order: [
                {
                    item: 'overview',
                    notification: '5'
                },
                {
                    new_item: true,
                    item: 'Check',
                    icon: 'mdi:bullseye-arrow',
                    href: '/check',
                    order: 0,
                    notification: '2',
                    notification_color: 'red'
                }
            ]
        }
    );

    await pageVisit(page);
    await expect(page).toHaveScreenshot('08-color-overriding-notification-color.png', {
        clip: SIDEBAR_CLIP
    });

});