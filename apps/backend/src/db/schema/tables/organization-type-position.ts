import { boolean, foreignKey, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizationType } from "./organization-type";

export const organizationTypePosition = pgTable(
	"organization_type_position",
	{
		id: uuid().primaryKey().notNull().defaultRandom(),
		name: text().notNull(),
		typeId: uuid("type_id").notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
		isDeleted: boolean("is_deleted").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.typeId],
			foreignColumns: [organizationType.id],
			name: "organization_type_position_type_id_fkey",
		}),
	]
);
