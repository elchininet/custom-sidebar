import { HassConnection } from 'home-assistant-javascript-templates';
import { getHassConnectionPromise } from './misc';
import { HomeAsssistantExtended } from '@types';
import { EVENT } from '@constants';

class LocaleManager {
    constructor() {
        this._locale = new Promise<Record<string, unknown>>((resolve) => {
            getHassConnectionPromise()
                .then(async (hassConnection: HassConnection) => {
                    const cancelSubscriptionPromise = hassConnection.conn.subscribeMessage<{ value: Record<string, unknown> }>(
                        (message: { value: Record<string, unknown> }): void => {
                            resolve(message.value);
                        },
                        {
                            type: EVENT.SUBSCRIBE_USER_DATA,
                            key: this._langKey
                        }
                    );
                    (await cancelSubscriptionPromise)();
                });
        });
    }
    private _langKey = 'language';
    private _locale: Promise<Record<string, unknown>>;
    public get locale(): Promise<Record<string, unknown>> {
        return this._locale;
    }
}

export const localeManager = new LocaleManager();

export const getTranslationMethods = (ha: HomeAsssistantExtended) => {

    const localize = (resource: string) => ha.hass.localize(resource);

    return {
        localize,
        localizeAsync: async (resource: string): Promise<string> => {
            await localeManager.locale;
            return localize(resource);
        }
    };
};