import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
    ATTRIBUTES,
    BASE_URL,
    CONFIG_FILES,
    SELECTORS,
    HREFS,
    SIDEBAR_CLIP
} from './constants';
import {
    haConfigRequest,
    haSwitchStateRequest,
    haSelectStateRequest
} from './ha-services';
import {
    fulfillJson,
    navigateHome,
    navigateToProfile,
    noCacheRoute,
    waitForWarning
} from './utilities';
import {
    getSidebarItem,
    getSidebarItemText,
    getSidebarItemBadge
} from './selectors';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.JS_TEMPLATES);
});

test.beforeEach(noCacheRoute);

const pageVisit = async (page: Page): Promise<void> => {
    await navigateHome(page);
    await expect(page).toHaveScreenshot('sidebar-templates.png', {
        clip: SIDEBAR_CLIP
    });
};

const getEnergyItemText = (page: Page) => getSidebarItemText(page, HREFS.ENERGY);
const getEnergyItemBadge = (page: Page) => getSidebarItemBadge(page, HREFS.ENERGY);
const getFanItemBadge = (page: Page) => getSidebarItemBadge(page, '/my_fan');

test('should have the default result of the templates', async ({ page }) => {

    await pageVisit(page);

    await expect(getEnergyItemText(page)).toContainText('Energy (off)');
    await expect(getEnergyItemBadge(page)).toContainText('2');
    await expect(getFanItemBadge(page)).toContainText('1');

});

test('name and title using templates should update if one of their entities change', async ({ page }) => {

    await pageVisit(page);

    const menu = page.locator(SELECTORS.MENU);
    const haIconButton = page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON);
    const energyItemText = getEnergyItemText(page);
    const energyItemBadge = getEnergyItemBadge(page);
    const fanItemBadge = getFanItemBadge(page);

    await expect(menu).not.toHaveCSS('pointer-events', 'none');
    await expect(haIconButton).not.toHaveCSS('pointer-events', 'all');

    await haSwitchStateRequest(page, true);

    await expect(page).toHaveScreenshot('sidebar-templates-name-title.png', {
        clip: SIDEBAR_CLIP
    });

    await expect(menu).toHaveCSS('pointer-events', 'none');
    await expect(haIconButton).toHaveCSS('pointer-events', 'all');

    await expect(energyItemText).toContainText('Energy (on)');
    await expect(energyItemBadge).toContainText('2');
    await expect(fanItemBadge).toContainText('1');

    await haSwitchStateRequest(page, false);

    await expect(menu).not.toHaveCSS('pointer-events', 'none');
    await expect(haIconButton).not.toHaveCSS('pointer-events', 'all');

    await expect(energyItemText).toContainText('Energy (off)');
    await expect(energyItemBadge).toContainText('2');
    await expect(fanItemBadge).toContainText('1');

});

test('notifications using a template should update if one of its entities change', async ({ page }) => {

    await pageVisit(page);

    const energyItemText = getEnergyItemText(page);
    const energyItemBadge = getEnergyItemBadge(page);
    const fanItemBadge = getFanItemBadge(page);

    await haSelectStateRequest(page, 2);

    await expect(energyItemText).toContainText('Energy (off)');
    await expect(energyItemBadge).toContainText('4');
    await expect(fanItemBadge).toContainText('2');

    await haSelectStateRequest(page, 3);

    await expect(energyItemText).toContainText('Energy (off)');
    await expect(energyItemBadge).toContainText('6');
    await expect(fanItemBadge).toContainText('3');

    await haSelectStateRequest(page, 1);

    await expect(energyItemText).toContainText('Energy (off)');
    await expect(energyItemBadge).toContainText('2');
    await expect(fanItemBadge).toContainText('1');

});

test('if the hide property is a template, item should get hidden when the template evaluates to true', async ({ page }) => {

    await fulfillJson(
        page,
        {
            order: [
                {
                    item: 'activity',
                    hide: '[[[ is_state("input_boolean.my_switch", "on") ]]]'
                }
            ]
        }
    );

    const logBook = getSidebarItem(page, HREFS.ACTIVITY);

    await navigateHome(page);

    await expect(logBook).toBeVisible();

    await haSwitchStateRequest(page, true);

    await expect(logBook).not.toBeVisible();

    await haSwitchStateRequest(page, false);

    await expect(logBook).toBeVisible();

});

