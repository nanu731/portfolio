/* Small, native interaction enhancements. Data validation remains with each engine. */
(() => {
  'use strict';
  document.body.classList.add('std-experience');
  const copyConfig = document.getElementById('std-reader-copy');
  if (copyConfig) {
    const edits = JSON.parse(copyConfig.textContent);
    const refineText = node => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentElement?.closest('script,style,code,pre,svg')) return;
        let value = node.nodeValue;
        for (const [from, to] of edits) value = value.split(from).join(to);
        if (value !== node.nodeValue) node.nodeValue = value;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches('script,style,code,pre,svg')) return;
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        let text; while ((text = walker.nextNode())) refineText(text);
      }
    };
    refineText(document.body);
    new MutationObserver(records => {
      const changed = new Set();
      for (const record of records) {
        if (record.type === 'characterData') changed.add(record.target);
        else for (const node of record.addedNodes) changed.add(node);
      }
      changed.forEach(refineText);
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new WeakMap();
  const pressed = new Set();
  const origins = new WeakMap();
  const cancelledClicks = new WeakMap();
  const clickables = 'a,button,summary,select,[role="button"],input[type="radio"],input[type="checkbox"],svg[tabindex="0"],svg [tabindex="0"],label:has(input[type="radio"],input[type="checkbox"])';
  const interactive = target => target instanceof Element ? target.closest(clickables) : null;
  function motion(element, down) {
    if (!element || element.matches(':disabled,[aria-disabled="true"]')) return;
    element.toggleAttribute('data-std-pressed', down);
    if (reduce.matches || !(element instanceof HTMLElement) || element.tagName === 'SELECT') return;
    const from = getComputedStyle(element).transform;
    animations.get(element)?.cancel();
    const animation = element.animate([{ transform: from === 'none' ? 'scale(1)' : from }, { transform: down ? 'scale(.975)' : 'scale(1)' }], {
      duration: down ? 90 : 160, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards',
    });
    animations.set(element, animation);
    if (!down) animation.finished.then(() => {
      if (animations.get(element) === animation) { animation.cancel(); animations.delete(element); }
    }).catch(() => {});
  }
  const inside = (rect, event) => event.clientX >= rect.left - 8 && event.clientX <= rect.right + 8 && event.clientY >= rect.top - 8 && event.clientY <= rect.bottom + 8;
  function release(event) {
    for (const element of pressed) {
      const origin = origins.get(element);
      if (event?.type === 'pointerup' && origin && !inside(origin.rect, event)) cancelledClicks.set(element, performance.now() + 350);
      origins.delete(element); motion(element, false);
    }
    pressed.clear();
  }
  // Preserve tap cancellation when a captured pointer moves off a scaled control.
  window.addEventListener('click', event => {
    const element = interactive(event.target);
    if (element && event.detail && (cancelledClicks.get(element) || 0) > performance.now()) {
      cancelledClicks.delete(element); event.preventDefault(); event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('pointerdown', event => {
    const element = interactive(event.target);
    if (!element || event.button !== 0) return;
    origins.set(element, { rect: element.getBoundingClientRect(), pointerId: event.pointerId, inside: true });
    if (element instanceof HTMLElement && element.tagName !== 'SELECT') { try { element.setPointerCapture(event.pointerId); } catch {} }
    pressed.add(element); motion(element, true);
  }, true);
  document.addEventListener('pointermove', event => {
    for (const element of pressed) {
      const origin = origins.get(element);
      if (!origin || origin.pointerId !== event.pointerId) continue;
      const over = inside(origin.rect, event);
      if (origin.inside !== over) { origin.inside = over; motion(element, over); }
    }
  }, { capture: true, passive: true });
  document.addEventListener('pointerup', release, true);
  document.addEventListener('pointercancel', release, true);
  window.addEventListener('blur', release);
  document.addEventListener('keydown', event => {
    if (!['Enter', ' '].includes(event.key) || event.repeat) return;
    const element = interactive(event.target);
    if (element) { pressed.add(element); motion(element, true); }
  }, true);
  document.addEventListener('keyup', event => { if (['Enter', ' '].includes(event.key)) release(); }, true);
  reduce.addEventListener('change', () => {
    if (!reduce.matches) return;
    release();
    for (const animation of document.getAnimations()) {
      const target = animation.effect?.target;
      if (target && animations.get(target) === animation) { animation.cancel(); animations.delete(target); }
    }
  });

  // Native page menus close without delaying navigation or trapping focus.
  const menuSelector = '.std-project-menu,.std-section-menu';
  document.addEventListener('pointerdown', event => {
    document.querySelectorAll(menuSelector).forEach(menu => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
  });
  document.addEventListener('scroll', event => {
    document.querySelectorAll(menuSelector).forEach(menu => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }, { capture: true, passive: true });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll(menuSelector).forEach(menu => {
      if (menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); }
    });
  });

  function revealMotion(element) {
    if (!element || reduce.matches) return;
    const current = getComputedStyle(element).transform;
    animations.get(element)?.cancel();
    const animation = element.animate([{ transform: current === 'none' ? 'translateY(4px)' : current }, { transform: 'translateY(0)' }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
    animations.set(element, animation);
    animation.finished.then(() => { if (animations.get(element) === animation) animations.delete(element); }).catch(() => {});
  }
  // A project stays a direct link; the adjacent disclosure also works by touch.
  document.querySelectorAll('.std-project-group').forEach(group => {
    const toggle = group.querySelector('.std-subproject-toggle');
    const children = group.querySelector('.std-project-children');
    const expand = open => {
      if ((toggle.getAttribute('aria-expanded') === 'true') === open) return;
      toggle.setAttribute('aria-expanded', String(open));
      children.hidden = !open;
      if (open) revealMotion(children); else animations.get(children)?.cancel();
    };
    group.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && matchMedia('(hover:hover)').matches) expand(true); });
    group.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse' && !group.contains(document.activeElement)) expand(false); });
    group.addEventListener('focusin', event => { if (event.target.matches('.std-project-parent:focus-visible')) expand(true); });
    group.addEventListener('focusout', event => { if (!group.contains(event.relatedTarget) && !group.matches(':hover')) expand(false); });
    toggle.addEventListener('click', () => expand(toggle.getAttribute('aria-expanded') !== 'true'));
  });
  document.querySelectorAll(menuSelector).forEach(menu => menu.addEventListener('toggle', () => {
    if (!menu.open) return;
    const panel = menu.querySelector('.std-menu-panel');
    if (innerWidth <= 760 && menu.classList.contains('std-project-menu')) {
      const desired = menu.querySelector('summary').getBoundingClientRect().bottom + 6;
      panel.style.setProperty('--std-menu-top', `${Math.max(18, Math.min(desired, innerHeight - panel.getBoundingClientRect().height - 18))}px`);
    }
    revealMotion(panel);
  }));
  document.addEventListener('change', event => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'radio') return;
    const explorer = event.target.closest('spatial-shot-explorer,player-comparison');
    revealMotion(explorer?.querySelector('.court-panel,.comparison-columns'));
  });
  document.addEventListener('click', event => {
    const button = event.target instanceof Element && event.target.closest('button[role="tab"]');
    if (!button) return;
    const nfl = button.closest('nfl-comparison');
    revealMotion(nfl?.querySelector('#nfl-profile-panel:not([hidden]),#nfl-stats-panel:not([hidden])'));
  });

  // Prefetch a small number of same-origin HTML destinations on actual intent.
  // Save-Data and slow connections keep the normal navigation path.
  const prefetched = new Set();
  const connection = navigator.connection;
  function prefetch(target) {
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '') || prefetched.size >= 6) return;
    const link = target instanceof Element && target.closest('a[href]');
    if (!link || link.hasAttribute('download') || link.getAttribute('target') === '_blank') return;
    let url;
    try { url = new URL(link.getAttribute('href'), location.href); } catch { return; }
    if (url.origin !== location.origin || url.pathname === location.pathname || !/^\/(?:$|projects(?:\/|$)|about(?:\/|$)|blog(?:\/|$))/.test(url.pathname)) return;
    const key = url.origin + url.pathname;
    if (prefetched.has(key)) return;
    prefetched.add(key);
    const hint = document.createElement('link'); hint.rel = 'prefetch'; hint.href = key; hint.as = 'document';
    document.head.append(hint);
  }
  document.addEventListener('pointerover', event => { if (event.pointerType === 'mouse') prefetch(event.target); }, { passive: true });
  document.addEventListener('focusin', event => prefetch(event.target));

  // Show skeletons only where the source engine explicitly reports a data wait.
  const states = new WeakMap();
  let scheduled = false;
  const regionState = () => {
    const regions = [];
    document.querySelectorAll('[data-explorer-stage]').forEach(node => regions.push([node, node.getAttribute('aria-busy') === 'true']));
    const tennis = document.getElementById('tennis-view');
    if (tennis) regions.push([tennis, tennis.getAttribute('aria-busy') === 'true']);
    const mb = document.querySelector('[data-moneyball]');
    if (mb) {
      const stage = mb.querySelector('.mb-stage');
      const loading = /^Loading/.test(mb.querySelector('[data-mb-status]')?.textContent.trim() || '');
      if (stage) regions.push([stage, loading]);
    }
    for (const [region, busy] of regions) {
      let state = states.get(region);
      if (!state) {
        state = { busy: false, height: 0, originalMinHeight: region.style.minHeight };
        states.set(region, state); region.classList.add('std-async-region');
      }
      if (busy) {
        if (!region.querySelector(':scope > .std-chart-skeleton')) {
          const skeleton = document.createElement('div'); skeleton.className = 'std-chart-skeleton'; skeleton.setAttribute('aria-hidden', 'true');
          const label = document.createElement('p'); label.textContent = 'Loading the selected data…'; skeleton.append(label);
          for (let i = 0; i < 4; i++) { const line = document.createElement('span'); line.className = 'std-skeleton-line'; skeleton.append(line); }
          region.append(skeleton);
        }
        if (!state.busy) {
          state.busy = true;
          region.style.minHeight = `${Math.max(160, Math.min(640, state.height || region.getBoundingClientRect().height))}px`;
          region.classList.add('std-region-busy');
        }
      } else if (state.busy) {
        state.busy = false; region.classList.remove('std-region-busy'); region.style.minHeight = state.originalMinHeight;
      } else state.height = region.getBoundingClientRect().height;
    }
  };
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; regionState(); });
  }
  new MutationObserver(schedule).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true, attributeFilter: ['aria-busy'] });
  regionState();
})();
