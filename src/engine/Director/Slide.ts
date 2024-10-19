import { ImageSource, Sprite } from '../Graphics';
import { Engine } from '../Engine';
import { Scene } from '../Scene';
import { Transition, TransitionOptions } from './Transition';
import { vec, Vector } from '../Math/vector';
import { Camera } from '../Camera';
import { lerp } from '../Math/util';

export interface SlideOptions {
  duration: number;
  slideDirection: 'up' | 'down' | 'left' | 'right';
}

/**
 * Slide`s between the previous scene and the destination scene
 *
 * Note: Slide` only works as an "in" transition
 */
export class Slide extends Transition {
  engine: Engine;
  image: HTMLImageElement;
  screenCover: Sprite;
  readonly slideDirection: 'up' | 'down' | 'left' | 'right';
  constructor(options: TransitionOptions & SlideOptions) {
    super({ direction: 'in', ...options }); // default the correct direction
    this.name = `Slide#${this.id}`;
    this.slideDirection = options.slideDirection;
  }

  override async onPreviousSceneDeactivate(scene: Scene<unknown>) {
    this.image = await scene.engine.screenshot(true);
    // Firefox is particularly slow
    // needed in case the image isn't ready yet
    await this.image.decode();
  }

  private _destinationCameraPosition: Vector;
  private _startCameraPosition: Vector;
  private _camera: Camera;
  private _directionOffset: Vector;
  override onInitialize(engine: Engine): void {
    this.engine = engine;
    this.transform.pos = engine.screen.unsafeArea.topLeft;
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
    // For sliding shift the camera to the left
    this._camera = this.engine.currentScene.camera;
    this._destinationCameraPosition = this._camera.pos.clone();
    this._camera.pos = this._camera.pos.add(this._directionOffset);
    this._startCameraPosition = this._camera.pos.clone();

    this.screenCover = ImageSource.fromHtmlImageElement(this.image).toSprite();
    this.graphics.add(this.screenCover);
    // This is because we preserve hidpi res on the screen shot which COULD be bigger than the logical resolution
    this.transform.scale = vec(1 / engine.screen.pixelRatio, 1 / engine.screen.pixelRatio);
  }

  override onStart(_progress: number): void {
    this._camera.pos = this._destinationCameraPosition;
  }

  override onReset() {
    this._camera.pos = this._destinationCameraPosition;
  }

  override onEnd(progress: number): void {
    this._camera.pos = this._startCameraPosition;
  }

  override onUpdate(progress: number): void {
    // in transitions count down from 1 -> 0, so our "end" is swapped
    this.transform.pos = lerp(this._directionOffset, vec(0, 0), progress);
    this._camera.pos = lerp(this._destinationCameraPosition, this._startCameraPosition, progress);
  }
}
