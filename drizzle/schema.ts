import { pgTable, type AnyPgColumn, pgSchema, foreignKey, unique, check, uuid, varchar, boolean, timestamp, text, index, integer, smallint, bigint, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const auth = pgSchema("auth");
export const dbo = pgSchema("dbo");


export const usersInAuth = auth.table("users", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	role: varchar({ length: 100 }).default('authenticated'),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	image: text(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [objectsInDbo.id],
			name: "fk_auth_users_id"
		}),
	unique("uq_auth_user_email").on(table.email),
	check("users_id_not_null", sql`NOT NULL id`),
	check("users_name_not_null", sql`NOT NULL name`),
	check("users_email_not_null", sql`NOT NULL email`),
	check("users_email_verified_not_null", sql`NOT NULL email_verified`),
	check("users_created_at_not_null", sql`NOT NULL created_at`),
	check("users_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const sessionsInAuth = auth.table("sessions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("session_not_after_idx").using("btree", table.expiresAt.desc().nullsFirst().op("timestamptz_ops")),
	index("session_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("user_id_created_at_idx").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "fk_auth_sessions_user_id"
		}).onDelete("cascade"),
	check("sessions_id_not_null", sql`NOT NULL id`),
	check("sessions_user_id_not_null", sql`NOT NULL user_id`),
	check("sessions_token_not_null", sql`NOT NULL token`),
	check("sessions_expires_at_not_null", sql`NOT NULL expires_at`),
	check("sessions_created_at_not_null", sql`NOT NULL created_at`),
	check("sessions_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const accountsInAuth = auth.table("accounts", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: 'string' }),
	scope: text(),
	idToken: text("id_token"),
	password: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "fk_auth_accounts_user_id"
		}).onDelete("cascade"),
	check("accounts_id_not_null", sql`NOT NULL id`),
	check("accounts_user_id_not_null", sql`NOT NULL user_id`),
	check("accounts_account_id_not_null", sql`NOT NULL account_id`),
	check("accounts_provider_id_not_null", sql`NOT NULL provider_id`),
	check("accounts_created_at_not_null", sql`NOT NULL created_at`),
	check("accounts_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const verificationsInAuth = auth.table("verifications", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	check("verifications_id_not_null", sql`NOT NULL id`),
	check("verifications_identifier_not_null", sql`NOT NULL identifier`),
	check("verifications_value_not_null", sql`NOT NULL value`),
	check("verifications_expires_at_not_null", sql`NOT NULL expires_at`),
	check("verifications_created_at_not_null", sql`NOT NULL created_at`),
	check("verifications_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const jwksInAuth = auth.table("jwks", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	publicKey: text("public_key").notNull(),
	privateKey: text("private_key").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	check("jwks_id_not_null", sql`NOT NULL id`),
	check("jwks_public_key_not_null", sql`NOT NULL public_key`),
	check("jwks_private_key_not_null", sql`NOT NULL private_key`),
	check("jwks_created_at_not_null", sql`NOT NULL created_at`),
]);

export const ssoProvidersInAuth = auth.table("sso_providers", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	issuer: varchar().notNull(),
	domain: varchar().notNull(),
	oidcConfig: text("oidc_config"),
	samlConfig: text("saml_config"),
	userId: varchar("user_id").notNull(),
	providerId: varchar("provider_id").notNull(),
	organizationId: varchar("organization_id"),
}, (table) => [
	check("sso_providers_id_not_null", sql`NOT NULL id`),
	check("sso_providers_issuer_not_null", sql`NOT NULL issuer`),
	check("sso_providers_domain_not_null", sql`NOT NULL domain`),
	check("sso_providers_user_id_not_null", sql`NOT NULL user_id`),
	check("sso_providers_provider_id_not_null", sql`NOT NULL provider_id`),
]);

