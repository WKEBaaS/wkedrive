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

export type CreateOrganizationPayload = v.InferInput<typeof createOrganizationSchema>;
