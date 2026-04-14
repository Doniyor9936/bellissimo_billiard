export interface Organization {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface OrganizationPaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface OrganizationPagination {
	totalItems: number;
	currentPage: number;
	perPage: number;
	totalPages: number;
}

export interface OrganizationsListResponse {
	success: boolean;
	data: {
		items: Organization[];
		pagination: OrganizationPaginationMeta;
	};
}

export type OrganizationResponse = Organization;

export interface CreateOrganizationRequest {
	name: string;
}

export interface UpdateOrganizationRequest {
	name?: string;
}

export interface OrganizationsParams {
	page: number;
	limit: number;
	search?: string;
}
