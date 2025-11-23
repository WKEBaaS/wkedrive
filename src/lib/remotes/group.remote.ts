import { form, getRequestEvent } from '$app/server';
import {
	addMembersToGroupSchema,
	createOrganizationGroupSchema,
	deleteOrganizationGroupSchema,
	removeMembersFromGroupSchema,
} from '$lib/schemas';
import * as api from '$lib/server';
import {
	ADD_MEMBERS_TO_GROUP,
	CREATE_ORGANIZATION_GROUP,
	DELETE_ORGANIZATION_GROUP,
	REMOVE_MEMBERS_FROM_GROUP,
} from '../server/postgrest/endpoints';

export const createOrgGroup = form(createOrganizationGroupSchema, async (data) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);
	await api.postgrest.post(CREATE_ORGANIZATION_GROUP, token, data);
	return { success: true };
});

export const deleteOrgGroup = form(deleteOrganizationGroupSchema, async (data) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);
	await api.postgrest.post(DELETE_ORGANIZATION_GROUP, token, data);
	return { success: true };
});

export const addMembersToGroup = form(addMembersToGroupSchema, async (data) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);
	await api.postgrest.post(ADD_MEMBERS_TO_GROUP, token, data);
	return { success: true };
});

export const removeMembersFromGroup = form(removeMembersFromGroupSchema, async (data) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);
	await api.postgrest.post(REMOVE_MEMBERS_FROM_GROUP, token, data);
	return { success: true };
});
