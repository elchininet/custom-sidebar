import { Page } from '@playwright/test';
import {
	BASE_URL,
	JSON_PATH,
	MAXIMUM_RETRIES
} from './constants';

export const haRequest = async (file: string, retries = 0) => {
	return fetch(
		`${BASE_URL}/api/services/shell_command/copy_sidebar_config`,
		{
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${process.env.HA_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				json: file
			})
		}
	).then((response: Response) => {
		if (response.ok || retries >= MAXIMUM_RETRIES) {
			return response;
		}
		return haRequest(file, retries + 1);
	});
};

export const addJsonExceptionsRoute = async (page: Page, exceptions: Record<string, unknown>[]): Promise<void> => {
	await page.route(JSON_PATH, async route => {
		const response = await route.fetch();
		const json = await response.json();
		const jsonWithExceptions = {
			...json,
			exceptions
		};
		await route.fulfill({
			response,
			json: jsonWithExceptions
		});
	});
};

export const fulfillJson = async (page: Page, json: Record<string, unknown>): Promise<void> => {
	await page.route(JSON_PATH, async route => {
        await route.fulfill({ json });
    });
};
