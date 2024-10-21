import { ImageSource, Sprite } from '../Graphics';
import { Engine } from '../Engine';
import { Scene } from '../Scene';
import { Transition, TransitionOptions } from './Transition';
import { vec, Vector } from '../Math/vector';
import { Camera } from '../Camera';
import { EasingFunction, EasingFunctions } from '../Util/EasingFunctions';
import { CoordPlane } from '../Math/coord-plane';

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
  easingFunction?: EasingFunction;
}

/**
 * Slide`s between the previous scene and the destination scene
 *
 * Note: Slide` only works as an "in" transition
 */
export class Slide extends Transition {
  private _image!: HTMLImageElement;
  private _screenCover!: Sprite;
  private _easing = EasingFunctions.Linear;
  private _vectorEasing: EasingFunction<Vector>;
  readonly slideDirection: 'up' | 'down' | 'left' | 'right';
  constructor(options: TransitionOptions & SlideOptions) {
    super({ direction: 'in', ...options }); // default the correct direction
    this.name = `Slide#${this.id}`;
    this.slideDirection = options.slideDirection;
    this.transform.coordPlane = CoordPlane.World;
    this.graphics.forceOnScreen = true;
    this._easing = options.easingFunction ?? this._easing;
    this._vectorEasing = EasingFunctions.CreateVectorEasingFunction(this._easing);
  }

  override async onPreviousSceneDeactivate(scene: Scene<unknown>) {
    this._image = await scene.engine.screenshot(true);
    // Firefox is particularly slow
    // needed in case the image isn't ready yet
    await this._image.decode();
    this._screenCover = ImageSource.fromHtmlImageElement(this._image).toSprite();
  }

  private _destinationCameraPosition!: Vector;
  private _startCameraPosition!: Vector;
  private _camera!: Camera;
  private _directionOffset!: Vector;
  override onInitialize(engine: Engine): void {
    this._engine = engine;
    switch (this.slideDirection) {
      case 'up': {
        this._directionOffset = vec(0, -engine.screen.resolution.height);
        break;
      }
      case 'down': {
        this._directionOffset = vec(0, engine.screen.resolution.height);
        break;
      }
      case 'left': {
        this._directionOffset = vec(-engine.screen.resolution.width, 0);
        break;
      }
      case 'right': {
        this._directionOffset = vec(engine.screen.resolution.width, 0);
        break;
      }
    }

    this._camera = this._engine.currentScene.camera;
    this._destinationCameraPosition = this._camera.pos.clone();

    // For sliding shift the camera and the transition slide by offset
    this._camera.pos = this._camera.pos.add(this._directionOffset);
    this.transform.pos = this.transform.pos.add(this._directionOffset);

    this._startCameraPosition = this._camera.pos.clone();

    this.graphics.use(this._screenCover);

    // This is because we preserve hidpi res on the screen shot which COULD be bigger than the logical resolution
    this.transform.scale = vec(1 / engine.screen.pixelRatio, 1 / engine.screen.pixelRatio);
  }

  override onUpdate(progress: number): void {
    // in-transitions count down from 1 -> 0, so our "end" is swapped
    this._camera.pos = this._vectorEasing(progress, this._destinationCameraPosition, this._startCameraPosition, 1);
  }
}
