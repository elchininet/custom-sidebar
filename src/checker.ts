import { getPromisableResult } from 'get-promisable-result';
import {
    MAX_ATTEMPTS,
    NAMESPACE,
    RETRY_DELAY
} from './constants/global';

getPromisableResult(
    () => window.CustomSidebar,
    (customSideBar: object) => !!customSideBar,
    {
        retries: MAX_ATTEMPTS,
        delay: RETRY_DELAY,
        shouldReject: false
    }
).then((sidebar) => {
    if (!sidebar) {
        throw Error(`${NAMESPACE}: you need to add the plugin as a frontend > extra_module_url module.\nCheck the documentation: https://elchininet.github.io/custom-sidebar/installation`);
    }
});