import { advanceCar, gameState, selectCar } from '../state';
import { renderTrack } from '../render/track';
import { launchConfetti } from '../confetti';
import type { Car } from '../types';

// ── Roulette options ───────────────────────────────────────────────────────

type RouletteOption = {
  label: string;
  delta: 1 | -1 | 0;
  needsQuestion: boolean;
  cls: 'pos' | 'neg' | 'target-pos' | 'target-neg';
};

const ROULETTE_OPTIONS: RouletteOption[] = [
  { label: '⬆️ Avance uma casa!',                 delta:  1, needsQuestion: false, cls: 'pos'        },
  { label: '⏭️ Passe a vez!',                     delta:  0, needsQuestion: false, cls: 'neg'        },
  { label: '🎯 Escolha um carrinho para recuar',  delta: -1, needsQuestion: true,  cls: 'target-neg' },
  { label: '🎯 Escolha um carrinho para avançar', delta:  1, needsQuestion: true,  cls: 'target-pos' },
];

// ── Wheel SVG ──────────────────────────────────────────────────────────────

const SEG_COLORS = ['#16a34a', '#dc2626', '#ea580c', '#2563eb'];
const SEG_LABELS = [
  ['⬆️ Avance', '1 casa'],
  ['⏭️ Passe', 'a vez'],
  ['🎯 Escolha', 'recuar'],
  ['🎯 Escolha', 'avançar'],
];

