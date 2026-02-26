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
import {
    fulfillJson,
    navigateHome,
    noCacheRoute
} from './utilities';
import {
    getSidebarItem,
    getSidebarItemText,
    getSidebarItemBadge
} from './selectors';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.JINJA_TEMPLATES);
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
    await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

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
                    hide: '{{ is_state("input_boolean.my_switch", "on") }}'
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
        title: 'variables should be included in exceptions templates',
        json: {
            jinja_variables: {
                my_switch: 'input_boolean.my_switch',
                on: true,
                off: false,
                variable: 123
            },
            exceptions: [
                {
                    user: 'Test',
                    title: `
                        {% if is_state(my_switch, "on") %}
                            {{ on }} {{ variable }}
                        {% else %}
                            {{ off }} {{ variable }}
                        {% endif %}
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
        title: 'partials should be included in the exceptions templates',
        json: {
            partials: {
                my_partial: `
                    {% set my_switch = 'input_boolean.my_switch' %}
                    {% set on = True %}
                    {% set off = False %}
                    {% set variable = 123 %}
                `
            },
            exceptions: [
                {
                    is_admin: true,
                    title: `
                        @partial my_partial
                        {% if is_state(my_switch, "on") %}
                            {{ on }} {{ variable }}
                        {% else %}
                            {{ off }} {{ variable }}
                        {% endif %}
                    `
                }
            ]
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
    },
    {
        title: 'it should render templates that are only a partial',
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
                `,
                title: `
                    @partial my_partial
                    {% if is_state(my_switch, "on") %}
                        {{ on }} {{ variable }}
                    {% else %}
                        {{ off }} {{ variable }}
                    {% endif %}
                `
            },
            title: '@partial title'
        }
    }
].forEach(({ title, json }) => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);

        const homeAssistantTitle = page.locator(SELECTORS.TITLE);

        await navigateHome(page);

        await expect(homeAssistantTitle).toContainText('False 123');

        await haSwitchStateRequest(page, true);

        await expect(homeAssistantTitle).toContainText('True 123');

        await haSwitchStateRequest(page, false);

    });

});

[
    {
        title: 'should redirect to the default_path on load',
        json: {
            default_path: `
                {% if is_state("input_boolean.my_switch", "on") %}
                    /config/integrations
                {% else %}
                    /config/automation
                {% endif %}
            `
        }
    },
    {
        title: 'should redirect to the default_path on load using variables',
        json: {
            jinja_variables: {
                my_switch: 'input_boolean.my_switch'
            },
            default_path: `
                {% if is_state(my_switch, "on") %}
                    /config/integrations
                {% else %}
                    /config/automation
                {% endif %}
            `
        }
    },
    {
        title: 'should redirect to the default_path on load using variables and partials',
        json: {
            jinja_variables: {
                my_switch: 'input_boolean.my_switch'
            },
            partials: {
                custom_path: `
                    {% if is_state(my_switch, "on") %}
                        /config/integrations
                    {% else %}
                        /config/automation
                    {% endif %}
                `
            },
            default_path: '@partial custom_path'
        }
    }
].forEach(({ title, json }) => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.PANEL_CONFIG)).toBeVisible();
        await expect(page).toHaveURL(`${BASE_URL}/config/automation/dashboard`, { timeout: 30000 });

        await haSwitchStateRequest(page, true);

        await page.reload();

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.PANEL_CONFIG)).toBeVisible();
        await expect(page).toHaveURL(`${BASE_URL}/config/integrations/dashboard`, { timeout: 30000 });

        await haSwitchStateRequest(page, false);
    });

});