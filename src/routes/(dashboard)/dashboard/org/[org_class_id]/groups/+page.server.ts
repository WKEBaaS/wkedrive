import { createOrganizationGroupSchema, deleteOrganizationGroupSchema } from '$lib/schemas';
import { api } from '$lib/server';
import { CREATE_ORGANIZATION_GROUP, DELETE_ORGANIZATION_GROUP } from '$lib/server/postgrest/endpoints';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	return {
		createOrganizationGroupForm: await superValidate(valibot(createOrganizationGroupSchema), {
			defaults: {
				p_org_class_id: event.params.org_class_id,
				p_group_name: '',
				p_init_user_ids: [],
			},
		}),
		deleteOrganizationGroupForm: await superValidate(valibot(deleteOrganizationGroupSchema)),
	};
};

export const actions = {
	createOrganizationGroup: async (event) => {
		if (!event.locals.session) {
			return error(401, 'Unauthorized');
		}
		return api.postWithFormValidation(event, valibot(createOrganizationGroupSchema), CREATE_ORGANIZATION_GROUP);
	},
	deleteOrganizationGroup: async (event) => {
		if (!event.locals.session) {
			return error(401, 'Unauthorized');
		}
		return api.postWithFormValidation(event, valibot(deleteOrganizationGroupSchema), DELETE_ORGANIZATION_GROUP);
	},
} satisfies Actions;
