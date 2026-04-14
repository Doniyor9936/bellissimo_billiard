import { Form, Modal, Select } from "antd";
import type { ModalMode } from "@/shared/components/table/hooks/useTableCRUD";
import type {
	AccessType,
	CreateCrossAccessRequest,
	OrganizationCrossAccess,
	UpdateCrossAccessRequest,
} from "../types/types";

const ACCESS_TYPE_OPTIONS = [
	{ label: "READ — faqat o'qish", value: "READ" },
	{ label: "WRITE — yozish", value: "WRITE" },
];

interface CrossAccessFormModalProps {
	open: boolean;
	mode: ModalMode;
	initialValues?: Partial<OrganizationCrossAccess>;
	orgOptions: { label: string; value: string }[];
	onSubmit: (values: CreateCrossAccessRequest | UpdateCrossAccessRequest) => void;
	onCancel: () => void;
	loading?: boolean;
}

export default function CrossAccessFormModal({
	open,
	mode,
	initialValues,
	orgOptions,
	onSubmit,
	onCancel,
	loading,
}: CrossAccessFormModalProps) {
	const [form] = Form.useForm();

	return (
		<Modal
			open={open}
			title={mode === "add" ? "Yangi kirish huquqi qo'shish" : "Kirish huquqini tahrirlash"}
			okText={mode === "add" ? "Qo'shish" : "Saqlash"}
			cancelText="Bekor qilish"
			onOk={async () => onSubmit(await form.validateFields())}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnClose
			afterOpenChange={(o) => {
				if (o) {
					form.setFieldsValue(
						initialValues
							? {
									viewerId: initialValues.viewer?.id,
									targetId: initialValues.target?.id,
									accessType: initialValues.accessType,
								}
							: { viewerId: undefined, targetId: undefined, accessType: "READ" }
					);
				}
			}}
		>
			<Form form={form} layout="vertical" style={{ marginTop: 12 }}>
				<Form.Item
					name="viewerId"
					label="Ko'ruvchi tashkilot (Viewer)"
					rules={[{ required: true, message: "Tashkilotni tanlang!" }]}
				>
					<Select
						size="large"
						placeholder="Tanlang"
						options={orgOptions}
						showSearch
						filterOption={(input, option) =>
							(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
						}
					/>
				</Form.Item>

				<Form.Item
					name="targetId"
					label="Maqsadli tashkilot (Target)"
					rules={[{ required: true, message: "Tashkilotni tanlang!" }]}
				>
					<Select
						size="large"
						placeholder="Tanlang"
						options={orgOptions}
						showSearch
						filterOption={(input, option) =>
							(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
						}
					/>
				</Form.Item>

				<Form.Item
					name="accessType"
					label="Kirish turi"
					rules={[{ required: true, message: "Kirish turini tanlang!" }]}
				>
					<Select<AccessType> size="large" placeholder="Tanlang" options={ACCESS_TYPE_OPTIONS} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
