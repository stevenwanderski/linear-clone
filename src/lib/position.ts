// The sort_order for a card dropped between two neighbours in a column (either may be missing at the ends).
// shortcut: each drop into the same gap halves it; after ~50 drops there the numbers collide. Renumber the column if that happens.
export function positionBetween(before?: number, after?: number) {
  if (before !== undefined && after !== undefined) return (before + after) / 2;
  if (before !== undefined) return before + 1;
  if (after !== undefined) return after - 1;
  return 0;
}
