import { EVENT } from '@constants';

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

export const navigate = (pathname: string): void => {
    const params: Parameters<typeof window.history.replaceState> = [
        null,
        '',
        pathname
    ];
    window.history.replaceState(...params);
    dispatchLocationChanged(pathname);
};