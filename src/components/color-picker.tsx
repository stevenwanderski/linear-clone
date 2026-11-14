import { projectColors } from "@/lib/labels";

// A row of color swatches for a form, submitted as `color`. Each swatch is a real radio, so keyboard and screen readers work.
export function ColorPicker({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">Color</legend>
      <div className="flex flex-wrap gap-2">
        {Object.entries(projectColors).map(([name, hex]) => (
          <label key={name} className="relative">
            <input
              type="radio"
              name="color"
              value={name}
              defaultChecked={defaultValue === name}
              aria-label={name}
              className="peer sr-only"
            />
            <span
              className="block size-6 cursor-pointer rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
              style={{ background: hex }}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
