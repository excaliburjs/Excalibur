import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';
import { ExcaliburGraphicsContext2DCanvas } from '../engine/Graphics';


fdescribe('A Graphics Animation', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('exists', () => {
    expect(ex.Graphics.Animation).toBeDefined();
  });

  it('can be constructed', () => {
    const rect = new ex.Graphics.Rect({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Graphics.Animation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ]
    });
    expect(anim).toBeDefined();
  });

  it('is playing and looping by default', () => {
    const rect = new ex.Graphics.Rect({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Graphics.Animation({
      frames: [
        {
          graphic: rect,
          duration: 100
        }
      ]
    });
    expect(anim.isPlaying).toBe(true);
    expect(anim.strategy).toBe(ex.Graphics.AnimationStrategy.Loop);
  });

  it('can be played with end strategy', () => {
    const rect = new ex.Graphics.Rect({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Graphics.Animation({
      strategy: ex.Graphics.AnimationStrategy.End,
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
    const rect = new ex.Graphics.Rect({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Graphics.Animation({
      strategy: ex.Graphics.AnimationStrategy.Loop,
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
    const rect = new ex.Graphics.Rect({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Graphics.Animation({
      strategy: ex.Graphics.AnimationStrategy.PingPong,
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
  });

  it('can be played with freeze frame strategy', () => {
    const rect = new ex.Graphics.Rect({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Graphics.Animation({
      strategy: ex.Graphics.AnimationStrategy.Freeze,
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
    const rect = new ex.Graphics.Rect({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Graphics.Animation({
      strategy: ex.Graphics.AnimationStrategy.End,
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

    const looper = new ex.Graphics.Animation({
      strategy: ex.Graphics.AnimationStrategy.Loop,
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
    const rect = new ex.Graphics.Rect({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const anim = new ex.Graphics.Animation({
      strategy: ex.Graphics.AnimationStrategy.End,
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

  it('draws the right frame to the screen', (done) => {
    const rect = new ex.Graphics.Rect({
      width: 100,
      height: 100,
      color: ex.Color.Blue
    });
    const rect2 = new ex.Graphics.Rect({
      width: 90,
      height: 90,
      color: ex.Color.Yellow
    });
    const rect3 = new ex.Graphics.Rect({
      width: 80,
      height: 80,
      color: ex.Color.Red
    });
    const anim = new ex.Graphics.Animation({
      strategy: ex.Graphics.AnimationStrategy.End,
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
    const ctx = new ExcaliburGraphicsContext2DCanvas({canvasElement: output});

    ctx.clear();
    anim.draw(ctx, 0, 0);

    ensureImagesLoaded(output, 'src/spec/images/GraphicsAnimationSpec/frame-1.png').then(([actual, image]) => {
      expect(actual).toEqualImage(image);

      ctx.clear();
      anim.tick(100, 0);
      anim.draw(ctx, 0, 0);
      ensureImagesLoaded(output, 'src/spec/images/GraphicsAnimationSpec/frame-2.png').then(([actual, image]) => {
        expect(actual).toEqualImage(image);

        ctx.clear();
        anim.tick(100, 1);
        anim.draw(ctx, 0, 0);

        ensureImagesLoaded(output, 'src/spec/images/GraphicsAnimationSpec/frame-3.png').then(([actual, image]) => {
          expect(actual).toEqualImage(image);
          done();
        });
      });
    });

  });

});