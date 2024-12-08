import { FLUSH_PROMISE_DELAY } from '@constants';

export const getLowercaseArray = (value: string | string[]): string[] => {
    if (Array.isArray(value)) {
        return value.map((val: string) => val.toLowerCase());
    }
    return value.toLowerCase().split(/\s*,\s*/);
};

export const getArray = (value: string | string[]): string[] => {
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
};

export const randomId = (): string => Math.random().toString(16).slice(2);

export const flushPromise = () => new Promise((resolve) => {
    setTimeout(resolve, FLUSH_PROMISE_DELAY);
});