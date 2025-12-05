import { test, expect } from 'playwright-test-coverage';
import { CONFIG_FILES, SIDEBAR_CLIP } from './constants';
import { haConfigRequest } from './ha-services';
import {
    fulfillJson,
    navigateHome,
    noCacheRoute
} from './utilities';

const getSelectedOrderItemExtendingColorOption = (
    optionBase: {
        option: string;
        value: string;
    },
    option: string
) => ({
    [optionBase.option]: optionBase.value,
    order: [
        {
            item: 'overview',
            [option]: 'red'
        }
    ]
});

test.beforeAll(async ({ browser }) => {
    await haConfigRequest(browser, CONFIG_FILES.BASIC);
});

test.beforeEach(noCacheRoute);

[
    {
        title: 'should set global icon_color_selected getting the value of icon_color',
        json: getSelectedOrderItemExtendingColorOption(
            {
                option: 'icon_color_selected',
                value: 'var(--custom-sidebar-icon-color)'
            },
            'icon_color'
        ),
        screenshot: 'icon-color-selected-from-icon-color.png'
    },
    {
        title: 'should set global text_color_selected getting the value of text_color',
        json: getSelectedOrderItemExtendingColorOption(
            {
                option: 'text_color_selected',
                value: 'var(--custom-sidebar-text-color)'
            },
            'text_color'
        ),
        screenshot: 'text-color-selected-from-text-color.png'
    },
    {
        title: 'should set global selection_background getting the value of text_color',
        json: getSelectedOrderItemExtendingColorOption(
            {
                option: 'selection_background',
                value: 'var(--custom-sidebar-text-color)'
            },
            'text_color'
        ),
        screenshot: 'selection-background-from-text-color.png'
    },
    {
        title: 'should set global selection_opacity',
        json: getSelectedOrderItemExtendingColorOption(
            {
                option: 'selection_opacity',
                value: '1'
            },
            'selection_background'
        ),
        screenshot: 'global-selection-opacity.png'
    }
].forEach(({ title, json, screenshot }) => {

    test(title, async ({ page }) => {

        await fulfillJson(page, json);
        await navigateHome(page);
        await expect(page).toHaveScreenshot(screenshot, {
            clip: SIDEBAR_CLIP
        });

    });

});