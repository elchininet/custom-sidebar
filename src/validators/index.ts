import {
    ActionType,
    Config,
    ConfigException,
    ConfigItem,
    MatchersCondition,
    OnClickAction,
    Primitive,
    PrimitiveArray,
    PrimitiveObject,
    SidebarMode,
    SidebarWidth
} from '@types';
import {
    ALLOWED_UNITS,
    BASE_NAME,
    ITEM_STRING_CONFIG_OPTIONS,
    ITEM_TEMPLATE_COLOR_CONFIG_OPTIONS,
    ITEM_TEMPLATE_NUMBER_CONFIG_OPTIONS,
    JINJA_TEMPLATE_REG,
    JS_TEMPLATE_REG,
    SIDEBAR_MODE_TO_DOCKED_SIDEBAR
} from '@constants';
import {
    isArray,
    isBoolean,
    isNumber,
    isObject,
    isString,
    isUndefined
} from '@utilities';

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

const validateWidthOptions = (config: Config, prefix: string): void => {
    const errorFormatSuffix = `You need to provide a number followed by one of the allowed units (${ALLOWED_UNITS.join(', ')})`;
    const widthRegExp = new RegExp(`^\\d+(?:${ALLOWED_UNITS.join('|')})$`);
    const width = config.width;
    if (
        !isUndefined(width) &&
        !isString(width) &&
        !isNumber(width) &&
        !isObject(width)
    ) {
        throw new SyntaxError(`${prefix} "width" property should be a number, a string or an object`);
    }
    if (
        isString(width) &&
        !widthRegExp.test(width)
    ) {
        throw new SyntaxError(`${prefix} "width" property has an invalid format. ${errorFormatSuffix}`);
    } else if(isObject<SidebarWidth>(width)) {
        const { extended, hidden } = width;
        if (
            isUndefined(extended) &&
            isUndefined(hidden)
        ) {
            throw new SyntaxError(`${prefix} if "width" property is an object it should have an "extended" or a "hidden" property`);
        }
        if (
            !isUndefined(extended) &&
            !isNumber(extended) &&
            !isString(extended)
        ) {
            throw new SyntaxError(`${prefix} "width.extended" property should be a number or a string`);
        }
        if (
            !isUndefined(hidden) &&
            !isNumber(hidden) &&
            !isString(hidden)
        ) {
            throw new SyntaxError(`${prefix} "width.hidden" property should be a number or a string`);
        }
        widthRegExp.lastIndex = 0;
        if (
            isString(extended) &&
            !widthRegExp.test(extended)
        ) {
            throw new SyntaxError(`${prefix} "width.extended" property has an invalid format. ${errorFormatSuffix}`);
        }
        widthRegExp.lastIndex = 0;
        if (
            isString(hidden) &&
            !widthRegExp.test(hidden)
        ) {
            throw new SyntaxError(`${prefix} "width.hidden" property has an invalid format. ${errorFormatSuffix}`);
        }
    }
};

const validateStringOptions = <T, K extends keyof T>(obj: T, props: K[], prefix: string): void => {
    props.forEach((prop: K): void => {
        if (
            !isUndefined(obj[prop]) &&
            !isString(obj[prop])
        ) {
            throw new SyntaxError(`${prefix} "${String(prop)}" property should be a string`);
        }
    });
};

const validateStringOrNumberOptions = <T, K extends keyof T>(obj: T, props: K[], prefix: string): void => {
    props.forEach((prop: K): void => {
        if (
            !isUndefined(obj[prop]) &&
            !isString(obj[prop]) &&
            !isNumber(obj[prop])
        ) {
            throw new SyntaxError(`${prefix} "${String(prop)}" property should be a number or a string`);
        }
    });
};

const validateBooleanOptions = <T, K extends keyof T>(obj: T, props: K[], prefix: string): void => {
    props.forEach((prop: K): void => {
        if (
            !isUndefined(obj[prop]) &&
            !isBoolean(obj[prop])
        ) {
            throw new SyntaxError(`${prefix} "${String(prop)}" property should be a boolean`);
        }
    });
};

