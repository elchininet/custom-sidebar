export const NAMESPACE = 'custom-sidebar';
export const CONFIG_PATH = '/local/sidebar-config';
export const MAX_ATTEMPTS = 500;
export const RETRY_DELAY = 50;

export const STRING_TYPE = 'string';
export const UNDEFINED_TYPE = 'undefined';

export enum ELEMENT {
    SIDEBAR = 'ha-sidebar',
    PAPER_LISTBOX = 'paper-listbox',
    PAPER_ICON_ITEM = 'paper-icon-item',
    HA_SVG_ICON = 'ha-svg-icon',
    HA_ICON = 'ha-icon'
}

export enum SELECTOR {
    SCOPE = ':scope',
    TITLE = '.title',
    ITEM = 'a[role="option"]',
    SPACER = '.spacer',
    ITEM_TEXT = '.item-text',
    NOTIFICATION_BADGE = '.notification-badge',
    NOTIFICATIONS_BADGE_COLLAPSED = '.notification-badge-collapsed'
}

export enum CLASS {
    NOTIFICATIONS_BADGE = 'notification-badge',
    NOTIFICATIONS_BADGE_COLLAPSED = 'notification-badge-collapsed'
}

export enum ATTRIBUTE {
    PANEL = 'data-panel',
    ROLE = 'role',
    PROCESSED = 'data-processed',
    WITH_NOTIFICATION = 'data-notification',
    ARIA_SELECTED = 'aria-selected',
    ARIA_DISABLED = 'aria-disabled',
    HREF = 'href',
    STYLE = 'style'
}

export enum EVENT {
    MOUSEDOWN = 'mousedown'
}

export const TEMPLATE_REG = /^\s*\[\[\[([\s\S]+)\]\]\]\s*$/;
export const ENTITIES_REGEXP = /(?:^|\W)(?:states|is_state|state_attr|is_state_attr|has_value)\s*\(\s*['"]\s*([a-z0-9_.]+)\s*['"]|(?:^|\W)states\s*\[\s*["']\s*([a-z0-9_.]+)\s*["']/g;
export const CSS_CLEANER_REGEXP = /(\s*)([\w-]+\s*:\s*[^;]+;?|\})(\s*)/g;
export const DOMAIN_REGEXP = /^([a-z]+)[\w.]*$/;