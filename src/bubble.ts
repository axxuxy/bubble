import { Canvas } from "./canvas";
import { Vector, VectorUseDirection } from "./vector";

abstract class Bubble {
  readonly abstract canvas: Canvas;

  private static saves = new Map([
    [true, new Map<number, HTMLCanvasElement>()],
    [false, new Map<number, HTMLCanvasElement>()]
  ]);
  protected static showHighlightByR = 5;

  r: number;
  highlight: boolean;

  constructor(r: number, highlight: boolean) {
    if (r < 1) throw new Error(`radius cannot less then 0.`);
    this.r = r;
    this.highlight = highlight;
  }

  private createImage() {
    const canvas = this.canvas.createCanvas();
    const diameter = canvas.width = canvas.height = 2 * this.r;
    const ctx = canvas.getContext('2d');

    // draw colous.
    const bubbleClipColous = ctx.createRadialGradient(this.r, this.r, this.r, this.r, this.r, 0);
    bubbleClipColous.addColorStop(0, 'rgba(255,255,255,0.75)');
    bubbleClipColous.addColorStop(0.25, 'rgba(255,255,255,1)');
    bubbleClipColous.addColorStop(1, 'rgba(255,255,255,1)');

    const colousStartPositionValue = Math.round(this.r / 4);
    const colousEndPositionValue = diameter - colousStartPositionValue;
    const colous = ctx.createLinearGradient(colousStartPositionValue, colousStartPositionValue, colousEndPositionValue, colousEndPositionValue);
    colous.addColorStop(0, '#ff0000');
    colous.addColorStop(0.2, '#ffff00');
    colous.addColorStop(0.4, '#00ff00');
    colous.addColorStop(0.6, '#00ffff');
    colous.addColorStop(0.8, '#0000ff');
    colous.addColorStop(1, '#ff00ff');

    ctx.globalCompositeOperation = 'xor'
    ctx.fillStyle = bubbleClipColous;
    ctx.arc(this.r, this.r, this.r, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = colous;
    ctx.arc(this.r, this.r, this.r, 0, 2 * Math.PI, false);
    ctx.fill();

    // draw base color.
    ctx.beginPath();
    ctx.globalCompositeOperation = 'destination-over'
    const bubbleBaseColor = ctx.createRadialGradient(this.r, this.r, this.r, this.r, this.r, 0);
    bubbleBaseColor.addColorStop(0, 'rgba(255,255,255,0.7)');
    bubbleBaseColor.addColorStop(0.15, 'rgba(255,255,255,0.3)');
    bubbleBaseColor.addColorStop(0.25, 'rgba(255,255,255,0.15)');
    bubbleBaseColor.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bubbleBaseColor;
    ctx.arc(this.r, this.r, this.r, 0, 2 * Math.PI, false);
    ctx.fill();

    // draw highlight.
    if (this.r > Bubble.showHighlightByR) {
      ctx.beginPath();
      ctx.shadowColor = ctx.strokeStyle = '#ffffff';
      ctx.lineCap = "round";
      ctx.shadowBlur = ctx.lineWidth = Math.round(0.15 * this.r);

      if (this.highlight) ctx.arc(this.r, this.r, 0.7 * this.r, 0, -Math.PI / 8, true);
      else ctx.arc(this.r, this.r, 0.7 * this.r, -Math.PI / 32, -Math.PI * 5 / 32, true);
      ctx.stroke();
      ctx.beginPath();

      const positionDot = this.highlight ? -Math.PI * 7 / 32 : -Math.PI / 4;
      ctx.arc(this.r, this.r, 0.7 * this.r, positionDot, positionDot, true);
      ctx.stroke();
    }
    
    const _ = Bubble.saves.get(this.highlight);
    if (_) _.set(this.r, canvas);
    else Bubble.saves.set(this.highlight, new Map([[this.r, canvas]]));
  }

  /**
   * Get saved bubble image,if none create image and reture that.
   * @returns {HTMLCanvasElement} Bubble image.
   */
  getImage(): HTMLCanvasElement {
    return Bubble.saves.get(this.highlight)?.get(this.r) ?? (this.createImage() as undefined || this.getImage());
  }
}

export class DrawBubble extends Bubble {
  readonly canvas: Canvas;
  x: number;
  y: number;
  vector: Vector;
  private highlightUpdateCount = 0;

