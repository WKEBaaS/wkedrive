import * as v from 'valibot';

export const createOrganizationSchema = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(3),
		v.maxLength(50),
	),
	description: v.optional(v.pipe(
		v.string(),
		v.maxLength(200),
	)),
});

export const addMembersToGroupSchema = v.object({
	p_org_class_id: v.string(),
	p_group_id: v.string(),
	p_user_ids: v.array(v.pipe(
		v.string(),
		v.uuid(),
	)),
});

export type CreateOrganizationPayload = v.InferInput<typeof createOrganizationSchema>;
export type AddMembersToGroupPayload = v.InferInput<typeof addMembersToGroupSchema>;
