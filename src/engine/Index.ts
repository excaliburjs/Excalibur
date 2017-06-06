/**
 * The current Excalibur version string
 */
export var EX_VERSION = '__EX_VERSION';

// This file is used as the bundle entrypoint and exports everything
// that will be exposed as the `ex` global variable.

export * from './Actor';
export * from './Algebra';
export * from './Camera';
export * from './Class';
export * from './Configurable'
export * from './Debug';
export * from './Engine';
export * from './EventDispatcher';
export * from './Events';
export * from './Group';
export * from './Label';
export * from './Loader';
export * from './Particles';
export * from './Physics';
export * from './Promises';
export * from './Scene';
export * from './TileMap';
export * from './Timer';
export * from './Trigger';
export * from './UIActor';

export * from './Actions/Index';
export * from './Collision/Index';
export * from './Drawing/Index';
export * from './Interfaces/Index';
export * from './Math/Index';
export * from './PostProcessing/Index';
export * from './Resources/Index';

// ex.Events namespace
import * as events from './Events';
export { events as Events }

// ex.Input namespace
import * as input from './Input/Index';
export { input as Input }

// ex.Traits namespace
import * as traits from './Traits/Index';
export { traits as Traits }

// ex.Util namespaces
import * as util from './Util/Index';
export { util as Util }

export * from './Util/Decorators';
export * from './Util/Detector';
export * from './Util/CullingBox';
export * from './Util/EasingFunctions';
export * from './Util/Log';
export * from './Util/SortedList';