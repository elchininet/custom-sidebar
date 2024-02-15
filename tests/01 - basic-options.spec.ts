import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import {
  SELECTORS,
  CONFIG_FILES,
  SIDEBAR_CLIP
} from './constants';
import { haConfigRequest, fulfillJson } from './utilities';

test.beforeAll(async () => {
  await haConfigRequest(CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
  await expect(page).toHaveScreenshot('01-sidebar.png', {
    clip: SIDEBAR_CLIP
  });
};

test('Sidebar items are processed', async ({ page }) => {

  await pageVisit(page);

  const items = [
    SELECTORS.SIDEBAR_ITEMS.OVERVIEW,
    SELECTORS.SIDEBAR_ITEMS.TODO,
    SELECTORS.SIDEBAR_ITEMS.LOGBOOK,
    SELECTORS.SIDEBAR_ITEMS.MEDIA_BROWSER,
    SELECTORS.SIDEBAR_ITEMS.CONFIG,
    SELECTORS.SIDEBAR_ITEMS.DEV_TOOLS,
    SELECTORS.SIDEBAR_ITEMS.ENERGY,
    SELECTORS.SIDEBAR_ITEMS.MAP,
    SELECTORS.SIDEBAR_ITEMS.HISTORY
  ];

  for (const selector of items) {
    await expect(page.locator(selector)).toHaveAttribute('data-processed', 'true');
  } 

});

test('Sidebar new items', async ({ page }) => {

  await pageVisit(page);

  const items = [
    SELECTORS.SIDEBAR_ITEMS.GOOGLE,
    SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS,
    SELECTORS.SIDEBAR_ITEMS.ENTITIES,
    SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS
  ];

  for (const selector of items) {
    await expect(page.locator(selector)).toBeVisible();
  }

  const google = page.locator(SELECTORS.SIDEBAR_ITEMS.GOOGLE);
  await expect(google).toHaveText('Google', { useInnerText: true });
  await expect(google).toHaveAttribute('href', 'https://mrdoob.com/projects/chromeexperiments/google-gravity/');
  await expect(google).toHaveAttribute('target', '_blank');

  const integrations = page.locator(SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS);
  await expect(integrations).toHaveText('Integrations', { useInnerText: true });
  await expect(integrations).toHaveAttribute('href', '/config/integrations');
  await expect(integrations).not.toHaveAttribute('target', '_blank');

  const entities = page.locator(SELECTORS.SIDEBAR_ITEMS.ENTITIES);
  await expect(entities).toHaveText('Entities', { useInnerText: true });
  await expect(entities).toHaveAttribute('href', '/config/entities');
  await expect(entities).not.toHaveAttribute('target', '_blank');

  const automations = page.locator(SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS);
  await expect(automations).toHaveText('Automations', { useInnerText: true });
  await expect(automations).toHaveAttribute('href', '/config/automation');
  await expect(automations).not.toHaveAttribute('target', '_blank');

  const hidden = page.locator(SELECTORS.SIDEBAR_ITEMS.HIDDEN);
  await expect(hidden).not.toBeAttached();

});

test('Sidebar new item with notification', async ({ page }) => {

  await fulfillJson(page, {
    order: [
      {
        new_item: true,
        item: 'Integrations',
        href: '/config/integrations',
        icon: "mdi:puzzle",
        notification: '2'
      },
    ]
  });

  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
  await expect(page).toHaveScreenshot('02-sidebar-new-item-notification.png', {
    clip: SIDEBAR_CLIP
  });

});

test('Sidebar change href and target', async ({ page }) => {

  await fulfillJson(page, {
    order: [
      {
        item: 'config',
        match: 'data-panel',
        href: '/config/system',
        target: '_blank'
      },
    ]
  });

  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
  
  const config = page.locator(SELECTORS.SIDEBAR_ITEMS.CONFIG);
  await expect(config).toHaveAttribute('href', '/config/system');
  await expect(config).toHaveAttribute('target', '_blank');

});

test('Sidebar order', async ({ page }) => {

  await pageVisit(page);

  const items = [
    [SELECTORS.SIDEBAR_ITEMS.OVERVIEW, '0'],
    [SELECTORS.SIDEBAR_ITEMS.GOOGLE, '1'],
    [SELECTORS.SIDEBAR_ITEMS.INTEGRATIONS, '2'],
    [SELECTORS.SIDEBAR_ITEMS.ENTITIES, '3'],
    [SELECTORS.SIDEBAR_ITEMS.AUTOMATIONS, '4'],
    [SELECTORS.SIDEBAR_ITEMS.TODO, '5'],
    [SELECTORS.SIDEBAR_ITEMS.ENERGY, '7'],
    [SELECTORS.SIDEBAR_ITEMS.MAP, '8'],
    [SELECTORS.SIDEBAR_ITEMS.HISTORY, '9'],
    [SELECTORS.SIDEBAR_ITEMS.LOGBOOK, '12'],
    [SELECTORS.SIDEBAR_ITEMS.MEDIA_BROWSER, '13'],
    [SELECTORS.SIDEBAR_ITEMS.CONFIG, '14'],
    [SELECTORS.SIDEBAR_ITEMS.DEV_TOOLS, '15']
  ];

  for (const entry of items) {
    const [selector, index] = entry;
    await expect(page.locator(selector)).toHaveCSS('order', index);
  }
});

test('Sidebar no visible', async ({ page }) => {

  await pageVisit(page);

  const items = [
    SELECTORS.SIDEBAR_ITEMS.ENERGY,
    SELECTORS.SIDEBAR_ITEMS.MAP,
    SELECTORS.SIDEBAR_ITEMS.HISTORY
  ];

  for (const selector of items) {
    await expect(page.locator(selector)).not.toBeVisible();
  }

});
