import { NAMESPACE } from '@constants';
import { getPromisableElement } from '@utilities';

getPromisableElement(
    () => window.CustomSidebar,
    (customSideBar: {}) => !!customSideBar
).then((sidebar) => {
    if (!sidebar) {
        throw Error(`${NAMESPACE}: you need to add the plugin as a frontend > extra_module_url module.\nCheck the documentation: https://github.com/elchininet/custom-sidebar#installation`);
    }
});