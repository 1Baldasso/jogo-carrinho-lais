const COLORS = ['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22','#1abc9c','#e91e63'];
const SHAPES = ['square','rect','circle'] as const;

interface Particle {
  el: HTMLDivElement;
  x: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  scale: number;
  opacity: number;
}

export function launchConfetti(): () => void {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 9999; overflow: hidden;
  `;
  document.body.appendChild(container);

  const COUNT  = 160;
  const particles: Particle[] = [];

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('div');
    const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    const shape  = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const size   = 6 + Math.random() * 8;
    const w      = shape === 'rect' ? size * 2 : size;
    const h      = shape === 'rect' ? size      : size;
    el.style.cssText = `
      position: absolute;
      width: ${w}px; height: ${h}px;
      background: ${color};
      border-radius: ${shape === 'circle' ? '50%' : '2px'};
      will-change: transform, opacity;
    `;
    const x = Math.random() * window.innerWidth;
    el.style.left = `${x}px`;
    el.style.top  = `-${h + 10}px`;
    container.appendChild(el);

    particles.push({
      el,
      x,
      vx:   (Math.random() - 0.5) * 4,
      vy:   3 + Math.random() * 5,
      rot:  Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
      scale: 0.6 + Math.random() * 0.7,
      opacity: 1,
    });
  }

  let y = particles.map(() => -(10 + Math.random() * 400));
  let raf: number;
  let startTime: number | null = null;
  const DURATION = 5000;

  function tick(now: number) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    const fadeStart = DURATION * 0.65;

    let allGone = true;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!p.el.parentNode) continue;
      allGone = false;

      y[i]  += p.vy;
      p.x   += p.vx;
      p.rot += p.vrot;
      p.vy  += 0.08; // gravity

      if (elapsed > fadeStart) {
        p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (DURATION - fadeStart));
      }

      p.el.style.transform = `translate(${p.x - parseFloat(p.el.style.left)}px, ${y[i]}px) rotate(${p.rot}deg) scale(${p.scale})`;
      p.el.style.opacity   = String(p.opacity);

      if (y[i] > window.innerHeight + 20 || p.opacity <= 0) {
        p.el.remove();
      }
    }

    if (elapsed < DURATION && !allGone) {
      raf = requestAnimationFrame(tick);
    } else {
      cleanup();
    }
  }

  raf = requestAnimationFrame(tick);

  function cleanup() {
    cancelAnimationFrame(raf);
    container.remove();
  }

  return cleanup;
}
