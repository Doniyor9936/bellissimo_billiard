import apiClient from '@/app/api/client';
import type {
  OrganizationTypePosition,
  OrgTypePositionListResponse,
  OrgTypePositionResponse,
  CreateOrgTypePositionRequest,
  UpdateOrgTypePositionRequest,
  OrgTypePositionParams,
} from '../types/types';
import { ORGANIZATION_TYPE_POSITION_ENDPOINTS } from '@/app/api/endpoint';

export interface OrgTypePositionListData {
  items: OrganizationTypePosition[];
  meta: OrgTypePositionListResponse['data']['meta'];
}

export const organizationsTypePositionService = {

  async getAll(params: Partial<OrgTypePositionParams>): Promise<OrgTypePositionListData> {
    const response = await apiClient.get<OrgTypePositionListResponse>(
      ORGANIZATION_TYPE_POSITION_ENDPOINTS.getAll,
      { params },
    );
    return response.data.data;
  },


  async getById(id: string): Promise<OrganizationTypePosition> {
    const response = await apiClient.get<OrgTypePositionResponse>(
      ORGANIZATION_TYPE_POSITION_ENDPOINTS.getById(id),
    );
    return response.data.data;
  },

 
  async create(data: CreateOrgTypePositionRequest): Promise<OrganizationTypePosition> {
    const response = await apiClient.post<OrgTypePositionResponse>(
      ORGANIZATION_TYPE_POSITION_ENDPOINTS.create,
      data,
    );
    return response.data.data;
  },

 
  async update(id: string, data: UpdateOrgTypePositionRequest): Promise<OrganizationTypePosition> {
    const response = await apiClient.patch<OrgTypePositionResponse>(
      ORGANIZATION_TYPE_POSITION_ENDPOINTS.update(id),
      data,
    );
    return response.data.data;
  },

 
  async remove(id: string): Promise<void> {
    await apiClient.delete(ORGANIZATION_TYPE_POSITION_ENDPOINTS.remove(id));
  },
};
