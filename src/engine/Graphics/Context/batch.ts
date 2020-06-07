import { DrawImageCommand } from './command';
import { Graphic } from '../Graphic';
import { TextureManager } from './texture-manager';
import { Poolable, initializePoolData } from './pool';

export interface BatchOptions {
  maxDrawsPerBatch: number;
  maxTexturesPerBatch: number;
}

export class CommandBatch<T> implements Poolable
{
  _poolData = initializePoolData();
  public commands: T[] = [];
  constructor(public max: number) {}

  isFull() {
    if (this.commands.length >= this.max) {
      return true;
    }
    return false;
  }

  canAdd() {
    return !this.isFull();
  }

  add(cmd: T) {
    this.commands.push(cmd);
  }

  public dispose() {
    this.commands.length = 0;
  }
}
  _poolData = initializePoolData();

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
    if ((this._isCommandFull() || this._isTextureFull()) && this._wouldAddTexture(command)) {
      return false;
    }

    this.add(command);
    return true;
  }

  add(command: DrawImageCommand) {
    const textureInfo = this.textureManager.loadWebGLTexture(command.image);
    if (this.textures.indexOf(textureInfo.texture) === -1) {
      this.textures.push(textureInfo.texture);
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

  getBatchTextureId(command: DrawImageCommand) {
    if (command.image.__textureInfo) {
      return this.textures.indexOf(command.image.__textureInfo.texture);
    }
    return -1;
  }

  dispose() {
    this.clear();
  }

  clear() {
    this.commands.length = 0;
    this.textures.length = 0;
    this._graphicMap = {};
  }
}
