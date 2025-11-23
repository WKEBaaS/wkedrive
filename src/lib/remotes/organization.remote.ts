import { form, getRequestEvent } from '$app/server';
import { createOrganizationSchema, deleteOrganizationSchema } from '../schemas';
import * as api from '$lib/server';
import { CREATE_ORGANIZATION, DELETE_ORGANIZATION } from '$lib/server/postgrest/endpoints';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const createOrganization = form(createOrganizationSchema, async (data) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);
	await api.postgrest.post(CREATE_ORGANIZATION, token, data);

	redirect(301, resolve('/dashboard/organizations'));
});

export const deleteOrganization = form(deleteOrganizationSchema, async (data) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);
	await api.postgrest.post(DELETE_ORGANIZATION, token, data);

	redirect(301, resolve('/dashboard/organizations'));
});
