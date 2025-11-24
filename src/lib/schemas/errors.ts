import * as v from 'valibot';

export const appErrorSchema = v.object({
	message: v.string(),
	details: v.optional(v.nullable(v.string())),
	hint: v.optional(v.nullable(v.string())),
	status: v.optional(v.number()),
	type: v.optional(v.string()),
});