[
    {
        title: 'variables should be included in the templates',
        json: {
            js_variables: {
                my_switch: 'input_boolean.my_switch',
                on: true,
                off: false,
                variable: 123
            },
            title: `
                [[[
                    if (is_state(my_switch, "on")) {
                        return on.toString() + " " + variable
                    }
                    return off.toString() + " " + variable
                ]]]
            `
        }
    },
    {
        title: 'variables should be included in exceptions templates',
        json: {
            js_variables: {
                my_switch: 'input_boolean.my_switch',
                on: true,
                off: false,
                variable: 123
            },
            exceptions: [
                {
                    user: 'Test',
                    title: `
                        [[[
                            if (is_state(my_switch, "on")) {
                                return on.toString() + " " + variable
                            }
                            return off.toString() + " " + variable
                        ]]]
                    `
                }
            ]
        }
    },
    {
        title: 'partials should be included in the templates',
        json: {
            partials: {
                my_partial: `
                    const my_switch = 'input_boolean.my_switch';
                    const on = true;
                    const off = false;
                    const variable = 123;
                `
            },
            title: `
                [[[
                    @partial my_partial
                    if (is_state(my_switch, "on")) {
                        return on.toString() + " " + variable
                    }
                    return off.toString() + " " + variable
                ]]]
            `
        }
    },
    {
        title: 'partials should be included in the exceptions templates',
        json: {
            partials: {
                my_partial: `
                    const my_switch = 'input_boolean.my_switch';
                    const on = true;
                    const off = false;
                    const variable = 123;
                `
            },
            exceptions: [
                {
                    is_admin: true,
                    title: `
                        [[[
                            @partial my_partial
                            if (is_state(my_switch, "on")) {
                                return on.toString() + " " + variable
                            }
                            return off.toString() + " " + variable
                        ]]]
                    `
                }
            ]
        }
    },
    {
        title: 'partials should use variables in js_variables',
        json: {
            js_variables: {
                my_switch: 'input_boolean.my_switch'
            },
            partials: {
                my_partial: `
                    const isOn = is_state(my_switch, "on");
                    const on = true;
                    const off = false;
                    const variable = 123;
                `
            },
            title: `
                [[[
                    @partial my_partial
                    if (isOn) {
                        return on.toString() + " " + variable
                    }
                    return off.toString() + " " + variable
                ]]]
            `
        }
    },
    {
        title: 'partials should import other partials',
        json: {
            partials: {
                my_switch: `
                    const my_switch = 'input_boolean.my_switch';
                `,
                my_booleans: `
                    @partial my_switch
                    const on = true;
                    const off = false;
                `,
                my_partial: `
                    @partial my_booleans
                    const variable = 123;
                `
            },
            title: `
                [[[
                    @partial my_partial
                    if (is_state(my_switch, "on")) {
                        return on.toString() + " " + variable
                    }
                    return off.toString() + " " + variable
                ]]]
            `
        }
    },
    {
        title: 'it should render templates that are only a partial',
        json: {
            partials: {
                my_switch: `
                    const my_switch = 'input_boolean.my_switch';
                `,
                my_booleans: `
                    @partial my_switch
                    const on = true;
                    const off = false;
                `,
                my_partial: `
                    @partial my_booleans
                    const variable = 123;
                `,
                title: `
                    [[[
                        @partial my_partial
                        if (is_state(my_switch, "on")) {
                            return on.toString() + " " + variable
                        }
                        return off.toString() + " " + variable
                    ]]]
                `
            },
            title: '@partial title'
        }
    }
].forEach(({ title, json }) => {

    test(title, async ({ page }) => {

        const homeAssistantTitle = page.locator(SELECTORS.TITLE);

        await fulfillJson(page, json);

        await navigateHome(page);

        await expect(homeAssistantTitle).toContainText('false 123');

        await haSwitchStateRequest(page, true);

        await expect(homeAssistantTitle).toContainText('true 123');

        await haSwitchStateRequest(page, false);
    });

});

