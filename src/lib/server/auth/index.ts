import { authClient } from '$lib/auth-client';
import { error, type RequestEvent } from '@sveltejs/kit';
import { LRUCache } from 'lru-cache';

class AuthClient {
	public auth: typeof authClient;

	private cache: LRUCache<string, string>;

	constructor(auth: typeof authClient) {
		this.auth = auth;

		this.cache = new LRUCache<string, string>({
			max: 1000, // maximum number of items in cache
			ttl: 1000 * 60 * 14, // items expire after 14 minutes
		});
	}

	async fetchToken(event: RequestEvent): Promise<string | null> {
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
}

export const auth = new AuthClient(authClient);
