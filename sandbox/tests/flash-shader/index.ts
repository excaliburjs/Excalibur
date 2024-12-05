var game = new ex.Engine({
  width: 800,
  height: 800
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png', false, ex.ImageFiltering.Pixel);

var actor = new ex.Actor({
  pos: ex.vec(300, 300),
  width: 100,
  height: 100
});
actor.graphics.use(tex.toSprite());

game.add(actor);

var flash = (actor: ex.Actor, color: ex.Color, duration: number) => {
  const material = game.graphicsContext.createMaterial({
    name: 'flash-material',
    color,
    fragmentSource: `#version 300 es
  
      precision mediump float;
      uniform float u_blend;
      uniform sampler2D u_graphic;
      uniform vec4 u_color;
  
      in vec2 v_uv; 
      out vec4 color;
  
      void main() { 
          vec4 textureColor = texture(u_graphic, v_uv); 
          color = mix(textureColor, u_color, u_blend * textureColor.a);
          color.rgb = color.rgb * color.a;
      }`
  }) as ex.Material;
  // already running material
  if (actor.graphics.material) {
    return;
  }
  actor.graphics.material = material;
  ex.coroutine(
    function* () {
      const total = duration;
      let currentDuration = duration;
      while (currentDuration > 0) {
        const elapsed = yield;
        currentDuration -= elapsed;
        material.update((shader) => {
          shader.trySetUniformFloat('u_blend', currentDuration / total);
        });
      }
      actor.graphics.material = null;
    }.bind(this)
  );
};

game.input.keyboard.on('press', () => {
  flash(actor, ex.Color.White, 500);
});

game.start(new ex.Loader([tex]));
