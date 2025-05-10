import { test, expect } from 'playwright-test-coverage';
import {
    CONFIG_FILES,
    SIDEBAR_CLIP_WITH_DIVIDERS,
    SELECTORS,
    BASE_URL,
    HREFS
} from './constants';
import { haConfigRequest } from './ha-services';
import { fulfillJson } from './utilities';
import { NAMESPACE } from '../src/constants';
import { getSidebarItem } from './selectors';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

[
    {
        title: 'if there is no order option the sidebar should remain intact',
        json: {},
        screenshot: 'sidebar-no-changes.png'
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
        screenshot: 'sidebar-new-item-notification.png'
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
        screenshot: 'sidebar-new-item-notification.png'
    },
    {
        title: 'should set the sidebar_background as a color',
        json: { sidebar_background: 'red' },
        screenshot: 'sidebar-background-color.png'
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
        screenshot: 'sidebar-background-image.png'
    },
    {
        title: 'should set the menu_background as a color',
        json: { menu_background: 'red' },
        screenshot: 'sidebar-menu-background-color.png'
    },
    {
        title: 'should set the menu_background as a background',
        json: {
            menu_background: 'url(/local/background.jpg)',
            title_color: 'white',
            sidebar_button_color: 'white'
        },
        screenshot: 'sidebar-menu-background-image.png'
    },
    {
        title: 'should set the sidebar_button_color',
        json: { sidebar_button_color: 'red' },
        screenshot: 'sidebar-button-color.png'
    },
    {
        title: 'should set the sidebar_border_color',
        json: { sidebar_border_color: 'red' },
        screenshot: 'sidebar-border-color.png'
    },
    {
        title: 'should set the title',
        json: { title: 'My Home' },
        screenshot: 'sidebar-custom-title.png'
    },
    {
        title: 'should set title_color',
        json: { title_color: 'red' },
        screenshot: 'sidebar-title-color.png'
    },
    {
        title: 'should set the subtitle',
        json: { subtitle: 'Custom subtitle' },
        screenshot: 'sidebar-custom-subtitle.png'
    },
    {
        title: 'should set the subtitle color',
        json: {
            subtitle: 'Custom subtitle',
            subtitle_color: 'red'
        },
        screenshot: 'sidebar-custom-subtitle-color.png'
    },
    {
        title: 'should set item_background',
        json: {
            item_background: 'linear-gradient(#e66465, #9198e5)'
        },
        screenshot: 'sidebar-item-background.png'
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
        screenshot: 'sidebar-notification-color.png'
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
        screenshot: 'sidebar-notification-color-selected.png'
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
        screenshot: 'sidebar-notification-text-color-selected.png'
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
        screenshot: 'sidebar-item-info.png'
    },
    {
        title: 'If icon_color is set the icons should change their color',
        json: { icon_color: 'red' },
        screenshot: 'sidebar-icon-color.png'
    },
    {
        title: 'If icon_color_selected is set the icons of the selected item should change its color',
        json: { icon_color_selected: 'red' },
        screenshot: 'sidebar-icon-color-selected.png'
    },
    {
        title: 'If text_color is set the texts should change their color',
        json: { text_color: 'red' },
        screenshot: 'sidebar-text-color.png'
    },
    {
        title: 'If text_color_selected is set the text of the selected item should change its color',
        json: { text_color_selected: 'red' },
        screenshot: 'sidebar-text-color-selected.png'
    },
    {
        title: 'If selection_background is set the background of the selected item should change its color',
        json: { selection_background: 'red' },
        screenshot: 'sidebar-selection-background.png'
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
        screenshot: 'sidebar-info-color.png'
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
        screenshot: 'sidebar-info-color-selected.png'
    },
    {
        title: 'if hide_all is set it should hide all the sidebar items',
        json: {
            hide_all: true,
            order: [
                {
                    new_item: true,
                    item: 'Integrations',
                    href: '/config/integrations',
                    icon: 'mdi:puzzle'
                }
            ]
        },
        screenshot: 'sidebar-hide-all.png'
    },
    {
        title: 'If divider_color is set it should set all the dividers in that color',
        json: {
            divider_color: 'red'
        },
        screenshot: 'sidebar-divider-color.png'
    },
    {
        title: 'If divider_top_color is set it should override divider_color',
        json: {
            divider_color: 'red',
            divider_top_color: 'green'
        },
        screenshot: 'sidebar-divider-top-color.png'
    },
    {
        title: 'If divider_bottom_color is set it should override divider_color',
        json: {
            divider_color: 'red',
            divider_bottom_color: 'green'
        },
        screenshot: 'sidebar-divider-bottom-color.png'
    },
    {
        title: 'should apply custom styles',
        json: {
            styles: `
                .menu .title {
                    color: red !important;
                }
                ha-md-list-item .item-text {
                    color: blue !important;
                }
            `
        },
        screenshot: 'sidebar-custom-styles.png'
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

test('should apply attributes as an object to an item', async ({ page }) => {

    await fulfillJson(
        page,
        {
            order: [
                {
                    item: 'settings',
                    attributes: {
                        'data-yes': 'yes',
                        'data-no': 'no'
                    }
                }
            ]
        }
    );

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    const configItem = getSidebarItem(page, HREFS.CONFIG);

    await expect(configItem).toHaveAttribute('data-yes', 'yes');
    await expect(configItem).toHaveAttribute('data-no', 'no');
    await expect(configItem).toHaveAttribute('data-custom-sidebar-attrs', 'data-yes|data-no');

});

test('should apply attributes as a JavaScript template to an item', async ({ page }) => {

    await fulfillJson(
        page,
        {
            order: [
                {
                    item: 'settings',
                    attributes: `[[[
                        return {
                            'data-js-yes': 'yes',
                            'data-js-no': 'no'
                        };
                    ]]]`
                }
            ]
        }
    );

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    const configItem = getSidebarItem(page, HREFS.CONFIG);

    await expect(configItem).toHaveAttribute('data-js-yes', 'yes');
    await expect(configItem).toHaveAttribute('data-js-no', 'no');
    await expect(configItem).toHaveAttribute('data-custom-sidebar-attrs', 'data-js-yes|data-js-no');

});

test('should throw an error if the attributes property has a template that does not return an object', async ({ page }) => {

    const errors: string[] = [];

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    await fulfillJson(
        page,
        {
            order: [
                {
                    item: 'settings',
                    attributes: `[[[
                        return "non valid";
                    ]]]`
                }
            ]
        }
    );

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    await page.waitForTimeout(1000);

    expect(errors).toEqual(
        expect.arrayContaining([
            `${NAMESPACE}: "attributes" template must always return an object`
        ])
    );

    page.removeAllListeners();

});

test('should throw a warning if the attributes property has a template that returns an object with a non allowed property', async ({ page }) => {

    const warnings: string[] = [];

    page.on('console', message => {
        if (message.type() === 'warning') {
            warnings.push(message.text());
        }
    });

    await fulfillJson(
        page,
        {
            js_variables: {
                my_attrs: 'yes'
            },
            order: [
                {
                    item: 'settings',
                    attributes: `[[[
                        return {
                            'data-prop1': 'correct',
                            'data-prop2': ['incorrect'],
                            'data-prop3': 100,
                            'data-prop4': true
                        };
                    ]]]`
                }
            ]
        }
    );

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    const configItem = getSidebarItem(page, HREFS.CONFIG);

    await expect(configItem).toHaveAttribute('data-prop1', 'correct');
    await expect(configItem).not.toHaveAttribute('data-prop2');
    await expect(configItem).toHaveAttribute('data-prop3', '100');
    await expect(configItem).toHaveAttribute('data-prop4', 'true');
    await expect(configItem).toHaveAttribute('data-custom-sidebar-attrs', 'data-prop1|data-prop3|data-prop4');

    await page.waitForTimeout(1000);

    expect(warnings).toEqual(
        expect.arrayContaining([
            `${NAMESPACE}: the property "data-prop2" in the attributes property of the item "settings" should be a string, a number or a boolean. This property will be omitted`
        ])
    );

    page.removeAllListeners();

});

test('should redirect to the default_path on load', async ({ page }) => {

    await fulfillJson(
        page,
        {
            default_path: '/config/integrations'
        }
    );

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.PANEL_CONFIG)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/config/integrations/dashboard`);

});

test('should redirect to the default_path on refresh', async ({ page }) => {

    await fulfillJson(
        page,
        {
            default_path: '/config/integrations'
        }
    );

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.PANEL_CONFIG)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/config/integrations/dashboard`);

    await getSidebarItem(page, HREFS.TODO).click();

    await expect(page).not.toHaveURL(`${BASE_URL}/config/integrations/dashboard`);

    await page.reload();
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.PANEL_CONFIG)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/config/integrations/dashboard`);

});

test.describe('on_click property', () => {

    const item = {
        new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow'
    };

    test('should execute a call-service action without changing the URL', async ({ page }) => {

        await fulfillJson(
            page,
            {
                title: `
                    if (is_state('input_boolean.my_switch', 'on')) {
                        return 'Custom Title';
                    }
                    return 'Home Assistant';
                `,
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'call-service',
                            service: 'input_boolean.toggle',
                            data: {
                                entity_id: 'input_boolean.my_switch'
                            }
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('Home Assistant');

        await getSidebarItem(page, '#').click();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('Custom Title');

        await expect(page).not.toHaveURL(/.*#/);

        await getSidebarItem(page, '#').click();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('Home Assistant');

    });

    test('should execute a call-service action changing the URL', async ({ page }) => {

        const PATH = '/config/integrations';

        await fulfillJson(
            page,
            {
                title: `
                    if (is_state('input_boolean.my_switch', 'on')) {
                        return 'Custom Title';
                    }
                    return 'Home Assistant';
                `,
                order: [
                    {
                        ...item,
                        href: PATH,
                        on_click: {
                            action: 'call-service',
                            service: 'input_boolean.toggle',
                            data: {
                                entity_id: 'input_boolean.my_switch'
                            }
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('Home Assistant');

        await getSidebarItem(page, PATH).click();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('Custom Title');

        await expect(page).toHaveURL(/\/config\/integrations/);

        await getSidebarItem(page, PATH).click();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('Home Assistant');

    });

    test('should execute a call-service action compiling the data using JavaScript templates', async ({ page }) => {

        const PATH = '/config/integrations';

        await fulfillJson(
            page,
            {
                js_variables: {
                    domain: 'input_boolean',
                    entity: 'my_switch'
                },
                partials: {
                    my_switch: `
                        const mySwitch = domain + '.' + entity;
                    `
                },
                title: `
                    if (is_state('input_boolean.my_switch', 'on')) {
                        return 'Custom Title';
                    }
                    return 'Home Assistant';
                `,
                order: [
                    {
                        ...item,
                        href: PATH,
                        on_click: {
                            action: 'call-service',
                            service: 'input_boolean.toggle',
                            data: {
                                entity_id: `[[[
                                    @partial my_switch
                                    return mySwitch;
                                ]]]`
                            }
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('Home Assistant');

        await getSidebarItem(page, PATH).click();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('Custom Title');

        await getSidebarItem(page, PATH).click();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('Home Assistant');

    });

    test('should throw a warning if a call-service action has a malformed service', async ({ page }) => {

        const warnings: string[] = [];

        page.on('console', message => {
            if (message.type() === 'warning') {
                warnings.push(message.text());
            }
        });

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'call-service',
                            service: 'restart'
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '#').click();

        await page.waitForTimeout(1000);

        expect(warnings).toEqual(
            expect.arrayContaining([
                'custom-sidebar ignoring "call-service" action in "Check" item. The service parameter is malfomed.'
            ])
        );

        page.removeAllListeners();

    });

    test('should execute a javascript action without redirecting', async ({ page }) => {

        const logs: string[] = [];

        page.on('console', message => {
            logs.push(message.text());
        });

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'javascript',
                            code: `
                                console.log('JavaScript code executed');
                                history.pushState(null, "", '/config/integrations');
                            `
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '#').click();

        await expect(page).toHaveURL(/\/config\/integrations/);

        expect(logs).toEqual(
            expect.arrayContaining(['JavaScript code executed'])
        );

        page.removeAllListeners();

    });

    test('should execute a javascript action redirecting', async ({ page }) => {

        const logs: string[] = [];

        page.on('console', message => {
            logs.push(message.text());
        });

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        href: '/config/integrations',
                        on_click: {
                            action: 'javascript',
                            code: `
                                console.log('JavaScript code executed');
                                return;
                            `
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '/config/integrations').click();

        await expect(page).toHaveURL(/\/config\/integrations/);

        expect(logs).toEqual(
            expect.arrayContaining(['JavaScript code executed'])
        );

        page.removeAllListeners();

    });

    test('should execute a javascript action using partials', async ({ page }) => {

        const href = '/config/integrations';

        const logs: string[] = [];

        page.on('console', message => {
            logs.push(message.text());
        });

        await fulfillJson(
            page,
            {
                partials: {
                    throw_console: 'console.log("JavaScript code from partial executed");'
                },
                order: [
                    {
                        ...item,
                        href,
                        on_click: {
                            action: 'javascript',
                            code: `
                                @partial throw_console
                                return;
                            `
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, href).click();

        await page.waitForTimeout(1000);

        expect(logs).toEqual(
            expect.arrayContaining(['JavaScript code from partial executed'])
        );

        page.removeAllListeners();

    });

    test('should execute a javascript action having the clicked item and the itemText as variables', async ({ page }) => {

        const logs: string[] = [];

        page.on('console', message => {
            logs.push(message.text());
        });

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        href: '/config/integrations',
                        on_click: {
                            action: 'javascript',
                            code: `
                                console.log('Clicked item is ' + itemText + ' and the icon is ' + item.icon);
                            `
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '/config/integrations').click();

        expect(logs).toEqual(
            expect.arrayContaining(['Clicked item is Check and the icon is mdi:bullseye-arrow'])
        );

        page.removeAllListeners();

    });

    test('should execute an open-dialog action with a more-info dialog', async ({ page }) => {

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'open-dialog',
                            type: 'more-info',
                            entity_id: 'input_boolean.my_switch'
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '#').click();

        expect(page.locator('ha-more-info-dialog ha-dialog-header .title')).toContainText('My Switch');

    });

    test('should execute an open-dialog action with a restart dialog', async ({ page }) => {

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'open-dialog',
                            type: 'restart'
                        }
                    }
                ]
            }
        );

        await page.goto('/');

        const dialog = page.locator('dialog-restart ha-dialog-header');
        const title = 'Restart Home Assistant';

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        // It should load the dialog
        await getSidebarItem(page, '#').click();

        await expect(dialog.locator('span[slot="title"]')).toContainText(title);

        await dialog.locator('ha-icon-button').click();

        await expect(dialog).not.toBeVisible();

        // It should reuse the dialog already registered in customComponents
        await getSidebarItem(page, '#').click();

        await expect(dialog.locator('span[slot="title"]')).toContainText(title);

        await dialog.locator('ha-icon-button').click();

        await expect(dialog).not.toBeVisible();

    });

});