// One recorded winner and one unforced error. Prefer equal, short exchanges so
// the two ways of counting the final attempt are easy to compare.
function examples(points) {
  const byKind = { W: new Map(), U: new Map() };
  for (const point of points) {
    const kind = point[6];
    if (!(kind === "W" || kind === "U") || !Number.isInteger(point[7]) || point[7] < 1) continue;
    const length = point[7] + Number(kind === "U");
    if (!byKind[kind].has(length)) byKind[kind].set(length, point);
  }
  const byCloseness = (a, b) => Math.abs(a - 5) - Math.abs(b - 5) || a - b;
  const shared = [...byKind.W.keys()].filter(n => byKind.U.has(n)).sort(byCloseness)[0];
  return Object.values(byKind).map(group => group.get(shared ?? [...group.keys()].sort(byCloseness)[0])).filter(Boolean);
}

const surfaces = {
  Grass: ["#355c47", "#507953", "#597f57"],
  Clay: ["#6b4330", "#a85f41", "#ae6646"],
  Hard: ["#324e55", "#416b74", "#477179"],
};
const cream = "#f7edc9";
let contactSprite;

function paint(canvas, surface, from, to, progress, missed, animate) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const [surround, base, stripe] = surfaces[surface] || ["#3e5552", "#58756a", "#607b70"];
  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  ctx.imageSmoothingEnabled = false;
  rect(0, 0, 208, 86, surround);
  rect(22, 10, 164, 66, base);
  for (let x = 22; x < 186; x += 24) rect(x, 10, 12, 66, stripe);
  for (const y of [10, 18, 67, 75]) rect(22, y, 164, 1, cream);
  for (const x of [22, 185]) rect(x, 10, 1, 66, cream);
  for (const x of [59, 148]) rect(x, 18, 1, 50, cream);
  rect(59, 43, 90, 1, cream);
  rect(22, 43, 3, 1, cream);
  rect(183, 43, 3, 1, cream);
  rect(104, 7, 2, 73, "#344b40");
  rect(103, 7, 1, 73, cream);
  for (let y = 8; y < 80; y += 3) rect(105, y, 1, 1, "#bcbd9c");
  rect(102, 6, 4, 2, cream);
  rect(102, 79, 4, 2, cream);

  // Each side has a distinct kit. Positions indicate turn order only.
  function player(side) {
    const left = side === 0;
    const x = left ? 14 : 194, y = left ? 53 : 33, dir = left ? 1 : -1;
    const kit = left ? "#e7dfb9" : "#e8ad77";
    rect(x - 4, y + 5, 11, 2, "#2a443a");
    rect(x - 2, y + 1, 2, 5, "#283a35");
    rect(x + 2, y + 1, 2, 4, "#283a35");
    rect(x - 3, y + 5, 4, 1, cream);
    rect(x + 2, y + 4, 3, 1, cream);
    rect(x - 3, y - 5, 7, 7, kit);
    rect(x - 2, y - 10, 5, 5, "#cd9772");
    rect(x - 2, y - 11, 5, 2, "#363b31");
    rect(x - 2, y - 9, 5, 1, kit);
    rect(x + dir * 4 - 1, y - 4, 3, 2, "#cd9772");
    rect(x + dir * 6 - 1, y - 5, 3, 1, cream);
    const racket = x + dir * 9;
    rect(racket - 2, y - 10, 4, 6, "#d8d69c");
    rect(racket - 3, y - 9, 6, 4, "#d8d69c");
    rect(racket - 1, y - 9, 2, 4, surround);
  }
  player(0);
  player(1);
  const pos = side => side === 0 ? [26, 46] : [182, 26];
  const [startX, startY] = pos(from);
  const [endX, endY] = pos(to);
  const x = startX + (endX - startX) * progress;
  const y = startY + (endY - startY) * progress - Math.sin(Math.PI * progress) * 7;
  if (missed) {
    for (let i = -2; i <= 2; i++) {
      rect(x + i, y + i, 2, 1, "#fff0bf");
      rect(x + i, y - i, 2, 1, "#fff0bf");
    }
  } else {
    rect(x - 2, y - 1, 5, 3, "#35452c");
    rect(x - 1, y - 2, 3, 4, "#e8ef71");
    rect(x - 2, y - 1, 5, 2, "#e8ef71");
    rect(x - 1, y - 2, 2, 1, "#ffffd3");
  }
  if (animate && progress < 0.48 && contactSprite?.naturalWidth) {
    const frame = Math.min(5, Math.floor(progress / 0.08));
    ctx.save();
    ctx.translate(startX, startY);
    ctx.scale(from === 0 ? 1 : -1, 1);
    ctx.drawImage(contactSprite, (frame % 3) * 136, Math.floor(frame / 3) * 80, 136, 80, -11, -11, 34, 20);
    ctx.restore();
  }
}

