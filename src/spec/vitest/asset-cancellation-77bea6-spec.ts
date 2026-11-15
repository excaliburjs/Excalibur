import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

const textPath = '/src/spec/assets/images/resource-spec/textresource.txt';
const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==';

function loadOutcome<T>(promise: Promise<T>): Promise<string> {
  return promise.then(
    () => 'resolved',
    (error: Error) => error.name
  );
}

async function outcomeWithoutWaitingForWork<T>(promise: Promise<T>): Promise<string> {
  vi.useFakeTimers();
  try {
    const outcome = Promise.race([loadOutcome(promise), new Promise<string>((resolve) => setTimeout(() => resolve('pending'), 1000))]);
    await vi.advanceTimersByTimeAsync(1000);
    return await outcome;
  } finally {
    vi.useRealTimers();
  }
}

async function canceledRequest(asset: ex.Loadable<unknown>, requestId: string): Promise<void> {
  const server = import.meta.env.VITE_ABORT_REQUEST_URL;
  const controller = new AbortController();
  const pending = asset.load(controller.signal);
  const state = async () => (await fetch(`${server}/state?id=${requestId}`, { cache: 'no-store' })).json();
  await vi.waitFor(async () => expect((await state()).started).toBe(true));
  controller.abort();
  expect(await outcomeWithoutWaitingForWork(pending)).toBe('AbortError');
  await vi.waitFor(async () => expect((await state()).closed).toBe(true));
  expect(asset.isLoaded()).toBe(false);
}

