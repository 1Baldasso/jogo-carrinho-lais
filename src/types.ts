export interface Car {
  id: number;
  color: string;
  colorName: string;
  position: number;
  acertos: number;
}

export interface GameConfig {
  numCars: number;
  finishLine: number;
}

export type GameStatus = 'config' | 'playing' | 'finished';

export interface GameState {
  config: GameConfig;
  cars: Car[];
  status: GameStatus;
  winnerId: number | null;
  selectedCarId: number | null;
}

export interface MoveResult {
  newPosition: number;
  won: boolean;
}