export const groupsInAuth = auth.table("groups", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	isEnabled: boolean("is_enabled").default(true),
}, (table) => [
	check("groups_id_not_null", sql`NOT NULL id`),
	check("groups_name_not_null", sql`NOT NULL name`),
	check("groups_created_at_not_null", sql`NOT NULL created_at`),
	check("groups_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const objectsInDbo = dbo.table("objects", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	entityId: integer("entity_id"),
	chineseName: varchar("chinese_name", { length: 512 }),
	chineseDescription: varchar("chinese_description", { length: 4000 }),
	englishName: varchar("english_name", { length: 512 }),
	englishDescription: varchar("english_description", { length: 4000 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	ownerId: uuid("owner_id"),
	clickCount: integer("click_count").default(0).notNull(),
	outlinkCount: integer("outlink_count"),
	inlinkCount: integer("inlink_count"),
	isHidden: boolean("is_hidden").default(false).notNull(),
}, (table) => [
	index("idx_object_chinese_name").using("btree", table.chineseName.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [usersInAuth.id],
			name: "fk_dbo_objects_owner_id"
		}),
	check("objects_id_not_null", sql`NOT NULL id`),
	check("objects_created_at_not_null", sql`NOT NULL created_at`),
	check("objects_updated_at_not_null", sql`NOT NULL updated_at`),
	check("objects_click_count_not_null", sql`NOT NULL click_count`),
	check("objects_is_hidden_not_null", sql`NOT NULL is_hidden`),
]);

export const entitiesInDbo = dbo.table("entities", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "dbo.entities_id_seq", startWith: 100, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	chineseName: varchar("chinese_name", { length: 50 }),
	englishName: varchar("english_name", { length: 50 }),
	isRelational: boolean("is_relational").default(false).notNull(),
	isHideable: boolean("is_hideable").default(false).notNull(),
	isDeletable: boolean("is_deletable").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	check("entities_id_not_null", sql`NOT NULL id`),
	check("entities_is_relational_not_null", sql`NOT NULL is_relational`),
	check("entities_is_hideable_not_null", sql`NOT NULL is_hideable`),
	check("entities_is_deletable_not_null", sql`NOT NULL is_deletable`),
	check("entities_created_at_not_null", sql`NOT NULL created_at`),
	check("entities_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const classesInDbo = dbo.table("classes", {
	id: varchar({ length: 21 }).default(nanoid()).primaryKey().notNull(),
	entityId: integer("entity_id"),
	chineseName: varchar("chinese_name", { length: 256 }),
	chineseDescription: varchar("chinese_description", { length: 4000 }),
	englishName: varchar("english_name", { length: 256 }),
	englishDescription: varchar("english_description", { length: 4000 }),
	idPath: varchar("id_path", { length: 2300 }).notNull(),
	namePath: varchar("name_path", { length: 2300 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	objectCount: integer("object_count").default(0).notNull(),
	classRank: smallint("class_rank").default(0).notNull(),
	objectRank: smallint("object_rank").default(0).notNull(),
	hierarchyLevel: smallint("hierarchy_level").notNull(),
	clickCount: integer("click_count").default(0).notNull(),
	keywords: text().array().default([""]).notNull(),
	ownerId: uuid("owner_id"),
	isHidden: boolean("is_hidden").default(false).notNull(),
	isChild: boolean("is_child").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.entityId],
			foreignColumns: [entitiesInDbo.id],
			name: "fk_dbo_class_entities"
		}),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [usersInAuth.id],
			name: "fk_dbo_class_owner_id"
		}),
	unique("qu_dbo_class_id_path").on(table.idPath),
	unique("qu_dbo_class_name_path").on(table.namePath),
	check("classes_id_not_null", sql`NOT NULL id`),
	check("classes_id_path_not_null", sql`NOT NULL id_path`),
	check("classes_name_path_not_null", sql`NOT NULL name_path`),
	check("classes_created_at_not_null", sql`NOT NULL created_at`),
	check("classes_updated_at_not_null", sql`NOT NULL updated_at`),
	check("classes_object_count_not_null", sql`NOT NULL object_count`),
	check("classes_class_rank_not_null", sql`NOT NULL class_rank`),
	check("classes_object_rank_not_null", sql`NOT NULL object_rank`),
	check("classes_hierarchy_level_not_null", sql`NOT NULL hierarchy_level`),
	check("classes_click_count_not_null", sql`NOT NULL click_count`),
	check("classes_keywords_not_null", sql`NOT NULL keywords`),
	check("classes_is_hidden_not_null", sql`NOT NULL is_hidden`),
	check("classes_is_child_not_null", sql`NOT NULL is_child`),
]);

export const filesInDbo = dbo.table("files", {
	id: uuid().primaryKey().notNull(),
	mimeType: varchar("mime_type", { length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	size: bigint({ mode: "number" }).default(0).notNull(),
	hash: varchar({ length: 128 }),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [objectsInDbo.id],
			name: "fk_dbo_files_id"
		}).onDelete("cascade"),
	check("files_id_not_null", sql`NOT NULL id`),
	check("files_size_not_null", sql`NOT NULL size`),
]);

export const permissionEnumInDbo = dbo.table("permission_enum", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	name: text(),
	bit: smallint().notNull(),
}, (table) => [
	unique("uq_permission_enum_name").on(table.name),
	unique("uq_permission_enum_bit").on(table.bit),
	check("permission_enum_id_not_null", sql`NOT NULL id`),
	check("permission_enum_bit_not_null", sql`NOT NULL "bit"`),
]);

