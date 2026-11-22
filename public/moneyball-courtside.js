// The pixelfx atlas has 48 frames (96×64), six columns, at 24 fps.
const frames = Array.from({ length: 49 }, (_, i) => {
  const frame = i % 48;
  return { transform: `translate(${-((frame % 6) * 96)}px, ${-(Math.floor(frame / 6) * 64)}px)`, easing: 'steps(1, end)' };
});
for (const root of document.querySelectorAll('[data-courtside]')) {
  const button = root.querySelector('button'), image = root.querySelector('img'), message = root.querySelector('[role="status"]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  const ready = () => { if (image.naturalWidth && getComputedStyle(image.parentElement).overflow === 'hidden') root.hidden = false; };
  image.addEventListener('load', ready, { once: true });
  ready();
  button.addEventListener('click', () => {
    animation?.cancel();
    if (reduced.matches) { message.textContent = 'Swish! Take another.'; return; }
    message.textContent = 'Taking the shot…';
    animation = image.animate(frames, { duration: 2000 });
    animation.finished.then(() => { message.textContent = 'Swish! Take another.'; }, () => {});
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches && animation?.playState === 'running') {
      animation.cancel(); message.textContent = 'Swish! Take another.';
    }
  });
}
