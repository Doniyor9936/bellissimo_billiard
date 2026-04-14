import { SearchOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import AppTableFilter, {
	type FilterField,
} from "@/shared/components/table/components/AppTableFilter";
import useTableCRUD from "@/shared/components/table/hooks/useTableCRUD";
import AppTable from "@/shared/components/table/pages/appTable";
import OrganizationFormModal from "../components/organizationFormModal";
import { useOrganizations } from "../hooks/useOrganizations";
import { useOrganizationsCRUD } from "../hooks/useOrganizationsCRUD";
import type {
	CreateOrganizationRequest,
	Organization,
	UpdateOrganizationRequest,
} from "../types/types";

const TABLE_GRID_COLS = "56px 1fr 1fr 56px";

const columns: ColumnsType<Organization> = [
	{
		title: "#",
		key: "index",
		align: "center",
		render: (_, __, i) => <span style={{ color: "#8c8c8c", fontSize: 13 }}>{i + 1}</span>,
	},
	{
		title: "Nomi",
		dataIndex: "name",
		key: "name",
		render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
	},
	{
		title: "Yaratilgan sana",
		dataIndex: "createdAt",
		key: "createdAt",
		render: (ts: string) => <Tag color="blue">{dayjs(ts).format("DD.MM.YYYY")}</Tag>,
	},
];

const filterFields: FilterField[] = [
	{
		type: "search",
		key: "search",
		label: "Qidirish",
		icon: <SearchOutlined />,
		placeholder: "Nomi bo'yicha...",
	},
];

export default function OrganizationsPage() {
	const { data, pagination, loading, params, setParam, setPage, setPerPage, refresh } =
		useOrganizations();

	const crudActions = useOrganizationsCRUD(refresh);

	const crud = useTableCRUD<Organization>();

	const handleTableChange = (pag: TablePaginationConfig) => {
		if (pag.current) {
			setPage(pag.current);
		}
		if (pag.pageSize) {
			setPerPage(pag.pageSize);
		}
	};

	const handleSubmit = async (values: CreateOrganizationRequest | UpdateOrganizationRequest) => {
		if (crud.modalMode === "add") {
			await crudActions.create(values as CreateOrganizationRequest);
		} else if (crud.selectedRecord) {
			await crudActions.update(crud.selectedRecord.id, values as UpdateOrganizationRequest);
		}
		crud.closeModal();
	};

	return (
		<div>
			<div
				style={{
					background: "#fff",
					borderRadius: 16,
					boxShadow: "0 1px 4px rgba(0,0,0,.06)",
				}}
			>
				<style>{`
          .organizations-table { --app-table-cols: ${TABLE_GRID_COLS}; }
          @media (max-width: 767px) {
            .organizations-page-card { padding: 16px 12px !important; border-radius: 12px !important; }
          }
        `}</style>

				<AppTable<Organization>
					title="Tashkilotlar"
					description="Tizimda ro'yxatdan o'tgan barcha tashkilotlar"
					dataSource={data}
					columns={columns}
					rowKey="id"
					loading={loading}
					total={pagination.totalItems}
					className="organizations-table"
					pagination={{
						current: pagination.currentPage,
						pageSize: pagination.perPage,
						total: pagination.totalItems,
						showSizeChanger: true,
						pageSizeOptions: ["10", "20", "50", "100"],
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

				<OrganizationFormModal
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
