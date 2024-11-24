import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import {
    haConfigRequest,
    haSwitchStateRequest,
    haSelectStateRequest,
    getSidebarItemSelector,
    fulfillJson
} from './utilities';
import { SELECTORS } from './selectors';

const ENERGY_ITEM = getSidebarItemSelector('energy');
const ENERGY_ITEM_TEXT = `${ENERGY_ITEM} .item-text`;
const ENERGY_ITEM_NOTIFICATION_COLLAPSED = `${ENERGY_ITEM} ${SELECTORS.ITEM_NOTIFICATION_COLLAPSED}`;
const ENERGY_ITEM_NOTIFICATION = `${ENERGY_ITEM} ${SELECTORS.ITEM_NOTIFICATION}`;
const FAN_ITEM = getSidebarItemSelector('fan');
const FAN_ITEM_NOTIFICATION_COLLAPSED = `${FAN_ITEM} ${SELECTORS.ITEM_NOTIFICATION_COLLAPSED}`;
const FAN_ITEM_NOTIFICATION = `${FAN_ITEM} ${SELECTORS.ITEM_NOTIFICATION}`;

test.beforeAll(async () => {
    await haConfigRequest(CONFIG_FILES.JS_TEMPLATES);
});

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('01-sidebar-templates.png', {
        clip: SIDEBAR_CLIP
    });
};

test('should have the default result of the templates', async ({ page }) => {

    await pageVisit(page);

    await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('2');

    await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('1');
    await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('1');

});

test('name and title using templates should update if one of their entities change', async ({ page }) => {

    await pageVisit(page);

    await expect(page.locator(SELECTORS.MENU)).not.toHaveCSS('pointer-events', 'none');
    await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

    await haSwitchStateRequest(true);

    await expect(page).toHaveScreenshot('02-sidebar-templates-name-title.png', {
        clip: SIDEBAR_CLIP
    });

    await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
    await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

    await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (on)');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('2');

    await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('1');
    await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('1');

    await haSwitchStateRequest(false);

    await expect(page.locator(SELECTORS.MENU)).not.toHaveCSS('pointer-events', 'none');
    await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

    await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('2');

    await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('1');
    await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('1');

});

test('notifications using a template should update if one of its entities change', async ({ page }) => {

    await pageVisit(page);

    await haSelectStateRequest(2);

    await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('4');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('4');

    await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
    await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('2');

    await haSelectStateRequest(3);

    await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('6');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('6');

    await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('3');
    await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('3');

    await haSelectStateRequest(1);

    await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('2');

    await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('1');
    await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('1');

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
    }
].forEach(({ title, json }) => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('false 123');

        await haSwitchStateRequest(true);

        await expect(page.locator(SELECTORS.TITLE)).toContainText('true 123');

        await haSwitchStateRequest(false);
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

    expect(warnings).toEqual(
        expect.arrayContaining(['custom-sidebar: partial my_partial doesn\'t exist'])
    );

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

    expect(warnings).toEqual(
        expect.arrayContaining(['custom-sidebar: partial my_partial doesn\'t exist'])
    );

});