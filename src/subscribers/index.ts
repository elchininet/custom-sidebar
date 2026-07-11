import { HAElement } from 'home-assistant-query-selector';
import {
    HomeAssistantJavaScriptTemplatesRenderer,
    HassConnection
} from 'home-assistant-javascript-templates';
import {
    Config,
    ConfigOrderWithItem,
    HomeAsssistantExtended,
    SidebarItem,
    SubscriberTemplate
} from '@types';
import {
    ATTRIBUTE,
    ATTRIBUTE_VALUE,
    CUSTOM_ELEMENT,
    EVENT,
    JINJA_TEMPLATE_REG,
    JS_TEMPLATE_REG,
    NAMESPACE,
    SELECTOR
} from '@constants';
import {
    buildNotification,
    getItemTextElement,
    getHassConnectionPromise,
    getTemplateWithPartials,
    getTooltip,
    hideItem,
    isArray,
    isBoolean,
    isNumber,
    isObject,
    isRegExp,
    isString
} from '@utilities';

export class Subscribers {

    constructor(
        ha: HomeAsssistantExtended,
        config: Config,
        renderer: HomeAssistantJavaScriptTemplatesRenderer
    ) {
        this._ha = ha;
        this._config = config;
        this._renderer = renderer;
    }

    private _ha: HomeAsssistantExtended;
    private _config: Config;
    private _renderer: HomeAssistantJavaScriptTemplatesRenderer;

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

    public createJsTemplateSubscription(
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

    public createJinjaTemplateSubscription(
        template: string,
        callback: (rendered: string) => void
    ): ReturnType<HassConnection['conn']['subscribeMessage']> {
        return new Promise((resolve) => {
            getHassConnectionPromise()
                .then((hassConnection: HassConnection) => {
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

    private _subscribeTemplate(template: string | number | boolean, callback: (rendered: string) => void): void {
        const templateWithPartials = getTemplateWithPartials(
            `${template}`,
            this._config.partials
        );

        if (JS_TEMPLATE_REG.test(templateWithPartials)) {
            this.createJsTemplateSubscription(
                templateWithPartials.replace(JS_TEMPLATE_REG, '$1'),
                callback
            );
        } else if (JINJA_TEMPLATE_REG.test(templateWithPartials)) {
            this.createJinjaTemplateSubscription(
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

    public subscribeTitle(sidebar: HAElement): void {
        const titlePromise = sidebar
            .selector
            .$
            .query(SELECTOR.TITLE)
            .element as Promise<HTMLElement>;
        titlePromise.then((titleElement: HTMLElement) => {
            if (this._config.title) {
                titleElement.innerHTML = '';
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

    public subscribeSideBarEdition(
        sidebar: HAElement,
        renderedCallback: (isSidebarEditable: boolean | undefined) => void
    ): void {

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
            sidebar.element as Promise<Element>,
            sidebar.selector.$.query(SELECTOR.MENU).element as Promise<Element>
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
                        renderedCallback(isSidebarEditable);
                    }
                );
            }
        });

    }

    public subscribeAttributes(
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

    public subscribeName(
        element: SidebarItem,
        name: string
    ): void {
        const itemTextElement = getItemTextElement(element);
        itemTextElement.innerHTML = '';
        this._subscribeTemplate(
            name,
            (rendered: string): void => {
                itemTextElement.innerHTML = rendered;
                // If there is a tooltip, update its text too
                const tooltip = getTooltip(element);
                if (tooltip) {
                    tooltip.textContent = rendered;
                }
            }
        );
    }

    public subscribeIcon(element: HTMLElement, icon: string): void {
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

    public subscribeInfo(
        element: SidebarItem,
        info: string
    ): void {
        const itemTextElement = getItemTextElement(element);
        this._subscribeTemplate(
            info,
            (rendered: string): void => {
                itemTextElement.dataset.info = rendered;
            }
        );
    }

    public subscribeNotification(element: SidebarItem, notification: string): void {

        const itemTextElement = getItemTextElement(element);
        let badgeStart = element.querySelector(`${SELECTOR.BADGE}[slot="${ATTRIBUTE_VALUE.START}"]`);
        let badgeEnd = element.querySelector(`${SELECTOR.BADGE}[slot="${ATTRIBUTE_VALUE.END}"]`);

        if (!badgeStart) {
            badgeStart = buildNotification(ATTRIBUTE_VALUE.START);
            element.insertBefore(badgeStart, itemTextElement);
        }

        if (!badgeEnd) {
            badgeEnd = buildNotification(ATTRIBUTE_VALUE.END);
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

    public subscribeHide(
        element: HTMLElement,
        hide: boolean | string,
        renderedCallback: () => void
    ) {
        if (isBoolean(hide)) {
            hideItem(element, hide);
        } else {
            this._subscribeTemplate(
                hide,
                (rendered: string): void => {
                    hideItem(
                        element,
                        rendered === ATTRIBUTE_VALUE.TRUE
                    );
                    renderedCallback();
                }
            );
        }
    }

    public subscribeTemplateVariableChanges<T, K extends keyof T>(
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



}