import { clamp } from '../../math';
import { Logger } from '../../util/log';
import { Sound, getSoundName } from './sound';

export type AnyString = {} & string;

export interface ChannelSoundsConfiguration {
  sounds: Sound[];
}

export interface SoundConfig<Channel extends string = string, SName extends string = string> {
  sound: Sound<SName>;
  /**
   * Optional explicit name for this sound in the manager. If omitted, the
   * sound's own {@apilink Sound.name} (basename-without-extension) is used.
   */
  name?: SName;

  /**
   * Maximum volume for the sound manager to use, all soundManager.play(.5) calls will
   */
  volume?: number;

  /**
   *
   * You may also add a list of string `channels` to do group operations to sounds at once. For example mute all 'background' sounds.
   */
  channels?: Channel[];
}

export interface SoundManagerOptions<Channel extends string = string, SoundName extends string = string> {
  /**
   * Optionally specify the possible channels to avoid typo's
   */
  channels?: readonly Channel[];
  /**
   * Optionally set the default maximum volume for all sounds
   *
   * Default is 1 (100%)
   */
  volume?: number;
  /**
   * Maximum number of concurrent tracks (playbacks) allowed across ALL sounds
   * managed by this {@apilink SoundManager}. When the cap is reached, new
   * `play()` calls are dropped. Default is unbounded (`Infinity`).
   */
  maxConcurrentTracks?: number;
  /**
   * Optionally set the max `volume` for a `sound` to be when played. All other volume operations will be a fraction of the mix.
   *
   * You may also add a list of string `channels` to do group operations to sounds at once. For example mute all 'background' sounds.
   *
   * Accepts either a record keyed by sound name (the key is used as the
   * registered name) or an array of {@apilink Sound} / {@apilink SoundConfig}
   * (auto-keyed by each sound's filename).
   */
  sounds: Record<SoundName, Sound | SoundConfig> | (Sound | SoundConfig)[];
}

export type PossibleChannels<TSoundManagerOptions> = TSoundManagerOptions extends SoundManagerOptions<infer Channels> ? Channels : never;

/**
 * Extract the possible sound names from a {@apilink SoundManagerOptions}. For
 * the record form this is the keys; for the array form it is the union of each
 * sound's inferred name.
 */
export type PossibleSounds<TSoundManagerOptions> = TSoundManagerOptions extends SoundManagerOptions<any, infer SName> ? SName : never;

/**
 * Extract the registered name type of a {@apilink Sound} or {@apilink SoundConfig}.
 *
 * ```typescript
 * const coin = new ex.Sound('/sfx/coin.mp3');   // Sound<'coin'>
 * type N = ex.SoundName<typeof coin>;            // 'coin'
 * ```
 */
export type SoundName<T> = T extends Sound<infer N> ? N : T extends SoundConfig<any, infer N> ? N : string;

/**
 * Infer the union of registered sound names from an array-form `sounds` option.
 */
export type ArraySoundsNames<T> = T extends readonly (infer E)[]
  ? E extends Sound<infer N>
    ? N
    : E extends SoundConfig<any, infer N>
      ? N
      : never
  : never;

export interface SoundManagerApi {
  setVolume(name: string, volume?: number): void;
  play(name: string, volume?: number): Promise<void>;
  stop(name?: string): void;
  mute(name?: string): void;
  unmute(name?: string): void;
  toggle(name?: string): void;
}

export class ChannelCollection<Channel extends string> implements SoundManagerApi {
  constructor(
    options: SoundManagerOptions<Channel, string>,
    public soundManager: SoundManager<Channel, string>
  ) {}

  stop(name: string): void {
    if (!name) {
      return;
    }
    const sounds = this.soundManager.getSoundsForChannel(name);
    for (let i = 0; i < sounds.length; i++) {
      sounds[i].stop();
    }
  }

  setVolume(name: Channel, volume?: number): void {
    const sounds = this.soundManager.getSoundsForChannel(name);
    for (const sound of sounds) {
      if (this.soundManager._isMuted(sound)) {
        continue;
      }
      this.soundManager.setVolume(name, volume);
    }
  }

  play(name: Channel, volume?: number): Promise<void> {
    volume ??= this.soundManager.defaultVolume;
    const playing: Promise<boolean>[] = [];
    const playedAudio = new Set<Sound>();

    const sounds = this.soundManager.getSoundsForChannel(name);
    for (const sound of sounds) {
      // Enforce manager-wide concurrent track cap on each play to bound total voices.
      if (this.soundManager._activeTrackCount() >= this.soundManager.maxConcurrentTracks) {
        break;
      }
      if (playedAudio.has(sound) || this.soundManager._isMuted(sound)) {
        continue;
      }
      const mixVolume = this.soundManager._getEffectiveVolume(sound);

      playing.push(sound.play(mixVolume * volume));
      playedAudio.add(sound);
    }

    return Promise.all(playing) as unknown as Promise<void>;
  }

