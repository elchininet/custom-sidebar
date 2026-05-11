import { getPromisableResult, PromisableOptions } from 'get-promisable-result';
import {
    MAX_ATTEMPTS,
    MOBILE_REGEXP,
    RETRY_DELAY
} from '@constants';
import {
    isArray,
    isNumber,
    isString
} from './predicates';

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

interface WaitForElement<E extends Element> {
    toBeAdded: () => Promise<E | null>;
    toBeRemoved: () => Promise<E | null>;
}

export function waitForElement<E extends Element = Element>(
    root: Element | ShadowRoot,
    selector: string,
    options: PromisableOptions
): WaitForElement<E>;
export function waitForElement<E extends Element = Element>(
    selector: string,
    options: PromisableOptions
): WaitForElement<E>;
export function waitForElement<E extends Element = Element>(
    rootOrSelector: Element | ShadowRoot | string,
    selectorOrOptions: string | PromisableOptions,
    options: PromisableOptions = {}
): WaitForElement<E> {
    const root = isString(rootOrSelector)
        ? document
        : rootOrSelector;
    const selector = isString(rootOrSelector)
        ? rootOrSelector
        : String(selectorOrOptions);
    const promisableOptions = !isString(selectorOrOptions)
        ? selectorOrOptions
        : options;
    const finalPromisableOptions = {
        retries: MAX_ATTEMPTS,
        delay: RETRY_DELAY,
        shouldReject: false,
        ...promisableOptions
    };
    const selectElement = () => root.querySelector<E>(selector);
    return {
        toBeAdded() {
            return getPromisableResult(
                selectElement,
                (element: E | null) => !!(element?.shadowRoot),
                finalPromisableOptions
            );
        },
        toBeRemoved() {
            return getPromisableResult(
                selectElement,
                (element: E | null) => element === null,
                finalPromisableOptions
            );
        }
    };
};
export const isMobileClient = MOBILE_REGEXP.test(navigator.userAgent);