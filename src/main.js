import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const game = new Game(canvas.width, canvas.height);

function gameLoop(timestamp) {
  game.update(timestamp);
  game.draw(ctx);
  requestAnimationFrame(gameLoop);
}

gameLoop();

document.addEventListener('keydown', (e) => game.handleKeyDown(e));
document.addEventListener('keyup', (e) => game.handleKeyUp(e));

// Add touch controls for mobile devices
let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touchEndX = e.touches[0].clientX;
  const diffX = touchEndX - touchStartX;
  
  if (diffX > 10) {
    game.player.moveRight();
  } else if (diffX < -10) {
    game.player.moveLeft();
  }
  
  touchStartX = touchEndX;
});

canvas.addEventListener('touchend', () => {
  game.player.stop();
});

canvas.addEventListener('click', () => {
  if (game.gameState === 'playing') {
    game.shoot();
  } else {
    game.handleKeyDown({ key: 'Enter' });
  }
});
