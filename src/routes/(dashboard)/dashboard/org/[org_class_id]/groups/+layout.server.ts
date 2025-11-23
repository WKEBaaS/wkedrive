import type { OrganizationGroup } from '$lib/schemas';
import * as api from '$lib/server';
import { GET_ORGANIZATION_GROUPS } from '$lib/server/postgrest/endpoints';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.session) {
		redirect(302, '/');
	}

	const token = await api.auth.fetchToken(event);

	const groups = await api.postgrest.get<OrganizationGroup[]>(GET_ORGANIZATION_GROUPS, token, {
		p_org_class_id: event.params.org_class_id,
	});
	return {
		groups,
	};
};
