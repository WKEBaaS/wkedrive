import { createAuthClient } from 'better-auth/svelte';
import { jwtClient } from 'better-auth/client/plugins';
import { env } from '$env/dynamic/public';

export const authClient = createAuthClient({
	baseURL: env.PUBLIC_AUTH_API_URL,
	credentials: 'include',
	plugins: [jwtClient()],
});
