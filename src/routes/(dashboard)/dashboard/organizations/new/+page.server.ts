import { authClient } from '$lib/auth-client';
import { createOrganizationSchema } from '$lib/schemas';
import { api } from '$lib/server';
import { CREATE_ORGANIZATION } from '$lib/server/postgrest/endpoints';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		createOrganizationForm: await superValidate(valibot(createOrganizationSchema)),
	};
};

export const actions = {
	createOrganization: async (event) => {
		if (!event.locals.session) {
			error(401, 'Unauthorized');
		}

		const form = await superValidate(event.request, valibot(createOrganizationSchema));

		if (!form.valid) {
			return fail(401, { form });
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
			await api.postgrest.post(CREATE_ORGANIZATION, data.token, form.data);
		} catch (err) {
			console.error('Error creating organization:', err);
			throw error(500, 'Failed to create organization');
		}

		redirect(301, '/dashboard/organizations');
	},
} satisfies Actions;
