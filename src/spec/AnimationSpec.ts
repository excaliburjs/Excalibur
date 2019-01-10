import * as ex from '../../build/dist/excalibur';
import { TestUtils } from './util/TestUtils';

describe('An animation', () => {
  var animation;
  var engine: ex.Engine;
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
    let animation = new ex.Animation({
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
});
