import type { Car } from '../types';
import { carSvg } from './carSvg';

export function renderCarPanel(cars: Car[], selectedCarId: number | null): string {
  const cards = cars
    .map(
      car => `<button
        class="car-card${car.id === selectedCarId ? ' selected' : ''}"
        style="--car-color: ${car.color}"
        data-car-id="${car.id}"
        type="button"
      >
        <div class="car-card__icon">${carSvg(car.color, 40)}</div>
        <div class="car-card__info">
          <span class="car-card__name">${car.colorName}</span>
          <span class="car-card__pos">Casa ${car.position}</span>
        </div>
      </button>`
    )
    .join('');

  return `<div class="car-panel">${cards}</div>`;
}
