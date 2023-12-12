import { deg360, deg90 } from "./deg";

/**
 * @param {number} x the vector in x value, if x less then 0,the direction is 180 degress.
 * @param {number} y the vector in y value, if y less then 0,the direction is 270 degress.
 * @param {VectorUseDirection} vectorUseDirection convert to use direction vector.
 */
export class Vector {
  /**
   * the vector in x direction value.
   */
  x: number;
  /**
   * * the vector in y direction value.
   */
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  with(vector: Vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  reversalInYAxis() {
    return new Vector(-this.x, this.y);
  }
  reversalInXAxis() {
    return new Vector(this.x, -this.y);
  }

  private _vectorUseDirection: VectorUseDirection | undefined;
  /**
   * convert to use direction vector.
   */
  get vectorUseDirection() {
    if (!this._vectorUseDirection) this._vectorUseDirection = this.createVectorUseDirection();
    return this._vectorUseDirection;
  }
  private createVectorUseDirection() {
    const value = Math.sqrt(this.x * this.x + this.y * this.y);
    let cos = Math.acos(this.x / value);
    if (this.y < 0) cos = deg360 - cos;
    return new VectorUseDirection(value, cos);
  }
}

/**
 * @param {number} value the vector value.
 * @param {number} direction the vector direction.
 * @param {Vector} vector convert to use x.y vector.
 * @param {VectorUseDirection["resolveInDirection"]} resolveInDirection reslove the vector in direction.
 */
export class VectorUseDirection {
  /**
   * the vector value.
   */
  readonly value: number;
  /**
   * the vector direction.
   */
  readonly direction: number;

  /**
   * @param {number} value the vector value.
   * @param {number} direction the vector direction.
   */
  constructor(value: number, direction: number) {
    this.value = value;
    this.direction = direction;
  }

  private _vector: Vector | undefined;
  /**
   * convert to use x.y vector.
   */
  get vector() {
    if (!this._vector) this._vector = this.createVector();
    return this._vector;
  }
  private createVector() {
    return new Vector(this.value * Math.cos(this.direction), this.value * Math.sin(this.direction));
  }

  /**
   * use direction resolve the vector.
   * @argument direction resolve direction.
   * @returns {VectorResolveDirection} vector resolve objection.
   */
  resolveInDirection(direction: number) {
    return new VectorResolveDirection(this, direction);
  }
}

/**
 * @param {VectorUseDirection} vector need resolve vector.
 * @param {number} direction radian of resolve direction.
 * @param {VectorUseDirection} directionVector forward direction vector.
 * @param {VectorUseDirection} tangencyVector tangency direction vector.
 */
export class VectorResolveDirection {
  /**
   * need resolve vector.
   */
  readonly vector: VectorUseDirection;
  /**
   * radian of resolve direction.
   */
  readonly direction: number;

  /**
   * @param vector need resolve vector.
   * @param direction radian of resolve direction.
   */
  constructor(vector: VectorUseDirection, direction: number) {
    this.vector = vector;
    this.direction = direction;
  }

  private _deg: number | undefined;
  /**
   * direction and vector degle.
   */
  private get deg() {
    if (this._deg === undefined) this._deg = this.direction - this.vector.direction;
    return this._deg;
  };
  private _directionVector: VectorUseDirection | undefined;
  /**
   * forward direction vector.
   */
  get directionVector() {
    if (!this._directionVector) this._directionVector = this.createDirectionVector();
    return this._directionVector;
  }
  private createDirectionVector() {
    return new VectorUseDirection(this.vector.value * Math.cos(this.deg), this.direction);
  }

  private _tangencyVector: VectorUseDirection | undefined;
  /**
   * tangency direction vector.
   */
  get tangencyVector() {
    if (!this._tangencyVector) this._tangencyVector = this.createTangencyVector();
    return this._tangencyVector;
  }
  private createTangencyVector() {
    return new VectorUseDirection(this.vector.value * Math.sin(this.deg), this.direction - deg90);
  }
}