import { test, expect } from 'playwright-test-coverage';
import { SELECTORS } from './selectors';

const ERROR_PREFIX = 'custom-sidebar:';

test('JSON not found', async ({ page }) => {

    const errors: string[] = [];

    await page.route('local/sidebar-config.json*', async route => {
        await route.fulfill({
            status: 404,
            contentType: 'text/plain',
            body: 'Not Found!'
        });
    });

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    expect(errors).toEqual(
        expect.arrayContaining([
            `${ERROR_PREFIX} JSON config file not found.\nMake sure you have valid config in /config/www/sidebar-order.json file.`
        ])
    );

});

test('JSON server error', async ({ page }) => {

    const errors: string[] = [];

    await page.route('local/sidebar-config.json*', async route => {
        await route.fulfill({
            status: 500,
            contentType: 'text/plain',
            body: 'Server error!'
        });
    });

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    expect(errors).toEqual(
        expect.arrayContaining([
            `${ERROR_PREFIX} JSON config file not found.\nMake sure you have valid config in /config/www/sidebar-order.json file.`
        ])
    );

});

test('JSON malformed', async ({ page }) => {

    const errors: string[] = [];

    await page.route('local/sidebar-config.json*', async route => {
        await route.fulfill({ body: 'html' });
    });

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    expect(errors).toEqual(
        expect.arrayContaining([
            `${ERROR_PREFIX} Unexpected token 'h', "html" is not valid JSON`
        ])
    );

});

test('JSON id warning', async ({ page }) => {

    const warnings: string[] = [];

    await page.route('local/sidebar-config.json*', async route => {
        const json = { title: 'Custom Title', order: [], id: 'example_json'};
        await route.fulfill({ json });
    });

    page.on('console', message => {
        if (message.type() === 'warning') {
            warnings.push(message.text());
        }
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    expect(warnings).toEqual(
        expect.arrayContaining([
            `${ERROR_PREFIX} You seem to be using the example configuration.\nMake sure you have valid config in /config/www/sidebar-order.json file.`
        ])
    );

});