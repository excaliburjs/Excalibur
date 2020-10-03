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
export * from './Engine';
export * from './Screen';
export { Actor, ActorArgs } from './Actor';
export { CollisionType } from './Collision/CollisionType';
export * from './Algebra';
export * from './Camera';
export * from './Class';
export * from './Configurable';
export * from './Debug';
export * from './EventDispatcher';
export * from './Events/MediaEvents';
export * from './Events';
export { Label, FontStyle, FontUnit, TextAlign, BaseAlign } from './Label';
export * from './Loader';
export { Particle, ParticleEmitter, ParticleArgs, ParticleEmitterArgs, EmitterType } from './Particles';
export * from './Physics';
export * from './Promises';
export * from './Scene';
export { TileMap, Cell, TileMapArgs, CellArgs, TileSprite } from './TileMap';
export * from './Timer';
export * from './Trigger';
export * from './ScreenElement';

export * from './Actions/Index';
export * from './Collision/Index';
export * from './Drawing/Index';
export * from './Interfaces/Index';
export * from './Math/Index';
export * from './PostProcessing/Index';
export * from './Resources/Index';

export * from './EntityComponentSystem/index';

// ex.Events namespace
import * as events from './Events';
export { events as Events };

// ex.Input namespace
import * as input from './Input/Index';
export { input as Input };

// ex.Traits namespace
import * as traits from './Traits/Index';
export { traits as Traits };

// ex.Util namespaces
import * as util from './Util/Index';
export { util as Util };

export * from './Util/Browser';
export * from './Util/Decorators';
export * from './Util/Detector';
export * from './Util/CullingBox';
export * from './Util/EasingFunctions';
export * from './Util/Log';
export * from './Util/SortedList';

// ex.Deprecated
// import * as deprecated from './Deprecated';
// export { deprecated as Deprecated };
// export * from './Deprecated';
