import { DrawBubble } from "./bubble";
import { Vector, VectorUseDirection } from "./vector";

export abstract class Canvas {
  /** Create canvas element. */
  abstract createCanvas(): HTMLCanvasElement;
  /** Canvas 2d context. */
  readonly ctx: CanvasRenderingContext2D;
  /** Canvas element. */
  get canvas() {
    return this.ctx.canvas;
  }
  /** All bubbles. */
  private _bubbles = new Set<DrawBubble>();
  get bubbles() {
    return [...this._bubbles];
  }
  /** Bubble count. */
  get bubbleCount() {
    return this._bubbles.size;
  }
  /** Screen dpi. */
  abstract readonly dpi: number;
  /** Bubble max radius. */
  abstract bubbleMaxRadius: number;
  /** Every add radius. */
  abstract addRadius: number;
  /** Change highlight need update count. */
  abstract changeHighlightUpdateCount: number;
  /** Speed multiple */
  speed = 1;

  constructor() {
    this.ctx = this.createCanvas().getContext("2d");
  }

  /** Draw bubbles. */
  private drawBubble() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this._bubbles.forEach(bubble => {
      if (bubble.r >= 1) {
        const x = bubble.x - bubble.r;
        /// Need will axis position of bubble conver to canvas position.
        const y = this.canvas.height - bubble.y - bubble.r;
        if (bubble.r === 1) {
          this.ctx.fillStyle = '#fff';
          this.ctx.fillRect(x, y, 2, 2);
          return;
        }
        this.ctx.drawImage(bubble.getImage(), x, y);
      }
    });
  }

  /** Update canvas and bubble state. */
  updateCanvas() {
    /// Draw bubble.
    this.drawBubble();

    /// Update bubble date.
    const bubbles = this.bubbles;
    bubbles.forEach((bubble, index) => {
      bubble.updateBubble();
      bubble.move();
      for (let x = index + 1; x < bubbles.length; x++) {
        bubble.checkAndCalculateBubbleCollide(bubbles[x]);
      }
      bubble.checkAndCalculateBoundaryCollide();
    });
  }

  /**
   * Add bubble.
   * @param x Position x value.
   * @param y Position y value.
   * @param vector The bubble vector.
   */
  protected addBubble(x: number, y: number, vector: Vector) {
    this._bubbles.add(new DrawBubble(this, x, y, vector));
  }

  /**
 * Remove point position bubble.
 * @param {number} x Position x value.
 * @param {number} y Position y value.
 * @returns {number} Remove bubble count.
 */
  protected removeBubbleByPosition(x: number, y: number) {
    x *= this.dpi;
    y = this.canvas.height - y * this.dpi;
    this._bubbles.forEach(bubble => {
      if (Math.pow(bubble.r, 2) > (Math.pow(bubble.x - x, 2) + Math.pow(bubble.y - y, 2))) {
        this._bubbles.delete(bubble);
      }
    });
  }

  private _animationKey?: ReturnType<typeof requestAnimationFrame>;
  /** Is runing animation. */
  get isAnimation() {
    return this._animationKey !== undefined;
  }
  private _animation() {
    this.updateCanvas();
    this._animationKey = requestAnimationFrame(() => {
      this._animation();
    });
  }

  /** Run animation. */
  animation() {
    if (this._animationKey) throw new Error("The canvas is runing amimation.");
    this._animation();
  }

  /** Stop animation. */
  stopAnimation() {
    if (!this._animationKey) throw new Error("The canvas not runing animation.");
    cancelAnimationFrame(this._animationKey);
    this._animationKey = undefined;
  }
}

export abstract class AutoBubbleCanvas extends Canvas {
  readonly changeHighlightUpdateCount = 10;

  /** Bubble max count. */
  private readonly maxBubbleCount: number;

  private readonly density: number;

  constructor({ maxBubbleCount = 0, density = 0.64 }: { maxBubbleCount?: number; density?: number } = {}) {
    super();
    this.maxBubbleCount = maxBubbleCount;
    this.density = density;
    this.computedSize();
    this.addBubble(this.maxBubbleCount);
    this.animation();
  }

  private _bubbleMaxRadius: number;
  get bubbleMaxRadius() {
    return this._bubbleMaxRadius;
  };

  private _addRadius: number;
  get addRadius() {
    return this._addRadius;
  }

  /**
   * Bubble move speed multiple.
   * Reset size auto set use max bubble radius value/50.
   */
  private _baseSpeed: number;
  get baseSpeed() {
    return this._baseSpeed;
  }

  /** Reset bubble max radius */
  protected computedSize() {
    const area = this.canvas.width * this.canvas.height;
    this._bubbleMaxRadius = Math.floor(Math.sqrt(area / this.maxBubbleCount / 5) * this.density);
    this._addRadius = this._bubbleMaxRadius / 500;
    this._baseSpeed = this._bubbleMaxRadius / 50;
  }

  /**
   * Add bubble.
   * @param count Add bubble count, default is 1,min is 0.
   */
  protected addBubble(count: number) {
    const {
      width,
      height
    } = this.canvas;

    for (let index = 0; index < count; index++) {
      if (this.bubbleCount >= this.maxBubbleCount) return;
      super.addBubble(
        width * Math.random(),
        height * Math.random(),
        new VectorUseDirection(Math.random() * this.baseSpeed, Math.random() * Math.PI).vector
      )
    }
  }

  /** Reomve bubble count. */
  private removeBubbleCount = 0;
  protected removeBubbleByPosition(x: number, y: number) {
    super.removeBubbleByPosition(x, y);
    const count = this.maxBubbleCount - this.bubbleCount;
    this.removeBubbleCount += count;
    if (this.removeBubbleCount) this.speed = Math.ceil(this.removeBubbleCount / 5);
    this.addBubble(count);
  }
}
