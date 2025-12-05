import { getPromisableResult } from 'get-promisable-result';
import {
    HAElement,
    HAQuerySelector,
    HAQuerySelectorEvent,
    OnListenDetail
} from 'home-assistant-query-selector';
import HomeAssistantJavaScriptTemplates, {
    HomeAssistantJavaScriptTemplatesRenderer,
    HassConnection
} from 'home-assistant-javascript-templates';
import { HomeAssistantStylesManager } from 'home-assistant-styles-manager';
import {
    ActionType,
    AnalyticsConfig,
    Config,
    ConfigNewItem,
    ConfigOrder,
    ConfigOrderWithItem,
    DialogType,
    HomeAssistantMain,
    HomeAsssistantExtended,
    Match,
    PartialPanelResolver,
    Primitive,
    PrimitiveArray,
    PrimitiveObject,
    Sidebar,
    SidebarItem,
    SidebarMode,
    SubscriberTemplate
} from '@types';
import {
    ATTRIBUTE,
    BLOCKED_PROPERTY,
    CHECK_FOCUSED_SHADOW_ROOT,
    CLASS,
    CUSTOM_SIDEBAR_CSS_VARIABLES,
    DEBUG_URL_PARAMETER,
    DOMAIN_ENTITY_REGEXP,
    ELEMENT,
    EVENT,
    ITEM_OPTIONS_VARIABLES_MAP,
    JINJA_TEMPLATE_REG,
    JS_TEMPLATE_REG,
    KEY,
    LOGBOOK_DELAY,
    MAX_ATTEMPTS,
    NAMESPACE,
    NODE_NAME,
    PROFILE_GENERAL_PATH_REGEXP,
    REF_VARIABLE_REGEXP,
    RETRY_DELAY,
    SELECTOR,
    SIDEBAR_MODE_TO_DOCKED_SIDEBAR,
    SIDEBAR_OPTIONS_VARIABLES_MAP,
    URL_WITH_PARAMS_REGEXP
} from '@constants';
import {
    getConfig,
    getDialogsMethods,
    getRestApis,
    getTemplateWithPartials,
    isArray,
    isBoolean,
    isNumber,
    isObject,
    isRegExp,
    isString,
    isUndefined,
    logVersionToConsole,
    openMoreInfoDialog,
    openRestartDialog
} from '@utilities';
import * as STYLES from '@styles';
import { fetchConfig } from '@fetchers/json';

class CustomSidebar {

    constructor(enableDebug: boolean) {

        this._debug = enableDebug;

        const selector = new HAQuerySelector();

        selector.addEventListener(
            HAQuerySelectorEvent.ON_LISTEN,
            (event: CustomEvent<OnListenDetail>) => {

                this._homeAssistant = event.detail.HOME_ASSISTANT;
                this._main = event.detail.HOME_ASSISTANT_MAIN;
                this._haDrawer = event.detail.HA_DRAWER;
                this._sidebar = event.detail.HA_SIDEBAR;
                this._partialPanelResolver = event.detail.PARTIAL_PANEL_RESOLVER;

                this._debugLog(
                    'HAQuerySelector init executed',
                    {
                        HOME_ASSISTANT: this._homeAssistant,
                        HOME_ASSISTANT_MAIN: this._main,
                        HA_DRAWER: this._haDrawer,
                        HA_SIDEBAR: this._sidebar,
                        PARTIAL_PANEL_RESOLVER: this._partialPanelResolver
                    },
                    {
                        stringify: false
                    }
                );

            },
            {
                once: true
            }
        );

        selector.addEventListener(
            HAQuerySelectorEvent.ON_PANEL_LOAD,
            this._panelLoaded.bind(this)
        );

        this._huiViewContainerObserver = new MutationObserver(
            this._watchHuiViewContainer.bind(this)
        );

        selector.listen();

        this._styleManager = new HomeAssistantStylesManager({
            prefix: NAMESPACE,
            namespace: NAMESPACE,
            throwWarnings: false
        });

        this._debugLog('Starting the plugin...');

        this._items = [];
        this._logBookMessagesMap = new Map<string, number>();
        this._sidebarScroll = 0;
        this._itemTouchedBinded = this._itemTouched.bind(this);
        this._mouseEnterBinded = this._mouseEnter.bind(this);
        this._mouseLeaveBinded = this._mouseLeave.bind(this);
        this._configPromise = fetchConfig();
        this._process();
    }

