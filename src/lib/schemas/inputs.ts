import * as v from 'valibot';
import { MEGABYTE } from '$lib/components/ui/file-drop-zone';

export const createOrganizationSchema = v.object({
	p_name: v.pipe(
		v.string(),
		v.minLength(3),
		v.maxLength(50),
	),
	p_description: v.optional(v.pipe(
		v.string(),
		v.maxLength(200),
	)),
});

export const createOrganizationGroupSchema = v.object({
	p_org_class_id: v.string(),
	p_group_name: v.pipe(
		v.string(),
		v.minLength(3),
		v.maxLength(50),
	),
	p_group_description: v.optional(v.pipe(
		v.string(),
		v.maxLength(200),
	)),
	p_init_user_ids: v.optional(v.array(v.pipe(
		v.string(),
		v.uuid(),
	))),
});

export const deleteOrganizationSchema = v.object({
	p_org_class_id: v.string(),
});

export const deleteOrganizationGroupSchema = v.object({
	p_org_class_id: v.string(),
	p_group_id: v.string(),
});

export const addMembersToGroupSchema = v.object({
	p_org_class_id: v.string(),
	p_group_id: v.string(),
	p_user_ids: v.array(v.pipe(
		v.string(),
		v.uuid(),
	)),
});

export const removeMembersFromGroupSchema = v.object({
	p_org_class_id: v.string(),
	p_group_id: v.string(),
	p_user_ids: v.array(v.pipe(
		v.string(),
		v.uuid(),
	)),
});

export const createStorageFolderSchema = v.object({
	p_org_class_id: v.string(),
	p_path: v.string(),
	p_name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	p_description: v.optional(v.string()),
});

export const deleteStorageObjectsSchema = v.object({
	p_org_class_id: v.string(),
	p_path: v.string(),
	p_objects: v.array(v.object({
		name: v.string(),
		type: v.picklist(['file', 'folder']),
	})),
});

export const uploadStorageFileSchema = v.object({
	p_org_class_id: v.string(),
	p_path: v.string(),
	p_name: v.string(),
	p_description: v.optional(v.string()),
	p_file: v.pipe(
		v.file(),
		v.maxSize(10 * MEGABYTE),
	),
});

export const getStorageFileSchema = v.object({
	p_org_class_id: v.string(),
	p_path: v.string(),
	p_name: v.string(),
});

export type CreateOrganizationPayload = v.InferInput<typeof createOrganizationSchema>;
export type CreateOrganizationGroupPayload = v.InferInput<typeof createOrganizationGroupSchema>;
export type DeleteOrganizationPayload = v.InferInput<typeof deleteOrganizationSchema>;
export type DeleteOrganizationGroupPayload = v.InferInput<typeof deleteOrganizationGroupSchema>;
export type AddMembersToGroupPayload = v.InferInput<typeof addMembersToGroupSchema>;
export type RemoveMembersFromGroupPayload = v.InferInput<typeof removeMembersFromGroupSchema>;
export type CreateStorageFolderPayload = v.InferInput<typeof createStorageFolderSchema>;
