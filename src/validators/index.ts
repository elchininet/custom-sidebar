import {
    Config,
    ConfigItem,
    ConfigException,
    SidebarMode
} from '@types';
import {
    EXTEND_FROM_BASE,
    TYPE,
    OBJECT_TO_STRING,
    SIDEBAR_MODE_TO_DOCKED_SIDEBAR,
    ITEM_TEMPLATE_STRING_OPTIONS,
    ITEM_TEMPLATE_NUMBER_OPTIONS,
    JS_TEMPLATE_REG,
    JINJA_TEMPLATE_REG
} from '@constants';

const ERROR_PREFIX = 'Invalid configuration';

const BASE_CONFIG_OPTIONS = [
    'title',
    'subtitle',
    'sidebar_background',
    'title_color',
    'subtitle_color',
    'sidebar_button_color',
    'sidebar_border_color',
    'menu_background',
    'divider_color',
    'divider_top_color',
    'divider_bottom_color',
    'scrollbar_thumb_color',
    'styles',
    ...ITEM_TEMPLATE_STRING_OPTIONS
] as const;

const validateStringOptions = <T, K extends keyof T>(obj: T, props: K[], prefix: string): void => {
    props.forEach((prop: K): void => {
        if (
            typeof obj[prop] !== TYPE.UNDEFINED &&
            typeof obj[prop] !== TYPE.STRING
        ) {
            throw new SyntaxError(`${prefix} "${String(prop)}" property should be a string`);
        }
    });
};

const validateStringOrNumberOptions = <T, K extends keyof T>(obj: T, props: K[], prefix: string): void => {
    props.forEach((prop: K): void => {
        if (
            typeof obj[prop] !== TYPE.UNDEFINED &&
            typeof obj[prop] !== TYPE.STRING &&
            typeof obj[prop] !== TYPE.NUMBER
        ) {
            throw new SyntaxError(`${prefix} "${String(prop)}" property should be a number or a string`);
        }
    });
};

const validateBooleanOptions = <T, K extends keyof T>(obj: T, props: K[], prefix: string): void => {
    props.forEach((prop: K): void => {
        if (
            typeof obj[prop] !== TYPE.UNDEFINED &&
            typeof obj[prop] !== TYPE.BOOLEAN
        ) {
            throw new SyntaxError(`${prefix} "${String(prop)}" property should be a boolean`);
        }
    });
};

const validateBooleanOrStringOptions = <T, K extends keyof T>(obj: T, props: K[], prefix: string): void => {
    props.forEach((prop: K): void => {
        if (
            typeof obj[prop] !== TYPE.UNDEFINED &&
            typeof obj[prop] !== TYPE.BOOLEAN &&
            typeof obj[prop] !== TYPE.STRING
        ) {
            throw new SyntaxError(`${prefix} "${String(prop)}" property should be a boolean or a string`);
        }
    });
};

const validateStringOrArrayOfStringsOptions = <T extends [string, undefined | string | string[]]>(dictionary: T[], prefix: string): void => {
    dictionary.forEach((entry): void => {
        const [prop, value] = entry;
        if (!validateStringOrArrayOfStrings(value)) {
            throw new SyntaxError(`${prefix} "${prop}" property should be a string or an array of strings`);
        }
    });
};

const validateStringOrArrayOfStrings = (value: undefined | string | string[]): boolean => {
    if (typeof value === TYPE.UNDEFINED) return true;
    return (
        typeof value === TYPE.STRING ||
        (
            Array.isArray(value) &&
            value.some((item: string): boolean => typeof item === TYPE.STRING)
        )
    );
};

