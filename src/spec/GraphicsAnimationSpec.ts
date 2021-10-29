import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import { ExcaliburGraphicsContext2DCanvas } from '../engine/Graphics';

describe('A Graphics Animation', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

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
    const anim = ex.Animation.fromSpriteSheet(ss, [0, 1, 2, 3], 100, ex.AnimationStrategy.Freeze);

    expect(anim.strategy).toBe(ex.AnimationStrategy.Freeze);
    expect(anim.frames[0].duration).toBe(100);
    expect(anim.frames.length).toBe(4);
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
    spyOn(logger, 'warn');
    const invalidIndices = [-1, -2, 101, 102];
    const anim = ex.Animation.fromSpriteSheet(ss, invalidIndices, 100, ex.AnimationStrategy.Freeze);

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledOnceWith(
      `Indices into SpriteSheet were provided that don\'t exist: ${invalidIndices.join(',')} no frame will be shown`
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

    const onFrame = jasmine.createSpy('onFrame');
    const onEnd = jasmine.createSpy('onEnd');
    const onLoop = jasmine.createSpy('onLoop');
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

    const onFrame = jasmine.createSpy('onFrame');
    anim.events.on('frame', onFrame);
    anim.tick(100, 0);
    anim.pause();
    anim.tick(100, 1);
    expect(anim.currentFrame).toBe(anim.frames[1]);

    anim.reset();
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(100, 2);
    // Reseting should re-fire the first tick frame event
    expect(onFrame).toHaveBeenCalledTimes(2);
  });

  it('draws the right frame to the screen', async () => {
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
    await expectAsync(output).toEqualImage('src/spec/images/GraphicsAnimationSpec/frame-1.png');

    ctx.clear();
    anim.tick(100, 0);
    anim.draw(ctx, 0, 0);
    await expectAsync(output).toEqualImage('src/spec/images/GraphicsAnimationSpec/frame-2.png');

    ctx.clear();
    anim.tick(100, 1);
    anim.draw(ctx, 0, 0);
    await expectAsync(output).toEqualImage('src/spec/images/GraphicsAnimationSpec/frame-3.png');
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
});
