  import { useState } from 'react';

  export type ModalMode = 'add' | 'edit' | null;

  export interface UseTableCRUDResult<T> {
    /** Ochiq modal turi */
    modalMode: ModalMode;
    /** Tahrirlash uchun tanlangan yozuv */
    selectedRecord: T | null;
    /** Add modal ochish */
    openAdd: () => void;
    /** Edit modal ochish */
    openEdit: (record: T) => void;
    /** Modalni yopish */
    closeModal: () => void;
    /** O'chirish (callback bilan) */
    handleDelete: (record: T, deleteFn: (record: T) => void) => void;
  }

  /**
   * CRUD modal holatini boshqarish uchun universal hook.
   * Har qanday entity uchun ishlatsa bo'ladi.
   *
   * @example
   * const crud = useTableCRUD<User>();
   * <AppTable crudHandlers={{ onAdd: crud.openAdd, onEdit: crud.openEdit, onDelete: (r) => crud.handleDelete(r, deleteUser) }} />
   * <UserFormModal mode={crud.modalMode} record={crud.selectedRecord} onClose={crud.closeModal} />
   */
  function useTableCRUD<T>(): UseTableCRUDResult<T> {
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

    const openAdd = () => {
      setSelectedRecord(null);
      setModalMode('add');
    };

    const openEdit = (record: T) => {
      setSelectedRecord(record);
      setModalMode('edit');
    };

    const closeModal = () => {
      setModalMode(null);
      setSelectedRecord(null);
    };

    const handleDelete = (record: T, deleteFn: (record: T) => void) => {
      deleteFn(record);
    };

    return { modalMode, selectedRecord, openAdd, openEdit, closeModal, handleDelete };
  }

  export default useTableCRUD;
