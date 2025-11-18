import { api } from '$lib/server';
import type { StorageObject } from '$src/lib/schemas';
import { GET_STORAGE_OBJECTS } from '$src/lib/server/postgrest/endpoints';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.session) {
		redirect(301, '/');
	}

	const objects = await api.getWithAuth<StorageObject[]>(event, GET_STORAGE_OBJECTS, {
		p_org_class_id: event.params.org_class_id,
		p_path: event.params.path ? `/${event.params.path}` : '/',
	});

	return {
		objects,
	};
};
