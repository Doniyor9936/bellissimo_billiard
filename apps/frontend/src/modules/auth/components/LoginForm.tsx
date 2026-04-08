import { LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography } from "antd";
import { useLogin } from "../hooks/useAuth";
import type { LoginRequest } from "../types";

const { Title, Text } = Typography;

export function LoginForm() {
	const [form] = Form.useForm<LoginRequest>();
	const { mutate: login, isPending } = useLogin();

	const onFinish = (values: LoginRequest) => {
		login(values);
	};

	return (
		<Card className="w-full max-w-md shadow-lg">
			<div className="text-center mb-8">
				<Title level={2} className="!mb-2">
					My App
				</Title>
				<Text type="secondary">Sign in to your account</Text>
			</div>

			<Form
				form={form}
				name="login"
				onFinish={onFinish}
				layout="vertical"
				requiredMark={false}
				size="large"
			>
				<Form.Item
					name="phone"
					label="Phone number"
					rules={[
						{ required: true, message: "Please enter your phone number" },
						{
							pattern: /^\+998\d{9}$/,
							message: "Format: +998901234567",
						},
					]}
				>
					<Input
						prefix={<PhoneOutlined className="text-gray-400" />}
						placeholder="+998901234567"
						autoComplete="tel"
					/>
				</Form.Item>

				<Form.Item
					name="password"
					label="Password"
					rules={[
						{ required: true, message: "Please enter your password" },
						{ min: 6, message: "Password must be at least 6 characters" },
					]}
				>
					<Input.Password
						prefix={<LockOutlined className="text-gray-400" />}
						placeholder="Password"
						autoComplete="current-password"
					/>
				</Form.Item>

				<Form.Item className="!mb-0">
					<Button type="primary" htmlType="submit" loading={isPending} block>
						Sign in
					</Button>
				</Form.Item>
			</Form>
		</Card>
	);
}
