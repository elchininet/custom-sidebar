import {
    Config,
    ConfigItem,
    ConfigException
} from '@types';
import { STRING_TYPE, UNDEFINED_TYPE } from '@constants';

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

const validateExceptionItem = (exception: ConfigException): boolean => {

    if (!exception.order) {
        throw new SyntaxError(`${ERROR_PREFIX}, every item in "exceptions" array should have an "order" property`);
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

    return exception.order.every(validateConfigItem);
};

const validateExceptions = (exceptions: ConfigException[] | undefined): boolean => {
    if (typeof exceptions === UNDEFINED_TYPE) {
        return true;
    }
    if (!Array.isArray(exceptions)) {
        throw new SyntaxError(`${ERROR_PREFIX}, exceptions should be an array`);
    }
    return exceptions.every(validateExceptionItem);
}

const validateConfigItem = (configItem: ConfigItem): boolean => {

    if (!configItem.item) {
        throw new SyntaxError(`${ERROR_PREFIX}, every item in an "order" array should have an "item" property`);
    }

    if (typeof configItem.item !== STRING_TYPE) {
        throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, item property should be an string`);
    }

    if (!!configItem.new_item) {
        if (!configItem.href) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, if you set "new_item" as "true", "href" property is necessary`);
        }
        if (typeof configItem.href !== STRING_TYPE) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, "href" property should be a string`);
        }
        if (!configItem.icon) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, if you set "new_item" as "true", "item" property is necessary`);
        }
        if (typeof configItem.icon !== STRING_TYPE) {
            throw new SyntaxError(`${ERROR_PREFIX} in ${configItem.item}, "icon" property should be a string`);
        }
    }

    return true;

};

export const validateConfig = (config: Config): boolean => {
    if (config.order) {
        if (Array.isArray(config.order)) {
            if (
                config.order.every(validateConfigItem) &&
                validateExceptions(config.exceptions)
            ) {
                return true;
            }
        }
        throw new SyntaxError(`${ERROR_PREFIX}, "order" parameter should be an array`);
    }
    throw new SyntaxError(`${ERROR_PREFIX}, "order" parameter is required`);
};