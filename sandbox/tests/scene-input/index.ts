/// <reference path='../../lib/excalibur.d.ts' />

const font = new ex.Font({
  size: 48,
  family: 'sans-serif',
  baseAlign: ex.BaseAlign.Top
});

class SceneWithInput extends ex.Scene {
  onInitialize(engine: ex.Engine<any>): void {
    this.add(
      new ex.Label({
        pos: ex.vec(200, 200),
        text: 'Scene 1',
        font
      })
    );

    this.add(
      new ex.Actor({
        pos: ex.vec(400, 400),
        width: 200,
        height: 200,
        color: ex.Color.Red
      })
    );

    this.input.pointers.on('down', () => {
      console.log('pointer down from scene1');
    });
  }
}
class OtherSceneWithInput extends ex.Scene {
  onInitialize(engine: ex.Engine<any>): void {
    this.add(
      new ex.Label({
        pos: ex.vec(200, 200),
        text: 'Scene 2',
        font
      })
    );

    this.add(
      new ex.Actor({
        pos: ex.vec(400, 400),
        width: 200,
        height: 200,
        color: ex.Color.Violet
      })
    );

    this.input.pointers.on('down', () => {
      console.log('pointer down from scene2');
    });
  }
}

var engineWithInput = new ex.Engine({
  width: 800,
  height: 800,
  scenes: {
    scene1: { scene: SceneWithInput, transitions: { in: new ex.CrossFade({ duration: 1000, blockInput: true }) } },
    scene2: { scene: OtherSceneWithInput, transitions: { in: new ex.CrossFade({ duration: 1000, blockInput: true }) } }
  }
});

engineWithInput.input.pointers.on('down', () => {
  console.log('pointer down from engine');
});

engineWithInput.input.keyboard.on('press', (e) => {
  if (e.key === ex.Keys.Space) {
    engineWithInput.currentSceneName === 'scene1' ? engineWithInput.goto('scene2') : engineWithInput.goto('scene1');
  }
});

engineWithInput.start('scene1');
