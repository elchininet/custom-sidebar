import { HassConnection } from 'home-assistant-javascript-templates';
import { getPromisableResult } from 'get-promisable-result';
import { MOBILE_REGEXP } from '@constants';
import { isArray, isNumber } from './predicates';

export const getLowercaseArray = (value: string | string[]): string[] => {
    if (isArray(value)) {
        return value.map((val: string) => val.toLowerCase());
    }
    return value.toLowerCase().split(/\s*,\s*/);
};

export const getArray = (value: string | string[]): string[] => {
    if (isArray(value)) {
        return value;
    }
    return [value];
};

export const randomId = (): string => Math.random().toString(16).slice(2);

export const parseWidth = (width: undefined | number | string): undefined | string => {
    return isNumber(width)
        ? `${width}px`
        : width;
};

export const isMobileClient = MOBILE_REGEXP.test(navigator.userAgent);

export const getHassConnectionPromise = async (): Promise<HassConnection> => {
    return await getPromisableResult(
        () => window.hassConnection,
        (hassConnectionPromise: Promise<HassConnection>) => !!hassConnectionPromise
    );
};