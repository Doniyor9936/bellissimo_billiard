import apiClient from "@/app/api/client";
import { USERS_ENDPOINTS } from "@/app/api/endpoint";
import type {
	CreateUserRequest,
	UpdateUserRequest,
	User,
	UserResponse,
	UsersListResponse,
	UsersParams,
} from "../types/types";

export interface UsersListData {
	items: User[];
	meta: UsersListResponse["data"]["meta"];
}

export const usersService = {
	async getAll(params: Partial<UsersParams>): Promise<UsersListData> {
		const response = await apiClient.get<UsersListResponse>(USERS_ENDPOINTS.getAll, { params });
		return response.data.data;
	},

	async getById(id: string): Promise<User> {
		const response = await apiClient.get<UserResponse>(USERS_ENDPOINTS.getById(id));
		return response.data.data;
	},

	async create(data: CreateUserRequest): Promise<User> {
		const response = await apiClient.post<UserResponse>(USERS_ENDPOINTS.create, data);
		return response.data.data;
	},

	async update(id: string, data: UpdateUserRequest): Promise<User> {
		const response = await apiClient.patch<UserResponse>(USERS_ENDPOINTS.update(id), data);
		return response.data.data;
	},

	async remove(id: string): Promise<void> {
		await apiClient.delete(USERS_ENDPOINTS.remove(id));
	},
};
