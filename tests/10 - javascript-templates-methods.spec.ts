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

    test.describe('methods to format date and time', () => {

        [
            // formatDate
            {
                title: 'formatDate should return a formatted date from a string',
                code: 'formatDate("2025-12-01")',
                expected: 'December 1, 2025'
            },
            {
                title: 'formatDate should return a formatted date form a date',
                code: 'formatDate(new Date("2025-12-02"))',
                expected: 'December 2, 2025'
            },
            // formatDateTime
            {
                title: 'formatDateTime should return a formatted date with time form a string',
                code: 'formatDateTime("2025-12-01T15:35")',
                expected: 'December 1, 2025 at 3:35 PM'
            },
            {
                title: 'formatDateTime should return a formatted date with time form a date',
                code: 'formatDateTime(new Date("2025-12-02T18:45"))',
                expected: 'December 2, 2025 at 6:45 PM'
            },
            // formatTime
            {
                title: 'formatTime should return a formatted time form a time string',
                code: 'formatTime("01:05")',
                expected: '1:05 AM'
            },
            {
                title: 'formatTime should return a formatted time form a date string',
                code: 'formatTime("2025-12-01T13:27")',
                expected: '1:27 PM'
            },
            {
                title: 'formatTime should return a formatted time form a date',
                code: 'formatTime(new Date("2025-12-01T23:55"))',
                expected: '11:55 PM'
            },
            // getRelativeTime in the past
            {
                title: 'getRelativeTime should return a relative time in years from a string',
                code: 'getRelativeTime("2024-12-01")',
                expected: 'last year'
            },
            {
                title: 'getRelativeTime should return a relative time in months from a string',
                code: 'getRelativeTime("2025-10-01")',
                expected: '2 months ago'
            },
            {
                title: 'getRelativeTime should return a relative time in weeks from a string',
                code: 'getRelativeTime("2025-11-25")',
                expected: 'last week'
            },
            {
                title: 'getRelativeTime should return a relative time in days from a string',
                code: 'getRelativeTime("2025-11-29")',
                expected: '2 days ago'
            },
            {
                title: 'getRelativeTime should return a relative time in hours from a string',
                code: 'getRelativeTime("2025-11-30T23:00")',
                expected: '1 hour ago'
            },
            {
                title: 'getRelativeTime should return a relative time in minutes from a string',
                code: 'getRelativeTime("2025-11-30T23:55")',
                expected: '5 minutes ago'
            },
            {
                title: 'getRelativeTime should return a relative time in seconds from a string',
                code: 'getRelativeTime("2025-11-30T23:59:30")',
                expected: '30 seconds ago'
            },
            // getRelativeTime in the future
            {
                title: 'getRelativeTime should return a relative time in years from a date',
                code: 'getRelativeTime(new Date("2026-12-01"))',
                expected: 'next year'
            },
            {
                title: 'getRelativeTime should return a relative time in years from a date and capitalized',
                code: 'getRelativeTime(new Date("2026-12-01"), true)',
                expected: 'Next year'
            },
            {
                title: 'getRelativeTime should return a relative time in months from a date',
                code: 'getRelativeTime(new Date("2026-02-01"))',
                expected: 'in 2 months'
            },
            {
                title: 'getRelativeTime should return a relative time in months from a date and capitalized',
                code: 'getRelativeTime(new Date("2026-02-01"), true)',
                expected: 'In 2 months'
            },
            {
                title: 'getRelativeTime should return a relative time in weeks from a date',
                code: 'getRelativeTime(new Date("2025-12-14"))',
                expected: 'in 2 weeks'
            },
            {
                title: 'getRelativeTime should return a relative time in days from a date',
                code: 'getRelativeTime(new Date("2025-12-04"))',
                expected: 'in 3 days'
            },
            {
                title: 'getRelativeTime should return a relative time in hours from a date',
                code: 'getRelativeTime(new Date("2025-12-01T05:00"))',
                expected: 'in 5 hours'
            },
            {
                title: 'getRelativeTime should return a relative time in hours from a date and capitalized',
                code: 'getRelativeTime(new Date("2025-12-01T05:00"), true)',
                expected: 'In 5 hours'
            },
            {
                title: 'getRelativeTime should return a relative time in minutes from a date',
                code: 'getRelativeTime(new Date("2025-12-01T00:03"))',
                expected: 'in 3 minutes'
            },
            {
                title: 'getRelativeTime should return a relative time in seconds from a date',
                code: 'getRelativeTime(new Date("2025-12-01T00:00:30"))',
                expected: 'in 30 seconds'
            }
        ].forEach(({ title, code, expected }): void => {

            test(title, async ({ page }) => {

                await page.clock.setFixedTime(new Date('2025-12-01T00:00'));

                await fulfillJson(
                    page,
                    {
                        order: [
                            {
                                ...item,
                                on_click: {
                                    action: 'javascript',
                                    code: `
                                        console.log(
                                            "===> " + ${code}
                                        );
                                    `
                                }
                            }
                        ]
                    }
                );

                await navigateHome(page);

                getSidebarItem(page, '#').click();

                await waitForLogMessage(page, `===> ${expected}`);

            });

        });

    });

});