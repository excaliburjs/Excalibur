/**
 * The current Excalibur version string
 * @description `process.env.__EX_VERSION` gets replaced by Webpack on build
 */
export const EX_VERSION = process.env.__EX_VERSION;
import { polyfill } from './Polyfill';
polyfill();

// This file is used as the bundle entry point and exports everything
// that will be exposed as the `ex` global variable.
export * from './Flags';
export * from './Id';
export * from './Engine';
export * from './Screen';
export { Actor, ActorArgs } from './Actor';
export * from './Math/Index';
export * from './Camera';
export * from './Class';
export * from './Configurable';
export * from './Debug/index';
export * from './EventDispatcher';
export * from './Events/MediaEvents';
export * from './Events';
export * from './Label';
export { FontStyle, FontUnit, TextAlign, BaseAlign } from './Graphics/FontCommon';
export * from './Loader';
export { Particle, ParticleEmitter, ParticleArgs, ParticleEmitterArgs, EmitterType } from './Particles';
export * from './Collision/Physics';
export * from './Scene';

export * from './TileMap/index';

export * from './Timer';
export * from './Trigger';
export * from './ScreenElement';

export * from './Actions/Index';
export * from './Collision/Index';

export * from './Interfaces/Index';
export * from './Resources/Index';

export * from './EntityComponentSystem/index';

export * from './Color';

export * from './Graphics/index';

// ex.Events namespace
import * as events from './Events';
export { events as Events };

// ex.Input namespace
import * as input from './Input/Index';
export { input as Input };
export { PointerComponent } from './Input/Index';
export { PointerSystem } from './Input/PointerSystem';

// ex.Util namespaces
import * as util from './Util/Index';
export { util as Util };

export * from './Util/Browser';
export * from './Util/Decorators';
export * from './Util/Detector';
export * from './Util/EasingFunctions';
export * from './Util/Observable';
export * from './Util/Log';
export * from './Util/Pool';
export * from './Util/Fps';
export * from './Util/Clock';
export * from './Util/WebAudio';
export * from './Util/Toaster';
export * from './Util/StateMachine';
export * from './Util/Future';
export * from './Util/Semaphore';

// ex.Deprecated
// import * as deprecated from './Deprecated';
// export { deprecated as Deprecated };
// export * from './Deprecated';
