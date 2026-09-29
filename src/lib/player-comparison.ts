// Display-only adaptation of verified v4 summaries. Null is never a zero.
export type Summary = { mean: number | null; lower_90: number | null; upper_90: number | null };
export function displaySummary(value: Summary, scale = 1): Summary {
  const values = [value?.mean, value?.lower_90, value?.upper_90];
  if (values.every(v => v === null)) return { mean: null, lower_90: null, upper_90: null };
  if (!values.every(v => typeof v === 'number' && Number.isFinite(v)) ||
      value.lower_90! > value.mean! || value.mean! > value.upper_90!) throw new Error('Invalid comparison summary');
  return { mean: value.mean! * scale, lower_90: value.lower_90! * scale, upper_90: value.upper_90! * scale };
}

// Comparison-only cache shares catalog/index requests and immutable payloads.
// A slot's request token decides whether a response is still current; cancelling
// that slot must not cancel another slot's shared network request.
export function createComparisonLoader(fetcher: typeof fetch = fetch) {
  const requests = new Map<string, Promise<unknown>>();
  return (path: string): Promise<unknown> => {
    if (!requests.has(path)) {
      const pending = fetcher(path, { headers: { Accept: 'application/json' } })
        .then(response => { if (!response.ok) throw new Error(`Request returned ${response.status}`); return response.json(); })
        .catch(error => { requests.delete(path); throw error; });
      requests.set(path, pending);
    }
    return requests.get(path)!;
  };
}
