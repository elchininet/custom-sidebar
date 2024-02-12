import {
    HAQuerySelector,
    HAQuerySelectorEvent,
    OnListenDetail,
    HAElement
} from 'home-assistant-query-selector';
import HomeAssistantJavaScriptTemplates from 'home-assistant-javascript-templates';
import {
    HomeAsssistantExtended,
    Config,
    ConfigNewItem,
    ConfigOrder,
    ConfigOrderWithItem,
    HassObject,
    PartialPanelResolver,
    PaperListBox,
    Match,
    SuscriberEvent,
    RenderTextParams
} from '@types';
import {
    ELEMENT,
    SELECTOR,
    ATTRIBUTE,
    CLASS,
    EVENT,
    TEMPLATE_REG,
    DOMAIN_REGEXP
} from '@constants';
import {
    logVersionToConsole,
    getPromisableElement,
    getFinalOrder,
    addStyle
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
                this._partialPanelResolver = event.detail.PARTIAL_PANEL_RESOLVER;
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

        this._items = [];
        this._entities = new Map<string, ConfigOrderWithItem[]>();
        this._titleEntities = new Set<string>();
        this._sidebarScroll = 0;
        this._itemTouchedBinded = this._itemTouched.bind(this);
        this._configPromise = fetchConfig();
        this._process();
    }

    private _configPromise: Promise<Config>;
    private _homeAssistant: HAElement;
    private _ha: HomeAsssistantExtended;
    private _partialPanelResolver: HAElement;
    private _sidebar: HAElement;
    private _sidebarScroll: number;
    private _renderer: HomeAssistantJavaScriptTemplates;
    private _entities: Map<string, ConfigOrderWithItem[]>;
    private _titleEntities: Set<string>;
    private _items: ConfigOrderWithItem[];
    private _itemTouchedBinded: (event: Event) => Promise<void>;

    private async _getOrder(): Promise<ConfigOrder[]> {
        const device = this._getCurrentDevice();
        return this._configPromise
            .then((config: Config) => {
                return getFinalOrder(
                    this._ha.hass.user.name.toLocaleLowerCase(),
                    device,
                    config.order,
                    config.exceptions
                );
            });
    }

    private async _getElements(): Promise<[HTMLElement, NodeListOf<HTMLAnchorElement>, HTMLElement]> {
        const paperListBox = (await this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element) as HTMLElement;
        const spacer = await getPromisableElement<HTMLElement>(
            () => paperListBox.querySelector<HTMLElement>(`:scope > ${SELECTOR.SPACER}`),
            (spacer: HTMLElement): boolean => !! spacer
        );
        const items = await getPromisableElement<NodeListOf<HTMLAnchorElement>>(
            () => paperListBox.querySelectorAll<HTMLAnchorElement>(`:scope > ${SELECTOR.ITEM}`),
            (elements: NodeListOf<HTMLAnchorElement>): boolean => {
                return Array.from(elements).every((element: HTMLAnchorElement): boolean => {
                    const text = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT).innerText.trim();
                    return text.length > 0;
                });
            }
        );
        return [paperListBox, items, spacer];
    }

    private async _hasReady(): Promise<HassObject> {
        return getPromisableElement(
            () => this._ha.hass,
            (hass: HassObject): boolean => !!(
                hass &&
                hass.areas &&
                hass.devices &&
                hass.entities &&
                hass.states &&
                hass.user
            )
        );
    }

    private _getElementWithConfig<P>(promise: Promise<P>): Promise<[Config, Awaited<P>]> {
        return Promise.all([
            this._configPromise,
            promise
        ]);
    }

    private _getCurrentDevice(): string {
        return navigator.userAgent.toLowerCase();
    }

    private _buildNewItem = (configItem: ConfigNewItem): HTMLAnchorElement => {
        
        const name = configItem.name
            ? this._renderText(configItem.name, { configItem })
            : configItem.item;
        const notification = this._renderText(configItem.notification, { configItem });

        const a = document.createElement('a');
        a.href = configItem.href;
        a.target = configItem.target || '';
        a.setAttribute(ATTRIBUTE.ROLE, 'option');
        a.setAttribute(ATTRIBUTE.PANEL, configItem.item.toLowerCase().replace(/\s+/, '-'));
        if (configItem.hide) {
            a.style.display = 'none';
        }
        a.setAttribute(ATTRIBUTE.ARIA_SELECTED, 'false');

        if (notification.length) {
            a.setAttribute(ATTRIBUTE.WITH_NOTIFICATION, 'true');
        }

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
                <span class="${CLASS.NOTIFICATIONS_BADGE} ${CLASS.NOTIFICATIONS_BADGE_COLLAPSED}">
                    ${ notification }
                </span>
                <span class="item-text">
                    ${ name }
                </span>
                <span class="${CLASS.NOTIFICATIONS_BADGE}">
                    ${ notification }
                </span>
            </paper-icon-item>
        `.trim();

        return a;
    }

    private _updateName(element: HTMLAnchorElement, name: string): void {
        element
            .querySelector<HTMLElement>(SELECTOR.ITEM_TEXT)
            .innerText = name;
    }

    private _updateNotification(element: HTMLAnchorElement, notification: string): void {
        let badge = element.querySelector(`${SELECTOR.NOTIFICATION_BADGE}:not(${SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED})`);
        let badgeCollapsed = element.querySelector(SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED);
        if (!badge) {
            badge = document.createElement('span');
            badge.classList.add(CLASS.NOTIFICATIONS_BADGE);
            element
                .querySelector(ELEMENT.PAPER_ICON_ITEM)
                .appendChild(badge);
        }
        if (!badgeCollapsed) {
            badgeCollapsed = document.createElement('span');
            badgeCollapsed.classList.add(CLASS.NOTIFICATIONS_BADGE, CLASS.NOTIFICATIONS_BADGE_COLLAPSED);
            element
                .querySelector(`${ELEMENT.HA_SVG_ICON}, ${ELEMENT.HA_ICON}`)
                .after(badgeCollapsed);
        }
        if (notification.length) {
            badge.innerHTML = notification;
            badgeCollapsed.innerHTML = notification;
            element.setAttribute(ATTRIBUTE.WITH_NOTIFICATION, 'true');
        } else {
            badge.innerHTML = '';
            badgeCollapsed.innerHTML = '';
            element.removeAttribute(ATTRIBUTE.WITH_NOTIFICATION);
        }        
    }

    private _updateIcon(element: HTMLAnchorElement, icon: string): void {
        const iconElement = element.querySelector(
            [
                ELEMENT.HA_SVG_ICON,
                ELEMENT.HA_ICON
            ].join(',')
        );
        if (iconElement) {
            const haIcon = document.createElement(ELEMENT.HA_ICON);
            haIcon.setAttribute('icon', icon);
            haIcon.setAttribute('slot', 'item-icon');
            iconElement.replaceWith(haIcon);
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
                    titleElement.innerHTML = this._renderText(
                        config.title,
                        {
                            title: true
                        }
                    );
                }
            }); 
    }

    private _renderText(template: string | undefined, params: RenderTextParams): string {
        if (TEMPLATE_REG.test(template)) {

            this._renderer.cleanTracked();

            const code = template.replace(TEMPLATE_REG, '$1');
            const compiled = this._renderer.renderTemplate(code);
            const tracked = this._renderer.tracked;
            
            [...tracked.entities, ...tracked.domains].forEach((id: string): void => {

                if (params.configItem) {
                    if (this._entities.has(id)) {
                        const configs = this._entities.get(id);
                        if (!configs.includes(params.configItem)) {
                            configs.push(params.configItem);
                        }
                    } else {
                        this._entities
                            .set(id, [ params.configItem ]);
                    }
                }

                if (params.title) {
                    this._titleEntities.add(id);
                }

            });

            if (
                typeof compiled === 'string' ||
                (
                    typeof compiled === 'number' &&
                    !Number.isNaN(compiled)
                ) ||
                typeof compiled === 'boolean' ||
                typeof compiled === 'object'
            ) {
                if (typeof compiled === 'string') {
                    return compiled.trim();
                }
                if (
                    typeof compiled === 'number' ||
                    typeof compiled === 'boolean'
                ) {
                    return compiled.toString();
                }
                return JSON.stringify(compiled);
            }
            return '';
        }
        return template || '';
    }

    private _addSidebarStyles(): void {
        this._sidebar.selector.$.element
            .then((sideBarShadowRoot: ShadowRoot): void => {
                addStyle(
                    `
                    ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.NOTIFICATION_BADGE }:not(${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED }) {
                        border-radius: 20px;
                        left: calc(var(--app-drawer-width, 248px) - 22px);
                        max-width: 80px;
                        overflow: hidden;
                        padding: 0px 5px;
                        transform: translateX(-100%);
                        text-overflow: ellipsis;
                        text-wrap: nowrap;   
                    }
                    ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED } {
                        bottom: 14px;
                        font-size: 0.65em;
                        left: 26px;
                        position: absolute;  
                    }
                    :host([expanded]) ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED } {
                        opacity: 0;
                    }
                    ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM }[${ ATTRIBUTE.WITH_NOTIFICATION }] > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT } {
                        max-width: calc(100% - 86px);
                    }
                    `.trim(),
                    sideBarShadowRoot
                );
            });
    }

    private async _watchForEntitiesChange() {
        (await window.hassConnection).conn.subscribeMessage((e) => this._entityWatchCallback(e), {
			type: 'subscribe_events',
			event_type: 'state_changed'
		});
    }

    private _entityWatchCallback(event: SuscriberEvent) {
        if (
            this._entities.size ||
            this._titleEntities.size
        ) {
            const entityId = event.data.entity_id;
            const domain = entityId.replace(DOMAIN_REGEXP, '$1');
            if (this._entities.has(entityId)) {
                this._updateTemplates(
                    this._entities.get(entityId)
                );
            }
            if (this._entities.has(domain)) {
                this._updateTemplates(
                    this._entities.get(domain)
                );
            }
            if (
                this._titleEntities.has(entityId) ||
                this._titleEntities.has(domain)
            ) {
                this._setTitle();
            }
        }
    }

    private _updateTemplates(configItems: ConfigOrderWithItem[]) {
        configItems.forEach((configItem: ConfigOrderWithItem) => {
            if (configItem.element) {
                if (
                    configItem.name &&
                    TEMPLATE_REG.test(configItem.name)
                ) {
                    this._updateName(
                        configItem.element,
                        this._renderText(
                            configItem.name,
                            {
                                configItem
                            }
                        )
                    );
                }
                if (
                    configItem.notification &&
                    TEMPLATE_REG.test(configItem.notification)
                ) {
                    this._updateNotification(
                        configItem.element,
                        this._renderText(
                            configItem.notification,
                            {
                                configItem
                            }
                        )
                    );
                }
            }            
        });
    }

    private _rearrange(): void {
        Promise.all([
            this._getOrder(),
            this._getElements()
        ])
            .then(([order, elements]) => {

                const [ paperListBox, items, spacer ] = elements;

                let orderIndex = 0;
                let crossedBottom = false;

                const itemsArray = Array.from(items) as HTMLAnchorElement[];
                const matched: Set<Element> = new Set();

                this._items = order.map((orderItem: ConfigOrder): ConfigOrderWithItem => {
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
                                        : element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT).innerText.trim()
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
                        itemsArray.forEach((element: HTMLElement) => {
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

                this._items.forEach((orderItem: ConfigOrderWithItem): void => {

                    if (orderItem.bottom) {
                        processBottom();
                    }

                    if (orderItem.new_item) {

                        const newItem = this._buildNewItem(orderItem);
                        newItem.style.order = `${orderIndex}`;
                        paperListBox.appendChild(newItem);

                        newItem.addEventListener(EVENT.MOUSEDOWN, this._itemTouchedBinded);

                        orderItem.element = newItem;

                    } else if (orderItem.element) {

                        const element = orderItem.element as HTMLAnchorElement;
                        element.style.order = `${orderIndex}`;

                        if (orderItem.hide) {
                            element.style.display = 'none';
                        }

                        if (orderItem.name) {
                            this._updateName(
                                element,
                                this._renderText(
                                    orderItem.name,
                                    {
                                        configItem: orderItem
                                    }
                                )
                            );
                        }

                        if (orderItem.notification) {
                            this._updateNotification(
                                element,
                                this._renderText(
                                    orderItem.notification,
                                    {
                                        configItem: orderItem
                                    }
                                )
                            );
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

                this._updateSidebarSelection();
                this._watchForEntitiesChange();
                
            });
    }

    private async _itemTouched(): Promise<void> {
        this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element
            .then((paperListBox: PaperListBox): void => {
                this._sidebarScroll = paperListBox.scrollTop;
            });
    }

    private async _updateSidebarSelection(): Promise<void> {

        const className = 'iron-selected';
        const panelResolver = await this._partialPanelResolver.element as PartialPanelResolver;
        const pathName = panelResolver.__route.path;
        const paperListBox = await this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element as PaperListBox;
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

        this._homeAssistant
            .element
            .then((ha: HomeAsssistantExtended) => {
                this._ha = ha;
                this._hasReady()
                    .then(() => {
                        this._renderer = new HomeAssistantJavaScriptTemplates(this._ha);
                        this._setTitle();
                        this._rearrange();
                    });
            });
        
        this._addSidebarStyles();
    }

}

if (!window.CustomSidebar) {
    logVersionToConsole();
    window.CustomSidebar = new CustomSidebar();
}