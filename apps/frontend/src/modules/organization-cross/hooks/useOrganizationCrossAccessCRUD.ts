import { message } from "antd";
import { useCallback, useState } from "react";
import { organizationCrossAccessService } from "../services/organizationCrossAccessService";
import type {
	CreateCrossAccessRequest,
	OrganizationCrossAccess,
	UpdateCrossAccessRequest,
} from "../types/types";

interface UseOrganizationCrossAccessCRUDReturn {
	submitting: boolean;
	create: (data: CreateCrossAccessRequest) => Promise<void>;
	update: (id: string, data: UpdateCrossAccessRequest) => Promise<void>;
	remove: (record: OrganizationCrossAccess) => Promise<void>;
}

export function useOrganizationCrossAccessCRUD(
	onSuccess: () => void
): UseOrganizationCrossAccessCRUDReturn {
	const [submitting, setSubmitting] = useState(false);

	const create = useCallback(
		async (data: CreateCrossAccessRequest) => {
			setSubmitting(true);
			try {
				await organizationCrossAccessService.create(data);
				message.success("Kirish huquqi qo'shildi");
				onSuccess();
			} catch (err: unknown) {
				message.error(err instanceof Error ? err.message : "Xato yuz berdi");
				throw err;
			} finally {
				setSubmitting(false);
			}
		},
		[onSuccess]
	);

	const update = useCallback(
		async (id: string, data: UpdateCrossAccessRequest) => {
			setSubmitting(true);
			try {
				await organizationCrossAccessService.update(id, data);
				message.success("Kirish huquqi yangilandi");
				onSuccess();
			} catch (err: unknown) {
				message.error(err instanceof Error ? err.message : "Xato yuz berdi");
				throw err;
			} finally {
				setSubmitting(false);
			}
		},
		[onSuccess]
	);

	const remove = useCallback(
		async (record: OrganizationCrossAccess) => {
			try {
				await organizationCrossAccessService.remove(record.id);
				message.success("Kirish huquqi o'chirildi");
				onSuccess();
			} catch (err: unknown) {
				message.error(err instanceof Error ? err.message : "Xato yuz berdi");
			}
		},
		[onSuccess]
	);

	return { submitting, create, update, remove };
}
