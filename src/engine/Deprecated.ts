import { Actionable } from './Actions/Actionable';
import { Trait } from './Interfaces/Trait';
import { Drawable } from './Interfaces/Drawable';
import { CanInitialize, CanActivate, CanDeactivate, CanUpdate, CanDraw, CanBeKilled } from './Interfaces/LifecycleEvents';
import { CollisionShape } from './Collision/CollisionShape';
import { Eventable } from './Interfaces/Evented';
import { PointerEvents } from './Interfaces/PointerEvents';
import { CameraStrategy } from './Camera';
import { Loadable } from './Interfaces/Loadable';
import { Action } from './Actions/Action';
import { ActorArgs, ActorDefaults } from './Actor';
import { CapturePointerConfig } from './Traits/CapturePointer';
import { Collidable, CircleOptions, CollisionBroadphase, EdgeOptions, EnginePhysics, ConvexPolygonOptions } from './Collision/Index';
import { Physics } from './Physics';
import { DebugFlags } from './DebugFlags';
import { CollidersHash, FrameStatistics, FrameDurationStats, PhysicsStatistics, FrameActorStats } from './Debug';
import { AnimationArgs } from './Drawing/Animation';
import { SpriteEffect } from './Drawing/SpriteEffects';
import { SpriteArgs } from './Drawing/Sprite';
import { SpriteFontArgs, SpriteFontOptions } from './Drawing/SpriteSheet';
import { CanLoad, Audio, ExResponseTypesLookup, AudioImplementation } from './Interfaces/Index';
import { PostProcessor } from './PostProcessing/Index';
import { AbsolutePosition, EngineOptions } from './Engine';
import { EngineInput, NavigatorGamepad, NavigatorGamepads, GamepadConfiguration, ActorsUnderPointer } from './Input/Index';
import { LabelArgs } from './Label';
import { PerlinOptions } from './Math/PerlinNoise';
import { ParticleArgs, ParticleEmitterArgs } from './Particles';
import { TileMapArgs, CellArgs } from './TileMap';
import { TriggerOptions } from './Trigger';
import { ObsoleteOptions } from './Util/Decorators';
import { DetectedFeatures } from './Util/Detector';
import { BorderRadius } from './Util/DrawUtil';
import { Appender } from './Util/Log';

/**
 * @obsolete Use ActorsUnderPointer, IActorsUnderPointer will be deprecated in v0.23.0
 */
export type IActorsUnderPointer = ActorsUnderPointer;

/**
 * @obsolete Use AbsolutePosition, IAbsolutePosition will be deprecated in v0.23.0
 */
export type IAbsolutePosition = AbsolutePosition;

/**
 * @obsolete Use Action, IAction will be deprecated in v0.23.0
 */
export type IAction = Action;

/**
 * @obsolete Use Actionable, IActionable will be deprecated in v0.23.0
 */
export type IActionable = Actionable;

/**
 * @obsolete Use ActorArgs, IActorArgs will be deprecated in v0.23.0
 */
export type IActorArgs = ActorArgs;

/**
 * @obsolete Use ActorDefaults, IActorDefaults will be deprecated in v0.23.0
 */
export type IActorDefaults = ActorDefaults;

/**
 * @obsolete Use Trait, IActorTrait will be removed v0.23.0
 */
export type IActorTrait = Trait;

/**
 * @obsolete Use AnimationArgs, IAnimationArgs will be removed v0.23.0
 */
export type IAnimationArgs = AnimationArgs;

/**
 * @obsolete Use Appender, IAppender will be removed v0.23.0
 */
export type IAppender = Appender;

/**
 * @obsolete Use Audio, IAudio will be removed v0.23.0
 */
export type IAudio = Audio;

/**
 * @obsolete Use AudioImplementation, IAudioImplementation will be removed v0.23.0
 */
export type IAudioImplementation = AudioImplementation;

/**
 * @obsolete Use BorderRadius, IBorderRadius will be removed v0.23.0
 */
