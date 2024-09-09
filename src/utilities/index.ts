import {
    Config,
    ConfigOrder,
    ConfigException
} from '@types';
import {
    NAMESPACE,
    MAX_ATTEMPTS,
    RETRY_DELAY,
    UNDEFINED_TYPE,
    CSS_CLEANER_REGEXP
} from '@constants';
import { version } from '../../package.json';

export const randomId = (): string => Math.random().toString(16).slice(2);

const getArray = (value: string | string[]): string[] => {
    if (Array.isArray(value)) {
        return value.map((val: string) => val.toLocaleLowerCase());
    }
    return value.toLowerCase().split(/\s*,\s*/);
};

const flatConfigOrder = (order: ConfigOrder[]): ConfigOrder[] => {

    const added: string[] = [];
    const flatOrder: ConfigOrder[] = [];
    const total = order.length;

    for (let index = total - 1; index >= 0; index --) {
        const orderItem = order[index];
        if (!added.includes(orderItem.item)) {
            flatOrder.unshift(orderItem);
            added.push(orderItem.item);
        }
    }

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
                    getArray(exception.not_device).every((device: string) => !currentDevice.includes(device))
                )
            );
        });
        const lastException = filteredExceptions.length
            ? filteredExceptions[filteredExceptions.length -1]
            : null;
        const exceptionsOrder = filteredExceptions.flatMap((exception: ConfigException) => exception.order || []);
        const extendsBaseConfig = filteredExceptions.every((exception: ConfigException): boolean => !!exception.extend_from_base);
        const configCommonProps: Pick<Config, 'title' | 'sidebar_editable' | 'styles'> = {};

        const title = extendsBaseConfig
            ? lastException?.title ?? config.title
            : lastException.title;
        const sidebar_editable = extendsBaseConfig
            ? lastException?.sidebar_editable ?? config.sidebar_editable
            : lastException.sidebar_editable;
        const styles = extendsBaseConfig
            ? lastException?.styles ?? config.styles
            : lastException.styles;
        if (title) configCommonProps.title = title;
        if (typeof sidebar_editable !== UNDEFINED_TYPE) configCommonProps.sidebar_editable = sidebar_editable;
        if (styles) configCommonProps.styles = styles;

        if (extendsBaseConfig) {
            return {
                ...configCommonProps,
                order: flatConfigOrder([
                    ...config.order,
                    ...exceptionsOrder
                ])
            };
        }

        return {
            ...configCommonProps,
            order: flatConfigOrder(exceptionsOrder)
        };
    }
    return {
        ...config,
        order: flatConfigOrder(config.order)
    };
};

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