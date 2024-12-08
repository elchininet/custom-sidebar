import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import {
    haConfigRequest,
    haSwitchStateRequest,
    haSelectStateRequest
} from './ha-services';
import { getSidebarItemSelector, fulfillJson } from './utilities';
import { SELECTORS } from './selectors';

const ENERGY_ITEM = getSidebarItemSelector('energy');
const ENERGY_ITEM_TEXT = `${ENERGY_ITEM} .item-text`;
const ENERGY_ITEM_NOTIFICATION_COLLAPSED = `${ENERGY_ITEM} ${SELECTORS.ITEM_NOTIFICATION_COLLAPSED}`;
const ENERGY_ITEM_NOTIFICATION = `${ENERGY_ITEM} ${SELECTORS.ITEM_NOTIFICATION}`;
const FAN_ITEM = getSidebarItemSelector('fan');
const FAN_ITEM_NOTIFICATION_COLLAPSED = `${FAN_ITEM} ${SELECTORS.ITEM_NOTIFICATION_COLLAPSED}`;
const FAN_ITEM_NOTIFICATION = `${FAN_ITEM} ${SELECTORS.ITEM_NOTIFICATION}`;

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.JINJA_TEMPLATES);
});

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('sidebar-templates.png', {
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

    await haSwitchStateRequest(page, true);

    await expect(page).toHaveScreenshot('sidebar-templates-name-title.png', {
        clip: SIDEBAR_CLIP
    });

    await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
    await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

    await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (on)');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('2');

    await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('1');
    await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('1');

    await haSwitchStateRequest(page, false);

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

    await haSelectStateRequest(page, 2);

    await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('4');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('4');

    await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('2');
    await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('2');

    await haSelectStateRequest(page, 3);

    await expect(page.locator(ENERGY_ITEM_TEXT)).toContainText('Energy (off)');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION_COLLAPSED)).toContainText('6');
    await expect(page.locator(ENERGY_ITEM_NOTIFICATION)).toContainText('6');

    await expect(page.locator(FAN_ITEM_NOTIFICATION_COLLAPSED)).toContainText('3');
    await expect(page.locator(FAN_ITEM_NOTIFICATION)).toContainText('3');

    await haSelectStateRequest(page, 1);

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
            jinja_variables: {
                my_switch: 'input_boolean.my_switch',
                on: true,
                off: false,
                variable: 123
            },
            title: `
                {% if is_state(my_switch, "on") %}
                    {{ on }} {{ variable }}
                {% else %}
                    {{ off }} {{ variable }}
                {% endif %}
            `
        }
    },
    {
        title: 'partials should be included in the templates',
        json: {
            partials: {
                my_partial: `
                    {% set my_switch = 'input_boolean.my_switch' %}
                    {% set on = True %}
                    {% set off = False %}
                    {% set variable = 123 %}
                `
            },
            title: `
                @partial my_partial
                {% if is_state(my_switch, "on") %}
                    {{ on }} {{ variable }}
                {% else %}
                    {{ off }} {{ variable }}
                {% endif %}
            `
        }
    },
    {
        title: 'partials should use variables in jinja_variables',
        json: {
            jinja_variables: {
                my_switch: 'input_boolean.my_switch'
            },
            partials: {
                my_partial: `
                    {% set isOn = is_state(my_switch, "on") %}
                    {% set on = True %}
                    {% set off = False %}
                    {% set variable = 123 %}
                `
            },
            title: `
                @partial my_partial
                {% if isOn %}
                    {{ on }} {{ variable }}
                {% else %}
                    {{ off }} {{ variable }}
                {% endif %}
            `
        }
    },
    {
        title: 'partials should import other partials',
        json: {
            partials: {
                my_switch: `
                    {% set my_switch = 'input_boolean.my_switch' %}
                `,
                my_booleans: `
                    @partial my_switch
                    {% set on = True %}
                    {% set off = False %}
                `,
                my_partial: `
                    @partial my_booleans
                    {% set variable = 123 %}
                `
            },
            title: `
                @partial my_partial
                {% if is_state(my_switch, "on") %}
                    {{ on }} {{ variable }}
                {% else %}
                    {{ off }} {{ variable }}
                {% endif %}
            `
        }
    }
].forEach(({ title, json }) => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await expect(page.locator(SELECTORS.TITLE)).toContainText('False 123');

        await haSwitchStateRequest(page, true);

        await expect(page.locator(SELECTORS.TITLE)).toContainText('True 123');

        await haSwitchStateRequest(page, false);

    });

});