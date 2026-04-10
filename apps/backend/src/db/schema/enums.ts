import { pgEnum } from "drizzle-orm/pg-core";

export const crossAccessType = pgEnum("cross_access_type", ["READ", "WRITE"]);
