import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { SELECTORS } from './constants';
import {
  fulfillJson,
  haSwitchStateRequest,
  haSelectStateRequest
} from './utilities';

const pageVisit = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
  await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
};

const TEXT_SELECTOR = 'paper-listbox > a[data-panel="check"] .item-text';
const NOTIFICATION_SELECTOR_1 = 'paper-listbox > a[data-panel="check"] .notification-badge-collapsed';
const NOTIFICATION_SELECTOR_2 = 'paper-listbox > a[data-panel="check"] .notification-badge:not(.notification-badge-collapsed)';

test('Title returns undefined', async ({ page }) => {

  await fulfillJson(page, {
    title: '[[[ const title = "Custom"; return titles; ]]]',
    order: []
  });

  page.on('console', message => {
    if (message.type() === 'warning') {
        expect(message.text()).toContain('ReferenceError: titles is not defined');
    }
  });

  await pageVisit(page);

  await expect(page.locator(SELECTORS.TITLE)).toBeEmpty();

});

test('Title returns an empty string', async ({ page }) => {

  await fulfillJson(page, {
    title: '[[[ return ""; ]]]',
    order: []
  });

  await pageVisit(page);

  await expect(page.locator(SELECTORS.TITLE)).toBeEmpty();

});

test('Title returns a number', async ({ page }) => {

  await fulfillJson(page, {
    title: '[[[ return 5; ]]]',
    order: []
  });

  await pageVisit(page);

  await expect(page.locator(SELECTORS.TITLE)).toHaveText('5', { useInnerText: true });

});

test('Title returns a boolean', async ({ page }) => {

  await fulfillJson(page, {
    title: '[[[ return false; ]]]',
    order: []
  });

  await pageVisit(page);

  await expect(page.locator(SELECTORS.TITLE)).toHaveText('false', { useInnerText: true });

});

test('Title returns an array', async ({ page }) => {

  await fulfillJson(page, {
    title: '[[[ const title = "Custom"; return [ title ]; ]]]',
    order: []
  });

  await pageVisit(page);

  await expect(page.locator(SELECTORS.TITLE)).toHaveText('["Custom"]', { useInnerText: true });

});

test('Title update returns an empty string', async ({ page }) => {

  await fulfillJson(page, {
    title: '[[[ return states("input_boolean.my_switch") === "on" ? "" : "My Home" ]]]',
    order: []
  });

  await pageVisit(page);

  await expect(page.locator(SELECTORS.TITLE)).toHaveText('My Home', { useInnerText: true });

  await haSwitchStateRequest(true);

  await expect(page.locator(SELECTORS.TITLE)).toBeEmpty();

  await haSwitchStateRequest(false);

  await expect(page.locator(SELECTORS.TITLE)).toHaveText('My Home', { useInnerText: true });

});

test('Name returns undefined', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'check',
        name: '[[[ return hello; ]]]',
        icon: 'mdi:bullseye-arrow',
        href: '/check'
    }]
  });

  page.on('console', message => {
    if (message.type() === 'warning') {
        expect(message.text()).toContain('ReferenceError: hello is not defined');
    }
  });

  await pageVisit(page);

  await expect(page.locator(TEXT_SELECTOR)).toBeEmpty();

});

test('Name returns an empty string', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'check',
        name: '[[[ return ""; ]]]',
        icon: 'mdi:bullseye-arrow',
        href: '/check'
    }]
  });

  await pageVisit(page);

  await expect(page.locator(TEXT_SELECTOR)).toBeEmpty();

});

test('Name returns a number', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'check',
        name: '[[[ return 0; ]]]',
        icon: 'mdi:bullseye-arrow',
        href: '/check'
    }]
  });

  await pageVisit(page);

  await expect(page.locator(TEXT_SELECTOR)).toHaveText('0');

});

test('Name returns a boolean', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'check',
        name: '[[[ return !0; ]]]',
        icon: 'mdi:bullseye-arrow',
        href: '/check'
    }]
  });

  await pageVisit(page);

  await expect(page.locator(TEXT_SELECTOR)).toHaveText('true');

});

test('Name update returns an empty string', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'check',
        name: '[[[ states.input_boolean.my_switch.state === "off" ? "Check" : ""  ]]]',
        icon: 'mdi:bullseye-arrow',
        href: '/check'
    }]
  });

  await pageVisit(page);

  await expect(page.locator(TEXT_SELECTOR)).toHaveText('Check', { useInnerText: true });

  await haSwitchStateRequest(true);

  await expect(page.locator(TEXT_SELECTOR)).toBeEmpty();

  await haSwitchStateRequest(false);

  await expect(page.locator(TEXT_SELECTOR)).toHaveText('Check', { useInnerText: true });

});

test('Name returns an object', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'check',
        name: '[[[ return { total: 2 }; ]]]',
        icon: 'mdi:bullseye-arrow',
        href: '/check'
    }]
  });

  await pageVisit(page);

  await expect(page.locator(TEXT_SELECTOR)).toHaveText('{"total":2}');

});

test('Notification returns undefined', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow',
        href: '/check',
        notification: '[[[ return total; ]]]',
    }]
  });

  page.on('console', message => {
    if (message.type() === 'warning') {
        expect(message.text()).toContain('ReferenceError: total is not defined');
    }
  });

  await pageVisit(page);

  await expect(page.locator(NOTIFICATION_SELECTOR_1)).toBeEmpty();
  await expect(page.locator(NOTIFICATION_SELECTOR_2)).toBeEmpty();

});

test('Notification returns an empty string', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow',
        href: '/check',
        notification: '[[[ return ""; ]]]',
    }]
  });

  await pageVisit(page);

  await expect(page.locator(NOTIFICATION_SELECTOR_1)).toBeEmpty();
  await expect(page.locator(NOTIFICATION_SELECTOR_2)).toBeEmpty();

});

test('Notification returns a number', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow',
        href: '/check',
        notification: '[[[ return -5; ]]]',
    }]
  });

  await pageVisit(page);

  await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('-5');
  await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('-5');

});

test('Notification returns a boolean', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow',
        href: '/check',
        notification: '[[[ return !!"yes"; ]]]',
    }]
  });

  await pageVisit(page);

  await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('true');
  await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('true');

});

test('Notification update returns an empty string', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow',
        href: '/check',
        notification: '[[[ const speed = states("input_select.fan_speed"); return +speed < 3 ? speed : ""  ]]]',
    }]
  });

  await pageVisit(page);

  await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('1', { useInnerText: true });
  await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('1', { useInnerText: true });

  await haSelectStateRequest(2);

  await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('2', { useInnerText: true });
  await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('2', { useInnerText: true });

  await haSelectStateRequest(3);

  await expect(page.locator(NOTIFICATION_SELECTOR_1)).toBeEmpty();
  await expect(page.locator(NOTIFICATION_SELECTOR_2)).toBeEmpty();

  await haSelectStateRequest(1);

  await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('1', { useInnerText: true });
  await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('1', { useInnerText: true });

});

test('Notification returns a regexp', async ({ page }) => {

  await fulfillJson(page, {
    order: [{
      new_item: true,
        item: 'Check',
        icon: 'mdi:bullseye-arrow',
        href: '/check',
        notification: '[[[ return /\w+/; ]]]',
    }]
  });

  await pageVisit(page);

  await expect(page.locator(NOTIFICATION_SELECTOR_1)).toHaveText('{}');
  await expect(page.locator(NOTIFICATION_SELECTOR_2)).toHaveText('{}');

});