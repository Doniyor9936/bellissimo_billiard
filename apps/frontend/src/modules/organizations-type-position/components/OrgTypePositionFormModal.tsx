import { Form, Input, Modal, Select } from "antd";
import type { ModalMode } from "@/shared/components/table/hooks/useTableCRUD";
import type {
	CreateOrgTypePositionRequest,
	OrganizationTypePosition,
	UpdateOrgTypePositionRequest,
} from "../types/types";

interface OrgTypePositionFormModalProps {
	open: boolean;
	mode: ModalMode;
	initialValues?: Partial<OrganizationTypePosition>;
	/** Tashkilot turlari — typeId select uchun, ota komponentdan uzatiladi */
	typeOptions: { label: string; value: string }[];
	onSubmit: (values: CreateOrgTypePositionRequest | UpdateOrgTypePositionRequest) => void;
	onCancel: () => void;
	loading?: boolean;
}

export default function OrgTypePositionFormModal({
	open,
	mode,
	initialValues,
	typeOptions,
	onSubmit,
	onCancel,
	loading,
}: OrgTypePositionFormModalProps) {
	const [form] = Form.useForm();

	return (
		<Modal
			open={open}
			title={mode === "add" ? "Yangi positsiya qo'shish" : "Positsiyani tahrirlash"}
			okText={mode === "add" ? "Qo'shish" : "Saqlash"}
			cancelText="Bekor qilish"
			onOk={async () => onSubmit(await form.validateFields())}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnClose
			afterOpenChange={(o) => {
				if (o) {
					form.setFieldsValue(
						initialValues ? { name: initialValues.name } : { name: "", typeId: undefined }
					);
				}
			}}
		>
			<Form form={form} layout="vertical" style={{ marginTop: 12 }}>
				<Form.Item
					name="name"
					label="Positsiya nomi"
					rules={[
						{ required: true, message: "Nomini kiriting!" },
						{ min: 1, max: 255, message: "1–255 ta belgi!" },
					]}
				>
					<Input placeholder="O'qituvchi" size="large" allowClear />
				</Form.Item>

				{/* typeId faqat add modeda */}
				{mode === "add" && (
					<Form.Item
						name="typeId"
						label="Tashkilot turi"
						rules={[{ required: true, message: "Tashkilot turini tanlang!" }]}
					>
						<Select
							size="large"
							placeholder="Tanlang"
							options={typeOptions}
							showSearch
							filterOption={(input, option) =>
								(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
							}
						/>
					</Form.Item>
				)}
			</Form>
		</Modal>
	);
}
