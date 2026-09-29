// Verified v4 contract: analytics commit 2800b9971ac5bc310f59d804fd0aa0c184f4be19.
// Marginal cell totals only. Outcomes and display destination coordinates are not inputs.
type FlowInput = {
  observed_attempts: number;
  relocation_available: boolean;
  availability_reason: string;
  heatmap_cells: { cell_id: number; observed_attempts: number; supported_destination: boolean }[];
  shots: { x_ft: number; y_ft: number; move_order: number | null }[];
};
export type FlowSlider = {
  requested_share: number;
  actual_relocated_share: number;
  actual_relocated_attempt_equivalents: number;
  destination_allocation: { cell_id: number; added_share: number; final_share: number }[];
};
const requireFlow = (valid: boolean) => {
  if (!valid) throw new Error('Shot movement data does not balance or match the v4 contract');
};
export function relocationFlow(player: FlowInput, slider: FlowSlider) {
  const n = player.observed_attempts;
  const m = slider.actual_relocated_attempt_equivalents;
  const tolerance = 1e-12 * Math.max(1, n);
  requireFlow(Number.isInteger(n) && n > 0 && Number.isFinite(m) && m >= 0 &&
    [0, .05, .1, .15, .2, .25].includes(slider.requested_share) &&
    Number.isFinite(slider.actual_relocated_share) &&
    m <= n * slider.requested_share + tolerance &&
    Math.abs(m - n * slider.actual_relocated_share) <= tolerance &&
    player.heatmap_cells.length === 156 && player.shots.length === n &&
    Array.isArray(slider.destination_allocation));
  const cells = player.heatmap_cells.map((cell, index) => {
    requireFlow(cell.cell_id === index + 1 && Number.isInteger(cell.observed_attempts) &&
      cell.observed_attempts >= 0 && typeof cell.supported_destination === 'boolean');
    return { cell_id: cell.cell_id, removed_attempt_equivalents: 0, added_attempt_equivalents: 0 };
  });
  const orders = new Set<number>();
  for (const shot of player.shots) {
    const { x_ft: x, y_ft: y, move_order: order } = shot;
    requireFlow(Number.isFinite(x) && Number.isFinite(y) && x >= -25 && x <= 25 && y >= -5.25 && y <= 39.75);
    if (order === null) continue;
    requireFlow(Number.isInteger(order) && order > 0 && !orders.has(order));
    orders.add(order);
    const index = Math.min(Math.floor((x + 25) / 4), 12) + 13 * Math.min(Math.floor((y + 5.25) / 4), 11);
    cells[index].removed_attempt_equivalents += Math.min(1, Math.max(0, m - order + 1));
  }
  requireFlow(orders.size === 0 || Math.max(...orders) === orders.size);
  const destinations = new Set<number>();
  for (const allocation of slider.destination_allocation) {
    const index = allocation.cell_id - 1;
    requireFlow(Number.isInteger(index) && index >= 0 && index < 156 && !destinations.has(index));
    destinations.add(index);
    const original = player.heatmap_cells[index];
    requireFlow(original.supported_destination && original.observed_attempts >= 10 &&
      Number.isFinite(allocation.added_share) && allocation.added_share >= 0 &&
      Number.isFinite(allocation.final_share));
    const added = n * allocation.added_share;
    requireFlow(Math.abs(n * allocation.final_share - original.observed_attempts - added) <= tolerance &&
      (added <= tolerance || allocation.final_share <= .5 + 1e-12));
    cells[index].added_attempt_equivalents = added;
  }
  let removed = 0, added = 0;
  for (const [index, cell] of cells.entries()) {
    requireFlow(cell.removed_attempt_equivalents <= player.heatmap_cells[index].observed_attempts + tolerance &&
      !(cell.removed_attempt_equivalents > 0 && player.heatmap_cells[index].supported_destination));
    removed += cell.removed_attempt_equivalents;
    added += cell.added_attempt_equivalents;
  }
  requireFlow(Math.abs(removed - m) <= tolerance && Math.abs(added - m) <= tolerance &&
    Math.abs(removed - added) <= tolerance);
  if (!player.relocation_available) requireFlow(m === 0 && orders.size === 0 && destinations.size === 0);
  return { relocation_available: player.relocation_available, availability_reason: player.availability_reason,
    requested_share: slider.requested_share, actual_relocated_attempt_equivalents: m, cells };
}
