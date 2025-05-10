import {
    HomeAsssistantExtended,
    CheckConfigResponse,
    Method
} from '@types';

const ENDPOINTS = {
    CHECK_CONFIG: 'config/core/check_config',
    TEMPLATE: 'template',
    SERVICES: 'services'
};

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