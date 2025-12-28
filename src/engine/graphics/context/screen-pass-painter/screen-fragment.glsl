#version 300 es
precision mediump float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
   fragColor = texture(u_texture, v_texcoord);
}