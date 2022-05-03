import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';


describe('A Parallax Component', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });
  it('exists', () => {
    expect(ex.ParallaxComponent).toBeDefined();
  });

  it('can be added to an actor', () => {
    const actor = new ex.Actor({x: 100, y: 100});
    actor.addComponent(new ex.ParallaxComponent(ex.vec(0.5, 0.5)));

    const comp = actor.get(ex.ParallaxComponent);

    expect(comp.parallaxFactor).toBeVector(ex.vec(0.5, 0.5));
  });

  it('will apply a parallax effect to the graphics', async () => {
    const game = TestUtils.engine();
    await TestUtils.runToReady(game);

    game.currentScene.camera.pos = ex.vec(0, 0);

    const clock = game.clock as ex.TestClock;

    const actor = new ex.Actor({x: 0, y: 0, width: 20, height: 20, color: ex.Color.Red});
    actor.addComponent(new ex.ParallaxComponent(ex.vec(0.5, 0.5)));
    game.add(actor);

    clock.step();
    expect(game.currentScene.camera.pos).toBeVector(ex.vec(0, 0));
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(game.canvas)).toEqualImage('src/spec/images/ParallaxSpec/parallax1.png');


    game.currentScene.camera.pos = ex.vec(500, 500);
    clock.step();
    expect(game.currentScene.camera.pos).toBeVector(ex.vec(500, 500));
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(game.canvas)).toEqualImage('src/spec/images/ParallaxSpec/parallax2.png');
    expect(actor.hasTag('ex.offscreen')).toBeFalse();

    game.currentScene.camera.pos = ex.vec(519, 519);
    clock.step();
    expect(game.currentScene.camera.pos).toBeVector(ex.vec(519, 519));
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(game.canvas)).toEqualImage('src/spec/images/ParallaxSpec/parallax3.png');
    expect(actor.hasTag('ex.offscreen')).toBeFalse();

    game.currentScene.camera.pos = ex.vec(520, 520);
    clock.step();
    expect(game.currentScene.camera.pos).toBeVector(ex.vec(520, 520));
    expect(actor.hasTag('ex.offscreen')).toBeTrue();

    game.currentScene.camera.pos = ex.vec(1000, 1000);
    clock.step();
    expect(game.currentScene.camera.pos).toBeVector(ex.vec(1000, 1000));
    expect(actor.hasTag('ex.offscreen')).toBeTrue();
  });
});