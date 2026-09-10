import { clamp } from '../../math';
import { Logger } from '../../util/log';
import { Sound } from './sound';

export type AnyString = {} & string;

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
  channels?: readonly Channel[];
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
   * Maximum number of simultaneously playing tracks allowed across ALL sounds
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
   * (auto-keyed by each sound's {@apilink Sound.name}).
   */
  sounds: Record<SoundName, Sound | SoundConfig<NoInfer<Channel>>> | readonly (Sound | SoundConfig<NoInfer<Channel>>)[];
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
 * const coin = ex.createSound('/sfx/coin.mp3');   // Sound<'coin'>
 * type N = ex.SoundName<typeof coin>;             // 'coin'
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
  play(name: string, volume?: number): Promise<boolean>;
  stop(name?: string): void;
  mute(name?: string): void;
  unmute(name?: string): void;
  toggle(name?: string): void;
}

/**
 * Group operations over every sound in a channel, see {@apilink SoundManager.channel}
 */
export class ChannelCollection<Channel extends string> implements SoundManagerApi {
  constructor(public soundManager: SoundManager<Channel, string>) {}

  stop(name: Channel): void {
    for (const sound of this.soundManager.getSoundsForChannel(name)) {
      this.soundManager.stop(sound);
    }
  }

  setVolume(name: Channel, volume?: number): void {
    for (const sound of this.soundManager.getSoundsForChannel(name)) {
      this.soundManager.setVolume(sound, volume);
    }
  }

  /**
   * Play every sound in the channel, resolves to true if every sound played, false if any was
   * muted or dropped by a concurrency cap.
   */
  play(name: Channel, volume?: number): Promise<boolean> {
    const playing: Promise<boolean>[] = [];
    for (const sound of this.soundManager.getSoundsForChannel(name)) {
      playing.push(this.soundManager.play(sound, volume));
    }
    return Promise.all(playing).then((results) => results.every((r) => r));
  }

  mute(name: Channel): void {
    for (const sound of this.soundManager.getSoundsForChannel(name)) {
      this.soundManager.mute(sound);
    }
  }

  unmute(name: Channel): void {
    for (const sound of this.soundManager.getSoundsForChannel(name)) {
      this.soundManager.unmute(sound);
    }
  }

  toggle(name: Channel): void {
    for (const sound of this.soundManager.getSoundsForChannel(name)) {
      this.soundManager.toggle(sound);
    }
  }
}

/**
 * Manage Sound volume levels without mutating the original Sound objects
 */
export class SoundManager<Channel extends string, SoundName extends string> implements SoundManagerApi {
  private _sounds = new Map<string, Sound>();
  private _names = new Map<Sound, string>();
  private _mix = new Map<Sound, number>();
  private _channels = new Map<string, Sound[]>();
  private _muted = new Set<Sound>();
  private _logger = Logger.getInstance();

  private _defaultVolume: number = 1;
  public set defaultVolume(volume: number) {
    this._defaultVolume = clamp(volume, 0, 1);
  }

  public get defaultVolume(): number {
    return this._defaultVolume;
  }

  /**
   * Maximum number of simultaneously playing tracks across ALL managed sounds.
   * Default is `Infinity` (unbounded). When the cap is reached, new `play()`
   * calls are dropped.
   */
  public maxConcurrentTracks: number = Infinity;

  public channel: ChannelCollection<Channel>;

  constructor(options: SoundManagerOptions<Channel, SoundName>) {
    this._defaultVolume = options.volume ?? 1;
    this.maxConcurrentTracks = options.maxConcurrentTracks ?? Infinity;
    this.channel = new ChannelCollection(this);
    if (Array.isArray(options.sounds)) {
      for (const s of options.sounds as readonly (Sound | SoundConfig)[]) {
        this.track(s);
      }
    } else {
      for (const [name, soundOrConfig] of Object.entries<Sound | SoundConfig>(options.sounds)) {
        this.track(name, soundOrConfig);
      }
    }
  }

  /**
   * Total number of currently-playing tracks across all managed sounds
   */
  public playingCount(): number {
    let count = 0;
    for (const sound of this._names.keys()) {
      count += sound.playingCount();
    }
    return count;
  }

  public getSounds(): readonly Sound[] {
    return Array.from(this._names.keys());
  }

  public getSoundsForChannel(channel: Channel | AnyString): readonly Sound[] {
    return this._channels.get(channel) ?? [];
  }

