import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
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
import { fulfillJson } from './utilities';
import {
    getSidebarItem,
    getSidebarItemText,
    getSidebarItemBadge
} from './selectors';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.JS_TEMPLATES);
});

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
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

    await page.goto('/');

    const logBook = getSidebarItem(page, HREFS.ACTIVITY);

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

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

        await fulfillJson(page, json);

        await page.goto('/');

        const title = page.locator(SELECTORS.TITLE);

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await expect(title).toContainText('false 123');

        await haSwitchStateRequest(page, true);

        await expect(title).toContainText('true 123');

        await haSwitchStateRequest(page, false);
    });

});

test('if there are no partials and a partial statement is used, it should throw a warning', async ({ page }) => {

    const warnings: string[] = [];

    page.on('console', message => {
        if (message.type() === 'warning') {
            warnings.push(message.text());
        }
    });

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
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    await page.waitForTimeout(1000);

    expect(warnings).toEqual(
        expect.arrayContaining(['custom-sidebar: partial my_partial doesn\'t exist'])
    );

    page.removeAllListeners();

});

test('if a partial doesn\'t exist it should throw a warning', async ({ page }) => {

    const warnings: string[] = [];

    page.on('console', message => {
        if (message.type() === 'warning') {
            warnings.push(message.text());
        }
    });

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
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    await page.waitForTimeout(1000);

    expect(warnings).toEqual(
        expect.arrayContaining(['custom-sidebar: partial my_partial doesn\'t exist'])
    );

    page.removeAllListeners();

});

test('reactive variables in js_variables should be converted properly', async ({ page }) => {

    await fulfillJson(
        page,
        {
            js_variables: {
                reactive_array: `ref(
                    [1, 2, 3]
                )`,
                reactive_object: `ref(
                    {
                        propA: 'A',
                        propB: 'B',
                        propC: 'C'
                    }
                )`,
                reactive_string: 'ref("String")',
                reactive_count: 'ref([0])'
            },
            title: `
                [[[
                    const array = ref('reactive_array').value;
                    const object = ref('reactive_object').value;
                    const string = ref('reactive_string').value;
                    const count = ref('reactive_count').value;

                    switch (count[0]) {
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
                            const array = ref('reactive_array');
                            const object = ref('reactive_object');
                            const string = ref('reactive_string');
                            const count = ref('reactive_count');

                            count.value[0]++;

                            switch (count.value[0]) {
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
    );

    await page.goto('/');

    const checkItem = getSidebarItem(page, '#');
    const title = page.locator(SELECTORS.TITLE);

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    await expect(title).toContainText('Initial Value');

    await checkItem.click();

    await expect(title).toContainText('1 | 2 | 3 | 4');

    await checkItem.click();

    await expect(title).toContainText('A | B | C | D');

    await checkItem.click();

    await expect(title).toContainText('Custom String');

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

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

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