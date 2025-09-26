import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
    CONFIG_FILES,
    SELECTORS,
    HREFS,
    SIDEBAR_CLIP,
    ATTRIBUTES
} from './constants';
import { haConfigRequest } from './ha-services';
import { addJsonExtendedRoute, changeToMobileViewport } from './utilities';
import { getSidebarItem } from './selectors';

const SELECTED_CLASSNAME = /(^|\s)selected(\s|$)/;

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

const visitHome = async (page: Page): Promise<void> => {
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('sidebar.png', {
        clip: SIDEBAR_CLIP
    });
};

test('clicking on items with the same root path should select the proper item', async ({ page }) => {

    await visitHome(page);
    await page.waitForTimeout(600);

    const integrations = getSidebarItem(page, HREFS.INTEGRATIONS);
    const config = getSidebarItem(page, HREFS.CONFIG);
    const entities = getSidebarItem(page, HREFS.ENTITIES);
    const automations = getSidebarItem(page, HREFS.AUTOMATIONS);

    await integrations.click();
    await page.waitForTimeout(600);

    await expect(integrations).toHaveClass(SELECTED_CLASSNAME);
    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);

    await entities.click();
    await page.waitForTimeout(600);

    await expect(entities).toHaveClass(SELECTED_CLASSNAME);
    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);

    await automations.click();
    await page.waitForTimeout(600);

    await expect(automations).toHaveClass(SELECTED_CLASSNAME);
    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);

    await config.click();
    await page.waitForTimeout(600);

    await expect(config).toHaveClass(SELECTED_CLASSNAME);
    await expect(integrations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(entities).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automations).not.toHaveClass(SELECTED_CLASSNAME);

});

test('clicking on items inside the same lovelace dashboard should select the proper item', async ({ page }) => {

    const home = '/lovelace/home';
    const view1 = '/lovelace/view_1';
    const view2 = '/lovelace/view_2';

    const sidebar = page.locator(SELECTORS.HA_SIDEBAR);
    const huView = page.locator(SELECTORS.HUI_VIEW);
    const homeItem = getSidebarItem(page, home);
    const view1Item = getSidebarItem(page, view1);
    const view2Item = getSidebarItem(page, view2);

    const tabSelector = 'ha-tab-group-tab';
    const tabHome = page.locator(tabSelector, { hasText: 'Home' });
    const tabView1 = page.locator(tabSelector, { hasText: 'View 1' });
    const tabView2 = page.locator(tabSelector, { hasText: 'View 2' });

    const homePanel = page.locator('hui-card hui-entities-card');
    const view1Panel = page.getByText('View 1 panel');
    const view2Panel = page.getByText('View 2 panel');

    await addJsonExtendedRoute(page, {
        order: [
            {
                item: 'overview',
                href: home,
                order: 0
            },
            {
                new_item: true,
                item: 'View 1',
                icon: 'mdi:view-dashboard',
                href: view1
            },
            {
                new_item: true,
                item: 'View 2',
                icon: 'mdi:view-dashboard',
                href: view2
            }
        ]
    });

    await page.goto('/');
    await expect(sidebar).toBeVisible();
    await expect(huView).toBeVisible();

    await expect(homeItem).toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).not.toHaveClass(SELECTED_CLASSNAME);

    await expect(homePanel).toBeVisible();
    await expect(view1Panel).not.toBeVisible();
    await expect(view2Panel).not.toBeVisible();

    await view1Item.click();
    await page.waitForTimeout(600);

    await expect(homeItem).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).not.toHaveClass(SELECTED_CLASSNAME);

    await expect(homePanel).not.toBeVisible();
    await expect(view1Panel).toBeVisible();
    await expect(view2Panel).not.toBeVisible();

    await view2Item.click();
    await page.waitForTimeout(600);

    await expect(homeItem).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).toHaveClass(SELECTED_CLASSNAME);

    await expect(homePanel).not.toBeVisible();
    await expect(view1Panel).not.toBeVisible();
    await expect(view2Panel).toBeVisible();

    await homeItem.click();
    await page.waitForTimeout(600);

    await expect(homeItem).toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).not.toHaveClass(SELECTED_CLASSNAME);

    await expect(homePanel).toBeVisible();
    await expect(view1Panel).not.toBeVisible();
    await expect(view2Panel).not.toBeVisible();

    await tabView1.click();
    await page.waitForTimeout(600);

    await expect(homeItem).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).not.toHaveClass(SELECTED_CLASSNAME);

    await expect(homePanel).not.toBeVisible();
    await expect(view1Panel).toBeVisible();
    await expect(view2Panel).not.toBeVisible();

    await tabView2.click();
    await page.waitForTimeout(600);

    await expect(homeItem).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).toHaveClass(SELECTED_CLASSNAME);

    await expect(homePanel).not.toBeVisible();
    await expect(view1Panel).not.toBeVisible();
    await expect(view2Panel).toBeVisible();

    await tabHome.click();
    await page.waitForTimeout(600);

    await expect(homeItem).toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).not.toHaveClass(SELECTED_CLASSNAME);

    await expect(homePanel).toBeVisible();
    await expect(view1Panel).not.toBeVisible();
    await expect(view2Panel).not.toBeVisible();

});

