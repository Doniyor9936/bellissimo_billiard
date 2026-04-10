import { relations } from "drizzle-orm";
import { organizations } from "./tables/organization";
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
