// A small coloured square with the project key's first letter. The hue comes from the key, so each project keeps its colour.
export function ProjectBadge({ projectKey }: { projectKey: string }) {
  const hue = [...projectKey].reduce((sum, ch) => sum + ch.charCodeAt(0) * 37, 0) % 360;
  return (
    <span
      aria-hidden="true"
      className="grid size-4 shrink-0 place-items-center rounded text-[9px] font-semibold text-white"
      style={{ background: `oklch(0.62 0.15 ${hue})` }}
    >
      {projectKey.charAt(0)}
    </span>
  );
}
