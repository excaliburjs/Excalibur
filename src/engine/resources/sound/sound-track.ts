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
 * track's node graph. The builder runs once when the track is created; the
 * effect nodes it returns are reused across pause/resume/seek so that runtime
 * mutations made via captured references keep working for the track's lifetime.
 */
export interface AudioGraphContext {
  /**
   * The shared {@apilink AudioContext} for this engine.
   */
  readonly audioContext: AudioContext;
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
 * Builder invoked ONCE per track when it is created (i.e. on each fresh
 * `Sound.play()`). It lets users insert custom Web Audio nodes for custom audio
 * effects (spatial audio, filters, reverb, etc.). The returned effect nodes are
 * reused across pause/resume/seek for the track's lifetime, so the caller can
 * capture references and mutate them at runtime (e.g. move a panner).
 *
 * Return:
 *  - `void`/`undefined` for the default graph `source → volumeNode → destination`.
 *  - A single {@apilink AudioNode} to insert it as `source → node → volumeNode`.
 *  - An `{ input, output }` pair to insert an arbitrary multi-node chain as
 *    `source → input … output → volumeNode`. Any intermediate nodes wired
 *    between `input` and `output` are owned by the caller; Sound only tracks +
 *    disconnects `input` and `output` on teardown.
 *
 * Sound performs all wiring between `source`, the returned nodes, and
 * `volumeNode`, and disconnects them on stop/complete.
 *
 * Example (spatial audio via a panner the caller can mutate later — the
 * captured reference stays valid across pause/resume):
 * ```typescript
 * const sound = new ex.Sound('/sfx/explosion.ogg');
 * let panner: PannerNode;
 * sound.onPlay = ({ audioContext }) => {
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
   * Head/tail of the persistent effect graph (built once). If `_effectInput` is
   * null the default graph (source → volumeNode) is used. Otherwise
   * `source → _effectInput … → volumeNode`.
   */
  private _effectInput: AudioNode | null = null;
  /**
   * Effect nodes tracked for teardown disconnect (the returned input/output, or
   * a single returned node). Intermediate nodes in a caller-built chain are the
   * caller's responsibility.
   */
  private _effectNodes: AudioNode[] = [];

  private _playingFuture = new Future<boolean>();
  private _stateMachine = StateMachine.create(
    {
      start: 'STOPPED',
      states: {
        PLAYING: {
          onEnter: ({ data }) => {
            // Buffer source nodes are single use; allocate a fresh one each
            // (re)start, but reuse the persistent effect graph so captured
            // references keep working.
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
            // Whenever you're not playing... the single-use source is stopped!
            this._disconnectSource();
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
            // Fully tear down the graph when stopped.
            this._disposeGraph();
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
   * @param _src       The decoded audio buffer to play.
   * @param _onPlay    Optional custom node-graph builder invoked ONCE here.
   *                   The returned effect nodes are reused across pause/resume.
   */
  constructor(
    private _src: AudioBuffer,
    private _onPlay?: AudioGraphBuilder
  ) {
    // Build the persistent effect graph once and connect it to volumeNode.
    this._volumeNode.connect(this._audioContext.destination);
    this._buildEffectGraph();
    // Allocate the initial single-use source so `loop`/`playbackRate`/`pitch`
    // setters have a node to mutate before the first play.
    this._createNewBufferSource();
  }

  /**
   * Build the persistent effect graph by invoking the {@apilink AudioGraphBuilder}
   * ONCE. Wires `effectOutput → volumeNode`. Called only from the constructor.
   */
  private _buildEffectGraph() {
    const builder = this._onPlay;
    const volumeNode = this._volumeNode;

    if (!builder) {
      this._effectInput = null;
      this._effectNodes = [];
      return;
    }

    let result: AudioNode | { input: AudioNode; output: AudioNode } | void;
    try {
      result = builder({
        audioContext: this._audioContext,
        volumeNode,
        track: this
      });
    } catch (e) {
      // If a user builder throws, fall back to the default graph so audio still plays.
      this._effectInput = null;
      this._effectNodes = [];
      return;
    }

    if (!result) {
      this._effectInput = null;
      this._effectNodes = [];
    } else if (
      typeof result === 'object' &&
      'input' in result &&
      'output' in result &&
      typeof (result as { input: AudioNode }).input.connect === 'function'
    ) {
      // Multi-node chain: source → input … output → volumeNode
      const { input, output } = result as { input: AudioNode; output: AudioNode };
      output.connect(volumeNode);
      this._effectInput = input;
      this._effectNodes = [input, output];
    } else {
      // Single inserted AudioNode: source → node → volumeNode
      const node = result as AudioNode;
      node.connect(volumeNode);
      this._effectInput = node;
      this._effectNodes = [node];
    }
  }

  /**
   * Allocate a fresh single-use {@apilink AudioBufferSourceNode}, configure it,
   * and connect it into the persistent effect graph (or volumeNode). The effect
   * graph must already exist (built once in the constructor).
   */
  private _createNewBufferSource() {
    // Stop/disconnect any previous single-use source (idempotent).
    this._disconnectSource();

    this._instance = this._audioContext.createBufferSource();
    this._instance.buffer = this._src;
    this._instance.loop = this.loop;
    this._instance.playbackRate.value = this._playbackRate;
    this._instance.detune.value = this._pitch;
    // Connect source → effectInput (or volumeNode if default graph)
    this._instance.connect(this._effectInput ?? this._volumeNode);
  }

  /**
   * Stop + disconnect only the single-use source, leaving the persistent effect
   * graph intact for reuse on resume/seek. Idempotent.
   */
  private _disconnectSource() {
    if (this._instance) {
      try {
        this._instance.onended = null;
        this._instance.disconnect();
        this._instance.stop(0);
      } catch (e) {
        // source may already be stopped/disconnected; ignore
      }
    }
  }

  /**
   * Fully dispose the persistent effect graph (called on stop / natural
   * completion). Disconnects all tracked effect nodes and their edges to the
   * Sound-managed `volumeNode`. Idempotent.
   */
  private _disposeGraph() {
    this._disconnectSource();
    for (const node of this._effectNodes) {
      try {
        node.disconnect();
      } catch (e) {
        // node may already be disconnected; ignore
      }
    }
    this._effectNodes = [];
    this._effectInput = null;
  }

  private _handleEnd() {
    if (!this.loop) {
      this._instance.onended = () => {
        // On natural completion, dispose the graph so effect nodes are released.
        this._disposeGraph();
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
          this._disposeGraph();
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
    this._playbackRate = playbackRate;
    if (this._instance) {
      this._instance.playbackRate.value = playbackRate;
    }
  }

  public get playbackRate() {
    return this._playbackRate;
  }

  public scheduledStartTime = 0;
}