  mute(name: Channel): void {
    const sounds = this.soundManager.getSoundsForChannel(name);
    for (let i = 0; i < sounds.length; i++) {
      this.soundManager._muted.add(sounds[i]);
      sounds[i].pause();
    }
  }

  unmute(name: Channel): void {
    const sounds = this.soundManager.getSoundsForChannel(name);
    for (let i = 0; i < sounds.length; i++) {
      if (this.soundManager._muted.has(sounds[i])) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        sounds[i].play();
        this.soundManager._muted.delete(sounds[i]);
      }
    }
  }

  toggle(name: Channel): void {
    const sounds = this.soundManager.getSoundsForChannel(name);
    for (let i = 0; i < sounds.length; i++) {
      if (this.soundManager._isMuted(sounds[i])) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        sounds[i].play();
        this.soundManager._muted.delete(sounds[i]);
      } else {
        this.soundManager._muted.add(sounds[i]);
        sounds[i].pause();
      }
    }
  }
}

/**
 * Manage Sound volume levels without mutating the original Sound objects
 */
export class SoundManager<Channel extends string, SoundName extends string> implements SoundManagerApi {
  private _channelToConfig: Map<Channel, ChannelSoundsConfiguration> = new Map<Channel, ChannelSoundsConfiguration>();
  private _nameToConfig: Map<string, SoundConfig> = new Map<string, SoundConfig>();
  private _mix: Map<Sound, number> = new Map<Sound, number>();

  public _muted = new Set<Sound>();
  private _all = new Set<Sound>();
  private _logger = Logger.getInstance();

  private _defaultVolume: number = 1;
  public set defaultVolume(volume: number) {
    this._defaultVolume = clamp(volume, 0, 1);
  }

  public get defaultVolume(): number {
    return this._defaultVolume;
  }

  private _maxConcurrentTracks: number = Infinity;
  /**
   * Maximum number of concurrent tracks (playbacks) across ALL managed sounds.
   * Default is `Infinity` (unbounded). When the cap is reached, new `play()`
   * calls are dropped.
   */
  public get maxConcurrentTracks(): number {
    return this._maxConcurrentTracks;
  }
  public set maxConcurrentTracks(value: number) {
    this._maxConcurrentTracks = value;
  }

  public channel: ChannelCollection<Channel>;

  constructor(options: SoundManagerOptions<Channel, SoundName>) {
    this._defaultVolume = options.volume ?? 1;
    this._maxConcurrentTracks = options.maxConcurrentTracks ?? Infinity;
    this.channel = new ChannelCollection(options, this);
    if (options.sounds) {
      if (Array.isArray(options.sounds)) {
        for (const s of options.sounds) {
          this.track(s as Sound | SoundConfig);
        }
      } else {
        for (const [name, soundOrConfig] of Object.entries<Sound | SoundConfig>(options.sounds)) {
          this.track(name as SoundName, soundOrConfig);
        }
      }
    }
  }

  /**
   * Count the total number of currently-playing tracks across all managed sounds.
   */
  public _activeTrackCount(): number {
    let n = 0;
    this._all.forEach((s) => {
      n += s.instanceCount();
    });
    return n;
  }

  public getSounds(): readonly Sound[] {
    return Array.from(this._all);
  }

  public getSoundsForChannel(channel: Channel | AnyString): readonly Sound[] {
    const config = this._channelToConfig.get(channel as Channel);
    if (config) {
      return config.sounds;
    }

    return [];
  }

  public _isMuted(sound: Sound): boolean {
    return this._muted.has(sound);
  }

  public _getEffectiveVolume(sound: Sound): number {
    if (this._isMuted(sound)) {
      return 0;
    }

    let mix = this._defaultVolume;

    if (this._mix.has(sound)) {
      mix *= this._mix.get(sound) ?? this._defaultVolume;
    }

    return mix;
  }

  /**
   * Resolve a bare {@apilink Sound} or a registered name to the underlying
   * sound and whether it is tracked by this manager.
   */
  private _resolve(soundOrName: Sound | string): { sound: Sound | undefined; tracked: boolean; name: string } {
    if (soundOrName instanceof Sound) {
      const name = getSoundName(soundOrName);
      const cfg = this._nameToConfig.get(name);
      if (cfg && cfg.sound === soundOrName) {
        return { sound: soundOrName, tracked: true, name };
      }
      return { sound: soundOrName, tracked: false, name };
    }
    const cfg = this._nameToConfig.get(soundOrName);
    return cfg ? { sound: cfg.sound, tracked: true, name: soundOrName } : { sound: undefined, tracked: false, name: soundOrName };
  }

