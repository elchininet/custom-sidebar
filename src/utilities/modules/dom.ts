import { PromisableOptions, getPromisableResult } from 'get-promisable-result';
import { HAElement } from 'home-assistant-query-selector';
import {
    ConfigNewItem,
    ElementsStore,
    Sidebar,
    SidebarItem
} from '@types';
import {
    ATTRIBUTE,
    ATTRIBUTE_VALUE,
    CHECK_FOCUSED_SHADOW_ROOT,
    CLASS,
    CUSTOM_ELEMENT,
    ELEMENT,
    MAX_ATTEMPTS,
    NODE_NAME,
    RETRY_DELAY,
    SELECTOR
} from '@constants';
import { isString } from './predicates';
import { Logger } from './logger';
import { isMobileClient } from './misc';

export const getId = (configItem: ConfigNewItem): string => {
    const id = (configItem.href ?? configItem.item).replace(/\W/g, '-');
    return `${ATTRIBUTE_VALUE.SIDEBAR_PANEL}-${id}`;
};

export const buildNotification = (slot: string): Element => {
    const badge = document.createElement(ELEMENT.SPAN);
    badge.classList.add(CLASS.BADGE);
    badge.setAttribute(ATTRIBUTE.SLOT, slot);
    return badge;
};

export const buildNewItem = (configItem: ConfigNewItem): SidebarItem => {

    const item = document.createElement(
        configItem.section_header
            ? CUSTOM_ELEMENT.ITEM_BASE
            : CUSTOM_ELEMENT.ITEM
    ) as SidebarItem;

    const text = document.createElement(ELEMENT.SPAN);
    text.classList.add(CLASS.ITEM_TEXT);
    text.setAttribute(ATTRIBUTE.SLOT, ATTRIBUTE_VALUE.HEADLINE);
    text.innerText = configItem.item;

    if (configItem.section_header) {

        item.appendChild(text);

    } else {

        item.setAttribute(ATTRIBUTE.ID, getId(configItem));
        item.setAttribute(ATTRIBUTE.NEW_ITEM, ATTRIBUTE_VALUE.TRUE);

        item.href = configItem.href ?? '#';
        item.target = configItem.target ?? '';

        const badgeStart = buildNotification(ATTRIBUTE_VALUE.START);
        const badgeEnd = buildNotification(ATTRIBUTE_VALUE.END);

        item.appendChild(badgeStart);
        item.appendChild(text);
        item.appendChild(badgeEnd);

    }

    item.tabIndex = -1;

    return item;
};

export const getItemTextElement = (element: SidebarItem): HTMLElement => {
    return element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT)!;
};

export const getItemText = (element: SidebarItem) => {
    return getItemTextElement(element).textContent.trim();
};

export const getTooltip = (item: SidebarItem): HTMLElement | null => {
    return item.parentElement!.querySelector(`${CUSTOM_ELEMENT.TOOLTIP}[${ATTRIBUTE.FOR}="${item.id}"]`);
};

export const hideItem = (item: HTMLElement, hide: boolean): void => {
    if (hide) {
        item.style.display = ATTRIBUTE_VALUE.NONE;
    } else {
        item.style.removeProperty('display');
    }
};

interface WaitForElement<E extends Element> {
    toBeAdded: () => Promise<E | null>;
    toBeRemoved: () => Promise<E | null>;
}

export function waitForElement<E extends Element = Element>(
    root: Element | ShadowRoot,
    selector: string,
    options: PromisableOptions
): WaitForElement<E>;
export function waitForElement<E extends Element = Element>(
    selector: string,
    options: PromisableOptions
): WaitForElement<E>;
export function waitForElement<E extends Element = Element>(
    rootOrSelector: Element | ShadowRoot | string,
    selectorOrOptions: string | PromisableOptions,
    options: PromisableOptions = {}
): WaitForElement<E> {
    const root = isString(rootOrSelector)
        ? document
        : rootOrSelector;
    const selector = isString(rootOrSelector)
        ? rootOrSelector
        : String(selectorOrOptions);
    const promisableOptions = !isString(selectorOrOptions)
        ? selectorOrOptions
        : options;
    const finalPromisableOptions = {
        retries: MAX_ATTEMPTS,
        delay: RETRY_DELAY,
        shouldReject: false,
        ...promisableOptions
    };
    const selectElement = () => root.querySelector<E>(selector);
    return {
        toBeAdded() {
            return getPromisableResult(
                selectElement,
                (element: E | null) => element !== null && element.shadowRoot !== null,
                finalPromisableOptions
            );
        },
        toBeRemoved() {
            return getPromisableResult(
                selectElement,
                (element: E | null) => element === null,
                finalPromisableOptions
            );
        }
    };
};

