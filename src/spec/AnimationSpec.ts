import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

describe('An animation', () => {
  let animation: ex.Animation;
  let engine: ex.Engine;

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
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

  it('should update the animation width/height and sprite anchor, rotation, scale after tick()', (done) => {
    const texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });
      const animation = new ex.Animation({
        engine: engine,
        sprites: [sprite],
        speed: 200,
        loop: false,
        anchor: new ex.Vector(1, 1),
        rotation: Math.PI,
        scale: new ex.Vector(2, 2),
        flipVertical: true,
        flipHorizontal: true,
        width: 100,
        height: 200
      });

      animation.tick(10);
      expect(sprite.scale).toBeVector(animation.scale);
      expect(sprite.anchor).toBeVector(animation.anchor);
      expect(sprite.rotation).toBe(animation.rotation);

      expect(animation.width).toBe(sprite.width);
      expect(animation.height).toBe(sprite.height);
      expect(animation.drawWidth).toBe(sprite.drawWidth);
      expect(animation.drawHeight).toBe(sprite.drawHeight);
      done();
    });
  });

  it('should only tick once for an idempotency token', (done) => {
    const texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });
      const animation = new ex.Animation({
        engine: engine,
        sprites: [sprite, sprite],
        speed: 200,
        loop: false,
        anchor: new ex.Vector(1, 1),
        rotation: Math.PI,
        scale: new ex.Vector(2, 2),
        flipVertical: true,
        flipHorizontal: true,
        width: 100,
        height: 200
      });

      animation.tick(100, 42);
      animation.tick(100, 42);
      animation.tick(100, 42);
      animation.tick(100, 42);
      animation.tick(100, 42);
      expect(animation.currentFrame).toBe(0);
      done();
    });
  });

  it('should always pass "flipped" state to the current Sprite', () => {
    const mockSprite: any = jasmine.createSpyObj('sprite', ['draw', 'drawWithOptions']);
    mockSprite.anchor = ex.Vector.Half;
    mockSprite.scale = ex.Vector.One;
    mockSprite.flipHorizontal = false;
    mockSprite.flipVertical = false;
    animation.sprites = [mockSprite];

    // set flipped to true and ensure the Sprite has the same state after drawing
    animation.flipHorizontal = true;
    animation.flipVertical = true;
    animation.draw(engine.ctx, 0, 0);
    expect(mockSprite.flipHorizontal).toBe(false);
    expect(mockSprite.flipVertical).toBe(false);

    // set flipped back to false and ensure the Sprite has the same state after drawing
    animation.flipHorizontal = false;
    animation.flipVertical = false;
    animation.draw(engine.ctx, 0, 0);
    expect(mockSprite.flipHorizontal).toBe(false);
    expect(mockSprite.flipVertical).toBe(false);
  });

  it('can be drawn with opacity option', (done) => {
    engine = TestUtils.engine({
      width: 62,
      height: 64
    });
    const texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
    texture.load().then(() => {
      const sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });

      const animation = new ex.Animation(engine, [sprite], 10, true);

      animation.draw({ ctx: engine.ctx, x: 0, y: 0, opacity: 0.1 });
      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/opacity.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });
});
