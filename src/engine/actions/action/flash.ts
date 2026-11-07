import { GraphicsComponent } from '../../graphics/graphics-component';
import type { Entity } from '../../entity-component-system/entity';
import type { Action } from '../action';
import { nextActionId } from '../action';
import type { Material } from '../../graphics/context/material';
import type { Color } from '../../color';

export class Flash implements Action {
  id = nextActionId();
  private _graphics: GraphicsComponent;
  private _duration: number;
  private _stopped: boolean = false;
  private _started: boolean = false;
  private _material: Material | undefined;
  private _previousMaterial: Material | null = null;
  private _isApplied: boolean = false;
  private _total: number = 0;
  private _currentDuration: number = 0;

  constructor(entity: Entity, color: Color, duration: number = 1000) {
    this._graphics = entity.get(GraphicsComponent);
    this._duration = duration;
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
      if (this._graphics) {
        // Remember the user's material so it can be restored when the flash is done
        this._previousMaterial = this._graphics.material;
        this._graphics.material = this._material ?? null;
        this._isApplied = true;
      }
    }
    if (!this._graphics) {
      return;
    }

    this._currentDuration -= elapsed;

    if (this._graphics) {
      this._material?.update((context) => {
        context.uniforms.u_blend = this._currentDuration / this._total;
      });
    }

    if (this.isComplete()) {
      this._restoreMaterial();
    }
  }

  private _restoreMaterial() {
    if (this._isApplied && this._graphics) {
      // Only restore if the flash material is still the active one, don't clobber a material set by the user mid-flash
      if (this._graphics.material === this._material) {
        this._graphics.material = this._previousMaterial;
      }
    }
    this._isApplied = false;
    this._previousMaterial = null;
  }

  public isComplete(): boolean {
    return this._stopped || this._currentDuration <= 0;
  }

  public stop(): void {
    if (this._graphics) {
      this._graphics.isVisible = true;
    }
    this._restoreMaterial();
    this._stopped = true;
    this._started = false;
  }

  public reset() {
    this._started = false;
    this._stopped = false;
  }
}
