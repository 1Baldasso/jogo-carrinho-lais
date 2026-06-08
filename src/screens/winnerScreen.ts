import type { Car } from '../types';
import { carSvg } from '../render/carSvg';
import { launchConfetti } from '../confetti';

export function mountWinnerScreen(
  container: HTMLElement,
  winner: Car,
  onReplay: () => void
): void {
  container.innerHTML = `
    <div class="screen screen--winner">
      <div class="winner-card">
        <div class="winner-car">${carSvg(winner.color, 100)}</div>
        <h1 class="winner-title">Parabéns!</h1>
        <p class="winner-name">${winner.colorName} venceu!</p>
        <div class="winner-stats">
          <div class="stat">
            <span class="stat__value">${winner.position}</span>
            <span class="stat__label">Casas percorridas</span>
          </div>
          <div class="stat">
            <span class="stat__value">${winner.acertos}</span>
            <span class="stat__label">Acertos</span>
          </div>
        </div>
        <button class="btn btn--primary btn--lg" id="replay-btn" type="button">
          Jogar novamente
        </button>
      </div>
    </div>
  `;

  const stopConfetti = launchConfetti();

  const replayBtn = container.querySelector<HTMLButtonElement>('#replay-btn')!;
  replayBtn.addEventListener('click', () => {
    stopConfetti();
    onReplay();
  });
}
