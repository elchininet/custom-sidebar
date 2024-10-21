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
import {
    HomeAsssistantExtended,
    HomeAssistantMain,
    HaMenuButton,
    Config,
    ConfigNewItem,
    ConfigOrder,
    ConfigOrderWithItem,
    PartialPanelResolver,
    Sidebar,
    SidebarMode,
    Match,
    SubscriberTemplate
} from '@types';
import {
    NAMESPACE,
    ELEMENT,
    SELECTOR,
    ATTRIBUTE,
    CSS_VARIABLES,
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
    SIDEBAR_MODE_TO_DOCKED_SIDEBAR
} from '@constants';
import {
    logVersionToConsole,
    getPromisableElement,
    getConfigWithExceptions,
    flushPromise,
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
        this._sidebarScroll = 0;
        this._isSidebarEditable = undefined;
        this._itemTouchedBinded = this._itemTouched.bind(this);
        this._mouseEnterBinded = this._mouseEnter.bind(this);
        this._mouseLeaveBinded = this._mouseLeave.bind(this);
        this._configPromise = fetchConfig();
        this._process();
    }

    private _configPromise: Promise<Config>;
    private _configWithExceptions: Config;
    private _homeAssistant: HAElement;
    private _main: HAElement;
    private _ha: HomeAsssistantExtended;
    private _partialPanelResolver: HAElement;
    private _sidebar: HAElement;
    private _sidebarScroll: number;
    private _isSidebarEditable: boolean | undefined;
    private _renderer: HomeAssistantJavaScriptTemplatesRenderer;
    private _items: ConfigOrderWithItem[];
    private _itemTouchedBinded: () => Promise<void>;
    private _mouseEnterBinded: (event: MouseEvent) => void;
    private _mouseLeaveBinded: () => void;

    private async _getConfigWithExceptions(): Promise<void> {
        const device = this._getCurrentDevice();
        this._configWithExceptions = await this._configPromise
            .then((config: Config) => {
                return getConfigWithExceptions(
                    this._ha.hass.user.name.toLocaleLowerCase(),
                    device,
                    config
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

    private _getCurrentDevice(): string {
        return navigator.userAgent.toLowerCase();
    }

    private _getIcon(element: HTMLElement): HTMLElement | null {
        return element.querySelector(
            [
                ELEMENT.HA_SVG_ICON,
                ELEMENT.HA_ICON
            ].join(',')
        );
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

    private _getTemplateString(template: unknown): string {
        let rendered = '';
        if (
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
            } else {
                rendered = JSON.stringify(template);
            }
        }
        return rendered;
    }

    private _updateIcon(element: HTMLAnchorElement, icon: string): void {
        const iconElement = this._getIcon(element);
        if (iconElement) {
            const haIcon = document.createElement(ELEMENT.HA_ICON);
            haIcon.setAttribute('icon', icon);
            haIcon.setAttribute('slot', 'item-icon');
            iconElement.replaceWith(haIcon);
        }
    }

    private _subscribeTitle(): void {
        this._sidebar
            .selector
            .$
            .query(SELECTOR.TITLE)
            .element
            .then((titleElement: HTMLElement) => {
                if (this._configWithExceptions.title) {
                    this._subscribeTemplate(
                        this._configWithExceptions.title,
                        (rendered: string) => {
                            titleElement.innerHTML = rendered;
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
            if (typeof this._configWithExceptions.sidebar_editable === 'boolean') {
                this._isSidebarEditable = this._configWithExceptions.sidebar_editable;
                if (!this._isSidebarEditable) {
                    blockSidebar(homeAssistantMain, menu);
                }
            }
            if (typeof this._configWithExceptions.sidebar_editable === 'string') {
                this._subscribeTemplate(
                    this._configWithExceptions.sidebar_editable,
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

    private _subscribeName(element: HTMLElement, name: string): void {
        const itemText = element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT);
        this._subscribeTemplate(
            name,
            (rendered: string): void => {
                itemText.innerHTML = rendered;
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

        this._subscribeTemplate(notification, callback);

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
            callback(
                this._getTemplateString(template)
            );
        }
    }

    private _createJsTemplateSubscription(
        code: string,
        extraCallback: (result: string) => void
    ): void {

        this._renderer.trackTemplate(
            code,
            (result: unknown): void => {
                extraCallback(
                    this._getTemplateString(result)
                );
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
                    template,
                    variables: {
                        user_name: this._ha.hass.user.name,
                        user_is_admin: this._ha.hass.user.is_admin,
                        user_is_owner: this._ha.hass.user.is_owner,
                        user_agent: window.navigator.userAgent
                    }
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

        // Process Home Assistant Main and Partial Panel Resolver
        Promise.all([
            this._main.element,
            this._partialPanelResolver.element
        ]).then(([homeAssistantMain, partialPanelResolver]: [HomeAssistantMain, PartialPanelResolver]) => {

            const sidebarMode = this._configWithExceptions.sidebar_mode;
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
            this._sidebar.element,
            this._sidebar.selector.$.element,
            this._sidebar.selector.$.query(ELEMENT.PAPER_LISTBOX).element
        ]).then(([sidebar, sideBarShadowRoot, paperListBox]: [HTMLElement, ShadowRoot, HTMLElement]) => {

            const { styles = '' } = this._configWithExceptions;

            const menu = sideBarShadowRoot.querySelector<HTMLElement>(SELECTOR.MENU);

            this._subscribeTemplateColorChanges(
                this._configWithExceptions,
                menu,
                [
                    ['sidebar_button_color', CSS_VARIABLES.SIDEBAR_BUTTON_COLOR],
                    ['title_color',          CSS_VARIABLES.SIDEBAR_TITLE_COLOR]
                ]
            );

            this._subscribeTemplateColorChanges(
                this._configWithExceptions,
                sidebar,
                [
                    ['sidebar_background',      CSS_VARIABLES.CUSTOM_SIDEBAR_BACKGROUND],
                    ['menu_background',         CSS_VARIABLES.CUSTOM_SIDEBAR_MENU_BACKGROUND],
                    ['icon_color',              CSS_VARIABLES.CUSTOM_SIDEBAR_ICON_COLOR],
                    ['icon_color_selected',     CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_ICON_COLOR],
                    ['text_color',              CSS_VARIABLES.CUSTOM_SIDEBAR_TEXT_COLOR],
                    ['text_color_selected',     CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_TEXT_COLOR],
                    ['selection_color',         CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTION_COLOR],
                    ['info_color',              CSS_VARIABLES.CUSTOM_SIDEBAR_INFO_COLOR],
                    ['info_color_selected',     CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_INFO_COLOR],
                    ['notification_color',      CSS_VARIABLES.CUSTOM_SIDEBAR_NOTIFICATION_COLOR],
                    ['notification_text_color', CSS_VARIABLES.CUSTOM_SIDEBAR_NOTIFICATION_TEXT_COLOR],
                    ['selection_opacity',       CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTION_OPACITY],
                    ['divider_color',           CSS_VARIABLES.CUSTOM_SIDEBAR_DIVIDER_COLOR]
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

            const commonNotificationStyles = `
                background-color: var(${CSS_VARIABLES.CUSTOM_SIDEBAR_NOTIFICATION_COLOR}, var(--accent-color));
                border-radius: 20px;
                color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_NOTIFICATION_TEXT_COLOR }, var(${ CSS_VARIABLES.TEXT_ACCENT_COLOR }, var(${ CSS_VARIABLES.TEXT_PRIMARY_COLOR })));
                font-size: 0.65em;
                overflow: hidden;
                padding: 0px 5px;
                text-overflow: ellipsis;
                text-wrap: nowrap;
            `;

            addStyle(
                `
                ${ SELECTOR.HOST } {
                    background: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_BACKGROUND }, var(${ CSS_VARIABLES.SIDEBAR_BACKGROUND_COLOR })) !important;
                }
                ${ SELECTOR.HOST } ${ SELECTOR.MENU } {
                    background: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_MENU_BACKGROUND }, var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_BACKGROUND }, var(${ CSS_VARIABLES.SIDEBAR_MENU_BUTTON_BACKGROUND_COLOR }, var(${ CSS_VARIABLES.PRIMARY_BACKGROUND_COLOR }))));
                    border-bottom: 1px solid var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_DIVIDER_COLOR }, var(${ CSS_VARIABLES.DIVIDER_COLOR }));
                }
                ${ SELECTOR.HOST } ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM }::before {
                    background-color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTION_COLOR }, var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_ICON_COLOR }, var(${ CSS_VARIABLES.SIDEBAR_SELECTED_ICON_COLOR })));
                    opacity: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTION_OPACITY }, 0.12);
                }
                ${ SELECTOR.HOST } ${ SELECTOR.ITEM }[${ ATTRIBUTE.WITH_NOTIFICATION }] > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT } {
                    max-width: calc(100% - 100px);
                }
                ${ SELECTOR.HOST } ${ SELECTOR.ITEM_SELECTED } > ${ ELEMENT.PAPER_ICON_ITEM } > :is(${ ELEMENT.HA_SVG_ICON }, ${ ELEMENT.HA_ICON }) {
                    color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_ICON_COLOR }, var(${ CSS_VARIABLES.SIDEBAR_SELECTED_ICON_COLOR }));
                }
                ${ SELECTOR.HOST } ${ SELECTOR.ITEM_SELECTED } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT } {
                    color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_TEXT_COLOR }, var(${ CSS_VARIABLES.SIDEBAR_SELECTED_TEXT_COLOR }));
                }
                ${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > :is(${ ELEMENT.HA_SVG_ICON }, ${ ELEMENT.HA_ICON }) {
                    color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_ICON_COLOR }, var(${ CSS_VARIABLES.SIDEBAR_ICON_COLOR }));
                }
                ${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT } {
                    color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_TEXT_COLOR }, var(${ CSS_VARIABLES.SIDEBAR_TEXT_COLOR }));
                }
                ${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.NOTIFICATION_BADGE }:not(${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED }) {
                    left: calc(var(--app-drawer-width, 248px) - 22px);
                    max-width: 80px;
                    transform: translateX(-100%);
                    ${commonNotificationStyles}
                }
                ${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED } {
                    bottom: 14px;
                    left: 26px;
                    max-width: 20px;
                    ${commonNotificationStyles}
                }
                ${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.CONFIGURATION_BADGE } {
                    background-color: var(${CSS_VARIABLES.CUSTOM_SIDEBAR_NOTIFICATION_COLOR}, var(--accent-color));
                    color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_NOTIFICATION_TEXT_COLOR }, var(${ CSS_VARIABLES.TEXT_ACCENT_COLOR }, var(${ CSS_VARIABLES.TEXT_PRIMARY_COLOR })));
                }
                ${ SELECTOR.HOST } ${ SELECTOR.DIVIDER }::before {
                    background-color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_DIVIDER_COLOR }, var(${ CSS_VARIABLES.DIVIDER_COLOR }));
                }
                ${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED } {
                    opacity: 0;
                }
                ${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT } {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    line-height: 1;
                }
                ${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }::after {
                    content: attr(data-info);
                    display: none;
                    font-size: 11px;
                    line-height: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                ${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }[data-info]::after {
                    color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_INFO_COLOR }, var(${ CSS_VARIABLES.SIDEBAR_TEXT_COLOR }));
                    display: block;
                }
                ${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM }${ SELECTOR.ITEM_SELECTED } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT } {
                    z-index: 1;
                }
                ${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM }${ SELECTOR.ITEM_SELECTED } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }[data-info]::after {
                    color: var(${ CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_INFO_COLOR }, var(${ CSS_VARIABLES.SIDEBAR_SELECTED_TEXT_COLOR }));
                }
                ${ SELECTOR.MENU }[${ BLOCKED_PROPERTY }] {
                    pointer-events: none;
                }
                ${ SELECTOR.MENU }[${ BLOCKED_PROPERTY }] > ${ SELECTOR.HA_ICON_BUTTON } {
                    pointer-events: all;
                }
                ${ styles }
                `.trim(),
                sideBarShadowRoot
            );

        });

    }

    private _rearrange(): void {
        this._getElements()
            .then((elements) => {

                const { order } = this._configWithExceptions;
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

                    if (!orderItem.hide) {

                        if (orderItem.name) {
                            this._subscribeName(
                                orderItem.element,
                                orderItem.name
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

                        this._subscribeTemplateColorChanges(
                            orderItem,
                            orderItem.element,
                            [
                                ['info_color',          CSS_VARIABLES.CUSTOM_SIDEBAR_INFO_COLOR],
                                ['info_color_selected', CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_INFO_COLOR],
                                ['notification_color',  CSS_VARIABLES.CUSTOM_SIDEBAR_NOTIFICATION_COLOR],
                                ['selection_color',     CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTION_COLOR]
                            ]
                        );

                        this._subscribeTemplateColorChanges(
                            orderItem,
                            this._getIcon(orderItem.element),
                            [
                                ['icon_color',          CSS_VARIABLES.CUSTOM_SIDEBAR_ICON_COLOR],
                                ['icon_color_selected', CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_ICON_COLOR]
                            ]
                        );

                        this._subscribeTemplateColorChanges(
                            orderItem,
                            orderItem.element.querySelector<HTMLElement>(SELECTOR.ITEM_TEXT),
                            [
                                ['text_color',          CSS_VARIABLES.CUSTOM_SIDEBAR_TEXT_COLOR],
                                ['text_color_selected', CSS_VARIABLES.CUSTOM_SIDEBAR_SELECTED_TEXT_COLOR]
                            ]
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

                        this._items.push(orderItem);
                    }

                    orderIndex++;

                });

                if (configItems.length) {
                    processBottom();
                }

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
                        this._getConfigWithExceptions()
                            .then(() => {
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