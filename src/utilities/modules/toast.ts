import { HomeAsssistantExtended, ShowToastParams } from '@types';
import { EVENT } from '@constants';

export const getToastMethods = (ha: HomeAsssistantExtended) => {
    return {
        showToast: (params: ShowToastParams) => {
            ha.dispatchEvent(
                new CustomEvent(
                    EVENT.SHOW_TOAST,
                    {
                        detail: params
                    }
                )
            );
        }
    };
};