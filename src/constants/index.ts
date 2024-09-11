export const NAMESPACE = 'custom-sidebar';
export const LOCAL_PATH = '/local/';
export const CONFIG_NAME = 'sidebar-config';
export const CONFIG_PATH = `${LOCAL_PATH}${CONFIG_NAME}`;
export const MAX_ATTEMPTS = 100;
export const RETRY_DELAY = 50;

export const BOOLEAN_TYPE = 'boolean';
export const STRING_TYPE = 'string';
export const UNDEFINED_TYPE = 'undefined';

export const BLOCKED_PROPERTY = 'data-blocked';

export enum ELEMENT {
    SIDEBAR = 'ha-sidebar',
    PAPER_LISTBOX = 'paper-listbox',
    PAPER_ICON_ITEM = 'paper-icon-item',
    HA_SVG_ICON = 'ha-svg-icon',
    HA_ICON = 'ha-icon',
    HA_ICON_BUTTON = 'ha-icon-button'
}

export enum SELECTOR {
    SCOPE = ':scope',
    TITLE = '.title',
    ITEM = 'a[role="option"]',
    SPACER = '.spacer',
    ITEM_TEXT = '.item-text',
    NOTIFICATION_BADGE = '.notification-badge',
    NOTIFICATIONS_BADGE_COLLAPSED = '.notification-badge-collapsed',
    EDIT_SIDEBAR_BUTTON_LEGACY = 'ha-panel-profile$ ha-settings-row mwc-button',
    EDIT_SIDEBAR_BUTTON = 'ha-panel-profile ha-profile-section-general$ ha-settings-row mwc-button',
    SIDEBAR_NOTIFICATIONS = '.notifications',
    PROFILE = '.profile',
    MENU = '.menu',
    HA_ICON_BUTTON = 'ha-icon-button'
}

export enum CLASS {
    NOTIFICATIONS_BADGE = 'notification-badge',
    NOTIFICATIONS_BADGE_COLLAPSED = 'notification-badge-collapsed',
    IRON_SELECTED = 'iron-selected'
}

export enum ATTRIBUTE {
    PANEL = 'data-panel',
    ROLE = 'role',
    PROCESSED = 'data-processed',
    WITH_NOTIFICATION = 'data-notification',
    ARIA_SELECTED = 'aria-selected',
    ARIA_DISABLED = 'aria-disabled',
    DISABLED = 'disabled',
    HREF = 'href',
    STYLE = 'style'
}

export enum EVENT {
    MOUSEDOWN = 'mousedown',
    MOUSEENTER = 'mouseenter',
    MOUSELEAVE = 'mouseleave',
    KEYDOWN = 'keydown',
    HASS_EDIT_SIDEBAR = 'hass-edit-sidebar'
}

export enum KEY {
    ARROW_DOWN = 'ArrowDown',
    ARROW_UP = 'ArrowUp',
    ENTER = 'Enter',
    TAB = 'Tab'
}

export enum NODE_NAME {
    PAPER_ICON_ITEM = 'PAPER-ICON-ITEM',
    A = 'A'
}

export enum SUBSCRIBE_TYPE {
    SUBSCRIBE_EVENTS = 'subscribe_events',
    RENDER_TEMPLATE = 'render_template'
}

export const CHECK_FOCUSED_SHADOW_ROOT = [
    'HOME-ASSISTANT',
    'HOME-ASSISTANT-MAIN',
    'HA-SIDEBAR'
];

export const PROFILE_PATH = '/profile';
export const PROFILE_GENERAL_PATH = '/profile/general';

export const JS_TEMPLATE_REG = /^\s*\[\[\[([\s\S]+)\]\]\]\s*$/;
export const JINJA_TEMPLATE_REG = /\{\{[\s\S]*\}\}|\{%[\s\S]*%\}/;
export const CSS_CLEANER_REGEXP = /(\s*)([\w-]+\s*:\s*[^;]+;?|\})(\s*)/g;
export const DOMAIN_REGEXP = /^([a-z_]+)[\w.]*$/;