import jsYaml from 'js-yaml';
import { Config } from '@types';
import { NAMESPACE, CONFIG_PATH } from '@constants';
import { randomId } from '@utilities';
import { validateConfig } from '@validators';

export const fetchConfig = async (): Promise<Config> => {
    const errorNotFound = `${NAMESPACE}: YAML config file not found.`;
    const errorSuffix = 'Make sure you have valid config in /config/www/sidebar-order.yaml file.';
    return new Promise<Config>((resolve, reject) => {
        fetch(`${CONFIG_PATH}.yaml?hash=${randomId()}`)
            .then((response: Response) => {
                if (response.ok) {
                    response
                        .text()
                        .then((yaml) => {
                            return jsYaml.load(yaml);
                        })
                        .then((config: Config) => {
                            if (config.id?.startsWith('example_yaml')) {
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