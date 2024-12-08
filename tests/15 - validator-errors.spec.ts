import { test, expect } from 'playwright-test-coverage';
import { SidebarMode } from '../src/types';
import { BASE_NAME } from './constants';
import { fulfillJson } from './utilities';
import { SELECTORS } from './selectors';

const ERROR_PREFIX = 'custom-sidebar: Invalid configuration';

interface TestSuit {
    title: string;
    json: Record<string, unknown>;
    error?: string;
    warning?: string;
}

const runErrorTests = (tests: TestSuit[]): void => {

    tests.forEach(({ title, json, error, warning }): void => {

        test(title, async ({ page }) => {

            const errors: string[] = [];
            const warnings: string[] = [];

            await fulfillJson(page, json);

            page.on('pageerror', error => {
                errors.push(error.message);
            });

            page.on('console', message => {
                if (message.type() === 'warning') {
                    warnings.push(message.text());
                }
            });

            await page.goto('/');

            await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
            await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

            if (error) {
                expect(errors).toEqual(
                    expect.arrayContaining([error])
                );
            }

            if (warning) {
                expect(warnings).toEqual(
                    expect.arrayContaining([warning])
                );
            }

        });

    });

};

test.describe('main options', () => {

    runErrorTests([
        {
            title: 'should throw an error if it has a malformed title option',
            json: {
                title: ['Custom Title']
            },
            error: `${ERROR_PREFIX}, "title" property should be a string`
        },
        {
            title: 'should throw an error if it has a malformed title_color option',
            json: {
                title_color: 0xFF0000
            },
            error: `${ERROR_PREFIX}, "title_color" property should be a string`
        },
        {
            title: 'should throw an error if it has a malformed subtitle option',
            json: {
                subtitle: /Subtitle/
            },
            error: `${ERROR_PREFIX}, "subtitle" property should be a string`
        },
        {
            title: 'should throw an error if it has a malformed subtitle_color option',
            json: {
                subtitle_color: 981234
            },
            error: `${ERROR_PREFIX}, "subtitle_color" property should be a string`
        },
        {
            title: 'should throw an error if it has a malformed sidebar_border_color option',
            json: {
                sidebar_border_color: false
            },
            error: `${ERROR_PREFIX}, "sidebar_border_color" property should be a string`
        },
        {
            title: 'should throw an error if it has an invalid "sidebar_editable" option',
            json: {
                sidebar_editable: { editable: true }
            },
            error: `${ERROR_PREFIX}, "sidebar_editable" property should be a boolean or a string`
        },
        {
            title: 'should throw an error if it has wrong sidebar_mode option',
            json: {
                sidebar_mode: 'non_valid'
            },
            error: `${ERROR_PREFIX}, "sidebar_mode" property should be ${SidebarMode.HIDDEN}, ${SidebarMode.NARROW} or ${SidebarMode.EXTENDED}`
        },
        {
            title: 'should throw an error if it has a malformed selection_opacity option',
            json: {
                selection_opacity: [100]
            },
            error: `${ERROR_PREFIX}, "selection_opacity" property should be a number or a string`
        },
        {
            title: 'should throw an error if the "hide_all" property is not a boolean',
            json: {
                hide_all: 'true'
            },
            error: `${ERROR_PREFIX}, "hide_all" property should be a boolean`
        },
        {
            title: 'should throw an error if it has a malformed styles option',
            json: {
                styles: {
                    body: {
                        color: 'red'
                    }
                }
            },
            error: `${ERROR_PREFIX}, "styles" property should be a string`
        },
        {
            title: 'should throw an error if the order property is not an array',
            json: {
                order: {}
            },
            error: `${ERROR_PREFIX}, "order" property should be an array`
        },
        {
            title: 'should throw an error if the js_variables property is not an object',
            json: {
                js_variables: [1, 'two', true]
            },
            error: `${ERROR_PREFIX}, "js_variables" property should be an object`
        },
        {
            title: 'should throw an error if the js_variables property contains a variable that is not a string, a number or a boolean',
            json: {
                js_variables: {
                    TEST_1: 3,
                    TEST_2: /expression/
                }
            },
            error: `${ERROR_PREFIX}, "js_variables" property should contain only strings, numbers or booleans. Property TEST_2 has the wrong type`
        },
        {
            title: 'should throw a warning if the js_variables property contains templates',
            json: {
                js_variables: {
                    TEST_1: 'TEST_1',
                    TEST_2: '[[[ return 3; ]]]'
                }
            },
            warning: '"js_variables" property should not have templates. Property TEST_2 seems to be a template'
        },
        {
            title: 'should throw an error if the jinja_variables property is not an object',
            json: {
                jinja_variables: 'var test = 1'
            },
            error: `${ERROR_PREFIX}, "jinja_variables" property should be an object`
        },
        {
            title: 'should throw an error if the jinja_variables property contains a variable that is not a string, a number or a boolean',
            json: {
                jinja_variables: {
                    TEST_1: [1, 2, 3],
                    TEST_2: 'TEST_2'
                }
            },
            error: `${ERROR_PREFIX}, "jinja_variables" property should contain only strings, numbers or booleans. Property TEST_1 has the wrong type`
        },
        {
            title: 'should throw a warning if the jinja_variables property contains templates',
            json: {
                jinja_variables: {
                    TEST_1: '{{ states("sun.sun") }}',
                    TEST_2: 'TEST_2'
                }
            },
            warning: '"jinja_variables" property should not have templates. Property TEST_1 seems to be a template'
        },
        {
            title: 'should throw an error if the partials property is not an object',
            json: {
                partials: ['partial']
            },
            error: `${ERROR_PREFIX}, "partials" property should be an object`
        },
        {
            title: 'should throw an error if a partial inside the partials property is not a string',
            json: {
                partials: {
                    partial_1: 'partial_1',
                    partial_2: 100
                }
            },
            error: `${ERROR_PREFIX}, "partials" should be an object with strings. The partial partial_2 is not a string`
        },
        {
            title: 'should warn about a non existent partial with a JavaScript template',
            json: {
                partials: {
                    my_partial: 'const title = "Title"'
                },
                title: `[[[
                    @partial your_partial
                    return 'Title';
                ]]]`
            },
            warning: 'custom-sidebar: partial your_partial doesn\'t exist'
        },
        {
            title: 'should throw an error if there is a circular partial dependency in a JavaScript template',
            json: {
                partials: {
                    my_title: `
                        @partial my_partial
                        const title = "Title"
                    `,
                    my_partial: `
                        @partial my_title
                        const myTitle = title.toUpperCase();
                    `
                },
                title: `[[[
                    @partial my_partial
                    return myTitle;
                ]]]`
            },
            error: `custom-sidebar: circular partials dependency my_partial > my_title > my_partial`
        },
        {
            title: 'should warn about a non existent partial with a Jinja template',
            json: {
                partials: {
                    my_partial: '{% set title = "Title" %}'
                },
                title: `
                    @partial your_partial
                    {{ title }}
                `
            },
            warning: 'custom-sidebar: partial your_partial doesn\'t exist'
        },
        {
            title: 'should throw an error if there is a circular partial dependency in a Jinja template',
            json: {
                partials: {
                    my_title: `
                        @partial my_partial
                        {% set title = "Title" %}
                    `,
                    my_partial: `
                        @partial my_title
                        {% set myTitle = title | upper %};
                    `
                },
                title: `
                    @partial my_partial
                    {{ myTitle }}
                `
            },
            error: `custom-sidebar: circular partials dependency my_partial > my_title > my_partial`
        }
    ]);

});

