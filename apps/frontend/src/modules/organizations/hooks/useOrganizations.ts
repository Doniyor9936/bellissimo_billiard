import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { organizationsService } from '../services/organizationsService';
import type { Organization, OrganizationPagination, OrganizationsParams } from '../types/types';

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
  search: '',
};

const DEFAULT_PAGINATION: OrganizationPagination = {
  total_items: 0,
  current_page: 1,
  per_page: 10,
  total_pages: 1,
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
        total_items: result.pagination.total,
        current_page: result.pagination.page,
        per_page: result.pagination.limit,
        total_pages: result.pagination.totalPages,
      });
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Xato yuz berdi');
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
    [],
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
