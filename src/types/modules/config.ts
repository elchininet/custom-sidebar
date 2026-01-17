import { SidebarItem } from './elements';
import {
    Primitive,
    PrimitiveArray,
    PrimitiveObject
} from './primitives';

export enum SidebarMode {
    HIDDEN = 'hidden',
    NARROW = 'narrow',
    EXTENDED = 'extended'
}

export enum DockedSidebar {
    DOCKED = 'docked',
    AUTO = 'auto',
    ALWAYS_HIDDEN = 'always_hidden'
}

export enum MatchersCondition {
    AND = 'AND',
    OR = 'OR'
}

export enum Match {
    TEXT = 'text',
    HREF = 'href'
}

export enum ActionType {
    CALL_SERVICE = 'call-service',
    JAVASCRIPT = 'javascript',
    OPEN_DIALOG = 'open-dialog'
}

export enum DialogType {
    MORE_INFO = 'more-info',
    ALERT = 'alert',
    RESTART = 'restart'
}

export interface SidebarWidth {
    extended?: string;
    hidden?: string;
}

export interface ServiceCallAction {
    action: `${ActionType.CALL_SERVICE}`;
    service: string;
    data?: Record<string, unknown>;
}

export interface JavaScriptAction {
    action: `${ActionType.JAVASCRIPT}`,
    code: string;
}

export interface OpenMoreInfoDialogAction {
    action: `${ActionType.OPEN_DIALOG}`;
    type: `${DialogType.MORE_INFO}`;
    entity_id: string;
}

export interface OpenRestartDialogAction {
    action: `${ActionType.OPEN_DIALOG}`;
    type: `${DialogType.RESTART}`;
}

export type OpenDialogAction =
    | OpenMoreInfoDialogAction
    | OpenRestartDialogAction;

export type OnClickAction =
    | ServiceCallAction
    | JavaScriptAction
    | OpenDialogAction;

export interface ItemColorConfig {
    item_background?: string;
    item_background_hover?: string;
    item_background_hover_opacity?: number | string;
    icon_color?: string;
    icon_color_selected?: string;
    icon_color_hover?: string;
    text_color?: string;
    text_color_selected?: string;
    text_color_hover?: string;
    selection_background?: string;
    selection_opacity?: number | string;
    info_color?: string;
    info_color_selected?: string;
    info_color_hover?: string;
    notification_color?: string;
    notification_color_selected?: string;
    notification_color_hover?: string;
    notification_text_color?: string;
    notification_text_color_selected?: string;
    notification_text_color_hover?: string;
    divider_color?: string;
}

export interface SidebarColorConfig extends ItemColorConfig {
    title_color?: string;
    subtitle_color?: string;
    sidebar_button_color?: string;
    sidebar_background?: string;
    menu_background?: string;
    scrollbar_thumb_color?: string;
    divider_color?: string;
    divider_top_color?: string;
    divider_bottom_color?: string;
    sidebar_border_color?: string;
}

export interface ConfigItem extends ItemColorConfig {
    item: string;
    match?: `${Match}`;
    exact?: boolean;
    name?: string;
    icon?: string;
    info?: string;
    notification?: string;
    order?: number;
    bottom?: boolean;
    hide?: boolean | string;
    href?: string;
    target?: '_self' | '_blank';
    on_click?: OnClickAction;
    attributes?: string | Record<string, string | number | boolean>;
    divider?: boolean;
    new_item?: never;
}

export interface ConfigNewItem extends Omit<ConfigItem, 'new_item'> {
    new_item: boolean;
    item: string;
    icon: string;
}

export type ConfigOrder = ConfigItem | ConfigNewItem;
export type ConfigOrderWithItem = ConfigOrder & { element?: SidebarItem };

export interface AnalyticsConfig {
    sidebar_item_clicked?: boolean;
    panel_visited?: boolean;
}

export interface BaseConfig extends SidebarColorConfig {
    title?: string;
    subtitle?: string;
    hide_all?: boolean;
    order?: ConfigOrder[];
    sidebar_editable?: boolean | string;
    sidebar_mode?: `${SidebarMode}`;
    default_path?: string;
    width?: number | string | SidebarWidth;
    styles?: string;
    extend_from?: string | string[];
    analytics?: boolean | AnalyticsConfig;
}

export interface ConfigExceptionBase extends BaseConfig {
    matchers_conditions?: `${MatchersCondition}`;
    is_admin?: boolean;
    is_owner?: boolean;
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

export interface Config extends BaseConfig {
    id?: string;
    js_variables?: Record<string, Primitive | PrimitiveObject | PrimitiveArray>;
    js_refs?: Record<string, Primitive | PrimitiveObject | PrimitiveArray>;
    jinja_variables?: Record<string, Primitive | PrimitiveObject | PrimitiveArray>;
    partials?: Record<string, string>;
    exceptions?: ConfigException[];
    extendable_configs?: Record<string, BaseConfig>;
}

export type ItemColorConfigKeys = keyof ItemColorConfig;
export type SidebarColorConfigKeys = keyof SidebarColorConfig;
export type SidebarStringConfigKeys = keyof Pick<BaseConfig, 'default_path'>;