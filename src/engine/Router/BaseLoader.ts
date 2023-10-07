import { Engine, Loadable } from '..';
import { Resource } from '../Resources/Resource';
import { Sound } from '../Resources/Sound/Sound';
import { Scene } from '../Scene';


export class BaseLoader extends Scene {
  private _resources: Resource<any>[] = [];
  private _engine: Engine; // TODO wire up
  // private _currentProgress: number = 0;

  onStart() {
    // override me
  }

  // onProgress(value: number) {

  // }

  onEnd() {
    // override me
  }

  onUpdate() {
    // override me
  }

  addResource(res: Resource<any>) {
    this._resources.push(res);
  }

  /**
   * Begin loading all of the supplied resources, returning a promise
   * that resolves when loading of all is complete AND the user has clicked the "Play button"
   */
  public async load(): Promise<Loadable<any>[]> {

    await Promise.all(
      this._resources.map(async (r) => {
        await r.load().finally(() => {
          // capture progress
          // this._currentProgress++;
        });
      })
    );
    // Wire all sound to the engine
    for (const resource of this._resources) {
      if (resource instanceof Sound) {
        resource.wireEngine(this._engine);
      }
    }

    return this._resources;
  }
}