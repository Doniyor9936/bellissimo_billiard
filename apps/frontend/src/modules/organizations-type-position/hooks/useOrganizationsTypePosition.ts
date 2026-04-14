import { message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { organizationsTypePositionService } from "../services/organizationsTypePositionService";
import type {
	OrganizationTypePosition,
	OrgTypePositionPagination,
	OrgTypePositionParams,
} from "../types/types";

interface UseOrganizationsTypePositionReturn {
	data: OrganizationTypePosition[];
	pagination: OrgTypePositionPagination;
	loading: boolean;
	params: OrgTypePositionParams;
	setParam: <K extends keyof OrgTypePositionParams>(
		key: K,
		value: OrgTypePositionParams[K]
	) => void;
	setPage: (page: number) => void;
	setPerPage: (limit: number) => void;
	refresh: () => void;
}

const DEFAULT_PARAMS: OrgTypePositionParams = {
	page: 1,
	limit: 10,
	search: "",
	isActive: undefined,
};

const DEFAULT_PAGINATION: OrgTypePositionPagination = {
	totalItems: 0,
	currentPage: 1,
	perPage: 10,
	totalPages: 1,
};

export function useOrganizationsTypePosition(): UseOrganizationsTypePositionReturn {
	const [data, setData] = useState<OrganizationTypePosition[]>([]);
	const [pagination, setPagination] = useState<OrgTypePositionPagination>(DEFAULT_PAGINATION);
	const [loading, setLoading] = useState(false);
	const [params, setParams] = useState<OrgTypePositionParams>(DEFAULT_PARAMS);

	const fetch = useCallback(async (currentParams: OrgTypePositionParams) => {
		setLoading(true);
		try {
			const result = await organizationsTypePositionService.getAll(currentParams);
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
		<K extends keyof OrgTypePositionParams>(key: K, value: OrgTypePositionParams[K]) => {
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