    private _debug: boolean;
    private _configPromise: Promise<Config>;
    private _config: Config;
    private _homeAssistant: HAElement;
    private _main: HAElement;
    private _haDrawer: HAElement;
    private _ha: HomeAsssistantExtended;
    private _partialPanelResolver: HAElement;
    private _sidebar: HAElement;
    private _sidebarScroll: number;
    private _renderer: HomeAssistantJavaScriptTemplatesRenderer;
    private _styleManager: HomeAssistantStylesManager;
    private _items: SidebarItem[];
    private _logBookMessagesMap: Map<string, number>;
    private _huiViewContainerObserver: MutationObserver;
    private _itemTouchedBinded: () => Promise<void>;
    private _mouseEnterBinded: (event: MouseEvent) => void;
    private _mouseLeaveBinded: () => void;

    private _debugLog(
        topic: string,
        metadata?: unknown,
        config?: {
            stringify?: boolean;
            table?: boolean;
        }
    ): void {
        const {
            stringify = true,
            table = false
        } = config ?? {};
        if (this._debug) {
            const topicMessage = `${NAMESPACE} debug: ${topic}`;
            if (metadata) {
                console.groupCollapsed(topicMessage);
                if (table) {
                    console.table(metadata);
                } else {
                    console.log(
                        stringify
                            ? JSON.stringify(metadata, null, 4)
                            : metadata
                    );
                }
                console.groupEnd();
            } else {
                console.log(topicMessage);
            }
        }
    }

