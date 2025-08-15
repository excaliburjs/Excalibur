import { clamp } from '../../Math';
import { Sound } from './Sound';

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
  mute(name?: string): void;
  unmute(name?: string): void;
  toggle(name?: string): void;
}

export class ChannelCollection<Channel extends string> implements SoundManagerApi {
  private _channelToConfig: Map<Channel, ChannelSoundsConfiguration> = new Map<Channel, ChannelSoundsConfiguration>();

  constructor(
    options: SoundManagerOptions<Channel, string>,
    public soundManager: SoundManger<Channel, string>
  ) {}

  setVolume(name: Channel, volume?: number): void {
    throw new Error('Method not implemented.');
  }

  play(name: Channel, volume?: number): Promise<void> {
    volume ??= this.soundManager.defaultVolume;
    const playing: Promise<boolean>[] = [];
    const playedAudio = new Set<Sound>();

    const sounds = this.soundManager.getSoundsForChannel(name);
    for (const sound of sounds) {
      if (playedAudio.has(sound) || this.soundManager.isMuted(sound)) {
        continue;
      }
      const mixVolume = this.soundManager._getEffectiveVolume(sound);

      playing.push(sound.play(mixVolume * volume));
      playedAudio.add(sound);
    }

    return Promise.all(playing) as unknown as Promise<void>;
  }

  mute(name: Channel): void {
    throw new Error('Method not implemented.');
  }
  unmute(name: Channel): void {
    throw new Error('Method not implemented.');
  }
  toggle(name: Channel): void {
    throw new Error('Method not implemented.');
  }
}

/**
 * Manage Sound volume levels without mutating the original Sound objects
 */
export class SoundManger<Channel extends string, SoundName extends string> implements SoundManagerApi {
  private _channelToConfig: Map<Channel, ChannelSoundsConfiguration> = new Map<Channel, ChannelSoundsConfiguration>();
  private _nameToConfig: Map<string, SoundConfig> = new Map<string, SoundConfig>();
  private _mix: Map<Sound, number> = new Map<Sound, number>();

