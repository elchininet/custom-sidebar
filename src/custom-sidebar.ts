import { getPromisableResult } from 'get-promisable-result';
import {
    HAQuerySelector,
    HAQuerySelectorEvent,
    OnListenDetail,
    HAElement
} from 'home-assistant-query-selector';
import HomeAssistantJavaScriptTemplates, {
    HomeAssistantJavaScriptTemplatesRenderer,
    HassConnection
} from 'home-assistant-javascript-templates';
import { HomeAssistantStylesManager } from 'home-assistant-styles-manager';
import {
    HomeAsssistantExtended,
    HomeAssistantMain,
    HaMenuButton,
    Config,
    ConfigNewItem,
    ConfigOrder,
    ConfigOrderWithItem,
    OnClickAction,
    ActionType,
    PartialPanelResolver,
    Sidebar,
    SidebarMode,
    Match,
    SubscriberTemplate,
    Primitive,
    PrimitiveObject,
    PrimitiveArray
} from '@types';
import {
    NAMESPACE,
    ELEMENT,
    SELECTOR,
    ATTRIBUTE,
    CUSTOM_SIDEBAR_CSS_VARIABLES,
    ITEM_OPTIONS_VARIABLES_MAP,
    SIDEBAR_OPTIONS_VARIABLES_MAP,
    TYPE,
    KEY,
    CLASS,
    EVENT,
    CHECK_FOCUSED_SHADOW_ROOT,
    NODE_NAME,
    JS_TEMPLATE_REG,
    JINJA_TEMPLATE_REG,
    PROFILE_PATH,
    PROFILE_GENERAL_PATH,
    BLOCKED_PROPERTY,
    SIDEBAR_MODE_TO_DOCKED_SIDEBAR,
    MAX_ATTEMPTS,
    RETRY_DELAY,
    DOMAIN_ENTITY_REGEXP,
    REF_VARIABLE_REGEXP
} from '@constants';
import {
    logVersionToConsole,
    getConfig,
    flushPromise,
    getTemplateWithPartials
} from '@utilities';
import * as STYLES from '@styles';
import { fetchConfig } from '@fetchers/json';

class CustomSidebar {

