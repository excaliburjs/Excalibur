import { StateMachine } from '../../util/state-machine';
import { clamp } from '../../math/util';
import { AudioContextFactory } from './audio-context';
import { Future } from '../../util/future';

interface SoundState {
  startedAt: number;
  pausedAt: number;
}

/**
 * Context handed to an {@apilink AudioGraphBuilder} so users can insert custom
 * Web Audio nodes (e.g. a {@apilink PannerNode} for spatial audio) into a
 * track's node graph right before playback starts.
 */
export interface AudioGraphContext {
  /**
   * The shared {@apilink AudioContext} for this engine.
   */
  readonly audioContext: AudioContext;
  /**
   * The single-use {@apilink AudioBufferSourceNode} for this track. Its buffer,
   * loop, playbackRate and detune (pitch) are already configured by Sound.
   */
  readonly source: AudioBufferSourceNode;
  /**
   * The Sound-managed output {@apilink GainNode}. Any custom graph must be
   * connected (directly or via the returned node) to this node so that volume
   * and SoundManager mixing keep working. This node is always connected to the
   * audio context destination by Sound.
   */
  readonly volumeNode: GainNode;
  /**
   * The {@apilink SoundTrack} being assembled, for correlation/runtime reads.
   */
  readonly track: SoundTrack;
}

/**
 * Builder invoked once per track right before playback starts. It lets users
 * customize the Web Audio node graph for custom audio effects (spatial audio,
 * filters, reverb, etc.).
 *
 * Return:
 *  - `void`/`undefined` for the default graph `source → volumeNode → destination`.
 *  - A single {@apilink AudioNode} to insert it as `source → node → volumeNode`.
 *  - An `{ input, output }` pair to insert an arbitrary multi-node chain as
 *    `source → input … output → volumeNode`.
 *
 * Sound performs all the wiring and tears down inserted nodes on stop/complete.
 *
 * Example (spatial audio via a panner the caller can mutate later):
 * ```typescript
 * const sound = new ex.Sound('/sfx/explosion.ogg');
 * let panner: PannerNode;
 * sound.onPlay = ({ audioContext, source, volumeNode }) => {
 *   panner = audioContext.createPanner();
 *   panner.positionX.value = 10;
 *   return panner;
 * };
 * ```
 */
export type AudioGraphBuilder = (ctx: AudioGraphContext) => AudioNode | { input: AudioNode; output: AudioNode } | void;

/**
 * Internal handle for a single playback of a {@apilink Sound}. Produced only by
 * `Sound.play()`; not constructable by users.
 *
 * Represents a Web Audio `AudioBufferSourceNode` instance and its node graph.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
 */
export class SoundTrack {
  private _instance!: AudioBufferSourceNode;
  private _audioContext: AudioContext = AudioContextFactory.create();
  private _volumeNode = this._audioContext.createGain();

  /**
   * Effect nodes inserted by an {@apilink AudioGraphBuilder}, tracked so they
   * can be disconnected on teardown.
   */
  private _effectNodes: AudioNode[] = [];

  private _playingFuture = new Future<boolean>();
  private _stateMachine = StateMachine.create(
    {
      start: 'STOPPED',
      states: {
        PLAYING: {
          onEnter: ({ data }) => {
            // Buffer nodes are single use
            this._createNewBufferSource();
            this._handleEnd();
            if (this.loop) {
              // when looping don't set a duration
              this._instance.start(this.scheduledStartTime, data.pausedAt * this._playbackRate);
            } else {
              this._instance.start(this.scheduledStartTime, data.pausedAt * this._playbackRate, this.duration);
            }
            data.startedAt = this._audioContext.currentTime - data.pausedAt;
            data.pausedAt = 0;
          },
          onState: () => this._playStarted(),
          onExit: ({ to }) => {
            // If you've exited early only resolve if explicitly STOPPED
            if (to === 'STOPPED') {
              this._playingFuture.resolve(true);
            }
            // Whenever you're not playing... you stop!
            this._instance.onended = null; // disconnect the wired on-end handler
            this._disconnectGraph();
            this._instance = null as any;
          },
          transitions: ['STOPPED', 'PAUSED', 'SEEK']
        },
        SEEK: {
          onEnter: ({ eventData: position, data }: { eventData?: number; data: SoundState }) => {
            data.pausedAt = (position ?? 0) / this._playbackRate;
            data.startedAt = 0;
          },
          transitions: ['*']
        },
        STOPPED: {
          onEnter: ({ data }) => {
            data.pausedAt = 0;
            data.startedAt = 0;
            this._playingFuture.resolve(true);
          },
          transitions: ['PLAYING', 'PAUSED', 'SEEK']
        },
        PAUSED: {
          onEnter: ({ data }) => {
            // Playback rate will be a scale factor of how fast/slow the audio is being played
            // default is 1.0
            // we need to invert it to get the time scale
            data.pausedAt = this._audioContext.currentTime - data.startedAt;
          },
          transitions: ['PLAYING', 'STOPPED', 'SEEK']
        }
      }
    },
    {
      startedAt: 0,
      pausedAt: 0
    } satisfies SoundState
  );

  /**
   * Optional custom node-graph builder for this track. Usually supplied by the
   * owning {@apilink Sound} (resolved from `Sound.onPlay` / `PlayOptions.onPlay`).
   */
  constructor(
    private _src: AudioBuffer,
    private _onPlay?: AudioGraphBuilder
  ) {
    this._createNewBufferSource();
  }

