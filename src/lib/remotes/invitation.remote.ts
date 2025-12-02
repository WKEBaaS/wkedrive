import { form, getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import * as api from '$lib/server';
import { GET_ORGANIZATION_INVITATIONS, INVITE_TO_ORGANIZATION } from '../server/postgrest/endpoints';
import { inviteToOrganizationSchema, type OrganizationInvitation } from '../schemas';

export const getOrganizationInvitations = query(v.string(), async (p_org_class_id) => {
	const event = getRequestEvent();
	const token = await api.auth.fetchToken(event);

	const invitations = await api.postgrest.get<OrganizationInvitation[]>(GET_ORGANIZATION_INVITATIONS, token, {
		p_org_class_id,
	});

	return {
		invitations: invitations.filter((i) => i.type === 'INVITATION'),
		requests: invitations.filter((i) => i.type === 'REQUEST'),
	};
});

export const inviteToOrganization = form(
	inviteToOrganizationSchema,
	async (data) => {
		const event = getRequestEvent();
		const token = await api.auth.fetchToken(event);

		await api.postgrest.post<OrganizationInvitation[]>(INVITE_TO_ORGANIZATION, token, {
			...data,
		});

		getOrganizationInvitations(data.p_org_class_id).refresh();

		return {
			success: true,
		};
	},
);
