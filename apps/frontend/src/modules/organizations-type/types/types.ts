export interface OrganizationType {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface OrganizationTypePagination {
	totalItems: number;
	currentPage: number;
	perPage: number;
	totalPages: number;
}

export interface OrganizationTypeListResponse {
	success: boolean;
	data: {
		items: OrganizationType[];
		meta: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	};
}

export interface OrganizationTypeResponse {
	success: boolean;
	data: OrganizationType;
}

export interface CreateOrganizationTypeRequest {
	name: string;
	typeId: string;
}

export interface UpdateOrganizationTypeRequest {
	name?: string;
}

export interface OrganizationTypeParams {
	page: number;
	limit: number;
	search?: string;
}