    constructor() {

        const selector = new HAQuerySelector();

        selector.addEventListener(
            HAQuerySelectorEvent.ON_LISTEN,
            (event: CustomEvent<OnListenDetail>) => {
                this._homeAssistant = event.detail.HOME_ASSISTANT;
                this._main = event.detail.HOME_ASSISTANT_MAIN;
                this._haDrawer = event.detail.HA_DRAWER;
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

        this._styleManager = new HomeAssistantStylesManager({
            prefix: NAMESPACE,
            namespace: NAMESPACE,
            throwWarnings: false
        });

        this._items = [];
        this._sidebarScroll = 0;
        this._isSidebarEditable = undefined;
        this._itemTouchedBinded = this._itemTouched.bind(this);
        this._mouseEnterBinded = this._mouseEnter.bind(this);
        this._mouseLeaveBinded = this._mouseLeave.bind(this);
        this._configPromise = fetchConfig();
        this._process();
    }

    private _configPromise: Promise<Config>;
    private _config: Config;
    private _homeAssistant: HAElement;
    private _main: HAElement;
    private _haDrawer: HAElement;
    private _ha: HomeAsssistantExtended;
    private _partialPanelResolver: HAElement;
    private _sidebar: HAElement;
    private _sidebarScroll: number;
    private _isSidebarEditable: boolean | undefined;
    private _renderer: HomeAssistantJavaScriptTemplatesRenderer;
    private _styleManager: HomeAssistantStylesManager;
    private _items: HTMLAnchorElement[];
    private _itemTouchedBinded: () => Promise<void>;
    private _mouseEnterBinded: (event: MouseEvent) => void;
    private _mouseLeaveBinded: () => void;

    private async _getConfig(): Promise<void> {
        this._config = await this._configPromise
            .then((config: Config) => {
                return getConfig(
                    this._ha.hass.user,
                    navigator.userAgent.toLowerCase(),
                    config
                );
            });
    }

    private _parseJavaScriptVariables = (): Record<string, Primitive | PrimitiveObject | PrimitiveArray> => {
        const jsVariables = this._config.js_variables ?? {};
        const entries = Object.entries(jsVariables);
        const finalEntries = entries.filter((entry: [string, Primitive | PrimitiveObject | PrimitiveArray]): boolean => {
            const [name, value] = entry;
            if (
                typeof value === 'string' &&
                REF_VARIABLE_REGEXP.test(value)
            ) {
                const refValue = value.replace(REF_VARIABLE_REGEXP, '$1');
                this._renderer.renderTemplate(`
                    const myRef = ref('${name}');
                    myRef.value = ${refValue};
                    return;
                `);
                return false;
            }
            return true;
        });
        return Object.fromEntries(finalEntries);
    };

    private async _getElements(): Promise<[HTMLElement, NodeListOf<HTMLAnchorElement>, HTMLElement]> {
        const promisableResultOptions = {
            retries: MAX_ATTEMPTS,
            delay: RETRY_DELAY,
            shouldReject: false
        };
        const paperListBox = (await this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element) as HTMLElement;
        const spacer = await getPromisableResult<HTMLElement>(
            () => paperListBox.querySelector<HTMLElement>(`:scope > ${SELECTOR.SPACER}`),
            (spacer: HTMLElement): boolean => !! spacer,
            promisableResultOptions
        );
        const items = await getPromisableResult<NodeListOf<HTMLAnchorElement>>(
            () => paperListBox.querySelectorAll<HTMLAnchorElement>(`:scope > ${SELECTOR.ITEM}`),
            (elements: NodeListOf<HTMLAnchorElement>): boolean => {
                return Array.from(elements).every((element: HTMLAnchorElement): boolean => {
                    const text = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT).innerText.trim();
                    return text.length > 0;
                });
            },
            promisableResultOptions
        );
        return [paperListBox, items, spacer];
    }

    private _hideAnchor(anchor: HTMLAnchorElement, hide: boolean): void {
        if (hide) {
            anchor.style.display = 'none';
        } else {
            anchor.style.removeProperty('display');
        }
    }

    private _buildNewItem(configItem: ConfigNewItem): HTMLAnchorElement {

        const a = document.createElement('a');
        a.href = configItem.href
            ? configItem.href
            : '#';
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
                <span class="${CLASS.NOTIFICATIONS_BADGE} ${CLASS.NOTIFICATIONS_BADGE_COLLAPSED}"></span>
                <span class="item-text">
                    ${ configItem.item }
                </span>
                <span class="${CLASS.NOTIFICATIONS_BADGE}"></span>
            </paper-icon-item>
        `.trim();

        return a;
    }

    private async _getTemplateString(template: unknown): Promise<string> {
        let rendered = '';
        if (
            template instanceof Promise ||
            typeof template === 'string' ||
            (
                typeof template === 'number' &&
                !Number.isNaN(template)
            ) ||
            typeof template === 'boolean' ||
            typeof template === 'object'
        ) {
            if (typeof template === 'string') {
                rendered = template.trim();
            } else if (
                typeof template === 'number' ||
                typeof template === 'boolean'
            ) {
                rendered = template.toString();
            } else if (template instanceof Promise) {
                const result = await template;
                rendered = await this._getTemplateString(result);
            } else {
                rendered = JSON.stringify(template);
            }
        }
        return rendered;
    }

    private _subscribeTitle(): void {
        this._sidebar
            .selector
            .$
            .query(SELECTOR.TITLE)
            .element
            .then((titleElement: HTMLElement) => {
                if (this._config.title) {
                    this._subscribeTemplate(
                        this._config.title,
                        (rendered: string) => {
                            titleElement.innerHTML = rendered;
                        }
                    );
                }
                if (this._config.subtitle) {
                    this._subscribeTemplate(
                        this._config.subtitle,
                        (rendered: string) => {
                            titleElement.dataset.subtitle = rendered;
                        }
                    );
                }
            });
    }

    private _subscribeSideBarEdition(): void {

        const sidebarEditListener = (event: CustomEvent): void => {
            event.preventDefault();
            event.stopImmediatePropagation();
        };

        const unblockSidebar = (homeAssistantMain: Element, menu: Element) => {
            homeAssistantMain.removeEventListener(EVENT.HASS_EDIT_SIDEBAR, sidebarEditListener, true);
            menu.removeAttribute(BLOCKED_PROPERTY);
        };

        const blockSidebar = (homeAssistantMain: Element, menu: Element) => {
            homeAssistantMain.removeEventListener(EVENT.HASS_EDIT_SIDEBAR, sidebarEditListener, true);
            homeAssistantMain.addEventListener(EVENT.HASS_EDIT_SIDEBAR, sidebarEditListener, true);
            menu.setAttribute(BLOCKED_PROPERTY, '');
        };

        // Apply sidebar edit blocker
        Promise.all([
            this._main.element,
            this._sidebar.selector.$.query(SELECTOR.MENU).element
        ]).then(([homeAssistantMain, menu]) => {
            if (typeof this._config.sidebar_editable === 'boolean') {
                this._isSidebarEditable = this._config.sidebar_editable;
                if (!this._isSidebarEditable) {
                    blockSidebar(homeAssistantMain, menu);
                }
            }
            if (typeof this._config.sidebar_editable === 'string') {
                this._subscribeTemplate(
                    this._config.sidebar_editable,
                    (rendered: string) => {
                        if (rendered === 'true' || rendered === 'false') {
                            this._isSidebarEditable = !(rendered === 'false');
                            if (this._isSidebarEditable) {
                                unblockSidebar(homeAssistantMain, menu);
                            } else {
                                blockSidebar(homeAssistantMain, menu);
                            }
                        } else {
                            this._isSidebarEditable = undefined;
                            unblockSidebar(homeAssistantMain, menu);
                        }
                        this._checkProfileEditableButton();
                    }
                );
            }
        });

    }

    private _subscribeAttributes(
        configOrderItem: ConfigOrderWithItem,
        attributes: string | Record<string, string | number | boolean>
    ) {

        const insertAttributes = (attrs: [string, string | number | boolean][]): void => {
            const customSidebarAttributes = configOrderItem.element.getAttribute(ATTRIBUTE.CUSTOM_SIDEBAR_ATTRIBUTES)?.split('|') ?? [];
            customSidebarAttributes.forEach((attr: string): void => {
                configOrderItem.element.removeAttribute(attr);
            });
            customSidebarAttributes.splice(0);
            attrs.forEach((entry) => {
                const [name, value] = entry;
                if (
                    typeof value === TYPE.STRING ||
                    typeof value === TYPE.NUMBER ||
                    typeof value === TYPE.BOOLEAN
                ) {
                    configOrderItem.element.setAttribute(name, `${value}`);
                    customSidebarAttributes.push(name);
                } else {
                    console.warn(`${NAMESPACE}: the property "${name}" in the attributes property of the item "${configOrderItem.item}" should be a string, a number or a boolean. This property will be omitted`);
                }
            });
            configOrderItem.element.setAttribute(ATTRIBUTE.CUSTOM_SIDEBAR_ATTRIBUTES, customSidebarAttributes.join('|'));
        };

        if (typeof attributes === 'string') {
            this._subscribeTemplate(
                attributes,
                (rendered: string): void => {
                    try {
                        const parsedAttributes = JSON.parse(rendered);
                        insertAttributes(
                            Object.entries(parsedAttributes)
                        );
                    } catch {
                        throw new SyntaxError(`${NAMESPACE}: "attributes" template must always return an object`);
                    }
                }
            );
        } else {
            insertAttributes(
                Object.entries(attributes)
            );
        }
    }

    private _subscribeName(element: HTMLElement, name: string): void {
        const itemText = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT);
        this._subscribeTemplate(
            name,
            (rendered: string): void => {
                itemText.innerHTML = rendered;
            }
        );
    }

    private _subscribeIcon(element: HTMLAnchorElement, icon: string): void {
        this._subscribeTemplate(
            icon,
            (rendered: string): void => {
                let haIcon = element.querySelector(ELEMENT.HA_ICON);
                if (!haIcon) {
                    haIcon = document.createElement(ELEMENT.HA_ICON);
                    haIcon.setAttribute('slot', 'item-icon');
                    const haSvgIcon = element.querySelector(ELEMENT.HA_SVG_ICON);
                    if (haSvgIcon) {
                        haSvgIcon.replaceWith(haIcon);
                    } else {
                        element.querySelector(ELEMENT.PAPER_ICON_ITEM).prepend(haIcon);
                    }
                }
                haIcon.setAttribute('icon', rendered);
            }
        );
    }

    private _subscribeInfo(element: HTMLElement, info: string): void {
        const textElement = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT);
        this._subscribeTemplate(
            info,
            (rendered: string): void => {
                textElement.dataset.info = rendered;
            }
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
                .append(badge);
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

        this._subscribeTemplate(notification, callback);

    }

    private _subscribeHide(element: HTMLAnchorElement, hide: boolean | string) {
        if (typeof hide === 'boolean') {
            this._hideAnchor(element, hide);
        } else {
            this._subscribeTemplate(
                hide,
                (rendered: string): void => {
                    this._hideAnchor(
                        element,
                        rendered === 'true'
                    );
                }
            );
        }
    }

    private _subscribeTemplateColorChanges<T, K extends keyof T>(
        config: T,
        element: HTMLElement,
        dictionary: [K, string][]
    ): void {
        dictionary.forEach(([option, cssVariable]) => {
            if (config[option]) {
                this._subscribeTemplate(
                    config[option] as string,
                    (rendered: string): void => {
                        element.style.setProperty(
                            cssVariable,
                            rendered
                        );
                    }
                );
            }
        });
    }

    private _subscribeTemplate(template: string, callback: (rendered: string) => void): void {
        if (JS_TEMPLATE_REG.test(template)) {
            this._createJsTemplateSubscription(
                template.replace(JS_TEMPLATE_REG, '$1'),
                callback
            );
        } else if (JINJA_TEMPLATE_REG.test(template)) {
            this._createJinjaTemplateSubscription(
                template,
                callback
            );
        } else {
            this._getTemplateString(template)
                .then((result: string) => {
                    callback(result);
                });
        }
    }

    private _createJsTemplateSubscription(
        template: string,
        callback: (result: string) => void
    ): void {
        this._renderer.trackTemplate(
            getTemplateWithPartials(
                template,
                this._config.partials
            ),
            (result: unknown): void => {
                this._getTemplateString(result)
                    .then((templateResult: string) => {
                        callback(templateResult);
                    });
            }
        );

    }

    private _createJinjaTemplateSubscription(
        template: string,
        callback?: (rendered: string) => void
    ): void {
        window.hassConnection.then((hassConnection: HassConnection): void => {
            hassConnection.conn.subscribeMessage<SubscriberTemplate>(
                (message: SubscriberTemplate): void => {
                    callback(`${message.result}`);
                },
                {
                    type: EVENT.RENDER_TEMPLATE,
                    template: getTemplateWithPartials(
                        template,
                        this._config.partials
                    ),
                    variables: {
                        user_name: this._ha.hass.user.name,
                        user_is_admin: this._ha.hass.user.is_admin,
                        user_is_owner: this._ha.hass.user.is_owner,
                        user_agent: window.navigator.userAgent,
                        ...(this._config.jinja_variables)
                    }
                }
            );
        });
    }

    private _focusItem(activeIndex: number, forward: boolean, focusPaperItem: boolean): void {

        const length = this._items.length;
        const noneDisplay = 'none';
        let focusIndex = 0;

        if (forward) {
            const start = activeIndex + 1;
            const end = start + length;
            for (let i = start; i < end; i++) {
                const index = i > length - 1
                    ? i - length
                    : i;
                if (this._items[index].style.display !== noneDisplay) {
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
                if (this._items[index].style.display !== noneDisplay) {
                    focusIndex = index;
                    break;
                }
            }
        }

        if (focusPaperItem) {
            const paperItem = this._items[focusIndex].querySelector<HTMLElement>(ELEMENT.PAPER_ICON_ITEM);
            paperItem.focus();
        } else {
            this._items[focusIndex].focus();
            this._items[focusIndex].tabIndex = 0;
        }

    }

    private _focusItemByKeyboard(paperListBox: HTMLElement, forward: boolean): void {

        const activeAnchor = paperListBox.querySelector<HTMLAnchorElement>(
            `
                ${SELECTOR.SCOPE} > ${SELECTOR.ITEM}:not(.${CLASS.IRON_SELECTED}):focus,
                ${SELECTOR.SCOPE} > ${SELECTOR.ITEM}:focus,
                ${SELECTOR.SCOPE} > ${SELECTOR.ITEM}:has(> ${ELEMENT.PAPER_ICON_ITEM}:focus)
            `
        );

        let activeIndex = 0;

        this._items.forEach((anchor: HTMLAnchorElement, index: number): void => {
            if (anchor === activeAnchor) {
                activeIndex = index;
            }
            anchor.tabIndex = -1;
        });

        this._focusItem(activeIndex, forward, false);

    }

    private _focusItemByTab(sidebarShadowRoot: ShadowRoot, element: HTMLElement, forward: boolean): void {

        if (element.nodeName === NODE_NAME.A) {

            const anchor = element as HTMLAnchorElement;
            const activeIndex = this._items.indexOf(anchor);
            const lastIndex = this._items.length - 1;

            if (
                (forward && activeIndex < lastIndex) ||
                (!forward && activeIndex > 0)
            ) {

                this._focusItem(activeIndex, forward, true);

            } else {

                const element = forward
                    ? sidebarShadowRoot.querySelector<HTMLElement>(SELECTOR.SIDEBAR_NOTIFICATIONS)
                    : sidebarShadowRoot.querySelector<HTMLElement>(ELEMENT.HA_ICON_BUTTON);
                element.focus();

            }

        } else {
            if (forward) {
                const profile = sidebarShadowRoot.querySelector<HTMLElement>(`${SELECTOR.PROFILE} > ${ELEMENT.PAPER_ICON_ITEM}`);
                profile.focus();
            } else {
                this._focusItem(0, forward, true);
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

    private _processDefaultPath() {

        const pathname = this._config.default_path;

        if (pathname) {

            if (pathname.startsWith('/')) {

                const params: Parameters<typeof window.history.replaceState> = [
                    null,
                    '',
                    pathname
                ];

                window.history.replaceState(...params);

                window.dispatchEvent(
                    new CustomEvent(
                        EVENT.LOCATION_CHANGED,
                        {
                            detail: {
                                replace: pathname
                            }
                        }
                    )
                );

            } else {
                console.warn(`${NAMESPACE}: ignoring default_path property as it doesn't start with "/".`);
            }

        }
    }

    private _processSidebar(): void {

        // Process Home Assistant Main and Partial Panel Resolver
        Promise.all([
            this._main.element,
            this._partialPanelResolver.element
        ]).then(([homeAssistantMain, partialPanelResolver]: [HomeAssistantMain, PartialPanelResolver]) => {

            const sidebarMode = this._config.sidebar_mode;
            const mql = matchMedia('(max-width: 870px)');

            if (sidebarMode) {

                homeAssistantMain.hass.dockedSidebar = SIDEBAR_MODE_TO_DOCKED_SIDEBAR[sidebarMode];

                const checkForNarrow = async (isNarrow: boolean): Promise<void> => {
                    if (sidebarMode !== SidebarMode.HIDDEN) {
                        await flushPromise();
                        homeAssistantMain.narrow = false;
                        await flushPromise();
                        partialPanelResolver.narrow = isNarrow;
                        await flushPromise();
                        if (isNarrow) {
                            const haMenuButton = await this._partialPanelResolver.selector.query(SELECTOR.HA_MENU_BUTTON).element as HaMenuButton;
                            haMenuButton.narrow = false;
                        }
                    }
                };

                mql.addEventListener('change', (event: MediaQueryListEvent): void => {
                    checkForNarrow(event.matches);
                });

                checkForNarrow(mql.matches);
            }

        });

        // Process sidebar
        Promise.all([
            this._haDrawer.selector.$.query(SELECTOR.MC_DRAWER).element,
            this._sidebar.element,
            this._sidebar.selector.$.element,
            this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element
        ]).then(([mcDrawer, sidebar, sideBarShadowRoot, paperListBox]: [HTMLElement, HTMLElement, ShadowRoot, HTMLElement]) => {

            this._subscribeTemplateColorChanges(
                this._config,
                sidebar,
                SIDEBAR_OPTIONS_VARIABLES_MAP
            );

            this._subscribeTemplateColorChanges(
                this._config,
                mcDrawer,
                [
                    ['sidebar_border_color',    CUSTOM_SIDEBAR_CSS_VARIABLES.BORDER_COLOR]
                ]
            );

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

            this._styleManager.addStyle(
                STYLES.SIDEBAR_BORDER_COLOR,
                mcDrawer
            );

            this._styleManager.addStyle(
                [
                    STYLES.FUNCTIONALITY,
                    STYLES.TITLE_COLOR,
                    STYLES.SUBTITLE_COLOR,
                    STYLES.SIDEBAR_BUTTON_COLOR,
                    STYLES.SIDEBAR_BACKGROUND,
                    STYLES.MENU_BACKGROUND_DIVIDER_TOP_COLOR,
                    STYLES.DIVIDER_BOTTOM_COLOR_DIVIDER_COLOR,
                    STYLES.SCROLL_THUMB_COLOR,
                    STYLES.SIDEBAR_EDITABLE,
                    STYLES.ITEM_BACKGROUND,
                    STYLES.ITEM_BACKGROUND_HOVER,
                    STYLES.ITEM_DIVIDER_ITEM_DIVIDER_COLOR,
                    STYLES.ICON_COLOR,
                    STYLES.ICON_COLOR_SELECTED,
                    STYLES.ICON_COLOR_HOVER,
                    STYLES.TEXT_COLOR,
                    STYLES.TEXT_COLOR_SELECTED,
                    STYLES.TEXT_COLOR_HOVER,
                    STYLES.SELECTION_BACKGROUND_SELECTION_OPACITY,
                    STYLES.INFO_COLOR,
                    STYLES.INFO_COLOR_SELECTED,
                    STYLES.INFO_COLOR_HOVER,
                    STYLES.NOTIFICATION_COLOR_SELECTED_NOTIFICATION_TEXT_COLOR_SELECTED,
                    STYLES.NOTIFICATION_COLOR_HOVER_NOTIFICATION_TEXT_COLOR_HOVER,
                    this._config.styles || ''
                ],
                sideBarShadowRoot
            );

        });

    }

    private _rearrange(): void {
        this._getElements()
            .then((elements) => {

                const { order, hide_all } = this._config;
                const [paperListBox, items, spacer] = elements;

                let orderIndex = 0;
                let crossedBottom = false;

                this._items = Array.from(items);
                const matched: Set<Element> = new Set();

                if (hide_all) {
                    this._items.forEach((element: HTMLAnchorElement): void => {
                        this._hideAnchor(element, true);
                    });
                }

                const configItems: ConfigOrderWithItem[] = order.reduce(
                    (acc: ConfigOrderWithItem[], orderItem: ConfigOrder): ConfigOrderWithItem[] => {
                        const { item, match, exact, new_item } = orderItem;
                        const itemLowerCase = item.toLocaleLowerCase();
                        const element = new_item
                            ? undefined
                            : this._items.find((element: Element): boolean => {
                                const text = match === Match.DATA_PANEL
                                    ? element.getAttribute(ATTRIBUTE.PANEL)
                                    : (
                                        match === Match.HREF
                                            ? element.getAttribute(ATTRIBUTE.HREF)
                                            : element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT).innerText.trim()
                                    );

                                const matchText = (
                                    (!!exact && item === text) ||
                                    // for non-admins, data-panel is not present in the config item
                                    // due to this, text will be undefined in those cases
                                    // as the tests run against an admin account, this cannot be covered
                                    /* istanbul ignore next */
                                    (!exact && !!text?.toLowerCase().includes(itemLowerCase))
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
                        this._items.forEach((element: HTMLElement) => {
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

                    if (orderItem.new_item) {

                        const newItem = this._buildNewItem(orderItem);
                        paperListBox.append(newItem);

                        orderItem.element = newItem;

                        orderItem.element.setAttribute(ATTRIBUTE.PROCESSED, 'true');

                        this._items.push(orderItem.element);

                    } else if (orderItem.element) {

                        const element = orderItem.element as HTMLAnchorElement;

                        if (orderItem.href) {
                            element.href = orderItem.href;
                        }

                        if (orderItem.target) {
                            element.target = orderItem.target;
                        }

                    }

                    orderItem.element.style.order = `${orderIndex}`;

                    if (typeof orderItem.attributes !== 'undefined') {
                        this._subscribeAttributes(
                            orderItem,
                            orderItem.attributes
                        );
                    }

                    if (orderItem.divider) {
                        orderItem.element.setAttribute(ATTRIBUTE.WITH_DIVIDER, 'true');
                    }

                    if (orderItem.name) {
                        this._subscribeName(
                            orderItem.element,
                            orderItem.name
                        );
                    }

                    if (orderItem.icon) {
                        this._subscribeIcon(
                            orderItem.element,
                            orderItem.icon
                        );
                    }

                    if (orderItem.info) {
                        this._subscribeInfo(
                            orderItem.element,
                            orderItem.info
                        );
                    }

                    if (orderItem.notification) {
                        this._subscribeNotification(
                            orderItem.element,
                            orderItem.notification
                        );
                    }

                    if (typeof orderItem.hide !== 'undefined') {
                        this._subscribeHide(
                            orderItem.element,
                            orderItem.hide
                        );
                    }

                    this._subscribeTemplateColorChanges(
                        orderItem,
                        orderItem.element,
                        ITEM_OPTIONS_VARIABLES_MAP
                    );

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

                    if (orderItem.on_click) {
                        orderItem.element.addEventListener(EVENT.CLICK, this._mouseClick.bind(this, orderItem.on_click), true);
                    }

                    orderIndex++;

                });

                if (configItems.length) {
                    processBottom();
                }

                this._items.sort(
                    (
                        linkA: HTMLAnchorElement,
                        linkB: HTMLAnchorElement
                    ): number => +linkA.style.order - +linkB.style.order
                );

                this._panelLoaded();

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

    private async _mouseClick(onClickAction: OnClickAction, event: MouseEvent): Promise<void> {
        const anchor = event.currentTarget as HTMLAnchorElement;
        const hasHashBangAsHref = anchor.getAttribute(ATTRIBUTE.HREF) === '#';
        const dataPanel = anchor.getAttribute(ATTRIBUTE.PANEL);
        if (hasHashBangAsHref) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }

        const renderTemplate = (code: string): string => {
            const finalCode = code.includes('return')
                ? code
                : `${code}\n;return;`;
            return this._renderer.renderTemplate(
                getTemplateWithPartials(
                    finalCode,
                    this._config.partials
                )
            );
        };

        switch(onClickAction.action) {
            case ActionType.CALL_SERVICE: {
                const { service, data = {} } = onClickAction;
                const matches = service.match(DOMAIN_ENTITY_REGEXP);
                const compiledDataEntries = Object.entries(data).map(([key, value]) => {
                    const stringValue = `${value}`;
                    if (JS_TEMPLATE_REG.test(stringValue)) {
                        return [
                            key,
                            renderTemplate(
                                stringValue.replace(JS_TEMPLATE_REG, '$1')
                            )
                        ];
                    }
                    return [key, value];
                });
                if (matches?.length === 3) {
                    this._ha.hass.callService(
                        matches[1],
                        matches[2],
                        Object.fromEntries(compiledDataEntries)
                    );
                } else {
                    console.warn(`${NAMESPACE} ignoring "${ActionType.CALL_SERVICE}" action in "${dataPanel}" item. The service parameter is malfomed.`);
                }
                break;
            }
            case ActionType.JAVASCRIPT: {
                const { code } = onClickAction;
                renderTemplate(code);
                break;
            }
        }
    }

    private async _checkProfileEditableButton(): Promise<void> {
        const panelResolver = await this._partialPanelResolver.element as PartialPanelResolver;
        const pathName = panelResolver.__route.path;
        // Disable the edit sidebar button in the profile panel
        if (pathName === PROFILE_GENERAL_PATH) {
            const editSidebarButton = await this._partialPanelResolver.selector.query(SELECTOR.EDIT_SIDEBAR_BUTTON).element;
            if (editSidebarButton) {
                if (this._isSidebarEditable === false) {
                    editSidebarButton.setAttribute(ATTRIBUTE.DISABLED, '');
                } else {
                    editSidebarButton.removeAttribute(ATTRIBUTE.DISABLED);
                }
            }
        }
    }

    private async _panelLoaded(): Promise<void> {

        // Select the right element in the sidebar
        const panelResolver = await this._partialPanelResolver.element as PartialPanelResolver;
        const pathName = panelResolver.__route.path;
        const paperListBox = await this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element as HTMLElement;
        const activeLink = paperListBox.querySelector<HTMLAnchorElement>(
            `
               ${SELECTOR.SCOPE} > ${SELECTOR.ITEM}[href="${pathName}"],
               ${SELECTOR.SCOPE} > ${SELECTOR.ITEM}[href="${pathName}/dashboard"]
            `
        );

        const activeParentLink = activeLink
            ? null
            : this._items.reduce((link: HTMLAnchorElement | null, anchor: HTMLAnchorElement): HTMLAnchorElement | null => {
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

        this._items.forEach((anchor: HTMLAnchorElement) => {
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

        this._checkProfileEditableButton();

    }

    private _process(): void {

        this._homeAssistant
            .element
            .then((ha: HomeAsssistantExtended) => {
                this._ha = ha;
                new HomeAssistantJavaScriptTemplates(this._ha)
                    .getRenderer()
                    .then((renderer) => {
                        this._renderer = renderer;
                        this._getConfig()
                            .then(() => {
                                this._renderer.variables = this._parseJavaScriptVariables();
                                this._processDefaultPath();
                                this._processSidebar();
                                this._subscribeTitle();
                                this._subscribeSideBarEdition();
                                this._rearrange();
                            });
                    });
            });
    }

}

if (!window.CustomSidebar) {
    logVersionToConsole();
    window.CustomSidebar = new CustomSidebar();
}