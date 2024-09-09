import {
    Config,
    ConfigItem,
    ConfigException
} from '@types';
import {
    BOOLEAN_TYPE,
    STRING_TYPE,
    UNDEFINED_TYPE
} from '@constants';

const ERROR_PREFIX = 'Invalid configuration';

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

    if (
        typeof exception.order !== UNDEFINED_TYPE &&
        !Array.isArray(exception.order)
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "order" property should be an array`);
    }

    if (
        typeof exception.title !== UNDEFINED_TYPE &&
        typeof exception.title !== STRING_TYPE
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "title" property should be a string`);
    }

    if (
        typeof exception.sidebar_editable !== UNDEFINED_TYPE &&
        typeof exception.sidebar_editable !== BOOLEAN_TYPE &&
        typeof exception.sidebar_editable !== STRING_TYPE
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "sidebar_editable" property should be a boolean or a template string`);
    }

    if (
        typeof exception.styles !== UNDEFINED_TYPE &&
        typeof exception.styles !== STRING_TYPE
    ) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "styles" property should be a string`);
    }

    if (!validateStringOrArrayOfStrings(exception.user)) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "user" property should be a string or an array of strings`);
    }

    if (!validateStringOrArrayOfStrings(exception.not_user)) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "not_user" property should be a string or an array of strings`);
    }

    if (!validateStringOrArrayOfStrings(exception.device)) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "device" property should be a string or an array of strings`);
    }

    if (!validateStringOrArrayOfStrings(exception.not_device)) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions "not_device" property should be a string or an array of strings`);
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

    if (exception.order) {
        exception.order.forEach(validateConfigItem);
    }
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

    if (typeof configItem.item !== STRING_TYPE) {
        throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, item property should be an string`);
    }

    if (configItem.new_item) {
        if (!configItem.href) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, if you set "new_item" as "true", "href" property is necessary`);
        }
        if (typeof configItem.href !== STRING_TYPE) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, "href" property should be a string`);
        }
        if (!configItem.icon) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, if you set "new_item" as "true", "icon" property is necessary`);
        }
        if (typeof configItem.icon !== STRING_TYPE) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, "icon" property should be a string`);
        }
    }
};

export const validateConfig = (config: Config): void => {
    if (typeof config.order === UNDEFINED_TYPE) {
        throw new SyntaxError(`${ERROR_PREFIX}, "order" parameter is required`);
    }
    if (!Array.isArray(config.order)) {
        throw new SyntaxError(`${ERROR_PREFIX}, "order" parameter should be an array`);
    }
    config.order.forEach(validateConfigItem);
    validateExceptions(config.exceptions);
};