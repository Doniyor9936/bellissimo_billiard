import { useState, useCallback } from 'react';
import { message } from 'antd';
import { organizationsTypePositionService } from '../services/organizationsTypePositionService';
import type {
  OrganizationTypePosition,
  CreateOrgTypePositionRequest,
  UpdateOrgTypePositionRequest,
} from '../types/types';

interface UseOrganizationsTypePositionCRUDReturn {
  submitting: boolean;
  create: (data: CreateOrgTypePositionRequest) => Promise<void>;
  update: (id: string, data: UpdateOrgTypePositionRequest) => Promise<void>;
  remove: (record: OrganizationTypePosition) => Promise<void>;
}

export function useOrganizationsTypePositionCRUD(
  onSuccess: () => void,
): UseOrganizationsTypePositionCRUDReturn {
  const [submitting, setSubmitting] = useState(false);

  const create = useCallback(
    async (data: CreateOrgTypePositionRequest) => {
      setSubmitting(true);
      try {
        await organizationsTypePositionService.create(data);
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
    async (id: string, data: UpdateOrgTypePositionRequest) => {
      setSubmitting(true);
      try {
        await organizationsTypePositionService.update(id, data);
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
    async (record: OrganizationTypePosition) => {
      try {
        await organizationsTypePositionService.remove(record.id);
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
