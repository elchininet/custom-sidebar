import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { SELECTORS, CONFIG_FILES } from './constants';
import { haRequest, addJsonExceptionsRoute } from './utilities';

test.beforeAll(async () => {
  await haRequest(CONFIG_FILES.BASIC);
});

const pageVisit = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

test('Exceptions item override', async ({ page }) => {

  await addJsonExceptionsRoute(page, [
    {
      user: 'Test',
      base_order: true,
      order: [
        {
          item: 'developer tools',
          bottom: true,
          order: 9
        }
      ]
    }
  ]);

  await pageVisit(page);

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('01-sidebar-exceptions-override.png');

});

test('Exceptions new_item override', async ({ page }) => {

  await addJsonExceptionsRoute(page, [
    {
      user: 'Test',
      base_order: true,
      order: [
        {
          new_item: true,
          item: 'Google',
          name: 'Search',
          icon: 'mdi:web',
          href: 'https://google.com',
          order: -1
        }
      ]
    }
  ]);

  await pageVisit(page);

  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('02-sidebar-exceptions-new-item-override.png');

  const google = page.locator(SELECTORS.SIDEBAR_ITEMS.GOOGLE);
  await expect(google).toHaveText('Search', { useInnerText: true });
  await expect(google).toHaveAttribute('href', 'https://google.com');
  await expect(google).not.toHaveAttribute('target', '_blank');

  const googleIcon = page.locator(`${SELECTORS.SIDEBAR_ITEMS.GOOGLE} ha-icon[icon="mdi:web"]`);
  expect(googleIcon).toBeVisible();

});

test.describe('Exceptions matchers', async () => {

  const json = {
    base_order: true,
    order: [
      {
        new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow',
        href: '/check',
        order: 10
      }
    ]
  };

  test('Exceptions user', async ({ page }) => {

    await addJsonExceptionsRoute(page, [
      {
        user: 'Test',
        ...json
      }
    ]);
  
    await pageVisit(page);
  
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('03-sidebar-exceptions-check-item.png');
  
  });

  test('Exceptions user as array', async ({ page }) => {

    await addJsonExceptionsRoute(page, [
      {
        user: ['ElChiniNet', 'Test', 'Palaus'],
        ...json
      }
    ]);
  
    await pageVisit(page);
  
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('03-sidebar-exceptions-check-item.png');
  
  });
  
  test('Exceptions not_user', async ({ page }) => {
  
    await addJsonExceptionsRoute(page, [
      {
        not_user: 'ElChiniNet',
        ...json
      }
    ]);
  
    await pageVisit(page);
  
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('03-sidebar-exceptions-check-item.png');
  
  });

  test('Exceptions not_user as an array', async ({ page }) => {
  
    await addJsonExceptionsRoute(page, [
      {
        not_user: ['ElChiniNet', 'Palaus'],
        ...json
      }
    ]);
  
    await pageVisit(page);
  
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('03-sidebar-exceptions-check-item.png');
  
  });

  test('Exceptions device', async ({ page }) => {
  
    await addJsonExceptionsRoute(page, [
      {
        device: 'Chrome',
        ...json
      }
    ]);
  
    await pageVisit(page);
  
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('03-sidebar-exceptions-check-item.png');
  
  });

  test('Exceptions device as an array', async ({ page }) => {
  
    await addJsonExceptionsRoute(page, [
      {
        device: ['Android', 'Chrome', 'iPad'],
        ...json
      }
    ]);
  
    await pageVisit(page);
  
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('03-sidebar-exceptions-check-item.png');
  
  });

  test('Exceptions not_device', async ({ page }) => {
  
    await addJsonExceptionsRoute(page, [
      {
        not_device: 'iPad',
        ...json
      }
    ]);
  
    await pageVisit(page);
  
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('03-sidebar-exceptions-check-item.png');
  
  });

  test('Exceptions not_device as an array', async ({ page }) => {
  
    await addJsonExceptionsRoute(page, [
      {
        not_device: ['iPad', 'Android'],
        ...json
      }
    ]);
  
    await pageVisit(page);
  
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('03-sidebar-exceptions-check-item.png');
  
  });

  test('Exceptions do not extend', async ({ page }) => {
  
    await addJsonExceptionsRoute(page, [
      {
        user: 'Test',
        order: [
          ...json.order,
          {
            item: 'dev',
            bottom: true
          },
          {
            item: 'config',
            match: 'data-panel',
            bottom: true
          }
        ],
        base_order: false
      }
    ]);
  
    await pageVisit(page);

    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toHaveScreenshot('04-sidebar-exceptions-check-on-top.png');
  
  });

});