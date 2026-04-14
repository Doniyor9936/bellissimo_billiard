import { SearchOutlined } from "@ant-design/icons";
import { DatePicker, Input, Select } from "antd";
import type { Dayjs } from "dayjs";
import type React from "react";

const { RangePicker } = DatePicker;

// ─── Filter field types ───────────────────────────────────────────────────────

export interface DateRangeFilter {
	type: "daterange";
	key: string;
	label: string;
	icon?: React.ReactNode;
	placeholder?: [string, string];
}

export interface SelectFilter {
	type: "select";
	key: string;
	label: string;
	icon?: React.ReactNode;
	options: { label: string; value: string | number }[];
	placeholder?: string;
	mode?: "multiple" | "tags";
}

export interface SearchFilter {
	type: "search";
	key: string;
	label: string;
	icon?: React.ReactNode;
	placeholder?: string;
}

export type FilterField = DateRangeFilter | SelectFilter | SearchFilter;

// ─── Filter values map ────────────────────────────────────────────────────────

export type FilterValues = Record<string, unknown>;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AppTableFilterProps {
	fields: FilterField[];
	values: FilterValues;
	onChange: (key: string, value: unknown) => void;
}

// ─── AppTableFilter ───────────────────────────────────────────────────────────

const AppTableFilter: React.FC<AppTableFilterProps> = ({ fields, values, onChange }) => {
	if (!fields.length) {
		return null;
	}

	return (
		<>
			<style>{`
        .app-filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
          width: 100%;
        }

        @media (max-width: 576px) {
          .app-filter-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }
        }

        @media (min-width: 577px) and (max-width: 768px) {
          .app-filter-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 769px) and (max-width: 1200px) {
          .app-filter-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1201px) {
          .app-filter-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          }
        }

        .app-filter-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .app-filter-item .ant-picker,
        .app-filter-item .ant-select,
        .app-filter-item .ant-input-affix-wrapper {
          width: 100% !important;
        }
      `}</style>

			<div className="app-filter-grid">
				{fields.map((field) => (
					<div key={field.key} className="app-filter-item">
						{/* Fix 1: label → htmlFor bilan input id ga bog'landi */}
						<label
							htmlFor={`filter-${field.key}`}
							style={{
								fontSize: 13,
								fontWeight: 500,
								color: "#1677ff",
								display: "flex",
								alignItems: "center",
								gap: 6,
							}}
						>
							{field.icon}
							{field.label}
							<span style={{ color: "#ff4d4f" }}>*</span>
						</label>

						{/* Input */}
						{field.type === "daterange" && (
							<RangePicker
								id={`filter-${field.key}`}
								value={(values[field.key] as [Dayjs, Dayjs] | null) ?? null}
								onChange={(dates) => onChange(field.key, dates)}
								placeholder={field.placeholder ?? ["Boshlanish", "Tugash"]}
								format="DD.MM.YYYY"
								style={{ width: "100%", borderRadius: 8 }}
								allowClear
							/>
						)}

						{field.type === "select" && (
							<Select
								id={`filter-${field.key}`}
								value={values[field.key] as string | string[] | undefined}
								onChange={(val) => onChange(field.key, val)}
								options={field.options}
								placeholder={field.placeholder ?? "Tanlang"}
								mode={field.mode}
								allowClear
								style={{ width: "100%", borderRadius: 8 }}
								suffixIcon={
									/* Fix 2: SVG ga role + aria-label qo'shildi */
									<svg
										width="14"
										height="14"
										viewBox="0 0 14 14"
										fill="none"
										role="img"
										aria-label="Dropdown arrow"
									>
										<title>Dropdown arrow</title>
										<path
											d="M3 5l4 4 4-4"
											stroke="#bfbfbf"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								}
							/>
						)}

						{field.type === "search" && (
							<Input
								id={`filter-${field.key}`}
								value={values[field.key] as string | undefined}
								onChange={(e) => onChange(field.key, e.target.value)}
								placeholder={field.placeholder ?? "Qidirish..."}
								prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
								allowClear
								style={{ borderRadius: 8 }}
							/>
						)}
					</div>
				))}
			</div>
		</>
	);
};

export default AppTableFilter;
