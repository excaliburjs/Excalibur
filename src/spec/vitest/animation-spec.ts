import * as ex from '@excalibur';
import { ExcaliburGraphicsContext2DCanvas } from '../../engine/graphics';

class ChildAnimation extends ex.Animation {}

describe('A Graphics Animation', () => {
  it('exists', () => {
    expect(ex.Animation).toBeDefined();
  });

  it('can be constructed', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ]
    });
    expect(anim).toBeDefined();
  });

  it('can be cloned', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ],
      reverse: true,
      frameDuration: 222,
      strategy: ex.AnimationStrategy.Freeze
    });

    const clone = anim.clone();

    expect(clone.frameDuration).toBe(222);
    expect(clone.strategy).toBe(ex.AnimationStrategy.Freeze);
    expect(clone.direction).toBe(ex.AnimationDirection.Backward);
  });

  it('can be defined from a spritesheet', () => {
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const anim = ex.Animation.fromSpriteSheet(ss, [0, 1, 2, 1, 2, 3], 100, ex.AnimationStrategy.Freeze);

    expect(anim.strategy).toBe(ex.AnimationStrategy.Freeze);
    expect(anim.frames[0].duration).toBe(100);
    expect(anim.frames.length).toBe(6);
  });

  it('can be defined from spritesheet coordinates', () => {
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const anim = ex.Animation.fromSpriteSheetCoordinates({
      spriteSheet: ss,
      frameCoordinates: [
        { x: 0, y: 0, duration: 100, options: { flipHorizontal: true } },
        { x: 1, y: 0, duration: 100, options: { flipVertical: true } },
        { x: 2, y: 0, duration: 100 },
        { x: 3, y: 0, duration: 100 }
      ],
      strategy: ex.AnimationStrategy.Freeze
    });

    expect(anim.strategy).toBe(ex.AnimationStrategy.Freeze);
    expect(anim.frames[0].duration).toBe(100);
    expect(anim.frames[0].graphic.flipHorizontal).toBe(true);
    expect(anim.frames[1].graphic.flipVertical).toBe(true);
    expect(anim.frames.length).toBe(4);
  });

  it('correctly calculates size based on scale', () => {
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const anim = ex.Animation.fromSpriteSheet(ss, [0, 1, 2, 3], 100, ex.AnimationStrategy.Freeze);

    expect(anim.width).toBe(10);
    expect(anim.height).toBe(10);
    expect(anim.localBounds).toEqual(ex.BoundingBox.fromDimension(10, 10, ex.Vector.Zero));
    anim.scale = ex.vec(2, 2);
    expect(anim.width).toBe(20);
    expect(anim.height).toBe(20);
    expect(anim.localBounds).toEqual(ex.BoundingBox.fromDimension(20, 20, ex.Vector.Zero));
    anim.goToFrame(1);
    expect(anim.width).toBe(20);
    expect(anim.height).toBe(20);
    expect(anim.localBounds).toEqual(ex.BoundingBox.fromDimension(20, 20, ex.Vector.Zero));
  });

  it('can be reversed', () => {
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const anim = ex.Animation.fromSpriteSheet(ss, [0, 1, 2, 3], 100, ex.AnimationStrategy.Freeze);
    anim.goToFrame(1);
    anim.reverse();

    expect(anim.strategy).toBe(ex.AnimationStrategy.Freeze);
    expect(anim.frames[0].duration).toBe(100);
    expect(anim.frames.length).toBe(4);
    expect(anim.currentFrameIndex).toBe(1);
    expect(anim.direction).toBe(ex.AnimationDirection.Backward);
  });

  it('can be reversed with ping-pong', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      strategy: ex.AnimationStrategy.PingPong,
      reverse: true,
      frames: [
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect,
          duration: 100
        }
      ]
    });

    expect(anim.direction).toBe(ex.AnimationDirection.Backward);
    anim.play();
    anim.tick(50, 0);
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(50, 1);
    expect(anim.currentFrame).toBe(anim.frames[1]);
    anim.tick(100, 2);
    expect(anim.currentFrame).toBe(anim.frames[2]);
    anim.tick(100, 3);
    expect(anim.currentFrame).toBe(anim.frames[1]);
    expect(anim.direction).toBe(ex.AnimationDirection.Forward);
  });

  it('warns if constructed with invalid indices', () => {
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');
    const invalidIndices = [-1, -2, 101, 102];
    const anim = ex.Animation.fromSpriteSheet(ss, invalidIndices, 100, ex.AnimationStrategy.Freeze);

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledExactlyOnceWith(
      `Indices into SpriteSheet were provided that don't exist: frames ${invalidIndices.join(',')} will not be shown`
    );
    expect(anim.strategy).toBe(ex.AnimationStrategy.Freeze);
    // expect(anim.frames[0].duration).toBe(100);
    expect(anim.frames.length).toBe(0);
  });

  it('is playing and looping by default', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ]
    });
    expect(anim.isPlaying).toBe(true);
    expect(anim.strategy).toBe(ex.AnimationStrategy.Loop);
  });

  it('only ticks once per frame', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ]
    });

    expect((anim as any)._timeLeftInFrame).toBe(100);
    anim.tick(1, 1234);
    anim.tick(1, 1234);
    anim.tick(1, 1234);
    anim.tick(1, 1234);
    expect((anim as any)._timeLeftInFrame).toBe(99);
  });

  it('can be played with end strategy', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      strategy: ex.AnimationStrategy.End,
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ]
    });
    expect(anim.canFinish).toBe(true);
    expect(anim.done).toBe(false);
    anim.play();
    anim.tick(50, 0);
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(50, 1);
    expect(anim.currentFrame).toBe(null);
    expect(anim.done).toBe(true);
  });

  it('can be played with loop strategy', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      strategy: ex.AnimationStrategy.Loop,
      frames: [
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect,
          duration: 100
        }
      ]
    });
    expect(anim.canFinish).toBe(false);
    anim.play();
    anim.tick(50, 0);
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(50, 1);
    expect(anim.currentFrame).toBe(anim.frames[1]);
    anim.tick(100, 2);
    expect(anim.currentFrame).toBe(anim.frames[0]);
  });

  it('can be played with ping pong strategy', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      strategy: ex.AnimationStrategy.PingPong,
      frames: [
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect,
          duration: 100
        }
      ]
    });
    expect(anim.canFinish).toBe(false);
    anim.play();
    anim.tick(50, 0);
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(50, 1);
    expect(anim.currentFrame).toBe(anim.frames[1]);
    anim.tick(100, 2);
    expect(anim.currentFrame).toBe(anim.frames[2]);
    anim.tick(100, 3);
    expect(anim.currentFrame).toBe(anim.frames[1]);
    anim.tick(100, 4);
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(100, 5);
    expect(anim.currentFrame).toBe(anim.frames[1]);
    anim.tick(100, 6);
    expect(anim.currentFrame).toBe(anim.frames[2]);
    anim.tick(100, 7);
    expect(anim.currentFrame).toBe(anim.frames[1]);
  });

  it('can be played with freeze frame strategy', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      strategy: ex.AnimationStrategy.Freeze,
      frames: [
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect,
          duration: 100
        }
      ]
    });
    expect(anim.canFinish).toBe(true);
    anim.play();
    anim.tick(50, 0);
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(50, 1);
    expect(anim.currentFrame).toBe(anim.frames[1]);
    anim.tick(100, 2);
    expect(anim.currentFrame).toBe(anim.frames[1]);
    anim.tick(100, 3);
    expect(anim.currentFrame).toBe(anim.frames[1]);
  });

  it('has animation events', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      strategy: ex.AnimationStrategy.End,
      frames: [
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect,
          duration: 100
        }
      ]
    });

    const looper = new ex.Animation({
      strategy: ex.AnimationStrategy.Loop,
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ]
    });

    const onFrame = vi.fn();
    const onEnd = vi.fn();
    const onLoop = vi.fn();
    anim.events.on('frame', onFrame);
    anim.events.on('end', onEnd);
    looper.events.on('loop', onLoop);
    anim.tick(100, 0);
    anim.tick(100, 1);
    looper.tick(100, 0);
    looper.tick(100, 1);

    expect(onFrame).toHaveBeenCalledTimes(2);
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onLoop).toHaveBeenCalledTimes(2);
  });

  it('can be paused or reset', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      strategy: ex.AnimationStrategy.End,
      frames: [
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect,
          duration: 100
        }
      ]
    });

    const onFrame = vi.fn();
    anim.events.on('frame', onFrame);
    anim.tick(100, 0);
    anim.pause();
    anim.tick(100, 1);
    expect(anim.currentFrame).toBe(anim.frames[1]);

    anim.reset();
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(100, 2);
    // Reset should re-fire the first tick frame event
    expect(onFrame).toHaveBeenCalledTimes(2);
  });

  it('@visual draws the right frame to the screen', async () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const rect2 = new ex.Rectangle({
      width: 90,
      height: 90,
      color: ex.Color.Yellow
    });
    const rect3 = new ex.Rectangle({
      width: 80,
      height: 80,
      color: ex.Color.Red
    });
    const anim = new ex.Animation({
      strategy: ex.AnimationStrategy.End,
      frames: [
        {
          graphic: rect,
          duration: 100
        },
        {
          graphic: rect2,
          duration: 100
        },
        {
          graphic: rect3,
          duration: 100
        }
      ]
    });

    const output = document.createElement('canvas');
    output.width = 100;
    output.height = 100;
    const ctx = new ExcaliburGraphicsContext2DCanvas({ canvasElement: output });

    ctx.clear();
    anim.draw(ctx, 0, 0);
    await expect(output).toEqualImage('/src/spec/assets/images/graphics-animation-spec/frame-1.png');

    ctx.clear();
    anim.tick(100, 0);
    anim.draw(ctx, 0, 0);
    await expect(output).toEqualImage('/src/spec/assets/images/graphics-animation-spec/frame-2.png');

    ctx.clear();
    anim.tick(100, 1);
    anim.draw(ctx, 0, 0);
    await expect(output).toEqualImage('/src/spec/assets/images/graphics-animation-spec/frame-3.png');
  });

  it('calculate automatically the frame duration based on the animation total duration', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const totalDuration = 1000;
    const frames = [
      {
        graphic: rect
      },
      {
        graphic: rect
      }
    ];
    const expectedFrameDuration = totalDuration / frames.length;
    const anim = new ex.Animation({
      totalDuration,
      frames: frames
    });

    expect(anim.frameDuration).toBe(expectedFrameDuration);
    anim.play();
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(expectedFrameDuration, 0);
    expect(anim.currentFrame).toBe(anim.frames[1]);
    anim.tick(expectedFrameDuration, 2);
    expect(anim.currentFrame).toBe(anim.frames[0]);
  });

  it('has a current time left in a frame', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const frames: ex.Frame[] = [
      {
        graphic: rect,
        duration: 100
      },
      {
        graphic: rect,
        duration: 100
      }
    ];
    const anim = new ex.Animation({
      frames: frames
    });
    anim.play();
    expect(anim.currentFrameIndex).toBe(0);
    expect(anim.currentFrameTimeLeft).toBe(100);
    anim.tick(10, 1);
    expect(anim.currentFrameIndex).toBe(0);
    expect(anim.currentFrameTimeLeft).toBe(90);
    anim.tick(10, 2);
    expect(anim.currentFrameIndex).toBe(0);
    expect(anim.currentFrameTimeLeft).toBe(80);
    anim.tick(80, 3);
    expect(anim.currentFrameIndex).toBe(1);
    expect(anim.currentFrameTimeLeft).toBe(100);
  });

  it('reset will reset time in frame', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const frames: ex.Frame[] = [
      {
        graphic: rect,
        duration: 100
      },
      {
        graphic: rect,
        duration: 100
      }
    ];
    const anim = new ex.Animation({
      frames: frames
    });
    anim.play();
    expect(anim.currentFrameIndex).toBe(0);
    expect(anim.currentFrameTimeLeft).toBe(100);
    anim.tick(60, 1);
    expect(anim.currentFrameIndex).toBe(0);
    expect(anim.currentFrameTimeLeft).toBe(40);
    anim.reset();
    expect(anim.currentFrameTimeLeft).toBe(100);
  });

  it('can go to a frame with an overridden duration', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const frames: ex.Frame[] = [
      {
        graphic: rect,
        duration: 100
      },
      {
        graphic: rect,
        duration: 100
      }
    ];
    const anim = new ex.Animation({
      frames: frames
    });
    anim.play();
    expect(anim.currentFrameIndex).toBe(0);
    expect(anim.currentFrameTimeLeft).toBe(100);

    anim.goToFrame(1, 50);
    expect(anim.currentFrameIndex).toBe(1);
    expect(anim.currentFrameTimeLeft).toBe(50);
  });

  it('can adjust playback speed', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const frames: ex.Frame[] = [
      {
        graphic: rect,
        duration: 100
      },
      {
        graphic: rect,
        duration: 100
      }
    ];
    const anim = new ex.Animation({
      frames: frames,
      speed: 2
    });
    anim.play();
    expect(anim.currentFrameIndex).toBe(0);
    expect(anim.currentFrameTimeLeft).toBe(100);

    anim.tick(20, 1);
    expect(anim.currentFrameIndex).toBe(0);
    expect(anim.currentFrameTimeLeft).toBe(60);
  });

  it('can adjust playback speed (only positive', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const frames: ex.Frame[] = [
      {
        graphic: rect,
        duration: 100
      },
      {
        graphic: rect,
        duration: 100
      }
    ];
    const anim = new ex.Animation({
      frames: frames
    });
    anim.speed = -100;
    expect(anim.speed).toBe(100);

    anim.speed = 0;
    expect(anim.speed).toBe(0);

    anim.speed = 100;
    expect(anim.speed).toBe(100);
  });

  it('can be reset during the end event (end)', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const frames: ex.Frame[] = [
      {
        graphic: rect,
        duration: 100
      },
      {
        graphic: rect,
        duration: 100
      }
    ];
    const anim = new ex.Animation({
      frames: frames,
      strategy: ex.AnimationStrategy.End
    });
    const endSpy = vi.fn(() => {
      anim.reset();
      expect(anim.currentFrameIndex).toBe(0);
    });
    anim.events.once('end', endSpy);
    anim.play();
    expect(anim.currentFrameIndex).toBe(0);
    anim.tick(100, 1);
    expect(anim.currentFrameIndex).toBe(1);
    anim.tick(100, 2);
    expect(endSpy).toHaveBeenCalledOnce();
    expect(anim.currentFrameIndex).toBe(0);
  });

  it('can be reset during the end event (freeze)', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const frames: ex.Frame[] = [
      {
        graphic: rect,
        duration: 100
      },
      {
        graphic: rect,
        duration: 100
      }
    ];
    const anim = new ex.Animation({
      frames: frames,
      strategy: ex.AnimationStrategy.Freeze
    });
    const endSpy = vi.fn(() => {
      anim.reset();
      expect(anim.currentFrameIndex).toBe(0);
    });
    anim.events.once('end', endSpy);
    anim.play();
    expect(anim.currentFrameIndex).toBe(0);
    anim.tick(100, 1);
    expect(anim.currentFrameIndex).toBe(1);
    anim.tick(100, 2);
    expect(endSpy).toHaveBeenCalledOnce();
    expect(anim.currentFrameIndex).toBe(0);
  });

  it('can store custom data', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });

    const anim = new ex.Animation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ],
      data: {
        customKey: 'customValue'
      }
    });

    expect(anim.data.get('customKey')).toBe('customValue');
    expect(anim.data.has('nonExistentKey')).toBe(false);
  });

  it('can store custom data if created from sprite sheet', () => {
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const anim = ex.Animation.fromSpriteSheet(ss, [0, 1, 2, 3], 100, ex.AnimationStrategy.Freeze, {
      customKey: 'customValue'
    });

    expect(anim.data.get('customKey')).toBe('customValue');
    expect(anim.data.has('nonExistentKey')).toBe(false);
  });

  it('can store custom data if created from sprite sheet coordinates', () => {
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const anim = ex.Animation.fromSpriteSheetCoordinates({
      spriteSheet: ss,
      frameCoordinates: [
        { x: 0, y: 0, duration: 100 },
        { x: 1, y: 0, duration: 100 },
        { x: 2, y: 0, duration: 100 },
        { x: 3, y: 0, duration: 100 }
      ],
      strategy: ex.AnimationStrategy.Freeze,
      data: {
        customKey: 'customValue'
      }
    });

    expect(anim.data.get('customKey')).toBe('customValue');
    expect(anim.data.has('nonExistentKey')).toBe(false);
  });

  it('can store custom data after being created', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ]
    });

    expect(anim.data.size).toBe(0);
    anim.data.set('customKey', 'customValue');
    expect(anim.data.get('customKey')).toBe('customValue');
    expect(anim.data.has('nonExistentKey')).toBe(false);
  });

  it('creates an empty map when undefined data is passed', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Animation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ],
      data: undefined
    });

    expect(anim.data).toBeInstanceOf(Map);
    expect(anim.data.size).toBe(0);
  });

  it('returns an instance of the subclass if created from sprite sheet', () => {
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const anim = ChildAnimation.fromSpriteSheet(ss, [0, 1, 2, 3], 100, ex.AnimationStrategy.Freeze);

    expect(anim).toBeInstanceOf(ChildAnimation);
  });

  it('returns an instance of the subclass if created from sprite sheet coordinates', () => {
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const anim = ChildAnimation.fromSpriteSheetCoordinates({
      spriteSheet: ss,
      frameCoordinates: [
        { x: 0, y: 0, duration: 100 },
        { x: 1, y: 0, duration: 100 },
        { x: 2, y: 0, duration: 100 },
        { x: 3, y: 0, duration: 100 }
      ],
      strategy: ex.AnimationStrategy.Freeze
    });

    expect(anim).toBeInstanceOf(ChildAnimation);
  });

  it('can be cloned as a subclass', () => {
    const rect = new ex.Rectangle({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ChildAnimation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ]
    });

    const clone = anim.clone();

    expect(clone).toBeInstanceOf(ChildAnimation);
  });
});
