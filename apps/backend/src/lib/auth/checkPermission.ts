import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { organizationCrossAccess, organizations, userOrganization, users } from "@/db/schema";

type Permission = "READ" | "WRITE" | "NONE";

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

const cache = new Map<string, { type: string; exp: number }>();

export async function checkPermission(userId: string, organizationId: string): Promise<Permission> {
	const key = { userId, organizationId };
	const cached = getCache(key);
	if (cached) {
		return cached;
	}

	const foundUser = await db.query.users.findFirst({
		where: and(eq(users.id, userId), eq(users.isDeleted, false)),
	});
	if (!foundUser) {
		setCache(key, "NONE");
		return "NONE";
	}

	const targetOrganization = await db.query.organizations.findFirst({
		where: and(eq(organizations.id, organizationId), eq(organizations.isDeleted, false)),
	});

	if (!targetOrganization) {
		setCache(key, "NONE");
		return "NONE";
	}

	const foundUserOrganizations = await db.query.userOrganization.findMany({
		where: and(eq(userOrganization.userId, userId), eq(userOrganization.isDeleted, false)),
		columns: { organizationId: true },
	});

	const checkOrganizations: { type: Permission; id: string }[] = foundUserOrganizations.map(
		(v) => ({
			type: "WRITE",
			id: v.organizationId,
		})
	);

	const visited = new Set<string>();

	while (checkOrganizations.length > 0) {
		const checkOrganization = checkOrganizations.pop();
		if (!checkOrganization) {
			continue;
		}
		if (visited.has(checkOrganization.id)) {
			continue;
		}
		visited.add(checkOrganization.id);

		if (checkOrganization.id === organizationId) {
			setCache(key, checkOrganization.type);
			return checkOrganization.type;
		}

		const childOrganizations = await db.query.organizations.findMany({
			where: and(eq(organizations.isDeleted, false)),
			columns: { id: true },
		});
		checkOrganizations.push(
			...childOrganizations.map((v) => ({
				id: v.id,
				type: checkOrganization.type,
			}))
		);

		const childOrganizationCrossAccesses = await db.query.organizationCrossAccess.findMany({
			where: and(
				eq(organizationCrossAccess.viewerId, checkOrganization.id),
				eq(organizationCrossAccess.isDeleted, false)
			),
			columns: { accessType: true, targetId: true },
		});

		checkOrganizations.push(
			...childOrganizationCrossAccesses.map((v) => ({
				id: v.targetId,
				type: v.accessType === checkOrganization.type ? v.accessType : "READ",
			}))
		);
	}

	setCache(key, "NONE");
	return "NONE";
}

//Garbage collection
setInterval(() => {
	const now = Date.now();
	for (const [key, value] of cache) {
		if (value.exp < now) {
			cache.delete(key);
		}
	}
}, CACHE_TTL / 2);

function setCache(key: { userId: string; organizationId: string }, value: string) {
	const keyStr = `${key.userId}:${key.organizationId}`;
	cache.set(keyStr, { type: value, exp: Date.now() + CACHE_TTL });
}

function getCache(key: { userId: string; organizationId: string }): Permission | undefined {
	const keyStr = `${key.userId}:${key.organizationId}`;
	const cached = cache.get(keyStr);
	if (!cached) {
		return undefined;
	}
	if (cached.exp < Date.now()) {
		return undefined;
	}
	return cached.type as Permission;
}
