import { boolean, foreignKey, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organization";
import { organizationTypePosition } from "./organization-type-position";
import { users } from "./users";

export const userOrganization = pgTable(
	"user_organization",
	{
		id: uuid().primaryKey().notNull().defaultRandom(),
		userId: uuid("user_id").notNull(),
		organizationId: uuid("organization_id").notNull(),
		positionId: uuid("position_id").notNull(),
		isPrimary: boolean("is_primary").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { mode: "string" }),
	},
	(table) => [
		uniqueIndex("user_organization_user_id_organization_id_position_id_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("uuid_ops"),
			table.organizationId.asc().nullsLast().op("uuid_ops"),
			table.positionId.asc().nullsLast().op("uuid_ops")
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_organization_user_id_fkey",
		}),
		foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "user_organization_organization_id_fkey",
		}),
		foreignKey({
			columns: [table.positionId],
			foreignColumns: [organizationTypePosition.id],
			name: "user_organization_position_id_fkey",
		}),
	]
);
