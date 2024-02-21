export const BASE_URL = 'http://host.docker.internal:8123';
export const MAXIMUM_RETRIES = 10;
export const JSON_PATH = 'local/sidebar-config.json*';

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
};

export const ATTRIBUTES = {
    DISABLED: 'disabled'
};

export const CONFIG_FILES = {
    BASIC: 'basic',
    JS_TEMPLATES: 'js-templates',
    JINJA_TEMPLATES: 'jinja-templates'
};

export const SIDEBAR_CLIP = {
    x: 0,
    y: 0,
    width: 255,
    height: 598
};