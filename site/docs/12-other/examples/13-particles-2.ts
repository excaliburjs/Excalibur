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
  emitterType: ex.EmitterType.Rectangle, 
  width: 50,                             
  height: 10,
  isEmitting: true,                      
  emitRate: 300,                         
  particle: {
    minAngle: Math.PI/180 * 45,          
    maxAngle: Math.PI/180 * 90,          
    opacity: 1,                          
    fade: true,                          
    life: 1000,                          
    minSize: 1,                          
    maxSize: 10,                         
    startSize: 10,                       
    endSize: 1,                          
    acc: new ex.Vector(0, -100),         
    beginColor: ex.Color.Red,
    endColor: ex.Color.Yellow,
  }
});

game.add(emitter);
game.start();