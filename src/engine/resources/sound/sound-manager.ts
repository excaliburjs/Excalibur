import { clamp } from '../../math';
import { Logger } from '../../util/log';
import type { Loadable } from '../../interfaces/loadable';
import type { Engine } from '../../engine';
import { Sound } from './sound';
import { AudioContextFactory } from './audio-context';

export type AnyString = {} & string;

export interface SoundConfig<Channel extends string = string, SName extends string = string> {
  sound: Sound<SName>;
  /**
   * Optional explicit name for this sound in the manager. If omitted, the
   * sound's own {@apilink Sound.name} (basename-without-extension) is used.
   */
  name?: SName;

  /**
   * Mix volume [0-1] for this sound in the manager, default 1. Composes with the
   * sound's own volume, its channel volume and the manager's master volume.
   */
  volume?: number;

  /**
   * The {@apilink SoundChannel} this sound is routed through, for example 'music' or 'sfx'.
   * Channel volume, mute and effects apply to every sound in the channel. Sounds without a
   * channel route straight to the manager's master output.
   */
  channel?: Channel;
}

export interface SoundManagerOptions<Channel extends string = string, SoundName extends string = string> {
  /**
   * Optionally specify the possible channels to avoid typo's
   */
  channels?: readonly Channel[];
  /**
   * Master volume [0-1] for every sound in this manager
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
   * The sounds to manage, each optionally with a mix `volume` and a `channel`.
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

/**
 * Smoothly move a gain to a value to avoid clicks, falls back to a direct set
 */
function setGain(gain: AudioParam, value: number, audioContext: AudioContext) {
  if (gain.setTargetAtTime) {
    gain.setTargetAtTime(value, audioContext.currentTime, 0.02);
  } else {
    gain.value = value;
  }
}

/**
 * A group of sounds with a shared gain stage: `input → output → SoundManager.output`.
 *
 * Every sound in the channel is mixed into {@apilink SoundChannel.input}; {@apilink SoundChannel.output}
 * carries the channel volume and mute. Insert Web Audio effects between the two to process the
 * whole channel at once:
 *
 * ```typescript
 * const music = manager.getChannel('music');
 * const muffle = music.audioContext.createBiquadFilter();
 * muffle.type = 'lowpass';
 * music.input.disconnect();
 * music.input.connect(muffle).connect(music.output);
 * ```
 */
export class SoundChannel {
  /**
   * Unity gain every sound in the channel connects to
   */
  public readonly input: GainNode;
  /**
   * Carries the channel volume and mute, connected to the manager's master output
   */
  public readonly output: GainNode;
  private _sounds: Sound[] = [];
  private _volume = 1;
  private _muted = false;

  constructor(
    public readonly name: string,
    public readonly audioContext: AudioContext,
    master: AudioNode
  ) {
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.input.connect(this.output).connect(master);
  }

  /**
   * Sounds currently routed through this channel
   */
  public get sounds(): readonly Sound[] {
    return this._sounds;
  }

  /**
   * Channel volume [0-1], default 1
   */
  public get volume(): number {
    return this._volume;
  }
  public set volume(volume: number) {
    this._volume = clamp(volume, 0, 1);
    this._apply();
  }

  public get muted(): boolean {
    return this._muted;
  }

  public mute() {
    this._muted = true;
    this._apply();
  }

  public unmute() {
    this._muted = false;
    this._apply();
  }

  public toggle() {
    this._muted = !this._muted;
    this._apply();
  }

  private _apply() {
    setGain(this.output.gain, this._muted ? 0 : this._volume, this.audioContext);
  }

  /**
   * @internal
   */
  public _add(sound: Sound) {
    if (!this._sounds.includes(sound)) {
      this._sounds.push(sound);
    }
  }

  /**
   * @internal
   */
  public _remove(sound: Sound) {
    const index = this._sounds.indexOf(sound);
    if (index !== -1) {
      this._sounds.splice(index, 1);
    }
  }
}

export interface SoundManagerApi {
  setVolume(name: string, volume?: number): void;
  play(name: string, volume?: number): Promise<boolean>;
  stop(name?: string): void;
  mute(name?: string): void;
  unmute(name?: string): void;
  toggle(name?: string): void;
}

/**
 * Operations on {@apilink SoundChannel}s by name, see {@apilink SoundManager.channel}
 */
export class ChannelCollection<Channel extends string> implements SoundManagerApi {
  constructor(public soundManager: SoundManager<Channel, string>) {}

