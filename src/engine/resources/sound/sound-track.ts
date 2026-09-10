import { StateMachine } from '../../util/state-machine';
import { AudioContextFactory } from './audio-context';
import { Future } from '../../util/future';
import { Logger } from '../../util/log';

/**
 * Context handed to an {@apilink AudioGraphBuilder} each time a {@apilink SoundTrack}
 * (re)starts. The builder is responsible for connecting `source` to `destination`,
 * optionally through any Web Audio nodes it likes (panners, filters, convolvers, analysers...).
 */
export interface AudioGraphContext {
  /**
   * The shared {@apilink AudioContext} for this engine, use it to create effect nodes.
   */
  readonly audioContext: AudioContext;
  /**
   * The single-use {@apilink AudioBufferSourceNode} for this playback. It is fully configured
   * (buffer, loop, playbackRate, detune) but not yet started, so you may schedule automation on
   * its params. Excalibur owns this node and disconnects it when the track stops or pauses.
   */
  readonly source: AudioBufferSourceNode;
  /**
   * The {@apilink Sound}'s output node (a {@apilink GainNode} that Excalibur uses for volume and
   * that is connected to the audio context destination). Anything you wire must eventually reach
   * this node or the track will be silent.
   */
  readonly destination: AudioNode;
  /**
   * The {@apilink SoundTrack} being (re)started, useful for correlation (e.g. as a `WeakMap` key
   * for per-track effect state) and runtime reads.
   */
  readonly track: SoundTrack;
}

/**
 * Hook that wires the Web Audio graph for one playback of a {@apilink Sound}.
 *
 * It runs every time a track (re)starts a buffer source: on a fresh `play()`, and again when a
 * paused or seeked track resumes, because Web Audio buffer sources are single use. Nodes you
 * create outside the hook can be reused freely (connecting the same two nodes twice is a no-op in
 * Web Audio), and Excalibur never disconnects nodes it did not create.
 *
 * If no hook is provided Excalibur wires `source → destination` directly.
 *
 * ```typescript
 * // A low-pass filter shared by every playback of this sound
 * const muffle = ex.AudioContextFactory.create().createBiquadFilter();
 * muffle.type = 'lowpass';
 * muffle.frequency.value = 400;
 *
 * const sound = new ex.Sound({
 *   paths: ['/sfx/explosion.ogg'],
 *   onPlay: ({ source, destination }) => {
 *     source.connect(muffle).connect(destination);
 *   }
 * });
 *
 * // Spatial audio positioned per play
 * sound.play({
 *   onPlay: ({ audioContext, source, destination }) => {
 *     const panner = audioContext.createPanner();
 *     panner.positionX.value = enemy.pos.x;
 *     source.connect(panner).connect(destination);
 *   }
 * });
 * ```
 */
export type AudioGraphBuilder = (ctx: AudioGraphContext) => void;

/**
 * A single playback of a {@apilink Sound}. Produced by `Sound.play()` and `Sound.seek()`, see
 * {@apilink Sound.instances}.
 *
 * Wraps a single-use Web Audio `AudioBufferSourceNode`; a fresh source is allocated each time the
 * track (re)starts.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
 */
export class SoundTrack {
  private _audioContext: AudioContext = AudioContextFactory.create();
  private _source: AudioBufferSourceNode | null = null;
  private _playingFuture = new Future<boolean>();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _playStarted: () => any = () => {};

  /**
   * Buffer offset in seconds to start from on the next (re)start
   */
  private _offset = 0;
  /**
   * Audio context time and buffer offset at which the current source started
   */
  private _startedAt = 0;
  private _startOffset = 0;

  private _stateMachine = StateMachine.create({
    start: 'STOPPED',
    states: {
      PLAYING: {
        onEnter: () => {
          const source = this._createSource();
          this._startOffset = this._offset;
          this._startedAt = Math.max(this._audioContext.currentTime, this.scheduledStartTime);
          if (this.loop) {
            // when looping don't set a duration
            source.start(this.scheduledStartTime, this._offset);
          } else {
            source.start(this.scheduledStartTime, this._offset, this.duration);
          }
        },
        onState: () => this._playStarted(),
        onExit: ({ to }) => {
          if (to === 'PAUSED') {
            this._offset = this.getPlaybackPosition();
          }
          this._disconnectSource();
        },
        transitions: ['STOPPED', 'PAUSED', 'SEEK']
      },
      PAUSED: {
        transitions: ['PLAYING', 'STOPPED', 'SEEK']
      },
      SEEK: {
        onEnter: ({ eventData: position }: { eventData?: number }) => {
          this._offset = position ?? 0;
        },
        transitions: ['*']
      },
      STOPPED: {
        onEnter: () => {
          this._offset = 0;
          this._playingFuture.resolve(true);
        },
        transitions: ['PLAYING', 'PAUSED', 'SEEK']
      }
    }
  });

