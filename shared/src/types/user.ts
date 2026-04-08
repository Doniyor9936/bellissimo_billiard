export const UserRole = {
	SUPERVISOR: "supervisor",
	ADMIN: "admin",
	MANAGER: "manager",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export interface User {
	id: string;
	phone: string;
	role: UserRoleType;
	isActive: boolean;
	createdAt: string;
}
