import { authClient } from '$lib/auth-client';
import type { Organization, OrganizationMember } from '$lib/schemas';
import { api } from '$lib/server';
import { GET_ORGANIZATION, GET_ORGANIZATION_MEMBERS } from '$lib/server/postgrest/endpoints';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.session) {
		redirect(302, '/');
	}

	const { data, error: authError } = await authClient.token({
		fetchOptions: {
			headers: event.request.headers,
		},
	});
	if (authError) {
		throw error(401, 'Failed to retrieve access token');
	}

	try {
		const org = await api.postgrest.getFirst<Organization>(GET_ORGANIZATION, data.token, {
			p_org_class_id: event.params.org_class_id,
		});
		const members = await api.postgrest.get<OrganizationMember[]>(GET_ORGANIZATION_MEMBERS, data.token, {
			p_org_class_id: event.params.org_class_id,
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
