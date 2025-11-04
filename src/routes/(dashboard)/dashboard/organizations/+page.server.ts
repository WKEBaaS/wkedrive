import { authClient } from '$lib/auth-client';
import { api } from '$lib/server';
import { GET_ORGANIZATIONS } from '$lib/server/postgrest/endpoints';
import type { Organization } from '$lib/schemas';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.session) {
		return redirect(302, '/');
	}

	const { data, error } = await authClient.token({
		fetchOptions: {
			headers: event.request.headers,
		},
	});
	if (error) {
		throw new Error('Failed to retrieve access token', { cause: error });
	}

	const orgs = await api.postgrest.get<Organization[]>(GET_ORGANIZATIONS, data.token);
	return { orgs };
};
