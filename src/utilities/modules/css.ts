import { isString } from './predicates';

export const getCSSVariables = (...values: (string | number)[]): string => {
    const [value, ...rest] = values;
    if (rest.length === 0) {
        return isString(value) && value.startsWith('--')
            ? `var(${ value })`
            : `${value}`;
    }
    return `var(${ value }, ${ getCSSVariables(...rest) })`;
};