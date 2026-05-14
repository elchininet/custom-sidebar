import { HomeAsssistantExtended, ShowToastParams } from '@types';
import { EVENT } from '@constants';
import { fireEvent } from './events';

export const getToastMethods = (ha: HomeAsssistantExtended) => {
    return {
        showToast: (params: ShowToastParams) => {
            fireEvent(
                ha,
                EVENT.SHOW_TOAST,
                params
            );
        }
    };
};