export function mountRally(host, points, players, surface, attempt) {
  const choices = examples(points);
  if (!choices.length) return;
  host.innerHTML = `<section class="rally-play" aria-labelledby="rally-heading">
    <button class="rally-court" type="button" aria-describedby="rally-context">
      <canvas width="208" height="86" aria-hidden="true"></canvas>
      <span class="rally-court-action"><span data-action></span><span aria-hidden="true">→</span></span>
    </button>
    <div class="rally-copy"><h3 id="rally-heading">Play a rally</h3>
      <p id="rally-context"></p><p data-state role="status" aria-atomic="true"></p>
      <button class="rally-switch" type="button"></button>
      <small>Shot order from the match. Court positions are illustrative.</small>
    </div></section>`;
  const canvas = host.querySelector("canvas");
  const court = host.querySelector(".rally-court");
  const switcher = host.querySelector(".rally-switch");
  const action = host.querySelector("[data-action]");
  const status = host.querySelector("[data-state]");
  const context = host.querySelector("#rally-context");
  if (!contactSprite) {
    contactSprite = new Image();
    contactSprite.src = "./assets/rally-contact.png";
  }
  let choice = 0, shot = 0, animation = 0;
  function render(moving = false) {
    cancelAnimationFrame(animation);
    host.dataset.shot = shot;
    const [number, set, game, , server, , ending, inPlay] = choices[choice];
    const total = inPlay + Number(ending === "U");
    const done = shot === total;
    const first = server - 1;
    const hitter = shot % 2 === 0 && shot > 0 ? 1 - first : first;
    const missed = done && ending === "U";
    const receiver = shot && !missed ? 1 - hitter : hitter;
    const kind = ending === "U" ? "unforced error" : "winner";
    context.textContent = `Point ${number} · Set ${set}, game ${game} · ${kind}`;
    action.textContent = done ? "Replay point" : shot === 0 ? "Serve the ball" : shot === 1 ? "Play the return" : "Play next shot";
    if (done) {
      const result = missed ? "missed" : "hit a winner";
      status.textContent = `${players[hitter]} ${result} on shot ${shot}. ${inPlay} ${inPlay === 1 ? "shot counts" : "shots count"} in play.`;
    } else if (shot) {
      status.textContent = `Shot ${shot} of ${total}. ${players[hitter]} ${shot === 1 ? "served" : "kept the ball in play"}.`;
    } else {
      status.textContent = `${players[first]} to serve. Play through ${total} shots to see how this point ends.`;
    }
    if (done) status.textContent += " Displayed count: " + (attempt ? total : inPlay) + ".";
    switcher.hidden = choices.length < 2;
    if (!switcher.hidden) switcher.textContent = ending === "W" ? "Try an unforced error" : "Try a winner";
    if (!moving || missed || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(canvas, surface, hitter, receiver, 1, missed, false);
      return;
    }
    const start = performance.now();
    function draw(now) {
      if (!host.isConnected) return;
      const progress = Math.min(1, (now - start) / 360);
      paint(canvas, surface, hitter, receiver, progress, false, true);
      if (progress < 1) animation = requestAnimationFrame(draw);
    }
    animation = requestAnimationFrame(draw);
  }
  court.addEventListener("click", () => {
    const point = choices[choice];
    shot = shot >= point[7] + Number(point[6] === "U") ? 0 : shot + 1;
    render(shot > 0);
  });
  switcher.addEventListener("click", () => {
    choice = 1 - choice;
    shot = 0;
    render();
  });
  host.addEventListener("rally-rule", e => { attempt = e.detail; render(); });
  render();
}
