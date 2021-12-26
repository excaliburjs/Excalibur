#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

// UV coord
varying vec2 v_texcoord;

// Texture index
varying lowp float v_textureIndex;

// Color coord to blend with image
varying lowp vec4 v_color;

// Opacity
varying float v_opacity;

uniform sampler2D u_textures[%%count%%];

// circle sdf
float circle(in vec2 st, in float radius) {
  vec2 dist = st - vec2(0.5);
  float r = dot(dist, dist) * 4.0;
  float delta = fwidth(r);
  return 1.0 - smoothstep(radius - delta, radius + delta, r);
}

void main() {
  float r = 0.0, delta = 0.0, alpha = 1.0;
   // In order to support the most efficient sprite batching, we have multiple
   // textures loaded into the gpu (usually 8) this picker logic skips over textures
   // that do not apply to a particular sprite.

   vec4 color;
   // -1 If there is no texture to sample we are drawing a solid geometry (rectangles)
   if (v_textureIndex == -1.0) {
     color = v_color;
   // -2 If there is no texture we are drawing a circle
   } else if (v_textureIndex == -2.0) {
     color = v_color * circle(v_texcoord, .95);
   } else {
     // GLSL is templated out to pick the right texture and set the vec4 color
      %%texture_picker%%
   }
   // "premultiply" alpha contribution from v_opacity
   color.rgb = color.rgb * v_opacity;
   color.a = color.a * v_opacity;
   gl_FragColor = color;
}