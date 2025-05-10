import { HomeAssistant, Hass } from 'home-assistant-javascript-templates';
import { DockedSidebar } from './config';

export enum Method {
    GET = 'GET',
    POST = 'POST'
}

export interface HassExtended extends Hass {
    dockedSidebar: `${DockedSidebar}`;
    callService: (domain: string, service: string, data: Record<string, unknown>) => Promise<void>;
    callApi: <T>(
        method: `${Method}`,
        endPoint: string,
        data?: Record<string, unknown>
    ) => Promise<T>;
}

export interface SidebarItem extends HTMLElement {
    href: string;
    target: string;
}

export interface HomeAsssistantExtended extends HomeAssistant {
    hass: HassExtended;
}

export interface PartialPanelResolver extends HTMLElement {
    narrow: boolean;
    route: {
        prefix: string,
        path: string;
    }
}

export interface HomeAssistantMain extends HTMLElement {
    hass: HassExtended;
    narrow: boolean;
}

export interface HaMenuButton extends HTMLElement {
    narrow: boolean;
}

export interface Sidebar extends HTMLElement {
    alwaysExpand: boolean;
    _mouseLeaveTimeout?: number;
    _showTooltip: (anchor: HTMLElement) => void;
    _hideTooltip: () => void;
}