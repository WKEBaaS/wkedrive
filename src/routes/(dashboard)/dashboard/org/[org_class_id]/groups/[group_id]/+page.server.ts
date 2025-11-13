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
		const form = await superValidate(event.request, valibot(addMembersToGroupSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { data, error: authError } = await authClient.token({
			fetchOptions: {
				headers: event.request.headers,
			},
		});
		if (authError) {
			return error(401, 'Failed to retrieve access token');
		}

		try {
			await api.postgrest.post(ADD_MEMBERS_TO_GROUP, data.token, form.data);
		} catch (err) {
			console.error('Error adding members to group:', err);
			return error(500, 'Failed to add members to group');
		}
	},
	removeMembersFromGroup: async (event) => {
		if (!event.locals.session) {
			return error(401, 'Unauthorized');
		}
		const form = await superValidate(event.request, valibot(removeMembersFromGroupSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { data, error: authError } = await authClient.token({
			fetchOptions: {
				headers: event.request.headers,
			},
		});
		if (authError) {
			return error(401, 'Failed to retrieve access token');
		}

		try {
			await api.postgrest.post(REMOVE_MEMBERS_FROM_GROUP, data.token, form.data);
		} catch (err) {
			console.error('Error removing members from group:', err);
			return error(500, 'Failed to remove members from group');
		}
	},
} satisfies Actions;
