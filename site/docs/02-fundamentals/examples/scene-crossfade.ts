import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
});

class MyScene extends ex.Scene {
  public onInitialize(): void {
    this.add(
      new ex.Actor({
        pos: ex.vec(200, 200),
        color: ex.Color.Red,
        width: 100,
        height: 200
      }))
  }
}


class MyOtherScene extends ex.Scene {
  public onInitialize(): void {
    this.add(
      new ex.Actor({
        pos: ex.vec(200, 200),
        color: ex.Color.Blue,
        width: 200,
        height: 100
      }))
  }
}

game.add('scene1', {
  scene: MyScene,
  transitions: {
    in: new ex.CrossFade({duration: 1500, blockInput: true }),
  }
});

game.add('scene2', { 
  scene: MyOtherScene,
  transitions: {
    in: new ex.CrossFade({duration: 1500, blockInput: true }),
  }
});

game.input.pointers.primary.on('down', () => {
  game.currentSceneName === 'scene2' ? game.goToScene('scene1') : game.goToScene('scene2');
});

game.start('scene2');
