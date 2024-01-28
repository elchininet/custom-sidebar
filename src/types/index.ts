import { HomeAssistant, Hass } from 'home-assistant-javascript-templates';

export interface HassObject extends Hass {
    config: {
        version: string;
    };
}

export interface HomeAsssistantExtended extends HomeAssistant {
    hass: HassObject;
}

export interface PartialPanelResolver extends HTMLElement {
    __route: {
        prefix: string,
        path: string;
    }
}

export interface PaperListBox extends HTMLElement {
    _updateAttrForSelected: () => void;
}

export enum Match {
    TEXT = 'text',
    DATA_PANEL = 'data-panel',
    HREF = 'href'
}

export interface ConfigItem {
    item: string;
    match?: `${Match}`;
    exact?: boolean;
    name?: string;
    notification?: string;
    order?: number;
    bottom?: boolean;
    hide?: boolean;
    href?: string;
    target?: '_self' | '_blank';
    icon?: string;
    new_item?: never;
}

export interface ConfigNewItem extends Omit<ConfigItem, 'new_item'> {
    new_item: boolean;
    item: string;
    href: string;
    icon: string;
}

export type ConfigOrder = ConfigItem | ConfigNewItem;
export type ConfigOrderWithItem = ConfigOrder & { element?: HTMLAnchorElement };

interface ConfigExceptionBase {
    order: ConfigOrder[];
    base_order?: boolean;
}

interface ConfigExceptionUserInclude extends ConfigExceptionBase {
    user?: string | string[];
    not_user?: never;
}

interface ConfigExceptionUserExclude extends ConfigExceptionBase {
    user?: never;
    not_user?: string | string[];
}

interface ConfigExceptionDeviceInclude extends ConfigExceptionBase {
    device?: string | string[];
    not_device?: never;
}

interface ConfigExceptionDeviceExclude extends ConfigExceptionBase {
    device?: never;
    not_device?: string | string[];
}

type ConfigExceptionUser = ConfigExceptionUserInclude | ConfigExceptionUserExclude;
type ConfigExceptionDevice = ConfigExceptionDeviceInclude | ConfigExceptionDeviceExclude;

export type ConfigException = ConfigExceptionUser & ConfigExceptionDevice;

export interface Config {
    id?: string;
    title?: string;
    order: ConfigOrder[];
    exceptions?: ConfigException[];
}

export type SuscriberEvent = {
    event_type: string;
    data: {
        entity_id: string;
        old_state?: {
            state: string;
        };
        new_state: {
            state: string;
        };
    }
};

export type SuscriberCallback = (event: SuscriberEvent) => void;
export type SuscriberOptions = {
    type: string;
    event_type: string;
};

export interface HassConnection {
    conn: {
        subscribeMessage: (callback: SuscriberCallback, options: SuscriberOptions) => void;
    }
}

declare global {
    interface Window {
        CustomSidebar: {};
        hassConnection: Promise<HassConnection>;
    }
}