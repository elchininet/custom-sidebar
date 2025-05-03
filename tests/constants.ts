export const BASE_URL = 'http://host.docker.internal:8123';
export const JSON_PATH = 'local/sidebar-config.json*';

export const HREFS = {
    OVERVIEW: '/lovelace',
    ENERGY: '/energy',
    MAP: '/map',
    LOGBOOK: '/logbook',
    HISTORY: '/history',
    MEDIA_BROWSER: '/media-browser',
    TODO: '/todo',
    DEV_TOOLS: '/developer-tools',
    CONFIG: '/config',
    GOOGLE: 'https://mrdoob.com/projects/chromeexperiments/google-gravity/',
    INTEGRATIONS: '/config/integrations',
    ENTITIES: '/config/entities',
    AUTOMATIONS: '/config/automation',
    HIDDEN: '/hidden'
};

export const SELECTORS = {
    MENU: '.menu',
    TITLE: '.menu .title',
    SIDEBAR_HA_ICON_BUTTON: '.menu ha-icon-button',
    SIDEBAR_EDIT_BUTTON: '.menu mwc-button',
    PROFILE_EDIT_BUTTON: '.content > ha-card ha-settings-row > mwc-button',
    PROFILE_HIDE_SIDEBAR: '.content > ha-card ha-force-narrow-row ha-settings-row > ha-switch',
    NOTIFICATIONS: 'ha-md-list-item.notifications',
    ITEM_NOTIFICATION: 'span.badge',
    ITEM_TEXT: '.item-text',
    PROFILE: 'ha-md-list-item.user',
    HA_SIDEBAR: 'ha-sidebar',
    HUI_VIEW: 'hui-view',
    SIDEBAR_ITEMS_CONTAINER: 'ha-md-list.ha-scrollbar',
    SIDEBAR_ITEM: 'ha-md-list-item',
    TOOLTIP: 'ha-sidebar .tooltip',
    HA_ICON: 'ha-icon',
    PANEL_CONFIG: 'ha-panel-config',
    ENTRY_CONTAINER: '.entry-container',
    HA_LOGBOOK: 'ha-logbook'
};

export const ATTRIBUTES = {
    DISABLED: 'disabled'
};

export const CONFIG_FILES = {
    BASIC: 'basic',
    JS_TEMPLATES: 'js-templates',
    JINJA_TEMPLATES: 'jinja-templates'
};

export const MOBILE_VIEWPORT_SIZE = {
    height: 667,
    width: 375
};

export const SIDEBAR_CLIP = {
    x: 0,
    y: 0,
    width: 255,
    height: 598
};

export const SIDEBAR_CLIP_WITH_DIVIDERS = {
    x: 0,
    y: 0,
    width: 256,
    height: 599
};

export const SIDEBAR_NARROW_CLIP = {
    x: 0,
    y: 0,
    width: 60,
    height: 667
};

export const BASE_NAME = 'base';