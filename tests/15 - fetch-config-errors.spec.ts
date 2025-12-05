import { test } from 'playwright-test-coverage';
import {
    noCacheRoute,
    waithForError,
    waitForWarning
} from './utilities';

const ERROR_PREFIX = 'custom-sidebar:';

test.beforeEach(noCacheRoute);

test('if the configuration is not found it should throw an error', async ({ page }) => {

    await page.route('local/sidebar-config.json*', async route => {
        await route.fulfill({
            status: 404,
            contentType: 'text/plain',
            body: 'Not Found!'
        });
    });

    await page.goto('/');

    await waithForError(page, `${ERROR_PREFIX} JSON config file not found.\nMake sure you have valid config in /config/www/sidebar-config.json file.`);

});

test('if there is an error loading the configuration it should be thrown', async ({ page }) => {

    await page.route('local/sidebar-config.json*', async route => {
        await route.fulfill({
            status: 500,
            contentType: 'text/plain',
            body: 'Server error!'
        });
    });

    await page.goto('/');

    await waithForError(page, `${ERROR_PREFIX} JSON config file not found.\nMake sure you have valid config in /config/www/sidebar-config.json file.`);

});

test('if the configuration is malformed it should throw an error', async ({ page }) => {

    await page.route('local/sidebar-config.json*', async route => {
        await route.fulfill({ body: 'html' });
    });

    await page.goto('/');

    await waithForError(page, `${ERROR_PREFIX} Unexpected token 'h', "html" is not valid JSON`);

});

test('if the id is in the configuration it should throw a warning', async ({ page }) => {

    await page.route('local/sidebar-config.json*', async route => {
        const json = { title: 'Custom Title', order: [], id: 'example_json'};
        await route.fulfill({ json });
    });

    await page.goto('/');

    await waitForWarning(page, `${ERROR_PREFIX} You seem to be using the example configuration.\nMake sure you have valid config in /config/www/sidebar-config.json file.`);

});