test('if there are no partials and a partial statement is used, it should throw a warning', async ({ page }) => {

    await fulfillJson(
        page,
        {
            title: `
                [[[
                    @partial my_partial
                    if (is_state(my_switch, "on")) {
                        return on.toString() + " " + variable
                    }
                    return off.toString() + " " + variable
                ]]]
            `
        }
    );

    await page.goto('/');

    await waitForWarning(page, 'custom-sidebar: partial my_partial doesn\'t exist');

});

test('if a partial doesn\'t exist it should throw a warning', async ({ page }) => {

    await fulfillJson(
        page,
        {
            partials: {
                not_my_partial: `
                    const my_switch = 'input_boolean.my_switch';
                    const on = true;
                    const off = false;
                    const variable = 123;
                `
            },
            title: `
                [[[
                    @partial my_partial
                    if (is_state(my_switch, "on")) {
                        return on.toString() + " " + variable
                    }
                    return off.toString() + " " + variable
                ]]]
            `
        }
    );

    await page.goto('/');

    await waitForWarning(page, 'custom-sidebar: partial my_partial doesn\'t exist');

});

[
    {
        js_refs: {
            array: [1, 2, 3],
            object: {
                propA: 'A',
                propB: 'B',
                propC: 'C'
            },
            string: 'String',
            count: 0
        },
        title: `
            [[[
                switch (refs.count) {
                    case 1:
                        return refs.array.join(' | ');
                    case 2:
                        return Object.values(refs.object).join(' | ');
                    case 3:
                        return refs.string;
                    default:
                        return 'Initial Value';
                }
            ]]]
        `,
        order: [
            {
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                on_click: {
                    action: 'javascript',
                    code: `
                        refs.count++;

                        switch (refs.count) {
                            case 1:
                                refs.array = [
                                    ...refs.array,
                                    4
                                ];
                                break;
                            case 2:
                                refs.object = {
                                    ...refs.object,
                                    propD: 'D'
                                };
                                break;
                            case 3:
                                refs.string = 'Custom ' + refs.string;
                                break;
                        }
                    `
                }
            }
        ]
    },
    {
        js_refs: {
            array: [1, 2, 3],
            object: {
                propA: 'A',
                propB: 'B',
                propC: 'C'
            },
            string: 'String',
            count: 0
        },
        title: `
            [[[
                const array = ref('array').value;
                const object = ref('object').value;
                const string = ref('string').value;
                const count = ref('count').value;

                switch (count) {
                    case 1:
                        return array.join(' | ');
                    case 2:
                        return Object.values(object).join(' | ');
                    case 3:
                        return string;
                    default:
                        return 'Initial Value';
                }
            ]]]
        `,
        order: [
            {
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                on_click: {
                    action: 'javascript',
                    code: `
                        const array = ref('array');
                        const object = ref('object');
                        const string = ref('string');
                        const count = ref('count');

                        count.value++;

                        switch (count.value) {
                            case 1:
                                array.value = [
                                    ...array.value,
                                    4
                                ];
                                break;
                            case 2:
                                object.value = {
                                    ...object.value,
                                    propD: 'D'
                                };
                                break;
                            case 3:
                                string.value = 'Custom ' + string.value;
                                break;
                        }
                    `
                }
            }
        ]
    }
].forEach((config: Record<string, unknown>, index: number): void => {

    test(`reactive refs should be available in the templates if declared case # ${ index }`, async ({ page }) => {

        await fulfillJson(
            page,
            config
        );

        const checkItem = getSidebarItem(page, '#');
        const title = page.locator(SELECTORS.TITLE);

        await navigateHome(page);

        await expect(title).toContainText('Initial Value');

        await checkItem.click();

        await expect(title).toContainText('1 | 2 | 3 | 4');

        await checkItem.click();

        await expect(title).toContainText('A | B | C | D');

        await checkItem.click();

        await expect(title).toContainText('Custom String');

    });

});

