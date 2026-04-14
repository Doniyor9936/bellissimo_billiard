import { message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { organizationsService } from "../services/organizationsService";
import type { Organization, OrganizationPagination, OrganizationsParams } from "../types/types";

interface UseOrganizationsReturn {
	data: Organization[];
	pagination: OrganizationPagination;
	loading: boolean;
	params: OrganizationsParams;
	setParam: <K extends keyof OrganizationsParams>(key: K, value: OrganizationsParams[K]) => void;
	setPage: (page: number) => void;
	setPerPage: (limit: number) => void;
	refresh: () => void;
}

const DEFAULT_PARAMS: OrganizationsParams = {
	page: 1,
	limit: 10,
	search: "",
};

const DEFAULT_PAGINATION: OrganizationPagination = {
	totalItems: 0,
	currentPage: 1,
	perPage: 10,
	totalPages: 1,
};

export function useOrganizations(): UseOrganizationsReturn {
	const [data, setData] = useState<Organization[]>([]);
	const [pagination, setPagination] = useState<OrganizationPagination>(DEFAULT_PAGINATION);
	const [loading, setLoading] = useState(false);
	const [params, setParams] = useState<OrganizationsParams>(DEFAULT_PARAMS);

	const fetch = useCallback(async (currentParams: OrganizationsParams) => {
		setLoading(true);
		try {
			const result = await organizationsService.getAll(currentParams);
			setData(result.items);
			setPagination({
				totalItems: result.pagination.total,
				currentPage: result.pagination.page,
				perPage: result.pagination.limit,
				totalPages: result.pagination.totalPages,
			});
		} catch (err: unknown) {
			message.error(err instanceof Error ? err.message : "Xato yuz berdi");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetch(params);
	}, [params, fetch]);

	const setParam = useCallback(
		<K extends keyof OrganizationsParams>(key: K, value: OrganizationsParams[K]) => {
			setParams((prev) => ({ ...prev, [key]: value, page: 1 }));
		},
		[]
	);

	const setPage = useCallback((page: number) => {
		setParams((prev) => ({ ...prev, page }));
	}, []);

	const setPerPage = useCallback((limit: number) => {
		setParams((prev) => ({ ...prev, limit, page: 1 }));
	}, []);

	const refresh = useCallback(() => {
		fetch(params);
	}, [fetch, params]);

	return { data, pagination, loading, params, setParam, setPage, setPerPage, refresh };
}
