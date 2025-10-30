import { organizationSchema } from '../schemas/organizations';
import type { Organization } from '../schemas/organizations';
import * as v from 'valibot';

export const getOrganizations = async (baseURL: string | URL, jwt: string): Promise<Organization[]> => {
	const getOrgsURL = new URL('/api/rest/rpc/get_organizations', baseURL.toString());
	const resp = await fetch(getOrgsURL.toString(), {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${jwt}`,
			'Content-Type': 'application/json',
		},
	});
	if (!resp.ok) {
		throw new Error(`Failed to fetch organizations: ${resp.statusText}`);
	}
	const data = await resp.json();
	const parsed = await v.parseAsync(v.array(organizationSchema), data);

	return parsed;
};