[
    {
        js_refs: {
            is_sidebar_editable: true
        },
        sidebar_editable: '[[[ refs.is_sidebar_editable ]]]',
        order: [
            {
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                on_click: {
                    action: 'javascript',
                    code: 'refs.is_sidebar_editable = !refs.is_sidebar_editable'
                }
            }
        ]
    },
    {
        js_refs: {
            is_sidebar_editable: true
        },
        sidebar_editable: `
            [[[
                return ref('is_sidebar_editable').value;
            ]]]
        `,
        order: [
            {
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                on_click: {
                    action: 'javascript',
                    code: `ref('is_sidebar_editable').value = !ref('is_sidebar_editable').value`
                }
            }
        ]
    }
].forEach((config: Record<string, unknown>, index: number): void => {

    test(`reactive refs changes should trigger the templates values in which they are used case # ${ index }`, async ({ page }) => {

        await fulfillJson(
            page,
            config
        );

        const checkItem = getSidebarItem(page, '#');

        await navigateHome(page);

        await expect(page.locator(SELECTORS.MENU)).not.toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

        await checkItem.click();

        await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

        await checkItem.click();

        await expect(page.locator(SELECTORS.MENU)).not.toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

        await navigateToProfile(page);

        await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

        await checkItem.click();

        await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).toHaveAttribute(ATTRIBUTES.DISABLED);

        await checkItem.click();

        await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

    });

});

test('an item with a JavaScript template in the attributes property should modify its attributes when the template is reevaluated', async ({ page }) => {

    await fulfillJson(
        page,
        {
            order: [
                {
                    item: 'settings',
                    attributes: `[[[
                        if (is_state('input_boolean.my_switch', 'on')) {
                            return {
                                'data-switch-on': true
                            };
                        }
                        return {
                            'data-switch-off': true
                        };
                    ]]]`
                }
            ]
        }
    );

    await navigateHome(page);

    const configItem = getSidebarItem(page, HREFS.CONFIG);

    await expect(configItem).not.toHaveAttribute('data-switch-on');
    await expect(configItem).toHaveAttribute('data-switch-off', 'true');
    await expect(configItem).toHaveAttribute('data-custom-sidebar-attrs', 'data-switch-off');

    await haSwitchStateRequest(page, true);

    await expect(configItem).toHaveAttribute('data-switch-on', 'true');
    await expect(configItem).not.toHaveAttribute('data-switch-off');
    await expect(configItem).toHaveAttribute('data-custom-sidebar-attrs', 'data-switch-on');

    await haSwitchStateRequest(page, false);

    await expect(configItem).not.toHaveAttribute('data-switch-on');
    await expect(configItem).toHaveAttribute('data-switch-off', 'true');
    await expect(configItem).toHaveAttribute('data-custom-sidebar-attrs', 'data-switch-off');

});

[
    {
        title: 'should redirect to the default_path on load',
        json: {
            default_path: `[[[
                if (is_state('input_boolean.my_switch', 'on')) {
                    return '/config/integrations';
                }
                return '/config/automation';
            ]]]`
        }
    },
    {
        title: 'should redirect to the default_path on load using variables',
        json: {
            js_variables: {
                my_switch: 'input_boolean.my_switch'
            },
            default_path: `[[[
                if (is_state(my_switch, 'on')) {
                    return '/config/integrations';
                }
                return '/config/automation';
            ]]]`
        }
    },
    {
        title: 'should redirect to the default_path on load using variables and partials',
        json: {
            js_variables: {
                my_switch: 'input_boolean.my_switch'
            },
            partials: {
                custom_path: `
                    if (is_state(my_switch, 'on')) {
                        return '/config/integrations';
                    }
                    return '/config/automation';
                `
            },
            default_path: '[[[ @partial custom_path ]]]'
        }
    }
].forEach(({ title, json }) => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.PANEL_CONFIG)).toBeVisible();
        await expect(page).toHaveURL(`${BASE_URL}/config/automation/dashboard`);

        await haSwitchStateRequest(page, true);

        await page.reload();

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.PANEL_CONFIG)).toBeVisible();
        await expect(page).toHaveURL(`${BASE_URL}/config/integrations/dashboard`);

        await haSwitchStateRequest(page, false);
    });

});