import { NAMESPACE } from '@constants';
import { version } from '../../../package.json';

export const logVersionToConsole = () => {
    console.info(
        `%c≡ ${NAMESPACE.toUpperCase()} (%CONFIG%)%cv${version}`,
        'font-weight: bold; background: #EEEEEE; color: #666666; padding: 2px 5px;',
        'font-weight: normal; background: #E87A24; color: #FFFFFF; padding: 2px 5px'
    );
};

export class Debugger {

    constructor(debug: boolean) {
        this._debug = debug;
    }

    private _debug: boolean;

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
        if (this._debug) {
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

    public get debug(): boolean {
        return this._debug;
    }

}