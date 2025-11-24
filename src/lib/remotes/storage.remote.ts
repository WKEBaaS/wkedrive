import { form, getRequestEvent } from '$app/server';
import * as api from '$lib/server';
import { appErrorSchema, createStorageFolderSchema, deleteStorageObjectsSchema } from '$src/lib/schemas';
import { invalid, isHttpError } from '@sveltejs/kit';
import { CREATE_STORAGE_FOLDER, DELETE_STORAGE_OBJECTS } from '../server/postgrest/endpoints';
import * as v from 'valibot';

export const createStorageFolder = form(
	createStorageFolderSchema,
	async (data, issue) => {
		const event = getRequestEvent();
		const token = await api.auth.fetchToken(event);

		try {
			await api.postgrest.post(CREATE_STORAGE_FOLDER, token, data);
			return { success: true };
		} catch (e) {
			if (!isHttpError(e)) {
				throw e;
			}

			const parsedError = v.safeParse(appErrorSchema, e.body);
			if (!parsedError.success) {
				throw e;
			}
			switch (parsedError.output.status) {
				case 409:
					invalid(issue.p_name(`A folder with this name already exists.`));
			}

			throw e;
		}
	},
);

export const deleteStorageObjects = form(deleteStorageObjectsSchema, async (data) => {
	console.log('Deleting storage objects with data:', data);
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);
	return api.postgrest.post(DELETE_STORAGE_OBJECTS, token, data);
});
