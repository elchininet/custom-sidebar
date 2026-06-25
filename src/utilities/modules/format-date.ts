import {
    HomeAsssistantExtended,
    HuiTimestampDisplay,
    HuiTimestampDisplayDateFormat
} from '@types';
import { CUSTOM_ELEMENT } from '@constants';
import { localeManager } from './translations';

type MakeAsync<O> = {
    [K in keyof O & string as `${K}Async`]: O[K] extends (...args: infer A) => infer R
        ? (...args: A) => Promise<R>
        : never;
};

export const getFormatDateMethods = (ha: HomeAsssistantExtended) => {

    const geHuiTimestampDisplayInstance = (date: string | Date): HuiTimestampDisplay => {
        const huiTimestampDisplay = document.createElement(CUSTOM_ELEMENT.HUI_TIMESTAMP_DISPLAY) as HuiTimestampDisplay;
        huiTimestampDisplay._config = ha.hass.config;
        huiTimestampDisplay.__transform__config = ha.hass.config;
        huiTimestampDisplay._localize = ha.hass.localize;
        huiTimestampDisplay.__transform__localize = ha.hass.localize;
        huiTimestampDisplay._locale = ha.hass.locale;
        huiTimestampDisplay.__transform__locale = ha.hass.locale;
        huiTimestampDisplay.ts = date instanceof Date
            ? date
            : new Date(date);
        return huiTimestampDisplay;
    };

    const getRendered = (huiTimestampDisplay: HuiTimestampDisplay): string => {
        const result =  huiTimestampDisplay.render();
        return result.values.join('');
    };

    const formatDate = (date: string | Date): string => {
        const huiTimestampDisplay = geHuiTimestampDisplayInstance(date);
        huiTimestampDisplay.format = HuiTimestampDisplayDateFormat.DATE;
        return getRendered(huiTimestampDisplay);
    };

    const formatDateTime = (date: string | Date): string => {
        const huiTimestampDisplay = geHuiTimestampDisplayInstance(date);
        huiTimestampDisplay.format = HuiTimestampDisplayDateFormat.DATETIME;
        return getRendered(huiTimestampDisplay);
    };

    const formatTime = (time: string | Date): string => {
        const date = /^\d+:\d+(:\d+)?$/.test(time.toString())
            ? `1900-01-01T${time}`
            : time;
        const huiTimestampDisplay = geHuiTimestampDisplayInstance(date);
        huiTimestampDisplay.format = HuiTimestampDisplayDateFormat.TIME;
        return getRendered(huiTimestampDisplay);
    };

    const getRelativeTime = (date: string | Date, capitalize = false): string => {
        const huiTimestampDisplay = geHuiTimestampDisplayInstance(date);
        huiTimestampDisplay.format = HuiTimestampDisplayDateFormat.RELATIVE;
        huiTimestampDisplay.capitalize = capitalize;
        huiTimestampDisplay._updateRelative();
        return getRendered(huiTimestampDisplay);
    };

    const makeCallbackAsync = (callback: (...args: never[]) => string) => {
        return async (...args: Parameters<typeof callback>): Promise<ReturnType<typeof callback>> => {
            await localeManager.locale;
            return callback(...args);
        };
    };

    const syncMethods = {
        formatDate,
        formatDateTime,
        formatTime,
        getRelativeTime
    };

    const asyncMethods = Object.fromEntries(
        Object.entries(syncMethods).map(([methodName, callback]) => {
            return [
                `${methodName}Async`,
                makeCallbackAsync(callback)
            ];
        })
    ) as MakeAsync<typeof syncMethods>;

    return {
        ...syncMethods,
        ...asyncMethods
    };
};