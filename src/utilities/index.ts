import {
    Config,
    ConfigOrder,
    ConfigException
} from '@types';
import {
    NAMESPACE,
    TYPE,
    MAX_ATTEMPTS,
    RETRY_DELAY,
    FLUSH_PROMISE_DELAY,
    PARTIAL_REGEXP
} from '@constants';
import { version } from '../../package.json';

const EXTENDABLE_OPTIONS = [
    'title',
    'sidebar_editable',
    'sidebar_mode',
    'sidebar_background',
    'title_color',
    'sidebar_button_color',
    'menu_background',
    'styles',
    'icon_color',
    'icon_color_selected',
    'text_color',
    'text_color_selected',
    'selection_color',
    'info_color',
    'info_color_selected',
    'notification_color',
    'notification_text_color',
    'selection_opacity',
    'divider_color'
] as const;

const ONLY_CONFIG_OPTIONS = [
    'js_variables',
    'jinja_variables',
    'partials'
] as const;

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

const flatConfigOrder = (order: ConfigOrder[]): ConfigOrder[] => {

    const orderMap = new Map<string, ConfigOrder>();

    order.forEach((orderItem: ConfigOrder): void => {
        orderMap.set(orderItem.item, orderItem);
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

export const getPromisableElement = <T>(
    getElement: () => T,
    check: (element: T) => boolean
): Promise<T> => {
    return new Promise<T>((resolve) => {
        let attempts = 0;
        const select = () => {
            const element: T = getElement();
            if (element && check(element)) {
                resolve(element);
            } else {
                attempts++;
                // The else clause is an edge case that should not happen
                // Very hard to reproduce so it cannot be covered
                /* istanbul ignore else */
                if (attempts < MAX_ATTEMPTS) {
                    setTimeout(select, RETRY_DELAY);
                } else {
                    resolve(element);
                }
            }
        };
        select();
    });
};

export const getConfigWithExceptions = (
    currentUser: string,
    currentDevice: string,
    config: Config
): Config => {
    if (config.exceptions) {

        const filteredExceptions = config.exceptions.filter((exception: ConfigException): boolean => {
            return (
                (
                    exception.user &&
                    getArray(exception.user).includes(currentUser)
                ) ||
                (
                    exception.not_user &&
                    !getArray(exception.not_user).includes(currentUser)
                ) ||
                (
                    exception.device &&
                    getArray(exception.device).some((device: string) => currentDevice.includes(device))
                ) ||
                (
                    exception.not_device &&
                    !getArray(exception.not_device).some((device: string) => currentDevice.includes(device))
                )
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
                    ]
                )
            };
        }

        return {
            ...configCommonProps,
            order: flatConfigOrder(
                exceptionsOrder
            )
        };
    }
    return {
        ...config,
        order: flatConfigOrder(
            config.order || []
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
    if (!partials) {
        return template;
    }
    return template.replace(PARTIAL_REGEXP, (__match: string, partial: string): string => {
        if (partials[partial]) {
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