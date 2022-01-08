precision mediump float;

// UV coord
varying vec2 v_texcoord;

// Texture index
varying lowp float v_textureIndex;

// Textures in the current draw
uniform sampler2D u_textures[%%count%%];

// Opacity
varying float v_opacity;

void main() {
   // In order to support the most efficient sprite batching, we have multiple
   // textures loaded into the gpu (usually 8) this picker logic skips over textures
   // that do not apply to a particular sprite.

   vec4 color = vec4(1.0, 0, 0, 1.0);

   // GLSL is templated out to pick the right texture and set the vec4 color
   %%texture_picker%%

   color.rgb = color.rgb * v_opacity;
   color.a = color.a * v_opacity;
   gl_FragColor = color;
}