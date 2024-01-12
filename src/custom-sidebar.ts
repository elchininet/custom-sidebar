import {
    HAQuerySelector,
    HAQuerySelectorEvent,
    OnListenDetail,
    OnPanelLoadDetail,
    HAElement
} from 'home-assistant-query-selector';
import {
    Config,
    ConfigNewItem,
    ConfigOrder,
    ConfigOrderWithItem,
    HomeAssistant,
    PartialPanelResolver,
    PaperListBox,
    Match
} from '@types';
import {
    ELEMENT,
    SELECTOR,
    ATTRIBUTE,
    EVENT
} from '@constants';
import {
    logVersionToConsole,
    getPromisableElement,
    getFinalOrder
} from '@utilities';
import { fetchConfig } from '@fetchers/json';

class CustomSidebar {

    constructor() {

        const selector = new HAQuerySelector();

        selector.addEventListener(
            HAQuerySelectorEvent.ON_LISTEN,
            (event: CustomEvent<OnListenDetail>) => {
                this._homeAssistant = event.detail.HOME_ASSISTANT;
                this._sidebar = event.detail.HA_SIDEBAR;
            },
            {
                once: true
            }
        );

        selector.addEventListener(
            HAQuerySelectorEvent.ON_PANEL_LOAD,
            this._updateSidebarSelection.bind(this)
        );        

        selector.listen();

        this._sidebarScroll = 0;
        this._itemTouchedBinded = this._itemTouched.bind(this);
        this._configPromise = fetchConfig();
        this._process();
    }

    private _configPromise: Promise<Config>;
    private _homeAssistant: HAElement;
    private _sidebar: HAElement;
    private _sidebarScroll: number;
    private _itemTouchedBinded: (event: Event) => Promise<void>;

    private async _getOrder(): Promise<ConfigOrder[]> {
        const user = await this._getCurrentUser();
        const device = this._getCurrentDevice();
        return this._configPromise
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
            this._configPromise,
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
        a.setAttribute(ATTRIBUTE.ROLE, 'option');
        a.setAttribute(ATTRIBUTE.PANEL, name.toLowerCase().replace(/\s+/, '-'));
        if (configItem.hide) {
            a.style.display = 'none';
        }
        a.setAttribute(ATTRIBUTE.ARIA_SELECTED, 'false');

        a.innerHTML = `
            <paper-icon-item
                tabindex="0"
                ${ATTRIBUTE.ROLE}="option"
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

                if (!order.length) return;

                const itemsArray = Array.from(items);
                const matched: Set<Element> = new Set();

                const orderWithItems: ConfigOrderWithItem[] = order.map((orderItem: ConfigOrder): ConfigOrderWithItem => {
                    const { item, match, exact, new_item } = orderItem;
                    const itemLowerCase = item.toLocaleLowerCase();
                    const element = new_item
                        ? undefined
                        : itemsArray.find((element: Element): boolean => {
                            const text = match === Match.DATA_PANEL
                                ? element.getAttribute(ATTRIBUTE.PANEL)
                                : (
                                    match === Match.HREF
                                        ? element.getAttribute(ATTRIBUTE.HREF)
                                        : element.querySelector(SELECTOR.ITEM_TEXT).textContent.trim()
                                );
                            
                            const matchText = (
                                (!!exact && item === text) ||
                                (!exact && text.toLowerCase().includes(itemLowerCase))
                            );
                            if (matchText) {
                                if (matched.has(element)) {
                                    return false;
                                } else {
                                    matched.add(element);
                                    return true;
                                }
                            }
                            return false;
                        });
                    if (element) {
                        element.setAttribute(ATTRIBUTE.PROCESSED, 'true');
                    }
                    return {
                        ...orderItem,
                        element
                    };
                });

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

                        newItem.addEventListener(EVENT.MOUSEDOWN, this._itemTouchedBinded);

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

                        orderItem.element.addEventListener(EVENT.MOUSEDOWN, this._itemTouchedBinded);

                    }

                    orderIndex++;

                });

                processBottom();
                
            });
    }

    private async _itemTouched(event: Event): Promise<void> {
        this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element
            .then((paperListBox: PaperListBox): void => {
                this._sidebarScroll = paperListBox.scrollTop;
            });
    }

    private async _updateSidebarSelection(event: CustomEvent<OnPanelLoadDetail>): Promise<void> {

        const { HA_SIDEBAR, PARTIAL_PANEL_RESOLVER } = event.detail;

        const className = 'iron-selected';
        const panelResolver = await PARTIAL_PANEL_RESOLVER.element as PartialPanelResolver;
        const pathName = panelResolver.__route?.path;
        const paperListBox = await HA_SIDEBAR.selector.$.query(ELEMENT.PAPER_LISTBOX).element as PaperListBox;
        const allLinks = paperListBox.querySelectorAll<HTMLAnchorElement>(`${SELECTOR.SCOPE} > ${SELECTOR.ITEM}`);
        const activeLink = paperListBox.querySelector<HTMLAnchorElement>(
            [
                `${SELECTOR.SCOPE} > ${SELECTOR.ITEM}[href="${pathName}"]`,
                `${SELECTOR.SCOPE} > ${SELECTOR.ITEM}[href="${pathName}/dashboard"]`
            ].join(',')
        );
        const activeParentLink = activeLink
            ? null
            : Array.from(allLinks).reduce((link: HTMLAnchorElement | null, anchor: HTMLAnchorElement): HTMLAnchorElement | null => {
                const href = anchor.getAttribute(ATTRIBUTE.HREF);
                if (pathName.startsWith(href)) {
                    if (
                        !link ||
                        href.length > link.getAttribute(ATTRIBUTE.HREF).length
                    ) {
                        link = anchor;
                    }
                }
                return link;
            }, null);

        if (pathName) {
            Array.from(allLinks).forEach((anchor: HTMLAnchorElement): void => {
                const isActive = (
                    activeLink &&
                    activeLink === anchor
                ) ||
                (
                    !activeLink &&
                    activeParentLink === anchor
                );
                anchor.classList.toggle(className, isActive);
                anchor.setAttribute(ATTRIBUTE.ARIA_SELECTED, `${isActive}`);
            });
            if (paperListBox.scrollTop !== this._sidebarScroll) {
                paperListBox.scrollTop = this._sidebarScroll;
            }
        }
    }

    private _process(): void {
        this._setTitle();
        this._rearrange();
    }

}

if (!window.CustomSidebar) {
    logVersionToConsole();
    window.CustomSidebar = new CustomSidebar();
}