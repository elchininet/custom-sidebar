import {
    HAQuerySelector,
    HAQuerySelectorEvent,
    OnLovelacePanelLoadDetail,
    HAElement
} from 'home-assistant-query-selector';
import {
    Config,
    ConfigNewItem,
    ConfigOrder,
    ConfigOrderWithItem,
    HomeAssistant,
    ElementHash
} from '@types';
import {
    ELEMENT,
    SELECTOR,
    ATTRIBUTE
} from '@constants';
import {
    logVersionToConsole,
    fetchConfig,
    getPromisableElement,
    getFinalOrder
} from '@utilities';

logVersionToConsole();

const configPromise = fetchConfig();

class CustomSidebar {

    constructor() {

        const selector = new HAQuerySelector();

        selector.addEventListener(
            HAQuerySelectorEvent.ON_PANEL_LOAD,
            (event: CustomEvent<OnLovelacePanelLoadDetail>) => {
                this._homeAssistant = event.detail.HOME_ASSISTANT;
                this._partialPanelResolver = event.detail.PARTIAL_PANEL_RESOLVER;
                this._sidebar = event.detail.HA_SIDEBAR;
            },
            {
                once: true
            }
        );

        selector.listen();

        this._process();
    }

    private _homeAssistant: HAElement;
    private _partialPanelResolver: HAElement;
    private _sidebar: HAElement;

    private async _getOrder(): Promise<ConfigOrder[]> {
        const user = await this._getCurrentUser();
        const device = this._getCurrentDevice();
        return configPromise
            .then((config: Config) => {
                return getFinalOrder(
                    user,
                    device,
                    config.order,
                    config.exceptions
                );
            });
    }

    private _getElementWithConfig<P>(promise: Promise<P>): Promise<[Config, Awaited<P>]> {
        return Promise.all([
            configPromise,
            promise
        ]);
    }

    private async _getCurrentUser(): Promise<string> {
        return this._homeAssistant
            .element.then(async (ha: HomeAssistant) => {
                return getPromisableElement(
                        () => ha?.hass?.user?.name?.toLowerCase(),
                        (user: string): boolean => !!user
                    )
                    .then((user: string) => user || '');
            });
    }

    private _getCurrentDevice(): string {
        return navigator.userAgent.toLowerCase();
    }

    private _buildNewItem = (configItem: ConfigNewItem): HTMLAnchorElement => {
        const name = configItem.name || configItem.item;
        
        const a = document.createElement('a');
        a.href = configItem.href;
        a.target = configItem.target || '';
        a.setAttribute(ATTRIBUTE.PANEL, name.toLowerCase().replace(/\s+/, '-'));
        if (configItem.hide) {
            a.style.display = 'none';
        }
        a.setAttribute(ATTRIBUTE.ARIA_SELECTED, 'false');

        a.innerHTML = `
            <paper-icon-item
                role="option"
                tabindex="0"
                ${ATTRIBUTE.ARIA_DISABLED}="false"
            >
                <ha-icon
                    slot="item-icon"
                    icon="${configItem.icon}"
                >
                </ha-icon>
                <span class="item-text">
                    ${ name }
                </span>
            </paper-icon-item>
        `.trim();

        return a;
    }

    private _updateName(element: HTMLAnchorElement, name: string): void {
        element
            .querySelector(SELECTOR.ITEM_TEXT)
            .textContent = name;
    }

    private _updateIcon(element: HTMLAnchorElement, icon: string): void {
        const iconElement = element.querySelector(
            [
                ELEMENT.HA_SVG_ICON,
                ELEMENT.HA_ICON
            ].join(',')
        );
        if (iconElement) {
            if (iconElement.nodeName === ELEMENT.HA_SVG_ICON.toUpperCase()) {
                const haIcon = document.createElement(ELEMENT.HA_ICON);
                haIcon.setAttribute('icon', icon);
                haIcon.setAttribute('slot', 'item-icon');
                iconElement.replaceWith(haIcon);
            } else {
                iconElement.setAttribute('icon', icon);
            }
        }
    }

    private _setTitle(): void {
        const titleElementPromise = this._sidebar
            .selector
            .$
            .query(SELECTOR.TITLE)
            .element;
        this
            ._getElementWithConfig(titleElementPromise)
            .then(([config, titleElement]): void => {
                if (config.title) {
                    titleElement.innerHTML = config.title;
                }
            }); 
    }

