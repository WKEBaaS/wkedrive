import { form, getRequestEvent } from '$app/server';
import {
  addMembersToGroupSchema,
  createOrganizationGroupSchema,
  deleteOrganizationGroupSchema,
  removeMembersFromGroupSchema,
} from '$lib/schemas';
import * as api from '$lib/server';
import { errorToObject } from '$lib/utils';
import {
  ADD_MEMBERS_TO_GROUP,
  CREATE_ORGANIZATION_GROUP,
  DELETE_ORGANIZATION_GROUP,
  REMOVE_MEMBERS_FROM_GROUP,
} from '../server/postgrest/endpoints';
import type { APIResponse } from './types';

export const createOrgGroup = form(createOrganizationGroupSchema, async (data) => {
  const event = getRequestEvent();

  try {
    const token = await api.auth.fetchToken(event);
    await api.postgrest.post({
      endpoint: CREATE_ORGANIZATION_GROUP,
      token: token,
      data: data,
    });
  } catch (err) {
    return errorToObject(err);
  }

  return { success: true } as APIResponse;
});

export const deleteOrgGroup = form(deleteOrganizationGroupSchema, async (data) => {
  const event = getRequestEvent();

  try {
    const token = await api.auth.fetchToken(event);
    await api.postgrest.post({
      endpoint: DELETE_ORGANIZATION_GROUP,
      token: token,
      data: data,
    });
  } catch (err) {
    return errorToObject(err);
  }

  return { success: true } as APIResponse;
});

export const addMembersToGroup = form(addMembersToGroupSchema, async (data) => {
  const event = getRequestEvent();

  try {
    const token = await api.auth.fetchToken(event);
    await api.postgrest.post({
      endpoint: ADD_MEMBERS_TO_GROUP,
      token: token,
      data: data,
    });
  } catch (err) {
    return errorToObject(err);
  }

  return { success: true } as APIResponse;
});

export const removeMembersFromGroup = form(removeMembersFromGroupSchema, async (data) => {
  const event = getRequestEvent();

  try {
    const token = await api.auth.fetchToken(event);
    await api.postgrest.post({
      endpoint: REMOVE_MEMBERS_FROM_GROUP,
      token: token,
      data: data,
    });
  } catch (err) {
    return errorToObject(err);
  }

  return { success: true } as APIResponse;
});
