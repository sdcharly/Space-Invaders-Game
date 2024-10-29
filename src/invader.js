export class Invader {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.speed = 1;
    this.dx = this.speed;
  }

  update(deltaTime) {
    this.x += this.dx * (deltaTime / 16);
    if (this.x <= 0 || this.x + this.width >= 800) {
      this.dx = -this.dx;
      this.y += 20;
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.lineTo(this.x + 3 * this.width / 4, this.y + this.height / 3);
    ctx.lineTo(this.x + this.width / 4, this.y + this.height / 3);
    ctx.closePath();
    ctx.fill();
  }
}
