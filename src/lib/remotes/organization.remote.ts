import { form, getRequestEvent } from '$app/server';
import * as api from '$lib/server';
import { CREATE_ORGANIZATION, DELETE_ORGANIZATION } from '$lib/server/postgrest/endpoints';
import { PostgrestClientError } from '@wke-baas/postgrest-client';
import { createOrganizationSchema, deleteOrganizationSchema } from '../schemas';

export const createOrganization = form(createOrganizationSchema, async (data) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);

  try {
    await api.postgrest.post({
      endpoint: CREATE_ORGANIZATION,
      token: token,
      data: data,
    });
  } catch (error) {
    if (error instanceof PostgrestClientError) {
      return {
        success: false,
        message: error.message,
        hint: error.hint,
      };
    }
    throw error;
  }

  return { success: true };
});

export const deleteOrganization = form(deleteOrganizationSchema, async (data) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);
  try {
    await api.postgrest.post({
      endpoint: DELETE_ORGANIZATION,
      token: token,
      data: data,
    });
  } catch (error) {
    if (error instanceof PostgrestClientError) {
      return {
        success: false,
        message: error.message,
        hint: error.hint,
      };
    }
    throw error;
  }

  return { success: true };
});
