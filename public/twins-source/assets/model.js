// Compare two percentile profiles. Distances are in percentile points.
window.NBA_MODEL = (() => {
  if (!window.NBA_DATA) return;
  const { features, players } = window.NBA_DATA;
  function compare(a, b) {
    const distance = features.reduce(
      (sum, f, i) => sum + f.weight * Math.abs(a.p[i] - b.p[i]),
      0,
    );
    return { distance, score: Math.max(0, 100 - distance) };
  }
  function rank(anchor) {
    return players
      .filter((p) => p.id !== anchor.id)
      .map((player) => ({ player, ...compare(anchor, player) }))
      .sort(
        (a, b) =>
          a.distance - b.distance || a.player.id.localeCompare(b.player.id),
      );
  }
  return { compare, rank };
})();