describe('Canceling asset loads', () => {
  const engines: ex.Engine[] = [];
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    for (const engine of engines.splice(0)) {
      engine.dispose();
    }
  });

  it('rejects an already-aborted resource without starting it, then loads on retry', async () => {
    const compilation = JSON.parse(import.meta.env.VITE_ENGINE_TYPECHECK_RESULT);
    expect(Number.isInteger(compilation.exitCode)).toBe(true);
    expect(typeof compilation.output).toBe('string');
    expect(compilation.exitCode, compilation.output).toBe(0);

    const resource = new ex.Resource<string>(textPath, 'text');
    const controller = new AbortController();
    const started = vi.fn();
    resource.events.on('loadstart', started);
    controller.abort();

    expect(await loadOutcome(resource.load(controller.signal))).toBe('AbortError');
    expect(started).not.toHaveBeenCalled();
    expect(resource.isLoaded()).toBe(false);
    await expect(resource.load()).resolves.toBe('sometext');
    expect(resource.isLoaded()).toBe(true);
    expect(await loadOutcome(resource.load(controller.signal))).toBe('AbortError');
    expect(resource.isLoaded()).toBe(true);

    const image = new ex.ImageSource(imageData);
    const sound = new ex.Sound('/src/spec/assets/images/sound-spec/test.mp3');
    const font = new ex.FontSource('/src/spec/assets/fonts/Gorgeous Pixel.ttf', 'Pre-aborted Pixel');
    const gif = new ex.Gif('/src/spec/assets/images/gif-spec/sword.gif');
    const assets = [sound, font, gif];
    const send = vi.spyOn(XMLHttpRequest.prototype, 'send');
    const imageSrc = vi.spyOn(HTMLImageElement.prototype, 'src', 'set');
    const imageDecode = vi.spyOn(HTMLImageElement.prototype, 'decode');

    expect(await loadOutcome(image.load(controller.signal))).toBe('AbortError');
    expect(imageSrc).not.toHaveBeenCalled();
    expect(imageDecode).not.toHaveBeenCalled();
    expect(image.isLoaded()).toBe(false);
    imageSrc.mockRestore();
    imageDecode.mockRestore();

    for (const asset of assets) {
      expect(await loadOutcome(asset.load(controller.signal))).toBe('AbortError');
      expect(asset.isLoaded()).toBe(false);
    }
    expect(send).not.toHaveBeenCalled();

    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = imageCanvas.height = 1;
    const imageContext = imageCanvas.getContext('2d')!;
    const imagePixels = () => {
      imageContext.clearRect(0, 0, 1, 1);
      imageContext.drawImage(image.data, 0, 0);
      return Array.from(imageContext.getImageData(0, 0, 1, 1).data);
    };
    for (const asset of [image, ...assets]) {
      await asset.load();
      expect(asset.isLoaded()).toBe(true);
      const pixelsBeforeAbort = asset === image ? imagePixels() : undefined;
      if (pixelsBeforeAbort) {
        expect(pixelsBeforeAbort[3]).toBeGreaterThan(0);
      }
      expect(await loadOutcome(asset.load(controller.signal))).toBe('AbortError');
      expect(asset.isLoaded()).toBe(true);
      if (asset === image) {
        expect(image.data.complete).toBe(true);
        expect(image.data.naturalWidth).toBeGreaterThan(0);
      }
      if (pixelsBeforeAbort) {
        expect(imagePixels()).toEqual(pixelsBeforeAbort);
      }
    }
    document.fonts.delete(font.data);
  });

  it('stops a pending resource request and ignores its late completion', async () => {
    const server = import.meta.env.VITE_ABORT_REQUEST_URL;
    const requestId = 'pending-resource';
    const transport = new ex.Resource<string>(`${server}/slow?id=${requestId}`, 'text');
    const transportController = new AbortController();
    const transportPending = transport.load(transportController.signal);
    const requestState = async () => (await fetch(`${server}/state?id=${requestId}`, { cache: 'no-store' })).json();
    await vi.waitFor(async () => expect((await requestState()).started).toBe(true));
    transportController.abort();
    expect(await outcomeWithoutWaitingForWork(transportPending)).toBe('AbortError');
    await vi.waitFor(async () => expect((await requestState()).closed).toBe(true));

    const resource = new ex.Resource<string>(textPath, 'text');
    const controller = new AbortController();
    const completed = vi.fn();
    resource.events.on('complete', completed);
    const pending = resource.load(controller.signal);
    controller.abort();

    expect(await loadOutcome(pending)).toBe('AbortError');
    expect(resource.isLoaded()).toBe(false);
    expect(completed).not.toHaveBeenCalled();
    await resource.load();
    expect(completed).toHaveBeenCalledTimes(1);

    const completing = new ex.Resource<string>(textPath, 'text');
    const lateController = new AbortController();
    completing.events.on('load', () => lateController.abort());
    expect(await loadOutcome(completing.load(lateController.signal))).toBe('AbortError');
    expect(completing.isLoaded()).toBe(false);

    const completeBoundary = new ex.Resource<string>(textPath, 'text');
    const completionController = new AbortController();
    let completedBeforeAbort = false;
    let completedData: string | undefined;
    completeBoundary.events.on('complete', () => {
      completedBeforeAbort = completeBoundary.isLoaded();
      completedData = completeBoundary.data;
      completionController.abort();
    });
    const completionOutcome = await loadOutcome(completeBoundary.load(completionController.signal));
    if (completedBeforeAbort) {
      // Cancellation of a caller must not discard an already completed asset.
      expect(['resolved', 'AbortError']).toContain(completionOutcome);
      expect(completeBoundary.isLoaded()).toBe(true);
      expect(completeBoundary.data).toBe(completedData);
    } else if (completionOutcome === 'AbortError') {
      expect(completeBoundary.isLoaded()).toBe(false);
    } else {
      expect(completionOutcome).toBe('resolved');
      expect(completeBoundary.isLoaded()).toBe(true);
    }
  });

  it('can retry an image canceled during decoding', async () => {
    const server = import.meta.env.VITE_ABORT_REQUEST_URL;
    await canceledRequest(new ex.ImageSource(`${server}/slow?id=wrapper-image&type=image/png`), 'wrapper-image');
    const NativeImage = Image;
    let imageLoadReached!: () => void;
    const imageLoaded = new Promise<void>((resolve) => (imageLoadReached = resolve));
    let release!: () => void;
    let held = false;
    const DelayedImage = function (width?: number, height?: number) {
      const image = new NativeImage(width, height);
      const decode = image.decode.bind(image);
      let releaseDecode: (() => void) | undefined;
      const completion = new Promise<void>((resolve) => (releaseDecode = resolve));
      image.decode = async () => {
        await decode();
        await completion;
      };
      // Gate the load event itself, so onload and decode()-based implementations both reach cancellation.
      image.addEventListener(
        'load',
        (event) => {
          if (held) {
            return;
          }
          held = true;
          event.stopImmediatePropagation();
          release = () => {
            releaseDecode!();
            image.dispatchEvent(new Event('load'));
          };
          imageLoadReached();
        },
        { capture: true }
      );
      return image;
    };
    Object.setPrototypeOf(DelayedImage, NativeImage);
    DelayedImage.prototype = NativeImage.prototype;
    vi.stubGlobal('Image', DelayedImage);
    const source = new ex.ImageSource(imageData);
    let published = false;
    source.ready.then(
      () => (published = true),
      () => undefined
    );
    const controller = new AbortController();
    const pending = source.load(controller.signal);
    await imageLoaded;
    controller.abort();
    expect(await outcomeWithoutWaitingForWork(pending)).toBe('AbortError');
    release();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(source.isLoaded()).toBe(false);
    expect(published).toBe(false);
    vi.unstubAllGlobals();
    await source.load();
    expect(source.isLoaded()).toBe(true);
  });

  it('does not publish audio decoded after cancellation', async () => {
    const decodeSpy = vi.spyOn(AudioContext.prototype, 'decodeAudioData');
    await canceledRequest(new ex.Sound(`${import.meta.env.VITE_ABORT_REQUEST_URL}/slow?id=wrapper-sound&type=audio/mpeg`), 'wrapper-sound');
    expect(decodeSpy).not.toHaveBeenCalled();
    decodeSpy.mockRestore();
    const sound = new ex.Sound('/src/spec/assets/images/sound-spec/test.mp3');
    const controller = new AbortController();
    const processed = vi.fn();
    sound.on('processed', processed);
    let enterDecode!: () => void;
    const decoding = new Promise<void>((resolve) => (enterDecode = resolve));
    let finishDecode!: (buffer: AudioBuffer) => void;
    vi.spyOn(AudioContext.prototype, 'decodeAudioData').mockImplementationOnce(
      () =>
        new Promise<AudioBuffer>((resolve) => {
          finishDecode = resolve;
          enterDecode();
        })
    );
    const pending = sound.load(controller.signal);
    await decoding;
    controller.abort();
    const outcome = await outcomeWithoutWaitingForWork(pending);
    finishDecode(new AudioBuffer({ length: 1, numberOfChannels: 1, sampleRate: 44100 }));

    expect(outcome).toBe('AbortError');
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(sound.isLoaded()).toBe(false);
    expect(processed).not.toHaveBeenCalled();
    await sound.load();
    expect(sound.isLoaded()).toBe(true);

    const eventSound = new ex.Sound('/src/spec/assets/images/sound-spec/test.mp3');
    const eventController = new AbortController();
    let loadedBeforeAbort = false;
    eventSound.on('processed', () => {
      loadedBeforeAbort = eventSound.isLoaded();
      eventController.abort();
    });
    const eventOutcome = await loadOutcome(eventSound.load(eventController.signal));
    if (loadedBeforeAbort && eventOutcome === 'resolved') {
      expect(eventSound.isLoaded()).toBe(true);
    } else {
      expect(eventOutcome).toBe('AbortError');
      expect(eventSound.isLoaded()).toBe(false);
    }
    await eventSound.load();
    expect(eventSound.isLoaded()).toBe(true);
    expect(eventSound.duration).toBeGreaterThan(0);
  });

  it('leaves a canceled font unloaded and permits retry', async () => {
    const loadFace = vi.spyOn(FontFace.prototype, 'load');
    await canceledRequest(
      new ex.FontSource(`${import.meta.env.VITE_ABORT_REQUEST_URL}/slow?id=wrapper-font&type=font/ttf`, 'Pending Pixel'),
      'wrapper-font'
    );
    expect(loadFace).not.toHaveBeenCalled();
    loadFace.mockRestore();
    const source = new ex.FontSource('/src/spec/assets/fonts/Gorgeous Pixel.ttf', 'Canceled Pixel');
    const controller = new AbortController();
    let enterFontLoad!: () => void;
    const fontLoading = new Promise<void>((resolve) => (enterFontLoad = resolve));
    let finishFontLoad!: () => void;
    let canceledFace!: FontFace;
    let canceledFaceLoad!: Promise<FontFace>;
    const nativeLoad = FontFace.prototype.load;
    vi.spyOn(FontFace.prototype, 'load').mockImplementationOnce(function () {
      canceledFace = this;
      canceledFaceLoad = nativeLoad.call(this).then(
        () =>
          new Promise<FontFace>((resolve) => {
            finishFontLoad = () => resolve(this);
            enterFontLoad();
          })
      );
      return canceledFaceLoad;
    });
    const pending = source.load(controller.signal);
    await fontLoading;
    expect(canceledFace.status).toBe('loaded');
    const registeredBeforeAbort = document.fonts.has(canceledFace);
    controller.abort();
    const outcome = await outcomeWithoutWaitingForWork(pending);
    finishFontLoad();

    expect(outcome).toBe('AbortError');
    await canceledFaceLoad;
    expect(source.isLoaded()).toBe(false);
    // Cancellation prevents late registration, but need not undo earlier membership.
    expect(document.fonts.has(canceledFace) && !registeredBeforeAbort).toBe(false);
    await source.load();
    expect(source.isLoaded()).toBe(true);
    document.fonts.delete(canceledFace);
    document.fonts.delete(source.data);
  });

  it('leaves a canceled GIF unloaded and permits a complete retry', async () => {
    const requested = new ex.Gif(`${import.meta.env.VITE_ABORT_REQUEST_URL}/slow?id=wrapper-gif&type=image/gif`);
    await canceledRequest(requested, 'wrapper-gif');
    expect(requested.toSprite()).toBeNull();

    const frameGif = new ex.Gif('/src/spec/assets/images/gif-spec/sword.gif');
    const frameController = new AbortController();
    const heldFrames: Array<() => void> = [];
    let enterFrame!: () => void;
    const frameStarted = new Promise<void>((resolve) => (enterFrame = resolve));
    const frameLoad = vi.spyOn(ex.ImageSource.prototype, 'load').mockImplementation(function (signal) {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const abort = () => reject(new DOMException('Aborted', 'AbortError'));
        if (signal?.aborted) {
          abort();
        } else {
          signal?.addEventListener('abort', abort, { once: true });
        }
        heldFrames.push(() => resolve(this.data));
        enterFrame();
      });
    });
    const framePending = frameGif.load(frameController.signal);
    await frameStarted;
    frameController.abort();
    const frameOutcome = await outcomeWithoutWaitingForWork(framePending);
    for (const releaseFrame of heldFrames) {
      releaseFrame();
    }
    frameLoad.mockRestore();
    expect(frameOutcome).toBe('AbortError');
    await Promise.resolve();
    expect(frameGif.isLoaded()).toBe(false);
    expect(frameGif.toSprite()).toBeNull();

    const gif = new ex.Gif('/src/spec/assets/images/gif-spec/sword.gif');
    const controller = new AbortController();
    const pending = gif.load(controller.signal);
    controller.abort();

    expect(await loadOutcome(pending)).toBe('AbortError');
    expect(gif.isLoaded()).toBe(false);
    expect(gif.toSprite()).toBeNull();
    const frames = await gif.load();
    expect(frames.length).toBeGreaterThan(0);
    expect(gif.isLoaded()).toBe(true);
  });

  it('keeps completed loader resources and retries only unfinished ones', async () => {
    const engine = TestUtils.engine();
    engines.push(engine);
    const alreadyAborted = new AbortController();
    alreadyAborted.abort();
    const freshResource = new ex.Resource<string>(textPath, 'text');
    const freshLoader = new ex.DefaultLoader({ loadables: [freshResource] });
    freshLoader.onInitialize(engine);
    const started = vi.fn();
    freshResource.events.on('loadstart', started);
    expect(await loadOutcome(freshLoader.load(alreadyAborted.signal))).toBe('AbortError');
    expect(started).not.toHaveBeenCalled();
    expect(freshResource.isLoaded()).toBe(false);

    const first = new ex.Resource<string>(textPath, 'text');
    const second = new ex.Resource<string>(textPath, 'text');
    await first.load();
    const loader = new ex.DefaultLoader({ loadables: [first, second] });
    loader.onInitialize(engine);
    loader.onAfterLoad = () => Promise.resolve();
    const controller = new AbortController();
    loader.on('loadresourcestart', () => {
      controller.abort();
    });
    const pending = loader.load(controller.signal);

    expect(await loadOutcome(pending)).toBe('AbortError');
    expect(first.isLoaded()).toBe(true);
    expect(second.isLoaded()).toBe(false);
    expect(loader.isLoaded()).toBe(false);
    await loader.load();
    await expect(loader.areResourcesLoaded()).resolves.toBeUndefined();
    expect(await loadOutcome(loader.load(controller.signal))).toBe('AbortError');
    expect(first.isLoaded()).toBe(true);

    const server = import.meta.env.VITE_ABORT_REQUEST_URL;
    const requestId = 'loader-child';
    const inFlightResource = new ex.Resource<string>(`${server}/slow?id=${requestId}`, 'text');
    const completedDuringAttempt = new ex.Resource<string>(textPath, 'text');
    const inFlightLoader = new ex.DefaultLoader({ loadables: [completedDuringAttempt, inFlightResource] });
    inFlightLoader.onInitialize(engine);
    inFlightLoader.onAfterLoad = () => Promise.resolve();
    const inFlightController = new AbortController();
    const inFlightPending = inFlightLoader.load(inFlightController.signal);
    const requestState = async () => (await fetch(`${server}/state?id=${requestId}`, { cache: 'no-store' })).json();

    await vi.waitFor(async () => expect((await requestState()).started).toBe(true));
    await vi.waitFor(() => {
      expect(completedDuringAttempt.data).toBe('sometext');
    });
    inFlightController.abort();
    expect(await outcomeWithoutWaitingForWork(inFlightPending)).toBe('AbortError');
    await vi.waitFor(async () => expect((await requestState()).closed).toBe(true));
    expect(inFlightResource.isLoaded()).toBe(false);
    expect(completedDuringAttempt.data).toBe('sometext');
    inFlightResource.path = textPath;
    await inFlightLoader.load();
    expect(inFlightResource.isLoaded()).toBe(true);
    expect(completedDuringAttempt.data).toBe('sometext');

    const pendingIds = ['loader-pending-first', 'loader-pending-second'];
    const pendingChildren = pendingIds.map((id) => new ex.Resource<string>(`${server}/slow?id=${id}`, 'text'));
    const startedChildren = new Set<number>();
    let childStarted!: () => void;
    const firstChildStarted = new Promise<void>((resolve) => (childStarted = resolve));
    pendingChildren.forEach((child, index) => {
      child.events.on('loadstart', () => {
        startedChildren.add(index);
        childStarted();
      });
    });
    const group = new ex.DefaultLoader({ loadables: pendingChildren });
    group.onInitialize(engine);
    group.onAfterLoad = () => Promise.resolve();
    const groupController = new AbortController();
    const groupPending = group.load(groupController.signal);
    await firstChildStarted;
    const childState = async (index: number) => (await fetch(`${server}/state?id=${pendingIds[index]}`, { cache: 'no-store' })).json();
    await vi.waitFor(async () => {
      for (const index of startedChildren) {
        expect((await childState(index)).started).toBe(true);
      }
    });
    const activeAtAbort = [...startedChildren];
    expect(activeAtAbort.length).toBeGreaterThan(0);
    groupController.abort();
    expect(await outcomeWithoutWaitingForWork(groupPending)).toBe('AbortError');
    for (let index = 0; index < pendingChildren.length; index++) {
      if (activeAtAbort.includes(index)) {
        await vi.waitFor(async () => expect((await childState(index)).closed).toBe(true));
      } else {
        // A sequential loader is valid; work it never started must remain untouched.
        expect((await childState(index)).started).toBe(false);
      }
      expect(pendingChildren[index].isLoaded()).toBe(false);
      pendingChildren[index].path = textPath;
    }
    await group.load();
    for (const child of pendingChildren) {
      expect(child.data).toBe('sometext');
      expect(child.isLoaded()).toBe(true);
    }

    const simultaneousIds = ['loader-simultaneous-first', 'loader-simultaneous-second'];
    const simultaneous = simultaneousIds.map((id) => new ex.Resource<string>(`${server}/slow?id=${id}`, 'text'));
    const simultaneousLoader = new ex.DefaultLoader({ loadables: simultaneous });
    simultaneousLoader.onInitialize(engine);
    simultaneousLoader.onAfterLoad = () => Promise.resolve();
    const simultaneousController = new AbortController();
    const simultaneousPending = simultaneousLoader.load(simultaneousController.signal);
    const simultaneousState = async (index: number) =>
      (await fetch(`${server}/state?id=${simultaneousIds[index]}`, { cache: 'no-store' })).json();
    await vi.waitFor(async () => {
      expect((await simultaneousState(0)).started).toBe(true);
      expect((await simultaneousState(1)).started).toBe(true);
    });
    simultaneousController.abort();
    expect(await outcomeWithoutWaitingForWork(simultaneousPending)).toBe('AbortError');
    for (let index = 0; index < simultaneous.length; index++) {
      await vi.waitFor(async () => expect((await simultaneousState(index)).closed).toBe(true));
      expect(simultaneous[index].isLoaded()).toBe(false);
      simultaneous[index].path = textPath;
    }
    await simultaneousLoader.load();
    for (const resource of simultaneous) {
      expect(resource.data).toBe('sometext');
      expect(resource.isLoaded()).toBe(true);
    }

    let entered!: () => void;
    const legacyStarted = new Promise<void>((resolve) => (entered = resolve));
    let finish!: (value: number) => void;
    const work = new Promise<number>((resolve) => (finish = resolve));
    const legacy: ex.Loadable<number> = {
      data: null as any,
      load() {
        entered();
        return work.then((value) => (this.data = value));
      },
      isLoaded() {
        return this.data !== null;
      }
    };
    const legacyLoader = new ex.DefaultLoader({ loadables: [legacy] });
    legacyLoader.onInitialize(engine);
    legacyLoader.onAfterLoad = () => Promise.resolve();
    const legacyController = new AbortController();
    const waiting = legacyLoader.load(legacyController.signal);
    await legacyStarted;
    legacyController.abort();
    expect(await outcomeWithoutWaitingForWork(waiting)).toBe('AbortError');
    expect(legacy.isLoaded()).toBe(false);
    expect(legacyLoader.isLoaded()).toBe(false);
    finish(7);
    await work;
    await Promise.resolve();
    expect(legacy.data).toBe(7);
    expect(legacyLoader.isLoaded()).toBe(false);
    await legacyLoader.load();
    expect(legacyLoader.isLoaded()).toBe(true);

    const normalChild: ex.Loadable<number> = {
      data: null as any,
      load() {
        this.data = 9;
        return Promise.resolve(this.data);
      },
      isLoaded() {
        return this.data !== null;
      }
    };
    const normalLoader = new ex.DefaultLoader({ loadables: [normalChild] });
    normalLoader.onInitialize(engine);
    normalLoader.onAfterLoad = () => Promise.resolve();
    await normalLoader.load();
    expect(normalLoader.isLoaded()).toBe(true);
    expect(normalChild.data).toBe(9);
  });

  it('lets callers cancel the same asset independently', async () => {
    const server = import.meta.env.VITE_ABORT_REQUEST_URL;
    const cases: [string, ex.Loadable<unknown>][] = [
      ['resource', new ex.Resource<string>(`${server}/slow?id=shared-resource`, 'text')],
      ['image', new ex.ImageSource(`${server}/slow?id=shared-image&type=image/png`)],
      ['sound', new ex.Sound(`${server}/slow?id=shared-sound&type=audio/mpeg`)],
      ['font', new ex.FontSource(`${server}/slow?id=shared-font&type=font/ttf`, 'Shared Font')],
      ['gif', new ex.Gif(`${server}/slow?id=shared-gif&type=image/gif`)]
    ];
    for (const [name, asset] of cases) {
      const first = new AbortController();
      const second = new AbortController();
      const firstLoad = asset.load(first.signal);
      const secondLoad = asset.load(second.signal);
      const state = async () => (await fetch(`${server}/state?id=shared-${name}`, { cache: 'no-store' })).json();
      await vi.waitFor(async () => expect((await state()).started).toBe(true));
      expect((await state()).count).toBe(1);

      first.abort();
      expect(await outcomeWithoutWaitingForWork(firstLoad)).toBe('AbortError');
      expect(await outcomeWithoutWaitingForWork(secondLoad)).toBe('pending');
      expect((await state()).closed).toBe(false);

      second.abort();
      expect(await outcomeWithoutWaitingForWork(secondLoad)).toBe('AbortError');
      await vi.waitFor(async () => expect((await state()).closed).toBe(true));
      expect(asset.isLoaded()).toBe(false);
    }

    const resource = new ex.Resource<string>(`${server}/slow?id=shared-completes`, 'text');
    const first = new AbortController();
    const second = new AbortController();
    const firstLoad = resource.load(first.signal);
    const secondLoad = resource.load(second.signal);
    const state = async () => (await fetch(`${server}/state?id=shared-completes`, { cache: 'no-store' })).json();
    await vi.waitFor(async () => expect((await state()).started).toBe(true));
    expect((await state()).count).toBe(1);
    first.abort();
    expect(await outcomeWithoutWaitingForWork(firstLoad)).toBe('AbortError');
    await fetch(`${server}/finish?id=shared-completes`);
    await expect(secondLoad).resolves.toBe('sometext');
    expect(resource.isLoaded()).toBe(true);

    const reentrantId = 'shared-resource-loadstart';
    const reentrant = new ex.Resource<string>(`${server}/slow?id=${reentrantId}`, 'text');
    const initiating = new AbortController();
    const joining = new AbortController();
    let joined!: Promise<string>;
    reentrant.events.once('loadstart', () => {
      joined = reentrant.load(joining.signal);
    });
    const initiatedOutcome = loadOutcome(reentrant.load(initiating.signal));
    await vi.waitFor(() => expect(joined).toBeDefined());
    const joinedOutcome = loadOutcome(joined);
    const reentrantState = async () => (await fetch(`${server}/state?id=${reentrantId}`, { cache: 'no-store' })).json();
    await vi.waitFor(async () => expect((await reentrantState()).started).toBe(true));
    const requestCount = (await reentrantState()).count;
    initiating.abort();
    const canceled = await initiatedOutcome;
    const closedBeforeCompletion = (await reentrantState()).closed;
    await fetch(`${server}/finish?id=${reentrantId}`);
    const completed = await joinedOutcome;
    expect(requestCount).toBe(1);
    expect(canceled).toBe('AbortError');
    expect(closedBeforeCompletion).toBe(false);
    expect(completed).toBe('resolved');
    expect(reentrant.isLoaded()).toBe(true);

    const send = vi.spyOn(XMLHttpRequest.prototype, 'send');
    const immediate = new ex.Resource<string>(textPath, 'text');
    const departing = new AbortController();
    const remaining = new AbortController();
    let remainingLoad!: Promise<string>;
    immediate.events.once('loadstart', () => {
      remainingLoad = immediate.load(remaining.signal);
      departing.abort();
    });
    const departingOutcome = loadOutcome(immediate.load(departing.signal));
    await vi.waitFor(() => expect(remainingLoad).toBeDefined());
    await expect(remainingLoad).resolves.toBe('sometext');
    expect(await departingOutcome).toBe('AbortError');
    // Other transports are valid, but restarting the XHR work is not sharing it.
    expect(send.mock.calls.length).toBeLessThanOrEqual(1);
    send.mockRestore();
  });

  it('keeps a shared loader active for a caller that has not canceled', async () => {
    const engine = TestUtils.engine();
    engines.push(engine);
    let startWork!: () => void;
    const workStarted = new Promise<void>((resolve) => (startWork = resolve));
    let finishWork!: () => void;
    let aborted = false;
    const resource: ex.Loadable<number> = {
      data: null as any,
      load(signal?: AbortSignal) {
        startWork();
        return new Promise<number>((resolve, reject) => {
          const onAbort = () => {
            aborted = true;
            reject(new DOMException('Canceled', 'AbortError'));
          };
          signal?.addEventListener('abort', onAbort, { once: true });
          finishWork = () => {
            signal?.removeEventListener('abort', onAbort);
            this.data = 7;
            resolve(7);
          };
        });
      },
      isLoaded() {
        return this.data !== null;
      }
    };
    const loader = new ex.DefaultLoader({ loadables: [resource] });
    loader.onInitialize(engine);
    loader.onAfterLoad = () => Promise.resolve();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const first = loader.load(firstController.signal);
    const second = loader.load(secondController.signal);
    const secondOutcome = loadOutcome(second);
    await workStarted;

    firstController.abort();
    expect(await loadOutcome(first)).toBe('AbortError');
    expect(aborted).toBe(false);
    expect(await outcomeWithoutWaitingForWork(secondOutcome)).toBe('pending');

    finishWork();
    await expect(second).resolves.toEqual([resource]);
    expect(await secondOutcome).toBe('resolved');
    expect(loader.isLoaded()).toBe(true);
    expect(aborted).toBe(false);

    const server = import.meta.env.VITE_ABORT_REQUEST_URL;
    const directId = 'shared-direct-last';
    const directChild = new ex.Resource<string>(`${server}/slow?id=${directId}`, 'text');
    const directLoader = new ex.DefaultLoader({ loadables: [directChild] });
    directLoader.onInitialize(engine);
    directLoader.onAfterLoad = () => Promise.resolve();
    const firstDirectController = new AbortController();
    const secondDirectController = new AbortController();
    const firstDirectOutcome = loadOutcome(directLoader.load(firstDirectController.signal));
    const secondDirectOutcome = loadOutcome(directLoader.load(secondDirectController.signal));
    const directState = async () => (await fetch(`${server}/state?id=${directId}`, { cache: 'no-store' })).json();
    await vi.waitFor(async () => expect((await directState()).started).toBe(true));
    firstDirectController.abort();
    expect(await firstDirectOutcome).toBe('AbortError');
    expect((await directState()).closed).toBe(false);
    secondDirectController.abort();
    expect(await secondDirectOutcome).toBe('AbortError');
    await vi.waitFor(async () => expect((await directState()).closed).toBe(true));
    directChild.path = textPath;
    await directLoader.load();
    expect(directChild.isLoaded()).toBe(true);

    const requestId = 'shared-engine-last';
    const child = new ex.Resource<string>(`${server}/slow?id=${requestId}`, 'text');
    const sharedLoader = new ex.DefaultLoader({ loadables: [child] });
    sharedLoader.onAfterLoad = () => Promise.resolve();
    const firstEngineController = new AbortController();
    const secondEngineController = new AbortController();
    const firstEngineOutcome = loadOutcome(engine.load(sharedLoader, false, firstEngineController.signal));
    const secondEngineOutcome = loadOutcome(engine.load(sharedLoader, false, secondEngineController.signal));
    const requestState = async () => (await fetch(`${server}/state?id=${requestId}`, { cache: 'no-store' })).json();
    await vi.waitFor(async () => expect((await requestState()).started).toBe(true));

    firstEngineController.abort();
    await firstEngineOutcome;
    expect(engine.loadingComplete).toBe(false);
    expect((await requestState()).closed).toBe(false);

    secondEngineController.abort();
    await secondEngineOutcome;
    await vi.waitFor(async () => expect((await requestState()).closed).toBe(true));
    expect(engine.loadingComplete).toBe(true);
    child.path = textPath;
    await engine.load(sharedLoader);
    expect(child.isLoaded()).toBe(true);
  });

  it('keeps shared loader work alive for an unsignaled caller', async () => {
    const engine = TestUtils.engine();
    engines.push(engine);
    let finishWork!: () => void;
    let loadCount = 0;
    let aborted = false;
    const resource: ex.Loadable<number> = {
      data: null as any,
      load(signal?: AbortSignal) {
        loadCount++;
        return new Promise<number>((resolve, reject) => {
          const onAbort = () => {
            aborted = true;
            reject(new DOMException('Canceled', 'AbortError'));
          };
          signal?.addEventListener('abort', onAbort, { once: true });
          finishWork = () => {
            signal?.removeEventListener('abort', onAbort);
            this.data = 11;
            resolve(11);
          };
        });
      },
      isLoaded() {
        return this.data !== null;
      }
    };
    const loader = new ex.DefaultLoader({ loadables: [resource] });
    loader.onInitialize(engine);
    loader.onAfterLoad = () => Promise.resolve();
    const controller = new AbortController();
    const signaled = loader.load(controller.signal);
    const unsignaled = loader.load();
    const signaledOutcome = loadOutcome(signaled);
    const unsignaledOutcome = loadOutcome(unsignaled);
    await vi.waitFor(() => expect(loadCount).toBe(1));

    controller.abort();
    expect(await signaledOutcome).toBe('AbortError');
    expect(aborted).toBe(false);
    expect(await outcomeWithoutWaitingForWork(unsignaledOutcome)).toBe('pending');

    finishWork();
    await expect(unsignaled).resolves.toEqual([resource]);
    expect(await unsignaledOutcome).toBe('resolved');
    expect(loader.isLoaded()).toBe(true);
    expect(loadCount).toBe(1);
    expect(aborted).toBe(false);
  });

  it('can stop waiting for user action and retry the loader', async () => {
    const engine = TestUtils.engine();
    engines.push(engine);
    const resource = new ex.Resource<string>(textPath, 'text');
    await resource.load();
    const loader = new ex.DefaultLoader({ loadables: [resource] });
    loader.onInitialize(engine);
    loader.onAfterLoad = () => Promise.resolve();
    const controller = new AbortController();
    let enterAction!: () => void;
    const actionStarted = new Promise<void>((resolve) => (enterAction = resolve));
    let finishAction!: () => void;
    loader.onUserAction = () => {
      enterAction();
      return new Promise<void>((resolve) => (finishAction = resolve));
    };
    const pending = loader.load(controller.signal);
    await actionStarted;
    controller.abort();
    const outcome = await outcomeWithoutWaitingForWork(pending);
    finishAction();

    expect(outcome).toBe('AbortError');
    expect(loader.isLoaded()).toBe(false);
    loader.onUserAction = () => Promise.resolve();
    await loader.load();
    expect(loader.isLoaded()).toBe(true);
  });

  it('stops waiting in loader hooks before or after the resources', async () => {
    const engine = TestUtils.engine();
    engines.push(engine);
    const resource = new ex.Resource<string>(textPath, 'text');
    await resource.load();

    for (const phase of ['onBeforeLoad', 'onAfterLoad'] as const) {
      const loader = new ex.DefaultLoader({ loadables: [resource] });
      loader.onInitialize(engine);
      let enterHook!: () => void;
      const entered = new Promise<void>((resolve) => (enterHook = resolve));
      loader[phase] = () =>
        new Promise<void>(() => {
          enterHook();
        });
      const controller = new AbortController();
      const pending = loader.load(controller.signal);
      await entered;
      controller.abort();
      const outcome = await outcomeWithoutWaitingForWork(pending);
      expect(outcome).toBe('AbortError');
      expect(loader.isLoaded()).toBe(false);
    }

    const eventLoader = new ex.DefaultLoader({ loadables: [resource] });
    eventLoader.onInitialize(engine);
    eventLoader.onAfterLoad = () => Promise.resolve();
    const eventController = new AbortController();
    eventLoader.on('afterload', () => eventController.abort());
    expect(await loadOutcome(eventLoader.load(eventController.signal))).toBe('AbortError');
    expect(eventLoader.isLoaded()).toBe(false);
  });

  it('clears Engine loading state after a canceled load', async () => {
    const engine = TestUtils.engine();
    engines.push(engine);
    const resource = new ex.Resource<string>(textPath, 'text');
    const loader = new ex.DefaultLoader({ loadables: [resource] });
    loader.onAfterLoad = () => Promise.resolve();
    const controller = new AbortController();
    loader.on('loadresourcestart', () => controller.abort());

    // Engine.load historically catches loader errors; verify cancellation and reuse, not its rejection policy.
    await loadOutcome(engine.load(loader, false, controller.signal));
    expect(controller.signal.aborted).toBe(true);
    expect(resource.isLoaded()).toBe(false);
    await engine.load(loader);
    expect(resource.isLoaded()).toBe(true);

    let entered!: () => void;
    const activeStarted = new Promise<void>((resolve) => (entered = resolve));
    let finish!: () => void;
    const activeLoader = new ex.DefaultLoader({ loadables: [resource] });
    activeLoader.onBeforeLoad = () =>
      new Promise<void>((resolve) => {
        finish = resolve;
        entered();
      });
    activeLoader.onAfterLoad = () => Promise.resolve();
    const active = engine.load(activeLoader);
    await activeStarted;
    expect(engine.loadingComplete).toBe(false);
    const rejectedLoader = new ex.DefaultLoader({ loadables: [resource] });
    rejectedLoader.onBeforeLoad = vi.fn(() => Promise.resolve());
    const preAborted = new AbortController();
    preAborted.abort();
    try {
      await loadOutcome(engine.load(rejectedLoader, false, preAborted.signal));
      expect(rejectedLoader.onBeforeLoad).not.toHaveBeenCalled();
      expect(engine.loadingComplete).toBe(false);
    } finally {
      finish();
      await active;
    }
    expect(engine.loadingComplete).toBe(true);
  });

  it('keeps the current scene active if its destination load is canceled', async () => {
    for (const configured of [false, true]) {
      const current = new ex.Scene();
      const destination = new ex.Scene();
      const resource = new ex.Resource<string>(textPath, 'text');
      const controller = new AbortController();
      const preload = vi.spyOn(destination, 'onPreLoad').mockImplementation((loader) => {
        loader.addResource(resource);
        loader.onAfterLoad = () => Promise.resolve();
        loader.once('loadresourcestart', () => controller.abort());
      });
      const route = configured ? { scene: destination, loader: new ex.DefaultLoader() } : destination;
      const engine = TestUtils.engine({ scenes: { root: current, destination: route } });
      engines.push(engine);
      await engine.director.onInitialize();

      await loadOutcome(engine.goToScene('destination', { signal: controller.signal }));
      expect(controller.signal.aborted).toBe(true);
      expect(engine.currentScene).toBe(current);
      expect(resource.isLoaded()).toBe(false);
      await engine.goToScene('destination');
      expect(engine.currentScene).toBe(destination);
      expect(resource.isLoaded()).toBe(true);
      // Scene.onPreLoad documents a once-per-scene lifecycle, including an interrupted load.
      expect(preload).toHaveBeenCalledTimes(1);
    }
  });

  it('removes the standard Loader play button on cancellation and can retry', async () => {
    const engine = TestUtils.engine({ width: 320, height: 240, suppressPlayButton: false });
    engines.push(engine);
    const alreadyAborted = new AbortController();
    alreadyAborted.abort();
    const freshResource = new ex.Resource<string>(textPath, 'text');
    const freshLoader = new ex.Loader([freshResource]);
    freshLoader.onInitialize(engine);
    expect(await loadOutcome(freshLoader.load(alreadyAborted.signal))).toBe('AbortError');
    expect(freshResource.isLoaded()).toBe(false);

    await engine.start(new ex.DefaultLoader());
    const resource = new ex.Resource<string>(textPath, 'text');
    await resource.load();
    const loader = new ex.Loader([resource]);
    const playButton = () =>
      Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.trim() === loader.playButtonText);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstPending = engine.load(loader, false, firstController.signal);
    const secondPending = engine.load(loader, false, secondController.signal);
    await vi.waitFor(
      () => {
        (engine.clock as ex.TestClock).step(200);
        expect(playButton()?.checkVisibility()).toBe(true);
      },
      { timeout: 5000 }
    );
    firstController.abort();
    expect(await outcomeWithoutWaitingForWork(firstPending)).toBe('AbortError');
    expect(playButton()?.checkVisibility()).toBe(true);
    expect(await outcomeWithoutWaitingForWork(secondPending)).toBe('pending');

    secondController.abort();

    const outcome = await outcomeWithoutWaitingForWork(secondPending);
    if (outcome === 'pending') {
      playButton()?.click();
      await secondPending;
    }
    expect(outcome).not.toBe('pending');
    expect(playButton()?.checkVisibility() ?? false).toBe(false);
    expect(loader.isLoaded()).toBe(false);

    const retry = engine.load(loader);
    await vi.waitFor(
      () => {
        (engine.clock as ex.TestClock).step(200);
        expect(playButton()?.checkVisibility()).toBe(true);
      },
      { timeout: 5000 }
    );
    playButton()!.click();
    await retry;
    expect(loader.isLoaded()).toBe(true);
    expect(await loadOutcome(loader.load(alreadyAborted.signal))).toBe('AbortError');
  });

  it('does not enter a scene if its hidden load is canceled during a transition', async () => {
    const engine = TestUtils.engine();
    engines.push(engine);
    const current = new ex.Scene();
    const destination = new ex.Scene();
    const resource = new ex.Resource<string>(textPath, 'text');
    const loader = new ex.DefaultLoader({ loadables: [resource] });
    loader.onAfterLoad = () => Promise.resolve();
    const director = new ex.Director(engine, { current, destination: { scene: destination, loader } });
    director.configureStart('current');
    director.onInitialize();
    engine.clock.start();
    const controller = new AbortController();
    loader.on('loadresourcestart', () => controller.abort());
    const sourceOut = new ex.Transition({ duration: 100, hideLoader: true });

    const navigation = director.goToScene('destination', { sourceOut, signal: controller.signal });
    for (let i = 0; i < 4; i++) {
      (engine.clock as ex.TestClock).step(100);
      await Promise.resolve();
    }
    await loadOutcome(navigation);
    expect(director.currentScene).toBe(current);
    expect(resource.isLoaded()).toBe(false);
    await director.goToScene('destination');
    expect(director.currentScene).toBe(destination);
  });

  it('keeps a hidden destination inactive when canceled during user action or an after-load hook', async () => {
    for (const hookName of ['onUserAction', 'onAfterLoad'] as const) {
      const current = new ex.Scene();
      const destination = new ex.Scene();
      const resource = new ex.Resource<string>(textPath, 'text');
      const loader = new ex.DefaultLoader({ loadables: [resource] });
      loader.onAfterLoad = () => Promise.resolve();
      let release!: () => void;
      let waiting = false;
      loader[hookName] = () => {
        waiting = true;
        return new Promise<void>((resolve) => (release = resolve));
      };
      const engine = TestUtils.engine({ scenes: { root: current, destination: { scene: destination, loader } } });
      engines.push(engine);
      await engine.start(new ex.DefaultLoader());
      const clock = engine.clock as ex.TestClock;
      const controller = new AbortController();
      const navigation = engine.goToScene('destination', {
        sourceOut: new ex.Transition({ duration: 100, hideLoader: true }),
        signal: controller.signal
      });
      const outcome = loadOutcome(navigation);
      await vi.waitFor(() => {
        clock.step(100);
        expect(waiting).toBe(true);
      });
      controller.abort();
      for (let i = 0; i < 4; i++) {
        clock.step(100);
        await Promise.resolve();
      }
      await outcome;
      expect(engine.currentScene === current).toBe(true);
      expect(loader.isLoaded()).toBe(false);
      release();
      await Promise.resolve();
      await Promise.resolve();
      expect(engine.currentScene === current).toBe(true);

      loader[hookName] = () => Promise.resolve();
      const retry = engine.goToScene('destination', {
        sourceOut: new ex.Transition({ duration: 100, hideLoader: true }),
        signal: new AbortController().signal
      });
      await vi.waitFor(() => {
        clock.step(100);
        expect(loader.isLoaded()).toBe(true);
      });
      await retry;
      expect(engine.currentScene === destination).toBe(true);
    }

    const current = new ex.Scene();
    const destination = new ex.Scene();
    const child = new ex.Resource<string>(textPath, 'text');
    await child.load();
    const loader = new ex.DefaultLoader({ loadables: [child] });
    let enterHook!: () => void;
    const hookEntered = new Promise<void>((resolve) => (enterHook = resolve));
    let finishHook!: () => void;
    loader.onAfterLoad = () =>
      new Promise<void>((resolve) => {
        finishHook = resolve;
        enterHook();
      });
    const engine = TestUtils.engine({ scenes: { root: current, destination: { scene: destination, loader } } });
    engines.push(engine);
    await engine.start(new ex.DefaultLoader());
    const deactivated = vi.fn();
    current.events.on('deactivate', deactivated);
    await engine.director.maybeLoadScene('destination', true);
    await hookEntered;

    const controller = new AbortController();
    const navigation = engine.goToScene('destination', { signal: controller.signal });
    expect(await outcomeWithoutWaitingForWork(navigation)).toBe('pending');
    controller.abort();
    await loadOutcome(navigation);
    expect(engine.currentScene).toBe(current);
    expect(deactivated).not.toHaveBeenCalled();

    finishHook();
    await loader.load();
    await engine.goToScene('destination');
    expect(engine.currentScene).toBe(destination);
  });
});
