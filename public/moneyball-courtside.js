// Both pixelfx atlases have 48 frames (96×64), six columns, at 24 fps.
const frames = Array.from({ length: 49 }, (_, i) => {
  const frame = i % 48;
  return { transform: `translate(${-((frame % 6) * 96)}px, ${-(Math.floor(frame / 6) * 64)}px)`, easing: 'steps(1, end)' };
});
for (const root of document.querySelectorAll('[data-courtside]')) {
  const button = root.querySelector('button'), images = Array.from(root.querySelectorAll('img')), message = root.querySelector('[role="status"]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (images.length !== 2) continue;
  let animation, feedback;
  const ready = () => {
    if (images.every(image => image.naturalWidth) && getComputedStyle(images[0].parentElement).overflow === 'hidden') root.hidden = false;
  };
  for (const image of images) image.addEventListener('load', ready, { once: true });
  ready();
  button.addEventListener('click', () => {
    animation?.cancel();
    animation = undefined;
    const made = Math.random() < .1;
    const image = images.find(image => image.dataset.shot === (made ? 'make' : 'miss'));
    for (const candidate of images) candidate.hidden = candidate !== image;
    const result = made ? 'Swish! Take another.' : 'Off the rim. Try again.';
    feedback = result;
    if (reduced.matches) { message.textContent = result; return; }
    message.textContent = 'Taking the shot…';
    const shot = image.animate(frames, { duration: 2000 });
    animation = shot;
    shot.finished.then(() => { if (animation === shot) message.textContent = result; }, () => {});
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches && animation?.playState === 'running') {
      animation.cancel(); message.textContent = feedback;
    }
  });
}