  public isMuted(sound: Sound): boolean {
    return this._muted.has(sound);
  }

  /**
   * Resolve a registered name or a bare {@apilink Sound} to the sound. A bare
   * Sound resolves by identity (not by its own name) so aliases registered via
   * `track('gold', coin)` work, and an untracked Sound resolves to itself.
   */
  private _resolve(nameOrSound: Sound | string): Sound | undefined {
    return nameOrSound instanceof Sound ? nameOrSound : this._sounds.get(nameOrSound);
  }

  /**
   * Play a sound at `volume` scaled by the manager's default volume and the
   * sound's mix. Resolves to false if the sound is unknown, muted, or dropped
   * by {@apilink SoundManager.maxConcurrentTracks}.
   */
  public play(name: SoundName, volume?: number): Promise<boolean>;
  public play(sound: Sound, volume?: number): Promise<boolean>;
  public play(nameOrSound: SoundName | Sound, volume: number = this._defaultVolume): Promise<boolean> {
    const sound = this._resolve(nameOrSound);
    if (!sound || this.isMuted(sound)) {
      return Promise.resolve(false);
    }

    if (this.playingCount() >= this.maxConcurrentTracks) {
      this._logger.warnOnce(`SoundManager: maxConcurrentTracks (${this.maxConcurrentTracks}) reached; dropping play of "${sound.name}".`);
      return Promise.resolve(false);
    }

    return sound.play(volume * this._getEffectiveVolume(sound));
  }

  private _getEffectiveVolume(sound: Sound): number {
    return this._defaultVolume * (this._mix.get(sound) ?? 1);
  }

  public getSound(name: SoundName | AnyString): Sound | undefined;
  public getSound(sound: Sound): Sound;
  public getSound(nameOrSound: SoundName | AnyString | Sound): Sound | undefined {
    return this._resolve(nameOrSound);
  }

  /**
   * Set the mix volume for a tracked sound (or the volume directly for an untracked one)
   */
  public setVolume(name: SoundName, volume?: number): void;
  public setVolume(sound: Sound, volume?: number): void;
  public setVolume(nameOrSound: SoundName | Sound, volume: number = this._defaultVolume): void {
    const sound = this._resolve(nameOrSound);
    if (!sound) {
      return;
    }
    volume = clamp(volume, 0, 1);
    if (this._names.has(sound)) {
      this._mix.set(sound, volume);
    }
    sound.volume = volume;
  }

  /**
   * Gets the mix volume for a tracked sound (or the volume directly for an untracked one)
   */
  public getVolume(name: SoundName): number;
  public getVolume(sound: Sound): number;
  public getVolume(nameOrSound: SoundName | Sound): number {
    const sound = this._resolve(nameOrSound);
    if (!sound) {
      return 0;
    }
    return this._names.has(sound) ? (this._mix.get(sound) ?? 0) : sound.volume;
  }

  /**
   * Start managing a sound, registered under `name`, the config's `name`, or the sound's own name
   */
  public track(sound: Sound | SoundConfig): void;
  public track(name: SoundName | AnyString, soundOrConfig: Sound | SoundConfig): void;
  public track(nameOrSound: SoundName | AnyString | Sound | SoundConfig, soundOrConfig?: Sound | SoundConfig): void {
    let name: string | undefined;
    let config: Sound | SoundConfig;
    if (soundOrConfig === undefined) {
      config = nameOrSound as Sound | SoundConfig;
    } else {
      name = nameOrSound as string;
      config = soundOrConfig;
    }

    const sound = config instanceof Sound ? config : config.sound;
    const volume = config instanceof Sound ? undefined : config.volume;
    const channels = config instanceof Sound ? undefined : config.channels;
    name ??= config instanceof Sound ? config.name : (config.name ?? config.sound.name);

    if (this._sounds.has(name)) {
      this._logger.warnOnce(`SoundManager: a sound named "${name}" is already tracked; overwriting the previous registration.`);
      this.untrack(name as SoundName);
    }
    this._sounds.set(name, sound);
    this._names.set(sound, name);
    this._mix.set(sound, volume ?? this._defaultVolume);

    if (channels) {
      this.addChannel(name, channels);
    }
  }

