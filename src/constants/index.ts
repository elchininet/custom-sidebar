import{
    DockedSidebar,
    ItemColorConfigKeys,
    SidebarColorConfigKeys,
    SidebarMode,
    SidebarStringConfigKeys
} from '@types';

export * from './global';
export const LOCAL_PATH = '/local/';
export const CONFIG_NAME = 'sidebar-config';
export const CONFIG_PATH = `${LOCAL_PATH}${CONFIG_NAME}`;
export const BASE_NAME = 'base';
export const DEBUG_URL_PARAMETER = 'cs_debug';
export const LOGBOOK_DELAY = 500;

export enum TYPE {
    BOOLEAN = 'boolean',
    STRING = 'string',
    UNDEFINED = 'undefined',
    NUMBER = 'number'
}

export const OBJECT_TO_STRING = '[object Object]';
export const REGEXP_TO_STRING = '[object RegExp]';

export enum ELEMENT {
    ANCHOR = 'a',
    BUTTON = 'button',
    SPAN = 'span'
}

export enum CUSTOM_ELEMENT {
    DIALOG_BOX = 'dialog-box',
    DIALOG_RESTART = 'dialog-restart',
    HA_PANEL_CONFIG = 'ha-panel-config',
    HA_CONFIG_BACKUP = 'ha-config-backup',
    HA_CONFIG_BACKUP_BACKUPS = 'ha-config-backup-backups',
    HA_CONFIG_SYSTEM_NAVIGATION = 'ha-config-system-navigation',
    HA_ICON = 'ha-icon',
    HA_ICON_BUTTON = 'ha-icon-button',
    HA_PANEL_LOVELACE = 'ha-panel-lovelace',
    HA_RIPPLE = 'ha-ripple',
    HA_SVG_ICON = 'ha-svg-icon',
    HUI_ROOT = 'hui-root',
    HUI_TIMESTAMP_DISPLAY = 'hui-timestamp-display',
    HUI_VIEW = 'hui-view',
    HUI_VIEW_CONTAINER = 'hui-view-container',
    ITEM = 'ha-md-list-item',
    USER_BADGE = 'ha-user-badge',
}

export enum SELECTOR {
    HOST = ':host',
    HOST_EXPANDED = ':host([expanded])',
    HOST_NOT_EXPANDED = ':host(:not([expanded]))',
    HOST_EXPANDED_NOT_MODAL = ':host([expanded]:not([modal]))',
    HOST_EXPANDED_NOT_NAROW = ':host([expanded]:not([narrow]))',
    SIDEBAR_LOADER = 'ha-fade-in',
    SIDEBAR_TOP_ITEMS_CONTAINER = '.panels-list > .wrapper > ha-md-list',
    SIDEBAR_BOTTOM_ITEMS_CONTAINER = '.panels-list > ha-md-list',
    SCOPE = ':scope',
    TITLE = '.title',
    ITEM_SELECTED = '.selected',
    ITEM_HOVER = 'ha-md-list-item:hover',
    SURFACE = '.surface',
    SURFACE_HOVERED = '.surface.hovered',
    ITEM_TEXT = '.item-text',
    BADGE = '.badge',
    CONFIGURATION = '.configuration',
    HUI_ROOT = 'ha-panel-lovelace$ hui-root',
    HA_MENU_BUTTON = '.header .toolbar > ha-menu-button',
    EDIT_SIDEBAR_BUTTON = 'ha-panel-profile ha-profile-section-general$ ha-settings-row ha-button',
    SIDEBAR_NOTIFICATIONS_CONTAINER = '.notifications-container',
    SIDEBAR_NOTIFICATIONS_CONTAINER_HOVER = '.notifications-container:hover',
    SIDEBAR_NOTIFICATIONS = '.notifications',
    MENU = '.menu',
    MC_DRAWER = '.mdc-drawer',
    MC_DRAWER_MODAL = '.mdc-drawer.mdc-drawer--modal',
    MC_DRAWER_OPEN_FIX = '.mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content',
    DATA_INFO = '[data-info]'
}

