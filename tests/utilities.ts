import {
    ConsoleMessage,
    Page,
    PlaywrightTestArgs
} from '@playwright/test';
import { expect } from 'playwright-test-coverage';
import {
    JSON_PATH,
    MOBILE_VIEWPORT_SIZE,
    SELECTORS
} from './constants';

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

export const changeToMobileViewport = async (page: Page): Promise<void> => {
    await page.setViewportSize(MOBILE_VIEWPORT_SIZE);
};

export const waitForMainElements = async (page: Page, includeSidebar = true): Promise<void> => {
    await expect(page.locator(SELECTORS.LAUNCH_SCREEN)).not.toBeInViewport({ timeout: 30000 });
    await expect(page.locator(SELECTORS.HOME_ASSISTANT)).toBeVisible();
    await expect(page.locator(SELECTORS.HOME_ASSISTANT_MAIN)).toBeVisible();
    await expect(page.locator(SELECTORS.HA_DRAWER)).toBeVisible();
    if (includeSidebar) {
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    } else {
        await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toBeVisible();
    }
};

export const navigateHome = async (page: Page, includeSidebar = true): Promise<void> => {
    await page.goto('/');
    await page.waitForURL(/.*\/lovelace/);
    await waitForMainElements(page, includeSidebar);
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

export const navigateToProfile = async (page: Page): Promise<void> => {
    await page.goto('/profile');
    await page.waitForURL(/.*\/profile\/general$/);
    await waitForMainElements(page);
    await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).toBeVisible();
};

export const getSidebarWidth = async (page: Page): Promise<number> => {
    const sidebar = page.locator(SELECTORS.HA_SIDEBAR);
    const sidebarWidth = await sidebar.evaluate((element: HTMLElement) => element.offsetWidth);
    return sidebarWidth + 1;
};

export const waithForError = async (page: Page, errorMessage: string): Promise<void> => {
    return new Promise<void>((resolve) => {
        const listener = (error: Error): void => {
            if (error.message.includes(errorMessage)) {
                page.off('pageerror', listener);
                resolve();
            }
        };
        page.on('pageerror', listener);
    });
};

export const waitForErrors = async (page: Page, timeoutDelay = 1000): Promise<string[]> => {
    return new Promise((resolve) => {
        let timeout: NodeJS.Timeout | undefined = undefined;
        const errors: string[] = [];
        const resolvePromise = (): void => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                page.off('pageerror', listener);
                resolve(errors);
            }, timeoutDelay);
        };
        const listener = (error: Error): void => {
            errors.push(error.message);
            resolvePromise();
        };
        page.on('pageerror', listener);
        resolvePromise();
    });
};

export const waitForWarning = async (page: Page, warningMessage: string): Promise<void> => {
    return new Promise<void>((resolve) => {
        const listener = (message: ConsoleMessage): void => {
            if (
                message.type() === 'warning' &&
                message.text().includes(warningMessage)
            ) {
                page.off('console', listener);
                resolve();
            }
        };
        page.on('console', listener);
    });
};

export const waitForWarnings = async (page: Page): Promise<string[]> => {
    return new Promise((resolve) => {
        let timeout: NodeJS.Timeout | undefined = undefined;
        const warnings: string[] = [];
        const resolvePromise = (): void => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                page.off('console', listener);
                resolve(warnings);
            }, 1000);
        };
        const listener = (message: ConsoleMessage): void => {
            if (message.type() === 'warning') {
                warnings.push(message.text());
                resolvePromise();
            }
        };
        page.on('console', listener);
        resolvePromise();
    });
};

export const waitForLogMessage = async (page: Page, logMessage: string): Promise<void> => {
    return new Promise<void>((resolve) => {
        const listener = (message: ConsoleMessage): void => {
            if (
                message.type() === 'log' &&
                message.text().includes(logMessage)
            ) {
                page.off('console', listener);
                resolve();
            }
        };
        page.on('console', listener);
    });
};

export const waitForLogMessages = async (page: Page): Promise<string[]> => {
    return new Promise((resolve) => {
        let timeout: NodeJS.Timeout | undefined = undefined;
        const logs: string[] = [];
        const resolvePromise = (): void => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                page.off('console', listener);
                resolve(logs);
            }, 1000);
        };
        const listener = (message: ConsoleMessage): void => {
            if (['log', 'startGroup', 'endGroup'].includes(message.type())) {
                logs.push(message.text());
                resolvePromise();
            }
        };
        page.on('console', listener);
        resolvePromise();
    });
};

export const noCacheRoute = async ({ page }: PlaywrightTestArgs): Promise<void> => {
    await page.route('**', route => route.continue());
};