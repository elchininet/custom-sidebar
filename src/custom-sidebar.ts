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
    Sidebar,
    Match,
    HassConnection,
    SubscriberEvent,
    SubscriberTemplate,
    Version
} from '@types';
import {
    NAMESPACE,
    ELEMENT,
    SELECTOR,
    ATTRIBUTE,
    KEY,
    CLASS,
    EVENT,
    CHECK_FOCUSED_SHADOW_ROOT,
    NODE_NAME,
    JS_TEMPLATE_REG,
    JINJA_TEMPLATE_REG,
    PROFILE_PATH,
    DOMAIN_REGEXP,
    SUBSCRIBE_TYPE
} from '@constants';
import {
    logVersionToConsole,
    parseVersion,
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
                this._main = event.detail.HOME_ASSISTANT_MAIN;
                this._sidebar = event.detail.HA_SIDEBAR;
                this._partialPanelResolver = event.detail.PARTIAL_PANEL_RESOLVER;
            },
            {
                once: true
            }
        );

        selector.addEventListener(
            HAQuerySelectorEvent.ON_PANEL_LOAD,
            this._panelLoaded.bind(this)
        );

        selector.listen();

        this._items = [];
        this._jsSuscriptions = new Map<string, Map<Element, () => void>>();
        this._sidebarScroll = 0;
        this._itemTouchedBinded = this._itemTouched.bind(this);
        this._mouseEnterBinded = this._mouseEnter.bind(this);
        this._mouseLeaveBinded = this._mouseLeave.bind(this);
        this._configPromise = fetchConfig();
        this._process();
    }

    private _configPromise: Promise<Config>;
    private _homeAssistant: HAElement;
    private _main: HAElement;
    private _ha: HomeAsssistantExtended;
    private _partialPanelResolver: HAElement;
    private _sidebar: HAElement;
    private _sidebarScroll: number;
    private _renderer: HomeAssistantJavaScriptTemplates;
    private _jsSuscriptions: Map<string, Map<Element, () => void>>;
    private _items: ConfigOrderWithItem[];
    private _version: Version | null;
    private _itemTouchedBinded: () => Promise<void>;
    private _mouseEnterBinded: (event: MouseEvent) => void;
    private _mouseLeaveBinded: () => void;

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

    private _buildNewItem(configItem: ConfigNewItem): HTMLAnchorElement {

        const a = document.createElement('a');
        a.href = configItem.href;
        a.target = configItem.target || '';
        a.tabIndex = -1;
        a.setAttribute(ATTRIBUTE.ROLE, 'option');
        a.setAttribute(ATTRIBUTE.PANEL, configItem.item.toLowerCase().replace(/\s+/, '-'));

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
                <span class="${CLASS.NOTIFICATIONS_BADGE} ${CLASS.NOTIFICATIONS_BADGE_COLLAPSED}"></span>
                <span class="item-text">
                    ${ configItem.item }
                </span>
                <span class="${CLASS.NOTIFICATIONS_BADGE}"></span>
            </paper-icon-item>
        `.trim();

        return a;
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

    private _subscribeTitle(): void {
        const titleElementPromise = this._sidebar
            .selector
            .$
            .query(SELECTOR.TITLE)
            .element;
        this
            ._getElementWithConfig(titleElementPromise)
            .then(([config, titleElement]): void => {
                if (config.title) {
                    this._subscribeTemplate(titleElement, config.title);
                }
            });
    }

    private _subscribeName(element: Element, name: string): void {
        this._subscribeTemplate(
            element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT),
            name
        );
    }

    private _subscribeNotification(element: HTMLAnchorElement, notification: string): void {
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

        const callback = (rendered: string): void => {
            if (rendered.length) {
                badge.innerHTML = rendered;
                badgeCollapsed.innerHTML = rendered;
                element.setAttribute(ATTRIBUTE.WITH_NOTIFICATION, 'true');
            } else {
                badge.innerHTML = '';
                badgeCollapsed.innerHTML = '';
                element.removeAttribute(ATTRIBUTE.WITH_NOTIFICATION);
            }
        };

        this._subscribeTemplate(badge, notification, callback);

    }

    private _subscribeTemplate(element: Element, template: string, callback?: (rendered: string) => void): void {
        element.innerHTML = '';
        if (JS_TEMPLATE_REG.test(template)) {
            this._createJsTemplateSubscription(
                element,
                template.replace(JS_TEMPLATE_REG, '$1'),
                callback
            );
        } else if (JINJA_TEMPLATE_REG.test(template)) {
            this._createJinjaTemplateSubscription(
                element,
                template,
                callback
            );
        } else {
            if (callback) {
                callback(template);
            } else {
                element.innerHTML = template;
            }
        }
    }

    private _createJsTemplateSubscription(
        element: Element,
        code: string,
        extraCallback?: (rendered: string) => void
    ): void {

        const callback = () => {
            this._renderer.cleanTracked();
            const compiled = this._renderer.renderTemplate(code);
            const tracked = this._renderer.tracked;
            const {entities, domains} = tracked;
            [...entities, ...domains].forEach((id: string): void => {
                if (this._jsSuscriptions.has(id)) {
                    const elements = this._jsSuscriptions.get(id);
                    if (!elements.has(element)) {
                        elements.set(element, callback);
                    }
                } else {
                    this._jsSuscriptions.set(
                        id,
                        new Map([
                            [element, callback]
                        ])
                    );
                }
            });
            let rendered = '';
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
                    rendered = compiled.trim();
                } else if (
                    typeof compiled === 'number' ||
                    typeof compiled === 'boolean'
                ) {
                    rendered = compiled.toString();
                } else {
                    rendered = JSON.stringify(compiled);
                }
            }
            if (extraCallback) {
                extraCallback(rendered);
            } else {
                element.innerHTML = rendered;
            }
        };

        callback();

    }

    private _createJinjaTemplateSubscription(
        element: Element,
        template: string,
        callback?: (rendered: string) => void
    ): void {
        window.hassConnection.then((hassConnection: HassConnection): void => {
            hassConnection.conn.subscribeMessage<SubscriberTemplate>(
                (message: SubscriberTemplate): void => {
                    if (callback) {
                        callback(`${message.result}`);
                    } else {
                        element.innerHTML = `${message.result}`;
                    }
                },
                {
                    type: SUBSCRIBE_TYPE.RENDER_TEMPLATE,
                    template
                }
            );
        });
    }

    private _focusItemByKeyboard(paperListBox: HTMLElement, forward: boolean): void {
        const lastIndex = this._items.length - 1;
        const activeAnchor = paperListBox.querySelector(`
            ${SELECTOR.SCOPE} > ${SELECTOR.ITEM}:not(.${CLASS.IRON_SELECTED}):focus,
            ${SELECTOR.SCOPE} > ${SELECTOR.ITEM}:focus,
            ${SELECTOR.SCOPE} > ${SELECTOR.ITEM}:has(> ${ELEMENT.PAPER_ICON_ITEM}:focus)
        `.trim());

        let activeIndex: number = 0;
        let focusIndex: number;
        for (const entry of Object.entries(this._items)) {
            const [index, configItem] = entry;
            if (configItem.element === activeAnchor) {
                activeIndex = +index;
            }
            configItem.element.tabIndex = -1;
        }
        if (forward) {
            focusIndex = activeIndex < lastIndex
                ? activeIndex + 1
                : 0;
        } else {
            focusIndex = activeIndex > 0
                ? activeIndex - 1
                : lastIndex;
        }
        this._items[focusIndex].element.focus();
        this._items[focusIndex].element.tabIndex = 0;
    }

    private _focusItemByTab(sidebarShadowRoot: ShadowRoot, element: HTMLElement, forward: boolean): void {

        const lastIndex = this._items.length - 1;

        if (element.nodeName === NODE_NAME.A) {

            const anchor = element as HTMLAnchorElement;

            const activeIndex = this._items.findIndex((configItem: ConfigOrderWithItem): boolean => configItem.element === anchor);

            let focusIndex: number = NaN;

            if (forward && activeIndex < lastIndex) {
                focusIndex = activeIndex + 1;
            } else if (!forward && activeIndex > 0) {
                focusIndex = activeIndex - 1;
            }

            if (Number.isNaN(focusIndex)) {
                if (forward) {
                    const notifications = sidebarShadowRoot.querySelector<HTMLElement>(SELECTOR.SIDEBAR_NOTIFICATIONS);
                    notifications.focus();
                } else {
                    const menuButton = sidebarShadowRoot.querySelector<HTMLElement>(ELEMENT.HA_ICON_BUTTON);
                    menuButton.focus();
                }
            } else {
                this._items[focusIndex].element.querySelector<HTMLElement>(ELEMENT.PAPER_ICON_ITEM).focus();
            }

        } else {
            if (forward) {
                const profile = sidebarShadowRoot.querySelector<HTMLElement>(`${SELECTOR.PROFILE} > ${ELEMENT.PAPER_ICON_ITEM}`);
                profile.focus();
            } else {
                this._items[lastIndex].element.querySelector<HTMLElement>(ELEMENT.PAPER_ICON_ITEM).focus();
            }
        }

    }

    private _getActivePaperIconElement(root: Document | ShadowRoot = document): Element | null {
        const activeEl = root.activeElement;
        if (activeEl) {
            if (
                activeEl instanceof HTMLElement &&
                (
                    activeEl.nodeName === NODE_NAME.PAPER_ICON_ITEM ||
                    (
                        activeEl.nodeName === NODE_NAME.A &&
                        activeEl.getAttribute('role') === 'option'
                    )
                )
            ) {
                return activeEl;
            }
            return activeEl.shadowRoot && CHECK_FOCUSED_SHADOW_ROOT.includes(activeEl.nodeName)
                ? this._getActivePaperIconElement(activeEl.shadowRoot)
                : null;
        }
        // In theory, activeElement could be null
        // but this is hard to reproduce during the tests
        // because there is always an element focused (e.g. the body)
        // So excluding this from the coverage
        /* istanbul ignore next */
        return null;
    }

    private _processSidebar(): void {

        // Apply sidebar edit blocker
        this._getElementWithConfig(
            this._main.element
        ).then(([config, homeAssistantMain]): void => {
            if (config.sidebar_editable === false) {
                homeAssistantMain.addEventListener(EVENT.HASS_EDIT_SIDEBAR, (event: CustomEvent): void => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }, true);
            }
        });

        // Add overrriding styles
        this._getElementWithConfig(
            this._sidebar.selector.$.element
        ).then(([config, sideBarShadowRoot]) => {

            const paperListBox = sideBarShadowRoot.querySelector<HTMLElement>(ELEMENT.PAPER_LISTBOX);

            paperListBox.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent) => {
                if (
                    event.key === KEY.ARROW_DOWN ||
                    event.key === KEY.ARROW_UP
                ) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this._focusItemByKeyboard(paperListBox, event.key === KEY.ARROW_DOWN);
                }
            }, true);

            window.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent) => {
                if (
                    event.key === KEY.TAB
                ) {
                    const activePaperItem = this._getActivePaperIconElement();
                    if (activePaperItem) {
                        if (activePaperItem.nodeName === NODE_NAME.PAPER_ICON_ITEM) {
                            const parentElement = activePaperItem.parentElement as HTMLElement;
                            if (parentElement.getAttribute(ATTRIBUTE.HREF) !== PROFILE_PATH) {
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                this._focusItemByTab(sideBarShadowRoot, parentElement, !event.shiftKey);
                            }
                        } else if (activePaperItem.getAttribute(ATTRIBUTE.HREF) !== PROFILE_PATH) {
                            event.preventDefault();
                            event.stopImmediatePropagation();
                            this._focusItemByTab(sideBarShadowRoot, activePaperItem as HTMLElement, !event.shiftKey);
                        }
                    }
                }
            }, true);

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
                ${ config.styles || '' }
                `.trim(),
                sideBarShadowRoot
            );
        });
    }

    private _watchForEntitiesChange() {
        window.hassConnection.then((hassConnection: HassConnection): void => {
            hassConnection.conn.subscribeMessage<SubscriberEvent>(
                (event) => this._entityWatchCallback(event),
                {
                    type: SUBSCRIBE_TYPE.SUBSCRIBE_EVENTS,
                    event_type: 'state_changed'
                }
            );
        });
    }

    private _entityWatchCallback(event: SubscriberEvent) {
        if (this._jsSuscriptions.size) {
            const entityId = event.data.entity_id;
            const domain = entityId.replace(DOMAIN_REGEXP, '$1');
            if (this._jsSuscriptions.has(entityId)) {
                const elements = this._jsSuscriptions.get(entityId);
                const callbacks = elements.values();
                Array.from(callbacks).forEach((callback) => {
                    callback();
                });
            }
            if (this._jsSuscriptions.has(domain)) {
                const elements = this._jsSuscriptions.get(domain);
                const callbacks = elements.values();
                Array.from(callbacks).forEach((callback) => {
                    callback();
                });
            }
        }
    }

    private _rearrange(): void {
        Promise.all([
            this._getOrder(),
            this._getElements()
        ])
            .then(([order, elements]) => {

                const [paperListBox, items, spacer] = elements;

                let orderIndex = 0;
                let crossedBottom = false;

                const itemsArray = Array.from(items) as HTMLAnchorElement[];
                const matched: Set<Element> = new Set();

                const configItems: ConfigOrderWithItem[] = order.reduce(
                    (acc: ConfigOrderWithItem[], orderItem: ConfigOrder): ConfigOrderWithItem[] => {
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
                        if (new_item || element) {
                            acc.push({
                                ...orderItem,
                                element
                            });
                        }
                        if (!new_item && !element) {
                            console.warn(`${NAMESPACE}: you have an order item in your configuration that didn't match any sidebar item: "${item}"`);
                        }
                        return acc;
                    },
                    []
                );

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

                configItems.forEach((orderItem: ConfigOrderWithItem): void => {

                    if (orderItem.bottom) {
                        processBottom();
                    }

                    if (orderItem.new_item && !orderItem.hide) {

                        const newItem = this._buildNewItem(orderItem);
                        newItem.style.order = `${orderIndex}`;
                        paperListBox.appendChild(newItem);

                        orderItem.element = newItem;

                    } else if (orderItem.element) {

                        const element = orderItem.element as HTMLAnchorElement;
                        element.style.order = `${orderIndex}`;

                        if (orderItem.hide) {
                            element.style.display = 'none';
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

                    if (orderItem.name) {
                        this._subscribeName(
                            orderItem.element,
                            orderItem.name
                        );
                    }

                    if (orderItem.notification) {
                        this._subscribeNotification(
                            orderItem.element,
                            orderItem.notification
                        );
                    }

                    if (!orderItem.hide) {

                        if (orderItem.new_item) {

                            // New items rollover
                            orderItem.element.addEventListener(EVENT.MOUSEENTER, this._mouseEnterBinded);
                            orderItem.element.addEventListener(EVENT.MOUSELEAVE, this._mouseLeaveBinded);

                        }

                        // When the item is clicked
                        orderItem.element.addEventListener(EVENT.MOUSEDOWN, this._itemTouchedBinded);
                        orderItem.element.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent): void => {
                            if (event.key === KEY.ENTER) {
                                this._itemTouchedBinded();
                            }
                        });

                        this._items.push(orderItem);
                    }

                    orderIndex++;

                });

                processBottom();

                this._panelLoaded();
                this._watchForEntitiesChange();

            });
    }

    private async _itemTouched(): Promise<void> {
        this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element
            .then((paperListBox: HTMLElement): void => {
                this._sidebarScroll = paperListBox.scrollTop;
            });
    }

    private _mouseEnter(event: MouseEvent): void {
        this._sidebar.element
            .then((sidebar: Sidebar): void => {
                if (sidebar.alwaysExpand) {
                    return;
                }
                if (sidebar._mouseLeaveTimeout) {
                    clearTimeout(sidebar._mouseLeaveTimeout);
                    sidebar._mouseLeaveTimeout = undefined;
                }
                sidebar._showTooltip(event.currentTarget as HTMLAnchorElement);
            });
    }

    private async _mouseLeave(): Promise<void> {
        this._sidebar.element
            .then((sidebar: Sidebar): void => {
                if (sidebar._mouseLeaveTimeout) {
                    clearTimeout(sidebar._mouseLeaveTimeout);
                }
                sidebar._mouseLeaveTimeout = window.setTimeout(() => {
                    sidebar._hideTooltip();
                }, 500);
            });
    }

    private async _panelLoaded(): Promise<void> {

        const legacyVersion = (
            this._version?.[0] < 2024 ||
            (
                this._version?.[0] === 2024 &&
                this._version?.[1] <= 3
            )
        );

        // Select the right element in the sidebar
        const panelResolver = await this._partialPanelResolver.element as PartialPanelResolver;
        const pathName = panelResolver.__route.path;
        const paperListBox = await this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element as HTMLElement;
        const activeLink = paperListBox.querySelector<HTMLAnchorElement>(
            [
                `${SELECTOR.SCOPE} > ${SELECTOR.ITEM}[href="${pathName}"]`,
                `${SELECTOR.SCOPE} > ${SELECTOR.ITEM}[href="${pathName}/dashboard"]`
            ].join(',')
        );

        const activeParentLink = activeLink
            ? null
            : this._items.reduce((link: HTMLAnchorElement | null, configItem: ConfigOrderWithItem): HTMLAnchorElement | null => {
                const anchor = configItem.element;
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

        this._items.forEach((configItem: ConfigOrderWithItem) => {
            const anchor = configItem.element;
            const isActive = (
                activeLink &&
                activeLink === anchor
            ) ||
            (
                !activeLink &&
                activeParentLink === anchor
            );
            anchor.classList.toggle(CLASS.IRON_SELECTED, isActive);
            anchor.setAttribute(ATTRIBUTE.ARIA_SELECTED, `${isActive}`);
        });

        if (paperListBox.scrollTop !== this._sidebarScroll) {
            paperListBox.scrollTop = this._sidebarScroll;
        }

        // Disable the edit sidebar button in the profile panel
        if (
            (
                legacyVersion &&
                pathName === '/profile'
            ) ||
            (
                !legacyVersion &&
                pathName === '/profile/general'
            )
        ) {
            const config = await this._configPromise;
            const editSidebarButton = legacyVersion
                ? await this._partialPanelResolver.selector.query(SELECTOR.EDIT_SIDEBAR_BUTTON_LEGACY).element
                : await this._partialPanelResolver.selector.query(SELECTOR.EDIT_SIDEBAR_BUTTON).element;
            if (
                config.sidebar_editable === false &&
                editSidebarButton
            ) {
                editSidebarButton.setAttribute(ATTRIBUTE.DISABLED, '');
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
                        this._version = parseVersion(this._ha.hass.config?.version);
                        this._renderer = new HomeAssistantJavaScriptTemplates(this._ha);
                        this._subscribeTitle();
                        this._rearrange();
                    });
            });

        this._processSidebar();
    }

}

if (!window.CustomSidebar) {
    logVersionToConsole();
    window.CustomSidebar = new CustomSidebar();
}