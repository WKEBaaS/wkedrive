import { command, form, getRequestEvent, query } from '$app/server';
import * as api from '$lib/server';
import * as v from 'valibot';
import {
	getUserInvitationsOutput,
	inviteToOrganizationSchema,
	organizationInvitationSchema,
	updateInvitationStatusSchema,
} from '../schemas';
import {
	GET_ORGANIZATION_INVITATIONS,
	GET_USER_INVITATIONS,
	INVITE_TO_ORGANIZATION,
	UPDATE_INVITATION_STATUS,
} from '../server/postgrest/endpoints';

const getOrgInvitationInput = v.object({
	org_class_id: organizationInvitationSchema.entries.organization_class_id,
	status: v.optional(organizationInvitationSchema.entries.status),
	type: v.optional(organizationInvitationSchema.entries.type),
});

export const getOrganizationInvitations = query(
	getOrgInvitationInput,
	async (data) => {
		const event = getRequestEvent();
		const token = await api.auth.fetchToken(event);

		// const invitations = await api.postgrest.get<OrganizationInvitation[]>(GET_ORGANIZATION_INVITATIONS, token, body);
		const invitations = await api.postgrest.get({
			endpoint: GET_ORGANIZATION_INVITATIONS,
			token: token,
			schema: v.array(organizationInvitationSchema),
			params: {
				p_org_class_id: data.org_class_id,
				status: data.status ? 'eq.' + data.status : undefined,
				type: data.type ? 'eq.' + data.type : undefined,
			},
		});

		return invitations;
	},
);

export const getUserInvitations = query(v.pick(getUserInvitationsOutput, ['status']), async ({ status }) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);

	const invitations = await api.postgrest.get({
		endpoint: GET_USER_INVITATIONS,
		token: token,
		schema: v.array(getUserInvitationsOutput),
		params: {
			type: 'eq.INVITATION',
			status: 'eq.' + status,
		},
	});

	return invitations;
});

export const inviteToOrganization = form(
	inviteToOrganizationSchema,
	async (data) => {
		const event = getRequestEvent();
		const token = await api.auth.fetchToken(event);

		await api.postgrest.post({
			endpoint: INVITE_TO_ORGANIZATION,
			token: token,
			data: data,
		});

		getOrganizationInvitations({ org_class_id: data.p_org_class_id }).refresh();

		return {
			success: true,
		};
	},
);

export const updateInvitationStatus = command(updateInvitationStatusSchema, async (data) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);

	await api.postgrest.post({
		endpoint: UPDATE_INVITATION_STATUS,
		token: token,
		data: data,
	});

	getUserInvitations({ status: 'PENDING' }).refresh();

	return { success: true };
});
