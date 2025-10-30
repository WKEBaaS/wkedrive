import { env } from '$env/dynamic/private';
import { createPostgrestClient } from './server/postgrest';

if (!env.BAAS_API_URL) {
	throw new Error('BAAS_API_URL is not defined in environment variables');
}

export const postgrestClient = createPostgrestClient(env.BAAS_API_URL);
