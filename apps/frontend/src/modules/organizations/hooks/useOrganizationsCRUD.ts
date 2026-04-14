import { useState, useCallback } from 'react';
import { message } from 'antd';
import { organizationsService } from '../services/organizationsService';
import type { Organization, CreateOrganizationRequest, UpdateOrganizationRequest } from '../types/types';

interface UseOrganizationsCRUDReturn {
  submitting: boolean;
  create: (data: CreateOrganizationRequest) => Promise<void>;
  update: (id: string, data: UpdateOrganizationRequest) => Promise<void>;
  remove: (record: Organization) => Promise<void>;
}

export function useOrganizationsCRUD(onSuccess: () => void): UseOrganizationsCRUDReturn {
  const [submitting, setSubmitting] = useState(false);

  const create = useCallback(
    async (data: CreateOrganizationRequest) => {
      setSubmitting(true);
      try {
        await organizationsService.create(data);
        message.success("Tashkilot qo'shildi");
        onSuccess();
      } catch (err: unknown) {
        message.error(err instanceof Error ? err.message : 'Xato yuz berdi');
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess],
  );

  const update = useCallback(
    async (id: string, data: UpdateOrganizationRequest) => {
      setSubmitting(true);
      try {
        await organizationsService.update(id, data);
        message.success('Tashkilot yangilandi');
        onSuccess();
      } catch (err: unknown) {
        message.error(err instanceof Error ? err.message : 'Xato yuz berdi');
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess],
  );

  const remove = useCallback(
    async (record: Organization) => {
      try {
        await organizationsService.remove(record.id);
        message.success("Tashkilot o'chirildi");
        onSuccess();
      } catch (err: unknown) {
        message.error(err instanceof Error ? err.message : 'Xato yuz berdi');
      }
    },
    [onSuccess],
  );

  return { submitting, create, update, remove };
}
