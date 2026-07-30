import { HAElement } from 'home-assistant-query-selector';
import {
    DialogBoxParameters,
    DialogImport,
    HaConfigBackupBackups,
    HaConfigSystemNavigation,
    HomeAssistantDialogEventDetail,
    HomeAsssistantExtended,
    Router
} from '@types';
import { CUSTOM_ELEMENT, EVENT } from '@constants';
import { fireEvent } from './events';

const getHaPanelConfig = async (partialPanelResolver: HAElement): Promise<Router> => {
    if (!customElements.get(CUSTOM_ELEMENT.HA_PANEL_CONFIG)) {
        const partialPanelResolverElement = await partialPanelResolver.element as Router;
        await partialPanelResolverElement.routerOptions.routes.config.load();
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

const getDialogBox = async (
    ha: HomeAsssistantExtended,
    partialPanelResolver: HAElement
): Promise<CustomElementConstructor> => {

    const dialogBox = customElements.get(CUSTOM_ELEMENT.DIALOG_BOX);

    if (dialogBox) {
        return dialogBox;
    }

    const haPanelConfig = await getHaPanelConfig(partialPanelResolver);
    const haConfigBackupBackups = await getHaConfigBackupBackups(haPanelConfig);

    haConfigBackupBackups.hass = ha.hass;

    return new Promise<CustomElementConstructor>((resolve) => {

        haConfigBackupBackups.addEventListener(
            EVENT.SHOW_DIALOG,
            (event: Event): void => {
                const dialogBox = (event as CustomEvent<HomeAssistantDialogEventDetail>).detail.dialogImport();
                resolve(dialogBox);
            },
            { once: true }
        );

        // Mock the _overflowBackup local variable to make the condition to pass without errors
        haConfigBackupBackups._overflowBackup = true;

        haConfigBackupBackups._deleteBackup();

    });

};

const getDialogRestart = async (partialPanelResolver: HAElement): Promise<CustomElementConstructor> => {

    const dialogRestart = customElements.get(CUSTOM_ELEMENT.DIALOG_RESTART);

    if (dialogRestart) {
        return dialogRestart;
    }

    const haPanelConfig = await getHaPanelConfig(partialPanelResolver);
    const haConfigSystemNavigation = await getHaConfigSystemNavigation(haPanelConfig);

    return new Promise((resolve) => {

        haConfigSystemNavigation.addEventListener(
            EVENT.SHOW_DIALOG,
            (event: Event): void => {
                const dialogRestart = (event as CustomEvent<HomeAssistantDialogEventDetail>).detail.dialogImport();
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
    fireEvent(
        ha,
        EVENT.SHOW_DIALOG,
        {
            dialogTag,
            dialogImport,
            dialogParams
        }
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

export const openRestartDialog = async (
    ha: HomeAsssistantExtended,
    partialPanelResolver: HAElement
): Promise<void> => {
    const dialogRestart = await getDialogRestart(partialPanelResolver);
    showRestartDialog(
        ha,
        () => Promise.resolve(dialogRestart)
    );
};

export const openAlertDialog = async (
    ha: HomeAsssistantExtended,
    partialPanelResolver: HAElement,
    dialogParams: DialogBoxParameters
): Promise<void> => {
    const dialogBox = await getDialogBox(ha, partialPanelResolver);
    showDialog(
        ha,
        CUSTOM_ELEMENT.DIALOG_BOX,
        () => Promise.resolve(dialogBox),
        dialogParams
    );
};

export const openConfirmDialog = async (
    ha: HomeAsssistantExtended,
    partialPanelResolver: HAElement,
    dialogParams: DialogBoxParameters
): Promise<void> => {
    const dialogBox = await getDialogBox(ha, partialPanelResolver);
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

export const openMoreInfoDialog = (
    ha: HomeAsssistantExtended,
    entityId: string
): void => {
    fireEvent(
        ha,
        EVENT.HASS_MORE_INFO,
        { entityId }
    );
};

export const getDialogsMethods = (ha: HomeAsssistantExtended, partialPanelResolver: HAElement) => {
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
                partialPanelResolver,
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
                partialPanelResolver,
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
            openRestartDialog(ha, partialPanelResolver);
        },
        openMoreInfoDialog: (entityId: string) => {
            openMoreInfoDialog(ha, entityId);
        }
    };
};