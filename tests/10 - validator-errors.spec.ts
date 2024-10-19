import { test, expect } from 'playwright-test-coverage';
import { SidebarMode } from '../src/types';
import { fulfillJson } from './utilities';
import { SELECTORS } from './selectors';

const ERROR_PREFIX = 'custom-sidebar: Invalid configuration';

test.describe('main options', () => {

    test('should throw an error if it has a malformed title option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            title: ['Custom Title'],
            order: {}
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, "title" property should be a string`
            ])
        );

    });

    test('should throw an error if it has an invalid "sidebar_editable" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            sidebar_editable: { editable: true }
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, "sidebar_editable" property should be a boolean or a template string`
            ])
        );

    });

    test('should throw an error if it has wrong sidebar_mode option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: {},
            sidebar_mode: 'non_valid'
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, "sidebar_mode" property should be ${SidebarMode.HIDDEN}, ${SidebarMode.NARROW} or ${SidebarMode.EXTENDED}`
            ])
        );

    });

    test('should throw an error if it has a malformed styles option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: {},
            styles: {
                body: {
                    color: 'red'
                }
            }
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, "styles" property should be a string`
            ])
        );

    });

    test('should throw an error if the order property is not an array', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: {}
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, "order" property should be an array`
            ])
        );

    });

});

test.describe('order item property', () => {

    test('should throw an error if any item in the order option doesn\'t have an "item" property', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [
                {
                    item: 'config'
                },
                {
                    name: 'dev'
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, every item in an "order" array should have an "item" property`
            ])
        );

    });

    test('should throw an error if the "item" property is not a string', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [
                {
                    item: 'config'
                },
                {
                    item: ['dev']
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX} in dev, "item" property should be a string`
            ])
        );

    });

    test('should throw an error if a new item doesn\'t have an "href" property', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [
                {
                    item: 'config'
                },
                {
                    item: 'dev',
                    new_item: true
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX} in dev, if you set "new_item" as "true", "href" property is necessary`
            ])
        );

    });

    test('should throw an error if the "href" property in a new item is not a string', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [
                {
                    item: 'config'
                },
                {
                    item: 'dev',
                    new_item: true,
                    href: []
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX} in dev, "href" property should be a string`
            ])
        );

    });

    test('should throw an error if a new item doesn\'t have an "icon" property', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [
                {
                    item: 'config'
                },
                {
                    item: 'dev',
                    new_item: true,
                    href: '/dev'
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX} in dev, if you set "new_item" as "true", "icon" property is necessary`
            ])
        );

    });

    test('should throw an error if the "icon" property of a new icon is not a string', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [
                {
                    item: 'config'
                },
                {
                    item: 'dev',
                    new_item: true,
                    href: '/dev',
                    icon: 5
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX} in dev, "icon" property should be a string`
            ])
        );

    });

});

test.describe('exceptions', () => {

    test('should throw an error if "exceptions" is not an array', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: {}
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions should be an array`
            ])
        );

    });

    test('should throw an error if it has a malformed "order" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    order: 100,
                    extend_from_base: false
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "order" property should be an array`
            ])
        );

    });

    test('should throw an error if it has an invalid "title" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    title: ['Invalid title']
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "title" property should be a string`
            ])
        );

    });

    test('should throw an error if it has an invalid "sidebar_mode" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    sidebar_mode: 'non-valid'
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "sidebar_mode" property should be ${SidebarMode.HIDDEN}, ${SidebarMode.NARROW} or ${SidebarMode.EXTENDED}`
            ])
        );

    });

    test('should throw an error if it has an invalid "sidebar_editable" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    sidebar_editable: NaN
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "sidebar_editable" property should be a boolean or a template string`
            ])
        );

    });

    test('should throw an error if it has an invalid "styles" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    styles: { body: 'display: none' }
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "styles" property should be a string`
            ])
        );

    });

    test('should throw an error if it has a malformed "user" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    order: [],
                    user: {}
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "user" property should be a string or an array of strings`
            ])
        );

    });

    test('should throw an error if it has a malformed "not_user" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    order: [],
                    not_user: {}
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "not_user" property should be a string or an array of strings`
            ])
        );

    });

    test('should throw an error if it has a malformed "device" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    order: [],
                    device: 5
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "device" property should be a string or an array of strings`
            ])
        );

    });

    test('should throw an error if it has a malformed "not_device" option', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    order: [],
                    not_device: NaN
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "not_device" property should be a string or an array of strings`
            ])
        );

    });

    test('should throw an error if it has "user" and "no_user" parameters at the same time', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    order: [],
                    user: 'ElChiniNet',
                    not_user: 'Palaus'
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "user" and "not_user" properties cannot be used together`
            ])
        );

    });

    test('should throw an error if it has "device" and "not_device" parameters at the same time', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    order: [],
                    device: ['iPhone'],
                    not_device: ['Android']
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, exceptions "device" and "not_device" properties cannot be used together`
            ])
        );

    });

    test('should throw an error if it not every item in "order" property has an "item" property', async ({ page }) => {

        const errors: string[] = [];

        await fulfillJson(page, {
            order: [],
            exceptions: [
                {
                    order: [
                        {
                            item: 'config'
                        },
                        {
                            name: 'dev'
                        }
                    ],
                    user: 'ElChiniNet'
                }
            ]
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('/');
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        expect(errors).toEqual(
            expect.arrayContaining([
                `${ERROR_PREFIX}, every item in an "order" array should have an "item" property`
            ])
        );

    });

});