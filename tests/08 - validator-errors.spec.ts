import { test, expect } from 'playwright-test-coverage';
import { SELECTORS } from './constants';
import { fulfillJson } from './utilities';

const ERROR_PREFIX = 'custom-sidebar: Invalid configuration';

test('Validation: no order parameter', async ({ page }) => {

    const errors: string[] = [];

    await fulfillJson(page, {
        title: 'Custom Title'
    });

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    expect(errors).toEqual(
        expect.arrayContaining([
            `${ERROR_PREFIX}, "order" parameter is required`
        ])
    );

});

test('Validation: order parameter should be an array', async ({ page }) => {

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
            `${ERROR_PREFIX}, "order" parameter should be an array`
        ])
    );

});

test('Validation: every item in order should have an "item" property', async ({ page }) => {

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

test('Validation: "item" property should be an string', async ({ page }) => {

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
            `${ERROR_PREFIX} in dev, item property should be an string`
        ])
    );

});

test('Validation: missing "href" in new item', async ({ page }) => {

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

test('Validation: "href" in new item should be a string', async ({ page }) => {

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

test('Validation: missing "icon" in new item', async ({ page }) => {

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

test('Validation: "icon" in new item should be a string', async ({ page }) => {

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

test('Validation: "exceptions" should be an array', async ({ page }) => {

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

test('Validation: "exceptions" without "order"', async ({ page }) => {

    const errors: string[] = [];

    await fulfillJson(page, {
        order: [],
        exceptions: [
            {
                base_order: false
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
            `${ERROR_PREFIX}, every item in "exceptions" array should have an "order" property`
        ])
    );

});

test('Validation: "exceptions" with malformed "user"', async ({ page }) => {

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

test('Validation: "exceptions" with malformed "not_user"', async ({ page }) => {

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

test('Validation: "exceptions" with malformed "device"', async ({ page }) => {

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

test('Validation: "exceptions" with malformed "not_device"', async ({ page }) => {

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

test('Validation: "exceptions" with "user" and "no_user"', async ({ page }) => {

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

test('Validation: "exceptions" with "device" and "not_device"', async ({ page }) => {

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

test('Validation: "exceptions" with invalid "order"', async ({ page }) => {

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