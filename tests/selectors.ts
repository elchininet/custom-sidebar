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

export const getSidebarItemText = (page: Page, href: string) => {
    const sidebarItem = getSidebarItem(page, href);
    const sidebarItemText = sidebarItem.locator(SELECTORS.ITEM_TEXT);
    return sidebarItemText;
};

export const getSidebarItemBadge = (page: Page, href: string) => {
    const sidebarItem = getSidebarItem(page, href);
    const sidebarItemBadge = sidebarItem.locator(SELECTORS.ITEM_NOTIFICATION);
    return sidebarItemBadge;
};

export const getSidebarItemLinkFromLocator = (item: Locator) => item.locator('a[role="listitem"]');

export const links = Object.fromEntries(
    Object.entries(HREFS).map(([key, href]) => {
        return [key, getSidebarLinkSelector(href)];
    })
) as Record<keyof typeof HREFS, string>;