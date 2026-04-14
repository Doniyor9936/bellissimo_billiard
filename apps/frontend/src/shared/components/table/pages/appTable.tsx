import { Table, Button, Dropdown, Popconfirm, Typography, Grid, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import type { TableProps, MenuProps } from 'antd';
import { useState } from 'react';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CRUDHandlers<T> {
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
}

export interface AppTableProps<T extends object> {
  dataSource: T[];
  columns: ColumnsType<T>;
  rowKey?: keyof T | ((record: T) => string);
  loading?: boolean;
  pagination?: TablePaginationConfig | false;
  total?: number;
  scrollY?: number | string;
  scrollX?: number | string;
  rowSelection?: TableProps<T>['rowSelection'];
  size?: 'small' | 'middle' | 'large';
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[],
  ) => void;
  emptyText?: string;
  className?: string;
  onRow?: TableProps<T>['onRow'];
  title?: string;
  description?: string;
  crudHandlers?: CRUDHandlers<T>;
  hideActionsColumn?: boolean;
  filterSlot?: React.ReactNode;
}

// ─── Actions Dropdown ────────────────────────────────────────────────────────

function ActionsDropdown<T>({
  record,
  onEdit,
  onDelete,
}: {
  record: T;
  onEdit?: (r: T) => void;
  onDelete?: (r: T) => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const items: MenuProps['items'] = [
    ...(onEdit
      ? [
          {
            key: 'edit',
            icon: <EditOutlined style={{ color: '#1677ff' }} />,
            label: <span style={{ color: '#1677ff' }}>Tahrirlash</span>,
            onClick: () => {
              setDropdownOpen(false);
              onEdit(record);
            },
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            key: 'delete',
            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
            label: (
              <Popconfirm
                title="O'chirishni tasdiqlang"
                description="Bu amalni qaytarib bo'lmaydi!"
                okText="Ha, o'chir"
                cancelText='Bekor qilish'
                okButtonProps={{ danger: true, size: 'small' }}
                cancelButtonProps={{ size: 'small' }}
                open={deleteOpen}
                onConfirm={() => {
                  setDeleteOpen(false);
                  setDropdownOpen(false);
                  onDelete(record);
                }}
                onCancel={() => setDeleteOpen(false)}
              >
                <span
                  style={{ color: '#ff4d4f', display: 'block' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                >
                  O'chirish
                </span>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      placement='bottomRight'
      open={dropdownOpen}
      onOpenChange={(v) => {
        if (!deleteOpen) setDropdownOpen(v);
      }}
    >
      <Button
        type='text'
        icon={<MoreOutlined style={{ fontSize: 18 }} />}
        size='small'
        style={{ color: '#8c8c8c' }}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
}

// ─── Mobile Card List ─────────────────────────────────────────────────────────

function MobileCardList<T extends object>({
  dataSource,
  columns,
  rowKey,
  loading,
  crudHandlers,
  hideActionsColumn,
  emptyText,
}: {
  dataSource: T[];
  columns: ColumnsType<T>;
  rowKey?: keyof T | ((record: T) => string);
  loading?: boolean;
  crudHandlers?: CRUDHandlers<T>;
  hideActionsColumn?: boolean;
  emptyText?: string;
}) {
  const getKey = (record: T, index: number): string => {
    if (!rowKey) return String(index);
    if (typeof rowKey === 'function') return rowKey(record);
    return String(record[rowKey]);
  };

  const showActions = !hideActionsColumn && crudHandlers;

  // Filter out index (#) and actions columns from card fields
  const displayColumns = columns.filter((col) => {
    const key = (col as { key?: string }).key;
    return key !== '__actions__' && key !== 'index' && col.title !== '#';
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>Yuklanmoqda...</div>
    );
  }

  if (!dataSource.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
        {emptyText ?? "Ma'lumot topilmadi"}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {dataSource.map((record, index) => (
        <div
          key={getKey(record, index)}
          style={{
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 10,
            padding: '12px 14px',
            boxShadow: '0 1px 3px rgba(0,0,0,.04)',
          }}
        >
          {/* Row number badge */}
          <div
            style={{
              fontSize: 11,
              color: '#bfbfbf',
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            #{index + 1}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {displayColumns.map((col, colIdx) => {
              const key =
                (col as { key?: string }).key ??
                (col as { dataIndex?: string }).dataIndex ??
                String(colIdx);

              const dataIndex = (col as { dataIndex?: string }).dataIndex;
              const rawValue = dataIndex
                ? (record as Record<string, unknown>)[dataIndex]
                : undefined;
              const rendered = col.render ? col.render(rawValue, record, index) : rawValue;

              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: 13,
                    lineHeight: '1.5',
                  }}
                >
                  <span
                    style={{
                      color: '#8c8c8c',
                      minWidth: 100,
                      flexShrink: 0,
                    }}
                  >
                    {col.title as React.ReactNode}:
                  </span>
                  <span
                    style={{
                      color: '#262626',
                      flex: 1,
                      wordBreak: 'break-word',
                      minWidth: 0,
                    }}
                  >
                    {rendered as React.ReactNode}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {showActions && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                borderTop: '1px solid #f5f5f5',
                paddingTop: 10,
                marginTop: 10,
              }}
            >
              {crudHandlers?.onEdit && (
                <Button
                  size='small'
                  icon={<EditOutlined />}
                  style={{ color: '#1677ff', borderColor: '#1677ff', borderRadius: 6 }}
                  onClick={() => crudHandlers.onEdit!(record)}
                >
                  Tahrirlash
                </Button>
              )}
              {crudHandlers?.onDelete && (
                <Popconfirm
                  title="O'chirishni tasdiqlang"
                  description="Bu amalni qaytarib bo'lmaydi!"
                  okText="Ha, o'chir"
                  cancelText='Bekor qilish'
                  okButtonProps={{ danger: true, size: 'small' }}
                  cancelButtonProps={{ size: 'small' }}
                  onConfirm={() => crudHandlers.onDelete!(record)}
                >
                  <Button size='small' danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>
                    O'chirish
                  </Button>
                </Popconfirm>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Smart empty text helper ──────────────────────────────────────────────────

function resolveEmptyText(emptyText?: string, title?: string): string {
  if (emptyText) return emptyText;
  if (title) return `${title} topilmadi`;
  return "Ma'lumot topilmadi";
}

// ─── AppTable ─────────────────────────────────────────────────────────────────

function AppTable<T extends object>({
  dataSource,
  columns,
  rowKey = 'id' as keyof T,
  loading = false,
  pagination,
  total,
  scrollY,
  rowSelection,
  size = 'middle',
  onChange,
  emptyText,
  className,
  onRow,
  title,
  description,
  crudHandlers,
  hideActionsColumn = false,
  filterSlot,
}: AppTableProps<T>) {
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < 768px

  // ── Amallar ustuni ──
  const actionsColumn: ColumnsType<T>[number] = {
    title: 'Amallar',
    key: '__actions__',
    fixed: 'right',
    align: 'center',
    className: 'col-actions',
    render: (_, record) => (
      <ActionsDropdown
        record={record}
        onEdit={crudHandlers?.onEdit}
        onDelete={crudHandlers?.onDelete}
      />
    ),
  };

  const finalColumns: ColumnsType<T> =
    !hideActionsColumn && crudHandlers ? [...columns, actionsColumn] : columns;

  // ── Pagination ──
  const resolvedPagination: TablePaginationConfig | false =
    pagination === false
      ? false
      : {
          pageSize: 10,
          showSizeChanger: !isMobile,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (tot) => (
            <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
              Jami: <strong style={{ color: '#262626' }}>{tot}</strong> ta
            </Text>
          ),
          ...(total !== undefined ? { total } : {}),
          ...pagination,
          simple: isMobile,
          style: {
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: isMobile ? 'center' : undefined,
          },
        };

  const finalEmptyText = (
    <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
      {resolveEmptyText(emptyText, title)}
    </span>
  );

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <style>{`
        .app-table-toolbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .app-table-toolbar-filter { flex: 1; min-width: 0; }
        .app-table-toolbar-add { flex-shrink: 0; }

        @media (max-width: 767px) {
          .app-table-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .app-table-toolbar-add .ant-btn {
            width: 100% !important;
            justify-content: center;
            height: 40px;
          }
        }

        /* ── Desktop grid table ── */
        .app-table-grid .ant-table-thead > tr,
        .app-table-grid .ant-table-tbody > tr:not(.ant-table-placeholder) {
          display: grid;
          grid-template-columns: var(--app-table-cols);
          width: 100%;
        }

        .app-table-grid .ant-table-thead > tr > th,
        .app-table-grid .ant-table-tbody > tr:not(.ant-table-placeholder) > td {
          display: flex;
          align-items: center;
          overflow: hidden;
          min-width: 0;
        }

        .app-table-grid .ant-table-placeholder {
          display: table-row !important;
        }
        .app-table-grid .ant-table-placeholder > td {
          display: table-cell !important;
          text-align: center !important;
          padding: 48px 0 !important;
        }

        .app-table-grid .ant-table-thead > tr > th.col-actions,
        .app-table-grid .ant-table-tbody > tr > td.col-actions {
          justify-content: center;
        }

        .app-table-grid .ant-table-tbody > tr:not(.ant-table-placeholder) > td {
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .app-table-grid .ant-table-placeholder td {
          white-space: normal !important;
          text-align: center !important;
          justify-content: center !important;
        }

        .app-table-grid .ant-table-placeholder .ant-empty {
          margin: 0 auto;
        }

        .app-table-grid .ant-table-tbody > tr:hover > td {
          background: #f5f8ff !important;
        }

        .app-table-grid .ant-table {
          border-radius: 10px;
          overflow: hidden;
        }
      `}</style>

      {/* ══ 1. Title + Description ══ */}
      {(title || description) && (
        <div style={{ marginBottom: 20 }}>
          {title && (
            <Title
              level={4}
              style={{
                margin: 0,
                fontWeight: 700,
                color: '#111',
                whiteSpace: 'normal',
                overflow: 'visible',
              }}
            >
              {title}
            </Title>
          )}
          {description && (
            <Text style={{ color: '#8c8c8c', fontSize: 13, marginTop: 4, display: 'block' }}>
              {description}
            </Text>
          )}
        </div>
      )}

      {/* ══ 2. Filter + Add button ══ */}
      {(filterSlot || crudHandlers?.onAdd) && (
        <div className='app-table-toolbar'>
          <div className='app-table-toolbar-filter'>{filterSlot}</div>
          {crudHandlers?.onAdd && (
            <div className='app-table-toolbar-add'>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={crudHandlers.onAdd}
                style={{ borderRadius: 8, fontWeight: 500, height: 36, paddingInline: 20 }}
              >
                Qo'shish
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ══ 3. Mobile: cards | Desktop: grid table ══ */}
      {isMobile ? (
        <>
          <MobileCardList<T>
            dataSource={dataSource}
            columns={columns}
            rowKey={rowKey}
            loading={loading}
            crudHandlers={crudHandlers}
            hideActionsColumn={hideActionsColumn}
            emptyText={resolveEmptyText(emptyText, title)}
          />
          {/* Mobile pagination */}
          {resolvedPagination !== false && (
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Pagination
                simple
                current={(resolvedPagination as TablePaginationConfig).current}
                pageSize={(resolvedPagination as TablePaginationConfig).pageSize}
                total={(resolvedPagination as TablePaginationConfig).total}
                onChange={(page, pageSize) =>
                  onChange?.(
                    { ...(resolvedPagination as TablePaginationConfig), current: page, pageSize },
                    {},
                    [],
                  )
                }
              />
              {(resolvedPagination as TablePaginationConfig).showTotal && (
                <div style={{ textAlign: 'center' }}>
                  {(resolvedPagination as TablePaginationConfig).showTotal!(
                    (resolvedPagination as TablePaginationConfig).total ?? 0,
                    [0, 0],
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <Table<T>
          dataSource={dataSource}
          columns={finalColumns}
          rowKey={rowKey as string | ((record: T) => string)}
          loading={loading}
          pagination={resolvedPagination}
          scroll={{ y: scrollY }}
          rowSelection={rowSelection}
          size={size}
          onChange={onChange}
          locale={{ emptyText: finalEmptyText }}
          className={`app-table-grid${className ? ` ${className}` : ''}`}
          onRow={onRow}
          bordered={false}
          style={{ borderRadius: 10, overflow: 'hidden' }}
        />
      )}
    </div>
  );
}

export default AppTable;