  /**
   * Stop managing a sound, removing its mix and channel membership
   */
  public untrack(name: SoundName): void;
  public untrack(sound: Sound): void;
  public untrack(nameOrSound: SoundName | Sound): void {
    const sound = this._resolve(nameOrSound);
    const name = sound && this._names.get(sound);
    if (!sound || name === undefined) {
      return;
    }
    this._sounds.delete(name);
    this._names.delete(sound);
    this._mix.delete(sound);
    this._muted.delete(sound);
    for (const sounds of this._channels.values()) {
      const index = sounds.indexOf(sound);
      if (index !== -1) {
        sounds.splice(index, 1);
      }
    }
  }

  public stop(name?: SoundName): void;
  public stop(sound: Sound): void;
  public stop(nameOrSound?: SoundName | Sound): void {
    if (nameOrSound === undefined) {
      for (const sound of this._names.keys()) {
        sound.stop();
      }
      return;
    }
    this._resolve(nameOrSound)?.stop();
  }

  /**
   * Mute a sound (or every managed sound), pausing any current playback
   */
  public mute(name?: SoundName): void;
  public mute(sound: Sound): void;
  public mute(nameOrSound?: SoundName | Sound): void {
    if (nameOrSound === undefined) {
      for (const sound of this._names.keys()) {
        this.mute(sound);
      }
      return;
    }
    const sound = this._resolve(nameOrSound);
    if (sound) {
      this._muted.add(sound);
      sound.pause();
    }
  }

  /**
   * Unmute a sound (or every managed sound), resuming playback paused by mute
   */
  public unmute(name?: SoundName): void;
  public unmute(sound: Sound): void;
  public unmute(nameOrSound?: SoundName | Sound): void {
    if (nameOrSound === undefined) {
      for (const sound of Array.from(this._muted)) {
        this.unmute(sound);
      }
      return;
    }
    const sound = this._resolve(nameOrSound);
    if (sound && this._muted.delete(sound) && sound.isPaused()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sound.play();
    }
  }

  public toggle(name?: SoundName): void;
  public toggle(sound: Sound): void;
  public toggle(nameOrSound?: SoundName | Sound): void {
    if (nameOrSound === undefined) {
      if (this._muted.size > 0) {
        this.unmute();
      } else {
        this.mute();
      }
      return;
    }
    const sound = this._resolve(nameOrSound);
    if (!sound) {
      return;
    }
    if (this.isMuted(sound)) {
      this.unmute(sound);
    } else {
      this.mute(sound);
    }
  }

  /**
   * Add a tracked sound to a list of channels
   */
  public addChannel(soundName: SoundName | AnyString, channels: readonly (Channel | AnyString)[]): void {
    const sound = this._sounds.get(soundName);
    if (!sound) {
      return;
    }
    for (const channel of channels) {
      let sounds = this._channels.get(channel);
      if (!sounds) {
        this._channels.set(channel, (sounds = []));
      }
      if (!sounds.includes(sound)) {
        sounds.push(sound);
      }
    }
  }

  /**
   * Remove a tracked sound from a list of channels
   */
  public removeChannel(soundName: SoundName | AnyString, channels: readonly (Channel | AnyString)[]): void {
    const sound = this._sounds.get(soundName);
    if (!sound) {
      return;
    }
    for (const channel of channels) {
      const sounds = this._channels.get(channel);
      const index = sounds?.indexOf(sound) ?? -1;
      if (index !== -1) {
        sounds!.splice(index, 1);
      }
    }
  }
}

/**
 * Factory for constructing a strongly-typed {@apilink SoundManager}. Prefer
 * this over `new SoundManager(...)` when using the array-form `sounds` option
 * so the inferred sound-name union is captured. Every sound in the array needs
 * a literal name type ({@apilink createSound} or an explicit `name`) or the
 * union widens to `string`.
 *
 * ```typescript
 * const coin = ex.createSound('/sfx/coin.mp3');   // Sound<'coin'>
 * const jump = ex.createSound('/sfx/jump.ogg');    // Sound<'jump'>
 * const mgr = ex.createSoundManager({ channels: ['sfx'], sounds: [coin, { sound: jump, channels: ['sfx'] }] });
 * mgr.play('coin');   // ✓
 * mgr.play('coinn');  // ✗ compile error
 * ```
 */
export function createSoundManager<
  const S extends readonly (Sound<any> | SoundConfig<C[number], any>)[],
  const C extends readonly string[] = readonly string[]
>(
  options: SoundManagerOptions<C[number], ArraySoundsNames<S>> & { sounds: S; channels?: C }
): SoundManager<C[number], ArraySoundsNames<S>> {
  return new SoundManager<C[number], ArraySoundsNames<S>>(options);
}
