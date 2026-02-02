import type { Sprite } from '../graphics';
import { ImageSource } from '../graphics';
import type { Engine } from '../engine';
import type { Scene } from '../scene';
import type { TransitionOptions } from './transition';
import { Transition } from './transition';
import { Vector } from '../math/vector';
import { vec } from '../math/vector';
import { CoordPlane } from '../math/coord-plane';
import { lerp } from '../math/lerp';
import type { Camera } from '../camera';
import type { Easing } from '../math/easings';
import { linear } from '../math/easings';

export interface SlideOptions {
  /**
   * Duration of the transition in milliseconds
   */
  duration: number;
  /**
   * Slide direction for the previous scene to move: up, down, left, right
   */
  slideDirection: 'up' | 'down' | 'left' | 'right';
  /**
   * Optionally select an easing function, by default linear (aka lerp)
   */
  easingFunction?: Easing;
}

/**
 * Slide`s between the previous scene and the destination scene
 *
 * Note: Slide` only works as an "in" transition
 */
export class Slide extends Transition {
  private _image!: HTMLImageElement;
  private _screenCover!: Sprite;
  private _easing = linear;
  readonly slideDirection: 'up' | 'down' | 'left' | 'right';
  private _start: Vector = Vector.Zero;
  private _end: Vector = Vector.Zero;
  private _camera!: Camera;
  private _destinationCameraPosition!: Vector;
  private _startCameraPosition!: Vector;
  constructor(options: TransitionOptions & SlideOptions) {
    super({ direction: 'in', ...options }); // default the correct direction
    this.name = `Slide#${this.id}`;
    this.slideDirection = options.slideDirection;
    this.transform.coordPlane = CoordPlane.Screen;
    this.graphics.forceOnScreen = true;
    this._easing = options.easingFunction ?? this._easing;
  }

  override async onPreviousSceneDeactivate(scene: Scene<unknown>) {
    this._image = await scene.engine.screenshot(true);
    // Firefox is particularly slow
    // needed in case the image isn't ready yet
    await this._image.decode();
    this._screenCover = ImageSource.fromHtmlImageElement(this._image).toSprite();
  }

  private _directionOffset!: Vector;
  override onInitialize(engine: Engine): void {
    this._engine = engine;
    let bounds = engine.screen.unsafeArea;
    if (bounds.hasZeroDimensions()) {
      bounds = engine.screen.contentArea;
    }
    switch (this.slideDirection) {
      case 'up': {
        this._directionOffset = vec(0, -bounds.height);
        break;
      }
      case 'down': {
        this._directionOffset = vec(0, bounds.height);
        break;
      }
      case 'left': {
        this._directionOffset = vec(-bounds.width, 0);
        break;
      }
      case 'right': {
        this._directionOffset = vec(bounds.width, 0);
        break;
      }
    }
    this._camera = this._engine.currentScene.camera;
    this._destinationCameraPosition = this._camera.pos.clone();

    // For sliding shift the camera and the transition slide by offset
    this._camera.pos = this._camera.pos.add(this._directionOffset);
    this.transform.pos = this.transform.pos.add(this._directionOffset);

    this._startCameraPosition = this._camera.pos.clone();

    this._start = bounds.topLeft;
    this._end = this._start.add(this._directionOffset);
    this.transform.pos = this._start;

    this.graphics.use(this._screenCover);

    // This is because we preserve hidpi res on the screen shot which COULD be bigger than the logical resolution
    this.transform.scale = vec(1 / engine.screen.pixelRatio, 1 / engine.screen.pixelRatio);
  }

  override onStart(progress: number): void {
    const time = this._easing(this.distance);
    this.transform.pos.x = lerp(this._start.x, this._end.x, time);
    this.transform.pos.y = lerp(this._start.y, this._end.y, time);
    this._camera.pos.x = lerp(this._startCameraPosition.x, this._destinationCameraPosition.x, time);
    this._camera.pos.y = lerp(this._startCameraPosition.y, this._destinationCameraPosition.y, time);
  }

  override onUpdate(progress: number): void {
    const time = this._easing(this.distance);
    this.transform.pos.x = lerp(this._start.x, this._end.x, time);
    this.transform.pos.y = lerp(this._start.y, this._end.y, time);
    this._camera.pos.x = lerp(this._startCameraPosition.x, this._destinationCameraPosition.x, time);
    this._camera.pos.y = lerp(this._startCameraPosition.y, this._destinationCameraPosition.y, time);
  }
}
