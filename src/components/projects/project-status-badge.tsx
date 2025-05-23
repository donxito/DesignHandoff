import { Badge } from "@/components/retroui/Badge";
import { ProjectStatus } from "@/lib/types/project";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

// * Status configuration with colors and labels
const statusConfig: Record<
  ProjectStatus,
  {
    label: string;
    variant:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "danger";
    icon?: string;
  }
> = {
  active: {
    label: "Active",
    variant: "success",
    icon: "●",
  },
  on_hold: {
    label: "On Hold",
    variant: "warning",
    icon: "⏸",
  },
  archived: {
    label: "Archived",
    variant: "secondary",
    icon: "📦",
  },
  completed: {
    label: "Completed",
    variant: "primary",
    icon: "✓",
  },
};

export default function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.active;

  return (
    <Badge variant={config.variant} className={className} size="sm">
      <span className="flex items-center gap-1">
        {config.icon && (
          <span className="text-xs" role="img" aria-label={config.label}>
            {config.icon}
          </span>
        )}
        {config.label}
      </span>
    </Badge>
  );
}

// * helper functuion to get status options for dropdowns or forms
export const getStatusOptions = (): Array<{
  value: ProjectStatus;
  label: string;
}> => {
  return Object.entries(statusConfig).map(([value, config]) => ({
    value: value as ProjectStatus,
    label: config.label,
  }));
};