  public play(name: SoundName, volume?: number): Promise<void>;
  public play(sound: Sound, volume?: number): Promise<void>;
  public play(nameOrSound: SoundName | Sound, volume: number = this._defaultVolume): Promise<void> {
    const r = this._resolve(nameOrSound);
    if (!r.sound) {
      return Promise.resolve();
    }

    if (this._activeTrackCount() >= this.maxConcurrentTracks) {
      this._logger.warnOnce(`SoundManager: maxConcurrentTracks (${this.maxConcurrentTracks}) reached; dropping play of "${r.name}".`);
      return Promise.resolve();
    }

    if (this._isMuted(r.sound)) {
      return Promise.resolve();
    }

    const effectiveVolume = r.tracked ? volume * this._getEffectiveVolume(r.sound) : volume * this._defaultVolume;
    return (r.sound as Sound).play(effectiveVolume) as unknown as Promise<void>;
  }

  public getSound(name: SoundName | AnyString): Sound | undefined;
  public getSound(sound: Sound): Sound;
  public getSound(nameOrSound: SoundName | AnyString | Sound): Sound | undefined {
    const r = this._resolve(nameOrSound as Sound | string);
    return r.sound;
  }

  public setVolume(name: SoundName, volume?: number): void;
  public setVolume(sound: Sound, volume?: number): void;
  public setVolume(nameOrSound: SoundName | Sound, volume: number = this._defaultVolume): void {
    const r = this._resolve(nameOrSound);
    if (!r.sound) {
      return;
    }
    if (r.tracked) {
      this._setMix(r.sound, volume);
    } else {
      r.sound.volume = clamp(volume, 0, 1);
    }
  }

  /**
   * Gets the volumn for a sound
   */
  public getVolume(name: SoundName): number;
  public getVolume(sound: Sound): number;
  public getVolume(nameOrSound: SoundName | Sound): number {
    const r = this._resolve(nameOrSound);
    if (!r.sound) {
      return 0;
    }
    if (r.tracked) {
      return this._mix.get(r.sound) ?? 0;
    }
    return r.sound.volume;
  }

  /**
   * Set the maximum volume a sound, if not set assumed to be 1.0 (100% of the source volume)
   */
  private _setMix(sound: Sound, volume: number): void {
    this._mix.set(sound, volume);
    sound.volume = volume;
  }

  public track(sound: Sound | SoundConfig): void;
  public track(name: SoundName | AnyString, soundOrConfig: Sound | SoundConfig): void;
  public track(nameOrSound: SoundName | AnyString | Sound | SoundConfig, soundOrConfig?: Sound | SoundConfig): void {
    let name: string;
    let sound: Sound;
    let volume: number | undefined;
    let channels: string[] | undefined;

    if (soundOrConfig === undefined) {
      // single-arg form: auto-name from the sound's own name
      const sOrC = nameOrSound as Sound | SoundConfig;
      if (sOrC instanceof Sound) {
        sound = sOrC;
        volume = this._defaultVolume;
        channels = [];
        name = getSoundName(sOrC);
      } else {
        sound = sOrC.sound;
        volume = sOrC.volume;
        channels = sOrC.channels;
        name = sOrC.name ?? getSoundName(sound);
      }
    } else {
      // two-arg form: explicit name wins
      name = nameOrSound as string;
      const sOrC = soundOrConfig;
      if (sOrC instanceof Sound) {
        sound = sOrC;
        volume = this._defaultVolume;
        channels = [];
      } else {
        ({ sound, volume, channels } = sOrC);
      }
    }

    if (this._nameToConfig.has(name)) {
      this._logger.warnOnce(`SoundManager: a sound named "${name}" is already tracked; overwriting the previous registration.`);
    }
    this._nameToConfig.set(name, { sound, volume, channels } satisfies SoundConfig);
    this._mix.set(sound, volume ?? this._defaultVolume);
    this._all.add(sound);

    if (channels) {
      this.addChannel(name, channels as Channel[]);
    }
  }

  /**
   * Remove the maximum volume for a sound, will be 100% of the source volume
   *
   * Untracks the Sound in the sound manager
   */
  public untrack(name: SoundName): void;
  public untrack(sound: Sound): void;
  public untrack(nameOrSound: SoundName | Sound): void {
    const r = this._resolve(nameOrSound);
    if (!r.sound) {
      return;
    }
    this._nameToConfig.delete(r.name);
    this._mix.delete(r.sound);
    this._all.delete(r.sound);
  }

