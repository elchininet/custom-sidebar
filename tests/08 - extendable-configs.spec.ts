import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import { haConfigRequest } from './ha-services';
import { addJsonExtendedRoute } from './utilities';
import { SELECTORS } from './selectors';

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
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
                title: '@testing an exception should extend from an extendable configuration that extends from another extendable configuration',
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
            }
        ].forEach(runTest);

    });

});