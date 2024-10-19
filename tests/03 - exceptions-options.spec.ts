import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
    CONFIG_FILES,
    SIDEBAR_CLIP,
    SIDEBAR_NARROW_CLIP,
    ATTRIBUTES
} from './constants';
import {
    haConfigRequest,
    addJsonExtendedRoute,
    changeToMobileViewport
} from './utilities';
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

        test('should override the sidebar_mode option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                sidebar_mode: 'hidden',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        sidebar_mode: 'narrow',
                        extend_from_base: true
                    }
                ]
            });

            await changeToMobileViewport(page);

            await pageVisit(page);

            await expect(page).toHaveScreenshot('04-sidebar-exceptions-sidebar-mode-override.png', {
                clip: SIDEBAR_NARROW_CLIP
            });

        });

        test('should override the icon_color option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                icon_color: 'blue',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        icon_color: 'red',
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('05-sidebar-exceptions-sidebar-icon-color-override.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should override the icon_color_selected option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                icon_color_selected: 'blue',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        icon_color_selected: 'red',
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('06-sidebar-exceptions-sidebar-icon-color-selected-override.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should override the text_color option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                text_color: 'blue',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        text_color: 'red',
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('07-sidebar-exceptions-sidebar-text-color-override.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should override the text_color_selected option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                text_color_selected: 'blue',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        text_color_selected: 'red',
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('08-sidebar-exceptions-sidebar-text-color-selected-override.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should override the selection_color option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                selection_color: 'blue',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        selection_color: 'red',
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('09-sidebar-exceptions-sidebar-selection-color-override.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should override the info_color option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                info_color: 'blue',
                exceptions: [
                    {
                        user: 'Test',
                        order: [
                            {
                                item: 'overview',
                                info: 'Some info',
                                order: 0
                            },
                            {
                                ...json.order[0],
                                info: 'Some info'
                            }
                        ],
                        info_color: 'red',
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('10-sidebar-exceptions-sidebar-info-color-override.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should override the info_color_selected option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                info_color_selected: 'blue',
                exceptions: [
                    {
                        user: 'Test',
                        order: [
                            {
                                item: 'overview',
                                info: 'Some info',
                                order: 0
                            },
                            {
                                ...json.order[0],
                                info: 'Some info'
                            }
                        ],
                        info_color_selected: 'red',
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('11-sidebar-exceptions-sidebar-info-color-selected-override.png', {
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

            await expect(page).toHaveScreenshot('12-sidebar-exceptions-style-override.png', {
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

        test('if there is no order in the base it should take only the order from the exceptions', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                order: undefined,
                exceptions: [
                    {
                        user: 'Test',
                        extend_from_base: true,
                        order: json.order
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('13-sidebar-exceptions-no-order-from-base.png', {
                clip: SIDEBAR_CLIP
            });

        });

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

            await expect(page).toHaveScreenshot('14-sidebar-exceptions-extend-style-from-base.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should take the sidebar_mode option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                sidebar_mode: 'narrow',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        extend_from_base: true
                    }
                ]
            });

            await changeToMobileViewport(page);

            await pageVisit(page);

            await expect(page).toHaveScreenshot('15-sidebar-exceptions-extend-sidebar-mode-from-base.png', {
                clip: SIDEBAR_NARROW_CLIP
            });

        });

        test('should take the icon_color option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                icon_color: 'green',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('16-sidebar-exceptions-extend-icon-color-from-base.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should take the icon_color_selected option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                icon_color_selected: 'red',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('17-sidebar-exceptions-extend-icon-color-selected-from-base.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should take the text_color option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                text_color: 'green',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('18-sidebar-exceptions-extend-text-color-from-base.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should take the text_color_selected option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                text_color_selected: 'red',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('19-sidebar-exceptions-extend-text-color-selected-from-base.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should take the selection_color option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                selection_color: 'red',
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('20-sidebar-exceptions-extend-selection-color-from-base.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should take the info_color option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                info_color: 'red',
                exceptions: [
                    {
                        user: 'Test',
                        order: [
                            {
                                item: 'overview',
                                info: 'Some info',
                                order: 0
                            },
                            {
                                ...json.order[0],
                                info: 'Some info'
                            }
                        ],
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('21-sidebar-exceptions-extend-info-color-from-base.png', {
                clip: SIDEBAR_CLIP
            });

        });

        test('should take the info_color_selected option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                info_color_selected: 'red',
                exceptions: [
                    {
                        user: 'Test',
                        order: [
                            {
                                item: 'overview',
                                info: 'Some info',
                                order: 0
                            },
                            {
                                ...json.order[0],
                                info: 'Some info'
                            }
                        ],
                        extend_from_base: true
                    }
                ]
            });

            await pageVisit(page);

            await expect(page).toHaveScreenshot('22-sidebar-exceptions-extend-info-color-selected-from-base.png', {
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

        await expect(page).toHaveScreenshot('23-sidebar-exceptions-few-changes.png', {
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

        await expect(page).toHaveScreenshot('24-sidebar-exceptions-title-from-exception.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('should take the sidebar_mode option from the exception', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            sidebar_mode: 'hidden',
            exceptions: [
                {
                    user: 'Test',
                    order: json.order,
                    sidebar_mode: 'narrow'
                }
            ]
        });

        await changeToMobileViewport(page);

        await pageVisit(page);

        await expect(page).toHaveScreenshot('25-sidebar-exceptions-sidebar-mode-from-exception.png', {
            clip: SIDEBAR_NARROW_CLIP
        });

    });

    test('should not have sidebar_mode option', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            sidebar_mode: 'narrow',
            exceptions: [
                {
                    user: 'Test',
                    order: json.order
                }
            ]
        });

        await changeToMobileViewport(page);

        await page.goto('/');

        await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toBeVisible();

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

        await expect(page).toHaveScreenshot('26-sidebar-exceptions-style-from-exception.png', {
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

        await expect(page).toHaveScreenshot('27-sidebar-exceptions-no-style.png', {
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

        await expect(page).toHaveScreenshot('28-sidebar-exceptions-no-options-default-sidebar.png', {
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

        await expect(page).toHaveScreenshot('29-sidebar-exceptions-match-success.png', {
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

        await expect(page).toHaveScreenshot('29-sidebar-exceptions-match-success.png', {
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

        await expect(page).toHaveScreenshot('29-sidebar-exceptions-match-success.png', {
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

        await expect(page).toHaveScreenshot('29-sidebar-exceptions-match-success.png', {
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

        await expect(page).toHaveScreenshot('29-sidebar-exceptions-match-success.png', {
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

        await expect(page).toHaveScreenshot('29-sidebar-exceptions-match-success.png', {
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

        await expect(page).toHaveScreenshot('29-sidebar-exceptions-match-success.png', {
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

        await expect(page).toHaveScreenshot('29-sidebar-exceptions-match-success.png', {
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

        await expect(page).toHaveScreenshot('30-sidebar-exceptions-no-match-title-from-base.png', {
            clip: SIDEBAR_CLIP
        });

    });

    test('sidebar_mode option should be taken from the base', async ({ page }) => {

        await addJsonExtendedRoute(page, {
            sidebar_mode: 'narrow',
            exceptions: [
                {
                    user: 'ElChiniNet',
                    order: json.order,
                    sidebar_mode: 'hidden'
                }
            ]
        });

        await changeToMobileViewport(page);

        await pageVisit(page);

        await expect(page).toHaveScreenshot('31-sidebar-exceptions-no-match-sidebar-mode-from-base.png', {
            clip: SIDEBAR_NARROW_CLIP
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

        await expect(page).toHaveScreenshot('32-sidebar-exceptions-no-match-style-from-base.png', {
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

        await expect(page).toHaveScreenshot('33-sidebar-exceptions-no-match-everything-from-base.png', {
            clip: SIDEBAR_CLIP
        });

    });

});