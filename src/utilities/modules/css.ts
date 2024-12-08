export const getCSSVariables = (...values: string[]): string => {
    const [value, ...rest] = values;
    if (rest.length === 0) {
        return value.startsWith('--')
            ? `var(${ value })`
            : value;
    }
    return `var(${ value }, ${ getCSSVariables(...rest) })`;
};