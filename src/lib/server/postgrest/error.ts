import { error } from '@sveltejs/kit';
import * as v from 'valibot';

export const POSTGREST_ERROR_TYPE = 'PGRST_ERROR';

export const postgrestErrorSchema = v.object({
	message: v.string(),
	details: v.nullable(v.string()),
	hint: v.nullable(v.string()),
	code: v.string(),
});

type PostgrestErrorOptions = {
	details: string | null;
	hint: string | null;
	status: number;
} & ErrorOptions;

export class PostgrestError extends Error {
	public details: string | null;
	public hint: string | null;
	public status: number;

	constructor(message: string, { details, hint, status, ...rest }: PostgrestErrorOptions) {
		super(message, rest);
		this.name = 'PostgrestError';
		this.details = details;
		this.hint = hint;
		this.status = status;
	}

	toSvelteKitError() {
		return error(this.status, {
			type: POSTGREST_ERROR_TYPE,
			message: this.message,
			details: this.details,
			hint: this.hint,
			status: this.status,
		});
	}
}
