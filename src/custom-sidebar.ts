import { getPromisableResult } from 'get-promisable-result';
import {
    HAElement,
    HAQuerySelector,
    HAQuerySelectorEvent,
    OnListenDetail
} from 'home-assistant-query-selector';
import HomeAssistantJavaScriptTemplates, {
    HomeAssistantJavaScriptTemplatesRenderer
} from 'home-assistant-javascript-templates';
import { HomeAssistantStylesManager } from 'home-assistant-styles-manager';
import {
    ActionType,
    AnalyticsConfig,
    Config,
    ConfigOrder,
    ConfigOrderWithItem,
    DialogType,
    ElementsStore,
    HomeAssistantMain,
    HomeAsssistantExtended,
    Match,
    PartialPanelResolver,
    SidebarItem,
    SidebarMode,
    SidebarWidth
} from '@types';
import {
    ANALITICS_KEYS,
    ATTRIBUTE,
    ATTRIBUTE_VALUE,
    CLASS,
    CUSTOM_ELEMENT,
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
    NAMESPACE,
    NODE_NAME,
    PROFILE_GENERAL_PATH_REGEXP,
    SELECTOR,
    SIDEBAR_BORDER_COLOR_VARIABLES_MAP,
    SIDEBAR_MODE_TO_DOCKED_SIDEBAR,
    SIDEBAR_OPTIONS_VARIABLES_MAP,
    WEBSOCKET_RUNNING
} from '@constants';
import { fetchConfig } from '@fetcher';
import { Subscribers } from '@subscribers';
import {
    Logger,
    buildFireEventMethods,
    buildNavigateMethods,
    buildNewItem,
    fireEvent,
    focusItemByKeyboard,
    focusItemByTab,
    getActiveElement,
    getConfig,
    getDialogsMethods,
    getElements,
    getFormatDateMethods,
    getItemText,
    getRestApis,
    getTemplateWithPartials,
    getToastMethods,
    getTranslationMethods,
    hideItem,
    isBoolean,
    isObject,
    isUndefined,
    navigate,
    openMoreInfoDialog,
    openRestartDialog,
    parseWidth,
    refreshTooltips,
    setElementVariables,
    waitForReadiness,
    waitForSidebarReady
} from '@utilities';
import * as STYLES from '@styles';

class CustomSidebar {

