import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';


fdescribe('A Graphics Animation', () => {

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
    anim.play();
    anim.tick(50, 0);
    expect(anim.currentFrame).toBe(anim.frames[0]);
    anim.tick(50, 1);
    expect(anim.currentFrame).toBe(null);
  });

});