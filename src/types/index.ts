import { getPromisableResult } from 'get-promisable-result';

export * from './modules/config';
export * from './modules/elements';
export * from './modules/primitives';
export * from './modules/services';

// TODO: export PromisableOptions from get-promisable-result
export type PromisableOptions = Parameters<typeof getPromisableResult>[2];

declare global {
    interface Window {
        CustomSidebar: object;
    }
}