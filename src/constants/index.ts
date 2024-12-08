import{
    ItemColorConfigKeys,
    SidebarColorConfigKeys,
    SidebarMode,
    DockedSidebar
} from '@types';

export const NAMESPACE = 'custom-sidebar';
export const LOCAL_PATH = '/local/';
export const CONFIG_NAME = 'sidebar-config';
export const CONFIG_PATH = `${LOCAL_PATH}${CONFIG_NAME}`;
export const MAX_ATTEMPTS = 100;
export const RETRY_DELAY = 50;
export const FLUSH_PROMISE_DELAY = 1;
export const BASE_NAME = 'base';

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
    ITEM_HOVER = 'a[role="option"]:hover',
    SPACER = '.spacer',
    ITEM_TEXT = '.item-text',
    NOTIFICATION_BADGE = '.notification-badge',
    NOTIFICATIONS_BADGE_COLLAPSED = '.notification-badge-collapsed',
    CONFIGURATION_BADGE = '.configuration-badge',
    HA_MENU_BUTTON = 'ha-panel-lovelace$ hui-root$ .toolbar > ha-menu-button',
    EDIT_SIDEBAR_BUTTON = 'ha-panel-profile ha-profile-section-general$ ha-settings-row mwc-button',
    SIDEBAR_NOTIFICATIONS_CONTAINER = '.notifications-container',
    SIDEBAR_NOTIFICATIONS_CONTAINER_HOVER = '.notifications-container:hover',
    SIDEBAR_NOTIFICATIONS = '.notifications',
    PROFILE = '.profile',
    MENU = '.menu',
    DIVIDER = '.divider',
    MC_DRAWER = '.mdc-drawer',
    HA_SCROLLBAR = '.ha-scrollbar',
    DATA_INFO = '[data-info]'
}

export enum PSEUDO_SELECTOR {
    AFTER = '::after',
    BEFORE = '::before',
    WEBKIT_SCROLLBAR_THUMB = '::-webkit-scrollbar-thumb'
}

export enum HA_CSS_VARIABLES {
    PRIMARY_BACKGROUND_COLOR = '--primary-background-color',
    SIDEBAR_BACKGROUND_COLOR = '--sidebar-background-color',
    SIDEBAR_TITLE_COLOR = '--sidebar-menu-button-text-color',
    SIDEBAR_BUTTON_COLOR = '--sidebar-icon-color',
    SIDEBAR_MENU_BUTTON_BACKGROUND_COLOR = '--sidebar-menu-button-background-color',

    SIDEBAR_ICON_COLOR = '--sidebar-icon-color',
    SIDEBAR_SELECTED_ICON_COLOR= '--sidebar-selected-icon-color',
    SIDEBAR_TEXT_COLOR = '--sidebar-text-color',
    SIDEBAR_SELECTED_TEXT_COLOR = '--sidebar-selected-text-color',
    ACCENT_COLOR = '--accent-color',
    TEXT_ACCENT_COLOR = '--text-accent-color',
    TEXT_PRIMARY_COLOR = '--text-primary-color',
    PRIMARY_TEXT_COLOR = '--primary-text-color',
    DIVIDER_COLOR = '--divider-color',
    SCROLLBAR_THUMB_COLOR = '--scrollbar-thumb-color'
}

export enum CUSTOM_SIDEBAR_CSS_VARIABLES {
    BACKGROUND = '--custom-sidebar-background',
    BORDER_COLOR = '--custom-sidebar-border-color',
    MENU_BACKGROUND = '--custom-sidebar-menu-background',
    TITLE_COLOR = '--custom-sidebar-title-color',
    SUBTITLE_COLOR = '--custom-sidebar-subtitle-color',
    BUTTON_COLOR = '--custom-sidebar-button-color',
    DIVIDER_COLOR = '--custom-sidebar-divider-color',
    DIVIDER_TOP_COLOR = '--custom-sidebar-divider-top-color',
    DIVIDER_BOTTOM_COLOR = '--custom-sidebar-divider-bottom-color',
    SCROLLBAR_THUMB_COLOR = '--custom-sidebar-scrollbar-thumb-color',

