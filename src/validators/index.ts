import {
    Config,
    ConfigItem,
    ConfigException,
    SidebarMode,
    Primitive,
    PrimitiveObject,
    PrimitiveArray,
    MatchersCondition,
    ActionType
} from '@types';
import {
    BASE_NAME,
    TYPE,
    OBJECT_TO_STRING,
    SIDEBAR_MODE_TO_DOCKED_SIDEBAR,
    ITEM_TEMPLATE_COLOR_CONFIG_OPTIONS,
    ITEM_TEMPLATE_NUMBER_CONFIG_OPTIONS,
    ITEM_STRING_CONFIG_OPTIONS,
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
    ...ITEM_TEMPLATE_COLOR_CONFIG_OPTIONS,
    ...ITEM_STRING_CONFIG_OPTIONS
] as const;

const ONLY_BASE_CONFIG_OPTIONS = [
    'js_variables',
    'jinja_variables',
    'partials',
    'extendable_configs'
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

const validateAttributes = (attributes: undefined | string | Record<string, string | number | boolean>, errorProfix: string): void => {
    if (
        typeof attributes === TYPE.UNDEFINED ||
        typeof attributes === 'string'
    ) {
        return;
    }
    if (Object.prototype.toString.call(attributes) !== OBJECT_TO_STRING) {
        throw new SyntaxError(`${errorProfix} the "attributes" parameter should be a string or an object`);
    }
    Object.entries(attributes).forEach((entry) => {
        const [name, value] = entry;
        if (
            typeof value !== TYPE.STRING &&
            typeof value !== TYPE.BOOLEAN &&
            typeof value !== TYPE.NUMBER
        ) {
            throw new SyntaxError(`${errorProfix} the prop "${name}" in the attributes should be a string, a number or a boolean`);
        }
    });
};

const validateOnClickOption = (configItem: ConfigItem, errorProfix: string): void => {
    if (typeof configItem.on_click !== TYPE.UNDEFINED) {
        if (Object.prototype.toString.call(configItem.on_click) !== OBJECT_TO_STRING) {
            throw new SyntaxError(`${errorProfix} "on_click" property should be an object`);
        }
        if (typeof configItem.on_click.action !== TYPE.STRING) {
            throw new SyntaxError(`${errorProfix} the "action" parameter should be a string`);
        }
        if (!Object.values<string>(ActionType).includes(configItem.on_click.action)) {
            throw new SyntaxError(`${errorProfix} the "action" parameter should be one of these values: ${Object.values(ActionType).join(', ')}`);
        }
        if (configItem.on_click.action === ActionType.CALL_SERVICE) {
            if (typeof configItem.on_click.service !== TYPE.STRING) {
                throw new SyntaxError(`${errorProfix} the "service" parameter should be a string`);
            }
            if (
                typeof configItem.on_click.data !== TYPE.UNDEFINED &&
                Object.prototype.toString.call(configItem.on_click.data) !== OBJECT_TO_STRING
            ) {
                throw new SyntaxError(`${errorProfix} the "data" parameter needs to be an object`);
            }
        }
        if (configItem.on_click.action === ActionType.JAVASCRIPT) {
            if (typeof configItem.on_click.code !== TYPE.STRING) {
                throw new SyntaxError(`${errorProfix} the "code" parameter should be a string`);
            }
        }
    }
};

const validateExtendFrom = (
    extendFrom: string | string[] |  undefined,
    config: Config,
    prefix: string,
    exceptions = false
): void => {
    if (extendFrom) {
        const extendFromArray = Array.isArray(extendFrom)
            ? extendFrom
            : [extendFrom];
        extendFromArray.forEach((extendFrom: string): void => {
            if (extendFrom === BASE_NAME && !exceptions) {
                throw new SyntaxError(`${prefix} "entend_from" can only be "base" in exceptions`);
            }
            if (
                extendFrom !== BASE_NAME &&
                !(extendFrom in (config.extendable_configs ?? {}))
            ) {
                throw new SyntaxError(`${prefix} "${extendFrom}" doesn't exist in "extendable_configs"`);
            }
        });
    }
};

const validateExtendableConfig = (
    extendFrom: string | string[] | undefined,
    config: Config,
    extendBreadcrumb: string[]
): void => {
    if (extendFrom) {
        const extendFromArray = Array.isArray(extendFrom)
            ? extendFrom
            : [extendFrom];
        extendFromArray.forEach((extendFrom: string): void => {
            if (extendBreadcrumb.includes(extendFrom)) {
                throw new SyntaxError(`${ERROR_PREFIX}, circular extend dependency detected in "${extendBreadcrumb.join(' > ')} > ${extendFrom}"`);
            }
            if (extendFrom === BASE_NAME) {
                throw new SyntaxError(`${ERROR_PREFIX}, error in extendable config "${extendBreadcrumb[0]}": "entend_from" can only be "base" in exceptions`);
            }
            if (!(extendFrom in config.extendable_configs)) {
                throw new SyntaxError(`${ERROR_PREFIX}, error in "${extendBreadcrumb[extendBreadcrumb.length - 1]}": "${extendFrom}" doesn't exist in "extendable_configs"`);
            }
            validateExtendableConfig(
                config.extendable_configs[extendFrom].extend_from,
                config,
                [
                    ...extendBreadcrumb,
                    extendFrom
                ]
            );
        });
    }
};

const validateExtendableConfigs = (config: Config): void => {
    if (config.extendable_configs) {
        Object.entries(config.extendable_configs).forEach((entry): void => {
            const [name, entendableConfig] = entry;
            validateExtendableConfig(
                entendableConfig.extend_from,
                config,
                [name]
            );
        });
    }
};

const validateBaseConfigOnlyOptions = <T extends object>(config: T, prefix: string): void => {
    ONLY_BASE_CONFIG_OPTIONS.forEach((option: string): void => {
        if (option in config) {
            throw new SyntaxError(`${prefix} "${option}" option can only be placed in the main config`);
        }
    });
};

const validateVariable = (
    variableGroup: string,
    variable: Primitive | PrimitiveObject | PrimitiveArray,
    stack: string[]
): void => {
    if (
        typeof variable === 'string' &&
        (
            JS_TEMPLATE_REG.test(variable) ||
            JINJA_TEMPLATE_REG.test(variable)
        )
    ) {
        console.warn(`"${variableGroup}" property should not have templates. "${stack.join(' > ')}" seems to be a template`);
    } else if (
        typeof variable !== TYPE.STRING &&
        typeof variable !== TYPE.NUMBER &&
        typeof variable !== TYPE.BOOLEAN
    ) {
        if (Array.isArray(variable)) {
            variable.forEach((value: Primitive | PrimitiveObject | PrimitiveArray, index: number) => {
                validateVariable(
                    variableGroup,
                    value,
                    [
                        ...stack,
                        `[${index}]`
                    ]
                );
            });
        } else if (Object.prototype.toString.call(variable) === OBJECT_TO_STRING) {
            const variableObject = variable as PrimitiveObject;
            Object.entries(variableObject).forEach((entry): void => {
                const [prop, value] = entry;
                validateVariable(
                    variableGroup,
                    value,
                    [
                        ...stack,
                        prop
                    ]
                );
            });
        } else {
            throw new SyntaxError(`${ERROR_PREFIX}, "${variableGroup}: ${stack.join(' > ')}" has a wrong type ${Object.prototype.toString.call(variable)}`);
        }
    }
};

const validateVariables = (variableGroup: string, variables: Record<string, Primitive | PrimitiveObject | PrimitiveArray>): void => {
    if (typeof variables !== TYPE.UNDEFINED) {
        if (Object.prototype.toString.call(variables) !== OBJECT_TO_STRING) {
            throw new SyntaxError(`${ERROR_PREFIX}, "${variableGroup}" property should be an object`);
        }
        Object.entries(variables).forEach((entry) => {
            const [prop, variable] = entry;
            validateVariable(
                variableGroup,
                variable,
                [prop]
            );
        });
    }
};

const validateExceptionItem = (exception: ConfigException, config: Config): void => {

    validateBaseConfigOnlyOptions(
        exception,
        `${ERROR_PREFIX}, exceptions`
    );

    validateStringOptions(
        exception,
        [
            ...BASE_CONFIG_OPTIONS
        ],
        `${ERROR_PREFIX}, exceptions`
    );

    validateStringOrNumberOptions(
        exception,
        [
            ...ITEM_TEMPLATE_NUMBER_CONFIG_OPTIONS
        ],
        `${ERROR_PREFIX}, exceptions`
    );

    validateStringOrArrayOfStringsOptions(
        [
            ['user', exception.user],
            ['not_user', exception.not_user],
            ['device', exception.device],
            ['not_device', exception.not_device],
            ['extend_from', exception.extend_from]
        ],
        `${ERROR_PREFIX}, exceptions`
    );

    validateExtendFrom(
        exception.extend_from,
        config,
        `${ERROR_PREFIX}, error in exception:`,
        true
    );

    if (
        typeof exception.matchers_conditions !== TYPE.UNDEFINED &&
        exception.matchers_conditions !== MatchersCondition.AND &&
        exception.matchers_conditions !== MatchersCondition.OR
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "matchers_conditions" property should be "${MatchersCondition.AND}" or "${MatchersCondition.OR}"`);
    }

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
        [
            'hide_all',
            'is_admin',
            'is_owner'
        ],
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

    validateBaseConfigOnlyOptions(
        configItem,
        `${ERROR_PREFIX} in ${configItem.item},`
    );

    if (!configItem.item) {
        throw new SyntaxError(`${ERROR_PREFIX}, every item in an "order" array should have an "item" property`);
    }

    validateStringOptions(
        configItem,
        [
            'item',
            'info',
            ...ITEM_TEMPLATE_COLOR_CONFIG_OPTIONS
        ],
        `${ERROR_PREFIX} in ${configItem.item},`
    );

    validateStringOrNumberOptions(
        configItem,
        [
            ...ITEM_TEMPLATE_NUMBER_CONFIG_OPTIONS
        ],
        `${ERROR_PREFIX} in ${configItem.item},`
    );

    validateBooleanOrStringOptions(
        configItem,
        ['hide'],
        `${ERROR_PREFIX} in ${configItem.item},`
    );

    validateBooleanOptions(
        configItem,
        ['divider'],
        `${ERROR_PREFIX} in ${configItem.item},`
    );

    validateOnClickOption(
        configItem,
        `${ERROR_PREFIX} in ${configItem.item},`
    );

    validateAttributes(
        configItem.attributes,
        `${ERROR_PREFIX} in ${configItem.item},`
    );

    if (configItem.new_item) {
        validateStringOptions(
            configItem,
            ['href', 'icon'],
            `${ERROR_PREFIX} in ${configItem.item},`
        );
        if (!configItem.href && !configItem.on_click) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, if you set "new_item" as "true", it is necessary an "href" or an "on_click "property`);
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
            ...BASE_CONFIG_OPTIONS
        ],
        `${ERROR_PREFIX},`
    );

    validateStringOrArrayOfStringsOptions(
        [
            ['extend_from', config.extend_from]
        ],
        `${ERROR_PREFIX},`
    );

    validateExtendFrom(
        config.extend_from,
        config,
        `${ERROR_PREFIX}, error in main config:`
    );

    validateExtendableConfigs(config);

    validateStringOrNumberOptions(
        config,
        [
            ...ITEM_TEMPLATE_NUMBER_CONFIG_OPTIONS
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