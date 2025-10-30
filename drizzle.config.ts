import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schemaFilter: ['auth', 'dbo', 'auth'],
	schema: './src/lib/db/schemas',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
