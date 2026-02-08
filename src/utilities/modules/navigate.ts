import { HAElement } from 'home-assistant-query-selector';
import { SidebarItem } from '@types';
import {
    CLASS,
    CUSTOM_ELEMENT,
    EVENT,
    NAMESPACE
} from '@constants';

const dispatchLocationChanged = (pathname: string): void => {
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
        dispatchLocationChanged(pathname);
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