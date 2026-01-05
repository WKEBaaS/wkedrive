import { organizationGroupSchema } from '$lib/schemas';
import * as api from '$lib/server';
import { GET_ORGANIZATION_GROUPS } from '$lib/server/postgrest/endpoints';
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  if (!event.locals.session) {
    redirect(302, '/');
  }

  try {
    const token = await api.auth.fetchToken(event);
    const groups = await api.postgrest.get({
      endpoint: GET_ORGANIZATION_GROUPS,
      token: token,
      schema: v.array(organizationGroupSchema),
      params: {
        p_org_class_id: event.params.org_class_id,
      },
    });
    return {
      groups,
    };
  } catch (err) {
    console.log('Error fetching organization groups:', err);
    return {
      groups: [],
    };
  }
};
