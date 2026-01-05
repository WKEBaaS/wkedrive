import { organizationSchema } from '$lib/schemas';
import * as api from '$lib/server';
import { GET_ORGANIZATIONS } from '$lib/server/postgrest/endpoints';
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (!event.locals.session) {
    return redirect(302, '/');
  }

  const token = await api.auth.fetchToken(event);
  const orgs = await api.postgrest.get({
    endpoint: GET_ORGANIZATIONS,
    token: token,
    schema: v.array(organizationSchema),
  });
  return { orgs };
};
