import * as ex from '@excalibur';

export namespace Mocks {
  export class MockedElement {
    private _key: number = 0;

    constructor(key: number) {
      this._key = key;
    }

    public getTheKey() {
      return this._key;
    }

    public setKey(key: number) {
      this._key = key;
    }
  }
  export interface TimeLike {
    now(): number;
    add(value: number): void;
    sub(value: number): void;
  }

  export interface GameLoopLike {
    advance(duration: number): void;
    advance(duration: number, fps: number): void;
  }

  export class Mocker {
    navigator(): any {
      const _internalGamePads = {
        0: undefined,
        1: undefined,
        2: undefined,
        3: undefined,
        length: 4
      };
      const mockNavigator = {
        setGamepads: function (index: number, numAxis: number, numButtons: number) {
          _internalGamePads[index] = {
            axes: Array.apply(
              null,
              Array(numAxis).map(function () {
                return undefined;
              })
            ),
            buttons: Array.apply(
              null,
              Array(numButtons).map(function () {
                return { pressed: false, value: 0 };
              })
            ),
            connected: true,
            index: index,
            id: 'Mock Gamepad',
            mapping: 'standard',
            timing: 15335
          };
        },

        deleteGamepad: function (index: number) {
          _internalGamePads[index] = undefined;
        },

        setGamepadAxis: function (gamepadIndex: number, axisIndex: number, value: number) {
          _internalGamePads[gamepadIndex].axes[axisIndex] = value;
        },

        setGamepadButton: function (gamepadIndex: number, buttonIndex: number, value: number) {
          _internalGamePads[gamepadIndex].buttons[buttonIndex] = { pressed: value > 0 ? true : false, value: value };
        },

        getGamepads: function () {
          return _internalGamePads;
        }
      };

      return mockNavigator;
    }

    realengine(): ex.Engine {
      if (!navigator) {
        // eslint-disable-next-line
        navigator = <any>this.navigator();
      }

      return new ex.Engine({
        width: 500,
        height: 500,
        suppressConsoleBootMessage: true,
        suppressMinimumBrowserFeatureDetection: true
      });
    }

    engine(width: number, height: number) {
      if (!navigator) {
        // eslint-disable-next-line
        navigator = <any>this.navigator();
      }

      const mockEngine = {
        collisionStrategy: 0,
        timescale: 1,
        currentScene: null,
        keys: [],
        clicks: [],
        mouseDown: [],
        mouseMove: [],
        mouseUp: [],
        touchStart: [],
        touchMove: [],
        touchEnd: [],
        touchCancel: [],
        canvasWidth: width,
        canvasHeight: height,
        scenes: {},
        _animations: [],
        _logger: {
          debug: function () {
            /* do nothing */
          },
          info: function () {
            /* do nothing */
          },
          warn: function () {
            /* do nothing */
          },
          error: function () {
            /* do nothing */
          }
        },
        debug: {},
        stats: {
          currFrame: new ex.FrameStats(),
          prevFrame: new ex.FrameStats()
        },
        input: {
          keyboard: {
            update: function () {
              /* do nothing */
            }
          },
          // eslint-disable-next-line
          pointers: new ex.PointerEventReceiver(window, null),
          gamepads: {
            update: function () {
              /* do nothing */
            }
          }
        },
        canvas: {
          width: width,
          clientWidth: width,
          height: height,
          clientHeight: height
        },
        ctx: {
          canvas: {
            width: width,
            height: height
          },
          save: function () {
            /* do nothing */
          },
          restore: function () {
            /* do nothing */
          },
          translate: function () {
            /* do nothing */
          },
          rotate: function () {
            /* do nothing */
          },
          scale: function () {
            /* do nothing */
          }
        },
        getDrawWidth: function () {
          return width;
        },
        getDrawHeight: function () {
          return height;
        },
        worldToScreenCoordinates: ex.Engine.prototype.worldToScreenCoordinates,
        screenToWorldCoordinates: ex.Engine.prototype.screenToWorldCoordinates,
        addScene: ex.Engine.prototype.addScene,
        goToScene: ex.Engine.prototype.goToScene,
        stop: function () {
          /* do nothing */
        },
        onFatalException: function () {
          /* do nothing */
        },
        emit: function () {
          /* do nothing */
        },
        eventDispatcher: {
          emit: function () {
            /* do nothing */
          }
        },
        _hasStarted: true,
        _update: (<any>ex.Engine.prototype)._update,
        _preupdate: ex.Engine.prototype._preupdate,
        onPreUpdate: ex.Engine.prototype.onPreUpdate,
        _postupdate: ex.Engine.prototype._postupdate,
        onPostUpdate: ex.Engine.prototype.onPostUpdate,
        _draw: function () {
          /* do nothing */
        },
        _predraw: ex.Engine.prototype._predraw,
        onPreDraw: ex.Engine.prototype.onPreDraw,
        _postdraw: ex.Engine.prototype._postdraw,
        onPostDraw: ex.Engine.prototype.onPostDraw,
        _overrideInitialize: (<any>ex.Engine.prototype)._overrideInitialize,
        onInitialize: ex.Engine.prototype.onInitialize
      };
      return mockEngine;
    }

    /**
     * Get a time mock. Allows you to mock a now function and increment/decrement the value.
     */
    time(): TimeLike {
      let now = 0;

      return {
        add: function (value) {
          now += value;
        },
        sub: function (value) {
          now -= value;
        },
        now: function () {
          return now;
        }
      };
    }

    window() {
      const _handlers = {};

      const mockWindow = {
        addEventListener: function (name, handler) {
          _handlers[name] = handler;
        },
        emit: function (name, eventObject) {
          _handlers[name](eventObject);
        }
      };

      return mockWindow;
    }
  }
}
