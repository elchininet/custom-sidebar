import { test, expect } from 'playwright-test-coverage';
import { CONFIG_FILES, SELECTORS } from './constants';
import { haConfigRequest } from './ha-services';
import { fulfillJson } from './utilities';
import { getSidebarItem } from './selectors';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

test.describe('methods in JavaScript templates', () => {

    const item = {
        new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow'
    };

    test('checkConfig should return a result', async ({ page }) => {

        const logs: string[] = [];

        page.on('console', message => {
            logs.push(message.text());
        });

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

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '#').click();

        await page.waitForTimeout(500);

        expect(logs).toEqual(
            expect.arrayContaining(['The result is: valid'])
        );

        page.removeAllListeners();

    });

    test('renderTemplate should return the result of a Jinja template', async ({ page }) => {

        const logs: string[] = [];

        page.on('console', message => {
            logs.push(message.text());
        });

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

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '#').click();

        await page.waitForTimeout(500);

        expect(logs).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/The time is: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:.*/)
            ])
        );

        page.removeAllListeners();

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

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

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

        const dialog = page.locator('dialog-box ha-md-dialog');

        const logs: string[] = [];

        page.on('console', message => {
            logs.push(message.text());
        });

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

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '#').click();

        await expect(dialog.locator('#dialog-box-title')).toHaveText(title);
        await expect(dialog.locator('#dialog-box-description')).toHaveText(text);
        await expect(dialog.locator('ha-button')).toHaveText(confirmText);

        await dialog.locator('ha-button').click();

        await expect(dialog.locator('#dialog-box-title')).not.toBeVisible();

        await page.waitForTimeout(500);

        expect(logs).toEqual(
            expect.arrayContaining([logText])
        );

        // Should get the custom elements from the customElements registry
        await getSidebarItem(page, '#').click();

        await expect(dialog.locator('#dialog-box-title')).toHaveText(title);

        await dialog.locator('ha-button').click();
        await expect(dialog).not.toBeVisible();

        page.removeAllListeners();

    });

    test('openConfirmDialog should open a confirm dialog', async ({ page }) => {

        const title = 'Alert title';
        const text = 'Alert text';
        const confirmText = 'Confirm text';
        const dismissText = 'Dismiss text';
        const confirmLogText = 'Confirm text logged';
        const dismissLogText = 'Dismiss text logged';

        const dialog = page.locator('dialog-box ha-md-dialog');

        const logs: string[] = [];

        page.on('console', message => {
            logs.push(message.text());
        });

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

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '#').click();

        await expect(dialog.locator('#dialog-box-title')).toHaveText(title);
        await expect(dialog.locator('#dialog-box-description')).toHaveText(text);
        await expect(dialog.locator('ha-button').first()).toHaveText(dismissText);
        await expect(dialog.locator('ha-button').last()).toHaveText(confirmText);

        await dialog.locator('ha-button').last().click();

        await expect(dialog.locator('#dialog-box-title')).not.toBeVisible();

        await page.waitForTimeout(500);

        expect(logs).toEqual(
            expect.arrayContaining([confirmLogText])
        );

        expect(logs).toEqual(
            expect.not.arrayContaining([dismissLogText])
        );

        await getSidebarItem(page, '#').click();

        await expect(dialog.locator('#dialog-box-title')).toBeVisible();

        await dialog.locator('ha-button').first().click();

        expect(logs).toEqual(
            expect.arrayContaining([
                confirmLogText,
                dismissLogText
            ])
        );

        page.removeAllListeners();

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

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

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

        await page.goto('/');

        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

        await getSidebarItem(page, '#').click();

        expect(page.locator('ha-more-info-dialog ha-dialog-header .title')).toContainText('My Switch');

    });

});