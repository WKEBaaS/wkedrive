import type { OrganizationGroup } from '$lib/schemas';
import { api } from '$lib/server';
import { GET_ORGANIZATION_GROUPS } from '$lib/server/postgrest/endpoints';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.session) {
		redirect(302, '/');
	}

	const groups = await api.getWithAuth<OrganizationGroup[]>(event, GET_ORGANIZATION_GROUPS, {
		p_org_class_id: event.params.org_class_id,
	});
	return {
		groups,
	};
};
