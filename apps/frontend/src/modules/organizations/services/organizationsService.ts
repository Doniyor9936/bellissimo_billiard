import apiClient from "@/app/api/client";
import { ORGANIZATIONS_ENDPOINTS } from "@/app/api/endpoint";
import type {
	CreateOrganizationRequest,
	Organization,
	OrganizationPaginationMeta,
	OrganizationResponse,
	OrganizationsListResponse,
	OrganizationsParams,
	UpdateOrganizationRequest,
} from "../types/types";

export interface OrganizationsListData {
	items: Organization[];
	pagination: OrganizationPaginationMeta;
}

export const organizationsService = {
	async getAll(params: Partial<OrganizationsParams>): Promise<OrganizationsListData> {
		const response = await apiClient.get<OrganizationsListResponse>(
			ORGANIZATIONS_ENDPOINTS.getAll,
			{
				params,
			}
		);
		return response.data.data;
	},

	async getById(id: string): Promise<Organization> {
		const response = await apiClient.get<OrganizationResponse>(ORGANIZATIONS_ENDPOINTS.getById(id));
		return response.data;
	},

	async create(data: CreateOrganizationRequest): Promise<Organization> {
		const response = await apiClient.post<OrganizationResponse>(
			ORGANIZATIONS_ENDPOINTS.create,
			data
		);
		return response.data;
	},

	async update(id: string, data: UpdateOrganizationRequest): Promise<Organization> {
		const response = await apiClient.patch<OrganizationResponse>(
			ORGANIZATIONS_ENDPOINTS.update(id),
			data
		);
		return response.data;
	},

	async remove(id: string): Promise<void> {
		await apiClient.delete(ORGANIZATIONS_ENDPOINTS.remove(id));
	},
};
