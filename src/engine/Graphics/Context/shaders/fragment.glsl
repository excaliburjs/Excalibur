precision mediump float;

// UV coord
varying vec2 v_texcoord;

// Texture index
varying lowp float v_textureIndex;

// Opacity
varying float v_opacity;

uniform sampler2D u_textures[%%count%%];

void main() {
   // In order to support the most efficient sprite batching, we have multiple
   // textures loaded into the gpu (usually 8) this picker logic skips over textures
   // that do not apply to a particular sprite.

   // Error color
   vec4 color = vec4(1.0, 0.0, 0.0, 1.0);

   // Always at least 1 texture at 0
   if (v_textureIndex <= .5) {
      gl_FragColor = texture2D(u_textures[0], v_texcoord);
      gl_FragColor.w = gl_FragColor.w * v_opacity;
      %%texture_picker%%
   } else {
      gl_FragColor = color;
   }
}