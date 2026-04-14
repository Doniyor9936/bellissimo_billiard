import { Modal, Form, Input, Switch } from 'antd';
import { UserOutlined, PhoneOutlined } from '@ant-design/icons';
import type { ModalMode } from '@/shared/components/table/hooks/useTableCRUD';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/types';

interface UserFormModalProps {
  open: boolean;
  mode: ModalMode;
  initialValues?: Partial<User>;
  onSubmit: (values: CreateUserRequest | UpdateUserRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function UserFormModal({
  open,
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: UserFormModalProps) {
  const [form] = Form.useForm();

  return (
    <Modal
      open={open}
      title={mode === 'add' ? "Yangi foydalanuvchi qo'shish" : 'Tahrirlash'}
      okText={mode === 'add' ? "Qo'shish" : 'Saqlash'}
      cancelText='Bekor qilish'
      onOk={async () => onSubmit(await form.validateFields())}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
      afterOpenChange={(o) => {
        if (o) {
          form.setFieldsValue(
            initialValues
              ? {
                  fullname: initialValues.fullname,
                  phone: initialValues.phone,
                  isActive: initialValues.isActive ?? true,
                }
              : { fullname: '', phone: '', isActive: true },
          );
        }
      }}
    >
      <Form form={form} layout='vertical' style={{ marginTop: 12 }}>
        <Form.Item
          name='fullname'
          label="To'liq ism"
          rules={[{ required: true, message: 'Ism kiriting!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder='Abdullayev Sardor' size='large' />
        </Form.Item>

        <Form.Item
          name='phone'
          label='Telefon raqam'
          rules={[
            { required: true, message: 'Telefon kiriting!' },
            { pattern: /^\+998\d{9}$/, message: 'Format: +998XXXXXXXXX' },
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder='+998901234567' size='large' />
        </Form.Item>

        {mode === 'add' && (
          <Form.Item
            name='password'
            label='Parol'
            rules={[
              { required: true, message: 'Parol kiriting!' },
              { min: 6, message: 'Kamida 6 ta belgi!' },
            ]}
          >
            <Input.Password placeholder='••••••••' size='large' />
          </Form.Item>
        )}

        <Form.Item name='isActive' label='Holat' valuePropName='checked'>
          <Switch checkedChildren='Faol' unCheckedChildren='Faol emas' />
        </Form.Item>
      </Form>
    </Modal>
  );
}
