import './style.css';
import { initGame, resetGame, gameState } from './state';
import { mountConfigScreen } from './screens/configScreen';
import { mountGameScreen } from './screens/gameScreen';
import { mountWinnerScreen } from './screens/winnerScreen';
import type { Car, GameConfig } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;

function showConfig(): void {
  resetGame();
  mountConfigScreen(app, (config: GameConfig) => {
    initGame(config);
    showGame();
  });
}

function showGame(): void {
  mountGameScreen(app, (winner: Car) => {
    showWinner(winner);
  });
}

function showWinner(winner: Car): void {
  mountWinnerScreen(app, winner, showConfig);
}

showConfig();
