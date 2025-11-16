import type { Organization } from '$lib/schemas';
import { api } from '$lib/server';
import { GET_ORGANIZATIONS } from '$lib/server/postgrest/endpoints';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.session) {
		return redirect(302, '/');
	}

	const orgs = await api.getWithAuth<Organization[]>(event, GET_ORGANIZATIONS);
	return { orgs };
};
