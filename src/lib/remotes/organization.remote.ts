import { form, getRequestEvent } from '$app/server';
import * as api from '$lib/server';
import { CREATE_ORGANIZATION, DELETE_ORGANIZATION } from '$lib/server/postgrest/endpoints';
import { errorToObject } from '$lib/utils';
import { createOrganizationSchema, deleteOrganizationSchema } from '../schemas';
import type { APIResponse } from './types';

export const createOrganization = form(createOrganizationSchema, async (data) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);

  try {
    await api.postgrest.post({
      endpoint: CREATE_ORGANIZATION,
      token: token,
      data: data,
    });
  } catch (err) {
    return errorToObject(err);
  }

  return { success: true } as APIResponse;
});

export const deleteOrganization = form(deleteOrganizationSchema, async (data) => {
  const event = getRequestEvent();

  try {
    const token = await api.auth.fetchToken(event);
    await api.postgrest.post({
      endpoint: DELETE_ORGANIZATION,
      token: token,
      data: data,
    });
  } catch (err) {
    return errorToObject(err);
  }

  return { success: true } as APIResponse;
});
