import jsYaml from 'js-yaml';
import { Config } from '@types';
import {
    CONFIG_NAME,
    CONFIG_PATH,
    NAMESPACE
} from '@constants';
import { randomId } from '@utilities';
import { validateConfig } from '@validators';

export const fetchConfig = async (): Promise<Config> => {
    const errorNotFound = `${NAMESPACE}: YAML config file not found.`;
    const errorSuffix = `Make sure you have valid config in /config/www/${CONFIG_NAME}.yaml file.`;
    return new Promise<Config>((resolve) => {
        fetch(
            `${CONFIG_PATH}.yaml?hash=${randomId()}`,
            {
                cache: 'no-store'
            }
        )
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
                            validateConfig(config);
                            resolve(config);
                        })
                        .catch((error: Error) => {
                            throw Error(`${NAMESPACE}: ${error?.message || error}`);
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