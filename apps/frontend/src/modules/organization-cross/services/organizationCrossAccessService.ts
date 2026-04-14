import apiClient from "@/app/api/client";
import { CROSS_ACCESS_ENDPOINTS } from "@/app/api/endpoint";
import type {
	CreateCrossAccessRequest,
	CrossAccessListResponse,
	CrossAccessParams,
	CrossAccessResponse,
	CrossAccessListResponse as ListRes,
	OrganizationCrossAccess,
	UpdateCrossAccessRequest,
} from "../types/types";

export interface CrossAccessListData {
	items: OrganizationCrossAccess[];
	meta: ListRes["data"]["meta"];
}

export const organizationCrossAccessService = {
	async getAll(params: Partial<CrossAccessParams>): Promise<CrossAccessListData> {
		const response = await apiClient.get<CrossAccessListResponse>(CROSS_ACCESS_ENDPOINTS.getAll, {
			params,
		});
		return response.data.data;
	},

	async getById(id: string): Promise<OrganizationCrossAccess> {
		const response = await apiClient.get<CrossAccessResponse>(CROSS_ACCESS_ENDPOINTS.getById(id));
		return response.data;
	},

	async create(data: CreateCrossAccessRequest): Promise<OrganizationCrossAccess> {
		const response = await apiClient.post<CrossAccessResponse>(CROSS_ACCESS_ENDPOINTS.create, data);
		return response.data;
	},

	async update(id: string, data: UpdateCrossAccessRequest): Promise<OrganizationCrossAccess> {
		const response = await apiClient.patch<CrossAccessResponse>(
			CROSS_ACCESS_ENDPOINTS.update(id),
			data
		);
		return response.data;
	},

	async remove(id: string): Promise<void> {
		await apiClient.delete(CROSS_ACCESS_ENDPOINTS.remove(id));
	},
};
