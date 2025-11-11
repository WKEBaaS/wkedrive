import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { valibot } from 'sveltekit-superforms/adapters';
import { addMembersToGroupSchema } from '$lib/schemas';

export const load: PageServerLoad = async (event) => {
	return {
		addMembersToGroupForm: await superValidate(valibot(addMembersToGroupSchema), {
			defaults: {
				p_org_class_id: event.params.org_class_id,
				p_group_id: event.params.group_id,
				p_user_ids: [],
			},
		}),
	};
};
