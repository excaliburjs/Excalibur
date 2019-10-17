import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('An animation', () => {
  let animation: ex.Animation;
  let engine: ex.Engine;

  beforeEach(() => {
    animation = new ex.Animation(null, null, 0);
    engine = TestUtils.engine({
      width: 500,
      height: 500
    });
  });

  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should have loop default to true', () => {
    expect(animation.loop).toBe(true);
  });

  it('should have props set by constructor', () => {
    const animation = new ex.Animation({
      engine: engine,
      sprites: [],
      speed: 20,
      loop: false,
      anchor: new ex.Vector(1, 1),
      rotation: Math.PI,
      scale: new ex.Vector(2, 2),
      flipVertical: true,
      flipHorizontal: true,
      width: 100,
      height: 200
    });

    expect(animation.width).toBe(100);
    expect(animation.height).toBe(200);
    expect(animation.flipHorizontal).toBe(true);
    expect(animation.flipVertical).toBe(true);
    expect(animation.anchor.x).toBe(1);
    expect(animation.anchor.y).toBe(1);
    expect(animation.scale.x).toBe(2);
    expect(animation.scale.y).toBe(2);
    expect(animation.rotation).toBe(Math.PI);
    expect(animation.loop).toBe(false);
    expect(animation.speed).toBe(20);
    expect(animation.sprites.length).toBe(0);
  });

  it('should always pass "flipped" state to the current Sprite', () => {
    const mockSprite = {
      anchor: new ex.Vector(1, 1),
      draw: () => void 0,
      flipHorizontal: false,
      flipVertical: false
    };
    animation.sprites = [<any>mockSprite];

    // set flipped to true and ensure the Sprite has the same state after drawing
    animation.flipHorizontal = true;
    animation.flipVertical = true;
    animation.draw(engine.ctx, 0, 0);
    expect(animation.sprites[0].flipHorizontal).toBe(true);
    expect(animation.sprites[0].flipVertical).toBe(true);

    // set flipped back to false and ensure the Sprite has the same state after drawing
    animation.flipHorizontal = false;
    animation.flipVertical = false;
    animation.draw(engine.ctx, 0, 0);
    expect(animation.sprites[0].flipHorizontal).toBe(false);
    expect(animation.sprites[0].flipVertical).toBe(false);
  });
});
