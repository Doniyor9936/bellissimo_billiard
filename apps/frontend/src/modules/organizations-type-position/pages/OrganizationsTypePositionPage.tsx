import { SearchOutlined } from "@ant-design/icons";
import { message, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { organizationsTypeService } from "@/modules/organizations-type/services/organizationsTypeService";
import AppTableFilter, {
	type FilterField,
} from "@/shared/components/table/components/AppTableFilter";
import useTableCRUD from "@/shared/components/table/hooks/useTableCRUD";
import AppTable from "@/shared/components/table/pages/appTable";
import OrgTypePositionFormModal from "../components/OrgTypePositionFormModal";
import { useOrganizationsTypePosition } from "../hooks/useOrganizationsTypePosition";
import { useOrganizationsTypePositionCRUD } from "../hooks/useOrganizationsTypePositionCRUD";
import type {
	CreateOrgTypePositionRequest,
	OrganizationTypePosition,
	UpdateOrgTypePositionRequest,
} from "../types/types";

const TABLE_GRID_COLS = "56px 1fr 1fr 1fr 56px";

const columns: ColumnsType<OrganizationTypePosition> = [
	{
		title: "#",
		key: "index",
		align: "center",
		render: (_, __, i) => <span style={{ color: "#8c8c8c", fontSize: 13 }}>{i + 1}</span>,
	},
	{
		title: "Positsiya nomi",
		dataIndex: "name",
		key: "name",
		render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
	},
	{
		title: "Holat",
		key: "status",
		align: "center",
		render: () => <Tag color="green">Faol</Tag>,
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
		placeholder: "Nomi bo'yicha...",
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

export default function OrganizationsTypePositionPage() {
	const { data, pagination, loading, params, setParam, setPage, setPerPage, refresh } =
		useOrganizationsTypePosition();

	const crudActions = useOrganizationsTypePositionCRUD(refresh);

	const crud = useTableCRUD<OrganizationTypePosition>();

	const [typeOptions, setTypeOptions] = useState<{ label: string; value: string }[]>([]);

	useEffect(() => {
		organizationsTypeService
			.getAll({ page: 1, limit: 100 })
			.then((res) =>
				setTypeOptions(
					res.items.map((t) => ({
						label: t.name,
						value: t.id,
					}))
				)
			)
			.catch(() => {
				message.error("Tashkilot turlari yuklanmadi");
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

	const handleSubmit = async (
		values: CreateOrgTypePositionRequest | UpdateOrgTypePositionRequest
	) => {
		if (crud.modalMode === "add") {
			await crudActions.create(values as CreateOrgTypePositionRequest);
		} else if (crud.selectedRecord) {
			await crudActions.update(crud.selectedRecord.id, values as UpdateOrgTypePositionRequest);
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
          .org-type-pos-table {
            --app-table-cols: ${TABLE_GRID_COLS};
          }

          @media (max-width: 767px) {
            .org-type-pos-page-card {
              padding: 16px 12px !important;
              border-radius: 12px !important;
            }
          }
        `}</style>

				<AppTable<OrganizationTypePosition>
					title="Tashkilot tur positsiyalari"
					description="Barcha tashkilot tur positsiyalari ro'yxati"
					dataSource={data}
					columns={columns}
					rowKey="id"
					loading={loading}
					total={pagination.totalItems}
					className="org-type-pos-table"
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

				<OrgTypePositionFormModal
					open={crud.modalMode !== null}
					mode={crud.modalMode}
					initialValues={crud.selectedRecord ?? undefined}
					typeOptions={typeOptions}
					onSubmit={handleSubmit}
					onCancel={crud.closeModal}
					loading={crudActions.submitting}
				/>
			</div>
		</div>
	);
}
