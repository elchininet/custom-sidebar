import { test, expect } from 'playwright-test-coverage';
import { SELECTORS } from './constants';

const ERROR_PREFIX = 'custom-sidebar:';

test('if the configuration is not found it should throw an error', async ({ page }) => {

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
            `${ERROR_PREFIX} JSON config file not found.\nMake sure you have valid config in /config/www/sidebar-config.json file.`
        ])
    );

});

test('if there is an error loading the configuration it should be thrown', async ({ page }) => {

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
            `${ERROR_PREFIX} JSON config file not found.\nMake sure you have valid config in /config/www/sidebar-config.json file.`
        ])
    );

});

test('if the configuration is malformed it should throw an error', async ({ page }) => {

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

test('if the id is in the configuration it should throw a warning', async ({ page }) => {

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
            `${ERROR_PREFIX} You seem to be using the example configuration.\nMake sure you have valid config in /config/www/sidebar-config.json file.`
        ])
    );

});