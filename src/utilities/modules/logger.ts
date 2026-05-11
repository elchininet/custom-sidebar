import { NAMESPACE } from '@constants';
import { version } from '../../../package.json';

export class Logger {

    constructor(enabled: boolean) {
        this._enabled = enabled;
    }

    private _enabled: boolean;

    static logVersionToConsole() {
        console.info(
            `%c≡ ${NAMESPACE.toUpperCase()} %cv${version}`,
            'font-weight: bold; background: #EEEEEE; color: #666666; padding: 2px 5px;',
            'font-weight: normal; background: #E87A24; color: #FFFFFF; padding: 2px 5px'
        );
    }

    public log(
        topic: string,
        metadata?: unknown,
        config?: {
            stringify?: boolean;
            table?: boolean;
        }
    ): void {
        const {
            stringify = true,
            table = false
        } = config ?? {};
        if (this._enabled) {
            const topicMessage = `${NAMESPACE} debug: ${topic}`;
            if (metadata) {
                console.groupCollapsed(topicMessage);
                if (table) {
                    console.table(metadata);
                } else {
                    console.log(
                        stringify
                            ? JSON.stringify(metadata, null, 4)
                            : metadata
                    );
                }
                console.groupEnd();
            } else {
                console.log(topicMessage);
            }
        }
    }

    public get enabled(): boolean {
        return this._enabled;
    }

}