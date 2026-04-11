import { relations } from "drizzle-orm";
import { organizations } from "./tables/organization";
import { organizationCrossAccess } from "./tables/organization-cross-access";
import { userOrganization } from "./tables/user-organization";
import { users } from "./tables/users";

// ─── Organization Relations ───────────────────────────────────────────────────

export const organizationRelations = relations(organizations, ({ many }) => ({
	userOrganizations: many(userOrganization),
}));

// ─── User Relations ───────────────────────────────────────────────────────────

export const userRelations = relations(users, ({ many }) => ({
	userOrganizations: many(userOrganization),
}));

// ─── UserOrganization Relations ───────────────────────────────────────────────

export const userOrganizationRelations = relations(userOrganization, ({ one }) => ({
	user: one(users, {
		fields: [userOrganization.userId],
		references: [users.id],
	}),
	organization: one(organizations, {
		fields: [userOrganization.organizationId],
		references: [organizations.id],
	}),
}));

export const organizationCrossAccessRelations = relations(organizationCrossAccess, ({ one }) => ({
	viewer: one(organizations, {
		fields: [organizationCrossAccess.viewerId],
		references: [organizations.id],
		relationName: "organizationCrossAccess_viewerId_organization_id",
	}),
	target: one(organizations, {
		fields: [organizationCrossAccess.targetId],
		references: [organizations.id],
		relationName: "organizationCrossAccess_targetId_organization_id",
	}),
}));
