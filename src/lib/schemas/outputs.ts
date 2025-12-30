import * as v from 'valibot';

export const organizationSchema = v.object({
  class_id: v.string(),
  name: v.string(),
  description: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
});

export const organizationMemberSchema = v.object({
  id: v.string(),
  name: v.string(),
  email: v.string(),
  rank: v.nullable(v.number()),
  joined_at: v.pipe(
    v.string(),
    v.isoTimestamp(),
  ),
  role: v.string(),
});

export const organizationGroupMemberSchema = v.omit(organizationMemberSchema, ['role']);

export const organizationGroupSchema = v.object({
  id: v.string(),
  name: v.string(),
  display_name: v.string(),
  description: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
});

export enum StorageObjectType {
  FILE = 'file',
  FOLDER = 'folder',
}

export const storageObjectSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.nullable(v.string()),
  type: v.enum(StorageObjectType),
  size: v.nullable(v.string()),
  path: v.string(),
  etag: v.nullable(v.string()),
  created_at: v.string(),
  updated_at: v.string(),
});

export const organizationInvitationSchema = v.object({
  id: v.string(),
  organization_class_id: v.string(),
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email(),
  ),
  invitee_id: v.nullable(v.string()),
  invitee_name: v.nullable(v.string()),
  inviter_id: v.pipe(v.string(), v.uuid()),
  inviter_name: v.string(),
  type: v.picklist(['INVITATION', 'REQUEST']),
  status: v.picklist(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED']),
  token: v.optional(v.nullable(v.string())),
  created_at: v.string(),
  expired_at: v.string(),
});

export const getUserInvitationsOutput = v.object({
  ...organizationInvitationSchema.entries,
  inviter_email: v.pipe(
    v.string(),
    v.trim(),
    v.email(),
  ),
  organization_name: v.string(),
  organization_description: v.nullable(v.string()),
});

// Models
export type Organization = v.InferInput<typeof organizationSchema>;
export type OrganizationMember = v.InferInput<typeof organizationMemberSchema>;
export type OrganizationGroup = v.InferInput<typeof organizationGroupSchema>;
export type OrganizationInvitation = v.InferInput<typeof organizationInvitationSchema>;
export type OrganizationGroupMember = Omit<v.InferInput<typeof organizationGroupMemberSchema>, 'role'>;
export type StorageObject = v.InferInput<typeof storageObjectSchema>;

// API Outputs
export type GetUserInvitationsOutput = v.InferInput<typeof getUserInvitationsOutput>;
