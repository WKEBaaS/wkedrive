import { authClient } from '$lib/auth-client';
import { api } from '$lib/server';
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

	const orgs = await api.getOrganizations(data.token);
	console.log('Fetched organizations:', orgs);
	return { orgs };
};
