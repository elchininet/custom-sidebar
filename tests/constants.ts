export const BASE_URL = 'http://host.docker.internal:8123';
export const MAXIMUM_RETRIES = 10;
export const JSON_PATH = 'local/sidebar-config.json*';

const getSidebarItemSelector = (panel: string): string => {
    return  `paper-listbox > a[data-panel="${panel}"]`;
}

export const SELECTORS = {
    TITLE: '.menu .title',
    HA_SIDEBAR: 'ha-sidebar',
    HUI_VIEW: 'hui-view',
    PAPER_LIST_BOX: 'paper-listbox',
    SIDEBAR_ITEMS: {
        OVERVIEW: getSidebarItemSelector('lovelace'),
        ENERGY: getSidebarItemSelector('energy'),
        MAP: getSidebarItemSelector('map'),
        LOGBOOK: getSidebarItemSelector('logbook'),
        HISTORY: getSidebarItemSelector('history'),
        MEDIA_BROWSER: getSidebarItemSelector('media-browser'),
        TODO: getSidebarItemSelector('todo'),
        DEV_TOOLS: getSidebarItemSelector('developer-tools'),
        CONFIG: getSidebarItemSelector('config'),
        GOOGLE: getSidebarItemSelector('google'),
        INTEGRATIONS: getSidebarItemSelector('integrations'),
        ENTITIES: getSidebarItemSelector('entities'),
        AUTOMATIONS: getSidebarItemSelector('automations'),
        HIDDEN: getSidebarItemSelector('hidden')
    }
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