import{ SidebarMode, DockedSidebar } from '@types';

export const NAMESPACE = 'custom-sidebar';
export const LOCAL_PATH = '/local/';
export const CONFIG_NAME = 'sidebar-config';
export const CONFIG_PATH = `${LOCAL_PATH}${CONFIG_NAME}`;
export const MAX_ATTEMPTS = 100;
export const RETRY_DELAY = 50;
export const FLUSH_PROMISE_DELAY = 1;

export enum TYPE {
    BOOLEAN = 'boolean',
    STRING = 'string',
    UNDEFINED = 'undefined',
    NUMBER = 'number'
}

export const OBJECT_TO_STRING = '[object Object]';

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
    HOST = ':host',
    HOST_EXPANDED = ':host([expanded])',
    SCOPE = ':scope',
    TITLE = '.title',
    ITEM = 'a[role="option"]',
    ITEM_SELECTED = '.iron-selected',
    SPACER = '.spacer',
    ITEM_TEXT = '.item-text',
    NOTIFICATION_BADGE = '.notification-badge',
    NOTIFICATIONS_BADGE_COLLAPSED = '.notification-badge-collapsed',
    CONFIGURATION_BADGE = '.configuration-badge',
    HA_MENU_BUTTON = 'ha-panel-lovelace$ hui-root$ .toolbar > ha-menu-button',
    EDIT_SIDEBAR_BUTTON = 'ha-panel-profile ha-profile-section-general$ ha-settings-row mwc-button',
    SIDEBAR_NOTIFICATIONS = '.notifications',
    PROFILE = '.profile',
    MENU = '.menu',
    DIVIDER = '.divider',
    HA_ICON_BUTTON = 'ha-icon-button'
}

export enum CSS_VARIABLES {
    SIDEBAR_ICON_COLOR = '--sidebar-icon-color',
    SIDEBAR_SELECTED_ICON_COLOR= '--sidebar-selected-icon-color',
    SIDEBAR_TEXT_COLOR = '--sidebar-text-color',
    SIDEBAR_SELECTED_TEXT_COLOR = '--sidebar-selected-text-color',
    SIDEBAR_BACKGROUND_COLOR = '--sidebar-background-color',
    SIDEBAR_TITLE_COLOR = '--sidebar-menu-button-text-color',
    SIDEBAR_BUTTON_COLOR = '--sidebar-icon-color',
    SIDEBAR_MENU_BUTTON_BACKGROUND_COLOR = '--sidebar-menu-button-background-color',
    TEXT_ACCENT_COLOR = '--text-accent-color',
    TEXT_PRIMARY_COLOR = '--text-primary-color',
    PRIMARY_BACKGROUND_COLOR = '--primary-background-color',
    PRIMARY_TEXT_COLOR = '--primary-text-color',
    DIVIDER_COLOR = '--divider-color',
    CUSTOM_SIDEBAR_BACKGROUND = '--custom-sidebar-background',
    CUSTOM_SIDEBAR_MENU_BACKGROUND = '--custom-sidebar-menu-background',
    CUSTOM_SIDEBAR_TITLE_COLOR = '--custom-sidebar-title-color',
    CUSTOM_SIDEBAR_SUBTITLE_COLOR = '--custom-sidebar-subtitle-color',
    CUSTOM_SIDEBAR_BUTTON_COLOR = '--custom-sidebar-button-color',
    CUSTOM_SIDEBAR_TEXT_COLOR = '--custom-sidebar-text-color',
    CUSTOM_SIDEBAR_SELECTED_TEXT_COLOR = '--custom-sidebar-selected-text-color',
    CUSTOM_SIDEBAR_ICON_COLOR = '--custom-sidebar-icon-color',
    CUSTOM_SIDEBAR_SELECTED_ICON_COLOR = '--custom-sidebar-selected-icon-color',
    CUSTOM_SIDEBAR_SELECTION_COLOR = '--custom-sidebar-selection-color',
    CUSTOM_SIDEBAR_INFO_COLOR = '--custom-sidebar-info-color',
    CUSTOM_SIDEBAR_SELECTED_INFO_COLOR = '--custom-sidebar-selected-info-color',
    CUSTOM_SIDEBAR_NOTIFICATION_COLOR = '--custom-sidebar-notification-color',
    CUSTOM_SIDEBAR_NOTIFICATION_TEXT_COLOR = '--custom-sidebar-notification-text-color',
    CUSTOM_SIDEBAR_SELECTION_OPACITY = '--custom-sidebar-selection-opacity',
    CUSTOM_SIDEBAR_DIVIDER_COLOR = '--custom-sidebar-divider-color'
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
    HASS_EDIT_SIDEBAR = 'hass-edit-sidebar',
    RENDER_TEMPLATE = 'render_template'
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

export const CHECK_FOCUSED_SHADOW_ROOT = [
    'HOME-ASSISTANT',
    'HOME-ASSISTANT-MAIN',
    'HA-SIDEBAR'
];

export const SIDEBAR_MODE_TO_DOCKED_SIDEBAR = {
    [SidebarMode.HIDDEN]: DockedSidebar.ALWAYS_HIDDEN,
    [SidebarMode.NARROW]: DockedSidebar.AUTO,
    [SidebarMode.EXTENDED]: DockedSidebar.DOCKED
};

export const PROFILE_PATH = '/profile';
export const PROFILE_GENERAL_PATH = '/profile/general';

export const JS_TEMPLATE_REG = /^\s*\[\[\[([\s\S]+)\]\]\]\s*$/;
export const JINJA_TEMPLATE_REG = /\{\{[\s\S]*\}\}|\{%[\s\S]*%\}/;
export const PARTIAL_REGEXP = /@partial\s+([\w-]+)/g;