export const NAMESPACE = 'custom-sidebar';
export const CONFIG_PATH = '/local/sidebar-order';
export const MAX_ATTEMPTS = 500;
export const RETRY_DELAY = 50;

export const STRING_TYPE = 'string';
export const UNDEFINED_TYPE = 'undefined';

export enum ELEMENT {
    SIDEBAR = 'ha-sidebar',
    PAPER_LISTBOX = 'paper-listbox',
    HA_SVG_ICON = 'ha-svg-icon',
    HA_ICON = 'ha-icon'
}

export enum SELECTOR {
    SCOPE = ':scope',
    TITLE = '.title',
    ITEM = 'a[role="option"]',
    SPACER = '.spacer',
    ITEM_TEXT = '.item-text'
}

export enum ATTRIBUTE {
    PANEL = 'data-panel',
    ROLE = 'role',
    PROCESSED = 'data-processed',
    ARIA_SELECTED = 'aria-selected',
    ARIA_DISABLED = 'aria-disabled',
    HREF = 'href',
    STYLE = 'style'
}

export enum EVENT {
    MOUSEDOWN = 'mousedown'
}