import { Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';

import AppTable from '@/shared/components/table/pages/appTable';
import AppTableFilter, {
  type FilterField,
} from '@/shared/components/table/components/AppTableFilter';
import useTableCRUD from '@/shared/components/table/hooks/useTableCRUD';

import { useOrganizationsType } from '../hooks/useOrganizationsType';
import { useOrganizationsTypeCRUD } from '../hooks/useOrganizationsTypeCRUD';
import OrganizationTypeFormModal from '../components/OrganizationTypeFormModal';
import type {
  CreateOrganizationTypeRequest,
  UpdateOrganizationTypeRequest,
  OrganizationType,
} from '../types/types';

const TABLE_GRID_COLS = '56px 1fr 1fr 56px';

const columns: ColumnsType<OrganizationType> = [
  {
    title: '#',
    key: 'index',
    align: 'center',
    render: (_, __, i) => <span style={{ color: '#8c8c8c', fontSize: 13 }}>{i + 1}</span>,
  },
  {
    title: 'Nomi',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
  },
  {
    title: 'Yaratilgan sana',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (ts: string) => <Tag color='blue'>{dayjs(ts).format('DD.MM.YYYY')}</Tag>,
  },
];

const filterFields: FilterField[] = [
  {
    type: 'search',
    key: 'search',
    label: 'Qidirish',
    icon: <SearchOutlined />,
    placeholder: "Nomi bo'yicha...",
  },
];

const TYPE_OPTIONS = [
  { label: 'Maktab', value: '123e4567-e89b-12d3-a456-426614174000' },
  { label: 'Universitet', value: '223e4567-e89b-12d3-a456-426614174001' },
];

export default function OrganizationsTypePage() {
  const { data, pagination, loading, params, setParam, setPage, setPerPage, refresh } =
    useOrganizationsType();

  const crudActions = useOrganizationsTypeCRUD(refresh);

  const crud = useTableCRUD<OrganizationType>();

  const handleTableChange = (pag: TablePaginationConfig) => {
    if (pag.current) setPage(pag.current);
    if (pag.pageSize) setPerPage(pag.pageSize);
  };

  const handleSubmit = async (
    values: CreateOrganizationTypeRequest | UpdateOrganizationTypeRequest,
  ) => {
    if (crud.modalMode === 'add') {
      await crudActions.create(values as CreateOrganizationTypeRequest);
    } else if (crud.selectedRecord) {
      await crudActions.update(crud.selectedRecord.id, values as UpdateOrganizationTypeRequest);
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
          .org-type-table { --app-table-cols: ${TABLE_GRID_COLS}; }
          @media (max-width: 767px) {
            .org-type-page-card { padding: 16px 12px !important; border-radius: 12px !important; }
          }
        `}</style>

        <AppTable<OrganizationType>
          title='Tashkilot tur positsiyalari'
          description="Barcha tashkilot tur positsiyalari ro'yxati"
          dataSource={data}
          columns={columns}
          rowKey='id'
          loading={loading}
          total={pagination.total_items}
          className='org-type-table'
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
              values={{ search: params.search }}
              onChange={(key, value) =>
                setParam(key as keyof typeof params, value as string | number | undefined)
              }
            />
          }
        />

        <OrganizationTypeFormModal
          open={crud.modalMode !== null}
          mode={crud.modalMode}
          initialValues={crud.selectedRecord ?? undefined}
          typeOptions={TYPE_OPTIONS}
          onSubmit={handleSubmit}
          onCancel={crud.closeModal}
          loading={crudActions.submitting}
        />
      </div>
    </div>
  );
}
