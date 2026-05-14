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
    ElementsStore,
    HomeAssistantMain,
    HomeAsssistantExtended,
    Match,
    PartialPanelResolver,
    Sidebar,
    SidebarItem,
    SidebarMode,
    SidebarWidth,
    SubscriberTemplate
} from '@types';
import {
    ANALITICS_KEYS,
    ATTRIBUTE,
    ATTRIBUTE_VALUE,
    CHECK_FOCUSED_SHADOW_ROOT,
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
    MAX_ATTEMPTS,
    NAMESPACE,
    NODE_NAME,
    PROFILE_GENERAL_PATH_REGEXP,
    RETRY_DELAY,
    SELECTOR,
    SIDEBAR_BORDER_COLOR_VARIABLES_MAP,
    SIDEBAR_MODE_TO_DOCKED_SIDEBAR,
    SIDEBAR_OPTIONS_VARIABLES_MAP,
    WEBSOCKET_RUNNING
} from '@constants';
import { fetchConfig } from '@fetcher';
import {
    buildFireEventMethods,
    buildNavigateMethods,
    fireEvent,
    getConfig,
    getDialogsMethods,
    getFormatDateMethods,
    getRestApis,
    getTemplateWithPartials,
    getToastMethods,
    isArray,
    isBoolean,
    isMobileClient,
    isNumber,
    isObject,
    isRegExp,
    isString,
    isUndefined,
    Logger,
    navigate,
    openMoreInfoDialog,
    openRestartDialog,
    parseWidth,
    waitForElement
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

        this._waitForReadiness()
            .then(() => {
                this._logger.log('Starting the plugin...');
                selector.listen();
            });
    }

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

    private async _waitForReadiness() {
        const promisableOptions = {
            shouldReject: this._logger.enabled
        };
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
    }

    private async _waitForSidebarReady() {
        const sidebarShadowRoot = (await this._sidebar.selector.$.element)!;
        await waitForElement(
            sidebarShadowRoot,
            SELECTOR.SIDEBAR_LOADER,
            { shouldReject: this._logger.enabled }
        ).toBeRemoved();
    }

    private _compileConfig(config: Config) {
        this._config = getConfig(
            this._ha.hass.user,
            navigator.userAgent.toLowerCase(),
            config
        );
        this._logger.log('Compiled config', this._config);
    }

    private async _getContainerItems(
        container: HTMLElement,
        fixed = false
    ): Promise<NodeListOf<SidebarItem>> {
        const items = await getPromisableResult<NodeListOf<SidebarItem>>(
            () => container.querySelectorAll<SidebarItem>(`:scope > ${CUSTOM_ELEMENT.ITEM}`),
            (elements: NodeListOf<SidebarItem>): boolean => {
                return Array.from(elements).every((element: SidebarItem): boolean => {
                    const text = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT)!.textContent.trim();
                    return text.length > 0;
                });
            },
            {
                retries: MAX_ATTEMPTS,
                delay: RETRY_DELAY,
                shouldReject: this._logger.enabled
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
    }

    private _mapItemsForDebug(items: NodeListOf<SidebarItem>): ({text: string, href: string})[] {
        return Array.from(items).map((element: SidebarItem) => {
            const href = element.href;
            const intemText = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT);
            const text = intemText!.textContent.trim();
            return {
                text,
                href
            };
        });
    }

    private async _getElements(): Promise<ElementsStore> {
        // If sidebar is loading, wait for the looading to finish
        await this._waitForSidebarReady();

        const topItemsContainer = (await this._sidebar.selector.$.query(SELECTOR.SIDEBAR_TOP_ITEMS_CONTAINER).element) as HTMLElement;
        const bottomItemsContainer = (await this._sidebar.selector.$.query(SELECTOR.SIDEBAR_BOTTOM_ITEMS_CONTAINER).element) as HTMLElement;

        const topItems = await this._getContainerItems(topItemsContainer);
        const bottomItems = await this._getContainerItems(bottomItemsContainer, true);

        if (this._logger.enabled) {
            const topItemsTable = this._mapItemsForDebug(topItems);
            const bottomItemsTable = this._mapItemsForDebug(bottomItems);

            this._logger.log(
                'Top Native sidebar items',
                topItemsTable,
                {
                    table: true
                }
            );
            this._logger.log(
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
    }

    private _getAnchorElement(element: HTMLElement): HTMLAnchorElement {
        return element
            .shadowRoot!
            .querySelector<HTMLAnchorElement>(ELEMENT.ANCHOR)!;
    }

    private _getButtonElement(element: HTMLElement): HTMLAnchorElement {
        return element
            .shadowRoot!
            .querySelector<HTMLAnchorElement>(ELEMENT.BUTTON)!;
    }

    private _hideItem(item: HTMLElement, hide: boolean): void {
        if (hide) {
            item.style.display = ATTRIBUTE_VALUE.NONE;
        } else {
            item.style.removeProperty('display');
        }
    }

    private _buildNotification(slot: string): Element {
        const badge = document.createElement(ELEMENT.SPAN);
        badge.classList.add(CLASS.BADGE);
        badge.setAttribute(ATTRIBUTE.SLOT, slot);
        return badge;
    }

    private _getId(configItem: ConfigNewItem): string {
        const id = (configItem.href ?? configItem.item).replace(/\W/g, '-');
        return `${ATTRIBUTE_VALUE.SIDEBAR_PANEL}-${id}`;
    }

    private _buildNewItem(configItem: ConfigNewItem): SidebarItem {

        const item = document.createElement(CUSTOM_ELEMENT.ITEM) as SidebarItem;
        item.setAttribute(ATTRIBUTE.TYPE, ATTRIBUTE_VALUE.LINK);
        item.setAttribute(ATTRIBUTE.ID, this._getId(configItem));
        item.setAttribute(ATTRIBUTE.NEW_ITEM, ATTRIBUTE_VALUE.TRUE);

        item.href = configItem.href ?? '#';
        item.target = configItem.target ?? '';
        item.tabIndex = -1;

        const text = document.createElement(ELEMENT.SPAN);
        text.classList.add(CLASS.ITEM_TEXT);
        text.setAttribute(ATTRIBUTE.SLOT, ATTRIBUTE_VALUE.HEADLINE);
        text.innerText = configItem.item;

        const badgeStart = this._buildNotification(ATTRIBUTE_VALUE.START);
        const badgeEnd = this._buildNotification(ATTRIBUTE_VALUE.END);

        item.appendChild(badgeStart);
        item.appendChild(text);
        item.appendChild(badgeEnd);

        return item;
    }

    private _buildTooltip(id: string, text: string): HTMLElement {

        const tooltip = document.createElement(CUSTOM_ELEMENT.TOOLTIP);

        tooltip.setAttribute(ATTRIBUTE.FOR, id);
        tooltip.setAttribute(ATTRIBUTE.SHOW_DELAY, ATTRIBUTE_VALUE.ZERO);
        tooltip.setAttribute(ATTRIBUTE.HIDE_DELAY, ATTRIBUTE_VALUE.ZERO);
        tooltip.setAttribute(ATTRIBUTE.PLACEMENT, ATTRIBUTE_VALUE.RIGHT);
        tooltip.textContent = text;

        return tooltip;

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
        const titlePromise = this._sidebar
            .selector
            .$
            .query(SELECTOR.TITLE)
            .element as Promise<HTMLElement>;
        titlePromise.then((titleElement: HTMLElement) => {
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

        const sidebarEditListener = (event: Event): void => {
            event.preventDefault();
            event.stopImmediatePropagation();
        };

        const unblockSidebar = (sidebar: Element, menu: Element) => {
            sidebar.removeEventListener(EVENT.SHOW_DIALOG, sidebarEditListener, true);
            menu.removeAttribute(ATTRIBUTE.BLOCKED);
        };

        const blockSidebar = (sidebar: Element, menu: Element) => {
            sidebar.removeEventListener(EVENT.SHOW_DIALOG, sidebarEditListener, true);
            sidebar.addEventListener(EVENT.SHOW_DIALOG, sidebarEditListener, true);
            menu.setAttribute(ATTRIBUTE.BLOCKED, ATTRIBUTE_VALUE.EMPTY);
        };

        // Apply sidebar edit blocker
        Promise.all([
            this._sidebar.element as Promise<Element>,
            this._sidebar.selector.$.query(SELECTOR.MENU).element as Promise<Element>
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
                        let isSidebarEditable: boolean | undefined;
                        if (rendered === ATTRIBUTE_VALUE.TRUE || rendered === ATTRIBUTE_VALUE.FALSE) {
                            isSidebarEditable = !(rendered === ATTRIBUTE_VALUE.FALSE);
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
            const customSidebarAttributes = configOrderItem.element!.getAttribute(ATTRIBUTE.CUSTOM_SIDEBAR_ATTRIBUTES)?.split('|') ?? [];
            customSidebarAttributes.forEach((attr: string): void => {
                configOrderItem.element!.removeAttribute(attr);
            });
            customSidebarAttributes.splice(0);
            attrs.forEach((entry) => {
                const [name, value] = entry;
                if (
                    isString(value) ||
                    isNumber(value) ||
                    isBoolean(value)
                ) {
                    configOrderItem.element!.setAttribute(name, `${value}`);
                    customSidebarAttributes.push(name);
                } else {
                    console.warn(`${NAMESPACE}: the property "${name}" in the attributes property of the item "${configOrderItem.item}" should be a string, a number or a boolean. This property will be omitted`);
                }
            });
            configOrderItem.element!.setAttribute(ATTRIBUTE.CUSTOM_SIDEBAR_ATTRIBUTES, customSidebarAttributes.join('|'));
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

    private _subscribeName(element: SidebarItem, name: string): void {
        const itemText = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT)!;
        this._subscribeTemplate(
            name,
            (rendered: string): void => {
                itemText.innerHTML = rendered;
                // If there is a tooltip, update its text too
                const tooltip = this._getTooltip(element);
                if (tooltip) {
                    tooltip.textContent = rendered;
                }
            }
        );
    }

    private _subscribeIcon(element: HTMLElement, icon: string): void {
        this._subscribeTemplate(
            icon,
            (rendered: string): void => {
                let haIcon = element.querySelector(CUSTOM_ELEMENT.HA_ICON);
                if (!haIcon) {
                    haIcon = document.createElement(CUSTOM_ELEMENT.HA_ICON);
                    haIcon.setAttribute(ATTRIBUTE.SLOT, ATTRIBUTE_VALUE.START);
                    const haSvgIcon = element.querySelector(CUSTOM_ELEMENT.HA_SVG_ICON);
                    if (haSvgIcon) {
                        haSvgIcon.replaceWith(haIcon);
                    } else {
                        element.prepend(haIcon);
                    }
                }
                haIcon.setAttribute(ATTRIBUTE.ICON, rendered);
            }
        );
    }

    private _subscribeInfo(element: HTMLElement, info: string): void {
        const textElement = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT)!;
        this._subscribeTemplate(
            info,
            (rendered: string): void => {
                textElement.dataset.info = rendered;
            }
        );
    }

    private _subscribeNotification(element: HTMLElement, notification: string): void {

        const text = element.querySelector(SELECTOR.ITEM_TEXT);
        let badgeStart = element.querySelector(`${SELECTOR.BADGE}[slot="${ATTRIBUTE_VALUE.START}"]`);
        let badgeEnd = element.querySelector(`${SELECTOR.BADGE}[slot="${ATTRIBUTE_VALUE.END}"]`);

        if (!badgeStart) {
            badgeStart = this._buildNotification(ATTRIBUTE_VALUE.START);
            element.insertBefore(badgeStart, text);
        }

        if (!badgeEnd) {
            badgeEnd = this._buildNotification(ATTRIBUTE_VALUE.END);
            element.append(badgeEnd);
        }

        const callback = (rendered: string): void => {
            if (rendered.length) {
                badgeStart.innerHTML = rendered;
                badgeEnd.innerHTML = rendered;
                element.setAttribute(ATTRIBUTE.WITH_NOTIFICATION, ATTRIBUTE_VALUE.TRUE);
            } else {
                badgeStart.innerHTML = '';
                badgeEnd.innerHTML = '';
                element.removeAttribute(ATTRIBUTE.WITH_NOTIFICATION);
            }
        };

        this._subscribeTemplate(notification, callback);

    }

    private async _checkEmptyBottomList(): Promise<void> {
        const container = (await this._sidebar.selector.$.query(SELECTOR.SIDEBAR_BOTTOM_ITEMS_CONTAINER).element) as HTMLElement;
        const items = container.querySelectorAll<SidebarItem>(`:scope > ${CUSTOM_ELEMENT.ITEM}`);
        const hasVisibleItems = Array.from(items).some((item: SidebarItem): boolean => item.style.display === '');
        if (hasVisibleItems) {
            container.removeAttribute(ATTRIBUTE.EMPTY);
        } else {
            container.setAttribute(ATTRIBUTE.EMPTY, ATTRIBUTE_VALUE.EMPTY);
        }
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
                        rendered === ATTRIBUTE_VALUE.TRUE
                    );
                    this._checkEmptyBottomList();
                }
            );
        }
    }

    private _setElementVariables = (
        element: HTMLElement,
        dictionary: [string, string | undefined][]
    ) => {
        dictionary.forEach(([cssVariable, value]) => {
            if (value) {
                element.style.setProperty(
                    cssVariable,
                    value
                );
            }
        });
    };

    private _subscribeTemplateVariableChanges<T, K extends keyof T>(
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
        callback: (rendered: string) => void
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
        let focusIndex = 0;

        if (forward) {
            const start = activeIndex + 1;
            const end = start + length;
            for (let i = start; i < end; i++) {
                const index = i > length - 1
                    ? i - length
                    : i;
                if (this._items[index].style.display !== ATTRIBUTE_VALUE.NONE) {
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
                if (this._items[index].style.display !== ATTRIBUTE_VALUE.NONE) {
                    focusIndex = index;
                    break;
                }
            }
        }

        this._items[focusIndex].focus();
        this._items[focusIndex].tabIndex = 0;

    }

    private _focusItemByKeyboard(sidebarItemsContainer: HTMLElement, forward: boolean): void {

        const selectors = [
            `${SELECTOR.SCOPE} > ${CUSTOM_ELEMENT.ITEM}:not(.${CLASS.ITEM_SELECTED}):focus`,
            `${SELECTOR.SCOPE} > ${CUSTOM_ELEMENT.ITEM}:focus`
        ];

        const activeItem = sidebarItemsContainer.querySelector<HTMLElement>(selectors.join(','));

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

        const haIconButton = sidebarShadowRoot.querySelector<HTMLElement>(CUSTOM_ELEMENT.HA_ICON_BUTTON)!;
        const activeIndex = this._items.indexOf(element);
        const lastIndex = this._items.length - 1;

        if (activeIndex >= 0) {

            if (
                (forward && activeIndex < lastIndex) ||
                (!forward && activeIndex > 0)
            ) {
                this._focusItem(activeIndex, forward);
            } else if(!forward) {
                haIconButton.focus();
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
            this._haDrawer.selector.$.query(SELECTOR.MC_DRAWER).element as Promise<HTMLElement>,
            this._sidebar.element as Promise<HTMLElement>,
            this._sidebar.selector.$.element as Promise<ShadowRoot>
        ]).then((elements: [HTMLElement, HTMLElement, HTMLElement, ShadowRoot]) => {

            const [
                homeAssistantMain,
                mcDrawer,
                sidebar,
                sideBarShadowRoot
            ] = elements;

            // Set width variables
            const { width } = this._config;

            if (isObject<SidebarWidth>(width)) {
                this._setElementVariables(
                    homeAssistantMain,
                    [
                        [CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH_EXTENDED, parseWidth(width.extended)],
                        [CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH_HIDDEN, parseWidth(width.hidden)]
                    ]
                );
            } else {
                this._setElementVariables(
                    homeAssistantMain,
                    [
                        [CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH, parseWidth(width)]
                    ]
                );
            }

            this._subscribeTemplateVariableChanges(
                this._config,
                sidebar,
                SIDEBAR_OPTIONS_VARIABLES_MAP
            );

            this._subscribeTemplateVariableChanges(
                this._config,
                mcDrawer,
                SIDEBAR_BORDER_COLOR_VARIABLES_MAP
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
                STYLES.SIDEBAR_WIDTH_DESKTOP,
                homeAssistantMain.shadowRoot!
            );

            this._styleManager.addStyle(
                [
                    STYLES.SIDEBAR_BORDER_COLOR,
                    STYLES.SIDEBAR_WIDTH_MOBILE
                ],
                mcDrawer
            );

            this._styleManager.addStyle(
                [
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
        await this._waitForSidebarReady()
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
                        if (this._isAnalyticsOptionEnabled(ANALITICS_KEYS.SIDEBAR_ITEM_CLICKED)) {
                            sideBarShadowRoot.addEventListener(EVENT.CLICK, (event: Event) => {
                                const clickedElement = event.target as HTMLElement;
                                const itemClicked = clickedElement.closest(CUSTOM_ELEMENT.ITEM);
                                if (itemClicked) {
                                    const itemText = itemClicked.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT)!.textContent;
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
                                this._focusItemByKeyboard(sidebarTopItemsContainer, event.key === KEY.ARROW_DOWN);
                            }
                        }, true);

                        sidebarBottomItemsContainer.addEventListener(EVENT.KEYDOWN, (event: KeyboardEvent) => {
                            if (
                                event.key === KEY.ARROW_DOWN ||
                                event.key === KEY.ARROW_UP
                            ) {
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                this._focusItemByKeyboard(sidebarBottomItemsContainer, event.key === KEY.ARROW_DOWN);
                            }
                        }, true);
                    });
            });

    }

    private async _aplyItemRippleStyles(): Promise<void> {
        const sidebarItemsContainer = (await this._sidebar.selector.$.query(CUSTOM_ELEMENT.ITEM).all) as NodeListOf<HTMLElement>;
        Array.from(sidebarItemsContainer).forEach((item: HTMLElement): void => {
            const innerElement = item.getAttribute(ATTRIBUTE.TYPE) === ATTRIBUTE_VALUE.LINK
                ? this._getAnchorElement(item)
                : this._getButtonElement(item);
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

    private _getTooltip(item: SidebarItem): HTMLElement | null {
        return item.parentElement!.querySelector(`${CUSTOM_ELEMENT.TOOLTIP}[${ATTRIBUTE.FOR}="${item.id}"]`);
    }

    private async _refreshTooltips(): Promise<void> {

        const sidebar = (await this._sidebar.element) as Sidebar;
        const removeTooltips = sidebar.alwaysExpand || isMobileClient;
        const newItems = sidebar.shadowRoot!.querySelectorAll<SidebarItem>(`${CUSTOM_ELEMENT.ITEM}[${ATTRIBUTE.NEW_ITEM}]`);

        newItems.forEach((item: SidebarItem): void => {
            let tooltip = this._getTooltip(item);
            if (removeTooltips) {
                tooltip?.parentElement!.removeChild(tooltip);
            } else if(!tooltip) {
                const text = item.querySelector(SELECTOR.ITEM_TEXT)!.textContent;
                tooltip = this._buildTooltip(item.id, text);
                item.after(tooltip);
            }
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
                        _this._refreshTooltips();
                    }
                    return shouldUpdate.call(this, changedProps);
                };
            });
    }

    private _rearrange(): void {
        this._getElements()
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
                        this._hideItem(element, true);
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
                                    : element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT)!.textContent.trim();

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

                        const newItem = this._buildNewItem(orderItem);

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
                        this._subscribeAttributes(
                            orderItem,
                            orderItem.attributes
                        );
                    }

                    if (orderItem.divider) {
                        orderItem.element!.setAttribute(ATTRIBUTE.WITH_DIVIDER, ATTRIBUTE_VALUE.TRUE);
                    }

                    if (orderItem.name) {
                        this._subscribeName(
                            orderItem.element!,
                            orderItem.name
                        );
                    }

                    if (orderItem.icon) {
                        this._subscribeIcon(
                            orderItem.element!,
                            orderItem.icon
                        );
                    }

                    if (orderItem.info) {
                        this._subscribeInfo(
                            orderItem.element!,
                            orderItem.info
                        );
                    }

                    if (orderItem.notification) {
                        this._subscribeNotification(
                            orderItem.element!,
                            orderItem.notification
                        );
                    }

                    if (!isUndefined(orderItem.hide)) {
                        this._subscribeHide(
                            orderItem.element!,
                            orderItem.hide
                        );
                    }

                    this._subscribeTemplateVariableChanges(
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
                this._refreshTooltips();
                this._processSidebarMode();

            });
    }

    private async _mouseClick(item: ConfigOrderWithItem, event: MouseEvent): Promise<void> {

        const { on_click, element } = item;
        const onClickAction = on_click!;
        const sidebarItem = element as SidebarItem;
        const textElement = sidebarItem.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT)!;
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
                this._huiViewContainerObserver.observe(huiViewContainer, {
                    subtree: true,
                    childList: true
                });
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
                    this._logger.log('Executing plugin logic...');
                    this._renderer.variables = {
                        ...(this._config.js_variables ?? {}),
                        ...buildNavigateMethods(this._sidebar),
                        ...buildFireEventMethods(this._ha),
                        ...getRestApis(this._ha),
                        ...getDialogsMethods(this._ha),
                        ...getFormatDateMethods(this._ha),
                        ...getToastMethods(this._ha)
                    };
                    this._renderer.refs = this._config.js_refs ?? {};
                    this._processDefaultPath();
                    this._subscribeTitle();
                    this._processSidebar();
                    this._subscribeSideBarEdition();
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