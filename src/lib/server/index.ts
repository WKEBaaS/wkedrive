import { env } from '$env/dynamic/private';
import { PostgrestClient } from './postgrest';

class API {
	public postgrest: PostgrestClient;

	constructor(postgrest: PostgrestClient) {
		this.postgrest = postgrest;
	}
}

const postgrestClient = new PostgrestClient(env.BAAS_API_URL);

export const api = new API(postgrestClient);