    ITEM_BACKGROUND = '--custom-sidebar-item-background',
    ITEM_BACKGROUND_HOVER = '--custom-sidebar-item-background-hover',
    ICON_COLOR = '--custom-sidebar-icon-color',
    ICON_COLOR_SELECTED = '--custom-sidebar-icon-color-selected',
    ICON_COLOR_HOVER = '--custom-sidebar-icon-color-hover',
    TEXT_COLOR = '--custom-sidebar-text-color',
    TEXT_COLOR_SELECTED = '--custom-sidebar-text-color-selected',
    TEXT_COLOR_HOVER = '--custom-sidebar-text-color-hover',
    SELECTION_BACKGROUND = '--custom-sidebar-selection-background',
    SELECTION_OPACITY = '--custom-sidebar-selection-opacity',
    INFO_COLOR = '--custom-sidebar-info-color',
    INFO_COLOR_SELECTED = '--custom-sidebar-info-color-selected',
    INFO_COLOR_HOVER = '--custom-sidebar-info-color-hover',
    NOTIFICATION_COLOR = '--custom-sidebar-notification-color',
    NOTIFICATION_COLOR_SELECTED = '--custom-sidebar-notification-color-selected',
    NOTIFICATION_COLOR_HOVER = '--custom-sidebar-notification-color-hover',
    NOTIFICATION_TEXT_COLOR = '--custom-sidebar-notification-text-color',
    NOTIFICATION_TEXT_COLOR_SELECTED = '--custom-sidebar-notification-text-color-selected',
    NOTIFICATION_TEXT_COLOR_HOVER = '--custom-sidebar-notification-text-color-hover'
}

export const ITEM_TEMPLATE_STRING_OPTIONS: ItemColorConfigKeys[] = [
    'item_background',
    'item_background_hover',
    'icon_color',
    'icon_color_selected',
    'icon_color_hover',
    'text_color',
    'text_color_selected',
    'text_color_hover',
    'selection_background',
    'info_color',
    'info_color_selected',
    'info_color_hover',
    'notification_color',
    'notification_color_selected',
    'notification_color_hover',
    'notification_text_color',
    'notification_text_color_selected',
    'notification_text_color_hover'
];

export const ITEM_TEMPLATE_NUMBER_OPTIONS: ItemColorConfigKeys[] = [
    'selection_opacity'
];

export const ITEM_OPTIONS_VARIABLES_MAP: [ItemColorConfigKeys, string][] = [
    ['item_background',                  CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND],
    ['item_background_hover',            CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND_HOVER],
    ['icon_color',                       CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR],
    ['icon_color_selected',              CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR_SELECTED],
    ['icon_color_hover',                 CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR_HOVER],
    ['text_color',                       CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR],
    ['text_color_selected',              CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR_SELECTED],
    ['text_color_hover',                 CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR_HOVER],
    ['selection_background',             CUSTOM_SIDEBAR_CSS_VARIABLES.SELECTION_BACKGROUND],
    ['selection_opacity',                CUSTOM_SIDEBAR_CSS_VARIABLES.SELECTION_OPACITY],
    ['info_color',                       CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR],
    ['info_color_selected',              CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR_SELECTED],
    ['info_color_hover',                 CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR_HOVER],
    ['notification_color',               CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_COLOR],
    ['notification_color_selected',      CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_COLOR_SELECTED],
    ['notification_color_hover',         CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_COLOR_HOVER],
    ['notification_text_color',          CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR],
    ['notification_text_color_selected', CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR_SELECTED],
    ['notification_text_color_hover',    CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR_HOVER]
];

export const SIDEBAR_OPTIONS_VARIABLES_MAP: [SidebarColorConfigKeys, string][] = [
    ['title_color',                      CUSTOM_SIDEBAR_CSS_VARIABLES.TITLE_COLOR],
    ['subtitle_color',                   CUSTOM_SIDEBAR_CSS_VARIABLES.SUBTITLE_COLOR],
    ['sidebar_button_color',             CUSTOM_SIDEBAR_CSS_VARIABLES.BUTTON_COLOR],
    ['sidebar_background',               CUSTOM_SIDEBAR_CSS_VARIABLES.BACKGROUND],
    ['menu_background',                  CUSTOM_SIDEBAR_CSS_VARIABLES.MENU_BACKGROUND],
    ['scrollbar_thumb_color',            CUSTOM_SIDEBAR_CSS_VARIABLES.SCROLLBAR_THUMB_COLOR],
    ['divider_color',                    CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_COLOR],
    ['divider_top_color',                CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_TOP_COLOR],
    ['divider_bottom_color',             CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_BOTTOM_COLOR],
    ...ITEM_OPTIONS_VARIABLES_MAP
];

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