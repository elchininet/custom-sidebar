import { test, expect } from 'playwright-test-coverage';
import { SELECTORS } from './constants';

const ERROR_PREFIX = 'custom-sidebar:';

test('JSON not found', async ({ page }) => {

    await page.route('local/sidebar-config.json*', async route => {
        await route.fulfill({
            status: 404,
            contentType: 'text/plain',
            body: 'Not Found!'
        });
    });

    page.on('pageerror', error => {
        expect(error.message).toBe(`${ERROR_PREFIX} JSON config file not found.\nMake sure you have valid config in /config/www/sidebar-order.json file.`);
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();

});

test('JSON server error', async ({ page }) => {

    await page.route('local/sidebar-config.json*', async route => {
        await route.fulfill({
            status: 500,
            contentType: 'text/plain',
            body: 'Server error!'
        });
    });

    page.on('pageerror', error => {
        expect(error.message).toBe(`${ERROR_PREFIX} JSON config file not found.\nMake sure you have valid config in /config/www/sidebar-order.json file.`);
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();

});

test('JSON malformed', async ({ page }) => {

    await page.route('local/sidebar-config.json*', async route => {
        await route.fulfill({ body: 'html' });
    });

    page.on('pageerror', error => {
        expect(error.message).toBe(`${ERROR_PREFIX} Unexpected token \'h\', "html" is not valid JSON`);
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();

});

test('JSON id warning', async ({ page }) => {

    await page.route('local/sidebar-config.json*', async route => {
        const json = { title: 'Custom Title', order: [], id: 'example_json'};
        await route.fulfill({ json });
    });

    page.on('console', message => {
        if (message.type() === 'warning') {
            expect(message.text()).toBe(`${ERROR_PREFIX} You seem to be using the example configuration.\nMake sure you have valid config in /config/www/sidebar-order.json file.`);
        }
    });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();

});