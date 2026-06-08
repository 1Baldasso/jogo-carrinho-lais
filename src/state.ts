import { CAR_PRESETS } from "./config";
import type { Car, GameConfig, GameState, MoveResult } from "./types";

export const gameState: GameState = {
  config: { numCars: 2, finishLine: 5 },
  cars: [],
  status: "config",
  winnerId: null,
  selectedCarId: null,
};

export function initGame(config: GameConfig): void {
  gameState.config = config;
  gameState.cars = CAR_PRESETS.slice(0, config.numCars).map(
    (preset, i) =>
      ({
        id: i,
        color: preset.color,
        colorName: preset.colorName,
        position: 0,
        acertos: 0,
      }) satisfies Car,
  );
  gameState.status = "playing";
  gameState.winnerId = null;
  gameState.selectedCarId = null;
}

export function selectCar(id: number): void {
  gameState.selectedCarId = id;
}

export function advanceCar(id: number, spaces: number): MoveResult {
  const car = gameState.cars.find((c) => c.id === id);
  if (!car) return { newPosition: 0, won: false };

  car.position = Math.max(0, Math.min(car.position + spaces, gameState.config.finishLine));
  if (spaces > 0) car.acertos += spaces;

  const won = car.position >= gameState.config.finishLine;
  if (won) {
    gameState.winnerId = id;
    gameState.status = "finished";
  }

  return { newPosition: car.position, won };
}

export function resetGame(): void {
  gameState.cars = [];
  gameState.status = "config";
  gameState.winnerId = null;
  gameState.selectedCarId = null;
}
