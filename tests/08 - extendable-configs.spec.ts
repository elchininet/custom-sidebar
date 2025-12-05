import { test, expect } from 'playwright-test-coverage';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import { haConfigRequest } from './ha-services';
import {
    addJsonExtendedRoute,
    navigateHome,
    noCacheRoute
} from './utilities';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

test.beforeEach(noCacheRoute);

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

test.describe('extendable configurations', () => {

    test.describe('main configuration', () => {

        [
            {
                title: 'main config should extend from an extendable configuration',
                json: {
                    extendable_configs: {
                        my_config: {
                            subtitle: 'Extended Subtitle',
                            icon_color: 'red',
                            text_color: 'red'
                        }
                    },
                    title: 'Custom Title',
                    extend_from: 'my_config'
                },
                snapshot: 'extendable-configurations-main-config-extending.png'
            },
            {
                title: 'main config should extend from an extendable configuration that extends from another extendable configuration',
                json: {
                    extendable_configs: {
                        colors: {
                            icon_color: 'red',
                            text_color: 'red'
                        },
                        my_config: {
                            subtitle: 'Extended Subtitle',
                            extend_from: 'colors'
                        }
                    },
                    title: 'Custom Title',
                    extend_from: 'my_config'
                },
                snapshot: 'extendable-configurations-main-config-extending.png'
            },
            {
                title: 'main config should extend from two extendable configurations',
                json: {
                    extendable_configs: {
                        colors: {
                            icon_color: 'red',
                            text_color: 'red'
                        },
                        titles: {
                            title: 'Custom Title',
                            subtitle: 'Extended Subtitle'
                        }
                    },
                    extend_from: [
                        'colors',
                        'titles'
                    ]
                },
                snapshot: 'extendable-configurations-main-config-extending.png'
            },
            {
                title: 'main config should extend from multiple configuration mergin their order items',
                json: {
                    extendable_configs: {
                        show_only_overview: {
                            hide_all: true,
                            order: [
                                {
                                    item: 'overview',
                                    hide: false,
                                    order: 0
                                }
                            ]
                        },
                        admin_items: {
                            order: [
                                {
                                    new_item: true,
                                    item: 'Integrations',
                                    href: '/config/integrations',
                                    icon: 'mdi:puzzle',
                                    order: 2
                                },
                                {
                                    new_item: true,
                                    item: 'Entities',
                                    href: '/config/entities',
                                    icon: 'mdi:hexagon-multiple',
                                    order: 3
                                }
                            ]
                        }
                    },
                    order: [
                        {
                            item: 'overview',
                            icon_color_selected: 'red',
                            order: 4
                        },
                        {
                            item: 'Integrations',
                            name: 'Integrations Renamed'
                        }
                    ],
                    extend_from: [
                        'show_only_overview',
                        'admin_items'
                    ]
                },
                snapshot: 'extendable-configurations-main-config-extending-order-items.png'
            }
        ].forEach(runTest);

    });

    test.describe('exceptions', () => {

        [
            {
                title: 'an exception should extend from an extendable configuration',
                json: {
                    extendable_configs: {
                        my_config: {
                            subtitle: 'Extended Subtitle',
                            icon_color: 'red',
                            text_color: 'red'
                        }
                    },
                    exceptions: [
                        {
                            user: 'Test',
                            title: 'Custom Title',
                            extend_from: 'my_config'
                        }
                    ]
                },
                snapshot: 'extendable-configurations-exception-extending.png'
            },
            {
                title: 'an exception should extend from an extendable configuration and base',
                json: {
                    extendable_configs: {
                        my_config: {
                            subtitle: 'Extended Subtitle',
                            icon_color: 'red',
                            text_color: 'red'
                        }
                    },
                    exceptions: [
                        {
                            user: 'Test',
                            title: 'Custom Title',
                            extend_from: [
                                'base',
                                'my_config'
                            ]
                        }
                    ]
                },
                snapshot: 'extendable-configurations-main-config-extending.png'
            },
            {
                title: 'an exception should extend from an extendable configuration that extends from another extendable configuration',
                json: {
                    extendable_configs: {
                        colors: {
                            icon_color: 'red',
                            text_color: 'red'
                        },
                        my_config: {
                            subtitle: 'Extended Subtitle',
                            extend_from: 'colors'
                        }
                    },
                    exceptions: [
                        {
                            device: 'Chrome',
                            title: 'Custom Title',
                            extend_from: 'my_config'
                        }
                    ]
                },
                snapshot: 'extendable-configurations-exception-extending.png'
            },
            {
                title: 'exceptions should extend from multiple configurations mergin their order items',
                json: {
                    extendable_configs: {
                        show_only_overview: {
                            hide_all: true,
                            order: [
                                {
                                    item: 'overview',
                                    hide: false,
                                    order: 0
                                }
                            ]
                        },
                        admin_items: {
                            order: [
                                {
                                    new_item: true,
                                    item: 'Integrations',
                                    href: '/config/integrations',
                                    icon: 'mdi:puzzle',
                                    order: 2
                                },
                                {
                                    new_item: true,
                                    item: 'Entities',
                                    href: '/config/entities',
                                    icon: 'mdi:hexagon-multiple',
                                    order: 3
                                }
                            ]
                        }
                    },
                    order: [
                        {
                            item: 'overview',
                            icon_color_selected: 'red',
                            order: 4
                        },
                        {
                            item: 'Integrations',
                            name: 'Integrations Renamed'
                        }
                    ],
                    extend_from: [
                        'show_only_overview',
                        'admin_items'
                    ],
                    exceptions: [
                        {
                            user: 'Test',
                            order: [
                                {
                                    new_item: true,
                                    item: 'User Exception',
                                    icon: 'mdi:account-heart',
                                    href: '/user_exception',
                                    order: 4
                                },
                                {
                                    item: 'overview',
                                    name: 'Dashboard',
                                    order: 6
                                }
                            ]
                        },
                        {
                            is_admin: true,
                            order: [
                                {
                                    item: 'Entities',
                                    name: 'Entities Renamed',
                                    icon_color: 'orange'
                                },
                                {
                                    new_item: true,
                                    item: 'Admin Exception',
                                    icon: 'mdi:account-key',
                                    href: '/admin_exception',
                                    order: 5
                                }
                            ],
                            extend_from: [
                                'base'
                            ]
                        }
                    ]
                },
                snapshot: 'extendable-configurations-exception-extending-order-items.png'
            }
        ].forEach(runTest);

    });

});