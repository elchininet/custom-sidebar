import { Hass, HomeAssistant } from 'home-assistant-javascript-templates';
import { DockedSidebar } from './config';

export enum Method {
    GET = 'GET',
    POST = 'POST'
}

export interface HomeAssistantPanel {
    url_path: string;
    component_name: string;
}

export interface HassExtended extends Hass {
    dockedSidebar: `${DockedSidebar}`;
    callService: (domain: string, service: string, data: Record<string, unknown>) => Promise<void>;
    callApi: <T>(
        method: `${Method}`,
        endPoint: string,
        data?: Record<string, unknown>
    ) => Promise<T>;
    panels: HomeAssistantPanel[];
}

export interface SidebarItem extends HTMLElement {
    href: string;
    target: string;
}

export interface HomeAsssistantExtended extends HomeAssistant {
    hass: HassExtended;
}

export interface Router extends HTMLElement {
    routerOptions: {
        routes: Record<
            string,
            {
                load: () => Promise<void>;
                tag: string;
            }
        >;
    };
}

export interface PartialPanelResolver extends Router {
    narrow: boolean;
    route: {
        prefix: string,
        path: string;
    };
    hass: HassExtended;
    _updateRoutes: () => void;
}

export interface HaConfigSystemNavigation extends HTMLElement {
    _showRestartDialog: () => void;
}

export interface HaConfigBackupBackups extends HTMLElement {
    hass: HassExtended;
    _overflowBackup: boolean;
    _deleteBackup: () => void;
}

export interface HomeAssistantMain extends HTMLElement {
    hass: HassExtended;
    narrow: boolean;
}

export interface Sidebar extends HTMLElement {
    alwaysExpand: boolean;
    _mouseLeaveTimeout?: number;
    _showTooltip: (anchor: HTMLElement) => void;
    _hideTooltip: () => void;
}

export type DialogImport = () => Promise<CustomElementConstructor>;

export interface DialogBoxParameters {
    title?: string;
    text?: string;
    confirmation?: boolean;
    confirmText?: string;
    dismissText?: string;
    destructive?: boolean;
    confirm?: () => void;
    cancel?: () => void;
}

export interface HomeAssistantDialogEventDetail {
    dialogTag: string;
    dialogImport: DialogImport;
    dialogParams: Record<string, unknown>;
}

export enum HuiTimestampDisplayDateFormat {
    DATE = 'date',
    DATETIME = 'datetime',
    TIME = 'time',
    RELATIVE = 'relative'
}

export interface HuiTimestampDisplay extends HTMLElement {
    ts: Date;
    hass: HassExtended;
    format: HuiTimestampDisplayDateFormat;
    capitalize: boolean;
    _updateRelative: () => void;
    render: () => {
        values: string[];
    };
}

export interface ElementsStore {
    topItemsContainer: HTMLElement;
    bottomItemsContainer: HTMLElement;
    topItems: NodeListOf<SidebarItem>;
    bottomItems: NodeListOf<SidebarItem>;
}