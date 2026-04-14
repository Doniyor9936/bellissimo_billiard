import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { usersService } from '../services/usersService';
import type { User, UsersPagination, UsersParams } from '../types/types';

interface UseUsersReturn {
  data: User[];
  pagination: UsersPagination;
  loading: boolean;
  params: UsersParams;
  setParam: <K extends keyof UsersParams>(key: K, value: UsersParams[K]) => void;
  setPage: (page: number) => void;
  setPerPage: (limit: number) => void;
  refresh: () => void;
}

const DEFAULT_PARAMS: UsersParams = {
  page: 1,
  limit: 10,
  search: '',
  isActive: undefined,
};

const DEFAULT_PAGINATION: UsersPagination = {
  total_items: 0,
  current_page: 1,
  per_page: 10,
  total_pages: 1,
};

export function useUsers(): UseUsersReturn {
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UsersPagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<UsersParams>(DEFAULT_PARAMS);

  const fetch = useCallback(async (currentParams: UsersParams) => {
    setLoading(true);
    try {
      const result = await usersService.getAll(currentParams);
      setData(result.items);
      setPagination({
        total_items: result.meta.total,
        current_page: result.meta.page,
        per_page: result.meta.limit,
        total_pages: result.meta.totalPages,
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

  const setParam = useCallback(<K extends keyof UsersParams>(key: K, value: UsersParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

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
