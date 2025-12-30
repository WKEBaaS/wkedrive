import { env } from '$env/dynamic/private';
import { createPostgrestClient } from '@wke-baas/postgrest-client';

export const postgrestClient = createPostgrestClient(env.BAAS_API_URL);
