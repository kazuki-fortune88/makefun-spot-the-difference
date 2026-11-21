// Boot for Harbor Lights.
//
// The game starts on its title screen. Query parameters drive
// deterministic states for screenshots and testing, all rendered by
// the game's own code — no state is ever faked by hand:
//
//   ?shot=start            title screen over level 1, nothing found yet
//   ?shot=play&level=2     mid-game; &found=0,2 marks those differences
//   ?shot=end              level 1 complete, all seven differences circled
//
// Shot modes freeze the countdown so the timer reads the same in every
// capture. The live game (no ?shot) runs its timer normally.

import { SpotGame } from './game.js';
import { LEVELS } from './levels.js';

const canvas = document.getElementById('game');
const game = new SpotGame(canvas);
window.__game = game;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

function parseFound() {
  const raw = params.get('found');
  if (!raw) return [0, 2, 4];
  return raw
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 0 && n < 7);
}

function applyShotMode() {
  if (!shot) return;
  game.frozen = true;
  const levelParam = Number.parseInt(params.get('level') ?? '1', 10);
  game.levelIndex = Number.isInteger(levelParam)
    ? Math.min(Math.max(levelParam - 1, 0), LEVELS.length - 1)
    : 0;
  game.beginLevel();
  if (shot === 'start') {
    game.state = 'title';
  } else if (shot === 'play') {
    game.state = 'playing';
    for (const index of parseFound()) {
      game.found.add(game.level.differences[index].id);
    }
    game.score = game.foundCount * 100;
  } else if (shot === 'end') {
    game.state = 'levelDone';
    for (const diff of game.level.differences) game.found.add(diff.id);
    game.timeLeft = 87;
    game.levelBonus = 87 * 5;
    game.score = 7 * 100 + game.levelBonus;
  }
}

applyShotMode();
game.start();

// Wire the buttons under the canvas to the same actions as the keys.
document.getElementById('btn-hint').addEventListener('click', () => game.useHint());
document.getElementById('btn-restart').addEventListener('click', () => game.restartLevel());
document.getElementById('btn-start').addEventListener('click', () => {
  if (game.state === 'title') game.startGame();
  else if (game.state === 'levelDone') game.nextLevel();
  else if (game.state === 'gameWon' || game.state === 'timeUp') game.startGame();
});
