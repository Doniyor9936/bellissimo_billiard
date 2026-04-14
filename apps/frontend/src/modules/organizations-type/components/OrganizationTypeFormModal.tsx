import { Form, Input, Modal } from "antd";
import type { ModalMode } from "@/shared/components/table/hooks/useTableCRUD";
import type {
	CreateOrganizationTypeRequest,
	OrganizationType,
	UpdateOrganizationTypeRequest,
} from "../types/types";

interface OrganizationTypeFormModalProps {
	open: boolean;
	mode: ModalMode;
	initialValues?: Partial<OrganizationType>;
	typeOptions?: { label: string; value: string }[];
	onSubmit: (values: CreateOrganizationTypeRequest | UpdateOrganizationTypeRequest) => void;
	onCancel: () => void;
	loading?: boolean;
}

export default function OrganizationTypeFormModal({
	open,
	mode,
	initialValues,
	onSubmit,
	onCancel,
	loading,
}: OrganizationTypeFormModalProps) {
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
					label="Nomi"
					rules={[
						{ required: true, message: "Nomini kiriting!" },
						{ min: 1, max: 255, message: "1–255 ta belgi!" },
					]}
				>
					<Input placeholder="O'qituvchi" size="large" />
				</Form.Item>
			</Form>
		</Modal>
	);
}
