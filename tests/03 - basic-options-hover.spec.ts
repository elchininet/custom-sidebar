import { test, expect } from 'playwright-test-coverage';
import {
    CONFIG_FILES,
    HREFS,
    SELECTORS,
    SIDEBAR_CLIP_WITH_DIVIDERS
} from './constants';
import { haConfigRequest } from './ha-services';
import { getSidebarItem } from './selectors';
import { fulfillJson } from './utilities';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

[
    {
        title: 'should set item_background_hover',
        json: {
            item_background_hover: `linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
                                    linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
                                    linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)`,
            item_background_hover_opacity: 1
        },
        screenshot: 'sidebar-item-background-hover.png'
    },
    {
        title: 'should set icon_color_hover',
        json: {
            icon_color_hover: 'red'
        },
        screenshot: 'sidebar-icon-color-hover.png'
    },
    {
        title: 'should set text_color_hover',
        json: {
            text_color_hover: 'red'
        },
        screenshot: 'sidebar-text-color-hover.png'
    },
    {
        title: 'should set info_color_hover',
        json: {
            info_color_hover: 'red',
            order: [
                {
                    item: 'history',
                    info: 'History info'
                }
            ]
        },
        screenshot: 'sidebar-info-color-hover.png'
    },
    {
        title: 'should set notification_color_hover',
        json: {
            notification_color_hover: 'red',
            order: [
                {
                    item: 'history',
                    notification: '5'
                }
            ]
        },
        screenshot: 'sidebar-notification-color-hover.png'
    },
    {
        title: 'should set notification_text_color_hover',
        json: {
            notification_text_color_hover: 'red',
            order: [
                {
                    item: 'history',
                    notification: '5'
                }
            ]
        },
        screenshot: 'sidebar-notification-text-color-hover.png'
    }
].forEach(({ title, json, screenshot }): void => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);
        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
        await getSidebarItem(page, HREFS.HISTORY).hover();
        await expect(page).toHaveScreenshot(screenshot, {
            clip: SIDEBAR_CLIP_WITH_DIVIDERS
        });

    });

});