export const waitForReadiness = async (
    shouldReject: boolean
) => {
    const promisableOptions = { shouldReject };
    const homeAssistant = await waitForElement(
        CUSTOM_ELEMENT.HOME_ASISTANT,
        promisableOptions
    ).toBeAdded();
    const homeAssistantMain = await waitForElement(
        homeAssistant!.shadowRoot!,
        CUSTOM_ELEMENT.HOME_ASSISTANT_MAIN,
        promisableOptions
    ).toBeAdded();
    await waitForElement(
        homeAssistantMain!.shadowRoot!,
        CUSTOM_ELEMENT.HA_SIDEBAR,
        promisableOptions
    ).toBeAdded();
};

export const waitForSidebarReady = async (
    sidebar: HAElement,
    shouldReject: boolean
) => {
    const sidebarShadowRoot = (await sidebar.selector.$.element)!;
    await waitForElement(
        sidebarShadowRoot,
        SELECTOR.SIDEBAR_LOADER,
        { shouldReject }
    ).toBeRemoved();
};

export const getContainerItems = async (
    container: HTMLElement,
    shouldReject: boolean,
    fixed = false
): Promise<NodeListOf<SidebarItem>> => {
    const items = await getPromisableResult<NodeListOf<SidebarItem>>(
        () => container.querySelectorAll<SidebarItem>(`:scope > ${SELECTOR.ITEM}`),
        (elements: NodeListOf<SidebarItem>): boolean => {
            return Array.from(elements).every((element: SidebarItem): boolean => {
                const text = getItemText(element);
                return text.length > 0;
            });
        },
        {
            retries: MAX_ATTEMPTS,
            delay: RETRY_DELAY,
            shouldReject
        }
    );
    items.forEach((item: SidebarItem): void => {
        item.setAttribute(
            ATTRIBUTE.FIXED,
            fixed
                ? ATTRIBUTE_VALUE.TRUE
                : ATTRIBUTE_VALUE.FALSE
        );
    });
    return items;
};

const mapItemsForDebug = (items: NodeListOf<SidebarItem>): ({text: string, href: string})[] => {
    return Array.from(items).map((element: SidebarItem) => {
        const href = element.href;
        const text = getItemText(element);
        return {
            text,
            href
        };
    });
};

export const getElements = async (
    sidebar: HAElement,
    logger: Logger
): Promise<ElementsStore> => {
    // If sidebar is loading, wait for the looading to finish
    await waitForSidebarReady(sidebar, logger.enabled);

    const topItemsContainer = (await sidebar.selector.$.query(SELECTOR.SIDEBAR_TOP_ITEMS_CONTAINER).element) as HTMLElement;
    const bottomItemsContainer = (await sidebar.selector.$.query(SELECTOR.SIDEBAR_BOTTOM_ITEMS_CONTAINER).element) as HTMLElement;

    const topItems = await getContainerItems(topItemsContainer, logger.enabled);
    const bottomItems = await getContainerItems(bottomItemsContainer, logger.enabled, true);

    if (logger.enabled) {
        const topItemsTable = mapItemsForDebug(topItems);
        const bottomItemsTable = mapItemsForDebug(bottomItems);

        logger.log(
            'Top Native sidebar items',
            topItemsTable,
            {
                table: true
            }
        );
        logger.log(
            'Bottom Native sidebar items',
            bottomItemsTable,
            {
                table: true
            }
        );
    }
    return {
        topItemsContainer,
        bottomItemsContainer,
        topItems,
        bottomItems
    };
};

const focusItem = (
    items: SidebarItem[],
    activeIndex: number,
    forward: boolean
): void => {

    const length = items.length;
    let focusIndex = 0;

    if (forward) {
        const start = activeIndex + 1;
        const end = start + length;
        for (let i = start; i < end; i++) {
            const index = i > length - 1
                ? i - length
                : i;
            if (
                items[index].nodeName !== NODE_NAME.ITEM_BASE &&
                items[index].style.display !== ATTRIBUTE_VALUE.NONE
            ) {
                focusIndex = index;
                break;
            }
        }
    } else {
        const start = activeIndex - 1;
        const end = start - length;
        for (let i = start; i > end; i--) {
            const index = i < 0
                ? length + i
                : i;
            if (
                items[index].nodeName !== NODE_NAME.ITEM_BASE &&
                items[index].style.display !== ATTRIBUTE_VALUE.NONE
            ) {
                focusIndex = index;
                break;
            }
        }
    }

    items[focusIndex].focus();
    items[focusIndex].tabIndex = 0;

};

