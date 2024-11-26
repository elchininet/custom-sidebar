import { Browser, Page } from '@playwright/test';
import { expect } from 'playwright-test-coverage';
import { SELECTORS } from './selectors';

interface Context {
    id: string;
    user_id: string;
}

interface HomeAssistant extends HTMLElement {
    hass: {
        callService: (domain: string, service: string, data: Record<string, unknown>) => Promise<Context>;
    };
}

export const haConfigRequest = async (browser: Browser, file: string) => {
    const page = await browser.newPage();
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await page.evaluate(async (file: string) => {
        const homeAssistant = document.querySelector('home-assistant') as HomeAssistant;
        await homeAssistant.hass.callService(
            'shell_command',
            'copy_sidebar_config',
            {
                json: file
            }
        );
    }, file);
    page.close();
};

export const haSwitchStateRequest = async (page: Page, state: boolean) => {
    await page.evaluate(async (state: boolean) => {
        const homeAssistant = document.querySelector('home-assistant') as HomeAssistant;
        await homeAssistant.hass.callService(
            'input_boolean',
            `turn_${state ? 'on' : 'off'}`,
            {
                entity_id: 'input_boolean.my_switch'
            }
        );
    }, state);
};

export const haSelectStateRequest = async (page: Page, state: 1 | 2 | 3) => {
    await page.evaluate(async (state: number) => {
        const homeAssistant = document.querySelector('home-assistant') as HomeAssistant;
        await homeAssistant.hass.callService(
            'input_select',
            'select_option',
            {
                entity_id: 'input_select.fan_speed',
                option: `${state}`
            }
        );
    }, state);
};