const validateExtendFrom = (
    extendFrom: string | undefined,
    config: Config,
    exceptions = false,
    prefix = `${ERROR_PREFIX},`,
    extendBreadcrumb: string[] = []
): void => {
    if (extendFrom) {
        if (extendBreadcrumb.includes(extendFrom)) {
            throw new SyntaxError(`${prefix} circular extend dependency detected "${extendBreadcrumb.join(' > ')} > ${extendFrom}"`);
        }
        if (exceptions) {
            if (
                extendFrom !== EXTEND_FROM_BASE &&
                !(extendFrom in (config.extendable_configs ?? {}))
            ) {
                throw new SyntaxError(`${prefix} "${extendFrom}" doesn't exist in "extendable_configs"`);
            }
            if (extendFrom === EXTEND_FROM_BASE) {
                validateExtendFrom(
                    config.extend_from,
                    config,
                    exceptions,
                    prefix,
                    [
                        ...extendBreadcrumb,
                        config.extend_from
                    ]
                );
            } else {
                validateExtendFrom(
                    config.extendable_configs?.[extendFrom].extend_from,
                    config,
                    exceptions,
                    prefix,
                    [
                        ...extendBreadcrumb,
                        config.extendable_configs?.[extendFrom].extend_from
                    ]
                );
            }
        } else {
            if (extendFrom === EXTEND_FROM_BASE) {
                throw new SyntaxError(`${ERROR_PREFIX}, "entend_from" can only be "base" in exceptions`);
            }
            if (!(extendFrom in (config.extendable_configs ?? {}))) {
                throw new SyntaxError(`${prefix} "${extendFrom}" doesn't exist in "extendable_configs"`);
            }
            validateExtendFrom(
                config.extendable_configs?.[extendFrom].extend_from,
                config,
                exceptions,
                prefix,
                [
                    ...extendBreadcrumb,
                    config.extendable_configs?.[extendFrom].extend_from
                ]
            );
        }
    }
};

const validateVariables = (name: string, variables: Record<string, unknown> | undefined): void => {
    if (typeof variables !== TYPE.UNDEFINED) {
        if (Object.prototype.toString.call(variables) !== OBJECT_TO_STRING) {
            throw new SyntaxError(`${ERROR_PREFIX}, "${name}" property should be an object`);
        }
        Object.entries(variables).forEach((entry) => {
            const [prop, value] = entry;
            if (
                typeof value !== TYPE.STRING &&
                typeof value !== TYPE.NUMBER &&
                typeof value !== TYPE.BOOLEAN
            ) {
                throw new SyntaxError(`${ERROR_PREFIX}, "${name}" property should contain only strings, numbers or booleans. Property ${prop} has the wrong type`);
            }
            if (
                typeof value === 'string' &&
                (
                    JS_TEMPLATE_REG.test(value) ||
                    JINJA_TEMPLATE_REG.test(value)
                )
            ) {
                console.warn(`"${name}" property should not have templates. Property ${prop} seems to be a template`);
            }
        });
    }
};

const validateExceptionItem = (exception: ConfigException, config: Config): void => {

    validateStringOptions(
        exception,
        [
            ...BASE_CONFIG_OPTIONS,
            'extend_from'
        ],
        `${ERROR_PREFIX}, exceptions`
    );

    validateExtendFrom(
        exception.extend_from,
        config,
        true,
        `${ERROR_PREFIX}, exceptions`
    );

    validateStringOrNumberOptions(
        exception,
        [
            ...ITEM_TEMPLATE_NUMBER_OPTIONS
        ],
        `${ERROR_PREFIX}, exceptions`
    );

    validateStringOrArrayOfStringsOptions(
        [
            ['user', exception.user],
            ['not_user', exception.not_user],
            ['device', exception.device],
            ['not_device', exception.not_device]
        ],
        `${ERROR_PREFIX}, exceptions`
    );

    if (
        typeof exception.order !== TYPE.UNDEFINED &&
        !Array.isArray(exception.order)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "order" property should be an array`);
    }

    validateBooleanOrStringOptions(
        exception,
        ['sidebar_editable'],
        `${ERROR_PREFIX}, exceptions`
    );

    validateBooleanOptions(
        exception,
        ['hide_all', 'is_admin'],
        `${ERROR_PREFIX}, exceptions`
    );

    if (
        typeof exception.sidebar_mode !== TYPE.UNDEFINED &&
        !(exception.sidebar_mode in SIDEBAR_MODE_TO_DOCKED_SIDEBAR)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "sidebar_mode" property should be ${SidebarMode.HIDDEN}, ${SidebarMode.NARROW} or ${SidebarMode.EXTENDED}`);
    }

    if (
        exception.user &&
        exception.not_user
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "user" and "not_user" properties cannot be used together`);
    }

    if (
        exception.device &&
        exception.not_device
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "device" and "not_device" properties cannot be used together`);
    }

    exception.order?.forEach(validateConfigItem);
};