    private async _getConfig(): Promise<void> {

        this._debugLog('Getting the config...');

        this._config = await this._configPromise
            .then((config: Config) => {

                this._debugLog('Raw config', config);

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
                isString(value) &&
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

    private async _getElements(): Promise<[HTMLElement, NodeListOf<SidebarItem>, HTMLElement]> {
        const promisableResultOptions = {
            retries: MAX_ATTEMPTS,
            delay: RETRY_DELAY,
            shouldReject: false
        };
        const sidebarItemsContainer = (await this._sidebar.selector.$.query(SELECTOR.SIDEBAR_ITEMS_CONTAINER).element) as HTMLElement;
        const spacer = await getPromisableResult<HTMLElement>(
            () => sidebarItemsContainer.querySelector<HTMLElement>(`:scope > ${SELECTOR.SPACER}`),
            (spacer: HTMLElement): boolean => !! spacer,
            promisableResultOptions
        );
        const items = await getPromisableResult<NodeListOf<SidebarItem>>(
            () => sidebarItemsContainer.querySelectorAll<SidebarItem>(`:scope > ${ELEMENT.ITEM}`),
            (elements: NodeListOf<SidebarItem>): boolean => {
                return Array.from(elements).every((element: SidebarItem): boolean => {
                    const text = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT).innerText.trim();
                    return text.length > 0;
                });
            },
            promisableResultOptions
        );
        if (this._debug) {
            const elementsTable = Array.from(items).map((element: SidebarItem) => {
                const href = element.href;
                const intemText = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT);
                const text = intemText.textContent.trim();
                return {
                    text,
                    href
                };
            });
            this._debugLog(
                'Native sidebar items',
                elementsTable,
                {
                    table: true
                }
            );
        }
        return [sidebarItemsContainer, items, spacer];
    }

    private _getAnchorElement(element: HTMLElement): HTMLAnchorElement {
        return element
            .shadowRoot
            .querySelector<HTMLAnchorElement>(ELEMENT.ANCHOR);
    }

    private _getButtonElement(element: HTMLElement): HTMLAnchorElement {
        return element
            .shadowRoot
            .querySelector<HTMLAnchorElement>(ELEMENT.BUTTON);
    }

    private _hideItem(item: HTMLElement, hide: boolean): void {
        if (hide) {
            item.style.display = 'none';
        } else {
            item.style.removeProperty('display');
        }
    }

    private _buildNewItem(configItem: ConfigNewItem): SidebarItem {

        const item = document.createElement('ha-md-list-item') as SidebarItem;
        item.setAttribute(ATTRIBUTE.TYPE, 'link');

        item.href = configItem.href ?? '#';
        item.target = configItem.target ?? '';
        item.tabIndex = -1;

        item.innerHTML = `
            <span class="item-text" slot="headline">${ configItem.item }</span>
            <span class="badge" slot="end"></span>
        `;

        return item;
    }

    private async _getTemplateString(template: unknown): Promise<string> {
        let rendered = '';
        if (
            template instanceof Promise ||
            isString(template) ||
            isNumber(template) ||
            isBoolean(template) ||
            isObject(template) ||
            isArray(template) ||
            isRegExp(template)
        ) {
            if (isString(template)) {
                rendered = template.trim();
            } else if (
                isNumber(template) ||
                isBoolean(template)
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

        const unblockSidebar = (sidebar: Element, menu: Element) => {
            sidebar.removeEventListener(EVENT.SHOW_DIALOG, sidebarEditListener, true);
            menu.removeAttribute(BLOCKED_PROPERTY);
        };

        const blockSidebar = (sidebar: Element, menu: Element) => {
            sidebar.removeEventListener(EVENT.SHOW_DIALOG, sidebarEditListener, true);
            sidebar.addEventListener(EVENT.SHOW_DIALOG, sidebarEditListener, true);
            menu.setAttribute(BLOCKED_PROPERTY, '');
        };

        // Apply sidebar edit blocker
        Promise.all([
            this._sidebar.element,
            this._sidebar.selector.$.query(SELECTOR.MENU).element
        ]).then(([sidebar, menu]) => {
            if (isBoolean(this._config.sidebar_editable)) {
                if (!this._config.sidebar_editable) {
                    blockSidebar(sidebar, menu);
                }
            }
            if (isString(this._config.sidebar_editable)) {
                this._subscribeTemplate(
                    this._config.sidebar_editable,
                    (rendered: string) => {
                        let isSidebarEditable: boolean | undefined = undefined;
                        if (rendered === 'true' || rendered === 'false') {
                            isSidebarEditable = !(rendered === 'false');
                            if (isSidebarEditable) {
                                unblockSidebar(sidebar, menu);
                            } else {
                                blockSidebar(sidebar, menu);
                            }
                        } else {
                            isSidebarEditable = undefined;
                            unblockSidebar(sidebar, menu);
                        }
                        this._checkProfileEditableButton(isSidebarEditable);
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
                    isString(value) ||
                    isNumber(value) ||
                    isBoolean(value)
                ) {
                    configOrderItem.element.setAttribute(name, `${value}`);
                    customSidebarAttributes.push(name);
                } else {
                    console.warn(`${NAMESPACE}: the property "${name}" in the attributes property of the item "${configOrderItem.item}" should be a string, a number or a boolean. This property will be omitted`);
                }
            });
            configOrderItem.element.setAttribute(ATTRIBUTE.CUSTOM_SIDEBAR_ATTRIBUTES, customSidebarAttributes.join('|'));
        };

        if (isString(attributes)) {
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

    private _subscribeIcon(element: HTMLElement, icon: string): void {
        this._subscribeTemplate(
            icon,
            (rendered: string): void => {
                let haIcon = element.querySelector(ELEMENT.HA_ICON);
                if (!haIcon) {
                    haIcon = document.createElement(ELEMENT.HA_ICON);
                    haIcon.setAttribute(ATTRIBUTE.SLOT, 'start');
                    const haSvgIcon = element.querySelector(ELEMENT.HA_SVG_ICON);
                    if (haSvgIcon) {
                        haSvgIcon.replaceWith(haIcon);
                    } else {
                        element.prepend(haIcon);
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

    private _subscribeNotification(element: HTMLElement, notification: string): void {

        let badge = element.querySelector(SELECTOR.BADGE);

        if (!badge) {
            badge = document.createElement('span');
            badge.classList.add(CLASS.BADGE);
            badge.setAttribute(ATTRIBUTE.SLOT, 'end');
            element.append(badge);
        }

        const callback = (rendered: string): void => {
            if (rendered.length) {
                badge.innerHTML = rendered;
                element.setAttribute(ATTRIBUTE.WITH_NOTIFICATION, 'true');
            } else {
                badge.innerHTML = '';
                element.removeAttribute(ATTRIBUTE.WITH_NOTIFICATION);
            }
        };

        this._subscribeTemplate(notification, callback);

    }

    private _subscribeHide(element: HTMLElement, hide: boolean | string) {
        if (isBoolean(hide)) {
            this._hideItem(element, hide);
        } else {
            this._subscribeTemplate(
                hide,
                (rendered: string): void => {
                    this._hideItem(
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

    private _subscribeTemplate(template: string | number | boolean, callback: (rendered: string) => void): void {

        const templateWithPartials = getTemplateWithPartials(
            `${template}`,
            this._config.partials
        );

        if (JS_TEMPLATE_REG.test(templateWithPartials)) {
            this._createJsTemplateSubscription(
                templateWithPartials.replace(JS_TEMPLATE_REG, '$1'),
                callback
            );
        } else if (JINJA_TEMPLATE_REG.test(templateWithPartials)) {
            this._createJinjaTemplateSubscription(
                templateWithPartials,
                callback
            );
        } else {
            this._getTemplateString(templateWithPartials)
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
            template,
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
    ): ReturnType<HassConnection['conn']['subscribeMessage']> {
        return new Promise((resolve) => {
            window.hassConnection.then((hassConnection: HassConnection): void => {
                const cancelSubscriptionPromise = hassConnection.conn.subscribeMessage<SubscriberTemplate>(
                    (message: SubscriberTemplate): void => {
                        callback(`${message.result}`);
                    },
                    {
                        type: EVENT.RENDER_TEMPLATE,
                        template,
                        variables: {
                            user_name: this._ha.hass.user.name,
                            user_is_admin: this._ha.hass.user.is_admin,
                            user_is_owner: this._ha.hass.user.is_owner,
                            user_agent: window.navigator.userAgent,
                            ...(this._config.jinja_variables)
                        }
                    }
                );
                resolve(cancelSubscriptionPromise);
            });
        });
    }

    private _focusItem(activeIndex: number, forward: boolean): void {

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

        this._items[focusIndex].focus();
        this._items[focusIndex].tabIndex = 0;

    }

    private _focusItemByKeyboard(sidebarItemsContainer: HTMLElement, forward: boolean): void {

        const activeItem = sidebarItemsContainer.querySelector<HTMLElement>(
            `
                ${SELECTOR.SCOPE} > ${ELEMENT.ITEM}:not(.${CLASS.ITEM_SELECTED}):focus,
                ${SELECTOR.SCOPE} > ${ELEMENT.ITEM}:focus
            `
        );

        let activeIndex = 0;

        this._items.forEach((item: HTMLElement, index: number): void => {
            if (item === activeItem) {
                activeIndex = index;
            }
            item.tabIndex = -1;
        });

        this._focusItem(activeIndex, forward);

    }

    private _focusItemByTab(sidebarShadowRoot: ShadowRoot, element: SidebarItem, forward: boolean): void {

        const notifications = sidebarShadowRoot.querySelector<HTMLElement>(SELECTOR.SIDEBAR_NOTIFICATIONS);
        const profile = sidebarShadowRoot.querySelector<HTMLElement>(SELECTOR.USER);
        const haIconButton = sidebarShadowRoot.querySelector<HTMLElement>(ELEMENT.HA_ICON_BUTTON);
        const activeIndex = this._items.indexOf(element);

        if (
            element === notifications ||
            element === profile ||
            activeIndex >= 0
        ) {

            if (element === notifications) {

                if (forward) {
                    profile.focus();
                } else {
                    this._focusItem(0, forward);
                }

            } else if (element === profile) {

                notifications.focus();

            } else {

                const lastIndex = this._items.length - 1;

                if (
                    (forward && activeIndex < lastIndex) ||
                    (!forward && activeIndex > 0)
                ) {

                    this._focusItem(activeIndex, forward);

                } else {

                    if (forward) {
                        notifications.focus();
                    } else {
                        haIconButton.focus();
                    }

                }

            }

        }

    }

    private _getActiveElement(root: Document | ShadowRoot = document): Element | null {
        const activeEl = root.activeElement;
        if (activeEl) {
            if (
                activeEl instanceof HTMLElement &&
                activeEl.nodeName === NODE_NAME.ITEM
            ) {
                return activeEl;
            }
            return activeEl.shadowRoot && CHECK_FOCUSED_SHADOW_ROOT.includes(activeEl.nodeName)
                ? this._getActiveElement(activeEl.shadowRoot)
                : null;
        }
        // In theory, activeElement could be null
        // but this is hard to reproduce during the tests
        // because there is always an element focused (e.g. the body)
        // So excluding this from the coverage
        /* istanbul ignore next */
        return null;
    }

    private _isAnalyticsOptionEnabled(option: keyof AnalyticsConfig): boolean {
        return this._config.analytics &&
        (
            this._config.analytics === true ||
            this._config.analytics[option]
        );
    }

    private _getUserEntity(): string | undefined {
        const entities = Object.entries(this._ha.hass.entities);
        const personEntityEntry = entities.filter(
            ([, entityData]): boolean => {
                return `${entityData.name}`.toLowerCase() === this._ha.hass.user.name.toLocaleLowerCase();
            }
        );
        // During the tests, it is used a person so it has a person entity id
        // But in a real case scenario it is possible that the user doesn't have a person
        // In these cases there will not be any entity and the next code will return undefined
        /* istanbul ignore next */
        return personEntityEntry[0]?.[0];
    }

    private _logBookLog(message: string): void {

        window.clearTimeout(
            this._logBookMessagesMap.get(message)
        );

        this._logBookMessagesMap.set(
            message,
            window.setTimeout(() => {

                this._ha.hass.callService(
                    'logbook',
                    'log',
                    {
                        name: NAMESPACE,
                        message,
                        domain: 'person',
                        entity_id: this._getUserEntity()
                    }
                );

                this._logBookMessagesMap.delete(message);

            }, LOGBOOK_DELAY)
        );

    }

    private _processDefaultPath() {

        const pathnameString = this._config.default_path;

        if (pathnameString) {

            const pathnameWithPartials = getTemplateWithPartials(pathnameString, this._config.partials);

            if (JS_TEMPLATE_REG.test(pathnameWithPartials)) {

                const pathname = this._renderer.renderTemplate(
                    pathnameWithPartials.replace(JS_TEMPLATE_REG, '$1')
                );

                this._executeDefaultPath(pathname);

            } else if (JINJA_TEMPLATE_REG.test(pathnameWithPartials)) {

                const cancelSubscriptionPromise = this._createJinjaTemplateSubscription(
                    pathnameWithPartials,
                    (result: string) => {
                        this._executeDefaultPath(result);
                        cancelSubscriptionPromise.then((cancelSubscription: () => Promise<void>) => {
                            cancelSubscription();
                        });
                    }
                );

            } else {
                this._executeDefaultPath(pathnameWithPartials);
            }

        }
    }

    private _executeDefaultPath(pathname: string) {
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
            console.warn(`${NAMESPACE}: ignoring default_path property "${pathname}" as it doesn't start with "/".`);
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

                    const huiRoot = await this._partialPanelResolver.selector.query(SELECTOR.HUI_ROOT).$.element;

                    this._styleManager.removeStyle(huiRoot);

                    if (sidebarMode !== SidebarMode.HIDDEN) {

                        homeAssistantMain.narrow = false;
                        partialPanelResolver.narrow = isNarrow;

                        if (isNarrow) {
                            this._styleManager.addStyle(
                                STYLES.HIDDEN_MENU_BUTTON_IN_NARROW_MODE,
                                huiRoot
                            );
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
            this._sidebar.selector.$.query(SELECTOR.SIDEBAR_ITEMS_CONTAINER).element
        ]).then((elements: [HTMLElement, HTMLElement, ShadowRoot, HTMLElement]) => {

            const [
                mcDrawer,
                sidebar,
                sideBarShadowRoot,
                sidebarItemsContainer
            ] = elements;

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

            sidebarItemsContainer.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent) => {
                if (
                    event.key === KEY.ARROW_DOWN ||
                    event.key === KEY.ARROW_UP
                ) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this._focusItemByKeyboard(sidebarItemsContainer, event.key === KEY.ARROW_DOWN);
                }
            }, true);

            window.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent) => {
                if (event.key === KEY.TAB) {
                    const activeElement = this._getActiveElement();
                    if (activeElement) {
                        const item = activeElement as SidebarItem;
                        if (item.nodeName === NODE_NAME.ITEM) {
                            if (
                                !item.classList.contains(CLASS.USER) ||
                                event.shiftKey
                            ) {
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                this._focusItemByTab(sideBarShadowRoot, item, !event.shiftKey);
                            }
                        }
                    }
                }
            }, true);

            // If analytics is enabled log sidebar clicks
            if (this._isAnalyticsOptionEnabled('sidebar_item_clicked')) {

                sideBarShadowRoot.addEventListener(EVENT.CLICK, (event: MouseEvent) => {

                    const clickedElement = event.target as HTMLElement;
                    const itemClicked = clickedElement.closest(ELEMENT.ITEM);

                    if (itemClicked) {
                        const itemText = itemClicked.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT).innerText;
                        this._logBookLog(`sidebar_item_clicked: ${itemText}`);
                    }

                });

            }

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
                    STYLES.ITEM_DIVIDER_ITEM_DIVIDER_COLOR,
                    STYLES.ITEM_BACKGROUND,
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

    private async _aplyItemRippleStyles(): Promise<void> {
        const sidebarItemsContainer = (await this._sidebar.selector.$.query(ELEMENT.ITEM).all) as NodeListOf<HTMLElement>;
        Array.from(sidebarItemsContainer).forEach((item: HTMLElement): void => {
            const innerElement = item.getAttribute(ATTRIBUTE.TYPE) === 'link'
                ? this._getAnchorElement(item)
                : this._getButtonElement(item);
            const surface = innerElement
                .querySelector(ELEMENT.HA_RIPPLE)
                .shadowRoot
                .querySelector(SELECTOR.SURFACE);
            this._styleManager.addStyle(
                [
                    STYLES.ITEM_BACKGROUND_HOVER_AND_HOVER_OPACITY
                ],
                surface
            );
        });
    }

    private _rearrange(): void {
        this._getElements()
            .then((elements) => {

                const { order, hide_all } = this._config;
                const [sidebarItemsContainer, items, spacer] = elements;

                let orderIndex = 0;
                let crossedBottom = false;

                this._items = Array.from(items);
                const matched: Set<HTMLElement> = new Set();

                if (hide_all) {
                    this._items.forEach((element: SidebarItem): void => {
                        this._hideItem(element, true);
                    });
                }

                const configItems: ConfigOrderWithItem[] = order.reduce(
                    (acc: ConfigOrderWithItem[], orderItem: ConfigOrder): ConfigOrderWithItem[] => {
                        const { item, match, exact, new_item } = orderItem;
                        const itemLowerCase = item.toLocaleLowerCase();
                        const element = new_item
                            ? undefined
                            : this._items.find((element: SidebarItem): boolean => {
                                const text = match === Match.HREF
                                    ? element.href
                                    : element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT).innerText.trim();

                                const matchText = (
                                    (!!exact && item === text) ||
                                    (!exact && !!text.toLowerCase().includes(itemLowerCase))
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
                        sidebarItemsContainer.append(newItem);

                        orderItem.element = newItem;

                        orderItem.element.setAttribute(ATTRIBUTE.PROCESSED, 'true');

                        this._items.push(orderItem.element);

                    } else if (orderItem.element) {

                        const element = orderItem.element as SidebarItem;

                        if (orderItem.href) {
                            element.href = orderItem.href;
                        }

                        if (orderItem.target) {
                            element.target = orderItem.target;
                        }

                    }

                    orderItem.element.style.order = `${orderIndex}`;

                    if (!isUndefined(orderItem.attributes)) {
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

                    if (!isUndefined(orderItem.hide)) {
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

                    if (orderItem.on_click) {
                        orderItem.element.addEventListener(EVENT.CLICK, this._mouseClick.bind(this, orderItem), true);
                    }

                    orderIndex++;

                });

                if (configItems.length) {
                    processBottom();
                }

                this._items.sort(
                    (
                        itemA: HTMLElement,
                        itemB: HTMLElement
                    ): number => +itemA.style.order - +itemB.style.order
                );

                sidebarItemsContainer.addEventListener(EVENT.MOUSEDOWN, this._itemTouchedBinded);
                sidebarItemsContainer.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent): void => {
                    if (event.key === KEY.ENTER) {
                        this._itemTouchedBinded();
                    }
                });

                this._aplyItemRippleStyles();
                this._panelLoaded();

            });
    }

    private async _itemTouched(): Promise<void> {
        this._sidebar.selector.$.query(SELECTOR.SIDEBAR_ITEMS_CONTAINER).element
            .then((sidebarItemsContainer: HTMLElement): void => {
                this._sidebarScroll = sidebarItemsContainer.scrollTop;
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
                sidebar._showTooltip(event.currentTarget as HTMLElement);
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

    private async _mouseClick(item: ConfigOrderWithItem, event: MouseEvent): Promise<void> {

        const { on_click: onClickAction, element } = item;
        const sidebarItem = element as SidebarItem;
        const textElement = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT);
        const itemText = textElement.textContent.trim();

        if (sidebarItem.href === '#') {
            event.preventDefault();
        }

        const renderTemplate = (code: string): string => {
            const finalCode = code.includes('return')
                ? code
                : `${code}\n;return;`;
            return this._renderer.renderTemplate(
                finalCode,
                {
                    item,
                    itemText
                }
            );
        };

        switch(onClickAction.action) {
            case ActionType.CALL_SERVICE: {
                const { service, data = {} } = onClickAction;
                const matches = service.match(DOMAIN_ENTITY_REGEXP);
                const compiledDataEntries = Object.entries(data).map(([key, value]) => {
                    const stringValue = getTemplateWithPartials(
                        `${value}`,
                        this._config.partials
                    );
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
                    console.warn(`${NAMESPACE} ignoring "${ActionType.CALL_SERVICE}" action in "${itemText}" item. The service parameter is malfomed.`);
                }
                break;
            }
            case ActionType.JAVASCRIPT: {
                const { code } = onClickAction;
                renderTemplate(
                    getTemplateWithPartials(
                        code,
                        this._config.partials
                    )
                );
                break;
            }
            case ActionType.OPEN_DIALOG: {
                const { type } = onClickAction;
                switch (type) {
                    case DialogType.MORE_INFO:
                        openMoreInfoDialog(
                            this._ha,
                            onClickAction.entity_id
                        );
                        break;
                    case DialogType.RESTART:
                        openRestartDialog(this._ha);
                        break;
                }
            }
        }
    }

    private async _checkProfileEditableButton(isSidebarEditable: boolean | undefined = undefined): Promise<void> {
        const panelResolver = await this._partialPanelResolver.element as PartialPanelResolver;
        const pathName = panelResolver.route.path;
        // Disable the edit sidebar button in the profile panel
        if (PROFILE_GENERAL_PATH_REGEXP.test(pathName)) {
            const editSidebarButton = await this._partialPanelResolver.selector.query(SELECTOR.EDIT_SIDEBAR_BUTTON).element;
            if (editSidebarButton) {
                const isEditable = isBoolean(isSidebarEditable)
                    ? isSidebarEditable
                    : this._config.sidebar_editable;
                if (!isBoolean(isEditable)) return;
                if (isEditable === false) {
                    editSidebarButton.setAttribute(ATTRIBUTE.DISABLED, '');
                } else {
                    editSidebarButton.removeAttribute(ATTRIBUTE.DISABLED);
                }
            }
        }
    }

    private async _panelLoaded(): Promise<void> {

        // Check the profile editable buton
        this._checkProfileEditableButton();

        // Select the right element in the sidebar
        const panelResolver = await this._partialPanelResolver.element as PartialPanelResolver;
        const pathName = panelResolver.route.path;
        const sidebarItemsContainer = await this._sidebar.selector.$.query(SELECTOR.SIDEBAR_ITEMS_CONTAINER).element as HTMLElement;

        const items = Array.from<SidebarItem>(
            sidebarItemsContainer.querySelectorAll<SidebarItem>(ELEMENT.ITEM)
        );

        const activeItem = items.find((item: SidebarItem): boolean => pathName === item.href);

        const activeParentElement = activeItem
            ? null
            : items.reduce((parent: SidebarItem | null, item: SidebarItem): SidebarItem | null => {
                const href = item.href.replace(URL_WITH_PARAMS_REGEXP, '$1');
                if (pathName.startsWith(href)) {
                    if (
                        !parent ||
                        href.length > parent.href.replace(URL_WITH_PARAMS_REGEXP, '$1').length
                    ) {
                        parent = item;
                    }
                }
                return parent;
            }, null);

        items.forEach((item: HTMLElement) => {
            const isActive = (
                activeItem &&
                activeItem === item
            ) ||
            (
                !activeItem &&
                activeParentElement === item
            );
            item.classList.toggle(CLASS.ITEM_SELECTED, isActive);
            item.tabIndex = isActive ? 0 : -1;
        });

        if (sidebarItemsContainer.scrollTop !== this._sidebarScroll) {
            sidebarItemsContainer.scrollTop = this._sidebarScroll;
        }

        // If it is a lovelace dashboard add an observer for hui-view-container
        this._huiViewContainerObserver.disconnect();

        const lovelace = panelResolver.querySelector(ELEMENT.HA_PANEL_LOVELACE);

        if (lovelace) {
            this._partialPanelResolver
                .selector
                .query(ELEMENT.HA_PANEL_LOVELACE)
                .$
                .query(ELEMENT.HUI_ROOT)
                .$
                .query(ELEMENT.HUI_VIEW_CONTAINER)
                .element
                .then((huiViewContainer: HTMLElement) => {
                    this._huiViewContainerObserver.observe(huiViewContainer, {
                        subtree: true,
                        childList: true
                    });
                });
        }

        // If the config is not loaded yet, wait for it
        if (!this._config) {
            await getPromisableResult(
                () => this._config,
                (config: Config) => !!config
            );
        }

        // If analytics is enabled log landings
        if (this._isAnalyticsOptionEnabled('panel_visited')) {
            this._logBookLog(`panel_visited: ${pathName}`);
        }

    }

    private _watchHuiViewContainer(mutations: MutationRecord[]): void {
        mutations.forEach(({ addedNodes }): void => {
            addedNodes.forEach((node: Element): void => {
                if (node.localName === ELEMENT.HUI_VIEW) {
                    this._panelLoaded();
                }
            });
        });
    }

    private _process(): void {

        this._homeAssistant
            .element
            .then((ha: HomeAsssistantExtended) => {
                this._ha = ha;

                this._debugLog('Instantiating HomeAssistantJavaScriptTemplates...');

                new HomeAssistantJavaScriptTemplates(this._ha)
                    .getRenderer()
                    .then((renderer) => {

                        this._debugLog('HomeAssistantJavaScriptTemplates instantiated');

                        this._renderer = renderer;
                        this._getConfig()
                            .then(() => {

                                this._debugLog('Compiled config', this._config);
                                this._debugLog('Executing plugin logic...');

                                this._renderer.variables = {
                                    ...this._parseJavaScriptVariables(),
                                    ...getRestApis(this._ha),
                                    ...getDialogsMethods(this._ha)
                                };
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
    const params = new URLSearchParams(window.location.search);
    const enableDebug = params.has(DEBUG_URL_PARAMETER);
    window.CustomSidebar = new CustomSidebar(enableDebug);
}