export type IBorderRadius = BorderRadius;

/**
 * @obsolete Use CanInitialize, ICanInitialize will be removed v0.23.0
 */
export type ICanInitialize = CanInitialize;

/**
 * @obsolete Use CanActivate, ICanActivate will be removed v0.23.0
 */
export type ICanActivate = CanActivate;

/**
 * @obsolete Use CanDeactivate, ICanDeactivate will be removed v0.23.0
 */
export type ICanDeactivate = CanDeactivate;

/**
 * @obsolete Use CanUpdate, ICanUpdate will be removed in v0.23.0
 */
export type ICanUpdate = CanUpdate;

/**
 * @obsolete Use CanDraw, ICanDraw will be removed in v0.23.0
 */
export type ICanDraw = CanDraw;

/**
 * @obsolete Use CanBeKilled, ICanBeKilled will be removed in v0.23.0
 */
export type ICanBeKilled = CanBeKilled;

/**
 * @obsolete Use CameraStrategy, ICameraStrategy will be removed in v0.23.0
 */
export type ICameraStrategy<T> = CameraStrategy<T>;

/**
 * @obsolete Use CellArgs, ICellArgs will be removed in v0.23.0
 */
export type ICellArgs = CellArgs;

/**
 * @obsolete Use Collidable, ICollidable will be removed in v0.23.0
 */
export type ICollidable = Collidable;

/**
 * @obsolete Use CollisionShape, ICollisionArea will be removed in v0.23.0
 */
export type ICollisionArea = CollisionShape;

/**
 * @obsolete Use DetectedFeatures, IDetectedFeatures will be removed in v0.23.0
 */
export type IDetectedFeatures = DetectedFeatures;

/**
 * @obsolete Use ExResponseTypesLookup, IExResponseTypesLookup will be removed in v0.23.0
 */
export type IExResponseTypesLookup = ExResponseTypesLookup;

/**
 * @obsolete Use Physics, IPhysics will be removed in v0.23.0
 */
export type IPhysics = Physics;

/**
 * @obsolete Use DebugFlags, IDebugFlags will be removed in v0.23.0
 */
export type IDebugFlags = DebugFlags;

/**
 * @obsolete Use CollisionBroadphase, ICollisionBroadphase will be removed in v0.23.0
 */
export type ICollisionBroadphase = CollisionBroadphase;

/**
 * @obsolete Use CollidersHash, IColliderHash will be removed in v0.23.0
 */
export type IColliderHash = CollidersHash;

/**
 * @obsolete Use CircleOptions, ICircleAreaOptions will be removed in v0.23.0
 */
export type ICircleAreaOptions = CircleOptions;

/**
 * @obsolete Use EdgeOptions, IEdgeAreaOptions will be removed in v0.23.0
 */
export type IEdgeAreaOptions = EdgeOptions;

/**
 * @obsolete Use ConvexPolygonOptions, IPolygonAreaOptions will be removed in v0.23.0
 */
export type IPolygonAreaOptions = ConvexPolygonOptions;

/**
 * @obsolete Use EngineOptions, IEngineOptions will be removed in v0.23.0
 */
export type IEngineOptions = EngineOptions;

/**
 * @obsolete Use EnginePhysics, IEnginePhysics will be removed in v0.23.0
 */
export type IEnginePhysics = EnginePhysics;

/**
 * @obsolete Use EngineInput, IEngineInput will be removed in v0.23.0
 */
export type IEngineInput = EngineInput;

/**
 * @obsolete Use FrameStatistics, IFrameStats will be removed in v0.23.0
 */
export type IFrameStats = FrameStatistics;

/**
 * @obsolete Use FrameDurationStats, IFrameDurationStats will be removed in v0.23.0
 */
export type IFrameDurationStats = FrameDurationStats;

/**
 * @obsolete Use FrameActorStats, IFrameActorStates will be removed in v0.23.0
 */
export type IFrameActorStates = FrameActorStats;

