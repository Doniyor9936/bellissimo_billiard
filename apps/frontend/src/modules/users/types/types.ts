
export interface User {
  id: string;
  fullname: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface UsersPagination {
  total_items: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    items: User[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}


export interface CreateUserRequest {
  fullname: string;
  phone: string;
  password: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  fullname?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UsersParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: string;
}
