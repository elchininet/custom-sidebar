export const BASE_URL = 'http://host.docker.internal:8123';
export const JSON_PATH = 'local/sidebar-config.json*';

export const HREFS = {
    OVERVIEW: '/lovelace',
    ENERGY: '/energy',
    MAP: '/map',
    ACTIVITY: '/logbook',
    HISTORY: '/history',
    MEDIA_BROWSER: '/media-browser',
    TODO: '/todo',
    DEV_TOOLS: '/config/developer-tools',
    CONFIG: '/config',
    GOOGLE: 'https://mrdoob.com/projects/chromeexperiments/google-gravity/',
    INTEGRATIONS: '/config/integrations',
    ENTITIES: '/config/entities',
    AUTOMATIONS: '/config/automation',
    HIDDEN: '/hidden'
};

export const SELECTORS = {
    LAUNCH_SCREEN: '#ha-launch-screen',
    MENU: '.menu',
    TITLE: '.menu .title',
    SIDEBAR_HA_ICON_BUTTON: '.menu ha-icon-button',
    HA_MENU_BUTTON: '.header ha-menu-button ha-icon-button',
    SIDEBAR_EDIT_MODAL: 'dialog-edit-sidebar ha-wa-dialog[header-title="Edit sidebar"] ha-dialog-header',
    PROFILE_EDIT_BUTTON: '.content > ha-card ha-settings-row > ha-button',
    PROFILE_HIDE_SIDEBAR: '.content > ha-card ha-force-narrow-row ha-settings-row > ha-switch',
    NOTIFICATIONS: 'ha-md-list-item.notifications',
    NOTIFICATIONS_DRAWER: 'notification-drawer',
    DISMISS_NOTIFICATION_ITEM: 'notification-item ha-button[slot="actions"] button',
    CLOSE_NOTIFICATIONS_DRAWER: 'ha-icon-button-prev',
    ITEM_NOTIFICATION: 'span.badge',
    ITEM_TEXT: '.item-text',
    PROFILE: 'ha-md-list-item.user',
    HOME_ASSISTANT: 'home-assistant',
    HOME_ASSISTANT_MAIN: 'home-assistant-main',
    HA_DRAWER: 'ha-drawer',
    HA_SIDEBAR: 'ha-sidebar',
    HUI_VIEW: 'hui-view',
    SIDEBAR_TOP_ITEMS_CONTAINER: '.panels-list > .wrapper > ha-md-list',
    SIDEBAR_BOTTOM_ITEMS_CONTAINER: '.panels-list > ha-md-list',
    SIDEBAR_ITEM: 'ha-md-list-item',
    TOOLTIP: 'ha-sidebar .tooltip',
    HA_ICON: 'ha-icon',
    PANEL_CONFIG: 'ha-panel-config',
    ENTRY_CONTAINER: '.entry-container',
    HA_LOGBOOK: 'ha-logbook',
    RESTART_RIALOG: 'dialog-restart ha-adaptive-dialog .content',
    RESTART_RIALOG_TITLE: 'dialog-restart ha-dialog-header span[slot="title"]',
    RESTART_DIALOG_CLOSE_BUTTON: 'dialog-restart ha-adaptive-dialog slot[slot="headerNavigationIcon"] ha-icon-button',
    DEVELOPER_TOOLS_PANEL: 'ha-panel-developer-tools',
    TODO_PANEL: 'ha-panel-todo'
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
    height: 720
};

export const SIDEBAR_CLIP_WITH_DIVIDERS = {
    x: 0,
    y: 0,
    width: 256,
    height: 720
};

export const SIDEBAR_NARROW_CLIP = {
    x: 0,
    y: 0,
    width: 60,
    height: 667
};

export const BASE_NAME = 'base';