function buildWheelSvg(size: number): string {
  const cx = size / 2, cy = size / 2, r = size / 2 - 6;
  const rad = (d: number) => (d - 90) * Math.PI / 180;
  const f   = (v: number) => v.toFixed(1);

  const segs = SEG_COLORS.map((color, i) => {
    const [a0, a1] = [rad(i * 90), rad((i + 1) * 90)];
    return `<path d="M${f(cx)},${f(cy)} L${f(cx+r*Math.cos(a0))},${f(cy+r*Math.sin(a0))} A${r},${r} 0 0,1 ${f(cx+r*Math.cos(a1))},${f(cy+r*Math.sin(a1))} Z" fill="${color}"/>`;
  }).join('');

  const dividers = [0, 90, 180, 270].map(d => {
    const a = rad(d);
    return `<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(cx+r*Math.cos(a))}" y2="${f(cy+r*Math.sin(a))}" stroke="#0f172a" stroke-width="3"/>`;
  }).join('');

  const texts = SEG_LABELS.map(([l1, l2], i) => {
    const midDeg = i * 90 + 45;
    const a = rad(midDeg);
    const tr = r * 0.60;
    const tx = cx + tr * Math.cos(a), ty = cy + tr * Math.sin(a);
    const rot = midDeg;
    const fs = Math.round(size * 0.056);
    return `<g transform="rotate(${rot},${f(tx)},${f(ty)})">
      <text x="${f(tx)}" y="${f(ty - fs * 0.75)}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="${fs}" font-weight="800" font-family="'Segoe UI',system-ui,sans-serif">${l1}</text>
      <text x="${f(tx)}" y="${f(ty + fs * 0.75)}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="${Math.round(fs*0.82)}" font-weight="600" font-family="'Segoe UI',system-ui,sans-serif" opacity="0.9">${l2}</text>
    </g>`;
  }).join('');

  const rim = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" fill="none" stroke="#0f172a" stroke-width="6"/>`;
  const hub = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${Math.round(size*0.072)}" fill="#0f172a"/>
    <circle cx="${f(cx)}" cy="${f(cy)}" r="${Math.round(size*0.036)}" fill="#475569"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${segs}${dividers}${rim}${texts}${hub}</svg>`;
}

// ── Screen mode ────────────────────────────────────────────────────────────

type ScreenMode =
  | { kind: 'idle' }
  | { kind: 'spinning' }
  | { kind: 'awaitingCarClick'; option: RouletteOption }
  | { kind: 'modalAwaitingAnswer'; targetId: number; option: RouletteOption };

// ── Mount ──────────────────────────────────────────────────────────────────

export function mountGameScreen(
  container: HTMLElement,
  onWin: (winner: Car) => void
): void {
  container.innerHTML = `
    <div class="screen screen--game">
      <div id="track-zone" class="track-zone"></div>
      <div class="game-footer">
        <p class="game-hint" id="game-hint">Clique em um carrinho na pista para avançar</p>
        <button class="btn btn--roulette" id="roulette-btn" type="button">🎲 Girar Roleta</button>
      </div>
    </div>

    <!-- Roulette modal -->
    <div class="modal-overlay modal-overlay--roulette" id="roulette-modal" hidden>
      <div class="roulette-modal-inner">
        <div class="roulette-wheel-wrap">
          <div class="roulette-pointer"></div>
          <div id="roulette-wheel">${buildWheelSvg(340)}</div>
        </div>
        <div id="roulette-result" class="roulette-result" hidden></div>
        <button class="btn btn--continue" id="roulette-continue" type="button" hidden>
          Continuar ▶
        </button>
      </div>
    </div>

    <!-- Question modal -->
    <div class="modal-overlay" id="question-modal" hidden>
      <div class="modal">
        <p class="modal__title">O jogador acertou a pergunta?</p>
        <div class="modal__actions">
          <button class="btn btn--yes" id="modal-yes" type="button">✅ Acertou</button>
          <button class="btn btn--no"  id="modal-no"  type="button">❌ Errou</button>
        </div>
      </div>
    </div>
  `;

  const trackZone      = container.querySelector<HTMLDivElement>('#track-zone')!;
  const gameHint       = container.querySelector<HTMLParagraphElement>('#game-hint')!;
  const rouletteBtn    = container.querySelector<HTMLButtonElement>('#roulette-btn')!;
  const rouletteModal  = container.querySelector<HTMLDivElement>('#roulette-modal')!;
  const wheelEl        = container.querySelector<HTMLDivElement>('#roulette-wheel')!;
  const rouletteResult = container.querySelector<HTMLDivElement>('#roulette-result')!;
  const continueBtn    = container.querySelector<HTMLButtonElement>('#roulette-continue')!;
  const questionModal  = container.querySelector<HTMLDivElement>('#question-modal')!;
  const modalYes       = container.querySelector<HTMLButtonElement>('#modal-yes')!;
  const modalNo        = container.querySelector<HTMLButtonElement>('#modal-no')!;

  let mode: ScreenMode = { kind: 'idle' };
  let wheelRotation    = 0;

  // ── Mode ──────────────────────────────────────────────────────────────────

  function setMode(next: ScreenMode): void {
    mode = next;
    rouletteModal.setAttribute('hidden', '');
    questionModal.setAttribute('hidden', '');

    switch (next.kind) {
      case 'idle':
        rouletteBtn.disabled = false;
        gameHint.textContent = 'Clique em um carrinho na pista para avançar';
        setTrackInteraction('idle');
        break;
      case 'spinning':
        rouletteBtn.disabled = true;
        rouletteModal.removeAttribute('hidden');
        setTrackInteraction('spinning');
        break;
      case 'awaitingCarClick':
        rouletteBtn.disabled = true;
        gameHint.textContent = '👆 Clique no carrinho desejado na pista';
        setTrackInteraction('awaiting');
        break;
      case 'modalAwaitingAnswer':
        rouletteBtn.disabled = true;
        questionModal.removeAttribute('hidden');
        break;
    }
  }

  function setTrackInteraction(value: string): void {
    const wrapper = trackZone.querySelector<HTMLElement>('.track-wrapper');
    if (wrapper) wrapper.dataset.interaction = value;
  }

  // ── Track ─────────────────────────────────────────────────────────────────

  function refreshTrack(): void {
    trackZone.innerHTML = renderTrack(gameState);
    setTrackInteraction(
      mode.kind === 'awaitingCarClick' ? 'awaiting' :
      mode.kind === 'spinning'         ? 'spinning' : 'idle'
    );
  }

  trackZone.addEventListener('click', e => {
    const lane = (e.target as HTMLElement).closest<HTMLElement>('[data-car-id]');
    if (!lane) return;
    const id = parseInt(lane.dataset.carId!, 10);

    if (mode.kind === 'idle') {
      selectCar(id);
      applyMove(id, 1);
    } else if (mode.kind === 'awaitingCarClick') {
      const opt = mode.option;
      if (opt.needsQuestion) {
        setMode({ kind: 'modalAwaitingAnswer', targetId: id, option: opt });
      } else {
        applyMove(id, opt.delta);
        setMode({ kind: 'idle' });
      }
    }
  });

  // ── Move ──────────────────────────────────────────────────────────────────

  function applyMove(id: number, delta: number): void {
    const result = advanceCar(id, delta);
    refreshTrack();
    if (result.won) {
      const winner = gameState.cars.find(c => c.id === id)!;
      trackZone
        .querySelector<HTMLElement>(`[data-car-id="${id}"] [data-space="${result.newPosition}"] .car-svg-wrap`)
        ?.classList.add('car-svg--win');
      launchConfetti();
      setTimeout(() => onWin(winner), 600);
    }
  }

  // ── Question modal ─────────────────────────────────────────────────────────

  modalYes.addEventListener('click', () => {
    if (mode.kind !== 'modalAwaitingAnswer') return;
    const { targetId, option } = mode;
    if (option.cls === 'target-pos') applyMove(targetId, 1);
    setMode({ kind: 'idle' });
  });

  modalNo.addEventListener('click', () => {
    if (mode.kind !== 'modalAwaitingAnswer') return;
    const { targetId, option } = mode;
    if (option.cls === 'target-neg') applyMove(targetId, -1);
    setMode({ kind: 'idle' });
  });

  // ── Roulette wheel ─────────────────────────────────────────────────────────

  function spinWheel(segmentIndex: number): Promise<void> {
    // ((360 - center_angle) % 360 + 360) % 360 avoids negative JS modulo
    const targetMod  = ((360 - (segmentIndex * 90 + 45)) % 360 + 360) % 360;
    const currentMod = wheelRotation % 360;
    const delta      = (targetMod - currentMod + 360) % 360;
    wheelRotation    = wheelRotation + delta + 5 * 360;

    // Force a reflow so the browser knows the "before" state before transitioning
    void wheelEl.offsetWidth;
    wheelEl.style.transition = `transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
    wheelEl.style.transform  = `rotate(${wheelRotation}deg)`;

    return new Promise(resolve => setTimeout(resolve, 4200));
  }

  rouletteBtn.addEventListener('click', async () => {
    if (mode.kind !== 'idle') return;

    const idx    = Math.floor(Math.random() * ROULETTE_OPTIONS.length);
    const option = ROULETTE_OPTIONS[idx];

    rouletteResult.setAttribute('hidden', '');
    continueBtn.setAttribute('hidden', '');

    setMode({ kind: 'spinning' });

    // Aguarda dois frames para o modal ser pintado antes de animar
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

    await spinWheel(idx);

    // Show result inside roulette modal
    rouletteResult.textContent = option.label;
    rouletteResult.className   = `roulette-result roulette-result--${option.cls} roulette-result--final`;
    rouletteResult.removeAttribute('hidden');
    continueBtn.removeAttribute('hidden');

    // Wait for user to click Continuar
    continueBtn.onclick = () => {
      rouletteModal.setAttribute('hidden', '');
      if (option.delta === 0) {
        setMode({ kind: 'idle' });
      } else {
        setMode({ kind: 'awaitingCarClick', option });
      }
    };
  });

  // ── Init ───────────────────────────────────────────────────────────────────

  refreshTrack();
  setMode({ kind: 'idle' });
}
