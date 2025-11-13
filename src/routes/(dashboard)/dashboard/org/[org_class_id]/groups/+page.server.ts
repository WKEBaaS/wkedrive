import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { createOrganizationGroupSchema } from '$lib/schemas';
import { authClient } from '$lib/auth-client';
import { error, fail } from '@sveltejs/kit';
import { api } from '$lib/server';
import { CREATE_ORGANIZATION_GROUP } from '$lib/server/postgrest/endpoints';

export const load: PageServerLoad = async (event) => {
	return {
		createOrganizationGroupForm: await superValidate(valibot(createOrganizationGroupSchema), {
			defaults: {
				p_org_class_id: event.params.org_class_id,
				p_group_name: '',
			},
		}),
	};
};

export const actions = {
	createOrganizationGroup: async (event) => {
		console.log('Create Organization Group action triggered');
		if (!event.locals.session) {
			return error(401, 'Unauthorized');
		}
		const form = await superValidate(event.request, valibot(createOrganizationGroupSchema));
		if (!form.valid) {
			console.log('Form validation failed:', form.errors);
			return fail(400, { form });
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
			await api.postgrest.post(CREATE_ORGANIZATION_GROUP, data.token, form.data);
		} catch (error) {
			console.error('Error adding members to group:', error);
			return { status: 500, body: { error: 'Failed to add members to group' } };
		}
	},
} satisfies Actions;
