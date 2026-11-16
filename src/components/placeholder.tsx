// The empty-screen layout used across the app: an icon, a heading, a sentence, then an optional
// action and footnote. Keeps every "nothing here yet" screen looking the same.
export function Placeholder({
  icon,
  title,
  children,
  action,
  footnote,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="text-muted-foreground [&_svg]:size-10">{icon}</div>
      <h2 className="mt-6 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-[13px] text-muted-foreground">{children}</p>
      {action && <div className="mt-6">{action}</div>}
      {footnote && <p className="mt-8 text-[13px] text-muted-foreground">{footnote}</p>}
    </div>
  );
}
