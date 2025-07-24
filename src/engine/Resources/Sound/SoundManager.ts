import type { Sound } from './Sound';

export interface TaggedSoundsConfiguration {
  sounds: Sound[];
}

export interface SoundManagerOptions {
  /**
   * Optionally set the max volume for a sound to be when played. All other volume operations will be a fraction of the mix.
   */
  mix: { sound: Sound; volume: number; channels?: string[] }[];
}

export class SoundManger<Tags = string> {
  private _tagToConfig: Map<Tags, TaggedSoundsConfiguration>;
  private _mix: Map<Sound, number>;
  private _muted = new Set<Sound>();
  private _all = new Set<Sound>();

  constructor(options: SoundManagerOptions) {
    this._tagToConfig = new Map<Tags, TaggedSoundsConfiguration>();
    this._mix = new Map<Sound, number>();
    if (options.mix) {
      for (const { sound, volume, channels: tags } of options.mix) {
        this._mix.set(sound, volume);
        this._all.add(sound);

        if (tags) {
          this.tag(sound, tags as Tags[]);
        }
      }
    }
  }

  private _getSoundsForTag(tag: Tags): readonly Sound[] {
    const config = this._tagToConfig.get(tag);
    if (config) {
      return config.sounds;
    }

    return [];
  }

  private _isMuted(sound: Sound): boolean {
    return this._muted.has(sound);
  }

  private _getCurrentVolume(sound: Sound): number {
    if (this._isMuted(sound)) {
      return 0;
    }

    let mix = 1;

    if (this._mix.has(sound)) {
      mix *= this._mix.get(sound) ?? 1;
    }

    return mix;
  }

  /**
   * Play all Sounds that match a specific set of tags and optionally apply a custom volume with the mix
   */
  public play(tags: Tags[], volume?: number): Promise<void>;

  /**
   * Play a Sound and optionally apply a custom volume with the mix
   */
  public play(sound: Sound, volume?: number): Promise<void>;
  public play(tagsOrSound: Tags[] | Sound, volume: number = 1): Promise<void> {
    if (Array.isArray(tagsOrSound)) {
      const tags = tagsOrSound;

      const playing: Promise<boolean>[] = [];
      const playedAudio = new Set<Sound>();

      for (const tag of tags) {
        const sounds = this._getSoundsForTag(tag);
        for (const sound of sounds) {
          if (playedAudio.has(sound) || this._isMuted(sound)) {
            continue;
          }
          const mixVolume = this._getCurrentVolume(sound);

          playing.push(sound.play(mixVolume * volume));
          playedAudio.add(sound);
        }
      }

      return Promise.all(playing) as unknown as Promise<void>;
    }

    const sound = tagsOrSound;
    if (this._isMuted(sound)) {
      return Promise.resolve();
    }

    const effectiveVolume = volume * this._getCurrentVolume(sound);
    return sound.play(effectiveVolume) as unknown as Promise<void>;
  }

  /**
   * Set the maximum volume a sound, if not set assumed to be 1.0 (100% of the source volume)
   */
  public mix(sound: Sound, volume: number): void {
    this._mix.set(sound, volume);
  }

  /**
   * Remove the maximum volume for a sound, will be 100% of the source volume
   */
  public unmix(sound: Sound): void {
    this._mix.delete(sound);
  }

  /**
   * Mute specific Sounds by tag, if none are provided all sounds are muted
   */
  public mute(tags?: Tags[]) {
    if (tags) {
      for (const tag of tags) {
        const sounds = this._getSoundsForTag(tag);
        for (let i = 0; i < sounds.length; i++) {
          this._muted.add(sounds[i]);
           
          sounds[i].pause();
        }
      }
    } else {
      this._muted = new Set(this._all);
       
      this._muted.forEach((s) => s.pause());
    }
  }

  /**
   * Unmute specific Sounds by tag, if none are provided all sounds are unmuted
   */
  public unmute(tags?: Tags[]) {
    if (tags) {
      for (const tag of tags) {
        const sounds = this._getSoundsForTag(tag);
        for (let i = 0; i < sounds.length; i++) {
          if (this._muted.has(sounds[i])) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            sounds[i].play();
            this._muted.delete(sounds[i]);
          }
        }
      }
    } else {
       
      this._muted.forEach((s) => s.play());
      this._muted.clear();
    }
  }

  public tag(sound: Sound, tags: Tags[]) {
    for (const tag of tags) {
      let maybeConfiguration = this._tagToConfig.get(tag);
      if (!maybeConfiguration) {
        maybeConfiguration = {
          sounds: [sound]
        };
      }
      maybeConfiguration.sounds.push(sound);

      this._tagToConfig.set(tag, maybeConfiguration);
    }
  }
}
