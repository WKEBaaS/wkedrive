import { organizationGroupMemberSchema } from '$lib/schemas';
import * as api from '$lib/server';
import { GET_ORGANIZATION_GROUP_MEMBERS } from '$lib/server/postgrest/endpoints';
import { toSKError } from '$src/lib/utils';
import { error, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  if (!event.locals.session) {
    redirect(302, '/');
  }

  const parent = await event.parent();
  const group = parent.groups.find((g) => g.id === event.params.group_id);

  if (!group) {
    throw error(404, 'Group not found');
  }

  try {
    const token = await api.auth.fetchToken(event);
    const groupMembers = await api.postgrest.get({
      endpoint: GET_ORGANIZATION_GROUP_MEMBERS,
      token,
      schema: v.array(organizationGroupMemberSchema),
      params: {
        p_org_class_id: event.params.org_class_id,
        p_group_id: event.params.group_id,
      },
    });

    return {
      groupMembers,
      group,
    };
  } catch (err) {
    toSKError(err);
  }
};
