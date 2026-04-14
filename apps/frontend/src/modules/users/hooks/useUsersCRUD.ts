import { useState, useCallback } from 'react';
import { message } from 'antd';
import { usersService } from '../services/usersService';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/types';

interface UseUsersCRUDReturn {
  submitting: boolean;
  create: (data: CreateUserRequest) => Promise<void>;
  update: (id: string, data: UpdateUserRequest) => Promise<void>;
  remove: (record: User) => Promise<void>;
}

/**
 * CRUD operatsiyalari uchun hook.
 * @param onSuccess — har bir muvaffaqiyatli amaldan so'ng chaqiriladi (refresh uchun)
 */
export function useUsersCRUD(onSuccess: () => void): UseUsersCRUDReturn {
  const [submitting, setSubmitting] = useState(false);

  const create = useCallback(
    async (data: CreateUserRequest) => {
      setSubmitting(true);
      try {
        await usersService.create(data);
        message.success("Foydalanuvchi qo'shildi");
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
    async (id: string, data: UpdateUserRequest) => {
      setSubmitting(true);
      try {
        await usersService.update(id, data);
        message.success('Foydalanuvchi yangilandi');
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
    async (record: User) => {
      try {
        await usersService.remove(record.id);
        message.success("Foydalanuvchi o'chirildi");
        onSuccess();
      } catch (err: unknown) {
        message.error(err instanceof Error ? err.message : 'Xato yuz berdi');
      }
    },
    [onSuccess],
  );

  return { submitting, create, update, remove };
}
