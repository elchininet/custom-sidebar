import { PANELS } from './constants';
import { getSidebarItemSelector, getPaperIconSelector } from './utilities';

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
    MENU: '.menu',
    TITLE: '.menu .title',
    SIDEBAR_HA_ICON_BUTTON: '.menu ha-icon-button',
    SIDEBAR_EDIT_BUTTON: '.menu mwc-button',
    PROFILE_EDIT_BUTTON: '.content > ha-card ha-settings-row > mwc-button',
    PROFILE_HIDE_SIDEBAR: '.content > ha-card ha-force-narrow-row ha-settings-row > ha-switch',
    NOTIFICATIONS: '.notifications-container .notifications',
    ITEM_NOTIFICATION_COLLAPSED: '.notification-badge-collapsed',
    ITEM_NOTIFICATION: '.notification-badge:not(.notification-badge-collapsed)',
    PROFILE: '.profile paper-icon-item',
    HA_SIDEBAR: 'ha-sidebar',
    HUI_VIEW: 'hui-view',
    PAPER_LIST_BOX: 'paper-listbox',
    TOOLTIP: '.tooltip',
    HA_ICON: 'ha-icon',
    PANEL_CONFIG: 'ha-panel-config',
    SIDEBAR_ITEMS,
    SIDEBAR_PAPER_ICON_ITEMS
};