    constructor(config: Config, loggerInstance: Logger) {

        this._logger = loggerInstance;

        const selector = new HAQuerySelector({
            shouldReject: this._logger.enabled
        });

        selector.addEventListener(
            HAQuerySelectorEvent.ON_LISTEN,
            (event: CustomEvent<OnListenDetail>) => {

                this._homeAssistant = event.detail.HOME_ASSISTANT;
                this._main = event.detail.HOME_ASSISTANT_MAIN;
                this._haDrawer = event.detail.HA_DRAWER;
                this._sidebar = event.detail.HA_SIDEBAR;
                this._partialPanelResolver = event.detail.PARTIAL_PANEL_RESOLVER;

                this._logger.log(
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

                this._process(config);

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

        this._styleManager = new HomeAssistantStylesManager({
            prefix: NAMESPACE,
            namespace: NAMESPACE,
            throwWarnings: false
        });

        this._items = [];
        this._logBookMessagesMap = new Map<string, number>();

        // Wait for Home Assistant to be ready
        this._logger.log('Wait for Home Assistant to be ready...');

        waitForReadiness(
            this._logger.enabled
        )
            .then(() => {
                this._logger.log('Starting the plugin...');
                selector.listen();
            });
    }

    private _subscribers!: Subscribers;
    private _logger!: Logger;
    private _config!: Config;
    private _homeAssistant!: HAElement;
    private _main!: HAElement;
    private _haDrawer!: HAElement;
    private _ha!: HomeAsssistantExtended;
    private _partialPanelResolver!: HAElement;
    private _sidebar!: HAElement;
    private _renderer!: HomeAssistantJavaScriptTemplatesRenderer;
    private _styleManager!: HomeAssistantStylesManager;
    private _items!: SidebarItem[];
    private _logBookMessagesMap!: Map<string, number>;
    private _huiViewContainerObserver!: MutationObserver;

    private _compileConfig(config: Config) {
        this._config = getConfig(
            this._ha.hass.user,
            navigator.userAgent.toLowerCase(),
            config
        );
        this._logger.log('Compiled config', this._config);
    }

    private async _checkEmptyBottomList(): Promise<void> {
        const container = (await this._sidebar.selector.$.query(SELECTOR.SIDEBAR_BOTTOM_ITEMS_CONTAINER).element) as HTMLElement;
        const items = container.querySelectorAll<SidebarItem>(`:scope > ${SELECTOR.ITEM}`);
        const hasVisibleItems = Array.from(items).some((item: SidebarItem): boolean => item.style.display === '');
        if (hasVisibleItems) {
            container.removeAttribute(ATTRIBUTE.EMPTY);
        } else {
            container.setAttribute(ATTRIBUTE.EMPTY, ATTRIBUTE_VALUE.EMPTY);
        }
    }

    private _isAnalyticsOptionEnabled(option: keyof AnalyticsConfig): boolean {
        return Boolean(
            this._config.analytics &&
            (
                this._config.analytics === true ||
                this._config.analytics[option]
            )
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

                const cancelSubscriptionPromise = this._subscribers.createJinjaTemplateSubscription(
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
        navigate(pathname, true, 'ignoring default_path property');
    }

    private async _processSidebarMode(): Promise<void> {
        Promise.all([
            this._main.element as Promise<HomeAssistantMain>,
            this._partialPanelResolver.element as Promise<PartialPanelResolver>
        ]).then(([homeAssistantMain, partialPanelResolver]: [HomeAssistantMain, PartialPanelResolver]) => {

            const sidebarMode = this._config.sidebar_mode;
            const mql = matchMedia('(max-width: 870px)');

            if (sidebarMode) {

                const localStorageItem = 'dockedSidebar';

                const currentSidebarMode = JSON.parse(window.localStorage.getItem(localStorageItem) ?? '""');
                const sidebarModeValue = SIDEBAR_MODE_TO_DOCKED_SIDEBAR[sidebarMode];

                if (currentSidebarMode !== sidebarModeValue) {
                    fireEvent(
                        this._ha,
                        EVENT.DOCK_SIDEBAR,
                        {
                            dock: sidebarModeValue
                        }
                    );
                }

                const checkForNarrow = async (isNarrow: boolean): Promise<void> => {

                    if (sidebarMode !== SidebarMode.HIDDEN) {
                        homeAssistantMain.narrow = false;
                        partialPanelResolver.narrow = isNarrow;
                    }

                    const huiRoot = await getPromisableResult<ShadowRoot | undefined | null>(
                        () => {
                            const lovelace = partialPanelResolver.querySelector(CUSTOM_ELEMENT.HA_PANEL_LOVELACE)?.shadowRoot;
                            return lovelace?.querySelector(CUSTOM_ELEMENT.HUI_ROOT)?.shadowRoot;
                        },
                        (huiRoot: ShadowRoot | undefined | null) => !!huiRoot,
                        {
                            shouldReject: false
                        }
                    );

                    if (huiRoot) {

                        this._styleManager.removeStyle(huiRoot);

                        if (sidebarMode !== SidebarMode.HIDDEN && isNarrow) {

                            this._styleManager.addStyle(
                                STYLES.HIDDEN_MENU_BUTTON_IN_NARROW_MODE,
                                huiRoot
                            );

                        }

                    }

                };

                mql.addEventListener(EVENT.CHANGE, (event: MediaQueryListEvent): void => {
                    checkForNarrow(event.matches);
                });

                checkForNarrow(mql.matches);
            }

        });
    }

    private async _processSidebar(): Promise<void> {
        // Add styles
        Promise.all([
            this._main.element as Promise<HTMLElement>,
            this._haDrawer.element as Promise<HTMLElement>,
            this._sidebar.element as Promise<HTMLElement>,
            this._sidebar.selector.$.element as Promise<ShadowRoot>
        ]).then((elements: [HTMLElement, HTMLElement, HTMLElement, ShadowRoot]) => {

            const [
                homeAssistantMain,
                haDrawer,
                sidebar,
                sideBarShadowRoot
            ] = elements;

            // Set width variables
            const { width } = this._config;

            if (isObject<SidebarWidth>(width)) {
                setElementVariables(
                    homeAssistantMain,
                    [
                        [CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH_EXTENDED, parseWidth(width.extended)],
                        [CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH_HIDDEN, parseWidth(width.hidden)]
                    ]
                );
            } else {
                setElementVariables(
                    homeAssistantMain,
                    [
                        [CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH, parseWidth(width)]
                    ]
                );
            }

            this._subscribers.subscribeTemplateVariableChanges(
                this._config,
                haDrawer,
                SIDEBAR_BORDER_COLOR_VARIABLES_MAP
            );

            this._subscribers.subscribeTemplateVariableChanges(
                this._config,
                sidebar,
                SIDEBAR_OPTIONS_VARIABLES_MAP
            );

            // Menu button styles
            const sidebarMenuButtonShadowRootPromise = this._sidebar
                .selector
                .$
                .query(SELECTOR.MENU_BUTTON)
                .$
                .element as Promise<ShadowRoot>;

            sidebarMenuButtonShadowRootPromise.then((sidebarMenuButtonShadowRoot: ShadowRoot) => {
                this._styleManager.addStyle(
                    [
                        STYLES.SIDEBAR_BUTTON_BACKGROUND_HOVER
                    ],
                    sidebarMenuButtonShadowRoot
                );
            });

            this._styleManager.addStyle(
                [
                    STYLES.SIDEBAR_BORDER_COLOR
                ],
                haDrawer.shadowRoot!
            );

            this._styleManager.addStyle(
                STYLES.SIDEBAR_WIDTH,
                homeAssistantMain.shadowRoot!
            );

            this._styleManager.addStyle(
                [
                    STYLES.BASE_STYLES,
                    STYLES.FUNCTIONALITY,
                    STYLES.TITLE_COLOR,
                    STYLES.SUBTITLE_COLOR,
                    STYLES.SIDEBAR_BUTTON_COLOR,
                    STYLES.SIDEBAR_BUTTON_COLOR_HOVER,
                    STYLES.SIDEBAR_BACKGROUND,
                    STYLES.MENU_BACKGROUND_DIVIDER_TOP_COLOR,
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
                    STYLES.SIDEBAR_BOTTOM_LIST_EMPTY,
                    this._config.styles || ''
                ],
                sideBarShadowRoot
            );
        });

        // If sidebar is loading, wait for the looading to finish
        await waitForSidebarReady(
            this._sidebar,
            this._logger.enabled
        )
            .then(() => {
                // Add events
                Promise.all([
                    this._sidebar.selector.$.query(SELECTOR.SIDEBAR_TOP_ITEMS_CONTAINER).element as Promise<HTMLElement>,
                    this._sidebar.selector.$.query(SELECTOR.SIDEBAR_BOTTOM_ITEMS_CONTAINER).element as Promise<HTMLElement>,
                    this._sidebar.selector.$.element as Promise<ShadowRoot>
                ])
                    .then((elements: [HTMLElement, HTMLElement, ShadowRoot]) => {
                        const [
                            sidebarTopItemsContainer,
                            sidebarBottomItemsContainer,
                            sideBarShadowRoot
                        ] = elements;

                        window.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent) => {
                            if (event.key === KEY.TAB) {
                                const activeElement = getActiveElement();
                                if (activeElement) {
                                    const item = activeElement as SidebarItem;
                                    if (item.nodeName === NODE_NAME.ITEM) {
                                        if (
                                            !item.classList.contains(CLASS.USER) ||
                                            event.shiftKey
                                        ) {
                                            event.preventDefault();
                                            event.stopImmediatePropagation();
                                            focusItemByTab(
                                                this._items,
                                                sideBarShadowRoot,
                                                item,
                                                !event.shiftKey
                                            );
                                        }
                                    }
                                }
                            }
                        }, true);

                        // If analytics is enabled log sidebar clicks
                        if (this._isAnalyticsOptionEnabled(ANALITICS_KEYS.SIDEBAR_ITEM_CLICKED)) {
                            sideBarShadowRoot.addEventListener(EVENT.CLICK, (event: Event) => {
                                const clickedElement = event.target as HTMLElement;
                                const itemClicked = clickedElement.closest(CUSTOM_ELEMENT.ITEM) as SidebarItem;
                                if (itemClicked) {
                                    const itemText = getItemText(itemClicked);
                                    this._logBookLog(`${ANALITICS_KEYS.SIDEBAR_ITEM_CLICKED}: ${itemText}`);
                                }
                            });
                        }

                        sidebarTopItemsContainer.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent) => {
                            if (
                                event.key === KEY.ARROW_DOWN ||
                                event.key === KEY.ARROW_UP
                            ) {
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                focusItemByKeyboard(
                                    this._items,
                                    sidebarTopItemsContainer,
                                    event.key === KEY.ARROW_DOWN
                                );
                            }
                        }, true);

                        sidebarBottomItemsContainer.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent) => {
                            if (
                                event.key === KEY.ARROW_DOWN ||
                                event.key === KEY.ARROW_UP
                            ) {
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                focusItemByKeyboard(
                                    this._items,
                                    sidebarBottomItemsContainer,
                                    event.key === KEY.ARROW_DOWN
                                );
                            }
                        }, true);
                    });
            });

    }

    private async _aplyItemRippleStyles(): Promise<void> {
        const sidebarItemsContainer = (await this._sidebar.selector.$.query(CUSTOM_ELEMENT.ITEM).all) as NodeListOf<HTMLElement>;
        Array.from(sidebarItemsContainer).forEach((item: HTMLElement): void => {
            const innerElement = item.shadowRoot!.querySelector<HTMLAnchorElement | HTMLButtonElement>(`${ELEMENT.ANCHOR}, ${ELEMENT.BUTTON}`)!;
            const surface = innerElement
                .querySelector(CUSTOM_ELEMENT.HA_RIPPLE)!
                .shadowRoot!
                .querySelector(SELECTOR.SURFACE)!;
            this._styleManager.addStyle(
                [
                    STYLES.ITEM_BACKGROUND_HOVER_AND_HOVER_OPACITY
                ],
                surface
            );
        });
    }

    private _patchSidebarMethods(): void {

        const debuggerInstance = this._logger;
        const _this = this;

        debuggerInstance.log('Patching the sidebar shouldUpdate method...');

        customElements.whenDefined(CUSTOM_ELEMENT.HA_SIDEBAR)
            .then((sidebar: CustomElementConstructor): void => {
                const shouldUpdate = sidebar.prototype.shouldUpdate;
                sidebar.prototype.shouldUpdate = function (changedProps: Map<string, unknown>): boolean {
                    if (this.hass.config.state !== WEBSOCKET_RUNNING) {
                        debuggerInstance.log(`Home Assistant config state is ${this.hass.config.state}. Cancelling the update!`);
                        return false;
                    }
                    if (
                        changedProps.has('expanded') ||
                        changedProps.has('narrow') ||
                        changedProps.has('alwaysExpand')
                    ) {
                        refreshTooltips(_this._sidebar);
                    }
                    return shouldUpdate.call(this, changedProps);
                };
            });
    }

    private _rearrange(): void {
        getElements(this._sidebar, this._logger)
            .then((elementsStore: ElementsStore) => {

                const { order, hide_all } = this._config;
                const {
                    topItemsContainer,
                    bottomItemsContainer,
                    topItems,
                    bottomItems
                } = elementsStore;

                let lastOrder = 0;
                const topItemsFragment = document.createDocumentFragment();
                const bottomItemsFragment = document.createDocumentFragment();

                this._items = [
                    ...Array.from(topItems),
                    ...Array.from(bottomItems)
                ];
                const matched: Set<HTMLElement> = new Set();
                const totalItems = this._items.length;

                if (hide_all) {
                    this._items.forEach((element: SidebarItem): void => {
                        hideItem(element, true);
                    });
                }

                const configItems: ConfigOrderWithItem[] = order!.reduce(
                    (acc: ConfigOrderWithItem[], orderItem: ConfigOrder): ConfigOrderWithItem[] => {
                        const { item, match, exact, new_item } = orderItem;
                        const itemLowerCase = item.toLocaleLowerCase();
                        const element = new_item
                            ? undefined
                            : this._items.find((element: SidebarItem): boolean => {
                                const text = match === Match.HREF
                                    ? element.href
                                    : getItemText(element);

                                const matchText = (
                                    (!!exact && item === text) ||
                                    (!exact && !!text && !!text.toLowerCase().includes(itemLowerCase))
                                );

                                if (matchText) {
                                    if (matched.has(element)) {
                                        return false;
                                    } else {
                                        this._logger.log(`item "${item}" matched the element with text "${getItemText(element)}" and href "${element.href}"`);
                                        matched.add(element);
                                        return true;
                                    }
                                }
                                return false;
                            });
                        if (element) {
                            element.setAttribute(ATTRIBUTE.PROCESSED, ATTRIBUTE_VALUE.TRUE);
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

                configItems.forEach((orderItem: ConfigOrderWithItem): void => {

                    if (orderItem.new_item) {

                        const newItem = buildNewItem(orderItem);

                        orderItem.element = newItem;

                        orderItem.element.setAttribute(ATTRIBUTE.PROCESSED, ATTRIBUTE_VALUE.TRUE);
                        orderItem.element.setAttribute(
                            ATTRIBUTE.FIXED,
                            orderItem.bottom
                                ? ATTRIBUTE_VALUE.TRUE
                                : ATTRIBUTE_VALUE.FALSE
                        );

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

                    if (
                        orderItem.new_item ||
                        (
                            orderItem.bottom &&
                            orderItem.element!.getAttribute(ATTRIBUTE.FIXED)! === ATTRIBUTE_VALUE.FALSE
                        ) ||
                        (
                            !orderItem.bottom &&
                            orderItem.element!.getAttribute(ATTRIBUTE.FIXED)! === ATTRIBUTE_VALUE.TRUE
                        )
                    ) {
                        if (orderItem.bottom) {
                            bottomItemsFragment.appendChild(orderItem.element!);
                        } else {
                            topItemsFragment.appendChild(orderItem.element!);
                        }
                    }

                    if (isUndefined(orderItem.order)) {
                        orderItem.element!.style.order = `${lastOrder}`;
                        lastOrder ++;
                    } else {
                        orderItem.element!.style.order = `${orderItem.order}`;
                        lastOrder = orderItem.order + 1;
                    }

                    if (!isUndefined(orderItem.attributes)) {
                        this._subscribers.subscribeAttributes(
                            orderItem,
                            orderItem.attributes
                        );
                    }

                    if (orderItem.divider) {
                        orderItem.element!.setAttribute(ATTRIBUTE.WITH_DIVIDER, ATTRIBUTE_VALUE.TRUE);
                    }

                    if (orderItem.name) {
                        this._subscribers.subscribeName(
                            orderItem.element!,
                            orderItem.name
                        );
                    }

                    if (orderItem.icon) {
                        this._subscribers.subscribeIcon(
                            orderItem.element!,
                            orderItem.icon
                        );
                    }

                    if (orderItem.info) {
                        this._subscribers.subscribeInfo(
                            orderItem.element!,
                            orderItem.info
                        );
                    }

                    if (orderItem.notification) {
                        this._subscribers.subscribeNotification(
                            orderItem.element!,
                            orderItem.notification
                        );
                    }

                    if (!isUndefined(orderItem.hide)) {
                        this._subscribers.subscribeHide(
                            orderItem.element!,
                            orderItem.hide,
                            () => {
                                this._checkEmptyBottomList();
                            }
                        );
                    }

                    this._subscribers.subscribeTemplateVariableChanges(
                        orderItem,
                        orderItem.element!,
                        ITEM_OPTIONS_VARIABLES_MAP
                    );

                    if (orderItem.on_click) {
                        orderItem.element!.addEventListener(EVENT.CLICK, this._mouseClick.bind(this, orderItem), true);
                    }

                });

                this._items.forEach((element: HTMLElement) => {
                    if (!element.hasAttribute(ATTRIBUTE.PROCESSED)) {
                        element.style.order = lastOrder > 0
                            ? `${lastOrder}`
                            : `${totalItems}`;
                    }
                });

                this._items.sort(
                    (
                        itemA: HTMLElement,
                        itemB: HTMLElement
                    ): number => +itemA.style.order - +itemB.style.order
                );

                topItemsContainer.appendChild(topItemsFragment);
                bottomItemsContainer.appendChild(bottomItemsFragment);

                this._patchSidebarMethods();
                this._aplyItemRippleStyles();
                this._panelLoaded();
                this._checkEmptyBottomList();
                this._processSidebarMode();
                refreshTooltips(this._sidebar);

            });
    }

    private async _mouseClick(item: ConfigOrderWithItem, event: MouseEvent): Promise<void> {

        const { on_click, element } = item;
        const onClickAction = on_click!;
        const sidebarItem = element as SidebarItem;
        const itemText = getItemText(sidebarItem);

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
                    variables: {
                        item,
                        itemText
                    }
                }
            );
        };

        switch(onClickAction.action) {
            case ActionType.NAVIGATE: {
                const { path, replace = false } = onClickAction;
                let pathname = path;
                if (JS_TEMPLATE_REG.test(path)) {
                    pathname = renderTemplate(
                        getTemplateWithPartials(
                            path.replace(JS_TEMPLATE_REG, '$1'),
                            this._config.partials
                        )
                    );
                }
                navigate(pathname, replace, 'ignoring on_click.path property');
                break;
            }
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
        const panelResolverRoute = await getPromisableResult(
            () => panelResolver.route,
            // This could happen in certain edge cases in slow devices
            // but this is hard to reproduce during the tests because 100% of the time the route is defined and with a path
            /* istanbul ignore next */
            (panelResolveRoute: PartialPanelResolver['route']) => !!panelResolveRoute?.path,
            { shouldReject: this._logger.enabled }
        );
        const pathName = panelResolverRoute.path;
        // Disable the edit sidebar button in the profile panel
        if (PROFILE_GENERAL_PATH_REGEXP.test(pathName)) {
            const editSidebarButton = await this._partialPanelResolver.selector.query(SELECTOR.EDIT_SIDEBAR_BUTTON).element;
            if (editSidebarButton) {
                const isEditable = isBoolean(isSidebarEditable)
                    ? isSidebarEditable
                    : this._config.sidebar_editable;
                if (!isBoolean(isEditable)) return;
                if (isEditable === false) {
                    editSidebarButton.setAttribute(ATTRIBUTE.DISABLED, ATTRIBUTE_VALUE.EMPTY);
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
        const panelPath = `${location.pathname}${location.search}`;
        const sidebarShadowRoot = await this._sidebar.selector.$.element as ShadowRoot;

        const items = Array.from<SidebarItem>(sidebarShadowRoot.querySelectorAll<SidebarItem>(CUSTOM_ELEMENT.ITEM));
        const visibleItems = items.filter((item: SidebarItem) => item.style.display !== ATTRIBUTE_VALUE.NONE);

        const activeItem = visibleItems.reduce((active: null | SidebarItem, item: SidebarItem): SidebarItem => {
            if (
                panelPath.startsWith(item.href) &&
                (
                    active === null ||
                    item.href.length > active.href.length
                )
            ) {
                return item;
            }
            return active!;
        }, null);

        items.forEach((item: HTMLElement) => {
            const isActive = activeItem === item;
            item.classList.toggle(CLASS.ITEM_SELECTED, isActive);
            item.tabIndex = isActive ? 0 : -1;
        });

        // If it is a lovelace dashboard add an observer for hui-view-container
        this._huiViewContainerObserver.disconnect();

        const lovelace = panelResolver.querySelector(CUSTOM_ELEMENT.HA_PANEL_LOVELACE);

        if (lovelace) {
            const huiViewContainerPromise = this._partialPanelResolver
                .selector
                .query(CUSTOM_ELEMENT.HA_PANEL_LOVELACE)
                .$
                .query(CUSTOM_ELEMENT.HUI_ROOT)
                .$
                .query(CUSTOM_ELEMENT.HUI_VIEW_CONTAINER)
                .element as Promise<HTMLElement>;
            huiViewContainerPromise.then((huiViewContainer: HTMLElement) => {
                // Edge case that occurs in some edge-cases scenarios, hard to simulate during tests
                /* istanbul ignore next */
                if (huiViewContainer) {
                    this._huiViewContainerObserver.observe(huiViewContainer, {
                        subtree: true,
                        childList: true
                    });
                }
            });
        }

        // If analytics is enabled log landings
        if (this._isAnalyticsOptionEnabled(ANALITICS_KEYS.PANEL_VISITED)) {
            this._logBookLog(`${ANALITICS_KEYS.PANEL_VISITED}: ${panelPath}`);
        }

    }

    private _watchHuiViewContainer(mutations: MutationRecord[]): void {
        mutations.forEach(({ addedNodes }): void => {
            addedNodes.forEach((node: Node): void => {
                if (node instanceof Element && node.localName === CUSTOM_ELEMENT.HUI_VIEW) {
                    this._panelLoaded();
                }
            });
        });
    }

    private _process(config: Config): void {

        const homeAssistantPromise = this._homeAssistant.element as Promise<HomeAsssistantExtended>;

        homeAssistantPromise.then((ha: HomeAsssistantExtended) => {

            this._ha = ha;

            this._logger.log('Hass ready', this._ha.hass);

            this._logger.log('Instantiating HomeAssistantJavaScriptTemplates...');

            new HomeAssistantJavaScriptTemplates(this._ha)
                .getRenderer()
                .then((renderer) => {
                    this._logger.log('HomeAssistantJavaScriptTemplates instantiated');
                    this._renderer = renderer;
                    this._compileConfig(config);
                    this._subscribers = new Subscribers(
                        this._ha,
                        this._config,
                        this._renderer
                    );
                    this._logger.log('Executing plugin logic...');
                    this._renderer.variables = {
                        ...(this._config.js_variables ?? {}),
                        ...buildNavigateMethods(this._sidebar),
                        ...buildFireEventMethods(this._ha),
                        ...getRestApis(this._ha),
                        ...getDialogsMethods(this._ha),
                        ...getFormatDateMethods(this._ha),
                        ...getToastMethods(this._ha),
                        ...getTranslationMethods(this._ha)
                    };
                    this._renderer.refs = this._config.js_refs ?? {};
                    this._processDefaultPath();
                    this._subscribers.subscribeTitle(
                        this._sidebar
                    );
                    this._processSidebar();
                    this._subscribers.subscribeSideBarEdition(
                        this._sidebar,
                        (isSidebarEditable: boolean | undefined) => {
                            this._checkProfileEditableButton(isSidebarEditable);
                        }
                    );
                    this._rearrange();
                });
        });
    }

}

if (!window.CustomSidebar) {
    const params = new URLSearchParams(window.location.search);
    const hasDebugParameter = params.has(DEBUG_URL_PARAMETER);
    const loggerInstance = new Logger(hasDebugParameter);

    // Log the Custom Sidebar version
    Logger.logVersionToConsole();

    loggerInstance.log('Getting the config...');

    fetchConfig()
        .then((config: Config): void => {
            loggerInstance.log('Raw config', config);
            window.CustomSidebar = new CustomSidebar(
                config,
                loggerInstance
            );
        });
}