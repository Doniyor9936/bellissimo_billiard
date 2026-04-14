import { useState, useCallback } from 'react';
import { message } from 'antd';
import { organizationsTypeService } from '../services/organizationsTypeService';
import type {
  OrganizationType,
  CreateOrganizationTypeRequest,
  UpdateOrganizationTypeRequest,
} from '../types/types';

interface UseOrganizationsTypeCRUDReturn {
  submitting: boolean;
  create: (data: CreateOrganizationTypeRequest) => Promise<void>;
  update: (id: string, data: UpdateOrganizationTypeRequest) => Promise<void>;
  remove: (record: OrganizationType) => Promise<void>;
}

export function useOrganizationsTypeCRUD(onSuccess: () => void): UseOrganizationsTypeCRUDReturn {
  const [submitting, setSubmitting] = useState(false);

  const create = useCallback(
    async (data: CreateOrganizationTypeRequest) => {
      setSubmitting(true);
      try {
        await organizationsTypeService.create(data);
        message.success("Tashkilot tur positsiyasi qo'shildi");
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
    async (id: string, data: UpdateOrganizationTypeRequest) => {
      setSubmitting(true);
      try {
        await organizationsTypeService.update(id, data);
        message.success('Tashkilot tur positsiyasi yangilandi');
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
    async (record: OrganizationType) => {
      try {
        await organizationsTypeService.remove(record.id);
        message.success("Tashkilot tur positsiyasi o'chirildi");
        onSuccess();
      } catch (err: unknown) {
        message.error(err instanceof Error ? err.message : 'Xato yuz berdi');
      }
    },
    [onSuccess],
  );

  return { submitting, create, update, remove };
}