/**
 * @obsolete Use PhysicsStatistics, IPhysicsStats will be removed in v0.23.0
 */
export type IPhysicsStats = PhysicsStatistics;

/**
 * @obsolete Use Drawable, IDrawable will be removed v0.23.0
 */
export type IDrawable = Drawable;

/**
 * @obsolete Use Eventable, IEvented will be removed in v0.23.0
 */
export type IEvented = Eventable;

/**
 * @obsolete Use NavigatorGamepads, INavigatorGamepads will be removed in v0.23.0
 */
export type INavigatorGamepads = NavigatorGamepads;

/**
 * @obsolete Use NavigatorGamepad, INavigatorGamepad will be removed in v0.23.0
 */
export type INavigatorGamepad = NavigatorGamepad;

/**
 * @obsolete Use GamepadConfiguration, IGamepadConfiguration will be removed in v0.23.0
 */
export type IGamepadConfiguration = GamepadConfiguration;

/**
 * @obsolete Use ObsoleteOptions, IObsoleteOptions will be removed in v0.23.0
 */
export type IObsoleteOptions = ObsoleteOptions;

/**
 * @obsolete Use PointerEvents, IPointerEvents will be removed in v0.23.0
 */
export type IPointerEvents = PointerEvents;

/**
 * @obsolete Use Loadable, ILoadable will be removed in v0.23.0
 */
export type ILoadable = Loadable;

/**
 * @obsolete Use CanLoad, ILoader will be removed in v0.23.0
 */
export type ILoader = CanLoad;

/**
 * @obsolete Use CapturePointerConfig, ICapturePointerConfig will be removed in v0.23.0
 */
export type ICapturePointerConfig = CapturePointerConfig;

/**
 * @obsolete Use PromiseLike, IPromise will be removed in v0.23.0
 */
export type IPromise<T> = PromiseLike<T>;

/**
 * @obsolete Use SpriteEffect, ISpriteEffect will be removed in v0.23.0
 */
export type ISpriteEffect = SpriteEffect;

/**
 * @obsolete Use SpriteArgs, ISpriteArgs will be removed in v0.23.0
 */
export type ISpriteArgs = SpriteArgs;

/**
 * @obsolete Use SpriteFontArgs, ISpriteFontInitArgs will be removed in v0.23.0
 */
export type ISpriteFontInitArgs = SpriteFontArgs;

/**
 * @obsolete Use SpriteFontOptions, ISpriteFrontOptions will be removed in v0.23.0
 */
export type ISpriteFrontOptions = SpriteFontOptions;

/**
 * @obsolete Use TileMapArgs, ITileMapArgs will be removed in v0.23.0
 */
export type ITileMapArgs = TileMapArgs;

/**
 * @obsolete Use TouchEvent, ITouchEvent will be removed in v0.23.0
 */
export type ITouchEvent = TouchEvent;

/**
 * @obsolete Use Touch, ITouch will be removed in v0.23.0
 */
export type ITouch = Touch;

/**
 * @obsolete Use TriggerOptions, ITriggerOptions will be removed in v0.23.0
 */
export type ITriggerOptions = TriggerOptions;

/**
 * @obsolete Use ParticleArgs, IParticleArgs will be removed in v0.23.0
 */
export type IParticleArgs = ParticleArgs;

/**
 * @obsolete Use ParticleEmitterArgs, IParticleEmitterArgs will be removed in v0.23.0
 */
export type IParticleEmitterArgs = ParticleEmitterArgs;

/**
 * @obsolete Use PerlinOptions, IPerlinGeneratorOptions will be removed in v0.23.0
 */
export type IPerlinGeneratorOptions = PerlinOptions;

/**
 * @obsolete Use PostProcessor, IPostProcessor will be removed in v0.23.0
 */
export type IPostProcessor = PostProcessor;

/**
 * @obsolete Use LabelArgs, ILabelArgs will be removed in v0.23.0
 */
export type ILabelArgs = LabelArgs;
