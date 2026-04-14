import { Modal, Form, Input } from 'antd';
import type { ModalMode } from '@/shared/components/table/hooks/useTableCRUD';
import type { Organization, CreateOrganizationRequest, UpdateOrganizationRequest } from '../types/types';

interface OrganizationFormModalProps {
  open: boolean;
  mode: ModalMode;
  initialValues?: Partial<Organization>;
  onSubmit: (values: CreateOrganizationRequest | UpdateOrganizationRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function OrganizationFormModal({
  open,
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: OrganizationFormModalProps) {
  const [form] = Form.useForm();

  return (
    <Modal
      open={open}
      title={mode === 'add' ? "Yangi tashkilot qo'shish" : 'Tashkilotni tahrirlash'}
      okText={mode === 'add' ? "Qo'shish" : 'Saqlash'}
      cancelText='Bekor qilish'
      onOk={async () => onSubmit(await form.validateFields())}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
      afterOpenChange={(o) => {
        if (o) {
          form.setFieldsValue(initialValues ? { name: initialValues.name } : { name: '' });
        }
      }}
    >
      <Form form={form} layout='vertical' style={{ marginTop: 12 }}>
        <Form.Item
          name='name'
          label='Tashkilot nomi'
          rules={[
            { required: true, message: 'Nomini kiriting!' },
            { min: 1, max: 255, message: '1–255 ta belgi!' },
          ]}
        >
          <Input placeholder='Tashkent Qurilish' size='large' allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
}
