import { test, expect } from 'playwright-test-coverage';
import { CONFIG_FILES, SIDEBAR_CLIP_WITH_DIVIDERS } from './constants';
import { haConfigRequest, fulfillJson } from './utilities';
import { SELECTORS } from './selectors';

test.beforeAll(async () => {
    await haConfigRequest(CONFIG_FILES.BASIC);
});

[
    {
        title: 'if there is no order option the sidebar should remain intact',
        json: {},
        screenshot: '01-sidebar-no-changes.png'
    },
    {
        title: 'a new item with notification should be added properly',
        json: {
            order: [
                {
                    new_item: true,
                    item: 'Integrations',
                    href: '/config/integrations',
                    icon: 'mdi:puzzle',
                    notification: '2'
                }
            ]
        },
        screenshot: '02-sidebar-new-item-notification.png'
    },
    {
        title: 'notification as a number should be added corretcly',
        json: {
            order: [
                {
                    new_item: true,
                    item: 'Integrations',
                    href: '/config/integrations',
                    icon: 'mdi:puzzle',
                    notification: 2
                }
            ]
        },
        screenshot: '02-sidebar-new-item-notification.png'
    },
    {
        title: 'should set the sidebar_background as a color',
        json: { sidebar_background: 'red' },
        screenshot: '03-sidebar-background-color.png'
    },
    {
        title: 'should set the sidebar_background as a background',
        json: {
            sidebar_background: 'url(/local/background.jpg)',
            title_color: 'white',
            icon_color: 'white',
            text_color: 'white',
            sidebar_button_color: 'white'
        },
        screenshot: '04-sidebar-background-image.png'
    },
    {
        title: 'should set the menu_background as a color',
        json: { menu_background: 'red' },
        screenshot: '05-sidebar-menu-background-color.png'
    },
    {
        title: 'should set the menu_background as a background',
        json: {
            menu_background: 'url(/local/background.jpg)',
            title_color: 'white',
            sidebar_button_color: 'white'
        },
        screenshot: '06-sidebar-menu-background-image.png'
    },
    {
        title: 'should set the sidebar_button_color',
        json: { sidebar_button_color: 'red' },
        screenshot: '07-sidebar-button-color.png'
    },
    {
        title: 'should set the sidebar_border_color',
        json: { sidebar_border_color: 'red' },
        screenshot: '08-sidebar-border-color.png'
    },
    {
        title: 'should set the title',
        json: { title: 'My Home' },
        screenshot: '09-sidebar-custom-title.png'
    },
    {
        title: 'should set title_color',
        json: { title_color: 'red' },
        screenshot: '10-sidebar-title-color.png'
    },
    {
        title: 'should set the subtitle',
        json: { subtitle: 'Custom subtitle' },
        screenshot: '11-sidebar-custom-subtitle.png'
    },
    {
        title: 'should set the subtitle color',
        json: {
            subtitle: 'Custom subtitle',
            subtitle_color: 'red'
        },
        screenshot: '12-sidebar-custom-subtitle-color.png'
    },
    {
        title: 'should set item_background',
        json: {
            item_background: 'linear-gradient(#e66465, #9198e5)'
        },
        screenshot: '13-sidebar-item-background.png'
    },
    {
        title: 'should set notification_color',
        json: {
            notification_color: 'red',
            order: [
                {
                    item: 'lists',
                    notification: 3
                }
            ]
        },
        screenshot: '14-sidebar-notification-color.png'
    },
    {
        title: 'should set notification_color_selected',
        json: {
            notification_color_selected: 'red',
            order: [
                {
                    item: 'overview',
                    notification: 3
                }
            ]
        },
        screenshot: '15-sidebar-notification-color-selected.png'
    },
    {
        title: 'should set notification_text_color_selected',
        json: {
            notification_text_color_selected: 'red',
            order: [
                {
                    item: 'overview',
                    notification: 3
                }
            ]
        },
        screenshot: '16-sidebar-notification-text-color-selected.png'
    },
    {
        title: 'If info is set in one item it should add the secondary text',
        json: {
            order: [
                {
                    new_item: true,
                    item: 'Integrations',
                    info: 'Integrations',
                    href: '/config/integrations',
                    icon: 'mdi:puzzle'
                }
            ]
        },
        screenshot: '17-sidebar-item-info.png'
    },
    {
        title: 'If icon_color is set the icons should change their color',
        json: { icon_color: 'red' },
        screenshot: '18-sidebar-icon-color.png'
    },
    {
        title: 'If icon_color_selected is set the icons of the selected item should change its color',
        json: { icon_color_selected: 'red' },
        screenshot: '19-sidebar-icon-color-selected.png'
    },
    {
        title: 'If text_color is set the texts should change their color',
        json: { text_color: 'red' },
        screenshot: '20-sidebar-text-color.png'
    },
    {
        title: 'If text_color_selected is set the text of the selected item should change its color',
        json: { text_color_selected: 'red' },
        screenshot: '21-sidebar-text-color-selected.png'
    },
    {
        title: 'If selection_background is set the background of the selected item should change its color',
        json: { selection_background: 'red' },
        screenshot: '22-sidebar-selection-background.png'
    },
    {
        title: 'If info_color is set the color of the secondary text of the item should change its color',
        json: {
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
        },
        screenshot: '23-sidebar-info-color.png'
    },
    {
        title: 'If info_color_selected is set the color of the secondary text of the selected item should change its color',
        json: {
            info_color_selected: 'red',
            order: [
                {
                    item: 'overview',
                    info: 'Integrations'
                }
            ]
        },
        screenshot: '24-sidebar-info-color-selected.png'
    },
    {
        title: 'If divider_color is set it should set all the dividers in that color',
        json: {
            divider_color: 'red'
        },
        screenshot: '25-sidebar-divider-color.png'
    },
    {
        title: 'If divider_top_color is set it should override divider_color',
        json: {
            divider_color: 'red',
            divider_top_color: 'green'
        },
        screenshot: '26-sidebar-divider-top-color.png'
    },
    {
        title: 'If divider_bottom_color is set it should override divider_color',
        json: {
            divider_color: 'red',
            divider_bottom_color: 'green'
        },
        screenshot: '27-sidebar-divider-bottom-color.png'
    },
    {
        title: 'should apply custom styles',
        json: {
            styles: `
                .menu .title {
                    color: red !important;
                }
                a[role="option"] .item-text {
                    color: blue;
                }
            `
        },
        screenshot: '28-sidebar-custom-styles.png'
    }
].forEach(({ title, json, screenshot }): void => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);
        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
        await expect(page).toHaveScreenshot(screenshot, {
            clip: SIDEBAR_CLIP_WITH_DIVIDERS
        });

    });

});