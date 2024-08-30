import { Config } from '@types';
import {
    NAMESPACE,
    CONFIG_NAME,
    CONFIG_PATH
} from '@constants';
import { randomId } from '@utilities';
import { validateConfig } from '@validators';

export const fetchConfig = async (): Promise<Config> => {
    const errorNotFound = `${NAMESPACE}: JSON config file not found.`;
    const errorSuffix = `Make sure you have valid config in /config/www/${CONFIG_NAME}.json file.`;
    return new Promise<Config>((resolve) => {
        fetch(`${CONFIG_PATH}.json?hash=${randomId()}`)
            .then((response: Response) => {
                if (response.ok) {
                    response
                        .json()
                        .then((config: Config) => {
                            if (config.id?.startsWith('example_json')) {
                                console.warn(`${NAMESPACE}: You seem to be using the example configuration.\n${errorSuffix}`);
                            }
                            if (validateConfig(config)) {
                                resolve(config);
                            }
                        })
                        .catch((error: Error) => {
                            throw Error(`${NAMESPACE}: ${error.message}`);
                        });
                } else {
                    throw Error(`${errorNotFound}\n${errorSuffix}`);
                }
            })
            .catch(() => {
                throw Error(`${errorNotFound}\n${errorSuffix}`);
            });
    });
};