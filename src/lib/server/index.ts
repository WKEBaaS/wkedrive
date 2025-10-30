import { PostgrestClient } from './postgrest';
import { env } from '$env/dynamic/private';
import type { Organization } from './postgrest/schemas/organizations';

class API {
	private postgrestClient: PostgrestClient;

	constructor(postgrestClient: PostgrestClient) {
		this.postgrestClient = postgrestClient;
	}

	async getOrganizations(jwt: string) {
		return this.postgrestClient.get<Organization[]>('/api/rest/rpc/get_organizations', jwt);
	}
}

const postgrestClient = new PostgrestClient(env.BAAS_API_URL);

export const api = new API(postgrestClient);