  /**
   * Get the {@apilink SoundChannel} for direct access to its volume, mute and audio nodes
   */
  get(name: Channel): SoundChannel {
    return this.soundManager.getChannel(name);
  }

  /**
   * Stop every sound in the channel
   */
  stop(name: Channel): void {
    for (const sound of this.soundManager.getChannel(name).sounds) {
      sound.stop();
    }
  }

  /**
   * Set the channel volume [0-1]
   */
  setVolume(name: Channel, volume: number = 1): void {
    this.soundManager.getChannel(name).volume = volume;
  }

  getVolume(name: Channel): number {
    return this.soundManager.getChannel(name).volume;
  }

  /**
   * Play every sound in the channel, resolves to true if every sound played, false if any was
   * dropped by a concurrency cap.
   */
  play(name: Channel, volume?: number): Promise<boolean> {
    const playing: Promise<boolean>[] = [];
    for (const sound of this.soundManager.getChannel(name).sounds) {
      playing.push(this.soundManager.play(sound, volume));
    }
    return Promise.all(playing).then((results) => results.every((r) => r));
  }

  mute(name: Channel): void {
    this.soundManager.getChannel(name).mute();
  }

  unmute(name: Channel): void {
    this.soundManager.getChannel(name).unmute();
  }

  toggle(name: Channel): void {
    this.soundManager.getChannel(name).toggle();
  }

  isMuted(name: Channel): boolean {
    return this.soundManager.getChannel(name).muted;
  }
}

/**
 * Manages a set of sounds through a Web Audio mixer graph:
 *
 * `Sound.output → mix gain → SoundChannel (input → output) → SoundManager.output → speakers`
 *
 * Master, channel and per-sound mix volumes and mutes compose in the graph, so muting is silent
 * playback rather than a pause and none of it touches {@apilink Sound.volume}. A SoundManager is
 * {@apilink Loadable}, add it to a {@apilink Loader} to load every sound it manages.
 */
export class SoundManager<Channel extends string, SoundName extends string> implements SoundManagerApi, Loadable<AudioBuffer[]> {
  private _audioContext = AudioContextFactory.create();
  /**
   * Master gain every managed sound is mixed into, connected to the audio context destination
   */
  public readonly output: GainNode;

  private _sounds = new Map<string, Sound>();
  private _names = new Map<Sound, string>();
  private _mix = new Map<Sound, { gain: GainNode; volume: number; muted: boolean }>();
  private _soundChannel = new Map<Sound, SoundChannel>();
  private _channels = new Map<string, SoundChannel>();
  private _engine?: Engine;
  private _logger = Logger.getInstance();

  private _volume = 1;
  private _muted = false;

  /**
   * Maximum number of simultaneously playing tracks across ALL managed sounds.
   * Default is `Infinity` (unbounded). When the cap is reached, new `play()`
   * calls are dropped.
   */
  public maxConcurrentTracks: number = Infinity;

  public channel: ChannelCollection<Channel>;

  /**
   * Decoded audio of every managed sound once loaded, see {@apilink Loadable}
   */
  public data!: AudioBuffer[];

