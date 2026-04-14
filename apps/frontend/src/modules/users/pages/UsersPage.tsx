import { Tag } from 'antd';
import { SearchOutlined, PhoneOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';

import AppTable from '@/shared/components/table/pages/appTable';
import AppTableFilter, {
  type FilterField,
} from '@/shared/components/table/components/AppTableFilter';
import useTableCRUD from '@/shared/components/table/hooks/useTableCRUD';

import { useUsers } from '../hooks/useUsers';
import { useUsersCRUD } from '../hooks/useUsersCRUD';
import UserFormModal from '../components/UserFormModal';
import type { CreateUserRequest, UpdateUserRequest, User } from '../types/types';

// Grid faqat desktop (md+) uchun ishlatiladi — AppTable ichida isMobile bo'lsa card ko'rsatadi
const TABLE_GRID_COLS = '56px 3fr 2fr 1fr 1fr 56px';

const columns: ColumnsType<User> = [
  {
    title: '#',
    key: 'index',
    align: 'center',
    render: (_, __, i) => <span style={{ color: '#8c8c8c', fontSize: 13 }}>{i + 1}</span>,
  },
  {
    title: "To'liq ism",
    dataIndex: 'fullname',
    key: 'fullname',
    render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
  },
  {
    title: 'Telefon',
    dataIndex: 'phone',
    key: 'phone',
    render: (phone: string) => (
      <span style={{ fontFamily: 'monospace' }}>
        <PhoneOutlined style={{ color: '#52c41a', marginRight: 6 }} />
        {phone}
      </span>
    ),
  },
  {
    title: 'Holat',
    dataIndex: 'isActive',
    key: 'isActive',
    align: 'center',
    render: (active: boolean) =>
      active ? <Tag color='success'>Faol</Tag> : <Tag color='default'>Faol emas</Tag>,
  },
  {
    title: 'Sana',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (ts: string) => dayjs(ts).format('DD.MM.YYYY'),
  },
];

const filterFields: FilterField[] = [
  {
    type: 'search',
    key: 'search',
    label: 'Qidirish',
    icon: <SearchOutlined />,
    placeholder: 'Ism yoki telefon...',
  },
  {
    type: 'select',
    key: 'isActive',
    label: 'Holat',
    placeholder: 'Barchasi',
    options: [
      { label: 'Faol', value: 'true' },
      { label: 'Faol emas', value: 'false' },
    ],
  },
];

export default function UsersPage() {
  const { data, pagination, loading, params, setParam, setPage, setPerPage, refresh } = useUsers();

  const crudActions = useUsersCRUD(refresh);

  const crud = useTableCRUD<User>();

  const handleTableChange = (pag: TablePaginationConfig) => {
    if (pag.current) setPage(pag.current);
    if (pag.pageSize) setPerPage(pag.pageSize);
  };

  const handleSubmit = async (values: CreateUserRequest | UpdateUserRequest) => {
    if (crud.modalMode === 'add') {
      await crudActions.create(values as CreateUserRequest);
    } else if (crud.selectedRecord) {
      await crudActions.update(crud.selectedRecord.id, values as UpdateUserRequest);
    }
    crud.closeModal();
  };

  return (
    <div>
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,.06)',
        }}
      >
        <style>{`
          .users-table {
            --app-table-cols: ${TABLE_GRID_COLS};
          }

          /* Mobileda padding kichraytirish */
          @media (max-width: 767px) {
            .users-page-card {
              padding: 16px 12px !important;
              border-radius: 12px !important;
            }
          }
        `}</style>

        <AppTable<User>
          title='Foydalanuvchilar'
          description="Tizimda ro'yxatdan o'tgan barcha foydalanuvchilar"
          dataSource={data}
          columns={columns}
          rowKey='id'
          loading={loading}
          total={pagination.total_items}
          className='users-table'
          pagination={{
            current: pagination.current_page,
            pageSize: pagination.per_page,
            total: pagination.total_items,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          crudHandlers={{
            onAdd: crud.openAdd,
            onEdit: crud.openEdit,
            onDelete: (record) => crudActions.remove(record),
          }}
          filterSlot={
            <AppTableFilter
              fields={filterFields}
              values={{ search: params.search, isActive: params.isActive }}
              onChange={(key, value) =>
                setParam(key as keyof typeof params, value as string | number | undefined)
              }
            />
          }
        />

        <UserFormModal
          open={crud.modalMode !== null}
          mode={crud.modalMode}
          initialValues={crud.selectedRecord ?? undefined}
          onSubmit={handleSubmit}
          onCancel={crud.closeModal}
          loading={crudActions.submitting}
        />
      </div>
    </div>
  );
}
