import type { Sprite } from '../Graphics';
import { ImageSource } from '../Graphics';
import type { Engine } from '../Engine';
import type { Scene } from '../Scene';
import type { TransitionOptions } from './Transition';
import { Transition } from './Transition';
import { vec } from '../Math/vector';

export interface CrossFadeOptions {
  duration: number;
}

/**
 * CrossFades between the previous scene and the destination scene
 *
 * Note: CrossFade only works as an "in" transition
 */
export class CrossFade extends Transition {
  engine!: Engine;
  image!: HTMLImageElement;
  screenCover!: Sprite;
  constructor(options: TransitionOptions & CrossFadeOptions) {
    super({ direction: 'in', ...options }); // default the correct direction
    this.name = `CrossFade#${this.id}`;
  }

  override async onPreviousSceneDeactivate(scene: Scene<unknown>) {
    this.image = await scene.engine.screenshot(true);
    // Firefox is particularly slow
    // needed in case the image isn't ready yet
    await this.image.decode();
  }

  override onInitialize(engine: Engine): void {
    this.engine = engine;
    this.transform.pos = engine.screen.unsafeArea.topLeft;
    this.screenCover = ImageSource.fromHtmlImageElement(this.image).toSprite();
    this.graphics.add(this.screenCover);

    // This is because we preserve hidpi res on the screen shot which COULD be bigger than the logical resolution
    this.transform.scale = vec(1 / engine.screen.pixelRatio, 1 / engine.screen.pixelRatio);
    this.graphics.opacity = this.progress;
  }

  override onStart(_progress: number): void {
    this.graphics.opacity = this.progress;
  }

  override onReset() {
    this.graphics.opacity = this.progress;
  }

  override onEnd(progress: number): void {
    this.graphics.opacity = progress;
  }

  override onUpdate(progress: number): void {
    this.graphics.opacity = progress;
  }
}