export enum PSEUDO_SELECTOR {
    AFTER = '::after',
    BEFORE = '::before',
    WEBKIT_SCROLLBAR_THUMB = '::-webkit-scrollbar-thumb'
}

export enum CLASS {
    BADGE = 'badge',
    ITEM_SELECTED = 'selected',
    ITEM_TEXT = 'item-text',
    USER = 'user',
}

export enum ATTRIBUTE {
    BLOCKED = 'data-blocked',
    CUSTOM_SIDEBAR_ATTRIBUTES = 'data-custom-sidebar-attrs',
    DISABLED = 'disabled',
    EMPTY = 'data-empty',
    HREF = 'href',
    ICON = 'icon',
    PROCESSED = 'data-processed',
    ROLE = 'role',
    SLOT = 'slot',
    TAB_INDEX = 'tabindex',
    TYPE = 'type',
    WITH_DIVIDER = 'data-divider',
    WITH_NOTIFICATION = 'data-notification',
}

export enum ATTRIBUTE_VALUE {
    EMPTY = '',
    END = 'end',
    FALSE = 'false',
    HEADLINE = 'headline',
    LINK = 'link',
    START = 'start',
    TRUE = 'true'
}

export enum EVENT {
    CHANGE = 'change',
    CLICK = 'click',
    MOUSEENTER = 'mouseenter',
    MOUSELEAVE = 'mouseleave',
    KEYDOWN = 'keydown',
    RENDER_TEMPLATE = 'render_template',
    LOCATION_CHANGED = 'location-changed',
    HASS_MORE_INFO = 'hass-more-info',
    SHOW_DIALOG = 'show-dialog'
}

export enum KEY {
    ARROW_DOWN = 'ArrowDown',
    ARROW_UP = 'ArrowUp',
    ENTER = 'Enter',
    TAB = 'Tab'
}

export enum NODE_NAME {
    ITEM = 'HA-MD-LIST-ITEM',
    A = 'A'
}

export const CHECK_FOCUSED_SHADOW_ROOT = [
    'HOME-ASSISTANT',
    'HOME-ASSISTANT-MAIN',
    'HA-SIDEBAR'
];

export enum HA_CSS_VARIABLES {
    SIDEBAR_BACKGROUND_COLOR = '--sidebar-background-color',
    SIDEBAR_TITLE_COLOR = '--sidebar-menu-button-text-color',
    SIDEBAR_BUTTON_COLOR = '--sidebar-icon-color',
    SIDEBAR_MENU_BUTTON_BACKGROUND_COLOR = '--sidebar-menu-button-background-color',
    SIDEBAR_ICON_COLOR = '--sidebar-icon-color',
    SIDEBAR_SELECTED_ICON_COLOR = '--sidebar-selected-icon-color',
    SIDEBAR_TEXT_COLOR = '--sidebar-text-color',
    SIDEBAR_SELECTED_TEXT_COLOR = '--sidebar-selected-text-color',
    MD_RIPPLE_HOVER_COLOR = '--md-ripple-hover-color',
    MD_RIPPLE_HOVER_OPACITY = '--md-ripple-hover-opacity',
    MD_SYS_COLOR_ON_SURFACE = '--md-sys-color-on-surface',
    MDC_DRAWER_WIDTH = '--mdc-drawer-width',
    ACCENT_COLOR = '--accent-color',
    TEXT_ACCENT_COLOR = '--text-accent-color',
    TEXT_PRIMARY_COLOR = '--text-primary-color',
    PRIMARY_TEXT_COLOR = '--primary-text-color',
    DIVIDER_COLOR = '--divider-color',
    DIVIDER_OPACITY = '--dark-divider-opacity',
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
    SCROLLBAR_THUMB_COLOR = '--custom-sidebar-scrollbar-thumb-color',
    ITEM_BACKGROUND = '--custom-sidebar-item-background',
    ITEM_BACKGROUND_HOVER = '--custom-sidebar-item-background-hover',
    ITEM_BACKGROUND_HOVER_OPACITY = '--custom-sidebar-item-background-hover-opacity',
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
    NOTIFICATION_TEXT_COLOR_HOVER = '--custom-sidebar-notification-text-color-hover',
    WIDTH = '--custom-sidebar-width',
    WIDTH_EXTENDED = '--custom-sidebar-width-extended',
    WIDTH_HIDDEN = '--custom-sidebar-width-hidden'
}

