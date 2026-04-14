import { SearchOutlined } from "@ant-design/icons";
import { message, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { organizationsService } from "@/modules/organizations/services/organizationsService";
import AppTableFilter, {
	type FilterField,
} from "@/shared/components/table/components/AppTableFilter";
import useTableCRUD from "@/shared/components/table/hooks/useTableCRUD";
import AppTable from "@/shared/components/table/pages/appTable";
import CrossAccessFormModal from "../components/CrossAccessFormModal";
import { useOrganizationCrossAccess } from "../hooks/useOrganizationCrossAccess";
import { useOrganizationCrossAccessCRUD } from "../hooks/useOrganizationCrossAccessCRUD";
import type {
	AccessType,
	CreateCrossAccessRequest,
	OrganizationCrossAccess,
	UpdateCrossAccessRequest,
} from "../types/types";

const TABLE_GRID_COLS = "56px 2fr 2fr 1fr 1fr 1fr 56px";

const columns: ColumnsType<OrganizationCrossAccess> = [
	{
		title: "#",
		key: "index",
		align: "center",
		render: (_, __, i) => <span style={{ color: "#8c8c8c", fontSize: 13 }}>{i + 1}</span>,
	},
	{
		title: "Viewer (Ko'ruvchi)",
		key: "viewer",
		render: (_, record) => <span style={{ fontWeight: 500 }}>{record.viewer.name}</span>,
	},
	{
		title: "Target (Maqsad)",
		key: "target",
		render: (_, record) => <span style={{ fontWeight: 500 }}>{record.target.name}</span>,
	},
	{
		title: "Kirish turi",
		dataIndex: "accessType",
		key: "accessType",
		align: "center",
		render: (type: AccessType) =>
			type === "WRITE" ? <Tag color="orange">WRITE</Tag> : <Tag color="blue">READ</Tag>,
	},
	{
		title: "Holat",
		dataIndex: "isDeleted",
		key: "isDeleted",
		align: "center",
		render: (isDeleted: boolean) =>
			isDeleted ? <Tag color="red">O'chirilgan</Tag> : <Tag color="green">Faol</Tag>,
	},
	{
		title: "Yaratilgan sana",
		dataIndex: "createdAt",
		key: "createdAt",
		render: (ts: string) => (
			<span style={{ color: "#8c8c8c", fontSize: 13 }}>{dayjs(ts).format("DD.MM.YYYY")}</span>
		),
	},
];

const filterFields: FilterField[] = [
	{
		type: "search",
		key: "search",
		label: "Qidirish",
		icon: <SearchOutlined />,
		placeholder: "Ism, familiya yoki email...",
	},
	{
		type: "select",
		key: "isActive",
		label: "Holat",
		placeholder: "Barchasi",
		options: [
			{ label: "Faol", value: "true" },
			{ label: "Faol emas", value: "false" },
		],
	},
];

export default function OrganizationCrossAccessPage() {
	const { data, pagination, loading, params, setParam, setPage, setPerPage, refresh } =
		useOrganizationCrossAccess();

	const crudActions = useOrganizationCrossAccessCRUD(refresh);

	const crud = useTableCRUD<OrganizationCrossAccess>();

	const [orgOptions, setOrgOptions] = useState<{ label: string; value: string }[]>([]);

	useEffect(() => {
		organizationsService
			.getAll({ page: 1, limit: 100 })
			.then((res) => setOrgOptions(res.items.map((org) => ({ label: org.name, value: org.id }))))
			.catch(() => {
				message.error("Ma'lumotlarni yuklashda xatolik");
			});
	}, []);

	const handleTableChange = (pag: TablePaginationConfig) => {
		if (pag.current) {
			setPage(pag.current);
		}
		if (pag.pageSize) {
			setPerPage(pag.pageSize);
		}
	};

	const handleSubmit = async (values: CreateCrossAccessRequest | UpdateCrossAccessRequest) => {
		if (crud.modalMode === "add") {
			await crudActions.create(values as CreateCrossAccessRequest);
		} else if (crud.selectedRecord) {
			await crudActions.update(crud.selectedRecord.id, values as UpdateCrossAccessRequest);
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
          .cross-access-table { --app-table-cols: ${TABLE_GRID_COLS}; }
          @media (max-width: 767px) {
            .cross-access-page-card { padding: 16px 12px !important; border-radius: 12px !important; }
          }
        `}</style>

				<AppTable<OrganizationCrossAccess>
					title="Tashkilotlararo kirish huquqlari"
					description="Tashkilotlar o'rtasidagi kirish huquqlari ro'yxati"
					dataSource={data}
					columns={columns}
					rowKey="id"
					loading={loading}
					total={pagination.totalItems}
					className="cross-access-table"
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
							values={{ search: params.search, isActive: params.isActive }}
							onChange={(key, value) =>
								setParam(key as keyof typeof params, value as string | number | undefined)
							}
						/>
					}
				/>

				<CrossAccessFormModal
					open={crud.modalMode !== null}
					mode={crud.modalMode}
					initialValues={crud.selectedRecord ?? undefined}
					orgOptions={orgOptions}
					onSubmit={handleSubmit}
					onCancel={crud.closeModal}
					loading={crudActions.submitting}
				/>
			</div>
		</div>
	);
}
