import { HAElement } from 'home-assistant-query-selector';
import { SidebarItem } from '@types';
import {
    CLASS,
    CUSTOM_ELEMENT,
    EVENT,
    NAMESPACE
} from '@constants';
import { fireEvent } from './events';

const dispatchLocationChanged = (
    replace: boolean,
    params: Parameters<typeof window.history.replaceState>
): void => {

    const fire = () => {
        fireEvent(
            window,
            EVENT.LOCATION_CHANGED,
            {
                replace,
                source: NAMESPACE
            }
        );
    };

    fire();

    // If there is another LOCATION_CHANGED event not originated from custom-sidebar
    // Within a 100 milliseconds time offset
    // Cancel it replacing the location with the previous pathname
    const offset = 100;
    const time = Date.now();
    const callback = (event: Event) => {
        const timeDiff = Date.now() - time;
        if (
            timeDiff < offset &&
            // If it is not a custom-sidebar event
            (event as CustomEvent).detail?.source !== NAMESPACE
        ) {
            window.history.replaceState(...params);
            fire();
        }
    };

    // Listen for events during the offset
    window.addEventListener(EVENT.LOCATION_CHANGED, callback);

    // Cancel the listener after the offset
    setTimeout(() => {
        window.removeEventListener(EVENT.LOCATION_CHANGED, callback);
    }, offset);
};

export const navigate = (
    pathname: string,
    replace: boolean,
    warningMessage = 'ignoring navigate method using the path'
): void => {
    if (pathname.startsWith('/')) {
        const params: Parameters<typeof window.history.replaceState> = [
            null,
            '',
            pathname
        ];
        if (replace) {
            window.history.replaceState(...params);
        } else {
            window.history.pushState(...params);
        }
        dispatchLocationChanged(replace, params);
    } else {
        console.warn(`${NAMESPACE}: ${warningMessage} "${pathname}" as it doesn't start with "/".`);
    }
};

export const buildNavigateMethods = (sidebar: HAElement) => {
    return {
        navigate,
        activateItem: async (item: SidebarItem) => {
            // Small delay to avoid activating the item before the panel load logic runs
            await new Promise((resolve) => setTimeout(resolve, 5));
            const activeItem = await sidebar.selector.$.query(`${CUSTOM_ELEMENT.ITEM}.${CLASS.ITEM_SELECTED}`).element as HTMLElement;

            activeItem.classList.remove(CLASS.ITEM_SELECTED);
            activeItem.tabIndex = -1;

            item.classList.add(CLASS.ITEM_SELECTED);
            item.tabIndex = 0;
        }
    };
};