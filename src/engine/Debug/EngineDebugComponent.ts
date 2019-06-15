import { Engine } from '../Engine';
import { Logger } from '../Util/Log';
import { Input } from '..';
import { Keys } from '../Input/Index';
import { DebugStats, FrameStats } from './DebugStatistics';

/**
 * Debug component for Engine, provides frame step debugging and other
 * debug statistics and flags for Excalibur. If polling these values, it would be
 * best to do so on the `postupdate` event for [[Engine]], after all values have been
 * updated during a frame.
 */
export class EngineDebugComponent {
  constructor(public engine: Engine) {}

  private _frameDebug = false;
  private _frameFunc: Function = null;
  private _nowDebug = 0;

  public toggleFrameStep() {
    this._frameDebug = !this._frameDebug;
    this.engine.stop();
    setTimeout(() => {
      (<any>this.engine)._hasStarted = true;
      this.engine.browser.resume();
      Engine.createMainLoop(this.engine, this.frameStepFactory(), this.nowFactory())();
    }, 200);
  }

  /**
   * Step
   * @param frames
   */
  public frameStep(frames: number = 1, fps: number = 60) {
    const millisecondsPerFrame = 1000 / fps;
    for (let i = 0; i < frames; i++) {
      this._nowDebug += millisecondsPerFrame;
      if (this._frameFunc) {
        this._frameFunc();
      }
      Logger.getInstance().debug('Frame:' + this.engine.stats.prevFrame.id);
    }
  }

  public frameStepFactory(): (func: Function) => number {
    if (this._frameDebug) {
      this.engine.input.keyboard.on('press', (evt: Input.KeyEvent) => {
        if (evt.key === Keys.S) {
          this.frameStep();
        }
      });

      return (func: Function) => {
        this._frameFunc = func;
        return -1;
      };
    }
    return window.requestAnimationFrame;
  }

  public nowFactory(): () => number {
    if (this._frameDebug) {
      return () => {
        return this._nowDebug;
      };
    }
    return Date.now;
  }

  /**
   * Performance statistics
   */
  public stats: DebugStats = {
    /**
     * Current frame statistics. Engine reuses this instance, use [[FrameStats.clone]] to copy frame stats.
     * Best accessed on [[postframe]] event. See [[IFrameStats]]
     */
    currFrame: new FrameStats(),

    /**
     * Previous frame statistics. Engine reuses this instance, use [[FrameStats.clone]] to copy frame stats.
     * Best accessed on [[preframe]] event. Best inspected on engine event `preframe`. See [[IFrameStats]]
     */
    prevFrame: new FrameStats()
  };
}
