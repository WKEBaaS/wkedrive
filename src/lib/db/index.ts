import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(env.DATABASE_URL);