  public stop(name?: SoundName): void;
  public stop(sound: Sound): void;
  public stop(nameOrSound?: SoundName | Sound): void {
    if (nameOrSound === undefined) {
      this._all.forEach((s) => s.stop());
      return;
    }
    const r = this._resolve(nameOrSound);
    if (!r.sound) {
      return;
    }
    r.sound.stop();
  }

  public mute(name?: SoundName): void;
  public mute(sound: Sound): void;
  public mute(nameOrSound?: SoundName | Sound): void {
    if (nameOrSound === undefined) {
      this._muted = new Set(this._all);
      this._muted.forEach((s) => s.pause());
      return;
    }
    const r = this._resolve(nameOrSound);
    if (!r.sound) {
      return;
    }
    this._muted.add(r.sound);
    r.sound.pause();
  }

  public unmute(name?: SoundName): void;
  public unmute(sound: Sound): void;
  public unmute(nameOrSound?: SoundName | Sound): void {
    if (nameOrSound === undefined) {
      this._muted.forEach((s) => s.play());
      this._muted.clear();
      return;
    }
    const r = this._resolve(nameOrSound);
    if (!r.sound) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    r.sound.play();
    this._muted.delete(r.sound);
  }

  public toggle(name?: SoundName): void;
  public toggle(sound: Sound): void;
  public toggle(nameOrSound?: SoundName | Sound): void {
    if (nameOrSound === undefined) {
      if (this._muted.size > 0) {
        this._muted.forEach((s) => s.play());
        this._muted.clear();
      } else {
        this._muted = new Set(this._all);
        this._muted.forEach((s) => s.pause());
      }
      return;
    }
    const r = this._resolve(nameOrSound);
    if (!r.sound) {
      return;
    }
    if (this._isMuted(r.sound)) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      r.sound.play();
      this._muted.delete(r.sound);
    } else {
      this._muted.add(r.sound);
      r.sound.pause();
    }
  }

  /**
   * Apply a list of channels to a sound instance
   */
  public addChannel(soundName: SoundName | AnyString, channels: Channel[] | AnyString[]): void {
    const sound = this.getSound(soundName);
    if (!sound) {
      return;
    }
    const currentVolume = this._mix.get(sound);

    this._mix.set(sound, currentVolume ?? this._defaultVolume);
    this._all.add(sound);
    for (const channel of channels) {
      let maybeConfiguration = this._channelToConfig.get(channel as Channel);
      if (!maybeConfiguration) {
        maybeConfiguration = {
          sounds: [sound]
        };
      }
      if (maybeConfiguration.sounds.indexOf(sound) === -1) {
        maybeConfiguration.sounds.push(sound);
      }

      this._channelToConfig.set(channel as Channel, maybeConfiguration);
    }
  }

  public removeChannel(soundName: SoundName | AnyString, channels: Channel[] | AnyString[]): void {
    const sound = this.getSound(soundName);
    if (!sound) {
      return;
    }

    for (const channel of channels) {
      const maybeConfiguration = this._channelToConfig.get(channel as Channel);
      if (!maybeConfiguration) {
        return;
      }
      const index = maybeConfiguration.sounds.indexOf(sound);
      if (index >= -1) {
        maybeConfiguration.sounds.splice(index, 1);
      }

      this._channelToConfig.set(channel as Channel, maybeConfiguration);
    }
  }
}

/**
 * Factory for constructing a strongly-typed {@apilink SoundManager}. Prefer
 * this over `new SoundManager(...)` when using the array-form `sounds` option
 * so the inferred sound-name union is captured.
 *
 * ```typescript
 * const coin = new ex.Sound('/sfx/coin.mp3');   // Sound<'coin'>
 * const jump = new ex.Sound('/sfx/jump.ogg');    // Sound<'jump'>
 * const mgr = ex.createSoundManager({ sounds: [coin, jump] });
 * mgr.play('coin');   // ✓
 * mgr.play('coinn'); // ✗ compile error
 * ```
 */
export function createSoundManager<const S extends readonly (Sound<any> | SoundConfig<any, any>)[], const C extends readonly string[] = []>(
  options: SoundManagerOptions<C[number], ArraySoundsNames<S>> & { sounds: S; channels?: C; maxConcurrentTracks?: number }
): SoundManager<C[number], ArraySoundsNames<S>> {
  const opts = options as unknown as SoundManagerOptions<C[number], ArraySoundsNames<S>>;
  return new SoundManager(opts) as unknown as SoundManager<C[number], ArraySoundsNames<S>>;
}