test('hiting Enter with items focused should select the proper item', async ({ page }) => {

    await visitHome(page);
    await page.waitForTimeout(600);

    const integrations = getSidebarItem(page, HREFS.INTEGRATIONS);
    const config = getSidebarItem(page, HREFS.CONFIG);
    const entities = getSidebarItem(page, HREFS.ENTITIES);

    await integrations.focus();
    await page.waitForTimeout(600);

    await page.keyboard.press('Enter');

    await expect(integrations).toHaveClass(SELECTED_CLASSNAME);
    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);

    await entities.focus();
    await page.waitForTimeout(600);

    await page.keyboard.press('Enter');

    await expect(entities).toHaveClass(SELECTED_CLASSNAME);
    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);

});

test('visit a URL that matches with multiple items should select the proper item', async ({ page }) => {

    const integrationsBackupHref = '/config/integrations/integration/backup';
    const automationNewHref = '/config/automation/edit/new';

    const sidebar = page.locator(SELECTORS.HA_SIDEBAR);
    const config = getSidebarItem(page, HREFS.CONFIG);
    const integrations = getSidebarItem(page, HREFS.INTEGRATIONS);
    const integrationsBackup = getSidebarItem(page, integrationsBackupHref);
    const entities = getSidebarItem(page, HREFS.ENTITIES);
    const automations = getSidebarItem(page, HREFS.AUTOMATIONS);
    const automationNew = getSidebarItem(page, automationNewHref);

    await addJsonExtendedRoute(page, {
        exceptions: [
            {
                user: 'Test',
                extend_from: 'base',
                order: [
                    {
                        new_item: true,
                        item: 'Integrations Backup',
                        icon: 'mdi:puzzle',
                        href: integrationsBackupHref
                    },
                    {
                        new_item: true,
                        item: 'New Automation',
                        icon: 'mdi:robot',
                        href: automationNewHref
                    }
                ]
            }
        ]
    });

    await page.goto('/config');
    await expect(sidebar).toBeVisible();

    await expect(config).toHaveClass(SELECTED_CLASSNAME);
    await expect(integrations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrationsBackup).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(entities).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automationNew).not.toHaveClass(SELECTED_CLASSNAME);

    await page.goto('/config/integrations');
    await expect(sidebar).toBeVisible();

    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrations).toHaveClass(SELECTED_CLASSNAME);
    await expect(integrationsBackup).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(entities).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automationNew).not.toHaveClass(SELECTED_CLASSNAME);

    await page.goto(integrationsBackupHref);
    await expect(sidebar).toBeVisible();

    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrationsBackup).toHaveClass(SELECTED_CLASSNAME);
    await expect(entities).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automationNew).not.toHaveClass(SELECTED_CLASSNAME);

    await page.goto('/config/entities');
    await expect(sidebar).toBeVisible();

    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrationsBackup).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(entities).toHaveClass(SELECTED_CLASSNAME);
    await expect(automations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automationNew).not.toHaveClass(SELECTED_CLASSNAME);

    await page.goto('/config/automation');
    await expect(sidebar).toBeVisible();

    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrationsBackup).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(entities).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automations).toHaveClass(SELECTED_CLASSNAME);
    await expect(automationNew).not.toHaveClass(SELECTED_CLASSNAME);

    await page.goto(automationNewHref);
    await expect(sidebar).toBeVisible();

    await expect(config).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrationsBackup).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(entities).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automationNew).toHaveClass(SELECTED_CLASSNAME);

    await page.goto('/config/areas/dashboard');
    await expect(sidebar).toBeVisible();

    await expect(config).toHaveClass(SELECTED_CLASSNAME);
    await expect(integrations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(integrationsBackup).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(entities).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automations).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(automationNew).not.toHaveClass(SELECTED_CLASSNAME);

});