export const ITEM_TEMPLATE_COLOR_CONFIG_OPTIONS: ItemColorConfigKeys[] = [
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
    'notification_text_color_hover',
    'divider_color'
];

export const ITEM_TEMPLATE_NUMBER_CONFIG_OPTIONS: ItemColorConfigKeys[] = [
    'selection_opacity',
    'item_background_hover_opacity'
];

export const ITEM_STRING_CONFIG_OPTIONS: SidebarStringConfigKeys[] = [
    'default_path'
];

export const ITEM_OPTIONS_VARIABLES_MAP: [ItemColorConfigKeys, string][] = [
    ['item_background',                  CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND],
    ['item_background_hover',            CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND_HOVER],
    ['item_background_hover_opacity',    CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND_HOVER_OPACITY],
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
    ['notification_text_color_hover',    CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR_HOVER],
    ['divider_color',                    CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_COLOR]
];

export const SIDEBAR_OPTIONS_VARIABLES_MAP: [SidebarColorConfigKeys, string][] = [
    ['title_color',                      CUSTOM_SIDEBAR_CSS_VARIABLES.TITLE_COLOR],
    ['subtitle_color',                   CUSTOM_SIDEBAR_CSS_VARIABLES.SUBTITLE_COLOR],
    ['sidebar_button_color',             CUSTOM_SIDEBAR_CSS_VARIABLES.BUTTON_COLOR],
    ['sidebar_background',               CUSTOM_SIDEBAR_CSS_VARIABLES.BACKGROUND],
    ['menu_background',                  CUSTOM_SIDEBAR_CSS_VARIABLES.MENU_BACKGROUND],
    ['scrollbar_thumb_color',            CUSTOM_SIDEBAR_CSS_VARIABLES.SCROLLBAR_THUMB_COLOR],
    ...ITEM_OPTIONS_VARIABLES_MAP
];

export const SIDEBAR_BORDER_COLOR_VARIABLES_MAP: [SidebarColorConfigKeys, string][] = [
    ['sidebar_border_color', CUSTOM_SIDEBAR_CSS_VARIABLES.BORDER_COLOR]
];

export const ENDPOINTS = {
    CHECK_CONFIG: 'config/core/check_config',
    TEMPLATE: 'template',
    SERVICES: 'services'
};

export const SIDEBAR_MODE_TO_DOCKED_SIDEBAR = {
    [SidebarMode.HIDDEN]: DockedSidebar.ALWAYS_HIDDEN,
    [SidebarMode.NARROW]: DockedSidebar.AUTO,
    [SidebarMode.EXTENDED]: DockedSidebar.DOCKED
};

export const ALLOWED_UNITS = ['%', 'em', 'ex', 'px', 'rem', 'vh', 'vmax', 'vmin', 'vw'];

export const PROFILE_GENERAL_PATH_REGEXP = /\/profile(\/general)?$/;

export const JS_TEMPLATE_REG = /^\s*\[\[\[([\s\S]+)\]\]\]\s*$/;
export const JINJA_TEMPLATE_REG = /\{\{[\s\S]*\}\}|\{%[\s\S]*%\}/;
export const PARTIAL_REGEXP = /@partial\s+([\w-]+)/g;
export const DOMAIN_ENTITY_REGEXP = /^\s*([a-z_]+)\.([\w-]+)\s*$/;