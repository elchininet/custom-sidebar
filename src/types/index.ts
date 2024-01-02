export interface User {
    name: string;
    is_admin: boolean;
}

export class HomeAssistant extends HTMLElement {
	hass: {
        user: User;
        config: {
            version: string;
        };
    };
}

export interface ConfigItem {
    item: string;
    name?: string;
    order?: number;
    bottom?: boolean;
    hide?: boolean;
    exact?: boolean;
    href?: string;
    icon?: string;
    new_item?: never;
}

export interface ConfigNewItem extends Omit<ConfigItem, 'new_item'> {
    new_item: boolean;
    item: string;
    href: string;
    icon: string;
    target?: '_self' | '_blank';
}

export type ConfigOrder = ConfigItem | ConfigNewItem;
export type ConfigOrderWithItem = ConfigOrder & { element?: Element };

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

export interface ElementHash {
    byTextContent: Record<string, Element>;
    byPanelName: Record<string, Element>;
}