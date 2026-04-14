import apiClient from '@/app/api/client';
import type {
  OrganizationType,
  OrganizationTypeListResponse,
  OrganizationTypeResponse,
  CreateOrganizationTypeRequest,
  UpdateOrganizationTypeRequest,
  OrganizationTypeParams,
} from '../types/types';
import { ORGANIZATION_TYPES_ENDPOINTS } from '@/app/api/endpoint';

export interface OrganizationTypeListData {
  items: OrganizationType[];
  meta: OrganizationTypeListResponse['data']['meta'];
}

export const organizationsTypeService = {
  async getAll(params: Partial<OrganizationTypeParams>): Promise<OrganizationTypeListData> {
    const response = await apiClient.get<OrganizationTypeListResponse>(
      ORGANIZATION_TYPES_ENDPOINTS.getAll,
      {
        params,
      },
    );
    return response.data.data;
  },

  async getById(id: string): Promise<OrganizationType> {
    const response = await apiClient.get<OrganizationTypeResponse>(
      ORGANIZATION_TYPES_ENDPOINTS.getById(id),
    );
    return response.data.data;
  },

  async create(data: CreateOrganizationTypeRequest): Promise<OrganizationType> {
    const response = await apiClient.post<OrganizationTypeResponse>(
      ORGANIZATION_TYPES_ENDPOINTS.create,
      data,
    );
    return response.data.data;
  },

  async update(id: string, data: UpdateOrganizationTypeRequest): Promise<OrganizationType> {
    const response = await apiClient.patch<OrganizationTypeResponse>(
      ORGANIZATION_TYPES_ENDPOINTS.update(id),
      data,
    );
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(ORGANIZATION_TYPES_ENDPOINTS.remove(id));
  },
};
