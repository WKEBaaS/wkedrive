import { type OrganizationMember, organizationMemberSchema, organizationSchema } from '$lib/schemas';
import * as api from '$lib/server';
import { GET_ORGANIZATION, GET_ORGANIZATION_MEMBERS } from '$lib/server/postgrest/endpoints';
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.session) {
		redirect(302, '/');
	}

	const token = await api.auth.fetchToken(event);

	try {
		const org = await api.postgrest.getFirst({
			endpoint: GET_ORGANIZATION,
			token: token,
			schema: organizationSchema,
			params: {
				p_org_class_id: event.params.org_class_id,
			},
		});
		const members = await api.postgrest.get<OrganizationMember[]>({
			endpoint: GET_ORGANIZATION_MEMBERS,
			token: token,
			schema: v.array(organizationMemberSchema),
			params: {
				p_org_class_id: event.params.org_class_id,
			},
		});

		return {
			org,
			members,
		};
	} catch (err) {
		console.error('Error verifying organization membership:', err);
		throw error(500, 'Failed to verify organization membership');
	}
};
