import { Page } from '@playwright/test';
import { JSON_PATH, MOBILE_VIEWPORT_SIZE } from './constants';

export const getSidebarItemSelector = (panel: string): string => {
    return  `paper-listbox > a[data-panel="${panel}"]`;
};

export const getPaperIconSelector = (panel: string): string => {
    const anchorSelector = getSidebarItemSelector(panel);
    return `${anchorSelector} > paper-icon-item`;
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

export const changeToMobileViewport = async (page: Page): Promise<void> => {
    await page.setViewportSize(MOBILE_VIEWPORT_SIZE);
};

export const fulfillJson = async (page: Page, json: Record<string, unknown>): Promise<void> => {
    await page.route(JSON_PATH, async route => {
        await route.fulfill({ json });
    });
};