  /**
   * @param _buffer       The decoded audio to play
   * @param _destination  The node this track's source is wired into (the owning Sound's output)
   * @param _onPlay       Optional hook that wires `source → destination`, see {@apilink AudioGraphBuilder}
   */
  constructor(
    private _buffer: AudioBuffer,
    private _destination: AudioNode,
    private _onPlay?: AudioGraphBuilder
  ) {}

  /**
   * Allocate and configure a fresh single-use source and wire it into the graph
   */
  private _createSource(): AudioBufferSourceNode {
    this._disconnectSource();

    const source = (this._source = this._audioContext.createBufferSource());
    source.buffer = this._buffer;
    source.loop = this._loop;
    source.playbackRate.value = this._playbackRate;
    source.detune.value = this._pitch;

    if (this._onPlay) {
      try {
        this._onPlay({ audioContext: this._audioContext, source, destination: this._destination, track: this });
      } catch (e) {
        Logger.getInstance().error('Sound onPlay hook threw, falling back to the default audio graph', e);
        source.connect(this._destination);
      }
    } else {
      source.connect(this._destination);
    }

    source.onended = () => {
      // stop() on a paused/seeked source also fires onended, only react to the live source
      if (this._source === source) {
        this._stateMachine.go('STOPPED');
      }
    };
    return source;
  }

  /**
   * Stop and disconnect the current single-use source, if any
   */
  private _disconnectSource() {
    const source = this._source;
    if (!source) {
      return;
    }
    this._source = null;
    source.onended = null;
    source.stop();
    source.disconnect();
  }

  private _loop = false;
  /**
   * Loop infinitely, when changed the live source is updated
   */
  public get loop(): boolean {
    return this._loop;
  }
  public set loop(value: boolean) {
    this._loop = value;
    if (this._source) {
      this._source.loop = value;
    }
  }

  private _playbackRate = 1.0;
  /**
   * Playback speed multiplier, default 1
   */
  public get playbackRate(): number {
    return this._playbackRate;
  }
  public set playbackRate(playbackRate: number) {
    this._playbackRate = playbackRate;
    if (this._source) {
      this._source.playbackRate.value = playbackRate;
    }
  }

  private _pitch = 0;
  /**
   * Pitch shift in cents (a semitone is 100 cents), default 0. Backed by
   * {@apilink AudioBufferSourceNode.detune} and composes with {@apilink SoundTrack.playbackRate}.
   * Note: detune also changes playback speed, this is a Web Audio limitation.
   */
  public get pitch(): number {
    return this._pitch;
  }
  public set pitch(pitch: number) {
    this._pitch = pitch;
    if (this._source) {
      this._source.detune.value = pitch;
    }
  }

  private _duration: number | undefined;
  /**
   * The duration in seconds this track plays for, or the buffer's total duration when unset.
   *
   * Note: the duration starts from the seeked position, seeking a 10 second clip to 5 seconds and
   * setting a duration of 2 plays seconds 5-7.
   */
  public get duration(): number {
    return this._duration ?? this.getTotalPlaybackDuration();
  }
  public set duration(duration: number | undefined) {
    this._duration = duration;
  }

  /**
   * Audio context time in seconds at which the next (re)start is scheduled, 0 means immediately
   */
  public scheduledStartTime = 0;

  public isPlaying() {
    return this._stateMachine.in('PLAYING');
  }

  public isPaused() {
    return this._stateMachine.in('PAUSED') || this._stateMachine.in('SEEK');
  }

  public isStopped() {
    return this._stateMachine.in('STOPPED');
  }

  /**
   * Start or resume playback, resolves when the track stops or completes
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public play(playStarted: () => any = () => {}) {
    this._playStarted = playStarted;
    this._stateMachine.go('PLAYING');
    return this._playingFuture.promise;
  }

  public pause() {
    this._stateMachine.go('PAUSED');
  }

  public stop() {
    this._stateMachine.go('STOPPED');
  }

  /**
   * Move to a position in seconds, the track is paused until the next play()
   */
  public seek(position: number) {
    this._stateMachine.go('SEEK', position);
  }

  public getTotalPlaybackDuration() {
    return this._buffer.duration;
  }

  /**
   * Current position in the buffer in seconds
   */
  public getPlaybackPosition() {
    if (!this.isPlaying()) {
      return this._offset;
    }
    // detune changes speed by 2^(cents/1200) on top of playbackRate
    const effectiveRate = this._playbackRate * Math.pow(2, this._pitch / 1200);
    const elapsed = Math.max(0, this._audioContext.currentTime - this._startedAt);
    let position = this._startOffset + elapsed * effectiveRate;
    const total = this.getTotalPlaybackDuration();
    if (this._loop && total > 0) {
      position %= total;
    }
    return position;
  }
}
