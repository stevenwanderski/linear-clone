// The Linear Lite mark: six rounded diagonal strokes that stop short of a circle's edge, so together they
// read as a circle. One color (currentColor), so it follows the text color in light and dark mode.
const R = 14; // radius of the circle the strokes fit inside
const strokes = Array.from({ length: 6 }, (_, i) => {
  const offset = (i - 2.5) * 4.9; // distance of this stroke from the centre line
  return { x: 16 + offset, half: Math.sqrt(R * R - offset * offset) };
});

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g transform="rotate(45 16 16)" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        {strokes.map(({ x, half }) => (
          <line key={x} x1={x} y1={16 - half} x2={x} y2={16 + half} />
        ))}
      </g>
    </svg>
  );
}
