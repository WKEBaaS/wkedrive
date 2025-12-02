import { command, form, getRequestEvent, query } from '$app/server';
import * as api from '$lib/server';
import * as v from 'valibot';
import {
	type GetUserInvitationsOutput,
	getUserInvitationsOutput,
	inviteToOrganizationSchema,
	type OrganizationInvitation,
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

		const body: Record<string, string> = {};
		body['p_org_class_id'] = data.org_class_id;
		if (data.status) {
			body['status'] = 'eq.' + data.status;
		}
		if (data.type) {
			body['type'] = 'eq.' + data.type;
		}

		const invitations = await api.postgrest.get<OrganizationInvitation[]>(GET_ORGANIZATION_INVITATIONS, token, body);

		return invitations;
	},
);

export const getUserInvitations = query(v.pick(getUserInvitationsOutput, ['status']), async ({ status }) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);

	const invitations = await api.postgrest.get<GetUserInvitationsOutput[]>(GET_USER_INVITATIONS, token, {
		type: 'eq.INVITATION',
		status: 'eq.' + status,
	});

	return invitations;
});

export const inviteToOrganization = form(
	inviteToOrganizationSchema,
	async (data) => {
		const event = getRequestEvent();
		const token = await api.auth.fetchToken(event);

		await api.postgrest.post<OrganizationInvitation[]>(INVITE_TO_ORGANIZATION, token, {
			...data,
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

	await api.postgrest.post<void>(UPDATE_INVITATION_STATUS, token, data);

	getUserInvitations({ status: 'PENDING' }).refresh();

	return { success: true };
});
