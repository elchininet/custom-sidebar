export * from './modules/config';
export * from './modules/elements';
export * from './modules/primitives';
export * from './modules/services';

declare global {
    interface Window {
        CustomSidebar: object;
    }
}