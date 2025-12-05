import { test, expect } from 'playwright-test-coverage';
import { CONFIG_FILES } from './constants';
import { haConfigRequest } from './ha-services';
import {
    fulfillJson,
    navigateHome,
    noCacheRoute,
    waitForLogMessage,
    waitForLogMessages
} from './utilities';
import { getSidebarItem } from './selectors';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

test.beforeEach(noCacheRoute);

test.describe('methods in JavaScript templates', () => {

    const item = {
        new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow'
    };

    test('checkConfig should return a result', async ({ page }) => {

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'javascript',
                            code: `
                                checkConfig()
                                    .then((response) => {
                                        console.log('The result is: ' + response.result);
                                    })
                            `
                        }
                    }
                ]
            }
        );

        await navigateHome(page);

        getSidebarItem(page, '#').click();

        await waitForLogMessage(page, 'The result is: valid');

    });

    test('renderTemplate should return the result of a Jinja template', async ({ page }) => {

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'javascript',
                            code: `
                                renderTemplate('The time is: {{ now() }}')
                                    .then((response) => {
                                        console.log(response);
                                    })
                            `
                        }
                    }
                ]
            }
        );

        await navigateHome(page);

        getSidebarItem(page, '#').click();

        const logs = await waitForLogMessages(page);

        expect(logs).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/The time is: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:.*/)
            ])
        );

    });

    test('callService should execute the proper service', async ({ page }) => {

        const input = page.locator('ha-entity-toggle .mdc-switch__thumb input');

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'javascript',
                            code: `
                                callService(
                                    'input_boolean',
                                    'toggle',
                                    {
                                        entity_id: 'input_boolean.my_switch'
                                    }
                                );
                            `
                        }
                    }
                ]
            }
        );

        await navigateHome(page);

        expect(input).not.toBeChecked();

        await getSidebarItem(page, '#').click();

        await page.waitForTimeout(500);

        expect(input).toBeChecked();

        await getSidebarItem(page, '#').click();

        await page.waitForTimeout(500);

        expect(input).not.toBeChecked();

    });

    test('openAlertDialog should open an alert dialog', async ({ page }) => {

        const title = 'Alert title';
        const text = 'Alert text';
        const confirmText = 'Confirm text';
        const logText = 'Text logged';

        const dialog = page.locator('dialog-box ha-wa-dialog');
        const dialogTitle = dialog.locator('#dialog-box-title');
        const dialogDescription = dialog.locator('#dialog-box-description');
        const dialogButton = dialog.locator('ha-button');

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'javascript',
                            code: `
                                openAlertDialog({
                                    title: '${title}',
                                    text: '${text}',
                                    confirmText: '${confirmText}',
                                    confirm: () => {
                                        console.log('${logText}');
                                    }
                                })
                            `
                        }
                    }
                ]
            }
        );

        await navigateHome(page);

        await getSidebarItem(page, '#').click();

        await expect(dialogTitle).toHaveText(title);
        await expect(dialogDescription).toHaveText(text);
        await expect(dialogButton).toHaveText(confirmText);

        dialogButton.click();

        await waitForLogMessage(page, logText);

        await expect(dialogTitle).not.toBeVisible();

        await getSidebarItem(page, '#').click();

        await expect(dialogTitle).toHaveText(title);

        await dialogButton.click();
        await expect(dialog).not.toBeVisible();

    });

    test('openConfirmDialog should open a confirm dialog', async ({ page }) => {

        const title = 'Alert title';
        const text = 'Alert text';
        const confirmText = 'Confirm text';
        const dismissText = 'Dismiss text';
        const confirmLogText = 'Confirm text logged';
        const dismissLogText = 'Dismiss text logged';

        const dialog = page.locator('dialog-box ha-wa-dialog');
        const dialogTitle = dialog.locator('#dialog-box-title');
        const dialogDescription = dialog.locator('#dialog-box-description');
        const dialogFirstButton = dialog.locator('ha-button').first();
        const dialogLastButton = dialog.locator('ha-button').last();

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'javascript',
                            code: `
                                openConfirmDialog({
                                    title: '${title}',
                                    text: '${text}',
                                    confirmText: '${confirmText}',
                                    dismissText: '${dismissText}',
                                    confirm: () => {
                                        console.log('${confirmLogText}');
                                    },
                                    cancel: () => {
                                        console.log('${dismissLogText}');
                                    }
                                })
                            `
                        }
                    }
                ]
            }
        );

        await navigateHome(page);

        await getSidebarItem(page, '#').click();

        await expect(dialogTitle).toHaveText(title);
        await expect(dialogDescription).toHaveText(text);
        await expect(dialogFirstButton).toHaveText(dismissText);
        await expect(dialogLastButton).toHaveText(confirmText);

        dialogLastButton.click();

        await waitForLogMessage(page, confirmLogText);

        await expect(dialogTitle).not.toBeVisible();

        await getSidebarItem(page, '#').click();

        await expect(dialogTitle).toBeVisible();

        dialogFirstButton.click();

        await waitForLogMessage(page, dismissLogText);

    });

    test('openRestartDialog should open the restart Home Assistant dialog', async ({ page }) => {

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'javascript',
                            code: 'openRestartDialog()'
                        }
                    }
                ]
            }
        );

        await navigateHome(page);

        await getSidebarItem(page, '#').click();

        const dialog = page.locator('dialog-restart ha-dialog-header');
        const title = 'Restart Home Assistant';

        await expect(dialog.locator('span[slot="title"]')).toContainText(title);

        await dialog.locator('ha-icon-button').click();

        await expect(dialog).not.toBeVisible();

        // It should reuse the dialog already registered in customComponents
        await getSidebarItem(page, '#').click();

        await expect(dialog.locator('span[slot="title"]')).toContainText(title);

        await dialog.locator('ha-icon-button').click();

        await expect(dialog).not.toBeVisible();

    });

    test('openMoreInfoDialog should open the more info dialog of an entity', async ({ page }) => {

        await fulfillJson(
            page,
            {
                order: [
                    {
                        ...item,
                        on_click: {
                            action: 'javascript',
                            code: 'openMoreInfoDialog("input_boolean.my_switch")'
                        }
                    }
                ]
            }
        );

        await navigateHome(page);

        await getSidebarItem(page, '#').click();

        expect(page.locator('ha-more-info-dialog ha-dialog-header .title')).toContainText('My Switch');

    });

});