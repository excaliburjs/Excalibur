import { Color } from "../../Color";
import { Shader } from "./shader";

export interface MaterialOptions {
  /**
   * Name the material for debugging
   */
  name: string;
  /**
   * Add custom shader
   */
  shader: Shader,
  /**
   * Add custom color
   */
  color: Color,
}

export class Material {
  private _name: string;
  private _shader: Shader;
  private _color: Color;
  constructor(options: MaterialOptions) {
    const { shader, color, name } = options;
    this._name = name;
    this._shader = shader;
    this._color = color;

    if (!this._shader.compiled) {
      this._shader.compile();
    }
  }

  get name() {
    return this._name;
  }

  getShader() {
    return this._shader;
  }

  use() {
    // bind the shader
    this._shader.use();
    // todo apply standard uniforms
    this._shader.setUniformFloatColor('u_color', this._color);
  }
}