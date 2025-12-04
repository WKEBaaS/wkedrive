import { env } from '$env/dynamic/private';
import { PostgrestClient } from '@youmin1017/postgrest-client';

export const postgrestClient = new PostgrestClient(env.BAAS_API_URL);
