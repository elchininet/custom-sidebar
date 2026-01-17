import {
    OBJECT_TO_STRING,
    REGEXP_TO_STRING,
    TYPE
} from '@constants';

export const isUndefined = (variable: unknown): variable is undefined => typeof variable === TYPE.UNDEFINED;
export const isString = (variable: unknown): variable is string => typeof variable === TYPE.STRING;
export const isNumber = (variable: unknown): variable is number => typeof variable === TYPE.NUMBER && !Number.isNaN(variable);
export const isBoolean = (variable: unknown): variable is boolean => typeof variable === TYPE.BOOLEAN;
export const isObject = <T = Record<string, unknown>>(variable: unknown): variable is T => Object.prototype.toString.call(variable) === OBJECT_TO_STRING;
export const isArray = <T extends unknown[]>(variable: unknown | T): variable is T => Array.isArray(variable);
export const isRegExp = (variable: unknown): variable is RegExp => Object.prototype.toString.call(variable) === REGEXP_TO_STRING;