  /**
   * Build a fresh single-use {@apilink AudioBufferSourceNode}, configure it, and
   * wire the node graph (default or custom via {@apilink AudioGraphBuilder}).
   */
  private _createNewBufferSource() {
    // Tear down any previous graph before allocating a new one.
    this._disconnectGraph();

    this._instance = this._audioContext.createBufferSource();
    this._instance.buffer = this._src;
    this._instance.loop = this.loop;
    this._instance.playbackRate.value = this._playbackRate;
    this._instance.detune.value = this._pitch;
    this._wireGraph();
    this._volumeNode.connect(this._audioContext.destination);
  }

  /**
   * Wire `source → [effects] → volumeNode` per the {@apilink AudioGraphBuilder}.
   * Sound performs all wiring so volume management is preserved.
   */
  private _wireGraph() {
    const source = this._instance;
    const volumeNode = this._volumeNode;
    const builder = this._onPlay;

    if (!builder) {
      source.connect(volumeNode);
      return;
    }

    let result: AudioNode | { input: AudioNode; output: AudioNode } | void;
    try {
      result = builder({
        audioContext: this._audioContext,
        source,
        volumeNode,
        track: this
      });
    } catch (e) {
      // If a user builder throws, fall back to the default graph so audio still plays.
      source.connect(volumeNode);
      return;
    }

    if (!result) {
      source.connect(volumeNode);
    } else if (typeof result === 'object' && 'input' in result && 'output' in result) {
      // Multi-node chain: source → input … output → volumeNode
      source.connect(result.input);
      result.output.connect(volumeNode);
      this._effectNodes = [result.input, result.output];
    } else {
      // Single inserted AudioNode: source → node → volumeNode
      source.connect(result as AudioNode);
      (result as AudioNode).connect(volumeNode);
      this._effectNodes = [result as AudioNode];
    }
  }

  /**
   * Disconnect the current source and any inserted effect nodes. The
   * Sound-managed `volumeNode` is left connected to the destination.
   */
  private _disconnectGraph() {
    if (this._instance) {
      try {
        this._instance.onended = null;
        this._instance.disconnect();
        this._instance.stop(0);
      } catch (e) {
        // source may already be stopped/disconnected; ignore
      }
    }
    for (const node of this._effectNodes) {
      try {
        node.disconnect();
      } catch (e) {
        // node may already be disconnected; ignore
      }
    }
    this._effectNodes = [];
  }

  private _handleEnd() {
    if (!this.loop) {
      this._instance.onended = () => {
        this._playingFuture.resolve(true);
      };
    }
  }

  private _volume = 1;
  private _loop = false;
  private _pitch = 0;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _playStarted: () => any = () => {};
  public set loop(value: boolean) {
    this._loop = value;

    if (this._instance) {
      this._instance.loop = value;
      if (!this.loop) {
        this._instance.onended = () => {
          this._playingFuture.resolve(true);
        };
      }
    }
  }
  public get loop(): boolean {
    return this._loop;
  }

  public set volume(value: number) {
    value = clamp(value, 0, 1.0);

    this._volume = value;

    if (this._stateMachine.in('PLAYING') && this._volumeNode.gain.setTargetAtTime) {
      // https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime
      // After each .1 seconds timestep, the target value will ~63.2% closer to the target value.
      // This exponential ramp provides a more pleasant transition in gain
      this._volumeNode.gain.setTargetAtTime(value, this._audioContext.currentTime, 0.1);
    } else {
      this._volumeNode.gain.value = value;
    }
  }
  public get volume(): number {
    return this._volume;
  }

  /**
   * Pitch shift in cents (semitones are 100 cents). Default 0 (no change).
   * Backed by {@apilink AudioBufferSourceNode.detune}; composes with
   * {@apilink SoundTrack.playbackRate}. Note: changing detune also affects
   * playback speed (this is a Web Audio limitation).
   */
  public set pitch(pitch: number) {
    this._pitch = pitch;
    if (this._instance) {
      this._instance.detune.value = pitch;
    }
  }
  public get pitch(): number {
    return this._pitch;
  }

  private _duration: number | undefined;
  /**
   * Returns the set duration to play, otherwise returns the total duration if unset
   */
  public get duration() {
    return this._duration ?? this.getTotalPlaybackDuration();
  }

  /**
   * Set the duration that this audio should play.
   *
   * Note: if you seek to a specific point the duration will start from that point, for example
   *
   * If you have a 10 second clip, seek to 5 seconds, then set the duration to 2, it will play the clip from 5-7 seconds.
   */
  public set duration(duration: number) {
    this._duration = duration;
  }

  public isPlaying() {
    return this._stateMachine.in('PLAYING');
  }

  public isPaused() {
    return this._stateMachine.in('PAUSED') || this._stateMachine.in('SEEK');
  }

  public isStopped() {
    return this._stateMachine.in('STOPPED');
  }

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

  public seek(position: number) {
    this._stateMachine.go('PAUSED');
    this._stateMachine.go('SEEK', position);
  }

  public getTotalPlaybackDuration() {
    return this._src.duration;
  }

  public getPlaybackPosition() {
    const { pausedAt, startedAt } = this._stateMachine.data!;
    if (pausedAt) {
      return pausedAt * this._playbackRate;
    }
    if (startedAt) {
      return (this._audioContext.currentTime - startedAt) * this._playbackRate;
    }
    return 0;
  }

  private _playbackRate = 1.0;
  public set playbackRate(playbackRate: number) {
    this._instance.playbackRate.value = this._playbackRate = playbackRate;
  }

  public get playbackRate() {
    return this._instance.playbackRate.value;
  }

  public scheduledStartTime = 0;
}
