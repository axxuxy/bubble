import { AutoBubbleCanvas } from "./canvas";

export class WebBubbleCanvas extends AutoBubbleCanvas {
  createCanvas() {
    return document.createElement("canvas");
  }

  get dpi() {
    return window.devicePixelRatio;
  }

  constructor(param?: { maxBubbleCount?: number; density?: number }) {
    super(param);
    this.resetSizeAutoComputed();
    this.canvas.addEventListener("click", ev => {
      this.removeBubbleByPosition(ev.x, ev.y);
    });
  }

  computedSize() {
    const { width, height } = this.canvas;

    const baseSpeed = this.baseSpeed;
    this.canvas.width = (this.canvas.clientWidth || this.canvas.width) * this.dpi;
    this.canvas.height = (this.canvas.clientHeight || this.canvas.height) * this.dpi;
    super.computedSize();
    if (!baseSpeed) return;
    const speedMultiple = baseSpeed / this.baseSpeed;
    this.bubbles.forEach(bubble => {
      bubble.x = bubble.x / width * this.canvas.width;
      bubble.y = bubble.y / height * this.canvas.height;
      bubble.vector.x * speedMultiple;
      bubble.vector.y * speedMultiple;
    });
  }

  /**
   * Listen canvas element size change and reset canvas size data.
   * @returns {ResizeObserver} size observer.
   */
  private resetSizeAutoComputed() {
    const observe = new ResizeObserver(() => {
      this.computedSize();
    });
    observe.observe(this.canvas);
    return observe;
  }
}