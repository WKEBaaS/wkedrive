import type { StorageObject } from '$src/lib/schemas';
import * as api from '$src/lib/server';
import { GET_STORAGE_OBJECTS } from '$src/lib/server/postgrest/endpoints';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const token = await api.auth.fetchToken(event)
	const objects = await api.postgrest.get<StorageObject[]>(GET_STORAGE_OBJECTS, token, {
		p_org_class_id: event.params.org_class_id,
		p_path: event.params.path ? `/${event.params.path}` : '/',
	});

	return {
		objects,
	};
};
