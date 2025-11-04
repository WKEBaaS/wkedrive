import { authClient } from '$lib/auth-client';
import type { OrganizationMember } from '$lib/schemas';
import { api } from '$lib/server';
import { GET_ORGANIZATION_MEMBERS } from '$lib/server/postgrest/endpoints';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
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
		const members = await api.postgrest.get<OrganizationMember[]>(GET_ORGANIZATION_MEMBERS, data.token, {
			org_class_id: event.params.id,
		});
		return {
			members,
		};
	} catch (err) {
		console.error('Error fetching organization membership:', err);
		throw error(500, 'Failed to fetch organization membership');
	}
};
