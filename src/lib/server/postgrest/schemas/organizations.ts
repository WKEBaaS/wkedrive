import * as v from 'valibot';

export const organizationSchema = v.object({
	class_id: v.string(),
	name: v.string(),
	description: v.nullable(v.string()),
	created_at: v.string(),
	updated_at: v.string(),
});

export type Organization = v.InferInput<typeof organizationSchema>;
