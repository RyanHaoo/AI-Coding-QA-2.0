import Link from "next/link";
import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildAdminTicketClearFiltersHref,
  defaultAdminTicketFilters,
} from "@/lib/tickets/query-params";
import type { AdminTicketFilters as AdminTicketFilterValues } from "@/lib/tickets/types";
import {
  adminTicketSeverityFilterLabels,
  adminTicketSpecialtyFilterLabels,
  adminTicketStatusFilterLabels,
} from "@/lib/tickets/types";

type AdminTicketFiltersProps = {
  filters: AdminTicketFilterValues;
};

export function AdminTicketFilters({ filters }: AdminTicketFiltersProps) {
  return (
    <form
      action="/"
      className="grid gap-4 border border-slate-200 bg-white p-4"
      method="get"
    >
      <input name="view" type="hidden" value="admin-tickets" />

      <div className="grid gap-3 md:grid-cols-3">
        <FilterSelect
          label="状态"
          name="adminStatus"
          options={adminTicketStatusFilterLabels}
          value={filters.status}
        />
        <FilterSelect
          label="严重程度"
          name="adminSeverity"
          options={adminTicketSeverityFilterLabels}
          value={filters.severity}
        />
        <FilterSelect
          label="专业类型"
          name="adminSpecialty"
          options={adminTicketSpecialtyFilterLabels}
          value={filters.specialty}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <FilterTextInput
          defaultValue={filters.keyword}
          label="关键词"
          name="adminKeyword"
          placeholder="问题、位置或详情"
        />
        <FilterTextInput
          defaultValue={filters.ticketNumber}
          label="工单编号"
          name="adminTicketNumber"
          placeholder="例如 WO-2026-0004"
        />
        <div className="flex gap-2">
          <Button type="submit">
            <Search className="size-4" />
            筛选
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href={buildAdminTicketClearFiltersHref()}>
              <RotateCcw className="size-4" />
              清空
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
}

function FilterSelect<T extends string>({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: Record<T, string>;
  value: T;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        className="h-9 border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-[#005ac2]"
        defaultValue={value}
        name={name}
      >
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel as string}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterTextInput({
  defaultValue,
  label,
  name,
  placeholder,
}: {
  defaultValue: string;
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="h-9 border border-slate-200 bg-white px-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#005ac2]"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        type="search"
      />
    </label>
  );
}

export function hasActiveAdminFilters(filters: AdminTicketFilterValues) {
  return (
    filters.status !== defaultAdminTicketFilters.status ||
    filters.severity !== defaultAdminTicketFilters.severity ||
    filters.specialty !== defaultAdminTicketFilters.specialty ||
    filters.keyword !== defaultAdminTicketFilters.keyword ||
    filters.ticketNumber !== defaultAdminTicketFilters.ticketNumber
  );
}
