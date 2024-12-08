import { GraphicsComponent } from '../../Graphics/GraphicsComponent';
import { Entity } from '../../EntityComponentSystem/Entity';
import { Action, nextActionId } from '../Action';
import { Actor } from '../../Actor';
import { Material } from '../../Graphics/Context/material';
import { Color } from '../../Color';
import { Shader } from '../../Graphics/Context/shader';

export class Flash implements Action {
  id = nextActionId();
  private _graphics: GraphicsComponent;
  private _duration: number;
  private _stopped: boolean = false;
  private _started: boolean = false;
  private _entity: Entity;
  private _material: Material | undefined;
  private _total: number = 0;
  private _currentDuration: number = 0;

  constructor(entity: Entity, color: Color, duration: number = 1000) {
    this._graphics = entity.get(GraphicsComponent);
    this._duration = duration;
    this._entity = entity;
    this._material = entity.scene?.engine.graphicsContext.createMaterial({
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
    }) as Material;
    this._total = duration;
  }

  public update(elapsed: number): void {
    if (!this._started) {
      this._started = true;
      this._total = this._duration;
      this._currentDuration = this._duration;
      (this._entity as Actor).graphics.material = this._material as Material;
    }
    if (!this._graphics) {
      return;
    }

    this._currentDuration -= elapsed;

    if (this._graphics) {
      this._material?.update((shader: Shader) => {
        shader.trySetUniformFloat('u_blend', this._currentDuration / this._total);
      });
    }

    if (this.isComplete()) {
      (this._entity as Actor).graphics.material = null;
    }
  }

  public isComplete(): boolean {
    return this._stopped || this._currentDuration <= 0;
  }

  public stop(): void {
    if (this._graphics) {
      this._graphics.isVisible = true;
    }
    this._stopped = true;
  }

  public reset() {
    this._started = false;
    this._stopped = false;
  }
}
