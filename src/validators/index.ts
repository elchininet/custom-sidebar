import {
    Config,
    ConfigItem,
    ConfigException,
    SidebarMode
} from '@types';
import {
    BOOLEAN_TYPE,
    STRING_TYPE,
    UNDEFINED_TYPE,
    SIDEBAR_MODE_TO_DOCKED_SIDEBAR
} from '@constants';

const ERROR_PREFIX = 'Invalid configuration';

const validateStringOptions = <T, K extends keyof T>(obj: T, props: K[], prefix: string): void => {
    props.forEach((prop: K): void => {
        if (
            typeof obj[prop] !== UNDEFINED_TYPE &&
            typeof obj[prop] !== STRING_TYPE
        ) {
            throw new SyntaxError(`${prefix} "${String(prop)}" property should be a string`);
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
    if (typeof value === UNDEFINED_TYPE) return true;
    return (
        typeof value === STRING_TYPE ||
        (
            Array.isArray(value) &&
            value.some((item: string): boolean => typeof item === STRING_TYPE)
        )
    );
};

const validateExceptionItem = (exception: ConfigException): void => {

    validateStringOptions(
        exception,
        [
            'title',
            'icon_color',
            'icon_color_selected',
            'text_color',
            'text_color_selected',
            'selection_color',
            'info_color',
            'info_color_selected',
            'notification_color',
            'sidebar_color',
            'title_color',
            'sidebar_button_color',
            'styles'
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
        typeof exception.order !== UNDEFINED_TYPE &&
        !Array.isArray(exception.order)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "order" property should be an array`);
    }

    if (
        typeof exception.sidebar_editable !== UNDEFINED_TYPE &&
        typeof exception.sidebar_editable !== BOOLEAN_TYPE &&
        typeof exception.sidebar_editable !== STRING_TYPE
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "sidebar_editable" property should be a boolean or a template string`);
    }

    if (
        typeof exception.sidebar_mode !== UNDEFINED_TYPE &&
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

const validateExceptions = (exceptions: ConfigException[] | undefined): void => {
    if (typeof exceptions === UNDEFINED_TYPE) {
        return;
    }
    if (!Array.isArray(exceptions)) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions should be an array`);
    }
    exceptions.forEach(validateExceptionItem);
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
            'icon_color',
            'icon_color_selected',
            'text_color',
            'text_color_selected',
            'selection_color',
            'info_color',
            'info_color_selected',
            'notification_color'
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
            'title',
            'icon_color',
            'icon_color_selected',
            'text_color',
            'text_color_selected',
            'selection_color',
            'info_color',
            'info_color_selected',
            'notification_color',
            'sidebar_color',
            'title_color',
            'sidebar_button_color',
            'styles'
        ],
        `${ERROR_PREFIX},`
    );
    if (
        typeof config.sidebar_editable !== UNDEFINED_TYPE &&
        typeof config.sidebar_editable !== BOOLEAN_TYPE &&
        typeof config.sidebar_editable !== STRING_TYPE
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, "sidebar_editable" property should be a boolean or a template string`);
    }
    if (
        typeof config.sidebar_mode !== UNDEFINED_TYPE &&
        !(config.sidebar_mode in SIDEBAR_MODE_TO_DOCKED_SIDEBAR)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, "sidebar_mode" property should be ${SidebarMode.HIDDEN}, ${SidebarMode.NARROW} or ${SidebarMode.EXTENDED}`);
    }
    if (
        typeof config.order !== UNDEFINED_TYPE &&
        !Array.isArray(config.order)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, "order" property should be an array`);
    }
    config.order?.forEach(validateConfigItem);
    validateExceptions(config.exceptions);
};