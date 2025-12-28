import { clamp } from '../../math';
import { Sound } from './sound';

export type AnyString = {} & string;

export interface ChannelSoundsConfiguration {
  sounds: Sound[];
}

export interface SoundConfig<Channel extends string = string> {
  sound: Sound;

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
   * Optionally set the max `volume` for a `sound` to be when played. All other volume operations will be a fraction of the mix.
   *
   * You may also add a list of string `channels` to do group operations to sounds at once. For example mute all 'background' sounds.
   *
   */
  sounds: Record<SoundName, Sound | SoundConfig<NoInfer<Channel>>>;
}

export type PossibleChannels<TSoundManagerOptions> = TSoundManagerOptions extends SoundManagerOptions<infer Channels> ? Channels : never;

export type PossibleSounds<TSoundMangerOptions> = TSoundMangerOptions extends SoundManagerOptions
  ? Extract<keyof TSoundMangerOptions['sounds'], string>
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

  private _defaultVolume: number = 1;
  public set defaultVolume(volume: number) {
    this._defaultVolume = clamp(volume, 0, 1);
  }

  public get defaultVolume(): number {
    return this._defaultVolume;
  }

  public channel: ChannelCollection<Channel>;

  constructor(options: SoundManagerOptions<Channel, SoundName>) {
    this._defaultVolume = options.volume ?? 1;
    this.channel = new ChannelCollection(options, this);
    if (options.sounds) {
      for (const [name, soundOrConfig] of Object.entries<Sound | SoundConfig>(options.sounds)) {
        this.track(name, soundOrConfig);
      }
    }
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

  public play(soundName: SoundName, volume: number = this._defaultVolume): Promise<void> {
    const soundSound = this._nameToConfig.get(soundName);
    if (!soundSound) {
      return Promise.resolve();
    }

    const { sound } = soundSound;
    if (this._isMuted(sound)) {
      return Promise.resolve();
    }

    const effectiveVolume = volume * this._getEffectiveVolume(sound);
    return sound.play(effectiveVolume) as unknown as Promise<void>;
  }

  public getSound(soundName: SoundName | AnyString): Sound | undefined {
    const soundSound = this._nameToConfig.get(soundName);
    if (!soundSound) {
      return undefined;
    }

    const { sound } = soundSound;
    return sound;
  }

  public setVolume(soundname: SoundName, volume: number = this._defaultVolume): void {
    const soundSound = this._nameToConfig.get(soundname);
    if (!soundSound) {
      return;
    }

    const { sound } = soundSound;
    this._setMix(sound, volume);
    return;
  }

  /**
   * Gets the volumn for a sound
   */
  public getVolume(soundName: SoundName): number {
    const sound = this.getSound(soundName);
    if (!sound) {
      return 0;
    }
    return this._mix.get(sound) ?? 0;
  }

  /**
   * Set the maximum volume a sound, if not set assumed to be 1.0 (100% of the source volume)
   */
  private _setMix(sound: Sound, volume: number): void {
    this._mix.set(sound, volume);
    sound.volume = volume;
  }

  public track(name: SoundName | AnyString, soundOrConfig: Sound | SoundConfig) {
    let sound: Sound;
    let volume: number | undefined;
    let channels: string[] | undefined;
    if (soundOrConfig instanceof Sound) {
      sound = soundOrConfig;
      volume = this._defaultVolume;
      channels = [];
    } else {
      ({ sound, volume, channels } = soundOrConfig);
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
  public untrack(soundName: SoundName): void {
    this._nameToConfig.delete(soundName);
    const sound = this.getSound(soundName);
    if (!sound) {
      return;
    }
    this._mix.delete(sound);
    this._all.delete(sound);
  }

  public stop(name?: SoundName): void {
    if (name) {
      const soundSound = this._nameToConfig.get(name);
      if (!soundSound) {
        return;
      }

      const { sound } = soundSound;
      sound.stop();
      return;
    }

    this._all.forEach((s) => s.stop());
  }

  public mute(name?: SoundName): void {
    if (name) {
      const soundSound = this._nameToConfig.get(name);
      if (!soundSound) {
        return;
      }

      const { sound } = soundSound;
      this._muted.add(sound);
      sound.pause();
      return;
    }

    this._muted = new Set(this._all);
    this._muted.forEach((s) => s.pause());
  }

  public unmute(name?: SoundName): void {
    if (name) {
      const soundSound = this._nameToConfig.get(name);
      if (!soundSound) {
        return;
      }

      const { sound } = soundSound;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sound.play();
      this._muted.delete(sound);
      return;
    }

    this._muted.forEach((s) => s.play());
    this._muted.clear();
  }

  public toggle(name?: SoundName): void {
    if (name) {
      const soundSound = this._nameToConfig.get(name);
      if (!soundSound) {
        return;
      }

      const { sound } = soundSound;
      if (this._isMuted(sound)) {
        this.unmute(name);
      } else {
        this.mute(name);
      }
      return;
    }

    if (this._muted.size > 0) {
      this._muted.forEach((s) => s.play());
      this._muted.clear();
    } else {
      this._muted = new Set(this._all);
      this._muted.forEach((s) => s.pause());
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
