import { boolean, foreignKey, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { crossAccessType } from "../enums";
import { organizations } from "./organization";

export const organizationCrossAccess = pgTable(
	"organization_cross_access",
	{
		id: uuid().primaryKey().notNull().defaultRandom(),
		viewerId: uuid("viewer_id").notNull(),
		targetId: uuid("target_id").notNull(),
		accessType: crossAccessType("access_type").notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.viewerId],
			foreignColumns: [organizations.id],
			name: "organization_cross_access_viewer_id_fkey",
		}),
		foreignKey({
			columns: [table.targetId],
			foreignColumns: [organizations.id],
			name: "organization_cross_access_target_id_fkey",
		}),
	]
);
