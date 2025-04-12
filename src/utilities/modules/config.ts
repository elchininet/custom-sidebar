import { Hass } from 'home-assistant-javascript-templates';
import {
    Config,
    ConfigException,
    ConfigOrder,
    MatchersCondition
} from '@types';
import {
    BASE_NAME,
    ITEM_TEMPLATE_COLOR_CONFIG_OPTIONS,
    ITEM_TEMPLATE_NUMBER_CONFIG_OPTIONS
} from '@constants';
import { getLowercaseArray, getArray } from './misc';
import { isUndefined } from './predicates';

const ITEM_TEMPLATE_OPTIONS = [
    ...ITEM_TEMPLATE_COLOR_CONFIG_OPTIONS,
    ...ITEM_TEMPLATE_NUMBER_CONFIG_OPTIONS
];

const NOT_EXTENDABLE_OPTIONS = [
    'id',
    'exceptions',
    'extendable_configs',
    'extend_from',
    'user',
    'not_user',
    'device',
    'not_device',
    'is_admin'
];

const ONLY_CONFIG_OPTIONS = [
    'js_variables',
    'jinja_variables',
    'partials'
] as const;

type ExtendableItemConfigOption = typeof ITEM_TEMPLATE_OPTIONS[number];
type OnlyConfigOptions = typeof ONLY_CONFIG_OPTIONS[number];

class ConfigFlatter {

    constructor(config: Config, user: Hass['user'], userAgent: string) {
        this._config = config;
        this._extendable = new Map(
            Object.entries(
                this._config.extendable_configs ?? []
            )
        );
        this._user = user;
        this._userAgent = userAgent;
        this._exceptions = this._getExceptions();
        this._buildFlattenConfig();
    }

    private _config: Config;
    private _extendable: Map<string, Config>;
    private _user: Hass['user'];
    private _userAgent: string;
    private _exceptions: ConfigException[];
    private _flattenConfig: Config;

    private _getExceptions(): ConfigException[] {

        if (this._config.exceptions) {

            const userName = this._user.name.toLocaleLowerCase();

            return this._config.exceptions.filter((exception: ConfigException): boolean => {
                const matchersConditions = exception.matchers_conditions ?? MatchersCondition.OR;
                const user = (
                    exception.user !== undefined &&
                    getLowercaseArray(exception.user).includes(userName)
                );
                const notUser = (
                    exception.not_user !== undefined &&
                    !getLowercaseArray(exception.not_user).includes(userName)
                );
                const device = (
                    exception.device !== undefined &&
                    getLowercaseArray(exception.device).some((device: string) => this._userAgent.includes(device))
                );
                const notDevice = (
                    exception.not_device !== undefined &&
                    !getLowercaseArray(exception.not_device).some((device: string) => this._userAgent.includes(device))
                );
                const isAdmin = (
                    exception.is_admin !== undefined &&
                    exception.is_admin === this._user.is_admin
                );
                const isOwner = (
                    exception.is_owner !== undefined &&
                    exception.is_owner === this._user.is_owner
                );
                if (matchersConditions === MatchersCondition.OR) {
                    return user || notUser || device || notDevice || isAdmin || isOwner;
                }
                return (
                    (exception.user === undefined || user) &&
                    (exception.not_user === undefined || notUser) &&
                    (exception.device === undefined || device) &&
                    (exception.not_device === undefined || notDevice) &&
                    (exception.is_admin === undefined || isAdmin) &&
                    (exception.is_owner === undefined || isOwner)
                );
            });
        }
        return [];
    }

    private _mergeConfigs(...configs: Config[]): Config {
        return configs.reduce((merged: Config, config: Config): Config => {
            return {
                ...merged,
                ...config,
                order: [
                    ...(merged.order ?? []),
                    ...(config.order ?? [])
                ]
            };
        }, {});
    }