const validateBooleanOrStringOptions = <T, K extends keyof T>(obj: T, props: K[], prefix: string): void => {
    props.forEach((prop: K): void => {
        if (
            !isUndefined(obj[prop]) &&
            !isBoolean(obj[prop]) &&
            !isString(obj[prop])
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
    if (isUndefined(value)) return true;
    return (
        isString(value) ||
        (
            isArray(value) &&
            value.some(isString)
        )
    );
};

const validateAttributes = (
    attributes: undefined | string | Record<string, string | number | boolean>,
    errorPrefix: string
): void => {
    if (isUndefined(attributes)) {
        return;
    }
    if (
        isObject(attributes) ||
        isString(attributes)
    ) {
        if (isObject(attributes)) {
            Object.entries(attributes).forEach((entry) => {
                const [name, value] = entry;
                if (
                    !isString(value) &&
                    !isBoolean(value) &&
                    !isNumber(value)
                ) {
                    throw new SyntaxError(`${errorPrefix} the prop "${name}" in the attributes should be a string, a number or a boolean`);
                }
            });
        } else if (
            isString(attributes) &&
            !JS_TEMPLATE_REG.test(attributes)
        ) {
            throw new SyntaxError(`${errorPrefix} the "attributes" parameter as a string should be a JavaScript template`);
        }
    } else {
        throw new SyntaxError(`${errorPrefix} the "attributes" parameter should be an object or a template string`);
    }
};

const validateOnClickOption = (configItem: ConfigItem, errorPrefix: string): void => {
    if (!isUndefined(configItem.on_click)) {
        if (!isObject<OnClickAction>(configItem.on_click)) {
            throw new SyntaxError(`${errorPrefix} "on_click" property should be an object`);
        }
        if (!isString(configItem.on_click.action)) {
            throw new SyntaxError(`${errorPrefix} the "action" parameter should be a string`);
        }
        if (!Object.values<string>(ActionType).includes(configItem.on_click.action)) {
            throw new SyntaxError(`${errorPrefix} the "action" parameter should be one of these values: ${Object.values(ActionType).join(', ')}`);
        }
        if (configItem.on_click.action === ActionType.CALL_SERVICE) {
            if (!isString(configItem.on_click.service)) {
                throw new SyntaxError(`${errorPrefix} the "service" parameter should be a string`);
            }
            if (
                !isUndefined(configItem.on_click.data) &&
                !isObject(configItem.on_click.data)
            ) {
                throw new SyntaxError(`${errorPrefix} the "data" parameter needs to be an object`);
            }
        }
        if (configItem.on_click.action === ActionType.JAVASCRIPT) {
            if (!isString(configItem.on_click.code)) {
                throw new SyntaxError(`${errorPrefix} the "code" parameter should be a string`);
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
        const extendFromArray = isArray(extendFrom)
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
        const extendFromArray = isArray(extendFrom)
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
        isString(variable) &&
        (
            JS_TEMPLATE_REG.test(variable) ||
            JINJA_TEMPLATE_REG.test(variable)
        )
    ) {
        console.warn(`"${variableGroup}" property should not have templates. "${stack.join(' > ')}" seems to be a template`);
    } else if (
        !isString(variable) &&
        !isNumber(variable) &&
        !isBoolean(variable)
    ) {
        if (isArray(variable)) {
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
        } else if (isObject(variable)) {
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
    if (!isUndefined(variables)) {
        if (!isObject(variables)) {
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

const validateAnalytics = (config: Config, errorPrefix: string): void => {
    if (config.analytics) {
        if (
            !isBoolean(config.analytics) &&
            !isObject(config.analytics)
        ) {
            throw new SyntaxError(`${errorPrefix} "analytics" should be a boolean or an object`);
        }
        if (isObject(config.analytics)) {
            validateBooleanOptions(
                config.analytics,
                [
                    'sidebar_item_clicked',
                    'panel_visited'
                ],
                `${errorPrefix} "analytics"`
            );
        }
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

    validateWidthOptions(exception, `${ERROR_PREFIX}, exceptions`);

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
        !isUndefined(exception.matchers_conditions) &&
        exception.matchers_conditions !== MatchersCondition.AND &&
        exception.matchers_conditions !== MatchersCondition.OR
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "matchers_conditions" property should be "${MatchersCondition.AND}" or "${MatchersCondition.OR}"`);
    }

    if (
        !isUndefined(exception.order) &&
        !isArray(exception.order)
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

    validateAnalytics(exception, `${ERROR_PREFIX}, error in exception:`);

    if (
        !isUndefined(exception.sidebar_mode) &&
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
    if (isUndefined(exceptions)) {
        return;
    }
    if (!isArray(exceptions)) {
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

    validateWidthOptions(config, `${ERROR_PREFIX},`);

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
        !isUndefined(config.sidebar_mode) &&
        !(config.sidebar_mode in SIDEBAR_MODE_TO_DOCKED_SIDEBAR)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, "sidebar_mode" property should be ${SidebarMode.HIDDEN}, ${SidebarMode.NARROW} or ${SidebarMode.EXTENDED}`);
    }

    if (
        !isUndefined(config.order) &&
        !isArray(config.order)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, "order" property should be an array`);
    }

    if (!isUndefined(config.partials)) {
        if (!isObject(config.partials)) {
            throw new SyntaxError(`${ERROR_PREFIX}, "partials" property should be an object`);
        }
        Object.entries(config.partials).forEach((entry) => {
            const [partial, value] = entry;
            if (!isString(value)) {
                throw new SyntaxError(`${ERROR_PREFIX}, "partials" should be an object with strings. The partial ${partial} is not a string`);
            }
        });
    }

    validateVariables('js_variables', config.js_variables);
    validateVariables('js_refs', config.js_refs);
    validateVariables('jinja_variables', config.jinja_variables);
    validateAnalytics(config, `${ERROR_PREFIX},`);
    config.order?.forEach(validateConfigItem);
    validateExceptions(config.exceptions, config);
};