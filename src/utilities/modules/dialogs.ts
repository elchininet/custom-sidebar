import {
    HomeAsssistantExtended,
    HassExtended,
    PartialPanelResolver,
    Router,
    HaConfigBackupBackups,
    HaConfigSystemNavigation,
    HomeAssistantDialogEventDetail,
    DialogImport,
    DialogBoxParameters
} from '@types';
import { CUSTOM_ELEMENT, EVENT } from '@constants';

const getHaPanelConfig = async (): Promise<Router> => {
    if (!customElements.get(CUSTOM_ELEMENT.HA_PANEL_CONFIG)) {
        const partialPanelResolver = document.createElement(CUSTOM_ELEMENT.PARTIAL_PANEL_RESOLVER) as PartialPanelResolver;
        partialPanelResolver.hass = {
            panels: [
                {
                    url_path: 'config',
                    component_name: 'config'
                }
            ]
        } as HassExtended;
        partialPanelResolver._updateRoutes();
        await partialPanelResolver.routerOptions.routes.config.load();
        await customElements.whenDefined(CUSTOM_ELEMENT.HA_PANEL_CONFIG);
    }
    const haPanelConfig = document.createElement(CUSTOM_ELEMENT.HA_PANEL_CONFIG) as Router;
    return haPanelConfig;
};

const getHaConfigBackupBackups = async (haPanelConfig: Router): Promise<HaConfigBackupBackups> => {
    if (!customElements.get(CUSTOM_ELEMENT.HA_CONFIG_BACKUP)) {
        await haPanelConfig.routerOptions.routes.backup.load();
        await customElements.whenDefined(CUSTOM_ELEMENT.HA_CONFIG_BACKUP);
    }
    const haConfigBackupBackups = document.createElement(CUSTOM_ELEMENT.HA_CONFIG_BACKUP_BACKUPS) as HaConfigBackupBackups;
    return haConfigBackupBackups;
};

const getHaConfigSystemNavigation = async (haPanelConfig: Router): Promise<HaConfigSystemNavigation> => {
    if (!customElements.get(CUSTOM_ELEMENT.HA_CONFIG_SYSTEM_NAVIGATION)) {
        await haPanelConfig.routerOptions.routes.system.load();
        await customElements.whenDefined(CUSTOM_ELEMENT.HA_CONFIG_SYSTEM_NAVIGATION);
    }
    const haConfigSystemNavigation = document.createElement(CUSTOM_ELEMENT.HA_CONFIG_SYSTEM_NAVIGATION) as HaConfigSystemNavigation;
    return haConfigSystemNavigation;
};

const getDialogBox = async (ha: HomeAsssistantExtended): Promise<CustomElementConstructor> => {

    const dialogBox = customElements.get(CUSTOM_ELEMENT.DIALOG_BOX);

    if (dialogBox) {
        return dialogBox;
    }

    const haPanelConfig = await getHaPanelConfig();
    await getHaConfigBackupBackups(haPanelConfig);

    const haConfigBackupBackups = document.createElement(CUSTOM_ELEMENT.HA_CONFIG_BACKUP_BACKUPS) as HaConfigBackupBackups;

    haConfigBackupBackups.hass = ha.hass;

    return new Promise<CustomElementConstructor>((resolve) => {

        haConfigBackupBackups.addEventListener(
            EVENT.SHOW_DIALOG,
            (event: CustomEvent<HomeAssistantDialogEventDetail>): void => {
                const dialogBox = event.detail.dialogImport();
                resolve(dialogBox);
            },
            { once: true }
        );

        haConfigBackupBackups._deleteBackup();

    });

};

const getDialogRestart = async (): Promise<CustomElementConstructor> => {

    const dialogRestart = customElements.get(CUSTOM_ELEMENT.DIALOG_RESTART);

    if (dialogRestart) {
        return dialogRestart;
    }

    const haPanelConfig = await getHaPanelConfig();
    const haConfigSystemNavigation = await getHaConfigSystemNavigation(haPanelConfig);

    return new Promise((resolve) => {

        haConfigSystemNavigation.addEventListener(
            EVENT.SHOW_DIALOG,
            (event: CustomEvent<HomeAssistantDialogEventDetail>): void => {
                const dialogRestart = event.detail.dialogImport();
                resolve(dialogRestart);
            },
            { once: true }
        );

        haConfigSystemNavigation._showRestartDialog();

    });

};

const showDialog = (
    ha: HomeAsssistantExtended,
    dialogTag: string,
    dialogImport: DialogImport,
    dialogParams: DialogBoxParameters
) => {
    ha.dispatchEvent(
        new CustomEvent(
            EVENT.SHOW_DIALOG,
            {
                bubbles: true,
                cancelable: false,
                composed: true,
                detail: {
                    dialogTag,
                    dialogImport,
                    dialogParams
                }
            }
        )
    );
};

const showRestartDialog = (
    ha: HomeAsssistantExtended,
    dialogImport: DialogImport
) => {
    showDialog(
        ha,
        CUSTOM_ELEMENT.DIALOG_RESTART,
        dialogImport,
        {}
    );
};

export const openRestartDialog = async (ha: HomeAsssistantExtended): Promise<void> => {
    const dialogRestart = await getDialogRestart();
    showRestartDialog(
        ha,
        () => Promise.resolve(dialogRestart)
    );
};

export const openAlertDialog = async (
    ha: HomeAsssistantExtended,
    dialogParams: DialogBoxParameters
): Promise<void> => {
    const dialogBox = await getDialogBox(ha);
    showDialog(
        ha,
        CUSTOM_ELEMENT.DIALOG_BOX,
        () => Promise.resolve(dialogBox),
        dialogParams
    );
};

export const openConfirmDialog = async (
    ha: HomeAsssistantExtended,
    dialogParams: DialogBoxParameters
): Promise<void> => {
    const dialogBox = await getDialogBox(ha);
    showDialog(
        ha,
        CUSTOM_ELEMENT.DIALOG_BOX,
        () => Promise.resolve(dialogBox),
        {
            ...dialogParams,
            confirmation: true
        }
    );
};

export const openMoreInfoDialog = (ha: HomeAsssistantExtended, entityId: string): void => {
    ha.dispatchEvent(
        new CustomEvent(
            EVENT.HASS_MORE_INFO,
            {
                detail: { entityId }
            }
        )
    );
};

export const getDialogsMethods = (ha: HomeAsssistantExtended) => {
    return {
        openAlertDialog: (dialogParams: DialogBoxParameters): void => {
            const {
                title,
                text,
                confirmText,
                confirm
            } = dialogParams;
            openAlertDialog(
                ha,
                {
                    title,
                    text,
                    confirmText,
                    confirm
                }
            );
        },
        openConfirmDialog: (dialogParams: DialogBoxParameters): void => {
            const {
                title,
                text,
                destructive,
                confirmText,
                dismissText,
                confirm,
                cancel
            } = dialogParams;
            openConfirmDialog(
                ha,
                {
                    title,
                    text,
                    destructive,
                    confirmText,
                    dismissText,
                    confirm,
                    cancel
                }
            );
        },
        openRestartDialog: () => {
            openRestartDialog(ha);
        },
        openMoreInfoDialog: (entityId: string) => {
            openMoreInfoDialog(ha, entityId);
        }
    };
};