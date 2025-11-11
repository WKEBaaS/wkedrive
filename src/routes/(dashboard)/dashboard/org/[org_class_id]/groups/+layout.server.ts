import { authClient } from '$lib/auth-client';
import type { OrganizationGroup } from '$lib/schemas';
import { api } from '$lib/server';
import { GET_ORGANIZATION_GROUPS } from '$lib/server/postgrest/endpoints';
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
		const groups = await api.postgrest.get<OrganizationGroup[]>(GET_ORGANIZATION_GROUPS, data.token, {
			p_org_class_id: event.params.org_class_id,
		});
		console.log('Fetched groups:', groups);
		return {
			groups,
		};
	} catch (err) {
		console.error('Error fetching organization membership:', err);
		throw error(500, 'Failed to fetch organization membership');
	}
};