  constructor(options: SoundManagerOptions<Channel, SoundName>) {
    this.output = this._audioContext.createGain();
    this.output.connect(this._audioContext.destination);
    this.volume = options.volume ?? 1;
    this.maxConcurrentTracks = options.maxConcurrentTracks ?? Infinity;
    this.channel = new ChannelCollection(this);
    for (const channel of options.channels ?? []) {
      this.getChannel(channel);
    }
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
   * Master volume [0-1], default 1
   */
  public get volume(): number {
    return this._volume;
  }
  public set volume(volume: number) {
    this._volume = clamp(volume, 0, 1);
    setGain(this.output.gain, this._muted ? 0 : this._volume, this._audioContext);
  }

  /**
   * Whether the master output is muted
   */
  public get muted(): boolean {
    return this._muted;
  }

  /**
   * Load every managed sound
   */
  public async load(): Promise<AudioBuffer[]> {
    return (this.data = await Promise.all(this.getSounds().map((s) => s.load())));
  }

  public isLoaded(): boolean {
    return this.getSounds().every((s) => s.isLoaded());
  }

  /**
   * Wire every managed sound (including ones tracked later) to the engine so
   * they pause when hidden and stop with it. Called by the {@apilink Loader}.
   */
  public wireEngine(engine: Engine) {
    this._engine = engine;
    for (const sound of this._names.keys()) {
      sound.wireEngine(engine);
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

  /**
   * Get a {@apilink SoundChannel}, creating it on first use
   */
  public getChannel(name: Channel): SoundChannel {
    let channel = this._channels.get(name);
    if (!channel) {
      this._channels.set(name, (channel = new SoundChannel(name, this._audioContext, this.output)));
    }
    return channel;
  }

  public getChannels(): readonly SoundChannel[] {
    return Array.from(this._channels.values());
  }

  public getSoundsForChannel(channel: Channel | AnyString): readonly Sound[] {
    return this._channels.get(channel)?.sounds ?? [];
  }

  /**
   * Route a tracked sound through a channel, or `undefined` for straight to the master output
   */
  public setChannel(name: SoundName, channel: Channel | undefined): void;
  public setChannel(sound: Sound, channel: Channel | undefined): void;
  public setChannel(nameOrSound: SoundName | Sound, channel: Channel | undefined): void {
    const sound = this._resolve(nameOrSound);
    const mix = sound && this._mix.get(sound);
    if (!sound || !mix) {
      return;
    }
    this._soundChannel.get(sound)?._remove(sound);
    this._soundChannel.delete(sound);
    mix.gain.disconnect();
    if (channel === undefined) {
      mix.gain.connect(this.output);
    } else {
      const soundChannel = this.getChannel(channel);
      soundChannel._add(sound);
      this._soundChannel.set(sound, soundChannel);
      mix.gain.connect(soundChannel.input);
    }
  }

  /**
   * Whether a sound is silenced by its own mute, its channel's mute, or the master mute
   */
  public isMuted(name: SoundName): boolean;
  public isMuted(sound: Sound): boolean;
  public isMuted(nameOrSound: SoundName | Sound): boolean {
    const sound = this._resolve(nameOrSound);
    if (!sound) {
      return false;
    }
    return this._muted || !!this._mix.get(sound)?.muted || !!this._soundChannel.get(sound)?.muted;
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
   * Play a sound, optionally setting its own volume. Resolves to false if the sound
   * is unknown or dropped by {@apilink SoundManager.maxConcurrentTracks}. Muted sounds
   * still play (silently) so they are audible mid-clip when unmuted.
   */
  public play(name: SoundName, volume?: number): Promise<boolean>;
  public play(sound: Sound, volume?: number): Promise<boolean>;
  public play(nameOrSound: SoundName | Sound, volume?: number): Promise<boolean> {
    const sound = this._resolve(nameOrSound);
    if (!sound) {
      return Promise.resolve(false);
    }

    if (this.playingCount() >= this.maxConcurrentTracks) {
      this._logger.warnOnce(`SoundManager: maxConcurrentTracks (${this.maxConcurrentTracks}) reached; dropping play of "${sound.name}".`);
      return Promise.resolve(false);
    }

    return sound.play(volume);
  }

  public getSound(name: SoundName | AnyString): Sound | undefined;
  public getSound(sound: Sound): Sound;
  public getSound(nameOrSound: SoundName | AnyString | Sound): Sound | undefined {
    return this._resolve(nameOrSound);
  }

  /**
   * Set the mix volume [0-1] of a tracked sound (or {@apilink Sound.volume} for an untracked one)
   */
  public setVolume(name: SoundName, volume?: number): void;
  public setVolume(sound: Sound, volume?: number): void;
  public setVolume(nameOrSound: SoundName | Sound, volume: number = 1): void {
    const sound = this._resolve(nameOrSound);
    if (!sound) {
      return;
    }
    const mix = this._mix.get(sound);
    if (mix) {
      mix.volume = clamp(volume, 0, 1);
      this._applyMix(mix);
    } else {
      sound.volume = volume;
    }
  }

  /**
   * Get the mix volume of a tracked sound (or {@apilink Sound.volume} for an untracked one)
   */
  public getVolume(name: SoundName): number;
  public getVolume(sound: Sound): number;
  public getVolume(nameOrSound: SoundName | Sound): number {
    const sound = this._resolve(nameOrSound);
    if (!sound) {
      return 0;
    }
    return this._mix.get(sound)?.volume ?? sound.volume;
  }

  private _applyMix(mix: { gain: GainNode; volume: number; muted: boolean }) {
    setGain(mix.gain.gain, mix.muted ? 0 : mix.volume, this._audioContext);
  }

  /**
   * Start managing a sound, registered under `name`, the config's `name`, or the sound's own name.
   * Its output is re-routed through the manager's mixer graph.
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
    const channel = config instanceof Sound ? undefined : config.channel;
    name ??= config instanceof Sound ? config.name : (config.name ?? config.sound.name);

    if (this._sounds.has(name)) {
      this._logger.warnOnce(`SoundManager: a sound named "${name}" is already tracked; overwriting the previous registration.`);
      this.untrack(name as SoundName);
    }
    if (this._names.has(sound)) {
      this.untrack(sound);
    }
    this._sounds.set(name, sound);
    this._names.set(sound, name);

    const mix = { gain: this._audioContext.createGain(), volume: clamp(volume ?? 1, 0, 1), muted: false };
    mix.gain.gain.value = mix.volume;
    this._mix.set(sound, mix);
    sound.output.disconnect();
    sound.output.connect(mix.gain);
    this.setChannel(sound, channel as Channel | undefined);

    if (this._engine) {
      sound.wireEngine(this._engine);
    }
  }

  /**
   * Stop managing a sound, restoring its output straight to the speakers
   */
  public untrack(name: SoundName): void;
  public untrack(sound: Sound): void;
  public untrack(nameOrSound: SoundName | Sound): void {
    const sound = this._resolve(nameOrSound);
    const name = sound && this._names.get(sound);
    if (!sound || name === undefined) {
      return;
    }
    this.setChannel(sound, undefined);
    this._mix.get(sound)?.gain.disconnect();
    sound.output.disconnect();
    sound.output.connect(this._audioContext.destination);
    this._sounds.delete(name);
    this._names.delete(sound);
    this._mix.delete(sound);
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
   * Mute a tracked sound, or the master output when no sound is given. Playback continues silently.
   */
  public mute(name?: SoundName): void;
  public mute(sound: Sound): void;
  public mute(nameOrSound?: SoundName | Sound): void {
    this._setMuted(nameOrSound, true);
  }

  public unmute(name?: SoundName): void;
  public unmute(sound: Sound): void;
  public unmute(nameOrSound?: SoundName | Sound): void {
    this._setMuted(nameOrSound, false);
  }

  public toggle(name?: SoundName): void;
  public toggle(sound: Sound): void;
  public toggle(nameOrSound?: SoundName | Sound): void {
    if (nameOrSound === undefined) {
      this._setMuted(undefined, !this._muted);
      return;
    }
    const sound = this._resolve(nameOrSound);
    const mix = sound && this._mix.get(sound);
    if (mix) {
      this._setMuted(sound, !mix.muted);
    }
  }

  private _setMuted(nameOrSound: SoundName | Sound | undefined, muted: boolean) {
    if (nameOrSound === undefined) {
      this._muted = muted;
      this.volume = this._volume;
      return;
    }
    const sound = this._resolve(nameOrSound);
    const mix = sound && this._mix.get(sound);
    if (mix) {
      mix.muted = muted;
      this._applyMix(mix);
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
 * const mgr = ex.createSoundManager({ channels: ['sfx'], sounds: [coin, { sound: jump, channel: 'sfx' }] });
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
