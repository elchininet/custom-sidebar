import { test, expect } from 'playwright-test-coverage';
import {
    CONFIG_FILES,
    SELECTORS,
    SIDEBAR_CLIP,
    SIDEBAR_NARROW_CLIP,
    ATTRIBUTES,
    BASE_NAME
} from './constants';
import { haConfigRequest } from './ha-services';
import { getSidebarItem, getSidebarItemLinkFromLocator } from './selectors';
import {
    addJsonExtendedRoute,
    changeToMobileViewport,
    navigateHome,
    navigateToProfile,
    noCacheRoute,
    waitForMainElements
} from './utilities';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

test.beforeEach(noCacheRoute);

const json = {
    extend_from: BASE_NAME,
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

        await navigateHome(page);

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
                            extend_from: BASE_NAME,
                            order: [
                                {
                                    item: 'developer tools',
                                    name: 'Dev tools overridden',
                                    bottom: false
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
                        }
                    ]
                },
                snapshot: 'sidebar-exceptions-hide-all-override.png'
            }
        ].forEach(runTest);

        test('should override a new_item from the base', async ({ page }) => {

            const href = 'https://google.com';

            await addJsonExtendedRoute(page, {
                exceptions: [
                    {
                        user: 'Test',
                        extend_from: BASE_NAME,
                        order: [
                            {
                                new_item: true,
                                item: 'Google',
                                name: 'Search',
                                icon: 'mdi:web',
                                href,
                                order: -1
                            }
                        ]
                    }
                ]
            });

            await navigateHome(page);

            await expect(page).toHaveScreenshot('sidebar-exceptions-new-item-override.png', {
                clip: SIDEBAR_CLIP
            });

            const google = getSidebarItem(page, href);
            const linkGoogle = getSidebarItemLinkFromLocator(google);
            await expect(google).toHaveText('Search', { useInnerText: true });
            await expect(linkGoogle).toHaveAttribute('href', href);

            const googleIcon = google.locator('ha-icon[icon="mdi:web"]');
            expect(googleIcon).toBeVisible();

        });

        test('should override the sidebar_mode option from the base', async ({ page }) => {

            await addJsonExtendedRoute(page, {
                sidebar_mode: 'hidden',
                exceptions: [
                    {
                        user: 'Test',
                        sidebar_mode: 'narrow',
                        extend_from: BASE_NAME
                    }
                ]
            });

            await changeToMobileViewport(page);

            await navigateHome(page);

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
                        sidebar_editable: false,
                        extend_from: BASE_NAME
                    }
                ]
            });

            await navigateHome(page);

            await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
            await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

            await navigateToProfile(page);
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
                            extend_from: BASE_NAME,
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                            extend_from: BASE_NAME
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
                        extend_from: BASE_NAME
                    }
                ]
            });

            await changeToMobileViewport(page);

            await navigateHome(page);

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
                        extend_from: BASE_NAME
                    }
                ]
            });

            await navigateHome(page);

            await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
            await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

            await navigateToProfile(page);
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
                                match: 'href',
                                bottom: true
                            }
                        ]
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

        await navigateHome(page);

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
        await page.waitForURL(/.*\/lovelace/);
        await waitForMainElements(page, false);

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

        await navigateHome(page);

        await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

        await navigateToProfile(page);
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

        await navigateHome(page);

        await expect(page.locator(SELECTORS.MENU)).not.toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

        await navigateToProfile(page);
        await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

    });

});

