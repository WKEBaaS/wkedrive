import { env } from '$env/dynamic/private';
import type { AuthClient } from '$lib/auth-client';
import { error, fail, type RequestEvent } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import type { ValidationAdapter } from 'sveltekit-superforms/adapters';
import { PostgrestClient } from './postgrest';

class API {
	public auth: AuthClient;
	public postgrest: PostgrestClient;

	constructor(auth: AuthClient, postgrest: PostgrestClient) {
		this.auth = auth;
		this.postgrest = postgrest;
	}

	/** postWithFormValidation
	 *
	 * A helper method to handle form validation and processing for POST requests.
	 * Will try get JWT from the request and attach it to the Postgrest client for authenticated requests.
	 *
	 * @param request - The RequestEvent from the SvelteKit action.
	 * @param adapter - The validation adapter to use for form validation.
	 * @param endpoint - The Postgrest endpoint to interact with.
	 */
	async postWithFormValidation<
		FormOut extends Record<string, unknown>,
		FormIn extends Record<string, unknown> = FormOut,
	>(
		event: RequestEvent,
		adapter: ValidationAdapter<FormOut, FormIn>,
		endpoint: string,
	) {
		const form = await superValidate(event.request, adapter);
		if (!form.valid) {
			return fail(400, { form });
		}
		const { data, error: authError } = await this.auth.token({
			fetchOptions: {
				headers: event.request.headers,
			},
		});
		if (authError) {
			return error(401, 'Failed to retrieve access token');
		}

		return this.postgrest.post(endpoint, data.token, form.data);
	}
}

const authClient = await import('$lib/auth-client').then((mod) => mod.authClient);
const postgrestClient = new PostgrestClient(env.BAAS_API_URL);

export const api = new API(authClient, postgrestClient);
