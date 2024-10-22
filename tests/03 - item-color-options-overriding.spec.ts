import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import { haConfigRequest, fulfillJson } from './utilities';
import { SELECTORS } from './selectors';

const getOrderItemWithColorOption = (option: string, extraOptions: Record<string, string> = {}) => ({
    [option]: 'blue',
    order: [
        {
            new_item: true,
            item: 'Check',
            icon: 'mdi:bullseye-arrow',
            href: '/check',
            order: 0,
            ...extraOptions,
            [option]: 'red'
        }
    ]
});

const getSelectedOrderItemWithColorOption = (option: string, extraOptions: Record<string, string> = {}) => ({
    [option]: 'blue',
    order: [
        {
            item: 'overview',
            ...extraOptions,
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

[
    {
        title: 'should override the global icon_color option',
        json: getOrderItemWithColorOption('icon_color'),
        screenshot: '01-color-overriding-icon-color.png'
    },
    {
        title: 'should override the global icon_color_selected option',
        json: getSelectedOrderItemWithColorOption('icon_color_selected'),
        screenshot: '02-color-overriding-icon-color-selected.png'
    },
    {
        title: 'should override the global text_color option',
        json: getOrderItemWithColorOption('text_color'),
        screenshot: '03-color-overriding-text-color.png'
    },
    {
        title: 'should override the global text_color_selected option',
        json: getSelectedOrderItemWithColorOption('text_color_selected'),
        screenshot: '04-color-overriding-text-color-selected.png'
    },
    {
        title: 'should override the global selection_color option',
        json: getSelectedOrderItemWithColorOption('selection_color'),
        screenshot: '05-color-overriding-selection-color.png'
    },
    {
        title: 'should override the global info_color option',
        json: getOrderItemWithColorOption(
            'info_color',
            { info: 'Some info' }
        ),
        screenshot: '06-color-overriding-info-color.png'
    },
    {
        title: 'should override the global info_color_selected option',
        json: getSelectedOrderItemWithColorOption(
            'info_color_selected',
            { info: 'Some info' }
        ),
        screenshot: '07-color-overriding-info-color-selected.png'
    },
    {
        title: 'should override the global notification_color option',
        json: getOrderItemWithColorOption(
            'notification_color',
            { notification: '2' }
        ),
        screenshot: '08-color-overriding-notification-color.png'
    },
    {
        title: 'should override the global notification_text_color option',
        json: getOrderItemWithColorOption(
            'notification_text_color',
            { notification: '2' }
        ),
        screenshot: '09-color-overriding-notification-text-color.png'
    }
].forEach(({ title, json, screenshot }) => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);
        await pageVisit(page);
        await expect(page).toHaveScreenshot(screenshot, {
            clip: SIDEBAR_CLIP
        });

    });

});

test('should override the global selection_opacity option', async ({ page }) => {

    await fulfillJson(
        page,
        {
            selection_opacity: 0.12,
            order: [
                {
                    item: 'overview',
                    text_color_selected: 'white',
                    selection_opacity: 1
                }
            ]
        }
    );
    await pageVisit(page);
    await expect(page).toHaveScreenshot('10-color-overriding-selection-opacity.png', {
        clip: SIDEBAR_CLIP
    });

});