test('visiting a URL of a lovelace view should select the proper item', async ({ page }) => {

    const home = '/lovelace/home';
    const view1 = '/lovelace/view_1';
    const view2 = '/lovelace/view_2';

    const sidebar = page.locator(SELECTORS.HA_SIDEBAR);
    const huView = page.locator(SELECTORS.HUI_VIEW);
    const homeItem = getSidebarItem(page, home);
    const view1Item = getSidebarItem(page, view1);
    const view2Item = getSidebarItem(page, view2);

    await addJsonExtendedRoute(page, {
        order: [
            {
                item: 'overview',
                href: home,
                order: 0
            },
            {
                new_item: true,
                item: 'View 1',
                icon: 'mdi:view-dashboard',
                href: view1
            },
            {
                new_item: true,
                item: 'View 2',
                icon: 'mdi:view-dashboard',
                href: view2
            }
        ]
    });

    await page.goto(home);
    await expect(sidebar).toBeVisible();
    await expect(huView).toBeVisible();

    await expect(homeItem).toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).not.toHaveClass(SELECTED_CLASSNAME);

    await page.goto(view1);
    await expect(sidebar).toBeVisible();
    await expect(huView).toBeVisible();

    await expect(homeItem).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).not.toHaveClass(SELECTED_CLASSNAME);

    await page.goto(view2);
    await expect(sidebar).toBeVisible();
    await expect(huView).toBeVisible();

    await expect(homeItem).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view1Item).not.toHaveClass(SELECTED_CLASSNAME);
    await expect(view2Item).toHaveClass(SELECTED_CLASSNAME);

});

test('the scroll should be restored after clicking on an element', async ({ page }) => {

    await page.setViewportSize({ width: 1024, height: 500 });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('sidebar-small-viewport.png', {
        clip: {
            ...SIDEBAR_CLIP,
            height: 378
        }
    });
    await page.waitForTimeout(600);

    const scrollTopStart = await page.locator(SELECTORS.SIDEBAR_ITEMS_CONTAINER).evaluate(element => element.scrollTop);

    await getSidebarItem(page, HREFS.INTEGRATIONS).click({ delay: 150 });
    await page.waitForTimeout(600);

    expect(
        await page.locator(SELECTORS.SIDEBAR_ITEMS_CONTAINER).evaluate(element => element.scrollTop)
    ).toBe(scrollTopStart);

});

test('the scroll should be restored after pressing Enter with an element focused', async ({ page }) => {

    await page.setViewportSize({ width: 1024, height: 500 });

    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('sidebar-small-viewport.png', {
        clip: {
            ...SIDEBAR_CLIP,
            height: 378
        }
    });
    await page.waitForTimeout(600);

    const scrollTopStart = await page.locator(SELECTORS.SIDEBAR_ITEMS_CONTAINER).evaluate(element => element.scrollTop);

    await getSidebarItem(page, HREFS.INTEGRATIONS).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    expect(
        await page.locator(SELECTORS.SIDEBAR_ITEMS_CONTAINER).evaluate(element => element.scrollTop)
    ).toBe(scrollTopStart);

});

test('by default it should be possible to edit the sidebar', async ({ page }) => {

    await visitHome(page);

    await page.locator(SELECTORS.TITLE).click({ delay: 1000 });

    await expect(page.locator(SELECTORS.SIDEBAR_EDIT_MODAL)).toBeVisible();

    await page.goto('/profile');

    await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

});

test('if sidebar_editable is set to true it should be possible to edit the sidebar', async ({ page }) => {

    await visitHome(page);

    await addJsonExtendedRoute(page, {
        sidebar_editable: true
    });

    await page.locator(SELECTORS.TITLE).click({ delay: 1000 });

    await expect(page.locator(SELECTORS.SIDEBAR_EDIT_MODAL)).toBeVisible();

    await page.goto('/profile');

    await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).not.toHaveAttribute(ATTRIBUTES.DISABLED);

});

test('if sidebar_editable is set to false it should not be possible to edit the sidebar', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_editable: false
    });

    await visitHome(page);

    await expect(page.locator(SELECTORS.MENU)).toHaveCSS('pointer-events', 'none');
    await expect(page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON)).toHaveCSS('pointer-events', 'all');

    await page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON).click({ delay: 1000 });

    await expect(page.locator(SELECTORS.SIDEBAR_EDIT_MODAL)).not.toBeVisible();

    await page.goto('/profile');

    await expect(page.locator(SELECTORS.PROFILE_EDIT_BUTTON)).toHaveAttribute(ATTRIBUTES.DISABLED);

});

test('if sidebar_mode is set to "hidden" it should not be possible to make the sidebar visible', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_mode: 'hidden'
    });

    await page.goto('/profile');

    await page.locator(SELECTORS.PROFILE_HIDE_SIDEBAR).click();
    await expect(page.locator(`${SELECTORS.PROFILE_HIDE_SIDEBAR} input`)).not.toBeChecked();
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toHaveAttribute('narrow');

    await page.reload();

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveAttribute('narrow');
    await expect(page.locator(`${SELECTORS.PROFILE_HIDE_SIDEBAR} input`)).toBeChecked();

});

