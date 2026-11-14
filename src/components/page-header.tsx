// The slim bar across the top of each page: a title on the left, actions on the right.
export function PageHeader({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b px-6">
      <div className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium">{title}</div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
