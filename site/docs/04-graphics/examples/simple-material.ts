import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
});

const actor = new ex.Actor({
  pos: ex.vec(200, 200),
  width: 100,
  height: 100,
  color: ex.Color.Blue // Default graphic will be modified by the material
});
const material = actor.graphics.material = game.graphicsContext.createMaterial({
  name: 'custom-material',
  fragmentSource: `#version 300 es
  precision mediump float;

  uniform vec2 iMouse;

  out vec4 color;
  void main() {
    // Change the color based on mouse position
    vec2 mouseColor = iMouse / 800.0;
    color = vec4(mouseColor, 0.0, 1.0);
  }`
});

game.input.pointers.primary.on('move', evt => {
  actor.pos = evt.worldPos;
  material.update(shader => {
    shader.trySetUniformFloatVector('iMouse', evt.worldPos);
  });
});


game.add(actor);
game.start();