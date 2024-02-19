import { Page } from '@playwright/test';
import {
    BASE_URL,
    JSON_PATH,
    MAXIMUM_RETRIES
} from './constants';

export const haConfigRequest = async (file: string, retries = 0) => {
    return fetch(
        `${BASE_URL}/api/services/shell_command/copy_sidebar_config`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HA_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                json: file
            })
        }
    ).then((response: Response) => {
        if (response.ok || retries >= MAXIMUM_RETRIES) {
            return response;
        }
        return haConfigRequest(file, retries + 1);
    });
};

export const haSwitchStateRequest = async (state: boolean, retries = 0) => {
    return fetch(
        `${BASE_URL}/api/services/input_boolean/turn_${state ? 'on' : 'off'}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HA_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entity_id: `input_boolean.my_switch`
            })
        }
    ).then((response: Response) => {
        if (response.ok || retries >= MAXIMUM_RETRIES) {
            return response;
        }
        return haSwitchStateRequest(state, retries + 1);
    });
};

export const haSelectStateRequest = async (state: 1 | 2 | 3, retries = 0) => {
    return fetch(
        `${BASE_URL}/api/services/input_select/select_option`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HA_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entity_id: `input_select.fan_speed`,
                option: `${state}`
            })
        }
    ).then((response: Response) => {
        if (response.ok || retries >= MAXIMUM_RETRIES) {
            return response;
        }
        return haSelectStateRequest(state, retries + 1);
    });
};

export const addJsonExtendedRoute = async (page: Page, options: Record<string, unknown>): Promise<void> => {
    await page.route(JSON_PATH, async route => {
        const response = await route.fetch();
        const json = await response.json();
        const jsonExtended = {
            ...json,
            ...options
        };
        await route.fulfill({
            response,
            json: jsonExtended
        });
    });
};

export const fulfillJson = async (page: Page, json: Record<string, unknown>): Promise<void> => {
    await page.route(JSON_PATH, async route => {
        await route.fulfill({ json });
    });
};

export const getSidebarItemSelector = (panel: string): string => {
    return  `paper-listbox > a[data-panel="${panel}"]`;
};

export const getPaperIconSelector = (panel: string): string => {
    const anchorSelector = getSidebarItemSelector(panel);
    return `${anchorSelector} > paper-icon-item`;
};