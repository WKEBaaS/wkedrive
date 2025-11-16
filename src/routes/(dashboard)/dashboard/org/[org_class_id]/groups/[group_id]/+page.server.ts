import { authClient } from '$lib/auth-client';
import { addMembersToGroupSchema, removeMembersFromGroupSchema } from '$lib/schemas';
import { api } from '$lib/server';
import { ADD_MEMBERS_TO_GROUP, REMOVE_MEMBERS_FROM_GROUP } from '$lib/server/postgrest/endpoints';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	return {
		addMembersToGroupForm: await superValidate(valibot(addMembersToGroupSchema), {
			defaults: {
				p_org_class_id: event.params.org_class_id,
				p_group_id: event.params.group_id,
				p_user_ids: [],
			},
		}),
		removeMembersFromGroupForm: await superValidate(valibot(removeMembersFromGroupSchema), {
			defaults: {
				p_org_class_id: event.params.org_class_id,
				p_group_id: event.params.group_id,
				p_user_ids: [],
			},
		}),
	};
};

export const actions = {
	addMembersToGroup: async (event) => {
		if (!event.locals.session) {
			return error(401, 'Unauthorized');
		}
		return api.postWithFormValidation(event, valibot(addMembersToGroupSchema), ADD_MEMBERS_TO_GROUP);
	},
	removeMembersFromGroup: async (event) => {
		if (!event.locals.session) {
			return error(401, 'Unauthorized');
		}
		return api.postWithFormValidation(event, valibot(removeMembersFromGroupSchema), REMOVE_MEMBERS_FROM_GROUP);
	},
} satisfies Actions;