  private _muted = new Set<Sound>();
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
          this.addChannel(sound, channels as Channel[]);
        }
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

  public isMuted(sound: Sound): boolean {
    return this._muted.has(sound);
  }

  public _getEffectiveVolume(sound: Sound): number {
    if (this.isMuted(sound)) {
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
    if (this.isMuted(sound)) {
      return Promise.resolve();
    }

    const effectiveVolume = volume * this._getEffectiveVolume(sound);
    return sound.play(effectiveVolume) as unknown as Promise<void>;
  }

  public setVolume(soundname: string, volume: number = this._defaultVolume): void {
    const soundSound = this._nameToConfig.get(soundname);
    if (!soundSound) {
      return;
    }

    const { sound } = soundSound;
    this._setMix(sound, volume);
    return;
  }

  // /**
  //  * Play all Sounds that match a specific set of channels and optionally apply a custom temporary volume multiplied against the maximum volume
  //  */
  // public play(channels: Channel[], volume?: number): Promise<void>;
  // /**
  //  * Play a Sound and optionally apply a custom temporary volume multiplied against the maximum volume
  //  */
  // public play(sound: Sound, volume?: number): Promise<void>;
  // public play(channelsOrSound: Channel[] | Sound, volume: number = this._defaultVolume): Promise<void> {
  //   if (Array.isArray(channelsOrSound)) {
  //     const tags = channelsOrSound;
  //
  //     const playing: Promise<boolean>[] = [];
  //     const playedAudio = new Set<Sound>();
  //
  //     for (const tag of tags) {
  //       const sounds = this.getSoundsForChannel(tag);
  //       for (const sound of sounds) {
  //         if (playedAudio.has(sound) || this._isMuted(sound)) {
  //           continue;
  //         }
  //         const mixVolume = this._getCurrentVolume(sound);
  //
  //         playing.push(sound.play(mixVolume * volume));
  //         playedAudio.add(sound);
  //       }
  //     }
  //
  //     return Promise.all(playing) as unknown as Promise<void>;
  //   }
  //
  //   const sound = channelsOrSound;
  //   if (this._isMuted(sound)) {
  //     return Promise.resolve();
  //   }
  //
  //   const effectiveVolume = volume * this._getCurrentVolume(sound);
  //   return sound.play(effectiveVolume) as unknown as Promise<void>;
  // }

  // /**
  //  * Set the volume of a playing or non-playing sound
  //  *
  //  * Adjusts the mixed volume to the supplied value
  //  */
  // public setVolume(sound: Sound, volume: number): void;
  // /**
  //  * Set the volume of playing and non-playing sounds
  //  *
  //  * Adjusts the mixed volume to the supplied value
  //  *
  //  */
  // public setVolume(channels: Channel[], volume: number): void;
  // public setVolume(channelsOrSound: Channel[] | Sound, volume: number): void {
  //   if (channelsOrSound instanceof Sound) {
  //     const sound = channelsOrSound;
  //     this._setMix(sound, volume);
  //     return;
  //   }
  //   const tags = channelsOrSound;
  //   for (const tag of tags) {
  //     const sounds = this.getSoundsForChannel(tag);
  //     for (const sound of sounds) {
  //       if (this._isMuted(sound)) {
  //         continue;
  //       }
  //       this._setMix(sound, volume);
  //     }
  //   }
  // }

  /**
   * Gets the volumn for a sound
   */
  public getVolume(sound: Sound): number {
    return this._mix.get(sound) ?? 0;
  }

  /**
   * Set the maximum volume a sound, if not set assumed to be 1.0 (100% of the source volume)
   */
  private _setMix(sound: Sound, volume: number): void {
    this._mix.set(sound, volume);
    sound.volume = volume;
  }

  /**
   * Remove the maximum volume for a sound, will be 100% of the source volume
   *
   * Untracks the Sound in the sound manager
   */
  public untrack(sound: Sound): void {
    this._mix.delete(sound);
  }

  public mute(name?: string): void {
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

  public unmute(name?: string): void {
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

  public toggle(name?: string): void {
    if (name) {
      const soundSound = this._nameToConfig.get(name);
      if (!soundSound) {
        return;
      }

      const { sound } = soundSound;
      if (this.isMuted(sound)) {
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

  // /**
  //  * Mut specific sound by instance, in none provided all sounds are muted
  //  */
  // public mute(sound?: Sound): void;
  // /**
  //  * Mute specific Sounds by channel, if none are provided all sounds are muted
  //  */
  // public mute(channels?: Channel[]): void;
  // public mute(channelsOrSound?: Channel[] | Sound): void {
  //   if (channelsOrSound instanceof Sound) {
  //     const sound = channelsOrSound;
  //     this._muted.add(sound);
  //     sound.pause();
  //     return;
  //   }
  //   const tags = channelsOrSound;
  //   if (tags) {
  //     for (const tag of tags) {
  //       const sounds = this.getSoundsForChannel(tag);
  //       for (let i = 0; i < sounds.length; i++) {
  //         this._muted.add(sounds[i]);
  //         sounds[i].pause();
  //       }
  //     }
  //     return;
  //   }
  //
  //   this._muted = new Set(this._all);
  //   this._muted.forEach((s) => s.pause());
  // }

  // public toggle(sound?: Sound): void;
  // public toggle(channels?: Channel[]): void;
  // public toggle(channelsOrSound?: Channel[] | Sound): void {
  //   if (channelsOrSound instanceof Sound) {
  //     const sound = channelsOrSound;
  //     if (this._isMuted(sound)) {
  //       this.unmute(sound);
  //     } else {
  //       this.mute(sound);
  //     }
  //     return;
  //   }
  //
  //   const tags = channelsOrSound;
  //   if (tags) {
  //     for (const tag of tags) {
  //       const sounds = this.getSoundsForChannel(tag);
  //       for (let i = 0; i < sounds.length; i++) {
  //         if (this._isMuted(sounds[i])) {
  //           this.unmute(sounds[i]);
  //         } else {
  //           this.mute(sounds[i]);
  //         }
  //       }
  //     }
  //   } else {
  //     if (this._muted.size > 0) {
  //       this._muted.forEach((s) => s.play());
  //       this._muted.clear();
  //     } else {
  //       this._muted = new Set(this._all);
  //       this._muted.forEach((s) => s.pause());
  //     }
  //   }
  // }

  // /**
  //  * Unmute specific Sounds by instance, if none are provided all sounds are unmuted
  //  */
  // public unmute(sound?: Sound): void;
  // /**
  //  * Unmute specific Sounds by tag, if none are provided all sounds are unmuted
  //  */
  // public unmute(channels?: Channel[]): void;
  // public unmute(channelsOrSound?: Channel[] | Sound): void {
  //   if (channelsOrSound instanceof Sound) {
  //     const sound = channelsOrSound;
  //     // eslint-disable-next-line @typescript-eslint/no-floating-promises
  //     sound.play();
  //     this._muted.delete(sound);
  //     return;
  //   }
  //   const tags = channelsOrSound;
  //   if (tags) {
  //     for (const tag of tags) {
  //       const sounds = this.getSoundsForChannel(tag);
  //       for (let i = 0; i < sounds.length; i++) {
  //         if (this._muted.has(sounds[i])) {
  //           // eslint-disable-next-line @typescript-eslint/no-floating-promises
  //           sounds[i].play();
  //           this._muted.delete(sounds[i]);
  //         }
  //       }
  //     }
  //     return;
  //   }
  //
  //   this._muted.forEach((s) => s.play());
  //   this._muted.clear();
  // }

  /**
   * Apply a list of channels to a sound instance
   */
  public addChannel(sound: Sound, channels: Channel[] | AnyString[]) {
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
}

const sm = new SoundManger({
  volume: 0.7,
  channels: ['background', 'sfx', 'other'],
  sounds: {
    // @ts-expect-error
    jump: { sound: null as unknown as Sound, channels: ['sfx', 'madeup'], volume: 0.4 },
    idleMusic: { sound: null as unknown as Sound, channels: ['background'], volume: 0.7 }
  }
});

sm.channel.setVolume('background', 0.8);
// eslint-disable-next-line @typescript-eslint/no-floating-promises
sm.channel.play('background');
// eslint-disable-next-line @typescript-eslint/no-floating-promises
sm.play('jump');
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-floating-promises
sm.play('madeup');
sm.channel.mute('background');
// @ts-expect-error
sm.channel.mute('madeup');
