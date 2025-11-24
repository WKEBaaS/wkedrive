import { form, getRequestEvent } from '$app/server';
import * as api from '$lib/server';
import { createStorageFolderSchema, deleteStorageObjectsSchema } from '$src/lib/schemas';
import { CREATE_STORAGE_FOLDER, DELETE_STORAGE_OBJECTS } from '../server/postgrest/endpoints';

export const createStorageFolder = form(
	createStorageFolderSchema,
	async (data) => {
		const event = getRequestEvent();
		const token = await api.auth.fetchToken(event);
		return api.postgrest.post(CREATE_STORAGE_FOLDER, token, data);
	},
);

export const deleteStorageObjects = form(deleteStorageObjectsSchema, async (data) => {
	console.log('Deleting storage objects with data:', data);
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);
	try {
		await api.postgrest.post(DELETE_STORAGE_OBJECTS, token, data);
	} catch (e) {
		console.error('Error deleting storage objects:', e);
	}
});
