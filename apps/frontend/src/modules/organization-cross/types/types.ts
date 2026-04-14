// ─── Enums ────────────────────────────────────────────────────────────────────

export type AccessType = 'READ' | 'WRITE';

// ─── Nested org (viewer / target) ────────────────────────────────────────────

export interface CrossAccessOrg {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Entity ───────────────────────────────────────────────────────────────────

export interface OrganizationCrossAccess {
  id: string;
  accessType: AccessType;
  viewer: CrossAccessOrg;
  target: CrossAccessOrg;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface CrossAccessPagination {
  total_items: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}

// ─── API response wrappers ────────────────────────────────────────────────────

/** GET /organization-cross-access — { success, data: { items, meta } } */
export interface CrossAccessListResponse {
  success: boolean;
  data: {
    items: OrganizationCrossAccess[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/** POST / PATCH / GET by ID — wrapper yo'q, to'g'ridan-to'g'ri object */
export type CrossAccessResponse = OrganizationCrossAccess;

// ─── Request bodies ───────────────────────────────────────────────────────────

export interface CreateCrossAccessRequest {
  viewerId: string;
  targetId: string;
  accessType: AccessType;
}

export interface UpdateCrossAccessRequest {
  viewerId?: string;
  targetId?: string;
  accessType?: AccessType;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface CrossAccessParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: 'true' | 'false';
}