export const permissionsInDbo = dbo.table("permissions", {
	classId: varchar("class_id", { length: 21 }).notNull(),
	roleType: boolean("role_type").notNull(),
	roleId: uuid("role_id").notNull(),
	permissionBits: smallint("permission_bits").default(1).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classesInDbo.id],
			name: "fk_dbo_permissions_class_id"
		}).onDelete("cascade"),
	unique("uq_dbo_permissions").on(table.roleType, table.roleId, table.classId),
	check("permissions_class_id_not_null", sql`NOT NULL class_id`),
	check("permissions_role_type_not_null", sql`NOT NULL role_type`),
	check("permissions_role_id_not_null", sql`NOT NULL role_id`),
	check("permissions_permission_bits_not_null", sql`NOT NULL permission_bits`),
]);

export const organizationInvitationsInDbo = dbo.table("organization_invitations", {
	id: uuid().primaryKey().notNull(),
	organizationClassId: varchar("organization_class_id", { length: 21 }),
	inviteeId: uuid("invitee_id"),
	email: varchar({ length: 255 }),
	inviterId: uuid("inviter_id"),
	// TODO: failed to parse database type 'invitation_type'
	type: unknown("type").notNull(),
	// TODO: failed to parse database type 'invitation_status'
	status: unknown("status").notNull(),
	token: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	expiredAt: timestamp("expired_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationClassId],
			foreignColumns: [classesInDbo.id],
			name: "fk_dbo_organization_invitations_class_id"
		}),
	foreignKey({
			columns: [table.inviteeId],
			foreignColumns: [usersInAuth.id],
			name: "fk_dbo_organization_invitations_invitee"
		}),
	foreignKey({
			columns: [table.inviterId],
			foreignColumns: [usersInAuth.id],
			name: "fk_dbo_organization_invitations_inviter"
		}),
	check("organization_invitations_id_not_null", sql`NOT NULL id`),
	check("organization_invitations_type_not_null", sql`NOT NULL type`),
	check("organization_invitations_status_not_null", sql`NOT NULL status`),
	check("organization_invitations_created_at_not_null", sql`NOT NULL created_at`),
	check("organization_invitations_expired_at_not_null", sql`NOT NULL expired_at`),
]);

export const userGroupsInAuth = auth.table("user_groups", {
	userId: uuid("user_id").notNull(),
	groupId: uuid("group_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "fk_auth_user_group_user_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [groupsInAuth.id],
			name: "fk_auth_user_group_role_id"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.groupId], name: "pk_auth_user_group"}),
	check("user_groups_user_id_not_null", sql`NOT NULL user_id`),
	check("user_groups_group_id_not_null", sql`NOT NULL group_id`),
]);

export const inheritancesInDbo = dbo.table("inheritances", {
	pcid: varchar({ length: 21 }).notNull(),
	ccid: varchar({ length: 21 }).notNull(),
	rank: smallint(),
	membershipGrade: integer("membership_grade"),
}, (table) => [
	foreignKey({
			columns: [table.pcid],
			foreignColumns: [classesInDbo.id],
			name: "fk_dbo_inheritance_pcid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ccid],
			foreignColumns: [classesInDbo.id],
			name: "fk_dbo_inheritance_ccid"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.pcid, table.ccid], name: "pk_dbo_inheritance"}),
	check("inheritances_pcid_not_null", sql`NOT NULL pcid`),
	check("inheritances_ccid_not_null", sql`NOT NULL ccid`),
]);

export const objectRelationsInDbo = dbo.table("object_relations", {
	oid1: uuid().notNull(),
	oid2: uuid().notNull(),
	rank: integer(),
	description: varchar({ length: 1000 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.oid1],
			foreignColumns: [objectsInDbo.id],
			name: "fk_dbo_object_relation_oid1"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.oid2],
			foreignColumns: [objectsInDbo.id],
			name: "fk_dbo_object_relation_oid2"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.oid2, table.oid1], name: "pk_dbo_object_relation"}),
	check("object_relations_oid1_not_null", sql`NOT NULL oid1`),
	check("object_relations_oid2_not_null", sql`NOT NULL oid2`),
	check("object_relations_created_at_not_null", sql`NOT NULL created_at`),
]);

export const coInDbo = dbo.table("co", {
	cid: varchar({ length: 21 }).notNull(),
	oid: uuid().notNull(),
	rank: smallint().generatedAlwaysAsIdentity({ name: "dbo.co_rank_seq", startWith: 100, increment: 1, minValue: 1, maxValue: 32767, cache: 1 }),
	membershipGrade: integer("membership_grade"),
	description: varchar({ length: 1000 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.cid],
			foreignColumns: [classesInDbo.id],
			name: "fk_dbo_co_cid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.oid],
			foreignColumns: [objectsInDbo.id],
			name: "fk_dbo_co_oid"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.oid, table.cid], name: "pk_dbo_co"}),
	check("co_cid_not_null", sql`NOT NULL cid`),
	check("co_oid_not_null", sql`NOT NULL oid`),
	check("co_rank_not_null", sql`NOT NULL rank`),
	check("co_created_at_not_null", sql`NOT NULL created_at`),
]);
