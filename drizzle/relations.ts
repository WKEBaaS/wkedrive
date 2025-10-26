import { relations } from "drizzle-orm/relations";
import { objectsInDbo, usersInAuth, sessionsInAuth, accountsInAuth, entitiesInDbo, classesInDbo, filesInDbo, permissionsInDbo, organizationInvitationsInDbo, userGroupsInAuth, groupsInAuth, inheritancesInDbo, objectRelationsInDbo, coInDbo } from "./schema";

export const usersInAuthRelations = relations(usersInAuth, ({one, many}) => ({
	objectsInDbo: one(objectsInDbo, {
		fields: [usersInAuth.id],
		references: [objectsInDbo.id],
		relationName: "usersInAuth_id_objectsInDbo_id"
	}),
	sessionsInAuths: many(sessionsInAuth),
	accountsInAuths: many(accountsInAuth),
	objectsInDbos: many(objectsInDbo, {
		relationName: "objectsInDbo_ownerId_usersInAuth_id"
	}),
	classesInDbos: many(classesInDbo),
	organizationInvitationsInDbos_inviteeId: many(organizationInvitationsInDbo, {
		relationName: "organizationInvitationsInDbo_inviteeId_usersInAuth_id"
	}),
	organizationInvitationsInDbos_inviterId: many(organizationInvitationsInDbo, {
		relationName: "organizationInvitationsInDbo_inviterId_usersInAuth_id"
	}),
	userGroupsInAuths: many(userGroupsInAuth),
}));

export const objectsInDboRelations = relations(objectsInDbo, ({one, many}) => ({
	usersInAuths: many(usersInAuth, {
		relationName: "usersInAuth_id_objectsInDbo_id"
	}),
	usersInAuth: one(usersInAuth, {
		fields: [objectsInDbo.ownerId],
		references: [usersInAuth.id],
		relationName: "objectsInDbo_ownerId_usersInAuth_id"
	}),
	filesInDbos: many(filesInDbo),
	objectRelationsInDbos_oid1: many(objectRelationsInDbo, {
		relationName: "objectRelationsInDbo_oid1_objectsInDbo_id"
	}),
	objectRelationsInDbos_oid2: many(objectRelationsInDbo, {
		relationName: "objectRelationsInDbo_oid2_objectsInDbo_id"
	}),
	coInDbos: many(coInDbo),
}));

export const sessionsInAuthRelations = relations(sessionsInAuth, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [sessionsInAuth.userId],
		references: [usersInAuth.id]
	}),
}));

export const accountsInAuthRelations = relations(accountsInAuth, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [accountsInAuth.userId],
		references: [usersInAuth.id]
	}),
}));

export const classesInDboRelations = relations(classesInDbo, ({one, many}) => ({
	entitiesInDbo: one(entitiesInDbo, {
		fields: [classesInDbo.entityId],
		references: [entitiesInDbo.id]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [classesInDbo.ownerId],
		references: [usersInAuth.id]
	}),
	permissionsInDbos: many(permissionsInDbo),
	organizationInvitationsInDbos: many(organizationInvitationsInDbo),
	inheritancesInDbos_pcid: many(inheritancesInDbo, {
		relationName: "inheritancesInDbo_pcid_classesInDbo_id"
	}),
	inheritancesInDbos_ccid: many(inheritancesInDbo, {
		relationName: "inheritancesInDbo_ccid_classesInDbo_id"
	}),
	coInDbos: many(coInDbo),
}));

export const entitiesInDboRelations = relations(entitiesInDbo, ({many}) => ({
	classesInDbos: many(classesInDbo),
}));

export const filesInDboRelations = relations(filesInDbo, ({one}) => ({
	objectsInDbo: one(objectsInDbo, {
		fields: [filesInDbo.id],
		references: [objectsInDbo.id]
	}),
}));

export const permissionsInDboRelations = relations(permissionsInDbo, ({one}) => ({
	classesInDbo: one(classesInDbo, {
		fields: [permissionsInDbo.classId],
		references: [classesInDbo.id]
	}),
}));

export const organizationInvitationsInDboRelations = relations(organizationInvitationsInDbo, ({one}) => ({
	classesInDbo: one(classesInDbo, {
		fields: [organizationInvitationsInDbo.organizationClassId],
		references: [classesInDbo.id]
	}),
	usersInAuth_inviteeId: one(usersInAuth, {
		fields: [organizationInvitationsInDbo.inviteeId],
		references: [usersInAuth.id],
		relationName: "organizationInvitationsInDbo_inviteeId_usersInAuth_id"
	}),
	usersInAuth_inviterId: one(usersInAuth, {
		fields: [organizationInvitationsInDbo.inviterId],
		references: [usersInAuth.id],
		relationName: "organizationInvitationsInDbo_inviterId_usersInAuth_id"
	}),
}));

export const userGroupsInAuthRelations = relations(userGroupsInAuth, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [userGroupsInAuth.userId],
		references: [usersInAuth.id]
	}),
	groupsInAuth: one(groupsInAuth, {
		fields: [userGroupsInAuth.groupId],
		references: [groupsInAuth.id]
	}),
}));

export const groupsInAuthRelations = relations(groupsInAuth, ({many}) => ({
	userGroupsInAuths: many(userGroupsInAuth),
}));

export const inheritancesInDboRelations = relations(inheritancesInDbo, ({one}) => ({
	classesInDbo_pcid: one(classesInDbo, {
		fields: [inheritancesInDbo.pcid],
		references: [classesInDbo.id],
		relationName: "inheritancesInDbo_pcid_classesInDbo_id"
	}),
	classesInDbo_ccid: one(classesInDbo, {
		fields: [inheritancesInDbo.ccid],
		references: [classesInDbo.id],
		relationName: "inheritancesInDbo_ccid_classesInDbo_id"
	}),
}));

export const objectRelationsInDboRelations = relations(objectRelationsInDbo, ({one}) => ({
	objectsInDbo_oid1: one(objectsInDbo, {
		fields: [objectRelationsInDbo.oid1],
		references: [objectsInDbo.id],
		relationName: "objectRelationsInDbo_oid1_objectsInDbo_id"
	}),
	objectsInDbo_oid2: one(objectsInDbo, {
		fields: [objectRelationsInDbo.oid2],
		references: [objectsInDbo.id],
		relationName: "objectRelationsInDbo_oid2_objectsInDbo_id"
	}),
}));

export const coInDboRelations = relations(coInDbo, ({one}) => ({
	classesInDbo: one(classesInDbo, {
		fields: [coInDbo.cid],
		references: [classesInDbo.id]
	}),
	objectsInDbo: one(objectsInDbo, {
		fields: [coInDbo.oid],
		references: [objectsInDbo.id]
	}),
}));