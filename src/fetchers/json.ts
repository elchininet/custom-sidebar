import { Config } from '@types';
import { NAMESPACE, CONFIG_PATH } from '@constants';
import { randomId } from '@utilities';
import { validateConfig } from '@validators';

export const fetchConfig = async (): Promise<Config> => {
    const errorNotFound = `${NAMESPACE}: JSON config file not found.`;
    const errorSuffix = 'Make sure you have valid config in /config/www/sidebar-order.json file.';
    return new Promise<Config>((resolve, reject) => {
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
                            } else {
                                reject(`${NAMESPACE}: Bad configuration.\n${errorSuffix}`);
                            }                            
                        })
                        .catch((error: Error) => {
                            reject(`${NAMESPACE}: ${error?.message || error}`);
                        });
                } else {
                    reject(`${errorNotFound}\n${errorSuffix}`);
                }
            })
            .catch(() => {
                reject(`${errorNotFound}\n${errorSuffix}`);
            });
    });
};