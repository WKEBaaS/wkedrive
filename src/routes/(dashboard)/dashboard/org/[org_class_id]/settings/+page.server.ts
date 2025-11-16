import { deleteOrganizationSchema } from '$lib/schemas';
import { api } from '$lib/server';
import { DELETE_ORGANIZATION } from '$lib/server/postgrest/endpoints';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		deleteOrganizationForm: await superValidate(valibot(deleteOrganizationSchema)),
	};
};

export const actions = {
	deleteOrganization: async (event) => {
		if (!event.locals.session) {
			return error(401, 'Unauthorized');
		}

		await api.postWithFormValidation(event, valibot(deleteOrganizationSchema), DELETE_ORGANIZATION);
	},
} satisfies Actions;