test.describe('exceptions matchers', () => {

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
            title: 'it should match the user name regardless of is_admin being true',
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
            title: 'it should match the user name regardless of is_admin being false',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        is_admin: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'it should match the user name regardless of is_owner being true',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        is_owner: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'it should match the user name regardless of is_owner being false',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        is_owner: false,
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
            title: 'should match a user included in an user option as an array regardless of is_admin being true',
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
            title: 'should match a user included in an user option as an array regardless of is_admin being false',
            json: {
                exceptions: [
                    {
                        user: ['ElChiniNet', 'Test', 'Palaus'],
                        is_admin: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a user included in an user option as an array regardless of is_owner being true',
            json: {
                exceptions: [
                    {
                        user: ['ElChiniNet', 'Test', 'Palaus'],
                        is_owner: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a user included in an user option as an array regardless of is_owner being false',
            json: {
                exceptions: [
                    {
                        user: ['ElChiniNet', 'Test', 'Palaus'],
                        is_owner: false,
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
            title: 'should match a user if the user name doesn\'t match with not_user regardless of is_admin being true',
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
            title: 'should match a user if the user name doesn\'t match with not_user regardless of is_admin being false',
            json: {
                exceptions: [
                    {
                        not_user: 'ElChiniNet',
                        is_admin: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a user if the user name doesn\'t match with not_user regardless of is_owner being true',
            json: {
                exceptions: [
                    {
                        not_user: 'ElChiniNet',
                        is_owner: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a user if the user name doesn\'t match with not_user regardless of is_owner being false',
            json: {
                exceptions: [
                    {
                        not_user: 'ElChiniNet',
                        is_owner: false,
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
            title: 'should match an user if it is not included in the not_user option as an array regardless of is_admin being true',
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
            title: 'should match an user if it is not included in the not_user option as an array regardless of is_admin being false',
            json: {
                exceptions: [
                    {
                        not_user: ['ElChiniNet', 'Palaus'],
                        is_admin: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match an user if it is not included in the not_user option as an array regardless of is_owner being true',
            json: {
                exceptions: [
                    {
                        not_user: ['ElChiniNet', 'Palaus'],
                        is_owner: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match an user if it is not included in the not_user option as an array regardless of is_owner being false',
            json: {
                exceptions: [
                    {
                        not_user: ['ElChiniNet', 'Palaus'],
                        is_owner: false,
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
            title: 'should match a device regardless of is_admin being true',
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
            title: 'should match a device regardless of is_admin being false',
            json: {
                exceptions: [
                    {
                        device: 'Chrome',
                        is_admin: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device regardless of is_owner being true',
            json: {
                exceptions: [
                    {
                        device: 'Chrome',
                        is_owner: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device regardless of is_owner being false',
            json: {
                exceptions: [
                    {
                        device: 'Chrome',
                        is_owner: false,
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
            title: 'should match a device if it is included in the device option as an array regardless of is_admin being true',
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
            title: 'should match a device if it is included in the device option as an array regardless of is_admin being false',
            json: {
                exceptions: [
                    {
                        device: ['Android', 'Chrome', 'iPad'],
                        is_admin: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is included in the device option as an array regardless of is_owner being true',
            json: {
                exceptions: [
                    {
                        device: ['Android', 'Chrome', 'iPad'],
                        is_owner: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is included in the device option as an array regardless of is_owner being false',
            json: {
                exceptions: [
                    {
                        device: ['Android', 'Chrome', 'iPad'],
                        is_owner: false,
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
            title: 'should match a device if it is not equal to the not_device regardless of is_admin being true',
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
            title: 'should match a device if it is not equal to the not_device regardless of is_admin being false',
            json: {
                exceptions: [
                    {
                        not_device: 'iPad',
                        is_admin: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is not equal to the not_device regardless of is_owner being true',
            json: {
                exceptions: [
                    {
                        not_device: 'iPad',
                        is_owner: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is not equal to the not_device regardless of is_owner being false',
            json: {
                exceptions: [
                    {
                        not_device: 'iPad',
                        is_owner: false,
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
            title: 'should match a device if it is not included in the not_device option as an array regardless of is_admin being true',
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
        },
        {
            title: 'should match a device if it is not included in the not_device option as an array regardless of is_admin being false',
            json: {
                exceptions: [
                    {
                        not_device: ['iPad', 'Android'],
                        is_admin: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is not included in the not_device option as an array regardless of is_owner being true',
            json: {
                exceptions: [
                    {
                        not_device: ['iPad', 'Android'],
                        is_owner: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match a device if it is not included in the not_device option as an array regardless of is_owner being false',
            json: {
                exceptions: [
                    {
                        not_device: ['iPad', 'Android'],
                        is_owner: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should match an admin user if is_admin is true',
            json: {
                exceptions: [
                    {
                        is_admin: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should not match an admin user if is_admin is false',
            json: {
                exceptions: [
                    {
                        is_admin: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-no-match-admin-false.png'
        },
        {
            title: 'should match an owner user if is_owner is true',
            json: {
                exceptions: [
                    {
                        is_owner: true,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-match-success.png'
        },
        {
            title: 'should not match an owner user if is_owner is false',
            json: {
                exceptions: [
                    {
                        is_owner: false,
                        ...json
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-no-match-admin-false.png'
        }
    ].forEach(runTest);

});

test.describe('multiple matchers that match', () => {

    [
        {
            title: 'the last matching exception should rule',
            json: {
                title: 'Root title',
                exceptions: [
                    {
                        user: 'Test',
                        title: 'User match title'
                    },
                    {
                        device: 'Chrome',
                        title: 'Device match title'
                    },
                    {
                        is_admin: true,
                        title: 'Admin match title'
                    },
                    {
                        not_user: 'Test',
                        title: 'User not-matching title'
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-multiple-matchers-matching-last-one-used.png'
        },
        {
            title: 'all the matching exception items should be merged',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        order: [
                            {
                                new_item: true,
                                item: 'Check User',
                                icon: 'mdi:bullseye-arrow',
                                href: '/check_user',
                                order: 10
                            }
                        ]
                    },
                    {
                        is_admin: true,
                        order: [
                            {
                                new_item: true,
                                item: 'Check Admin',
                                icon: 'mdi:bullseye-arrow',
                                href: '/check_admin',
                                order: 11
                            }
                        ]
                    },
                    {
                        device: 'Chrome',
                        order: [
                            {
                                new_item: true,
                                item: 'Check Device',
                                icon: 'mdi:bullseye-arrow',
                                href: '/check_device',
                                order: 12
                            }
                        ]
                    },
                    {
                        is_admin: false,
                        order: [
                            {
                                new_item: true,
                                item: 'Check Non-Admin',
                                icon: 'mdi:bullseye-arrow',
                                href: '/check_non_admin',
                                order: 13
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-multiple-matchers-merged-orders.png'
        },
        {
            title: 'if the same item is in multiple orders, the last one rules',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        order: [
                            {
                                new_item: true,
                                item: 'Check',
                                icon: 'mdi:bullseye-arrow',
                                icon_color: 'blue',
                                href: '/check'
                            }
                        ]
                    },
                    {
                        is_admin: true,
                        order: [
                            {
                                new_item: true,
                                item: 'Admin',
                                icon: 'mdi:account-key',
                                href: '/admin_page'
                            },
                            {
                                new_item: true,
                                item: 'Check',
                                icon: 'mdi:check-bold',
                                icon_color: 'red',
                                href: '/check'
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-multiple-matchers-merged-orders-repeated-items.png'
        },
        {
            title: 'if matchers_conditions is AND and all the matchers match, it should take the exception',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        device: 'Chrome',
                        is_admin: true,
                        is_owner: true,
                        matchers_conditions: 'AND',
                        hide_all: true,
                        order: [
                            ...json.order,
                            {
                                item: 'overview',
                                hide: false,
                                order: 0
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-matchers-conditions-and-match.png'
        },
        {
            title: 'if matchers_conditions is AND and all the matchers match, it should take the exception (second)',
            json: {
                exceptions: [
                    {
                        not_user: 'ElChiniNet',
                        not_device: 'Android',
                        is_admin: true,
                        is_owner: true,
                        matchers_conditions: 'AND',
                        hide_all: true,
                        order: [
                            ...json.order,
                            {
                                item: 'overview',
                                hide: false,
                                order: 0
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-matchers-conditions-and-match.png'
        },
        {
            title: 'if matchers_conditions is AND and user doesn\'t match, the exception should be ignored',
            json: {
                exceptions: [
                    {
                        user: 'ElChiniNet',
                        device: 'Chrome',
                        matchers_conditions: 'AND',
                        hide_all: true,
                        order: [
                            ...json.order,
                            {
                                item: 'overview',
                                hide: false,
                                order: 0
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-matchers-conditions-and-do-not-match.png'
        },
        {
            title: 'if matchers_conditions is AND and not_user doesn\'t match, the exception should be ignored',
            json: {
                exceptions: [
                    {
                        not_user: 'Test',
                        device: 'Chrome',
                        matchers_conditions: 'AND',
                        hide_all: true,
                        order: [
                            ...json.order,
                            {
                                item: 'overview',
                                hide: false,
                                order: 0
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-matchers-conditions-and-do-not-match.png'
        },
        {
            title: 'if matchers_conditions is AND and device doesn\'t match, the exception should be ignored',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        device: 'Android',
                        matchers_conditions: 'AND',
                        hide_all: true,
                        order: [
                            ...json.order,
                            {
                                item: 'overview',
                                hide: false,
                                order: 0
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-matchers-conditions-and-do-not-match.png'
        },
        {
            title: 'if matchers_conditions is AND and not_device doesn\'t match, the exception should be ignored',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        not_device: 'Chrome',
                        matchers_conditions: 'AND',
                        hide_all: true,
                        order: [
                            ...json.order,
                            {
                                item: 'overview',
                                hide: false,
                                order: 0
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-matchers-conditions-and-do-not-match.png'
        },
        {
            title: 'if matchers_conditions is AND and is_admin doesn\'t match, the exception should be ignored',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        is_admin: false,
                        matchers_conditions: 'AND',
                        hide_all: true,
                        order: [
                            ...json.order,
                            {
                                item: 'overview',
                                hide: false,
                                order: 0
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-matchers-conditions-and-do-not-match.png'
        },
        {
            title: 'if matchers_conditions is AND and is_owner doesn\'t match, the exception should be ignored',
            json: {
                exceptions: [
                    {
                        user: 'Test',
                        is_owner: false,
                        matchers_conditions: 'AND',
                        hide_all: true,
                        order: [
                            ...json.order,
                            {
                                item: 'overview',
                                hide: false,
                                order: 0
                            }
                        ]
                    }
                ]
            },
            snapshot: 'sidebar-exceptions-matchers-conditions-and-do-not-match.png'
        }
    ].forEach(runTest);

});

test.describe('exceptions that do not match', () => {

    [
        {
            title: 'title option should be taken from the base',
            json: {
                exceptions: [
                    {
                        user: 'ElChiniNet',
                        title: 'Exception Title',
                        extend_from: BASE_NAME
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
                        extend_from: BASE_NAME,
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

        await navigateHome(page);

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
                    sidebar_editable: false,
                    extend_from: BASE_NAME
                }
            ]
        });

        await navigateHome(page);

        await expect(page.locator(SELECTORS.MENU)).not.toHaveCSS('pointer-events', 'none');
        await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).not.toHaveCSS('pointer-events', 'all');

        await navigateToProfile(page);
        await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

    });

});