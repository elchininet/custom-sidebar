import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
    fulfillJson,
    haSwitchStateRequest,
    haSelectStateRequest
} from './utilities';
import { SELECTORS } from './selectors';

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

const TEXT_SELECTOR = 'paper-listbox > a[data-panel="check"] .item-text';
const NOTIFICATION_SELECTOR_1 = 'paper-listbox > a[data-panel="check"] .notification-badge-collapsed';
const NOTIFICATION_SELECTOR_2 = 'paper-listbox > a[data-panel="check"] .notification-badge:not(.notification-badge-collapsed)';

test.describe('title template returns', () => {

    test('if it returns undefined an empty string is used', async ({ page }) => {

        await fulfillJson(page, {
            title: '[[[ const title = "Custom"; return titles; ]]]'
        });

        page.on('console', message => {
            if (message.type() === 'warning') {
                expect(message.text()).toContain('ReferenceError: titles is not defined');
            }
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.TITLE)).toBeEmpty();

    });

    test('if it returns an empty string it should be used', async ({ page }) => {

        await fulfillJson(page, {
            title: '[[[ return ""; ]]]'
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.TITLE)).toBeEmpty();

    });

    test('if it returns a number it should be used as string', async ({ page }) => {

        await fulfillJson(page, {
            title: '[[[ return 5; ]]]'
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.TITLE)).toHaveText('5', { useInnerText: true });

    });

    test('if it returns a boolean it should be used as string', async ({ page }) => {

        await fulfillJson(page, {
            title: '[[[ return false; ]]]'
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.TITLE)).toHaveText('false', { useInnerText: true });

    });

    test('if it returns an array it should be stringified as JSON', async ({ page }) => {

        await fulfillJson(page, {
            title: '[[[ const title = "Custom"; return [ title ]; ]]]'
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.TITLE)).toHaveText('["Custom"]', { useInnerText: true });

    });

    test('if it is updated and it returns an empty string, it should be used', async ({ page }) => {

        await fulfillJson(page, {
            title: '[[[ return states("input_boolean.my_switch") === "on" ? "" : "My Home" ]]]'
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.TITLE)).toHaveText('My Home', { useInnerText: true });

        await haSwitchStateRequest(true);

        await expect(page.locator(SELECTORS.TITLE)).toBeEmpty();

        await haSwitchStateRequest(false);

        await expect(page.locator(SELECTORS.TITLE)).toHaveText('My Home', { useInnerText: true });

    });

    test('if the template returns a promise it should wait until it is resolved and show its result', async ({ page }) => {

        await fulfillJson(page, {
            title: `
                [[[
                    new Promise((resolve) => {
                        setTimeout(() => {
                            resolve('Promise title');
                        }, 100);
                    });
                ]]]
            `
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.TITLE)).toHaveText('Promise title', { useInnerText: true });

    });

});

test.describe('sidebar_editable template returns', () => {

    test('if it does not return true or false it should be ignored', async ({ page }) => {

        await fulfillJson(page, {
            sidebar_editable: '[[[ const array = [1, 2, 3]; return array.length; ]]]'
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.MENU)).not.toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

    });

    test('if it returns a promise it should be resolved and applied correctly', async ({ page }) => {

        await fulfillJson(page, {
            sidebar_editable: `
                [[[
                    const isEditable = async () => {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        return false;
                    };
                    return isEditable();
                ]]]
            `
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

    });

});

test.describe('name template returns', () => {

    test('if it returns undefined a empty string should be used', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'check',
                name: '[[[ return hello; ]]]',
                icon: 'mdi:bullseye-arrow',
                href: '/check'
            }]
        });

        page.on('console', message => {
            if (message.type() === 'warning') {
                expect(message.text()).toContain('ReferenceError: hello is not defined');
            }
        });

        await pageVisit(page);

        await expect(page.locator(TEXT_SELECTOR)).toBeEmpty();

    });

    test('if it returns an empty string it should be used', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'check',
                name: '[[[ return ""; ]]]',
                icon: 'mdi:bullseye-arrow',
                href: '/check'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(TEXT_SELECTOR)).toBeEmpty();

    });

    test('if it returns a number it should be used as string', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'check',
                name: '[[[ return 0; ]]]',
                icon: 'mdi:bullseye-arrow',
                href: '/check'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(TEXT_SELECTOR)).toHaveText('0');

    });

    test('if it returns a boolean it should be used as string', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'check',
                name: '[[[ return !0; ]]]',
                icon: 'mdi:bullseye-arrow',
                href: '/check'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(TEXT_SELECTOR)).toHaveText('true');

    });

    test('if it is updated and it returns an empty string it should be used', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'check',
                name: '[[[ states.input_boolean.my_switch.state === "off" ? "Check" : ""  ]]]',
                icon: 'mdi:bullseye-arrow',
                href: '/check'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(TEXT_SELECTOR)).toHaveText('Check', { useInnerText: true });

        await haSwitchStateRequest(true);

        await expect(page.locator(TEXT_SELECTOR)).toBeEmpty();

        await haSwitchStateRequest(false);

        await expect(page.locator(TEXT_SELECTOR)).toHaveText('Check', { useInnerText: true });

    });

    test('if it returns an object it should be stringified as JSON', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'check',
                name: '[[[ return { total: 2 }; ]]]',
                icon: 'mdi:bullseye-arrow',
                href: '/check'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(TEXT_SELECTOR)).toHaveText('{"total":2}');

    });

});

test.describe('notification template returns', () => {

    test('if it returns undefined and empty string should be used', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                href: '/check',
                notification: '[[[ return total; ]]]'
            }]
        });

        page.on('console', message => {
            if (message.type() === 'warning') {
                expect(message.text()).toContain('ReferenceError: total is not defined');
            }
        });

        await pageVisit(page);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toBeEmpty();
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toBeEmpty();

    });

    test('if it returns an empty string it should be used', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                href: '/check',
                notification: '[[[ return ""; ]]]'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toBeEmpty();
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toBeEmpty();

    });

    test('if a notification returns a number it should be used as string', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                href: '/check',
                notification: '[[[ return -5; ]]]'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('-5');
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('-5');

    });

    test('if it returns a boolean it should be used as a string', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                href: '/check',
                notification: '[[[ return !!"yes"; ]]]'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('true');
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('true');

    });

    test('if it is updated and it returns an empty string it should be used', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                href: '/check',
                notification: '[[[ const speed = states("input_select.fan_speed"); return +speed < 3 ? speed : ""  ]]]'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('1', { useInnerText: true });
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('1', { useInnerText: true });

        await haSelectStateRequest(2);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('2', { useInnerText: true });
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('2', { useInnerText: true });

        await haSelectStateRequest(3);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toBeEmpty();
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toBeEmpty();

        await haSelectStateRequest(1);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('1', { useInnerText: true });
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('1', { useInnerText: true });

    });

    test('if it returns a regexp it should be stringified as JSON', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                href: '/check',
                notification: '[[[ return new RegExp("/\\w+/"); ]]]'
            }]
        });

        await pageVisit(page);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('{}');
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('{}');

    });

    test('if it returns a promise it should be resolved and return its result', async ({ page }) => {

        await fulfillJson(page, {
            order: [{
                new_item: true,
                item: 'Check',
                icon: 'mdi:bullseye-arrow',
                href: '/check',
                notification: `
                    [[[
                        new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(10);
                            }, 200);
                        });
                    ]]]
                `
            }]
        });

        await pageVisit(page);

        await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('10');
        await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('10');

    });

});