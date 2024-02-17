export const BASE_URL = 'http://host.docker.internal:8123';
export const MAXIMUM_RETRIES = 10;
export const JSON_PATH = 'local/sidebar-config.json*';

const getSidebarItemSelector = (panel: string): string => {
    return  `paper-listbox > a[data-panel="${panel}"]`;
}

const getPaperIconSelector = (panel: string): string => {
    const anchorSelector = getSidebarItemSelector(panel);
    return `${anchorSelector} > paper-icon-item`;
};

export const PANELS = {
    OVERVIEW: 'lovelace',
    ENERGY: 'energy',
    MAP: 'map',
    LOGBOOK: 'logbook',
    HISTORY: 'history',
    MEDIA_BROWSER: 'media-browser',
    TODO: 'todo',
    DEV_TOOLS: 'developer-tools',
    CONFIG: 'config',
    GOOGLE: 'google',
    INTEGRATIONS: 'integrations',
    ENTITIES: 'entities',
    AUTOMATIONS: 'automations',
    HIDDEN: 'hidden'
}

const SIDEBAR_ITEMS = Object.fromEntries(
    Object.entries(PANELS).map(([key, value]) => [
        key,
        getSidebarItemSelector(value)
    ])
);

const SIDEBAR_PAPER_ICON_ITEMS = Object.fromEntries(
    Object.entries(PANELS).map(([key, value]) => [
        key,
        getPaperIconSelector(value)
    ])
);

export const SELECTORS = {
    TITLE: '.menu .title',
    SIDEBAR_HA_ICON_BUTTON: '.menu ha-icon-button',
    SIDEBAR_EDIT_BUTTON: '.menu mwc-button',
    PROFILE_EDIT_BUTTON: '.content > ha-card ha-settings-row > mwc-button',
    NOTIFICATIONS: '.notifications-container .notifications',
    PROFILE: '.profile paper-icon-item',
    HA_SIDEBAR: 'ha-sidebar',
    HUI_VIEW: 'hui-view',
    PAPER_LIST_BOX: 'paper-listbox',
    TOOLTIP: '.tooltip',
    SIDEBAR_ITEMS,
    SIDEBAR_PAPER_ICON_ITEMS
};

export const ATTRIBUTES = {
    DISABLED: 'disabled'
};

export const CONFIG_FILES = {
    BASIC: 'basic',
    JS_TEMPLATES: 'js-templates'
};

export const SIDEBAR_CLIP = {
    x: 0,
    y: 0,
    width: 255,
    height: 598
};