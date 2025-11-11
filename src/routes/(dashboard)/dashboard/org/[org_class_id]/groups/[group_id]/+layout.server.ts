import { authClient } from '$lib/auth-client';
import type { OrganizationGroupMember } from '$lib/schemas';
import { api } from '$lib/server';
import { GET_ORGANIZATION_GROUP_MEMBERS } from '$lib/server/postgrest/endpoints';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.session) {
		redirect(302, '/');
	}

	const { data, error: authError } = await authClient.token({
		fetchOptions: {
			headers: event.request.headers,
		},
	});
	if (authError) {
		throw error(401, 'Failed to retrieve access token');
	}

	try {
		const parent = await event.parent();
		const group = parent.groups.find((g) => g.id === event.params.group_id);

		if (!group) {
			throw error(404, 'Group not found');
		}

		const groupMembers = await api.postgrest.get<OrganizationGroupMember[]>(
			GET_ORGANIZATION_GROUP_MEMBERS,
			data.token,
			{
				p_org_class_id: event.params.org_class_id,
				p_group_id: event.params.group_id,
			},
		);

		return {
			groupMembers,
			group,
		};
	} catch (err) {
		console.error('Error fetching organization membership:', err);
		throw error(500, 'Failed to fetch organization membership');
	}
};
