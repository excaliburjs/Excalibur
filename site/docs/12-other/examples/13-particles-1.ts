import * as ex from 'excalibur';

const game = new ex.Engine({
    canvasElementId: 'preview-canvas',
    displayMode: ex.DisplayMode.FillContainer,
    width: 600,
    height: 400,
    backgroundColor: ex.Color.Black,
});

const emitter = new ex.ParticleEmitter({
  x: game.halfDrawWidth,
  y: game.halfDrawHeight,
  emitterType: ex.EmitterType.Circle,
  radius: 10,
  isEmitting: true,
  emitRate: 300,
  particle: {
    minSpeed: 200,
    maxSpeed: 300,
    minAngle: Math.PI/180 * 0,
    maxAngle: Math.PI/180 * 90,
    life: 1000,
    minSize: 1,                        
    maxSize: 10,                       
    startSize: 10,                     
    endSize: 1,                        
    acc: ex.vec(0, 10),
    beginColor: ex.Color.Red,
    endColor: ex.Color.Blue,
  }
});

game.add(emitter);
game.start();