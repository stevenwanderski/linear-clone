import { BoxIcon } from "lucide-react";
import { projectColors, type ProjectColor } from "@/lib/labels";

const names = Object.keys(projectColors) as ProjectColor[];

// A cube in the project's color. Projects that never picked one get a color from their key, so it stays the same.
export function ProjectBadge({ projectKey, color }: { projectKey: string; color?: string | null }) {
  const fallback = names[[...projectKey].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % names.length];
  const hex = projectColors[(color as ProjectColor) ?? fallback] ?? projectColors[fallback];
  return <BoxIcon aria-hidden="true" className="size-4 shrink-0" style={{ color: hex }} />;
}
