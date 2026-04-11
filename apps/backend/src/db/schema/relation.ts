import { relations } from "drizzle-orm";
import { organizations } from "./tables/organization";
import { organizationCrossAccess } from "./tables/organization-cross-access";
import { organizationType } from "./tables/organization-type";
import { organizationTypePosition } from "./tables/organization-type-position";
import { userOrganization } from "./tables/user-organization";
import { users } from "./tables/users";

// ─── Organization Relations ───────────────────────────────────────────────────

export const organizationRelations = relations(organizations, ({ many }) => ({
	userOrganizations: many(userOrganization),
	viewerAccess: many(organizationCrossAccess, {
		relationName: "organizationCrossAccess_viewerId_organization_id", // ← MOS BO'LISHI KERAK
	}),
	targetAccess: many(organizationCrossAccess, {
		relationName: "organizationCrossAccess_targetId_organization_id", // ← MOS BO'LISHI KERAK
	}),
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
	organizationTypePosition: one(organizationTypePosition, {
		fields: [userOrganization.positionId],
		references: [organizationTypePosition.id],
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

export const organizationTypePositionRelations = relations(
	organizationTypePosition,
	({ one, many }) => ({
		organizationType: one(organizationType, {
			fields: [organizationTypePosition.typeId], // ← typeId
			references: [organizationType.id],
		}),
		userOrganizations: many(userOrganization),
	})
);