test('if sidebar_mode is set to "narrow" it should not be possible to hide the sidebar', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_mode: 'narrow'
    });

    await page.goto('/profile');

    await page.locator(SELECTORS.PROFILE_HIDE_SIDEBAR).click();
    await expect(page.locator(`${SELECTORS.PROFILE_HIDE_SIDEBAR} input`)).toBeChecked();
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveAttribute('narrow');

    await page.reload();

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toHaveAttribute('narrow');
    await expect(page.locator(`${SELECTORS.PROFILE_HIDE_SIDEBAR} input`)).not.toBeChecked();

});

test('if sidebar_mode is set to "extended" it should not be possible to hide the sidebar', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_mode: 'extended'
    });

    await page.goto('/profile');

    await page.locator(SELECTORS.PROFILE_HIDE_SIDEBAR).click();
    await expect(page.locator(`${SELECTORS.PROFILE_HIDE_SIDEBAR} input`)).toBeChecked();
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveAttribute('narrow');

    await page.reload();

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toHaveAttribute('narrow');
    await expect(page.locator(`${SELECTORS.PROFILE_HIDE_SIDEBAR} input`)).not.toBeChecked();

});

test('if sidebar_mode is set to "extended" it should keep the extended mode when changed to mobile', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        sidebar_mode: 'extended'
    });

    await page.goto('/');

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();

    await changeToMobileViewport(page);

    await page.waitForTimeout(5);
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).not.toHaveAttribute('narrow');

});

test('navigating with the keyboard up and down arrows should focus the proper items in order', async ({ page }) => {

    await visitHome(page);

    const overview = getSidebarItem(page, HREFS.OVERVIEW);
    const google = getSidebarItem(page, HREFS.GOOGLE);
    const integrations = getSidebarItem(page, HREFS.INTEGRATIONS);
    const devTools = getSidebarItem(page, HREFS.DEV_TOOLS);
    const config = getSidebarItem(page, HREFS.CONFIG);

    await overview.focus();

    await page.keyboard.press('ArrowDown');

    await expect(google).toBeFocused();

    await page.keyboard.press('ArrowDown');

    await expect(integrations).toBeFocused();

    await page.keyboard.press('ArrowUp');

    await expect(google).toBeFocused();

    await page.keyboard.press('ArrowUp');

    await expect(overview).toBeFocused();

    await page.keyboard.press('ArrowUp');

    await expect(devTools).toBeFocused();

    await page.keyboard.press('ArrowUp');

    await expect(config).toBeFocused();

    await page.keyboard.press('ArrowDown');

    await expect(devTools).toBeFocused();

    await page.keyboard.press('ArrowDown');

    await expect(overview).toBeFocused();

});

test('navigating with the keyboard using tab should focus the proper items in order', async ({ page }) => {

    await visitHome(page);

    const overview = getSidebarItem(page, HREFS.OVERVIEW);
    const google = getSidebarItem(page, HREFS.GOOGLE);
    const integrations = getSidebarItem(page, HREFS.INTEGRATIONS);
    const config = getSidebarItem(page, HREFS.CONFIG);
    const devTools = getSidebarItem(page, HREFS.DEV_TOOLS);
    const notifications = page.locator(SELECTORS.NOTIFICATIONS);
    const profile = page.locator(SELECTORS.PROFILE);
    const haIconButton = page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON);

    await overview.focus();

    await page.keyboard.press('Tab');

    await expect(google).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(integrations).toBeFocused();

    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');

    await expect(google).toBeFocused();

    await page.keyboard.press('Tab');

    await overview.focus();

    await page.keyboard.press('Tab');

    await expect(haIconButton).toBeFocused();

    await page.keyboard.up('Shift');
    await page.keyboard.press('Tab');

    await expect(overview).toBeFocused();

    await config.focus();

    await page.keyboard.press('Tab');

    await expect(devTools).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(notifications).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(profile).toBeFocused();

    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');

    await expect(notifications).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(devTools).toBeFocused();

});

test('pressing tab without being in the sidebar should not select any item', async ({ page }) => {

    await visitHome(page);

    await page.evaluate(() => {
        const selected = document.activeElement;
        if (selected && selected instanceof HTMLElement) {
            selected.blur();
        }
    });

    await page.keyboard.press('Tab');

    await expect(getSidebarItem(page, HREFS.OVERVIEW)).not.toBeFocused();

});

test('new items should have tooltips', async ({ page }) => {

    await visitHome(page);

    const google = getSidebarItem(page, HREFS.GOOGLE);
    const tooltip = page.locator(SELECTORS.TOOLTIP);
    const haIconButton = page.locator(SELECTORS.SIDEBAR_HA_ICON_BUTTON);
    const sidebar = page.locator(SELECTORS.HA_SIDEBAR);

    await google.hover();

    await expect(tooltip).not.toBeVisible();

    await haIconButton.click();

    await expect(sidebar).not.toHaveAttribute('expanded');

    await google.hover();

    await expect(tooltip).toBeVisible();

    await expect(tooltip).toContainText('Google');

    await haIconButton.click();

});