    private _rearrange(): void {
        Promise.all([
            this._getOrder(),
            this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element,
            this._sidebar.selector.$.query(`${ELEMENT.PAPER_LISTBOX} > ${SELECTOR.ITEM}`).all,
            this._sidebar.selector.$.query(`${ELEMENT.PAPER_LISTBOX} > ${SELECTOR.SPACER}`).element
        ])
            .then(([order, paperListBox, items, spacer]) => {
                let orderIndex = 0;
                let crossedBottom = false;

                const orderWithItems: ConfigOrderWithItem[] = order.map((orderItem: ConfigOrder): ConfigOrderWithItem => {
                    const { item, new_item, exact } = orderItem;
                    const itemLowerCase = item.toLocaleLowerCase();
                    const element = new_item
                        ? undefined
                        : Array.from(items).find((element: Element): boolean => {
                            const text = element.querySelector(SELECTOR.ITEM_TEXT).textContent.trim();
                            if (exact) {
                                return text === item;
                            }
                            return (
                                text.toLocaleLowerCase().includes(itemLowerCase) ||
                                element.getAttribute(ATTRIBUTE.PANEL).toLocaleLowerCase() === itemLowerCase
                            );
                        });
                    if (element) {
                        element.setAttribute(ATTRIBUTE.PROCESSED, 'true');
                    }
                    return {
                        ...orderItem,
                        element
                    };
                });

                const unprocessedItemsTotal = Array.from(items).reduce((total: number, element: Element) => {
                    if (!element.hasAttribute(ATTRIBUTE.PROCESSED)) {
                        return total + 1;
                    }
                    return total;
                }, 0);

                const processBottom = () => {
                    if (!crossedBottom) {
                        Array.from(items).forEach((element: HTMLElement) => {
                            if (!element.hasAttribute(ATTRIBUTE.PROCESSED)) {
                                element.style.order = `${orderIndex}`;
                            }
                        });
                        orderIndex ++;
                        (spacer as HTMLDivElement).style.order = `${orderIndex}`;
                        orderIndex ++;
                        crossedBottom = true;
                    }
                };

                orderWithItems.forEach((orderItem: ConfigOrderWithItem): void => {

                    if (orderItem.bottom) {
                        processBottom();
                    }

                    if (orderItem.new_item) {

                        const newItem = this._buildNewItem(orderItem);
                        newItem.style.order = `${orderIndex}`;
                        paperListBox.appendChild(newItem);

                    } else if (orderItem.element) {

                        const element = orderItem.element as HTMLAnchorElement;
                        element.style.order = `${orderIndex}`;

                        if (orderItem.hide) {
                            element.style.display = 'none';
                        }

                        if (orderItem.name) {
                            this._updateName(element, orderItem.name);
                        }

                        if (orderItem.icon) {
                            this._updateIcon(element, orderItem.icon);
                        }

                        if (orderItem.href) {
                            element.href = orderItem.href;
                        }

                        if (orderItem.target) {
                            element.target = orderItem.target;
                        }

                    }

                    orderIndex++;

                });

                processBottom();
                
            });
    }

    private async _captureUrlChanges(): Promise<void> {
        let path = location.pathname;
        const className = 'iron-selected';
        const links = await this._sidebar
            .selector
            .$
            .query(`${ELEMENT.PAPER_LISTBOX} > ${SELECTOR.ITEM}`)
            .all;
        const partialPanelResolver = await this._partialPanelResolver.element;
        const observer = new MutationObserver(() => {
            if (path !== location.pathname) {
                path = location.pathname;
                Array.from(links).forEach((anchor: HTMLAnchorElement): void => {
                    if (anchor.href.endsWith(path)) {
                        anchor.classList.add(className);
                        anchor.setAttribute(ATTRIBUTE.ARIA_SELECTED, 'true');
                    } else {
                        anchor.classList.remove(className);
                        anchor.setAttribute(ATTRIBUTE.ARIA_SELECTED, 'false');
                    }
                });
            }
        });
        observer.observe(partialPanelResolver, { childList: true, subtree: true });
    }

    private _process(): void {
        this._setTitle();
        this._rearrange();
        this._captureUrlChanges();
    }

}

new CustomSidebar();