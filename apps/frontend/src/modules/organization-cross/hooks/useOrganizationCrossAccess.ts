import { message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { organizationCrossAccessService } from "../services/organizationCrossAccessService";
import type {
	CrossAccessPagination,
	CrossAccessParams,
	OrganizationCrossAccess,
} from "../types/types";

interface UseOrganizationCrossAccessReturn {
	data: OrganizationCrossAccess[];
	pagination: CrossAccessPagination;
	loading: boolean;
	params: CrossAccessParams;
	setParam: <K extends keyof CrossAccessParams>(key: K, value: CrossAccessParams[K]) => void;
	setPage: (page: number) => void;
	setPerPage: (limit: number) => void;
	refresh: () => void;
}

const DEFAULT_PARAMS: CrossAccessParams = {
	page: 1,
	limit: 10,
	search: "",
	isActive: undefined,
};

const DEFAULT_PAGINATION: CrossAccessPagination = {
	totalItems: 0,
	currentPage: 1,
	perPage: 10,
	totalPages: 1,
};

export function useOrganizationCrossAccess(): UseOrganizationCrossAccessReturn {
	const [data, setData] = useState<OrganizationCrossAccess[]>([]);
	const [pagination, setPagination] = useState<CrossAccessPagination>(DEFAULT_PAGINATION);
	const [loading, setLoading] = useState(false);
	const [params, setParams] = useState<CrossAccessParams>(DEFAULT_PARAMS);

	const fetch = useCallback(async (currentParams: CrossAccessParams) => {
		setLoading(true);
		try {
			const result = await organizationCrossAccessService.getAll(currentParams);
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
		<K extends keyof CrossAccessParams>(key: K, value: CrossAccessParams[K]) => {
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