export const focusItemByKeyboard = (
    items: SidebarItem[],
    sidebarItemsContainer: HTMLElement,
    forward: boolean
): void => {

    const selectors = [
        `${SELECTOR.SCOPE} > ${CUSTOM_ELEMENT.ITEM}:not(.${CLASS.ITEM_SELECTED}):focus`,
        `${SELECTOR.SCOPE} > ${CUSTOM_ELEMENT.ITEM}:focus`
    ];

    const activeItem = sidebarItemsContainer.querySelector<HTMLElement>(selectors.join(','));

    let activeIndex = 0;

    items.forEach((item: HTMLElement, index: number): void => {
        if (item === activeItem) {
            activeIndex = index;
        }
        item.tabIndex = -1;
    });

    focusItem(items, activeIndex, forward);

};

export const focusItemByTab = (
    items: SidebarItem[],
    sidebarShadowRoot: ShadowRoot,
    element: SidebarItem,
    forward: boolean
): void => {

    const haIconButton = sidebarShadowRoot.querySelector<HTMLElement>(CUSTOM_ELEMENT.HA_ICON_BUTTON)!;
    const activeIndex = items.indexOf(element);
    const lastIndex = items.length - 1;

    if (activeIndex >= 0) {

        if (
            (forward && activeIndex < lastIndex) ||
            (!forward && activeIndex > 0)
        ) {
            focusItem(items, activeIndex, forward);
        } else if(!forward) {
            haIconButton.focus();
        }

    }

};

export const getActiveElement = (root: Document | ShadowRoot = document): Element | null => {
    const activeEl = root.activeElement;
    if (activeEl) {
        if (
            activeEl instanceof HTMLElement &&
            activeEl.nodeName === NODE_NAME.ITEM
        ) {
            return activeEl;
        }
        return activeEl.shadowRoot && CHECK_FOCUSED_SHADOW_ROOT.includes(activeEl.nodeName)
            ? getActiveElement(activeEl.shadowRoot)
            : null;
    }
    // In theory, activeElement could be null
    // but this is hard to reproduce during the tests
    // because there is always an element focused (e.g. the body)
    // So excluding this from the coverage
    /* istanbul ignore next */
    return null;
};

const buildTooltip = (id: string, text: string): HTMLElement => {

    const tooltip = document.createElement(CUSTOM_ELEMENT.TOOLTIP);

    tooltip.setAttribute(ATTRIBUTE.FOR, id);
    tooltip.setAttribute(ATTRIBUTE.SHOW_DELAY, ATTRIBUTE_VALUE.ZERO);
    tooltip.setAttribute(ATTRIBUTE.HIDE_DELAY, ATTRIBUTE_VALUE.ZERO);
    tooltip.setAttribute(ATTRIBUTE.PLACEMENT, ATTRIBUTE_VALUE.RIGHT);
    tooltip.textContent = text;

    return tooltip;

};

export const refreshTooltips = async (sidebarElement: HAElement): Promise<void> => {

    const sidebar = (await sidebarElement.element) as Sidebar;
    const removeTooltips = sidebar.alwaysExpand || isMobileClient;
    const newItems = sidebar.shadowRoot!.querySelectorAll<SidebarItem>(`${CUSTOM_ELEMENT.ITEM}[${ATTRIBUTE.NEW_ITEM}]`);

    newItems.forEach((item: SidebarItem): void => {
        let tooltip = getTooltip(item);
        if (removeTooltips) {
            tooltip?.parentElement!.removeChild(tooltip);
        } else if(!tooltip) {
            const text = getItemText(item);
            tooltip = buildTooltip(item.id, text);
            item.after(tooltip);
        }
    });
};

export const setElementVariables = (
    element: HTMLElement,
    dictionary: [string, string | undefined][]
): void => {
    dictionary.forEach(([cssVariable, value]) => {
        if (value) {
            element.style.setProperty(
                cssVariable,
                value
            );
        }
    });
};
