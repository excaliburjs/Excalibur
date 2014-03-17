declare module ex {
    class Point {
        public x: number;
        public y: number;
        constructor(x: number, y: number);
    }
    class Vector extends Point {
        public x: number;
        public y: number;
        constructor(x: number, y: number);
        public distance(v?: Vector): number;
        public normalize(): Vector;
        public scale(size: any): Vector;
        public add(v: Vector): Vector;
        public minus(v: Vector): Vector;
        public dot(v: Vector): number;
        public cross(v: Vector): number;
    }
}
declare module ex.Util {
    class Class {
        constructor();
        static extend(methods: any): () => void;
    }
    function base64Encode(inputStr: string): string;
    function clamp(val: any, min: any, max: any): any;
    function drawLine(ctx: CanvasRenderingContext2D, color: string, startx: any, starty: any, endx: any, endy: any): void;
    function randomInRange(min: number, max: number): number;
    function getPosition(el: HTMLElement): Point;
    class Collection<T> {
        static DefaultSize: number;
        private internalArray;
        private endPointer;
        constructor(initialSize?: number);
        private resize();
        public push(element: T): T;
        public pop(): T;
        public count(): number;
        public clear(): void;
        public internalSize(): number;
        public elementAt(index: number): T;
        public insert(index: number, value: T): T;
        public remove(index: number): T;
        public removeElement(element: T): void;
        public toArray(): T[];
        public forEach(func: (element: T, index: number) => any): void;
        public map(func: (element: T, index: number) => any): void;
    }
}
declare module ex {
    class Overlap {
        public x: number;
        public y: number;
        constructor(x: number, y: number);
    }
    class Scene {
        public actor: Actor;
        public children: Actor[];
        public engine: Engine;
        private killQueue;
        private timers;
        private cancelQueue;
        public collisionGroups: {
            [key: string]: Actor[];
        };
        constructor();
        public onActivate(): void;
        public onDeactivate(): void;
        public publish(eventType: string, event: GameEvent): void;
        public update(engine: Engine, delta: number): void;
        public draw(ctx: CanvasRenderingContext2D, delta: number): void;
        public debugDraw(ctx: CanvasRenderingContext2D): void;
        public addChild(actor: Actor): void;
        public updateAddCollisionGroups(actor: Actor): void;
        public removeChild(actor: Actor): void;
        public updateRemoveCollisionGroups(actor: Actor): void;
        public addTimer(timer: Timer): Timer;
        public removeTimer(timer: Timer): Timer;
        public cancelTimer(timer: Timer): Timer;
        public isTimerActive(timer: Timer): boolean;
    }
    enum Side {
        NONE = 0,
        TOP = 1,
        BOTTOM = 2,
        LEFT = 3,
        RIGHT = 4,
    }
    class Actor extends Util.Class {
        public x: number;
        public y: number;
        private height;
        private width;
        public rotation: number;
        public rx: number;
        public scale: number;
        public sx: number;
        public dx: number;
        public dy: number;
        public ax: number;
        public ay: number;
        public invisible: boolean;
        public opacity: number;
        private previousOpacity;
        public actionQueue: Internal.Actions.ActionQueue;
        public eventDispatcher: EventDispatcher;
        private sceneNode;
        public logger: Logger;
        public scene: Scene;
        public parent: Actor;
        public fixed: boolean;
        public preventCollisions: boolean;
        public collisionGroups: string[];
        public frames: {
            [key: string]: IDrawable;
        };
        public currentDrawing: IDrawable;
        private centerDrawingX;
        private centerDrawingY;
        public color: Color;
        constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
        public kill(): void;
        public addChild(actor: Actor): void;
        public removeChild(actor: Actor): void;
        public setDrawing(key: any): void;
        public addDrawing(key: any, drawing: IDrawable): void;
        public addEventListener(eventName: string, handler: (event?: GameEvent) => void): void;
        public removeEventListener(eventName: string, handler?: (event?: GameEvent) => void): void;
        public triggerEvent(eventName: string, event?: GameEvent): void;
        public addCollisionGroup(name: string): void;
        public removeCollisionGroup(name: string): void;
        public getCenter(): Vector;
        public getWidth(): number;
        public setWidth(width: any): void;
        public getHeight(): number;
        public setHeight(height: any): void;
        public setCenterDrawing(center: boolean): void;
        public getLeft(): number;
        public getRight(): number;
        public getTop(): number;
        public getBottom(): number;
        public getGlobalX(): any;
        public getGlobalY(): any;
        private getOverlap(box);
        public contains(x: number, y: number): boolean;
        public collides(actor: Actor): Side;
        public within(actor: Actor, distance: number): boolean;
        public clearActions(): void;
        public moveTo(x: number, y: number, speed: number): Actor;
        public moveBy(x: number, y: number, time: number): Actor;
        public rotateTo(angleRadians: number, speed: number): Actor;
        public rotateBy(angleRadians: number, time: number): Actor;
        public scaleTo(size: number, speed: number): Actor;
        public scaleBy(size: number, time: number): Actor;
        public blink(frequency: number, duration: number, blinkTime?: number): Actor;
        public fade(opacity: number, time: number): Actor;
        public delay(time: number): Actor;
        public repeat(times?: number): Actor;
        public repeatForever(): Actor;
        public follow(actor: Actor, followDistance?: number): Actor;
        public meet(actor: Actor, speed?: number): Actor;
        public update(engine: Engine, delta: number): void;
        public draw(ctx: CanvasRenderingContext2D, delta: number): void;
        public debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    enum TextAlign {
        Left = 0,
        Right = 1,
        Center = 2,
        Start = 3,
        End = 4,
    }
    enum BaseAlign {
        Top = 0,
        Hanging = 1,
        Middle = 2,
        Alphabetic = 3,
        Ideographic = 4,
        Bottom = 5,
    }
    class Label extends Actor {
        public text: string;
        public spriteFont: SpriteFont;
        public font: string;
        public textAlign: TextAlign;
        public baseAlign: BaseAlign;
        public maxWidth: number;
        public letterSpacing: number;
        public caseInsensitive: boolean;
        private _textShadowOn;
        private _shadowOffsetX;
        private _shadowOffsetY;
        private _shadowColor;
        private _shadowColorDirty;
        private _textSprites;
        private _shadowSprites;
        private _color;
        constructor(text?: string, x?: number, y?: number, font?: string, spriteFont?: SpriteFont);
        public getTextWidth(ctx: CanvasRenderingContext2D): number;
        private _lookupTextAlign(textAlign);
        private _lookupBaseAlign(baseAlign);
        public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color): void;
        public clearTextShadow(): void;
        public update(engine: Engine, delta: number): void;
        public draw(ctx: CanvasRenderingContext2D, delta: number): void;
        private _fontDraw(ctx, delta, sprites);
        public debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    class Trigger extends Actor {
        private action;
        public repeats: number;
        public target: Actor;
        constructor(x?: number, y?: number, width?: number, height?: number, action?: () => void, repeats?: number);
        public update(engine: Engine, delta: number): void;
        private dispatchAction();
        public draw(ctx: CanvasRenderingContext2D, delta: number): void;
        public debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex.Internal.Actions {
    interface IAction {
        x: number;
        y: number;
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    class MoveTo implements IAction {
        private actor;
        public x: number;
        public y: number;
        private start;
        private end;
        private dir;
        private speed;
        private distance;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, speed: number);
        public update(delta: number): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class MoveBy implements IAction {
        private actor;
        public x: number;
        public y: number;
        private distance;
        private speed;
        private time;
        private start;
        private end;
        private dir;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, time: number);
        public update(delta: Number): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class Follow implements IAction {
        private actor;
        private actorToFollow;
        public x: number;
        public y: number;
        private current;
        private end;
        private dir;
        private speed;
        private maximumDistance;
        private distanceBetween;
        private _started;
        private _stopped;
        constructor(actor: Actor, actorToFollow: Actor, followDistance?: number);
        public update(delta: number): void;
        public stop(): void;
        public isComplete(actor: Actor): boolean;
        public reset(): void;
    }
    class Meet implements IAction {
        private actor;
        private actorToMeet;
        public x: number;
        public y: number;
        private current;
        private end;
        private dir;
        private speed;
        private distanceBetween;
        private _started;
        private _stopped;
        private _speedWasSpecified;
        constructor(actor: Actor, actorToMeet: Actor, speed?: number);
        public update(delta: number): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class RotateTo implements IAction {
        private actor;
        public x: number;
        public y: number;
        private start;
        private end;
        private speed;
        private distance;
        private _started;
        private _stopped;
        constructor(actor: Actor, angleRadians: number, speed: number);
        public update(delta: number): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class RotateBy implements IAction {
        private actor;
        public x: number;
        public y: number;
        private start;
        private end;
        private time;
        private distance;
        private _started;
        private _stopped;
        private speed;
        constructor(actor: Actor, angleRadians: number, time: number);
        public update(delta: number): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class ScaleTo implements IAction {
        private actor;
        public x: number;
        public y: number;
        private start;
        private end;
        private speed;
        private distance;
        private _started;
        private _stopped;
        constructor(actor: Actor, scale: number, speed: number);
        public update(delta: number): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class ScaleBy implements IAction {
        private actor;
        public x: number;
        public y: number;
        private start;
        private end;
        private time;
        private distance;
        private _started;
        private _stopped;
        private speed;
        constructor(actor: Actor, scale: number, time: number);
        public update(delta: number): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class Delay implements IAction {
        public x: number;
        public y: number;
        private actor;
        private elapsedTime;
        private delay;
        private _started;
        private _stopped;
        constructor(actor: Actor, delay: number);
        public update(delta: number): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class Blink implements IAction {
        public x: number;
        public y: number;
        private frequency;
        private duration;
        private actor;
        private numBlinks;
        private blinkTime;
        private _started;
        private nextBlink;
        private elapsedTime;
        private isBlinking;
        private _stopped;
        constructor(actor: Actor, frequency: number, duration: number, blinkTime?: number);
        public update(delta: any): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class Fade implements IAction {
        public x: number;
        public y: number;
        private actor;
        private endOpacity;
        private speed;
        private multiplyer;
        private _started;
        private _stopped;
        constructor(actor: Actor, endOpacity: number, speed: number);
        public update(delta: number): void;
        public isComplete(actor: Actor): boolean;
        public stop(): void;
        public reset(): void;
    }
    class Repeat implements IAction {
        public x: number;
        public y: number;
        private actor;
        private actionQueue;
        private repeat;
        private originalRepeat;
        private _stopped;
        constructor(actor: Actor, repeat: number, actions: IAction[]);
        public update(delta: any): void;
        public isComplete(): boolean;
        public stop(): void;
        public reset(): void;
    }
    class RepeatForever implements IAction {
        public x: number;
        public y: number;
        private actor;
        private actionQueue;
        private _stopped;
        constructor(actor: Actor, actions: IAction[]);
        public update(delta: any): void;
        public isComplete(): boolean;
        public stop(): void;
        public reset(): void;
    }
    class ActionQueue {
        private actor;
        private _actions;
        private _currentAction;
        private _completedActions;
        constructor(actor: Actor);
        public add(action: IAction): void;
        public remove(action: IAction): void;
        public clearActions(): void;
        public getActions(): IAction[];
        public hasNext(): boolean;
        public reset(): void;
        public update(delta: number): void;
    }
}
declare module ex {
    enum LogLevel {
        Debug = 0,
        Info = 1,
        Warn = 2,
        Error = 3,
        Fatal = 4,
    }
    class Logger {
        private static _instance;
        private appenders;
        constructor();
        public defaultLevel: LogLevel;
        static getInstance(): Logger;
        public addAppender(appender: IAppender): void;
        public clearAppenders(): void;
        private _log(level, args);
        public debug(...args: any[]): void;
        public info(...args: any[]): void;
        public warn(...args: any[]): void;
        public error(...args: any[]): void;
        public fatal(...args: any[]): void;
    }
    interface IAppender {
        log(level: LogLevel, args: any[]): void;
    }
    class ConsoleAppender implements IAppender {
        public log(level: LogLevel, args: any[]): void;
    }
    class ScreenAppender implements IAppender {
        private _messages;
        private canvas;
        private ctx;
        constructor(width?: number, height?: number);
        public log(level: LogLevel, args: any[]): void;
    }
}
declare module ex {
    enum EventType {
        KeyDown = 0,
        KeyUp = 1,
        KeyPress = 2,
        MouseDown = 3,
        MouseMove = 4,
        MouseUp = 5,
        TouchStart = 6,
        TouchMove = 7,
        TouchEnd = 8,
        TouchCancel = 9,
        Click = 10,
        UserEvent = 11,
        Collision = 12,
        Blur = 13,
        Focus = 14,
        Update = 15,
    }
    class GameEvent {
        public target: any;
        constructor();
    }
    class FocusEvent extends GameEvent {
        constructor();
    }
    class BlurEvent extends GameEvent {
        constructor();
    }
    class CollisionEvent extends GameEvent {
        public actor: Actor;
        public other: Actor;
        public side: Side;
        constructor(actor: Actor, other: Actor, side: Side);
    }
    class UpdateEvent extends GameEvent {
        public delta: number;
        constructor(delta: number);
    }
    class KeyEvent extends GameEvent {
        public key: InputKey;
        constructor(key: InputKey);
    }
    class KeyDown extends GameEvent {
        public key: InputKey;
        constructor(key: InputKey);
    }
    class KeyUp extends GameEvent {
        public key: InputKey;
        constructor(key: InputKey);
    }
    class KeyPress extends GameEvent {
        public key: InputKey;
        constructor(key: InputKey);
    }
    enum MouseButton {
        Left = 0,
        Middle = 1,
        Right = 2,
    }
    class MouseDown extends GameEvent {
        public x: number;
        public y: number;
        public mouseEvent: MouseEvent;
        constructor(x: number, y: number, mouseEvent: MouseEvent);
    }
    class MouseMove extends GameEvent {
        public x: number;
        public y: number;
        public mouseEvent: MouseEvent;
        constructor(x: number, y: number, mouseEvent: MouseEvent);
    }
    class MouseUp extends GameEvent {
        public x: number;
        public y: number;
        public mouseEvent: MouseEvent;
        constructor(x: number, y: number, mouseEvent: MouseEvent);
    }
    interface Touch {
        identifier: string;
        screenX: number;
        screenY: number;
        clientX: number;
        clientY: number;
        pageX: number;
        pageY: number;
        radiusX: number;
        radiusY: number;
        rotationAngle: number;
        force: number;
        target: Element;
    }
    interface TouchEvent extends Event {
        altKey: boolean;
        changedTouches: Touch[];
        ctrlKey: boolean;
        metaKey: boolean;
        shiftKey: boolean;
        targetTouches: Touch[];
        touches: Touch[];
        type: string;
        target: Element;
    }
    class TouchStart extends GameEvent {
        public x: number;
        public y: number;
        constructor(x: number, y: number);
    }
    class TouchMove extends GameEvent {
        public x: number;
        public y: number;
        constructor(x: number, y: number);
    }
    class TouchEnd extends GameEvent {
        public x: number;
        public y: number;
        constructor(x: number, y: number);
    }
    class TouchCancel extends GameEvent {
        public x: number;
        public y: number;
        constructor(x: number, y: number);
    }
    class Click extends GameEvent {
        public x: number;
        public y: number;
        public mouseEvent: MouseEvent;
        constructor(x: number, y: number, mouseEvent: MouseEvent);
    }
    class EventDispatcher {
        private _handlers;
        private queue;
        private target;
        private log;
        constructor(target: any);
        public publish(eventName: string, event?: GameEvent): void;
        public subscribe(eventName: string, handler: (event?: GameEvent) => void): void;
        public unsubscribe(eventName: string, handler?: (event?: GameEvent) => void): void;
        public update(): void;
    }
}
declare module ex {
    enum EmitterType {
        Circle = 0,
        Rectangle = 1,
    }
    class Particle {
        public position: Vector;
        public velocity: Vector;
        public acceleration: Vector;
        public focus: Vector;
        public focusAccel: number;
        public opacity: number;
        public beginColor: Color;
        public endColor: Color;
        public life: number;
        public fadeFlag: boolean;
        private rRate;
        private gRate;
        private bRate;
        private aRate;
        private currentColor;
        public emitter: ParticleEmitter;
        public particleSize: number;
        public particleSprite: Sprite;
        constructor(emitter: ParticleEmitter, life?: number, opacity?: number, beginColor?: Color, endColor?: Color, position?: Vector, velocity?: Vector, acceleration?: Vector);
        public kill(): void;
        public update(delta: number): void;
        public draw(ctx: CanvasRenderingContext2D): void;
    }
    class ParticleEmitter extends Actor {
        public numParticles: number;
        public isEmitting: boolean;
        public particles: Util.Collection<Particle>;
        public deadParticles: Util.Collection<Particle>;
        public minVel: number;
        public maxVel: number;
        public acceleration: Vector;
        public minAngle: number;
        public maxAngle: number;
        public emitRate: number;
        public particleLife: number;
        public opacity: number;
        public fadeFlag: boolean;
        public focus: Vector;
        public focusAccel: number;
        public minSize: number;
        public maxSize: number;
        public beginColor: Color;
        public endColor: Color;
        public particleSprite: Sprite;
        public emitterType: EmitterType;
        public radius: number;
        constructor(x?: number, y?: number, width?: number, height?: number);
        public removeParticle(particle: Particle): void;
        public emit(particleCount: number): void;
        public clearParticles(): void;
        private createParticle();
        public update(engine: Engine, delta: number): void;
        public draw(ctx: CanvasRenderingContext2D, delta: number): void;
        public debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex.Internal {
    interface ISound {
        setVolume(volume: number): any;
        setLoop(loop: boolean): any;
        play(): any;
        stop(): any;
        load(): any;
        onload: (e: any) => void;
        onprogress: (e: any) => void;
        onerror: (e: any) => void;
    }
    class FallbackAudio implements ISound {
        private soundImpl;
        private log;
        constructor(path: string, volume?: number);
        public setVolume(volume: number): void;
        public setLoop(loop: boolean): void;
        public onload: (e: any) => void;
        public onprogress: (e: any) => void;
        public onerror: (e: any) => void;
        public load(): void;
        public play(): void;
        public stop(): void;
    }
    class AudioTag implements ISound {
        public soundPath: string;
        private audioElements;
        private _loadedAudio;
        private isLoaded;
        private index;
        private log;
        constructor(soundPath: string, volume?: number);
        private audioLoaded();
        public setVolume(volume: number): void;
        public setLoop(loop: boolean): void;
        public onload: (e: any) => void;
        public onprogress: (e: any) => void;
        public onerror: (e: any) => void;
        public load(): void;
        public play(): void;
        public stop(): void;
    }
    class WebAudio implements ISound {
        private context;
        private volume;
        private buffer;
        private sound;
        private path;
        private isLoaded;
        private loop;
        private logger;
        constructor(soundPath: string, volume?: number);
        public setVolume(volume: number): void;
        public onload: (e: any) => void;
        public onprogress: (e: any) => void;
        public onerror: (e: any) => void;
        public load(): void;
        public setLoop(loop: boolean): void;
        public play(): void;
        public stop(): void;
    }
}
declare module ex {
    enum PromiseState {
        Resolved = 0,
        Rejected = 1,
        Pending = 2,
    }
    interface IPromise<T> {
        then(successCallback?: (value?: T) => any, rejectCallback?: (value?: T) => any): IPromise<T>;
        error(rejectCallback?: (value?: any) => any): IPromise<T>;
        resolve(value?: T): IPromise<T>;
        reject(value?: any): IPromise<T>;
        state(): PromiseState;
    }
    class Promise<T> implements IPromise<T> {
        private _state;
        private value;
        private successCallbacks;
        private rejectCallback;
        private errorCallback;
        private logger;
        static wrap<T>(value?: T): Promise<T>;
        constructor();
        public then(successCallback?: (value?: T) => any, rejectCallback?: (value?: any) => any): Promise<T>;
        public error(errorCallback?: (value?: any) => any): Promise<T>;
        public resolve(value?: T): Promise<T>;
        public reject(value?: any): Promise<T>;
        public state(): PromiseState;
        private handleError(e);
    }
}
declare module ex {
    interface ILoadable {
        load(): Promise<any>;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: (e: any) => void;
        isLoaded(): boolean;
    }
    class Texture implements ILoadable {
        public path: string;
        public width: number;
        public height: number;
        public image: HTMLImageElement;
        private logger;
        private progressCallback;
        private doneCallback;
        private errorCallback;
        constructor(path: string);
        private _start(e);
        public isLoaded(): boolean;
        public load(): Promise<HTMLImageElement>;
        public onprogress: (e: any) => void;
        public oncomplete: () => void;
        public onerror: (e: any) => void;
    }
    class Sound implements ILoadable, Internal.ISound {
        private logger;
        public onprogress: (e: any) => void;
        public oncomplete: () => void;
        public onerror: (e: any) => void;
        public onload: (e: any) => void;
        private _isLoaded;
        private _selectedFile;
        public sound: Internal.FallbackAudio;
        static canPlayFile(file: string): boolean;
        constructor(...paths: string[]);
        public setVolume(volume: number): void;
        public setLoop(loop: boolean): void;
        public play(): void;
        public stop(): void;
        public isLoaded(): boolean;
        public load(): Promise<Internal.FallbackAudio>;
    }
    class Loader implements ILoadable {
        private resourceList;
        private index;
        private resourceCount;
        private numLoaded;
        private progressCounts;
        private totalCounts;
        constructor(loadables?: ILoadable[]);
        public addResource(loadable: ILoadable): void;
        public addResources(loadables: ILoadable[]): void;
        private sumCounts(obj);
        public isLoaded(): boolean;
        public load(): Promise<any>;
        public onprogress: (e: any) => void;
        public oncomplete: () => void;
        public onerror: () => void;
    }
}
declare module ex {
    interface IDrawable {
        flipVertical: boolean;
        flipHorizontal: boolean;
        width: number;
        height: number;
        addEffect(effect: Effects.ISpriteEffect): any;
        clearEffects(): any;
        transformAboutPoint(point: Point): any;
        setScale(scale: number): any;
        getScale(): number;
        setRotation(radians: number): any;
        getRotation(): number;
        reset(): any;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): any;
    }
    class SpriteSheet {
        public image: Texture;
        private columns;
        private rows;
        public sprites: Sprite[];
        private internalImage;
        constructor(image: Texture, columns: number, rows: number, spWidth: number, spHeight: number);
        public getAnimationByIndices(engine: Engine, indices: number[], speed: number): Animation;
        public getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number): Animation;
        public getAnimationForAll(engine: Engine, speed: number): Animation;
        public getSprite(index: number): Sprite;
    }
    class SpriteFont extends SpriteSheet {
        public image: Texture;
        private alphabet;
        private caseInsensitive;
        private spriteLookup;
        private colorLookup;
        private _currentColor;
        constructor(image: Texture, alphabet: string, caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number);
        public getTextSprites(): {
            [key: string]: Sprite;
        };
    }
    module Effects {
        interface ISpriteEffect {
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        class Grayscale implements ISpriteEffect {
            public updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        class Invert implements ISpriteEffect {
            public updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        class Opacity implements ISpriteEffect {
            public opacity: number;
            constructor(opacity: number);
            public updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        class Colorize implements ISpriteEffect {
            public color: Color;
            constructor(color: Color);
            public updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        class Fill implements ISpriteEffect {
            public color: Color;
            constructor(color: Color);
            public updatePixel(x: number, y: number, imageData: ImageData): void;
        }
    }
    class Sprite implements IDrawable {
        public sx: number;
        public sy: number;
        public swidth: number;
        public sheight: number;
        private texture;
        private scale;
        private rotation;
        private transformPoint;
        public flipVertical: boolean;
        public flipHorizontal: boolean;
        public width: number;
        public height: number;
        public effects: Effects.ISpriteEffect[];
        private internalImage;
        private spriteCanvas;
        private spriteCtx;
        private pixelData;
        private pixelsLoaded;
        private dirtyEffect;
        constructor(image: Texture, sx: number, sy: number, swidth: number, sheight: number);
        private loadPixels();
        public addEffect(effect: Effects.ISpriteEffect): void;
        private applyEffects();
        public clearEffects(): void;
        public transformAboutPoint(point: Point): void;
        public setRotation(radians: number): void;
        public getRotation(): number;
        public setScale(scale: number): void;
        public getScale(): number;
        public reset(): void;
        public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        public clone(): Sprite;
    }
    class Animation implements IDrawable {
        private sprites;
        private speed;
        private currIndex;
        private oldTime;
        private rotation;
        private scale;
        public loop: boolean;
        public freezeFrame: number;
        private engine;
        public flipVertical: boolean;
        public flipHorizontal: boolean;
        public width: number;
        public height: number;
        constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean);
        public addEffect(effect: Effects.ISpriteEffect): void;
        public clearEffects(): void;
        public transformAboutPoint(point: Point): void;
        public setRotation(radians: number): void;
        public getRotation(): number;
        public setScale(scale: number): void;
        public getScale(): number;
        public reset(): void;
        public isDone(): boolean;
        public tick(): void;
        public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        public play(x: number, y: number): void;
    }
    class Polygon implements IDrawable {
        public flipVertical: boolean;
        public flipHorizontal: boolean;
        public width: number;
        public height: number;
        public lineColor: Color;
        public fillColor: Color;
        public lineWidth: number;
        public filled: boolean;
        private points;
        private transformationPoint;
        private rotation;
        private scale;
        constructor(points: Point[]);
        public addEffect(effect: Effects.ISpriteEffect): void;
        public clearEffects(): void;
        public transformAboutPoint(point: Point): void;
        public setScale(scale: number): void;
        public getScale(): number;
        public setRotation(radians: number): void;
        public getRotation(): number;
        public reset(): void;
        public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
    }
}
declare module ex {
    class BaseCamera {
        public follow: Actor;
        public focus: Point;
        public engine: Engine;
        public isShaking: boolean;
        private shakeMagnitudeX;
        private shakeMagnitudeY;
        private shakeDuration;
        private elapsedShakeTime;
        public isZooming: boolean;
        private currentZoomScale;
        private maxZoomScale;
        private zoomDuration;
        private elapsedZoomTime;
        private zoomIncrement;
        constructor(engine: Engine);
        public setActorToFollow(actor: Actor): void;
        public getFocus(): Point;
        public setFocus(x: number, y: number): void;
        public shake(magnitudeX: number, magnitudeY: number, duration: number): void;
        public zoom(scale: number, duration?: number): void;
        public getCurrentZoomScale(): number;
        private setCurrentZoomScale(zoomScale);
        public update(delta: number): void;
        private isDoneShaking();
        private isDoneZooming();
    }
    class SideCamera extends BaseCamera {
        public getFocus(): Point;
    }
    class TopCamera extends BaseCamera {
        public getFocus(): Point;
    }
}
declare module ex {
    class Color {
        public r: number;
        public g: number;
        public b: number;
        public a: number;
        static Black: Color;
        static White: Color;
        static Yellow: Color;
        static Orange: Color;
        static Red: Color;
        static Vermillion: Color;
        static Rose: Color;
        static Magenta: Color;
        static Violet: Color;
        static Blue: Color;
        static Azure: Color;
        static Cyan: Color;
        static Viridian: Color;
        static Green: Color;
        static Chartreuse: Color;
        static Transparent: Color;
        constructor(r: number, g: number, b: number, a?: number);
        static fromRGB(r: number, g: number, b: number, a?: number): Color;
        static fromHex(hex: string): Color;
        public toString(): string;
        public clone(): Color;
    }
    enum InputKey {
        Num1 = 97,
        Num2 = 98,
        Num3 = 99,
        Num4 = 100,
        Num5 = 101,
        Num6 = 102,
        Num7 = 103,
        Num8 = 104,
        Num9 = 105,
        Num0 = 96,
        Numlock = 144,
        Semicolon = 186,
        A = 65,
        B = 66,
        C = 67,
        D = 68,
        E = 69,
        F = 70,
        G = 71,
        H = 72,
        I = 73,
        J = 74,
        K = 75,
        L = 76,
        M = 77,
        N = 78,
        O = 79,
        P = 80,
        Q = 81,
        R = 82,
        S = 83,
        T = 84,
        U = 85,
        V = 86,
        W = 87,
        X = 88,
        Y = 89,
        Z = 90,
        Shift = 16,
        Alt = 18,
        Up = 38,
        Down = 40,
        Left = 37,
        Right = 39,
        Space = 32,
        Esc = 27,
    }
    enum DisplayMode {
        FullScreen = 0,
        Container = 1,
        Fixed = 2,
    }
    class Timer {
        static id: number;
        public id: number;
        public interval: number;
        public fcn: () => void;
        public repeats: boolean;
        private elapsedTime;
        public complete: boolean;
        public scene: Scene;
        constructor(fcn: () => void, interval: number, repeats?: boolean);
        public update(delta: number): void;
        public cancel(): void;
    }
    class Engine extends Util.Class {
        public canvas: HTMLCanvasElement;
        public ctx: CanvasRenderingContext2D;
        public canvasElementId: string;
        public width: number;
        public height: number;
        private hasStarted;
        private eventDispatcher;
        public keys: number[];
        public keysDown: number[];
        public keysUp: number[];
        public clicks: MouseDown[];
        public mouseDown: MouseDown[];
        public mouseMove: MouseMove[];
        public mouseUp: MouseUp[];
        public touchStart: TouchStart[];
        public touchMove: TouchMove[];
        public touchEnd: TouchEnd[];
        public touchCancel: TouchCancel[];
        public camera: BaseCamera;
        public currentScene: Scene;
        public rootScene: Scene;
        private sceneHash;
        private animations;
        public isFullscreen: boolean;
        public displayMode: DisplayMode;
        public isDebug: boolean;
        public debugColor: Color;
        public backgroundColor: Color;
        private logger;
        private isSmoothingEnabled;
        private loader;
        private isLoading;
        private progress;
        private total;
        private loadingDraw;
        constructor(width?: number, height?: number, canvasElementId?: string, displayMode?: DisplayMode);
        public addEventListener(eventName: string, handler: (event?: GameEvent) => void): void;
        public removeEventListener(eventName: string, handler?: (event?: GameEvent) => void): void;
        public playAnimation(animation: Animation, x: number, y: number): void;
        public addChild(actor: Actor): void;
        public removeChild(actor: Actor): void;
        public addTimer(timer: Timer): Timer;
        public removeTimer(timer: Timer): Timer;
        public addScene(name: string, scene: Scene): void;
        public goToScene(name: string): void;
        public getWidth(): number;
        public getHeight(): number;
        public screenToWorldCoordinates(point: Point): Point;
        private setHeightByDisplayMode(parent);
        private initialize();
        public setAntialiasing(isSmooth: boolean): void;
        public getAntialiasing(): boolean;
        public isKeyDown(key: InputKey): boolean;
        public isKeyPressed(key: InputKey): boolean;
        public isKeyUp(key: InputKey): boolean;
        private update(delta);
        private draw(delta);
        public start(loader?: ILoadable): Promise<any>;
        public stop(): void;
        private drawLoadingBar(ctx, loaded, total);
        public setLoadingDrawFunction(fcn: (ctx: CanvasRenderingContext2D, loaded: number, total: number) => void): void;
        public load(loader: ILoadable): Promise<any>;
    }
}
