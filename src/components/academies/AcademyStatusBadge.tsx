import type { AcademyStatus } from "../../types/finance";

interface AcademyStatusBadgeProps {
  status: AcademyStatus;
}

const statusConfig: Record<
  AcademyStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700",
  },
  expired: {
    label: "Expired",
    className: "bg-rose-50 text-rose-700",
  },
  suspended: {
    label: "Suspended",
    className: "bg-amber-50 text-amber-700",
  },
};

export function AcademyStatusBadge({
  status,
}: AcademyStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
