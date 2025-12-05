import { test, expect } from 'playwright-test-coverage';
import {
    CONFIG_FILES,
    SIDEBAR_CLIP
} from './constants';
import { haConfigRequest } from './ha-services';
import {
    fulfillJson,
    navigateHome,
    noCacheRoute
} from './utilities';

const getOrderItemWithColorOption = (option: string, extraOptions: Record<string, unknown> = {}) => ({
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

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

test.beforeEach(noCacheRoute);

[
    {
        title: 'should override the global icon_color option',
        json: getOrderItemWithColorOption('icon_color'),
        screenshot: 'color-overriding-icon-color.png'
    },
    {
        title: 'should override the global icon_color_selected option',
        json: getSelectedOrderItemWithColorOption('icon_color_selected'),
        screenshot: 'color-overriding-icon-color-selected.png'
    },
    {
        title: 'should override the global text_color option',
        json: getOrderItemWithColorOption('text_color'),
        screenshot: 'color-overriding-text-color.png'
    },
    {
        title: 'should override the global text_color_selected option',
        json: getSelectedOrderItemWithColorOption('text_color_selected'),
        screenshot: 'color-overriding-text-color-selected.png'
    },
    {
        title: 'should override the global selection_background option',
        json: getSelectedOrderItemWithColorOption('selection_background'),
        screenshot: 'color-overriding-selection-background.png'
    },
    {
        title: 'should override the global info_color option',
        json: getOrderItemWithColorOption(
            'info_color',
            { info: 'Some info' }
        ),
        screenshot: 'color-overriding-info-color.png'
    },
    {
        title: 'should override the global info_color_selected option',
        json: getSelectedOrderItemWithColorOption(
            'info_color_selected',
            { info: 'Some info' }
        ),
        screenshot: 'color-overriding-info-color-selected.png'
    },
    {
        title: 'should override the global notification_color option',
        json: getOrderItemWithColorOption(
            'notification_color',
            { notification: '2' }
        ),
        screenshot: 'color-overriding-notification-color.png'
    },
    {
        title: 'should override the global notification_text_color option',
        json: getOrderItemWithColorOption(
            'notification_text_color',
            { notification: '2' }
        ),
        screenshot: 'color-overriding-notification-text-color.png'
    },
    {
        title: 'should override the global divider_color option',
        json: getOrderItemWithColorOption(
            'divider_color',
            { divider: true }
        ),
        screenshot: 'color-overriding-divider-color.png'
    }
].forEach(({ title, json, screenshot }) => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);
        await navigateHome(page);
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
    await navigateHome(page);
    await expect(page).toHaveScreenshot('color-overriding-selection-opacity.png', {
        clip: SIDEBAR_CLIP
    });

});