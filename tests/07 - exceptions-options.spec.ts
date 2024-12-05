import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
    CONFIG_FILES,
    SIDEBAR_CLIP,
    SIDEBAR_NARROW_CLIP,
    ATTRIBUTES
} from './constants';
import { haConfigRequest } from './ha-services';
import { addJsonExtendedRoute, changeToMobileViewport } from './utilities';
import { SELECTORS } from './selectors';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
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

interface TestParams {
    title: string;
    json: Record<string, unknown>;
    snapshot: string;
}

const runTest = ({ title, json, snapshot }: TestParams): void => {

    test(title, async ({ page }) => {

        await addJsonExtendedRoute(page, json);

        await pageVisit(page);

        await expect(page).toHaveScreenshot(snapshot, {
            clip: SIDEBAR_CLIP
        });

    });

};

test.describe('extending from the base', () => {

    test.describe('overriding options from the base', () => {

        [
            {
                title: 'should override an item from the base',
                json: {
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
                },
                snapshot: 'sidebar-exceptions-item-override.png'
            },
            {
                title: 'should override the title option from the base',
                json: {
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            title: 'Exception Title',
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-title-override.png'
            },
            {
                title: 'should override the icon_color option from the base',
                json: {
                    icon_color: 'blue',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            icon_color: 'red',
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-sidebar-icon-color-override.png'
            },
            {
                title: 'should override the icon_color_selected option from the base',
                json: {
                    icon_color_selected: 'blue',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            icon_color_selected: 'red',
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-sidebar-icon-color-selected-override.png'
            },
            {
                title: 'should override the text_color option from the base',
                json: {
                    text_color: 'blue',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            text_color: 'red',
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-sidebar-text-color-override.png'
            },
            {
                title: 'should override the text_color_selected option from the base',
                json: {
                    text_color_selected: 'blue',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            text_color_selected: 'red',
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-sidebar-text-color-selected-override.png'
            },
            {
                title: 'should override the selection_background option from the base',
                json: {
                    selection_background: 'blue',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            selection_background: 'red',
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-sidebar-selection-background-override.png'
            },
            {
                title: 'should override the info_color option from the base',
                json: {
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
                },
                snapshot: 'sidebar-exceptions-sidebar-info-color-override.png'
            },
            {
                title: 'should override the info_color_selected option from the base',
                json: {
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
                },
                snapshot: 'sidebar-exceptions-sidebar-info-color-selected-override.png'
            },
            {
                title: 'should override the style option from the base',
                json: {
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
                },
                snapshot: 'sidebar-exceptions-style-override.png'
            },
            {
                title: 'should override the hide_all option from the base',
                json: {
                    hide_all: false,
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            hide_all: true,
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-hide-all-override.png'
            }
        ].forEach(runTest);

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

            await expect(page).toHaveScreenshot('sidebar-exceptions-new-item-override.png', {
                clip: SIDEBAR_CLIP
            });

            const google = page.locator(SELECTORS.SIDEBAR_ITEMS.GOOGLE);
            await expect(google).toHaveText('Search', { useInnerText: true });
            await expect(google).toHaveAttribute('href', 'https://google.com');
            await expect(google).not.toHaveAttribute('target', '_blank');

            const googleIcon = page.locator(`${SELECTORS.SIDEBAR_ITEMS.GOOGLE} ha-icon[icon="mdi:web"]`);
            expect(googleIcon).toBeVisible();

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

            await expect(page).toHaveScreenshot('sidebar-exceptions-sidebar-mode-override.png', {
                clip: SIDEBAR_NARROW_CLIP
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

        [
            {
                title: 'if there is no order in the base it should take only the order from the exceptions',
                json: {
                    order: undefined,
                    exceptions: [
                        {
                            user: 'Test',
                            extend_from_base: true,
                            order: json.order
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-no-order-from-base.png'
            },
            {
                title: 'should take the style option from the base',
                json: {
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
                },
                snapshot: 'sidebar-exceptions-extend-style-from-base.png'
            },
            {
                title: 'should take the icon_color option from the base',
                json: {
                    icon_color: 'green',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-extend-icon-color-from-base.png'
            },
            {
                title: 'should take the icon_color_selected option from the base',
                json: {
                    icon_color_selected: 'red',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-extend-icon-color-selected-from-base.png'
            },
            {
                title: 'should take the text_color option from the base',
                json: {
                    text_color: 'green',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-extend-text-color-from-base.png'
            },
            {
                title: 'should take the text_color_selected option from the base',
                json: {
                    text_color_selected: 'red',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-extend-text-color-selected-from-base.png'
            },
            {
                title: 'should take the selection_background option from the base',
                json: {
                    selection_background: 'red',
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-extend-selection-background-from-base.png'
            },
            {
                title: 'should take the info_color option from the base',
                json: {
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
                },
                snapshot: 'sidebar-exceptions-extend-info-color-from-base.png'
            },
            {
                title: 'should take the info_color_selected option from the base',
                json: {
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
                },
                snapshot: 'sidebar-exceptions-extend-info-color-selected-from-base.png'
            },
            {
                title: 'should take the hide_all option from the base',
                json: {
                    hide_all: true,
                    exceptions: [
                        {
                            user: 'Test',
                            order: json.order,
                            extend_from_base: true
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-hide-all-override.png'
            }
        ].forEach(runTest);

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

            await expect(page).toHaveScreenshot('sidebar-exceptions-extend-sidebar-mode-from-base.png', {
                clip: SIDEBAR_NARROW_CLIP
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

    [
        {
            title: 'should have only the items in the exception',
            json: {
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
            },
            snapshot: 'sidebar-exceptions-few-changes.png'
        },
        {
            title: 'should take the title option from the exception',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        title: 'Exception Title'
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-title-from-exception.png'
        },
        {
            title: 'should take the hide_all option from the exception',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        order: json.order,
                        hide_all: true
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-hide-all-from-exception.png'
        },
        {
            title: 'should take the style from the exception',
            json: {
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
            },
            snapshot: 'sidebar-exceptions-style-from-exception.png'
        },
        {
            title: 'if no options there should be no changes',
            json: {
                exceptions: [
                    {
                        user: 'Test'
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-no-options-default-sidebar.png'
        }
    ].forEach(runTest);

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

        await expect(page).toHaveScreenshot('sidebar-exceptions-sidebar-mode-from-exception.png', {
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

});

test.describe('user and device matchers', () => {

    [
        {
            title: 'should match a user using the user option',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a user using the user option and it is an admin',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        is_admin: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'shuld match a user if it is included in the user option as an array',
            json: {
                exceptions: [
                    {
                        user: ['ElChiniNet', 'Test', 'Palaus'],
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'shuld match a user if it is included in the user option as an array and it is an admin',
            json: {
                exceptions: [
                    {
                        user: ['ElChiniNet', 'Test', 'Palaus'],
                        is_admin: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a user if it is not equal to the not_user option',
            json: {
                exceptions: [
                    {
                        not_user: 'ElChiniNet',
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a user if it is not equal to the not_user option and it is an admin',
            json: {
                exceptions: [
                    {
                        not_user: 'ElChiniNet',
                        is_admin: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match an user if it is not included in the not_user option as an array',
            json: {
                exceptions: [
                    {
                        not_user: ['ElChiniNet', 'Palaus'],
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match an user if it is not included in the not_user option as an array and it is an admin',
            json: {
                exceptions: [
                    {
                        not_user: ['ElChiniNet', 'Palaus'],
                        is_admin: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device using the device option',
            json: {
                exceptions: [
                    {
                        device: 'Chrome',
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device using the device option if it is an admin',
            json: {
                exceptions: [
                    {
                        device: 'Chrome',
                        is_admin: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is included in the device option as an array',
            json: {
                exceptions: [
                    {
                        device: ['Android', 'Chrome', 'iPad'],
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is included in the device option as an array and it is an admin',
            json: {
                exceptions: [
                    {
                        device: ['Android', 'Chrome', 'iPad'],
                        is_admin: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is not equal to the not_device option',
            json: {
                exceptions: [
                    {
                        not_device: 'iPad',
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is not equal to the not_device option and it is an admin',
            json: {
                exceptions: [
                    {
                        not_device: 'iPad',
                        is_admin: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is not included in the not_device option as an array',
            json: {
                exceptions: [
                    {
                        not_device: ['iPad', 'Android'],
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is not included in the not_device option as an array and it is an admin',
            json: {
                exceptions: [
                    {
                        not_device: ['iPad', 'Android'],
                        is_admin: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        }
    ].forEach(runTest);

});

test.describe('exceptions that do not match', async () => {

    [
        {
            title: 'title option should be taken from the base',
            json: {
                exceptions: [
                    {
                        user: 'ElChiniNet',
                        order: json.order,
                        title: 'Exception Title',
                        extend_from_base: true
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-no-match-title-from-base.png'
        },
        {
            title: 'hide_all option should be taken from the base',
            json: {
                hide_all: true,
                exceptions: [
                    {
                        user: 'ElChiniNet',
                        order: json.order,
                        hide_all: false
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-no-match-hide-all-from-base.png'
        },
        {
            title: 'style option should be take from the base',
            json: {
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
            },
            snapshot: 'sidebar-exceptions-no-match-style-from-base.png'
        },
        {
            title: 'no options everything from base is taken',
            json: {
                exceptions: [
                    {
                        user: 'ElChiniNet'
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-no-match-everything-from-base.png'
        }
    ].forEach(runTest);

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

        await expect(page).toHaveScreenshot('sidebar-exceptions-no-match-sidebar-mode-from-base.png', {
            clip: SIDEBAR_NARROW_CLIP
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

});