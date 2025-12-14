import {
    HomeAsssistantExtended,
    HuiTimestampDisplay,
    HuiTimestampDisplayDateFormat
} from '@types';
import { CUSTOM_ELEMENT } from '@constants';

export const getFormatDateMethods = (ha: HomeAsssistantExtended) => {
    const geHuiTimestampDisplayInstance = (date: string | Date): HuiTimestampDisplay => {
        const huiTimestampDisplay = document.createElement(CUSTOM_ELEMENT.HUI_TIMESTAMP_DISPLAY) as HuiTimestampDisplay;
        huiTimestampDisplay.hass = ha.hass;
        huiTimestampDisplay.ts = date instanceof Date
            ? date
            : new Date(date);
        return huiTimestampDisplay;
    };
    const getRendered = (huiTimestampDisplay: HuiTimestampDisplay): string => {
        const result =  huiTimestampDisplay.render();
        return result.values.join('');
    };
    return {
        formatDate: (date: string | Date): string => {
            const huiTimestampDisplay = geHuiTimestampDisplayInstance(date);
            huiTimestampDisplay.format = HuiTimestampDisplayDateFormat.DATE;
            return getRendered(huiTimestampDisplay);
        },
        formatDateTime: (date: string | Date): string => {
            const huiTimestampDisplay = geHuiTimestampDisplayInstance(date);
            huiTimestampDisplay.format = HuiTimestampDisplayDateFormat.DATETIME;
            return getRendered(huiTimestampDisplay);
        },
        formatTime: (time: string | Date): string => {
            const date = /^\d+:\d+(:\d+)?$/.test(time.toString())
                ? `1900-01-01T${time}`
                : time;
            const huiTimestampDisplay = geHuiTimestampDisplayInstance(date);
            huiTimestampDisplay.format = HuiTimestampDisplayDateFormat.TIME;
            return getRendered(huiTimestampDisplay);
        },
        getRelativeTime: (date: string | Date, capitalize = false): string => {
            const huiTimestampDisplay = geHuiTimestampDisplayInstance(date);
            huiTimestampDisplay.format = HuiTimestampDisplayDateFormat.RELATIVE;
            huiTimestampDisplay.capitalize = capitalize;
            huiTimestampDisplay._updateRelative();
            return getRendered(huiTimestampDisplay);
        }
    };
};