test.describe('order item property', () => {

    runErrorTests([
        {
            title: 'should throw an error if any item in the order option doesn\'t have an "item" property',
            json: {
                order: [
                    {
                        item: 'config'
                    },
                    {
                        name: 'dev'
                    }
                ]
            },
            error: `${ERROR_PREFIX}, every item in an "order" array should have an "item" property`
        },
        {
            title: 'should throw an error if the "item" property is not a string',
            json: {
                order: [
                    {
                        item: 'config'
                    },
                    {
                        item: ['dev']
                    }
                ]
            },
            error: `${ERROR_PREFIX} in dev, "item" property should be a string`
        },
        {
            title: 'should throw an error if a new item doesn\'t have an "href" property',
            json: {
                order: [
                    {
                        item: 'config'
                    },
                    {
                        item: 'dev',
                        new_item: true
                    }
                ]
            },
            error: `${ERROR_PREFIX} in dev, if you set "new_item" as "true", "href" property is necessary`
        },
        {
            title: 'should throw an error if the "href" property in a new item is not a string',
            json: {
                order: [
                    {
                        item: 'config'
                    },
                    {
                        item: 'dev',
                        new_item: true,
                        href: []
                    }
                ]
            },
            error: `${ERROR_PREFIX} in dev, "href" property should be a string`
        },
        {
            title: 'should throw an error if a new item doesn\'t have an "icon" property',
            json: {
                order: [
                    {
                        item: 'config'
                    },
                    {
                        item: 'dev',
                        new_item: true,
                        href: '/dev'
                    }
                ]
            },
            error: `${ERROR_PREFIX} in dev, if you set "new_item" as "true", "icon" property is necessary`
        },
        {
            title: 'should throw an error if the "selection_opacity" of an item is not a number or a string',
            json: {
                order: [
                    {
                        item: 'config',
                        selection_opacity: { opacity: 1 }
                    }
                ]
            },
            error: `${ERROR_PREFIX} in config, "selection_opacity" property should be a number or a string`
        },
        {
            title: 'should throw an error if the "icon" property of a new icon is not a string',
            json: {
                order: [
                    {
                        item: 'config'
                    },
                    {
                        item: 'dev',
                        new_item: true,
                        href: '/dev',
                        icon: 5
                    }
                ]
            },
            error: `${ERROR_PREFIX} in dev, "icon" property should be a string`
        }
    ]);

});

