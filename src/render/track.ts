import type { GameState } from '../types';
import { carSvg } from './carSvg';

const WINDOW = 9; // visible cells per lane (odd → car stays centered)

export function renderTrack(state: GameState): string {
  const { cars, config } = state;
  const n       = cars.length;
  const carWidth = n <= 2 ? 80 : n <= 3 ? 68 : n <= 4 ? 58 : 48;
  const total   = config.finishLine + 1;

  const lanes = cars.map(car => {
    const visibleCount = Math.min(WINDOW, total);
    const half  = Math.floor(visibleCount / 2);
    const rawStart = car.position - half;
    const start = Math.max(0, Math.min(rawStart, total - visibleCount));
    const end   = start + visibleCount - 1;

    const cells = Array.from({ length: visibleCount }, (_, i) => {
      const space    = start + i;
      const occupied = car.position === space;
      const isFinish = space === config.finishLine;
      const isStart  = space === 0;

      let cls = 'track-cell';
      if (occupied) cls += ' track-cell--car';
      if (isFinish) cls += ' track-cell--finish';
      if (isStart)  cls += ' track-cell--start';

      const watermark = occupied
        ? ''
        : `<span class="track-cell__num">${isStart ? '0' : isFinish ? '🏁' : space}</span>`;

      return `<div class="${cls}" data-space="${space}">
        ${watermark}
        ${occupied ? `<div class="car-svg-wrap">${carSvg(car.color, carWidth)}</div>` : ''}
      </div>`;
    }).join('');

    // Progress indicator: position / finishLine
    const pct = Math.round((car.position / config.finishLine) * 100);

    return `<div class="track-row track-lane" data-car-id="${car.id}" style="--car-color: ${car.color}">
      <div class="track-cell track-cell--label">
        <div class="lane-header">
          <span class="lane-dot"></span>
          <span class="lane-name">${car.colorName}</span>
        </div>
        <span class="lane-pos">${car.position} / ${config.finishLine}</span>
      </div>
      <div class="track-cells">${cells}</div>
    </div>`;
  }).join('');

  return `<div class="track-wrapper">
    <div class="track-table">${lanes}</div>
  </div>`;
}
