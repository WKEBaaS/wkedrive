import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schemaFilter: ['auth', 'dbo', 'auth'],
	schema: './drizzle/schema.ts',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
