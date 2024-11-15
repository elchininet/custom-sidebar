import { test, expect } from 'playwright-test-coverage';
import { CONFIG_FILES, SIDEBAR_CLIP_WITH_BORDER } from './constants';
import { haConfigRequest, addJsonExtendedRoute } from './utilities';
import { SELECTORS } from './selectors';

test.beforeAll(async () => {
    await haConfigRequest(CONFIG_FILES.BASIC);
});

test.use({
    launchOptions: {
        args: [
            '--font-render-hinting=none',
            '--disable-skia-runtime-opts',
            '--disable-font-subpixel-positioning',
            '--disable-lcd-text'
        ],
        ignoreDefaultArgs: [
            '--hide-scrollbars'
        ]
    }
});

test('should set scrollbar_thumb_color', async ({ page }) => {

    await addJsonExtendedRoute(page, {
        scrollbar_thumb_color: 'red'
    });
    await page.setViewportSize({
        width: 1024,
        height: 550
    });
    await page.goto('/');
    await expect(page.locator(SELECTORS.HA_SIDEBAR)).toBeVisible();
    await expect(page.locator(SELECTORS.HUI_VIEW)).toBeVisible();
    await expect(page).toHaveScreenshot('01-sidebar-scrollbar-thumb-color.png', {
        clip: {
            ...SIDEBAR_CLIP_WITH_BORDER,
            height: 500
        }
    });

});