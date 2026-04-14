import { message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { organizationsTypeService } from "../services/organizationsTypeService";
import type {
	OrganizationType,
	OrganizationTypePagination,
	OrganizationTypeParams,
} from "../types/types";

interface UseOrganizationsTypeReturn {
	data: OrganizationType[];
	pagination: OrganizationTypePagination;
	loading: boolean;
	params: OrganizationTypeParams;
	setParam: <K extends keyof OrganizationTypeParams>(
		key: K,
		value: OrganizationTypeParams[K]
	) => void;
	setPage: (page: number) => void;
	setPerPage: (limit: number) => void;
	refresh: () => void;
}

const DEFAULT_PARAMS: OrganizationTypeParams = {
	page: 1,
	limit: 10,
	search: "",
};

const DEFAULT_PAGINATION: OrganizationTypePagination = {
	totalItems: 0,
	currentPage: 1,
	perPage: 10,
	totalPages: 1,
};

export function useOrganizationsType(): UseOrganizationsTypeReturn {
	const [data, setData] = useState<OrganizationType[]>([]);
	const [pagination, setPagination] = useState<OrganizationTypePagination>(DEFAULT_PAGINATION);
	const [loading, setLoading] = useState(false);
	const [params, setParams] = useState<OrganizationTypeParams>(DEFAULT_PARAMS);

	const fetch = useCallback(async (currentParams: OrganizationTypeParams) => {
		setLoading(true);
		try {
			const result = await organizationsTypeService.getAll(currentParams);
			setData(result.items);
			setPagination({
				totalItems: result.meta.total,
				currentPage: result.meta.page,
				perPage: result.meta.limit,
				totalPages: result.meta.totalPages,
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
		<K extends keyof OrganizationTypeParams>(key: K, value: OrganizationTypeParams[K]) => {
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
