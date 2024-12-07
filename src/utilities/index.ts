import { Hass } from 'home-assistant-javascript-templates';
import {
    Config,
    ConfigOrder,
    ConfigException
} from '@types';
import {
    NAMESPACE,
    TYPE,
    ITEM_TEMPLATE_STRING_OPTIONS,
    ITEM_TEMPLATE_NUMBER_OPTIONS,
    FLUSH_PROMISE_DELAY,
    PARTIAL_REGEXP
} from '@constants';
import { version } from '../../package.json';

const ITEM_TEMPLATE_OPTIONS = [
    ...ITEM_TEMPLATE_STRING_OPTIONS,
    ...ITEM_TEMPLATE_NUMBER_OPTIONS
];

const EXTENDABLE_OPTIONS = [
    'title',
    'subtitle',
    'hide_all',
    'sidebar_editable',
    'sidebar_mode',
    'sidebar_background',
    'title_color',
    'subtitle_color',
    'sidebar_button_color',
    'sidebar_border_color',
    'menu_background',
    'divider_color',
    'divider_top_color',
    'divider_bottom_color',
    'scrollbar_thumb_color',
    'styles',
    ...ITEM_TEMPLATE_OPTIONS
] as const;

const ONLY_CONFIG_OPTIONS = [
    'js_variables',
    'jinja_variables',
    'partials'
] as const;

type ExtendableItemConfigOption = typeof ITEM_TEMPLATE_OPTIONS[number];
type ExtendableConfigOption = typeof EXTENDABLE_OPTIONS[number];
type OnlyConfigOption = typeof ONLY_CONFIG_OPTIONS[number];
type OptionsFromBase = Record<string, Config[ExtendableConfigOption | OnlyConfigOption]>;

export const randomId = (): string => Math.random().toString(16).slice(2);

const getArray = (value: string | string[]): string[] => {
    if (Array.isArray(value)) {
        return value.map((val: string) => val.toLocaleLowerCase());
    }
    return value.toLowerCase().split(/\s*,\s*/);
};

const extendOptionsFromBase = (
    config: Config,
    lastException: ConfigException | null,
    extendFromBase: boolean
): OptionsFromBase => {

    const configCommonProps: OptionsFromBase = {};

    EXTENDABLE_OPTIONS.forEach((option: ExtendableConfigOption): void => {
        const lasExceptionValue = lastException?.[option];
        const value = extendFromBase
            ? lasExceptionValue ?? config[option]
            : lasExceptionValue;
        if (typeof value !== TYPE.UNDEFINED) {
            configCommonProps[option] = value;
        }
    });

    ONLY_CONFIG_OPTIONS.forEach((option: OnlyConfigOption) => {
        configCommonProps[option] = config[option];
    });

    return configCommonProps;

};

const flatConfigOrder = (order: ConfigOrder[], config: Config): ConfigOrder[] => {

    const orderMap = new Map<string, ConfigOrder>();

    order.forEach((orderItem: ConfigOrder): void => {
        orderMap.set(orderItem.item, orderItem);
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
            typeof orderItemA.order === TYPE.UNDEFINED ||
            typeof orderItemB.order === TYPE.UNDEFINED
        ) {
            if (orderItemA.order === orderItemB.order) {
                return 0;
            }
            return typeof orderItemA.order === TYPE.UNDEFINED
                ? 1
                : -1;
        }
        return orderItemA.order - orderItemB.order;
    });
};

export const logVersionToConsole = () => {
    console.info(
        `%c≡ ${NAMESPACE.toUpperCase()} (%CONFIG%)%cv${version}`,
        'font-weight: bold; background: #EEEEEE; color: #666666; padding: 2px 5px;',
        'font-weight: normal; background: #E87A24; color: #FFFFFF; padding: 2px 5px'
    );
};

export const getConfigWithExceptions = (
    user: Hass['user'],
    userAgent: string,
    config: Config
): Config => {
    if (config.exceptions) {

        const userName = user.name.toLocaleLowerCase();

        const filteredExceptions = config.exceptions.filter((exception: ConfigException): boolean => {
            return (
                (
                    exception.user &&
                    getArray(exception.user).includes(userName)
                ) ||
                (
                    exception.not_user &&
                    !getArray(exception.not_user).includes(userName)
                ) ||
                (
                    exception.device &&
                    getArray(exception.device).some((device: string) => userAgent.includes(device))
                ) ||
                (
                    exception.not_device &&
                    !getArray(exception.not_device).some((device: string) => userAgent.includes(device))
                )
            ) ||
            (
                exception.is_admin !== undefined &&
                exception.is_admin === user.is_admin
            );
        });
        const lastException = filteredExceptions.length
            ? filteredExceptions[filteredExceptions.length -1]
            : null;
        const exceptionsOrder = filteredExceptions.flatMap((exception: ConfigException): ConfigOrder[] => exception.order || []);
        const extendsBaseConfig = !filteredExceptions.some((exception: ConfigException): boolean => !exception.extend_from_base);

        const configCommonProps = extendOptionsFromBase(config, lastException, extendsBaseConfig);

        if (extendsBaseConfig) {
            return {
                ...configCommonProps,
                order: flatConfigOrder(
                    [
                        ...(config.order || []),
                        ...exceptionsOrder
                    ],
                    configCommonProps
                )
            };
        }

        return {
            ...configCommonProps,
            order: flatConfigOrder(
                exceptionsOrder,
                configCommonProps
            )
        };
    }
    return {
        ...config,
        order: flatConfigOrder(
            config.order || [],
            config
        )
    };
};

export const flushPromise = () => new Promise((resolve) => {
    setTimeout(resolve, FLUSH_PROMISE_DELAY);
});

export const getTemplateWithPartials = (
    template: string,
    partials: Record<string, string> | undefined,
    tree: string[] = []
): string => {
    return template.replace(PARTIAL_REGEXP, (__match: string, partial: string): string => {
        if (partials?.[partial]) {
            if (tree.includes(partial)) {
                throw new SyntaxError(`${NAMESPACE}: circular partials dependency ${tree.join(' > ')} > ${ partial }`);
            }
            return getTemplateWithPartials(
                partials[partial].trim(),
                partials,
                [...tree, partial]
            );
        }
        console.warn(`${NAMESPACE}: partial ${partial} doesn't exist`);
        return '';
    });
};

export const getCSSVariables = (...values: string[]): string => {
    const [value, ...rest] = values;
    if (rest.length === 0) {
        return value.startsWith('--')
            ? `var(${ value })`
            : value;
    }
    return `var(${ value }, ${ getCSSVariables(...rest) })`;
};