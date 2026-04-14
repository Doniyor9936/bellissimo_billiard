import { useState, useCallback } from 'react';
import type { FilterValues } from '../components/AppTableFilter';

/**
 * Filter holatini boshqarish uchun universal hook.
 *
 * @example
 * const { filterValues, setFilter, resetFilters } = useTableFilter({
 *   dateRange: null,
 *   tashkilot: undefined,
 * });
 */
function useTableFilter<T extends FilterValues>(initialValues: T) {
  const [filterValues, setFilterValues] = useState<T>(initialValues);

  const setFilter = useCallback((key: string, value: unknown) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterValues(initialValues);
  }, [initialValues]);

  return { filterValues, setFilter, resetFilters };
}

export default useTableFilter;
