
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
  total_items: number;
  current_page: number;
  per_page: number;
  total_pages: number;
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