const validateExceptions = (exceptions: ConfigException[] | undefined, config: Config): void => {
    if (typeof exceptions === TYPE.UNDEFINED) {
        return;
    }
    if (!Array.isArray(exceptions)) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions should be an array`);
    }
    exceptions.forEach((exceptionItem): void => {
        validateExceptionItem(exceptionItem, config);
    });
};

const validateConfigItem = (configItem: ConfigItem): void => {

    if (!configItem.item) {
        throw new SyntaxError(`${ERROR_PREFIX}, every item in an "order" array should have an "item" property`);
    }

    validateStringOptions(
        configItem,
        [
            'item',
            'info',
            ...ITEM_TEMPLATE_STRING_OPTIONS
        ],
        `${ERROR_PREFIX} in ${configItem.item},`
    );

    validateStringOrNumberOptions(
        configItem,
        [
            ...ITEM_TEMPLATE_NUMBER_OPTIONS
        ],
        `${ERROR_PREFIX} in ${configItem.item},`
    );

    if (configItem.new_item) {
        validateStringOptions(
            configItem,
            ['href', 'icon'],
            `${ERROR_PREFIX} in ${configItem.item},`
        );
        if (!configItem.href) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, if you set "new_item" as "true", "href" property is necessary`);
        }
        if (!configItem.icon) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, if you set "new_item" as "true", "icon" property is necessary`);
        }
    }
};

export const validateConfig = (config: Config): void => {

    validateStringOptions(
        config,
        [
            ...BASE_CONFIG_OPTIONS,
            'extend_from'
        ],
        `${ERROR_PREFIX},`
    );

    validateStringOrNumberOptions(
        config,
        [
            ...ITEM_TEMPLATE_NUMBER_OPTIONS
        ],
        `${ERROR_PREFIX},`
    );

    validateBooleanOrStringOptions(
        config,
        ['sidebar_editable'],
        `${ERROR_PREFIX},`
    );

    validateBooleanOptions(
        config,
        ['hide_all'],
        `${ERROR_PREFIX},`
    );

    validateExtendFrom(
        config.extend_from,
        config
    );

    if (
        typeof config.sidebar_mode !== TYPE.UNDEFINED &&
        !(config.sidebar_mode in SIDEBAR_MODE_TO_DOCKED_SIDEBAR)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, "sidebar_mode" property should be ${SidebarMode.HIDDEN}, ${SidebarMode.NARROW} or ${SidebarMode.EXTENDED}`);
    }

    if (
        typeof config.order !== TYPE.UNDEFINED &&
        !Array.isArray(config.order)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, "order" property should be an array`);
    }

    if (typeof config.partials !== TYPE.UNDEFINED) {
        if (Object.prototype.toString.call(config.partials) !== OBJECT_TO_STRING) {
            throw new SyntaxError(`${ERROR_PREFIX}, "partials" property should be an object`);
        }
        Object.entries(config.partials).forEach((entry) => {
            const [partial, value] = entry;
            if (typeof value !== TYPE.STRING) {
                throw new SyntaxError(`${ERROR_PREFIX}, "partials" should be an object with strings. The partial ${partial} is not a string`);
            }
        });
    }

    validateVariables('js_variables', config.js_variables);
    validateVariables('jinja_variables', config.jinja_variables);
    config.order?.forEach(validateConfigItem);
    validateExceptions(config.exceptions, config);
};