test.describe('exceptions', () => {

    runErrorTests([
        {
            title: 'should throw an error if "exceptions" is not an array',
            json: {
                exceptions: {}
            },
            error: `${ERROR_PREFIX}, exceptions should be an array`
        },
        {
            title: 'should throw an error if it has a malformed "order" option',
            json: {
                exceptions: [
                    {
                        order: 100,
                        extend_from: BASE_NAME
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "order" property should be an array`
        },
        {
            title: 'should throw an error if it has an invalid "title" option',
            json: {
                exceptions: [
                    {
                        title: ['Invalid title']
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "title" property should be a string`
        },
        {
            title: 'should throw an error if it has an invalid "sidebar_mode" option',
            json: {
                exceptions: [
                    {
                        sidebar_mode: 'non-valid'
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "sidebar_mode" property should be ${SidebarMode.HIDDEN}, ${SidebarMode.NARROW} or ${SidebarMode.EXTENDED}`
        },
        {
            title: 'should throw an error if it has an invalid "sidebar_editable" option',
            json: {
                exceptions: [
                    {
                        sidebar_editable: NaN
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "sidebar_editable" property should be a boolean or a string`
        },
        {
            title: 'should throw an error if it has an invalid "selection_opacity" option',
            json: {
                exceptions: [
                    {
                        selection_opacity: /opacity/
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "selection_opacity" property should be a number or a string`
        },
        {
            title: 'should throw an error if it has an invalid "styles" option',
            json: {
                exceptions: [
                    {
                        styles: { body: 'display: none' }
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "styles" property should be a string`
        },
        {
            title: 'should throw an error if the "is_admin" property is not a boolean',
            json: {
                exceptions: [
                    {
                        is_admin: 'true',
                        user: 'Test'
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "is_admin" property should be a boolean`
        },
        {
            title: 'should throw an error if it has a malformed "user" option',
            json: {
                exceptions: [
                    {
                        user: {}
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "user" property should be a string or an array of strings`
        },
        {
            title: 'should throw an error if it has a malformed "not_user" option',
            json: {
                exceptions: [
                    {
                        not_user: {}
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "not_user" property should be a string or an array of strings`
        },
        {
            title: 'should throw an error if it has a malformed "device" option',
            json: {
                exceptions: [
                    {
                        device: 5
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "device" property should be a string or an array of strings`
        },
        {
            title: 'should throw an error if it has a malformed "not_device" option',
            json: {
                exceptions: [
                    {
                        not_device: NaN
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "not_device" property should be a string or an array of strings`
        },
        {
            title: 'should throw an error if it has "user" and "no_user" parameters at the same time',
            json: {
                exceptions: [
                    {
                        user: 'ElChiniNet',
                        not_user: 'Palaus'
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "user" and "not_user" properties cannot be used together`
        },
        {
            title: 'should throw an error if it has "device" and "not_device" parameters at the same time',
            json: {
                exceptions: [
                    {
                        device: ['iPhone'],
                        not_device: ['Android']
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "device" and "not_device" properties cannot be used together`
        },
        {
            title: 'should throw an error if the "hide_all" property is not a boolean',
            json: {
                exceptions: [
                    {
                        hide_all: 'true',
                        user: 'ElChiniNet'
                    }
                ]
            },
            error: `${ERROR_PREFIX}, exceptions "hide_all" property should be a boolean`
        },
        {
            title: 'should throw an error if it not every item in "order" property has an "item" property',
            json: {
                exceptions: [
                    {
                        order: [
                            {
                                item: 'config'
                            },
                            {
                                name: 'dev'
                            }
                        ],
                        user: 'ElChiniNet'
                    }
                ]
            },
            error: `${ERROR_PREFIX}, every item in an "order" array should have an "item" property`
        }
    ]);

});