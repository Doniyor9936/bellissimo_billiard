export const UserRole = {
	ADMIN: "admin",
	KASSIR: "kassir",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export interface User {
	id: string;
	phone: string;
	role: UserRoleType;
	isActive: boolean;
	createdAt: string;
}
