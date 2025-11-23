import type { Organization } from '$lib/schemas';
import * as api from '$lib/server';
import { GET_ORGANIZATIONS } from '$lib/server/postgrest/endpoints';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.session) {
		return redirect(302, '/');
	}

	const token = await api.auth.fetchToken(event);
	const orgs = await api.postgrest.get<Organization[]>(GET_ORGANIZATIONS, token);
	return { orgs };
};
