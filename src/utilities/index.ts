import {
    Config,
    ConfigOrder,
    ConfigException
} from '@types';
import {
    NAMESPACE,
    MAX_ATTEMPTS,
    RETRY_DELAY,
    FLUSH_PROMISE_DELAY,
    UNDEFINED_TYPE,
    CSS_CLEANER_REGEXP
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
    'selection_opacity',
    'divider_color'
] as const;

type ExtendableConfigOption = typeof EXTENDABLE_OPTIONS[number];
type ExtendableConfigOptions = Partial<Pick<Config, ExtendableConfigOption>>;

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
): ExtendableConfigOptions => {

    const configCommonProps: Record<string, string | boolean | number> = {};

    EXTENDABLE_OPTIONS.forEach((option: ExtendableConfigOption): void => {
        const lasExceptionValue = lastException?.[option];
        const value = extendFromBase
            ? lasExceptionValue ?? config[option]
            : lasExceptionValue;
        if (typeof value !== UNDEFINED_TYPE) {
            configCommonProps[option] = value;
        }
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
            typeof orderItemA.order === UNDEFINED_TYPE ||
            typeof orderItemB.order === UNDEFINED_TYPE
        ) {
            if (orderItemA.order === orderItemB.order) {
                return 0;
            }
            return typeof orderItemA.order === UNDEFINED_TYPE
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

const getElementName = (elem: ShadowRoot): string => {
    return elem.host.localName;
};

export const addStyle = (css: string, elem: ShadowRoot): void => {
    const name = getElementName(elem);
    const style = document.createElement('style');
    style.setAttribute('id', `${NAMESPACE}_${name}`);
    elem.appendChild(style);
    style.innerHTML = css.replace(CSS_CLEANER_REGEXP, '$2');
};