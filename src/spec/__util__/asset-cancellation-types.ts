import { DefaultLoader, Engine, FontSource, Gif, ImageSource, Loader, Resource, Sound } from '../../engine';
import type { Loadable } from '../../engine';

// Compiled with the production engine; this consumer is never executed.
export function cancellationApiTypes(
  resource: Resource<unknown>,
  image: ImageSource,
  sound: Sound,
  font: FontSource,
  gif: Gif,
  defaultLoader: DefaultLoader,
  loader: Loader,
  engine: Engine,
  signal: AbortSignal
): void {
  void resource.load(signal);
  void resource.load();
  void image.load(signal);
  void image.load();
  void sound.load(signal);
  void sound.load();
  void font.load(signal);
  void font.load();
  void gif.load(signal);
  void gif.load();
  void defaultLoader.load(signal);
  void defaultLoader.load();
  void loader.load(signal);
  void loader.load();
  void engine.load(loader, false, signal);
  void engine.goToScene('destination', { signal });

  const legacy: Loadable<number> = {
    data: 1,
    load() {
      return Promise.resolve(this.data);
    },
    isLoaded() {
      return true;
    }
  };
  void legacy.load();
  new DefaultLoader({ loadables: [legacy] });
}
