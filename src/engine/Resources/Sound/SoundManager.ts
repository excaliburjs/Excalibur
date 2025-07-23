import type { Sound } from './Sound';

export interface TaggedSoundsConfiguration {
  sounds: Sound[];
  volume?: number;
}

export interface SoundManagerOptions<Tags extends string> {
  /**
   * Optionally set the max volume for a sound to be when played. All other volume operations will be a fraction of the mix.
   */
  mix?: [sound: Sound, volume: number][];
  /**
   * Optionally categorize sounds and set their volume
   */
  tags?: {
    [tag: string]: TaggedSoundsConfiguration; // TODO strongly typed
  };
}

export class SoundManger<Tags extends string> {
  private _tagToConfig: Map<string, TaggedSoundsConfiguration>;
  private _soundToConfig: Map<Sound, TaggedSoundsConfiguration>;
  private _mix: Map<Sound, number>;
  private _muted = new Set<Sound>();
  private _all = new Set<Sound>();
  constructor(options?: SoundManagerOptions<Tags>) {
    this._tagToConfig = new Map<string, TaggedSoundsConfiguration>();
    this._soundToConfig = new Map<Sound, TaggedSoundsConfiguration>();
    this._mix = new Map<Sound, number>();
    if (options?.mix) {
      for (const [sound, volume] of options.mix) {
        this._mix.set(sound, volume);
        this._all.add(sound);
      }
    }

    if (options?.tags) {
      for (const [tag, value] of Object.entries(options.tags)) {
        this._tagToConfig.set(tag, value);
        for (const sound of value.sounds) {
          this._soundToConfig.set(sound, value);
          this._all.add(sound);
        }
      }
    }
  }

  private _getSoundsForTag(tag: string): readonly Sound[] {
    const config = this._tagToConfig.get(tag);
    if (config) {
      return config.sounds;
    }

    return [];
  }

  private _getCurrentVolume(sound: Sound): number {
    if (this._muted.has(sound)) {
      return 0;
    }
    let mix = 1;

    if (this._mix.has(sound)) {
      mix = this._mix.get(sound) ?? 1;
    }

    if (this._soundToConfig.get(sound)) {
      mix *= this._soundToConfig.get(sound)?.volume ?? 1;
    }

    return mix;
  }

  /**
   * Play all Sounds that match a specific set of tags
   */
  public play(tags: Tags[], overrideVolume?: number): Promise<boolean[]> {
    const playing: Promise<boolean>[] = [];
    const playedAudio = new Set<Sound>();
    for (const tag of tags) {
      const sounds = this._getSoundsForTag(tag);
      for (const sound of sounds) {
        if (playedAudio.has(sound)) {
continue;
}
        const volume = this._getCurrentVolume(sound);
        playing.push(sound.play(overrideVolume ?? volume));
        playedAudio.add(sound);
      }
    }
    return Promise.all(playing);
  }

  /**
   * Sets the volume for a set of tags
   */
  public volume(tags: Tags[], volume: number) {
    for (const tag of tags) {
      let maybeConfiguration = this._tagToConfig.get(tag);
      if (!maybeConfiguration) {
        maybeConfiguration = {
          sounds: [],
          volume
        };
      }
      maybeConfiguration.volume = volume;
      this._tagToConfig.set(tag, maybeConfiguration);
    }
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
        }
      }
    } else {
      this._muted = new Set(this._all);
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
          this._muted.delete(sounds[i]);
        }
      }
    } else {
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
