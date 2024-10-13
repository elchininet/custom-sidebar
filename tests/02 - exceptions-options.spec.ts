import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
    CONFIG_FILES,
    SIDEBAR_CLIP,
    ATTRIBUTES
} from './constants';
import { haConfigRequest, addJsonExtendedRoute } from './utilities';
import { SELECTORS } from './selectors';

test.beforeAll(async () => {
    await haConfigRequest(CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

const json = {
    extend_from_base: true,
    order: [
        {
            new_item: true,
            item: 'Check',
            icon: 'mdi:bullseye-arrow',
            href: '/check',
            order: 10
        }
    ]
};

test.describe('extending from the base', () => {

    test.describe('overriding options from the base', () => {

        test('should override an item from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                exceptions: [
                    {
                        user: 'Test',
                        extend_from_base: true,
                        order: [
                            {
                                item: 'developer tools',
                                bottom: true,
                                order: 9
                            }
                        ]
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('01-sidebar-exceptions-item-override.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should override a new_item from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                exceptions: [
                    {
                        user: 'Test',
                        extend_from_base: true,
                        order: [
                            {
                                new_item: true,
                                item: 'Google',
                                name: 'Search',
                                icon: 'mdi:web',
                                href: 'https://google.com',
                                order: -1
                            }
                        ]
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('02-sidebar-exceptions-new-item-override.png', {
                clip: SIDEBAR_CLIP
            });

            const google = page.locator(SELECTORS.SIDEBAR_ITEMS.GOOGLE);
            await expect(google).toHaveText('Search', { useInnerText: true });
            await expect(google).toHaveAttribute('href', 'https://google.com');
            await expect(google).not.toHaveAttribute('target', '_blank');

            const googleIcon = page.locator(`${SELECTORS.SIDEBAR_ITEMS.GOOGLE} ha-icon[icon="mdi:web"]`);
            expect(googleIcon).toBeVisible();

        });

        test('should override the title option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        title: 'Exception Title',
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('03-sidebar-exceptions-title-override.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should override the style option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                styles: `
                    .item-text {
                        color: blue !important;
                    }
                `,
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        styles: `
                            .item-text {
                                color: red !important;
                            }
                        `,
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('04-sidebar-exceptions-style-override.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should override the sidebar_editable option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                sidebar_editable: true,
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        sidebar_editable: false,
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
            await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

            await page.goto('/profile');

            await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).toHaveAttribute(ATTRIBUTES.DISABLED);

        });

    });

    test.describe('extending options from the base', () => {

        test('should take the style option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                styles: `
                    .item-text {
                        color: blue !important;
                    }
                `,
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('05-sidebar-exceptions-extend-style-from-base.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should take the sidebar_editable option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                sidebar_editable: false,
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
            await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

            await page.goto('/profile');

            await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).toHaveAttribute(ATTRIBUTES.DISABLED);

        });

    });

});

test.describe('without extending from the base', () => {

    test('should have only the items in the exception', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: 'Test',
                    order: [
                        ...json.order,
                        {
                            item: 'dev',
                            bottom: true
                        },
                        {
                            item: 'config',
                            match: 'data-panel',
                            bottom: true
                        }
                    ],
                    extend_from_base: false
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('06-sidebar-exceptions-few-changes.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should take the title option from the exception', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: 'Test',
                    order: json.order,
                    title: 'Exception Title'
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('07-sidebar-exceptions-title-from-exception.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should take the style from the exception', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            styles: `
                .item-text {
                    color: blue !important;
                }
            `,
            exceptions: [
                {
                    user: 'Test',
                    order: json.order,
                    styles: `
                        .item-text {
                            color: red !important;
                        }
                    `
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('08-sidebar-exceptions-style-from-exception.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should not have a style option', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            styles: `
                .item-text {
                    color: blue !important;
                }
            `,
            exceptions: [
                {
                    user: 'Test',
                    order: json.order
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('09-sidebar-exceptions-no-style.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should take sidebar_editable from the exception', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            sidebar_editable: true,
            exceptions: [
                {
                    user: 'Test',
                    order: json.order,
                    sidebar_editable: false
                }
            ]
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

        await page.goto('/profile');

        await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).toHaveAttribute(ATTRIBUTES.DISABLED);

    });

    test('should not have a sidebar_editable option', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            sidebar_editable: false,
            exceptions: [
                {
                    user: 'Test',
                    order: json.order
                }
            ]
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.MENU)).not.toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

        await page.goto('/profile');

        await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

    });

    test('if no options there should be no changes', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: 'Test'
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('10-sidebar-exceptions-no-options-default-sidebar.png', {
            clip: SIDEBAR_CLIP
        });

    });

});

test.describe('user and device matchers', () => {

    test('should match a user using the user option', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: 'Test',
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('11-sidebar-exceptions-match-success.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('shuld match a user if it is included in the user option as an array', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: ['ElChiniNet', 'Test', 'Palaus'],
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('11-sidebar-exceptions-match-success.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should match a user if it is not equal to the not_user option', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    not_user: 'ElChiniNet',
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('11-sidebar-exceptions-match-success.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should match an user if it is not included in the not_user option as an array', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    not_user: ['ElChiniNet', 'Palaus'],
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('11-sidebar-exceptions-match-success.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should match a device using the device option', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    device: 'Chrome',
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('11-sidebar-exceptions-match-success.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should match a device if it is included in the device option as an array', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    device: ['Android', 'Chrome', 'iPad'],
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('11-sidebar-exceptions-match-success.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should match a device if it is not equal to the not_device option', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    not_device: 'iPad',
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('11-sidebar-exceptions-match-success.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should match a device if it is not included in the not_device option as an array', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    not_device: ['iPad', 'Android'],
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('11-sidebar-exceptions-match-success.png', {
            clip: SIDEBAR_CLIP
        });

    });

});

test.describe('exceptions that do not match', async () => {

    test('title option should be taken from the base', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: 'ElChiniNet',
                    order: json.order,
                    title: 'Exception Title',
                    extend_from_base: true
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('12-sidebar-exceptions-no-match-title-from-base.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('style option should be take from the base', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            styles: `
                .item-text {
                    color: blue !important;
                }
            `,
            exceptions: [
                {
                    user: 'ElChiniNet',
                    order: json.order,
                    extend_from_base: true,
                    styles: `
                        .item-text {
                            color: red !important;
                        }
                    `
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('13-sidebar-exceptions-no-match-style-from-base.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('sidebar_editable option should be taken from the base', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            sidebar_editable: true,
            exceptions: [
                {
                    user: 'ElChiniNet',
                    order: json.order,
                    sidebar_editable: false,
                    extend_from_base: true
                }
            ]
        });

        await pageVisit(page);

        await expect(page.locator(SELECTORS.MENU)).not.toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

        await page.goto('/profile');

        await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

    });

    test('no options everything from base is taken', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: 'ElChiniNet'
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('14-sidebar-exceptions-no-match-everything-from-base.png', {
            clip: SIDEBAR_CLIP
        });

    });

});