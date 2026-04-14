export const ORGANIZATION_TYPE_POSITION_ENDPOINTS = {
	base: "/organizations-type-position",

	getAll: "/organizations-type-position",
	getById: (id: string) => `/organizations-type-position/${id}`,
	create: "/organizations-type-position",
	update: (id: string) => `/organizations-type-position/${id}`,
	remove: (id: string) => `/organizations-type-position/${id}`,
} as const;

export const ORGANIZATION_TYPES_ENDPOINTS = {
	base: "/organization-types",

	getAll: "/organization-types",
	create: "/organization-types",

	getById: (id: string) => `/organization-types/${id}`,
	update: (id: string) => `/organization-types/${id}`,
	remove: (id: string) => `/organization-types/${id}`,
} as const;

export const ORGANIZATIONS_ENDPOINTS = {
	base: "/organizations",

	getAll: "/organizations",
	create: "/organizations",

	getById: (id: string) => `/organizations/${id}`,
	update: (id: string) => `/organizations/${id}`,
	remove: (id: string) => `/organizations/${id}`,
} as const;

export const CROSS_ACCESS_ENDPOINTS = {
	base: "/organization-cross-access",

	getAll: "/organization-cross-access",
	create: "/organization-cross-access",

	getById: (id: string) => `/organization-cross-access/${id}`,
	update: (id: string) => `/organization-cross-access/${id}`,
	remove: (id: string) => `/organization-cross-access/${id}`,
} as const;

export const USERS_ENDPOINTS = {
	base: "/users",

	getAll: "/users",
	create: "/users",

	getById: (id: string) => `/users/${id}`,
	update: (id: string) => `/users/${id}`,
	remove: (id: string) => `/users/${id}`,
} as const;

export const AUTH_ENDPOINTS = {
	login: "/auth/login",
	refresh: "/auth/refresh",
	logout: "/auth/logout",
	me: "/auth/me",
} as const;