    private _pickExtendableOptions(config: Config): Config {
        const entries = Object.entries(config);
        const pickedConfig = Object.fromEntries(
            entries.filter((entry) => {
                const [option] = entry;
                return !NOT_EXTENDABLE_OPTIONS.includes(option);
            })
        );
        if (config.extend_from) {
            return this._mergeConfigs(
                this._importConfig(config.extend_from),
                pickedConfig
            );
        }
        return {
            ...pickedConfig
        };
    }

    private _importConfig(configIds: string | string[]): Config {
        const configs = getArray(configIds);
        return configs.reduce((flattenConfig: Config, id: string): Config => {
            if (id === BASE_NAME) {
                return this._mergeConfigs(
                    this._pickExtendableOptions(this._config),
                    flattenConfig
                );
            }
            return this._mergeConfigs(
                this._pickExtendableOptions(
                    this._extendable.get(id)
                ),
                flattenConfig
            );
        }, {});
    }

    private _buildFlattenConfigFromExceptions(): void {
        const baseOptions = ONLY_CONFIG_OPTIONS.reduce((baseConfigOptions: Config, option: OnlyConfigOptions): Config => {
            if (this._config[option]) {
                return {
                    ...baseConfigOptions,
                    [option]: this._config[option]
                };
            }
            return baseConfigOptions;
        }, {});
        this._flattenConfig = this._exceptions.reduce((flattenException: Config, exception: ConfigException): Config => {
            if (exception.extend_from) {
                return this._mergeConfigs(
                    this._importConfig(exception.extend_from),
                    flattenException,
                    exception
                );
            }
            return this._mergeConfigs(
                flattenException,
                exception
            );
        }, baseOptions);
    }

    private _buildFlattenConfigFromMainConfig(): void {
        this._flattenConfig = this._config.extend_from
            ? this._mergeConfigs(
                this._importConfig(this._config.extend_from),
                this._config
            )
            : this._config;
    }

    private _buildFlattenConfig(): void {
        if (this._exceptions.length) {
            this._buildFlattenConfigFromExceptions();
        } else {
            this._buildFlattenConfigFromMainConfig();
        }
    }

    private _flattenOrder(config: Config): ConfigOrder[] {
        const order = config.order ?? [];
        const orderMap = new Map<string, ConfigOrder>();
        order.forEach((orderItem: ConfigOrder): void => {
            if (orderMap.has(orderItem.item)) {
                orderMap.set(
                    orderItem.item,
                    {
                        ...orderMap.get(orderItem.item),
                        ...orderItem
                    }
                );
            } else {
                orderMap.set(orderItem.item, orderItem);
            }
        });
        orderMap.forEach((orderItem: ConfigOrder): void => {
            ITEM_TEMPLATE_OPTIONS.forEach((option: ExtendableItemConfigOption): void => {
                if (
                    orderItem[option] === undefined &&
                    config[option] !== undefined
                ) {
                    if (option === 'selection_opacity') {
                        orderItem.selection_opacity = config.selection_opacity;
                    } else {
                        orderItem[option] = config[option];
                    }
                }
            });
            if (
                !orderItem.new_item &&
                orderItem.hide === undefined &&
                config.hide_all !== undefined
            ) {
                orderItem.hide = config.hide_all;
            }
        });
        const flatOrder = Array.from(orderMap.values());
        return flatOrder.sort((orderItemA: ConfigOrder, orderItemB: ConfigOrder): number => {
            if (!!orderItemA.bottom !== !!orderItemB.bottom) {
                return orderItemA.bottom
                    ? 1
                    : -1;
            }
            if (
                isUndefined(orderItemA.order) ||
                isUndefined(orderItemB.order)
            ) {
                if (orderItemA.order === orderItemB.order) {
                    return 0;
                }
                return isUndefined(orderItemA.order)
                    ? 1
                    : -1;
            }
            return orderItemA.order - orderItemB.order;
        });
    }

    get config(): Config {
        return {
            ...this._flattenConfig,
            order: this._flattenOrder(this._flattenConfig)
        };
    }
}

export const getConfig = (
    user: Hass['user'],
    userAgent: string,
    config: Config
): Config => {

    const configFlatter = new ConfigFlatter(
        config,
        user,
        userAgent
    );

    return configFlatter.config;

};