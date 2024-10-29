import { Player } from './player.js';
import { Invader } from './invader.js';
import { Bullet } from './bullet.js';

export class Game {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.player = new Player(width / 2, height - 30);
    this.invaders = [];
    this.bullets = [];
    this.score = 0;
    this.gameState = 'start';
    this.level = 1;
    this.playerName = '';
    this.highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    this.lastTime = 0;
  }

  update(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (this.gameState !== 'playing') return;

    this.player.update(deltaTime);
    this.bullets.forEach(bullet => bullet.update(deltaTime));
    this.invaders.forEach(invader => invader.update(deltaTime));

    this.bullets = this.bullets.filter(bullet => !bullet.markedForDeletion);

    this.checkCollisions();

    if (this.invaders.length === 0) {
      this.nextLevel();
    }

    if (this.invaders.some(invader => invader.y + invader.height > this.player.y)) {
      this.gameOver();
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.width, this.height);

    switch (this.gameState) {
      case 'start':
        this.drawStartScreen(ctx);
        break;
      case 'nameInput':
        this.drawNameInputScreen(ctx);
        break;
      case 'playing':
        this.player.draw(ctx);
        this.bullets.forEach(bullet => bullet.draw(ctx));
        this.invaders.forEach(invader => invader.draw(ctx));
        this.drawHUD(ctx);
        break;
      case 'paused':
        this.drawPausedScreen(ctx);
        break;
      case 'gameOver':
        this.drawGameOverScreen(ctx);
        break;
    }
  }

  drawStartScreen(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE INVADERS', this.width / 2, this.height / 2 - 40);
    ctx.font = '20px Arial';
    ctx.fillText('Press ENTER to start', this.width / 2, this.height / 2 + 40);
  }

  drawNameInputScreen(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Enter Your Name:', this.width / 2, this.height / 2 - 60);
    ctx.font = '24px Arial';
    ctx.fillText(this.playerName + '|', this.width / 2, this.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press ENTER when done', this.width / 2, this.height / 2 + 60);
  }

  drawPausedScreen(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', this.width / 2, this.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press P to resume', this.width / 2, this.height / 2 + 40);
    ctx.fillText('Press ESC to quit', this.width / 2, this.height / 2 + 70);
  }

  drawGameOverScreen(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 80);
    ctx.font = '24px Arial';
    ctx.fillText(`Player: ${this.playerName}`, this.width / 2, this.height / 2 - 30);
    ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 10);
    ctx.fillText(`Level Reached: ${this.level}`, this.width / 2, this.height / 2 + 50);
    ctx.font = '20px Arial';
    ctx.fillText('Press ENTER to restart', this.width / 2, this.height / 2 + 100);
    ctx.fillText('Press ESC to quit', this.width / 2, this.height / 2 + 130);
  }

  drawHUD(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Player: ${this.playerName}`, 10, 30);
    ctx.fillText(`Score: ${this.score}`, 10, 60);
    ctx.textAlign = 'right';
    ctx.fillText(`Level: ${this.level}`, this.width - 10, 30);
  }

  handleKeyDown(e) {
    switch (this.gameState) {
      case 'start':
        if (e.key === 'Enter') this.gameState = 'nameInput';
        break;
      case 'nameInput':
        this.handleNameInput(e);
        break;
      case 'playing':
        if (e.key === 'ArrowLeft') this.player.moveLeft();
        if (e.key === 'ArrowRight') this.player.moveRight();
        if (e.key === ' ') this.shoot();
        if (e.key === 'p' || e.key === 'P') this.togglePause();
        if (e.key === 'Escape') this.gameOver();
        break;
      case 'paused':
        if (e.key === 'p' || e.key === 'P') this.togglePause();
        if (e.key === 'Escape') this.gameOver();
        break;
      case 'gameOver':
        if (e.key === 'Enter') this.startGame();
        if (e.key === 'Escape') this.quitGame();
        break;
    }
  }

  handleKeyUp(e) {
    if (this.gameState === 'playing') {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') this.player.stop();
    }
  }

  handleNameInput(e) {
    if (e.key === 'Enter' && this.playerName.trim() !== '') {
      this.startGame();
    } else if (e.key === 'Backspace') {
      this.playerName = this.playerName.slice(0, -1);
    } else if (e.key.length === 1 && this.playerName.length < 15) {
      this.playerName += e.key;
    }
  }

  shoot() {
    if (this.bullets.length < 3) {
      this.bullets.push(new Bullet(this.player.x + this.player.width / 2, this.player.y));
    }
  }

  checkCollisions() {
    this.bullets.forEach(bullet => {
      this.invaders.forEach(invader => {
        if (
          bullet.x < invader.x + invader.width &&
          bullet.x + bullet.width > invader.x &&
          bullet.y < invader.y + invader.height &&
          bullet.y + bullet.height > invader.y
        ) {
          bullet.markedForDeletion = true;
          invader.markedForDeletion = true;
          this.score += 10;
        }
      });
    });

    this.invaders = this.invaders.filter(invader => !invader.markedForDeletion);
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.level = 1;
    this.player = new Player(this.width / 2, this.height - 30);
    this.invaders = this.createInvaders();
    this.bullets = [];
  }

  gameOver() {
    this.gameState = 'gameOver';
    this.updateHighScores();
  }

  updateHighScores() {
    this.highScores.push({ name: this.playerName, score: this.score, level: this.level });
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 5);
    localStorage.setItem('highScores', JSON.stringify(this.highScores));
  }

  nextLevel() {
    this.level++;
    this.invaders = this.createInvaders();
    this.invaders.forEach(invader => invader.speed *= 1.2);
  }

  togglePause() {
    this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
  }

  quitGame() {
    this.gameState = 'start';
    this.playerName = '';
  }

  createInvaders() {
    const invaders = [];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 10; x++) {
        invaders.push(new Invader(x * 50 + 50, y * 40 + 80));
      }
    }
    return invaders;
  }
}
