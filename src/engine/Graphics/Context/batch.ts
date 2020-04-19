import { DrawImageCommand } from './command';
import { Graphic } from '../Graphic';
import { TextureManager } from './texture-manager';
import { Poolable } from './pool';

export interface BatchOptions {
  maxDrawsPerBatch: number;
  maxTexturesPerBatch: number;
}

export class Batch implements Poolable {
  _poolId: number;
  _free: boolean;

  public textures: WebGLTexture[] = [];
  public commands: DrawImageCommand[] = [];
  private _graphicMap: { [id: string]: Graphic } = {};

  constructor(public textureManager: TextureManager, public maxDraws: number, public maxTextures: number) {}

  isFull() {
    if (this.commands.length >= this.maxDraws) {
      return true;
    }
    if (this.textures.length >= this.maxTextures) {
      return true;
    }
    return false;
  }

  canAdd() {
    if (this.commands.length >= this.maxDraws) {
      return false;
    }

    // If num textures < maxTextures
    if (this.textures.length < this.maxTextures) {
      return true;
    }

    return false;
  }

  private _isCommandFull() {
    return this.commands.length >= this.maxDraws;
  }

  private _isTextureFull() {
    return this.textures.length >= this.maxTextures;
  }

  private _wouldAddTexture(command: DrawImageCommand) {
    return !this._graphicMap[command.image.id];
  }

  maybeAdd(command: DrawImageCommand): boolean {
    if (this._isCommandFull() || (this._isTextureFull() && this._wouldAddTexture(command))) {
      return false;
    }

    this.add(command);
    return true;
  }

  add(command: DrawImageCommand) {
    if (!this._graphicMap[command.image.id]) {
      this._graphicMap[command.image.id] = command.image;
      if (this.textureManager.hasWebGLTexture(command.image)) {
        this.textures.push(this.textureManager.getWebGLTexture(command.image));
      }
    }
    this.commands.push(command);
  }

  bindTextures(gl: WebGLRenderingContext) {
    // Bind textures in the correct order
    for (let i = 0; i < this.maxTextures; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i] || this.textures[0]);
    }
  }

  _dispose() {
    this.clear();
  }

  clear() {
    this.commands.length = 0;
    this.textures.length = 0;
    this._graphicMap = {};
  }
}
