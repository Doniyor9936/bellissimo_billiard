
export interface OrganizationTypePosition {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}


export interface OrgTypePositionPagination {
  total_items: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}


export interface OrgTypePositionListResponse {
  success: boolean;
  data: {
    items: OrganizationTypePosition[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}


export interface OrgTypePositionResponse {
  success: boolean;
  data: OrganizationTypePosition;
}


export interface CreateOrgTypePositionRequest {
  name: string;
  typeId: string; // uuid
}

export interface UpdateOrgTypePositionRequest {
  name?: string;
}


export interface OrgTypePositionParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: 'true' | 'false';
}
