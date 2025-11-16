import { env } from '$env/dynamic/private';
import type { AuthClient } from '$lib/auth-client';
import { error, fail, type RequestEvent } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import type { ValidationAdapter } from 'sveltekit-superforms/adapters';
import { PostgrestClient } from './postgrest';
import { LRUCache } from 'lru-cache';

class API {
	public auth: AuthClient;
	public postgrest: PostgrestClient;

	private cache: LRUCache<string, string>;

	constructor(auth: AuthClient, postgrest: PostgrestClient) {
		this.auth = auth;
		this.postgrest = postgrest;

		this.cache = new LRUCache<string, string>({
			max: 1000, // maximum number of items in cache
			ttl: 1000 * 60 * 14, // items expire after 14 minutes
		});
	}

	private async fetchToken(event: RequestEvent): Promise<string | null> {
		if (!event.locals.session) {
			return null;
		}

		const cachedToken = this.cache.get(event.locals.session.userId);
		if (cachedToken) {
			return cachedToken;
		}

		const { data, error: tokenErr } = await this.auth.token({
			fetchOptions: {
				headers: event.request.headers,
			},
		});
		if (tokenErr) {
			console.error('Error fetching access token:', tokenErr);
			throw error(401, 'Failed to retrieve access token');
		}
		this.cache.set(event.locals.session.userId, data.token);
		return data.token;
	}

	/** getWithAuth
	 *
	 * A helper method to handle authenticated GET requests.
	 * Will try get JWT from the request and attach it to the Postgrest client for authenticated requests.
	 *
	 * @param event - The RequestEvent from the SvelteKit load function.
	 * @param endpoint - The Postgrest endpoint to interact with.
	 * @param params - Optional query parameters for the GET request.
	 */
	async getWithAuth<T>(event: RequestEvent, endpoint: string, params?: Record<string, string>): Promise<T> {
		const token = await this.fetchToken(event);
		return this.postgrest.get<T>(endpoint, token, params);
	}

	/** getFirstWithAuth
	 *
	 * A helper method to handle authenticated GET requests that only fetch the first record.
	 * Will try get JWT from the request and attach it to the Postgrest client for authenticated requests.
	 *
	 * @param event - The RequestEvent from the SvelteKit load function.
	 * @param endpoint - The Postgrest endpoint to interact with.
	 * @param params - Optional query parameters for the GET request.
	 */
	async getFirstWithAuth<T>(event: RequestEvent, endpoint: string, params?: Record<string, string>): Promise<T> {
		const token = await this.fetchToken(event);
		return this.postgrest.getFirst<T>(endpoint, token, params);
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

		const token = await this.fetchToken(event);

		return this.postgrest.post(endpoint, token, form.data);
	}
}

const authClient = await import('$lib/auth-client').then((mod) => mod.authClient);
const postgrestClient = new PostgrestClient(env.BAAS_API_URL);

export const api = new API(authClient, postgrestClient);