  constructor(canvas: Canvas, x: number, y: number, vector: Vector) {
    super(1, Math.random() > 0.5);
    this.canvas = canvas;
    this.x = x;
    this.y = y;
    this.vector = vector;
  }

  updateBubble() {
    if (this.r < this.canvas.bubbleMaxRadius) {
      this.r += this.canvas.addRadius;
      if (this.r > this.canvas.bubbleMaxRadius) this.r = this.canvas.bubbleMaxRadius
    } else if (this.r > this.canvas.bubbleMaxRadius) {
      this.r = this.canvas.bubbleMaxRadius;
    }

    if (this.r > Bubble.showHighlightByR) {
      if (this.highlightUpdateCount > this.canvas.changeHighlightUpdateCount) {
        this.highlightUpdateCount = 0;
        this.highlight = !this.highlight;
      } else this.highlightUpdateCount++;
    }
  }
  move() {
    this.x += this.vector.x * this.canvas.speed;
    this.y += this.vector.y * this.canvas.speed;
  }
  checkAndCalculateBoundaryCollide() {
    const { width, height } = this.canvas.canvas;
    if (this.x < this.r) {
      this.x = this.r;
      this.vector = this.vector.reversalInYAxis();
    } else {
      const right = width - this.r;
      if (this.x > right) {
        this.x = right;
        this.vector = this.vector.reversalInYAxis();
      }
    }

    if (this.y < this.r) {
      this.y = this.r;
      this.vector = this.vector.reversalInXAxis();
    } else {
      const bottom = height - this.r;
      if (this.y > bottom) {
        this.y = bottom;
        this.vector = this.vector.reversalInXAxis();
      }
    }
  }
  checkAndCalculateBubbleCollide(bubble: DrawBubble) {
    /// bubble to this bubble direction.
    const bubbleToThisVector = new Vector(this.x - bubble.x, this.y - bubble.y).vectorUseDirection;
    const sumRadius = this.r + bubble.r;
    if (bubbleToThisVector.value > sumRadius) return;

    /// the have bubble direction moment and tangency moment.
    const thisMoment = this.vector.vectorUseDirection.resolveInDirection(bubbleToThisVector.direction + Math.PI);
    const bubbleMoment = bubble.vector.vectorUseDirection.resolveInDirection(bubbleToThisVector.direction);

    /// new vector is bubble tangency moment add half of recoil moment and collide bubble direction half of moment.
    this.vector = thisMoment.tangencyVector.vector
      .with(new VectorUseDirection(-thisMoment.directionVector.value / 2, thisMoment.directionVector.direction).vector)
      .with(new VectorUseDirection(bubbleMoment.directionVector.value / 2, bubbleMoment.directionVector.direction).vector);
    bubble.vector = bubbleMoment.tangencyVector.vector
      .with(new VectorUseDirection(thisMoment.directionVector.value / 2, thisMoment.directionVector.direction).vector)
      .with(new VectorUseDirection(-bubbleMoment.directionVector.value / 2, bubbleMoment.directionVector.direction).vector);

    /// separation two bubble.
    const move = sumRadius - bubbleToThisVector.value;
    const thisMove = move * bubble.r / sumRadius, bubbleMove = move * this.r / sumRadius;
    this.x += thisMove * Math.cos(bubbleToThisVector.direction);
    this.y += thisMove * Math.sin(bubbleToThisVector.direction);
    bubble.x -= bubbleMove * Math.cos(bubbleToThisVector.direction);
    bubble.y -= bubbleMove * Math.sin(bubbleToThisVector.direction);
  }
}
