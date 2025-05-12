import {
    CheckConfigResponse,
    HomeAsssistantExtended,
    Method
} from '@types';
import { ENDPOINTS } from '@constants';

export const getRestApis = (ha: HomeAsssistantExtended) => {
    return {
        checkConfig(): Promise<CheckConfigResponse> {
            return ha.hass.callApi<CheckConfigResponse>(
                Method.POST,
                ENDPOINTS.CHECK_CONFIG
            );
        },
        renderTemplate(template: string): Promise<string> {
            return ha.hass.callApi<string>(
                Method.POST,
                ENDPOINTS.TEMPLATE,
                {
                    template
                }
            );
        },
        callService(
            domain: string,
            service: string,
            data: Record<string, unknown>
        ): Promise<void> {
            return ha.hass.callService(
                domain,
                service,
                data
            );
        }
    };
};