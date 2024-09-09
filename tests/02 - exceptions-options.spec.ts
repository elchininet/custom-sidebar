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

test('Exceptions item override', async ({ page }) => {

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

    await expect(page).toHaveScreenshot('01-sidebar-exceptions-override.png', {
        clip: SIDEBAR_CLIP
    });

});

test('Exceptions new_item override', async ({ page }) => {

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

test.describe('Exceptions matchers', async () => {

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

    test('Exceptions user', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: 'Test',
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('03-sidebar-exceptions-check-item.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions user as array', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: ['ElChiniNet', 'Test', 'Palaus'],
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('03-sidebar-exceptions-check-item.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions not_user', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    not_user: 'ElChiniNet',
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('03-sidebar-exceptions-check-item.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions not_user as an array', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    not_user: ['ElChiniNet', 'Palaus'],
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('03-sidebar-exceptions-check-item.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions device', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    device: 'Chrome',
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('03-sidebar-exceptions-check-item.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions device as an array', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    device: ['Android', 'Chrome', 'iPad'],
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('03-sidebar-exceptions-check-item.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions not_device', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    not_device: 'iPad',
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('03-sidebar-exceptions-check-item.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions not_device as an array', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    not_device: ['iPad', 'Android'],
                    ...json
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('03-sidebar-exceptions-check-item.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions do not extend', async ({ page }) => {

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

        await expect(page).toHaveScreenshot('04-sidebar-exceptions-check-on-top.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions do not extend, title should be taken from the exception', async ({ page }) => {

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

        await expect(page).toHaveScreenshot('05-sidebar-exceptions-not-extend-title.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions with extend, title should be taken from the exception', async ({ page }) => {

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

        await expect(page).toHaveScreenshot('06-sidebar-exceptions-extend-title.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions with extend not matching, title should be taken from the base', async ({ page }) => {

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

        await expect(page).toHaveScreenshot('07-sidebar-exceptions-extend-title-from-base.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions do not extend, style should be taken from the exception', async ({ page }) => {

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

        await expect(page).toHaveScreenshot('08-sidebar-exceptions-not-extend-style.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions do not extend, style should not be taken from the base', async ({ page }) => {

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

        await expect(page).toHaveScreenshot('09-sidebar-exceptions-not-extend-style.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions extend, style should be taken from the exception', async ({ page }) => {

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

        await expect(page).toHaveScreenshot('10-sidebar-exceptions-extend-style.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions extend, style should be taken from the base', async ({ page }) => {

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

        await expect(page).toHaveScreenshot('11-sidebar-exceptions-extend-style-from-base.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions with extend not matching, style should be taken from the base', async ({ page }) => {

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

        await expect(page).toHaveScreenshot('12-sidebar-exceptions-extend-style-from-base.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions do not extend, sidebar_editable should be taken from the exception', async ({ page }) => {

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

    test('Exceptions do not extend, sidebar_editable should not be taken from the base', async ({ page }) => {

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

    test('Exceptions extend, sidebar_editable should be taken from the exception', async ({ page }) => {

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

    test('Exceptions extend, sidebar_editable should be taken from the base', async ({ page }) => {

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

    test('Exceptions with extend not matching, sidebar_editable should be taken from the base', async ({ page }) => {

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

    test('Exceptions without extend and without options', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: 'Test'
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('13-sidebar-exceptions-no-extend-no-options.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('Exceptions without extend and no match without options', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            exceptions: [
                {
                    user: 'ElChiniNet'
                }
            ]
        });

        await pageVisit(page);

        await expect(page).toHaveScreenshot('14-sidebar-exceptions-not-extend-no-options.png', {
            clip: SIDEBAR_CLIP
        });

    });

});