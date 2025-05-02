import { Page, Locator } from '@playwright/test';
import { SELECTORS, HREFS } from './constants';

export const getSidebarLinkSelector = (href: string): string => {
    return `${SELECTORS.HA_SIDEBAR} a[role="listitem"][href="${href}"]`;
};

export const getSidebarItem = (page: Page, href: string) => {
    const items = page.locator(`${SELECTORS.HA_SIDEBAR} ${SELECTORS.SIDEBAR_ITEMS_CONTAINER} ${SELECTORS.SIDEBAR_ITEM}`);
    return items.filter({
        has: page.locator(`a[role="listitem"][href="${href}"]`)
    });
};

export const getSidebarItemLinkFromLocator = (item: Locator) => item.locator('a[role="listitem"]');

export const links = Object.fromEntries(
    Object.entries(HREFS).map(([key, href]) => {
        return [key, getSidebarLinkSelector(href)];
    })
) as Record<keyof typeof HREFS, string>;