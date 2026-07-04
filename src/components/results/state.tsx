import { cn } from "@/lib/utils";
import { Inbox, SearchX, AlertCircle, CheckCircle2 } from "lucide-react";

type StateProps = {
  title?: string;
  description?: string;
  className?: string;
};

function StateBase({
  icon: Icon,
  iconClassName,
  title,
  description,
  className,
  children,
}: StateProps & {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--jd-border)] px-6 py-12 text-center",
        className,
      )}
    >
      <Icon className={cn("mb-4 h-12 w-12", iconClassName ?? "text-[var(--jd-muted)]")} />
      <h3 className="text-lg font-semibold text-[var(--jd-text)]">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-[var(--jd-muted)]">{description}</p>}
      {children}
    </div>
  );
}

export function EmptyState({ title = "No URLs yet", description, className }: StateProps) {
  return (
    <StateBase
      icon={Inbox}
      title={title}
      description={description ?? "Enter URLs above or upload a CSV/TXT file to get started."}
      className={className}
    />
  );
}

export function NoResultsState({ title = "No results", description, className }: StateProps) {
  return (
    <StateBase
      icon={SearchX}
      title={title}
      description={description ?? "Run a scan to see results here."}
      className={className}
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  className,
  children,
}: StateProps & { children?: React.ReactNode }) {
  return (
    <StateBase
      icon={AlertCircle}
      iconClassName="text-red-500"
      title={title}
      description={description}
      className={className}
    >
      {children}
    </StateBase>
  );
}

export function SuccessState({ title = "Complete", description, className }: StateProps) {
  return (
    <StateBase
      icon={CheckCircle2}
      iconClassName="text-green-500"
      title={title}
      description={description}
      className={className}
    />
  );
}
