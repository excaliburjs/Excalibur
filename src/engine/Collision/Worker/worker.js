/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./EntityComponentSystem/Component.ts
/**
 * Type guard to check if a component implements clone
 * @param x
 */
function hasClone(x) {
    return !!(x === null || x === void 0 ? void 0 : x.clone);
}
/**
 * Components are containers for state in Excalibur, the are meant to convey capabilities that an Entity possesses
 *
 * Implementations of Component must have a zero-arg constructor to support dependencies
 *
 * ```typescript
 * class MyComponent extends ex.Component<'my'> {
 *   public readonly type = 'my';
 *   // zero arg support required if you want to use component dependencies
 *   constructor(public optionalPos?: ex.Vector) {}
 * }
 * ```
 */
class Component {
    constructor() {
        /**
         * Current owning [[Entity]], if any, of this component. Null if not added to any [[Entity]]
         */
        this.owner = null;
    }
    /**
     * Clones any properties on this component, if that property value has a `clone()` method it will be called
     */
    clone() {
        const newComponent = new this.constructor();
        for (const prop in this) {
            if (this.hasOwnProperty(prop)) {
                const val = this[prop];
                if (hasClone(val) && prop !== 'owner' && prop !== 'clone') {
                    newComponent[prop] = val.clone();
                }
                else {
                    newComponent[prop] = val;
                }
            }
        }
        return newComponent;
    }
}
/**
 * Tag components are a way of tagging a component with label and a simple value
 *
 * For example:
 *
 * ```typescript
 * const isOffscreen = new TagComponent('offscreen');
 * entity.addComponent(isOffscreen);
 * entity.tags.includes
 * ```
 */
class TagComponent extends Component {
    constructor(type, value) {
        super();
        this.type = type;
        this.value = value;
    }
}

;// CONCATENATED MODULE: ./Util/Observable.ts
/**
 * Simple Observable implementation
 * @template T is the typescript Type that defines the data being observed
 */
class Observable {
    constructor() {
        this.observers = [];
        this.subscriptions = [];
    }
    /**
     * Register an observer to listen to this observable
     * @param observer
     */
    register(observer) {
        this.observers.push(observer);
    }
    /**
     * Register a callback to listen to this observable
     * @param func
     */
    subscribe(func) {
        this.subscriptions.push(func);
    }
    /**
     * Remove an observer from the observable
     * @param observer
     */
    unregister(observer) {
        const i = this.observers.indexOf(observer);
        if (i !== -1) {
            this.observers.splice(i, 1);
        }
    }
    /**
     * Remove a callback that is listening to this observable
     * @param func
     */
    unsubscribe(func) {
        const i = this.subscriptions.indexOf(func);
        if (i !== -1) {
            this.subscriptions.splice(i, 1);
        }
    }
    /**
     * Broadcasts a message to all observers and callbacks
     * @param message
     */
    notifyAll(message) {
        const observersLength = this.observers.length;
        for (let i = 0; i < observersLength; i++) {
            this.observers[i].notify(message);
        }
        const subscriptionsLength = this.subscriptions.length;
        for (let i = 0; i < subscriptionsLength; i++) {
            this.subscriptions[i](message);
        }
    }
    /**
     * Removes all observers and callbacks
     */
    clear() {
        this.observers.length = 0;
        this.subscriptions.length = 0;
    }
}

;// CONCATENATED MODULE: ./Events.ts
var EventTypes;
(function (EventTypes) {
    EventTypes["Kill"] = "kill";
    EventTypes["PreKill"] = "prekill";
    EventTypes["PostKill"] = "postkill";
    EventTypes["PreDraw"] = "predraw";
    EventTypes["PostDraw"] = "postdraw";
    EventTypes["PreDebugDraw"] = "predebugdraw";
    EventTypes["PostDebugDraw"] = "postdebugdraw";
    EventTypes["PreUpdate"] = "preupdate";
    EventTypes["PostUpdate"] = "postupdate";
    EventTypes["PreFrame"] = "preframe";
    EventTypes["PostFrame"] = "postframe";
    EventTypes["PreCollision"] = "precollision";
    EventTypes["CollisionStart"] = "collisionstart";
    EventTypes["CollisionEnd"] = "collisionend";
    EventTypes["PostCollision"] = "postcollision";
    EventTypes["Initialize"] = "initialize";
    EventTypes["Activate"] = "activate";
    EventTypes["Deactivate"] = "deactivate";
    EventTypes["ExitViewport"] = "exitviewport";
    EventTypes["EnterViewport"] = "enterviewport";
    EventTypes["ExitTrigger"] = "exit";
    EventTypes["EnterTrigger"] = "enter";
    EventTypes["Connect"] = "connect";
    EventTypes["Disconnect"] = "disconnect";
    EventTypes["Button"] = "button";
    EventTypes["Axis"] = "axis";
    EventTypes["Subscribe"] = "subscribe";
    EventTypes["Unsubscribe"] = "unsubscribe";
    EventTypes["Visible"] = "visible";
    EventTypes["Hidden"] = "hidden";
    EventTypes["Start"] = "start";
    EventTypes["Stop"] = "stop";
    EventTypes["PointerUp"] = "pointerup";
    EventTypes["PointerDown"] = "pointerdown";
    EventTypes["PointerMove"] = "pointermove";
    EventTypes["PointerEnter"] = "pointerenter";
    EventTypes["PointerLeave"] = "pointerleave";
    EventTypes["PointerCancel"] = "pointercancel";
    EventTypes["PointerWheel"] = "pointerwheel";
    EventTypes["Up"] = "up";
    EventTypes["Down"] = "down";
    EventTypes["Move"] = "move";
    EventTypes["Enter"] = "enter";
    EventTypes["Leave"] = "leave";
    EventTypes["Cancel"] = "cancel";
    EventTypes["Wheel"] = "wheel";
    EventTypes["Press"] = "press";
    EventTypes["Release"] = "release";
    EventTypes["Hold"] = "hold";
    EventTypes["PointerDragStart"] = "pointerdragstart";
    EventTypes["PointerDragEnd"] = "pointerdragend";
    EventTypes["PointerDragEnter"] = "pointerdragenter";
    EventTypes["PointerDragLeave"] = "pointerdragleave";
    EventTypes["PointerDragMove"] = "pointerdragmove";
})(EventTypes || (EventTypes = {}));
/**
 * Base event type in Excalibur that all other event types derive from. Not all event types are thrown on all Excalibur game objects,
 * some events are unique to a type, others are not.
 *
 */
class GameEvent {
    constructor() {
        this._bubbles = true;
    }
    /**
     * If set to false, prevents event from propagating to other actors. If true it will be propagated
     * to all actors that apply.
     */
    get bubbles() {
        return this._bubbles;
    }
    set bubbles(value) {
        this._bubbles = value;
    }
    /**
     * Prevents event from bubbling
     */
    stopPropagation() {
        this.bubbles = false;
    }
}
/**
 * The 'kill' event is emitted on actors when it is killed. The target is the actor that was killed.
 */
class KillEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'prekill' event is emitted directly before an actor is killed.
 */
class PreKillEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'postkill' event is emitted directly after the actor is killed.
 */
class PostKillEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'start' event is emitted on engine when has started and is ready for interaction.
 */
class GameStartEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'stop' event is emitted on engine when has been stopped and will no longer take input, update or draw.
 */
class GameStopEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
class PreDrawEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(ctx, delta, target) {
        super();
        this.ctx = ctx;
        this.delta = delta;
        this.target = target;
    }
}
/**
 * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
class PostDrawEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(ctx, delta, target) {
        super();
        this.ctx = ctx;
        this.delta = delta;
        this.target = target;
    }
}
/**
 * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
 */
class PreDebugDrawEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(ctx, target) {
        super();
        this.ctx = ctx;
        this.target = target;
    }
}
/**
 * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
 */
class PostDebugDrawEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(ctx, target) {
        super();
        this.ctx = ctx;
        this.target = target;
    }
}
/**
 * The 'preupdate' event is emitted on actors, scenes, camera, and engine before the update starts.
 */
class PreUpdateEvent extends GameEvent {
    constructor(engine, delta, target) {
        super();
        this.engine = engine;
        this.delta = delta;
        this.target = target;
    }
}
/**
 * The 'postupdate' event is emitted on actors, scenes, camera, and engine after the update ends.
 */
class PostUpdateEvent extends GameEvent {
    constructor(engine, delta, target) {
        super();
        this.engine = engine;
        this.delta = delta;
        this.target = target;
    }
}
/**
 * The 'preframe' event is emitted on the engine, before the frame begins.
 */
class PreFrameEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(engine, prevStats) {
        super();
        this.engine = engine;
        this.prevStats = prevStats;
        this.target = engine;
    }
}
/**
 * The 'postframe' event is emitted on the engine, after a frame ends.
 */
class PostFrameEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(engine, stats) {
        super();
        this.engine = engine;
        this.stats = stats;
        this.target = engine;
    }
}
/**
 * Event received when a gamepad is connected to Excalibur. [[Gamepads]] receives this event.
 */
class GamepadConnectEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(index, gamepad) {
        super();
        this.index = index;
        this.gamepad = gamepad;
        this.target = gamepad;
    }
}
/**
 * Event received when a gamepad is disconnected from Excalibur. [[Gamepads]] receives this event.
 */
class GamepadDisconnectEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(index, gamepad) {
        super();
        this.index = index;
        this.gamepad = gamepad;
        this.target = gamepad;
    }
}
/**
 * Gamepad button event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
 */
class GamepadButtonEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    /**
     * @param button  The Gamepad button
     * @param value   A numeric value between 0 and 1
     */
    constructor(button, value, target) {
        super();
        this.button = button;
        this.value = value;
        this.target = target;
    }
}
/**
 * Gamepad axis event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
 */
class GamepadAxisEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    /**
     * @param axis  The Gamepad axis
     * @param value A numeric value between -1 and 1
     */
    constructor(axis, value, target) {
        super();
        this.axis = axis;
        this.value = value;
        this.target = target;
    }
}
/**
 * Subscribe event thrown when handlers for events other than subscribe are added. Meta event that is received by
 * [[EventDispatcher|event dispatchers]].
 */
class SubscribeEvent extends GameEvent {
    constructor(topic, handler) {
        super();
        this.topic = topic;
        this.handler = handler;
    }
}
/**
 * Unsubscribe event thrown when handlers for events other than unsubscribe are removed. Meta event that is received by
 * [[EventDispatcher|event dispatchers]].
 */
class UnsubscribeEvent extends GameEvent {
    constructor(topic, handler) {
        super();
        this.topic = topic;
        this.handler = handler;
    }
}
/**
 * Event received by the [[Engine]] when the browser window is visible on a screen.
 */
class VisibleEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * Event received by the [[Engine]] when the browser window is hidden from all screens.
 */
class HiddenEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * Event thrown on an [[Actor|actor]] when a collision will occur this frame if it resolves
 */
class PreCollisionEvent extends GameEvent {
    /**
     * @param actor         The actor the event was thrown on
     * @param other         The actor that will collided with the current actor
     * @param side          The side that will be collided with the current actor
     * @param intersection  Intersection vector
     */
    constructor(actor, other, side, intersection) {
        super();
        this.other = other;
        this.side = side;
        this.intersection = intersection;
        this.target = actor;
    }
}
/**
 * Event thrown on an [[Actor|actor]] when a collision has been resolved (body reacted) this frame
 */
class PostCollisionEvent extends GameEvent {
    /**
     * @param actor         The actor the event was thrown on
     * @param other         The actor that did collide with the current actor
     * @param side          The side that did collide with the current actor
     * @param intersection  Intersection vector
     */
    constructor(actor, other, side, intersection) {
        super();
        this.other = other;
        this.side = side;
        this.intersection = intersection;
        this.target = actor;
    }
    get actor() {
        return this.target;
    }
    set actor(actor) {
        this.target = actor;
    }
}
class ContactStartEvent {
    constructor(target, other, contact) {
        this.target = target;
        this.other = other;
        this.contact = contact;
    }
}
class ContactEndEvent {
    constructor(target, other) {
        this.target = target;
        this.other = other;
    }
}
class CollisionPreSolveEvent {
    constructor(target, other, side, intersection, contact) {
        this.target = target;
        this.other = other;
        this.side = side;
        this.intersection = intersection;
        this.contact = contact;
    }
}
class CollisionPostSolveEvent {
    constructor(target, other, side, intersection, contact) {
        this.target = target;
        this.other = other;
        this.side = side;
        this.intersection = intersection;
        this.contact = contact;
    }
}
/**
 * Event thrown the first time an [[Actor|actor]] collides with another, after an actor is in contact normal collision events are fired.
 */
class CollisionStartEvent extends GameEvent {
    /**
     *
     * @param actor
     * @param other
     * @param contact
     */
    constructor(actor, other, contact) {
        super();
        this.other = other;
        this.contact = contact;
        this.target = actor;
    }
    get actor() {
        return this.target;
    }
    set actor(actor) {
        this.target = actor;
    }
}
/**
 * Event thrown when the [[Actor|actor]] is no longer colliding with another
 */
class CollisionEndEvent extends GameEvent {
    /**
     *
     */
    constructor(actor, other) {
        super();
        this.other = other;
        this.target = actor;
    }
    get actor() {
        return this.target;
    }
    set actor(actor) {
        this.target = actor;
    }
}
/**
 * Event thrown on an [[Actor]] and a [[Scene]] only once before the first update call
 */
class InitializeEvent extends GameEvent {
    /**
     * @param engine  The reference to the current engine
     */
    constructor(engine, target) {
        super();
        this.engine = engine;
        this.target = target;
    }
}
/**
 * Event thrown on a [[Scene]] on activation
 */
class ActivateEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    /**
     * @param oldScene  The reference to the old scene
     */
    constructor(oldScene, target) {
        super();
        this.oldScene = oldScene;
        this.target = target;
    }
}
/**
 * Event thrown on a [[Scene]] on deactivation
 */
class DeactivateEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    /**
     * @param newScene  The reference to the new scene
     */
    constructor(newScene, target) {
        super();
        this.newScene = newScene;
        this.target = target;
    }
}
/**
 * Event thrown on an [[Actor]] when it completely leaves the screen.
 */
class ExitViewPortEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target) {
        super();
        this.target = target;
    }
}
/**
 * Event thrown on an [[Actor]] when it completely leaves the screen.
 */
class EnterViewPortEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target) {
        super();
        this.target = target;
    }
}
class EnterTriggerEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target, actor) {
        super();
        this.target = target;
        this.actor = actor;
    }
}
class ExitTriggerEvent extends (/* unused pure expression or super */ null && (GameEvent)) {
    constructor(target, actor) {
        super();
        this.target = target;
        this.actor = actor;
    }
}

;// CONCATENATED MODULE: ./EventDispatcher.ts

class EventDispatcher {
    constructor() {
        this._handlers = {};
        this._wiredEventDispatchers = [];
    }
    /**
     * Clears any existing handlers or wired event dispatchers on this event dispatcher
     */
    clear() {
        this._handlers = {};
        this._wiredEventDispatchers = [];
    }
    /**
     * Emits an event for target
     * @param eventName  The name of the event to publish
     * @param event      Optionally pass an event data object to the handler
     */
    emit(eventName, event) {
        if (!eventName) {
            // key not mapped
            return;
        }
        eventName = eventName.toLowerCase();
        if (!event) {
            event = new GameEvent();
        }
        let i, len;
        if (this._handlers[eventName]) {
            i = 0;
            len = this._handlers[eventName].length;
            for (i; i < len; i++) {
                this._handlers[eventName][i](event);
            }
        }
        i = 0;
        len = this._wiredEventDispatchers.length;
        for (i; i < len; i++) {
            this._wiredEventDispatchers[i].emit(eventName, event);
        }
    }
    /**
     * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
     * @param eventName  The name of the event to subscribe to
     * @param handler    The handler callback to fire on this event
     */
    on(eventName, handler) {
        eventName = eventName.toLowerCase();
        if (!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(handler);
        // meta event handlers
        if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
            this.emit('subscribe', new SubscribeEvent(eventName, handler));
        }
    }
    /**
     * Unsubscribe an event handler(s) from an event. If a specific handler
     * is specified for an event, only that handler will be unsubscribed.
     * Otherwise all handlers will be unsubscribed for that event.
     *
     * @param eventName  The name of the event to unsubscribe
     * @param handler    Optionally the specific handler to unsubscribe
     */
    off(eventName, handler) {
        eventName = eventName.toLowerCase();
        const eventHandlers = this._handlers[eventName];
        if (eventHandlers) {
            // if no explicit handler is give with the event name clear all handlers
            if (!handler) {
                this._handlers[eventName].length = 0;
            }
            else {
                const index = eventHandlers.indexOf(handler);
                this._handlers[eventName].splice(index, 1);
            }
        }
        // meta event handlers
        if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
            this.emit('unsubscribe', new UnsubscribeEvent(eventName, handler));
        }
    }
    /**
     * Once listens to an event one time, then unsubscribes from that event
     *
     * @param eventName The name of the event to subscribe to once
     * @param handler   The handler of the event that will be auto unsubscribed
     */
    once(eventName, handler) {
        const metaHandler = (event) => {
            const ev = event || new GameEvent();
            this.off(eventName, handler);
            handler(ev);
        };
        this.on(eventName, metaHandler);
    }
    /**
     * Wires this event dispatcher to also receive events from another
     */
    wire(eventDispatcher) {
        eventDispatcher._wiredEventDispatchers.push(this);
    }
    /**
     * Unwires this event dispatcher from another
     */
    unwire(eventDispatcher) {
        const index = eventDispatcher._wiredEventDispatchers.indexOf(this);
        if (index > -1) {
            eventDispatcher._wiredEventDispatchers.splice(index, 1);
        }
    }
}

;// CONCATENATED MODULE: ./Class.ts

/**
 * Excalibur base class that provides basic functionality such as [[EventDispatcher]]
 * and extending abilities for vanilla Javascript projects
 */
class Class {
    constructor() {
        this.eventDispatcher = new EventDispatcher();
    }
    /**
     * Alias for `addEventListener`. You can listen for a variety of
     * events off of the engine; see the events section below for a complete list.
     * @param eventName  Name of the event to listen for
     * @param handler    Event handler for the thrown event
     */
    on(eventName, handler) {
        this.eventDispatcher.on(eventName, handler);
    }
    /**
     * Alias for `removeEventListener`. If only the eventName is specified
     * it will remove all handlers registered for that specific event. If the eventName
     * and the handler instance are specified only that handler will be removed.
     *
     * @param eventName  Name of the event to listen for
     * @param handler    Event handler for the thrown event
     */
    off(eventName, handler) {
        this.eventDispatcher.off(eventName, handler);
    }
    /**
     * Emits a new event
     * @param eventName   Name of the event to emit
     * @param eventObject Data associated with this event
     */
    emit(eventName, eventObject) {
        this.eventDispatcher.emit(eventName, eventObject);
    }
    /**
     * Once listens to an event one time, then unsubscribes from that event
     *
     * @param eventName The name of the event to subscribe to once
     * @param handler   The handler of the event that will be auto unsubscribed
     */
    once(eventName, handler) {
        this.eventDispatcher.once(eventName, handler);
    }
}

;// CONCATENATED MODULE: ./Util/Util.ts

/**
 * Find the screen position of an HTML element
 */
function getPosition(el) {
    let oLeft = 0, oTop = 0;
    const calcOffsetLeft = (parent) => {
        oLeft += parent.offsetLeft;
        if (parent.offsetParent) {
            calcOffsetLeft(parent.offsetParent);
        }
    };
    const calcOffsetTop = (parent) => {
        oTop += parent.offsetTop;
        if (parent.offsetParent) {
            calcOffsetTop(parent.offsetParent);
        }
    };
    calcOffsetLeft(el);
    calcOffsetTop(el);
    return new Vector(oLeft, oTop);
}
/**
 * Add an item to an array list if it doesn't already exist. Returns true if added, false if not and already exists in the array.
 * @deprecated Will be removed in v0.26.0
 */
function addItemToArray(item, array) {
    if (array.indexOf(item) === -1) {
        array.push(item);
        return true;
    }
    return false;
}
/**
 * Remove an item from an list
 * @deprecated Will be removed in v0.26.0
 */
function removeItemFromArray(item, array) {
    let index = -1;
    if ((index = array.indexOf(item)) > -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}
/**
 * See if an array contains something
 */
function contains(array, obj) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}
/**
 * Used for exhaustive checks at compile time
 */
function fail(message) {
    throw new Error(message);
}
/**
 * Create a promise that resolves after a certain number of milliseconds
 *
 * It is strongly recommended you pass the excalibur clock so delays are bound to the
 * excalibur clock which would be unaffected by stop/pause.
 * @param milliseconds
 * @param clock
 */
function delay(milliseconds, clock) {
    var _a;
    const schedule = (_a = clock === null || clock === void 0 ? void 0 : clock.schedule.bind(clock)) !== null && _a !== void 0 ? _a : setTimeout;
    return new Promise(resolve => {
        schedule(() => {
            resolve();
        }, milliseconds);
    });
}

;// CONCATENATED MODULE: ./EntityComponentSystem/Entity.ts





/**
 * AddedComponent message
 */
class AddedComponent {
    constructor(data) {
        this.data = data;
        this.type = 'Component Added';
    }
}
/**
 * Type guard to know if message is f an Added Component
 */
function isAddedComponent(x) {
    return !!x && x.type === 'Component Added';
}
/**
 * RemovedComponent message
 */
class RemovedComponent {
    constructor(data) {
        this.data = data;
        this.type = 'Component Removed';
    }
}
/**
 * Type guard to know if message is for a Removed Component
 */
function isRemovedComponent(x) {
    return !!x && x.type === 'Component Removed';
}
/**
 * An Entity is the base type of anything that can have behavior in Excalibur, they are part of the built in entity component system
 *
 * Entities can be strongly typed with the components they contain
 *
 * ```typescript
 * const entity = new Entity<ComponentA | ComponentB>();
 * entity.components.a; // Type ComponentA
 * entity.components.b; // Type ComponentB
 * ```
 */
class Entity extends Class {
    constructor(components, name) {
        super();
        /**
         * The unique identifier for the entity
         */
        this.id = Entity._ID++;
        this._name = 'anonymous';
        /**
         * Whether this entity is active, if set to false it will be reclaimed
         */
        this.active = true;
        /**
         * Bucket to hold on to deferred removals
         */
        this._componentsToRemove = [];
        this._componentTypeToInstance = new Map();
        this._componentStringToInstance = new Map();
        this._tagsMemo = [];
        this._typesMemo = [];
        /**
         * Observable that keeps track of component add or remove changes on the entity
         */
        this.componentAdded$ = new Observable();
        this.componentRemoved$ = new Observable();
        this._parent = null;
        this.childrenAdded$ = new Observable();
        this.childrenRemoved$ = new Observable();
        this._children = [];
        this._isInitialized = false;
        this._setName(name);
        if (components) {
            for (const component of components) {
                this.addComponent(component);
            }
        }
    }
    _setName(name) {
        if (name) {
            this._name = name;
        }
    }
    get name() {
        return this._name;
    }
    get events() {
        return this.eventDispatcher;
    }
    /**
     * Kill the entity, means it will no longer be updated. Kills are deferred to the end of the update.
     */
    kill() {
        this.active = false;
    }
    isKilled() {
        return !this.active;
    }
    /**
     * Specifically get the tags on the entity from [[TagComponent]]
     */
    get tags() {
        return this._tagsMemo;
    }
    /**
     * Check if a tag exists on the entity
     * @param tag name to check for
     */
    hasTag(tag) {
        return this.tags.includes(tag);
    }
    /**
     * Adds a tag to an entity
     * @param tag
     * @returns Entity
     */
    addTag(tag) {
        return this.addComponent(new TagComponent(tag));
    }
    /**
     * Removes a tag on the entity
     *
     * Removals are deferred until the end of update
     * @param tag
     * @param force Remove component immediately, no deferred
     */
    removeTag(tag, force = false) {
        return this.removeComponent(tag, force);
    }
    /**
     * The types of the components on the Entity
     */
    get types() {
        return this._typesMemo;
    }
    _rebuildMemos() {
        this._tagsMemo = Array.from(this._componentStringToInstance.values())
            .filter((c) => c instanceof TagComponent)
            .map((c) => c.type);
        this._typesMemo = Array.from(this._componentStringToInstance.keys());
    }
    getComponents() {
        return Array.from(this._componentStringToInstance.values());
    }
    _notifyAddComponent(component) {
        this._rebuildMemos();
        const added = new AddedComponent({
            component,
            entity: this
        });
        this.componentAdded$.notifyAll(added);
    }
    _notifyRemoveComponent(component) {
        const removed = new RemovedComponent({
            component,
            entity: this
        });
        this.componentRemoved$.notifyAll(removed);
        this._rebuildMemos();
    }
    get parent() {
        return this._parent;
    }
    /**
     * Get the direct children of this entity
     */
    get children() {
        return this._children;
    }
    /**
     * Unparents this entity, if there is a parent. Otherwise it does nothing.
     */
    unparent() {
        if (this._parent) {
            this._parent.removeChild(this);
            this._parent = null;
        }
    }
    /**
     * Adds an entity to be a child of this entity
     * @param entity
     */
    addChild(entity) {
        if (entity.parent === null) {
            if (this.getAncestors().includes(entity)) {
                throw new Error('Cycle detected, cannot add entity');
            }
            this._children.push(entity);
            entity._parent = this;
            this.childrenAdded$.notifyAll(entity);
        }
        else {
            throw new Error('Entity already has a parent, cannot add without unparenting');
        }
        return this;
    }
    /**
     * Remove an entity from children if it exists
     * @param entity
     */
    removeChild(entity) {
        if (entity.parent === this) {
            removeItemFromArray(entity, this._children);
            entity._parent = null;
            this.childrenRemoved$.notifyAll(entity);
        }
        return this;
    }
    /**
     * Removes all children from this entity
     */
    removeAllChildren() {
        this.children.forEach((c) => {
            this.removeChild(c);
        });
        return this;
    }
    /**
     * Returns a list of parent entities starting with the topmost parent. Includes the current entity.
     */
    getAncestors() {
        const result = [this];
        let current = this.parent;
        while (current) {
            result.push(current);
            current = current.parent;
        }
        return result.reverse();
    }
    /**
     * Returns a list of all the entities that descend from this entity. Includes the current entity.
     */
    getDescendants() {
        let result = [this];
        let queue = [this];
        while (queue.length > 0) {
            const curr = queue.pop();
            queue = queue.concat(curr.children);
            result = result.concat(curr.children);
        }
        return result;
    }
    /**
     * Creates a deep copy of the entity and a copy of all its components
     */
    clone() {
        const newEntity = new Entity();
        for (const c of this.types) {
            newEntity.addComponent(this.get(c).clone());
        }
        for (const child of this.children) {
            newEntity.addChild(child.clone());
        }
        return newEntity;
    }
    /**
     * Adds a copy of all the components from another template entity as a "prefab"
     * @param templateEntity Entity to use as a template
     * @param force Force component replacement if it already exists on the target entity
     */
    addTemplate(templateEntity, force = false) {
        for (const c of templateEntity.getComponents()) {
            this.addComponent(c.clone(), force);
        }
        for (const child of templateEntity.children) {
            this.addChild(child.clone().addTemplate(child));
        }
        return this;
    }
    /**
     * Adds a component to the entity
     * @param component Component or Entity to add copy of components from
     * @param force Optionally overwrite any existing components of the same type
     */
    addComponent(component, force = false) {
        // if component already exists, skip if not forced
        if (this.has(component.type)) {
            if (force) {
                // Remove existing component type if exists when forced
                this.removeComponent(component);
            }
            else {
                // early exit component exits
                return this;
            }
        }
        // TODO circular dependencies will be a problem
        if (component.dependencies && component.dependencies.length) {
            for (const ctor of component.dependencies) {
                this.addComponent(new ctor());
            }
        }
        component.owner = this;
        const constuctorType = component.constructor;
        this._componentTypeToInstance.set(constuctorType, component);
        this._componentStringToInstance.set(component.type, component);
        if (component.onAdd) {
            component.onAdd(this);
        }
        this._notifyAddComponent(component);
        return this;
    }
    /**
     * Removes a component from the entity, by default removals are deferred to the end of entity update to avoid consistency issues
     *
     * Components can be force removed with the `force` flag, the removal is not deferred and happens immediately
     * @param componentOrType
     * @param force
     */
    removeComponent(componentOrType, force = false) {
        if (force) {
            if (typeof componentOrType === 'string') {
                this._removeComponentByType(componentOrType);
            }
            else if (componentOrType instanceof Component) {
                this._removeComponentByType(componentOrType.type);
            }
        }
        else {
            this._componentsToRemove.push(componentOrType);
        }
        return this;
    }
    _removeComponentByType(type) {
        if (this.has(type)) {
            const component = this.get(type);
            component.owner = null;
            if (component.onRemove) {
                component.onRemove(this);
            }
            const ctor = component.constructor;
            this._componentTypeToInstance.delete(ctor);
            this._componentStringToInstance.delete(component.type);
            this._notifyRemoveComponent(component);
        }
    }
    /**
     * @hidden
     * @internal
     */
    processComponentRemoval() {
        for (const componentOrType of this._componentsToRemove) {
            const type = typeof componentOrType === 'string' ? componentOrType : componentOrType.type;
            this._removeComponentByType(type);
        }
        this._componentsToRemove.length = 0;
    }
    has(type) {
        if (typeof type === 'string') {
            return this._componentStringToInstance.has(type);
        }
        else {
            return this._componentTypeToInstance.has(type);
        }
    }
    get(type) {
        if (typeof type === 'string') {
            return this._componentStringToInstance.get(type);
        }
        else {
            return this._componentTypeToInstance.get(type);
        }
    }
    /**
     * Gets whether the actor is Initialized
     */
    get isInitialized() {
        return this._isInitialized;
    }
    /**
     * Initializes this entity, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * @internal
     */
    _initialize(engine) {
        if (!this.isInitialized) {
            this.onInitialize(engine);
            super.emit('initialize', new InitializeEvent(engine, this));
            this._isInitialized = true;
        }
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
     * @internal
     */
    _preupdate(engine, delta) {
        this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
        this.onPreUpdate(engine, delta);
    }
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
     * @internal
     */
    _postupdate(engine, delta) {
        this.emit('postupdate', new PostUpdateEvent(engine, delta, this));
        this.onPostUpdate(engine, delta);
    }
    /**
     * `onInitialize` is called before the first update of the entity. This method is meant to be
     * overridden.
     *
     * Synonymous with the event handler `.on('initialize', (evt) => {...})`
     */
    onInitialize(_engine) {
        // Override me
    }
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before an entity is updated.
     */
    onPreUpdate(_engine, _delta) {
        // Override me
    }
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after an entity is updated.
     */
    onPostUpdate(_engine, _delta) {
        // Override me
    }
    /**
     *
     * Entity update lifecycle, called internally
     *
     * @internal
     * @param engine
     * @param delta
     */
    update(engine, delta) {
        this._initialize(engine);
        this._preupdate(engine, delta);
        for (const child of this.children) {
            child.update(engine, delta);
        }
        this._postupdate(engine, delta);
    }
}
Entity._ID = 0;

;// CONCATENATED MODULE: ./Math/vector.ts
/**
 * A 2D vector on a plane.
 */
class vector_Vector {
    /**
     * @param x  X component of the Vector
     * @param y  Y component of the Vector
     */
    constructor(x, y) {
        this._x = 0;
        this._y = 0;
        this._x = x;
        this._y = y;
    }
    /**
     * A (0, 0) vector
     */
    static get Zero() {
        return new vector_Vector(0, 0);
    }
    /**
     * A (1, 1) vector
     */
    static get One() {
        return new vector_Vector(1, 1);
    }
    /**
     * A (0.5, 0.5) vector
     */
    static get Half() {
        return new vector_Vector(0.5, 0.5);
    }
    /**
     * A unit vector pointing up (0, -1)
     */
    static get Up() {
        return new vector_Vector(0, -1);
    }
    /**
     * A unit vector pointing down (0, 1)
     */
    static get Down() {
        return new vector_Vector(0, 1);
    }
    /**
     * A unit vector pointing left (-1, 0)
     */
    static get Left() {
        return new vector_Vector(-1, 0);
    }
    /**
     * A unit vector pointing right (1, 0)
     */
    static get Right() {
        return new vector_Vector(1, 0);
    }
    /**
     * Returns a vector of unit length in the direction of the specified angle in Radians.
     * @param angle The angle to generate the vector
     */
    static fromAngle(angle) {
        return new vector_Vector(Math.cos(angle), Math.sin(angle));
    }
    /**
     * Checks if vector is not null, undefined, or if any of its components are NaN or Infinity.
     */
    static isValid(vec) {
        if (vec === null || vec === undefined) {
            return false;
        }
        if (isNaN(vec.x) || isNaN(vec.y)) {
            return false;
        }
        if (vec.x === Infinity || vec.y === Infinity || vec.x === -Infinity || vec.y === -Infinity) {
            return false;
        }
        return true;
    }
    /**
     * Calculates distance between two Vectors
     * @param vec1
     * @param vec2
     */
    static distance(vec1, vec2) {
        return Math.sqrt(Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2));
    }
    static min(vec1, vec2) {
        return new vector_Vector(Math.min(vec1.x, vec2.x), Math.min(vec1.y, vec2.y));
    }
    static max(vec1, vec2) {
        return new vector_Vector(Math.max(vec1.x, vec2.x), Math.max(vec1.y, vec2.y));
    }
    /**
     * Get the x component of the vector
     */
    get x() {
        return this._x;
    }
    /**
     * Set the x component, THIS MUTATES the current vector. It is usually better to create a new vector.
     * @warning **Be very careful setting components on shared vectors, mutating shared vectors can cause hard to find bugs**
     */
    set x(val) {
        this._x = val;
    }
    /**
     * Get the y component of the vector
     */
    get y() {
        return this._y;
    }
    /**
     * Set the y component, THIS MUTATES the current vector. It is usually better to create a new vector.
     * @warning **Be very careful setting components on shared vectors, mutating shared vectors can cause hard to find bugs**
     */
    set y(val) {
        this._y = val;
    }
    /**
     * Sets the x and y components at once, THIS MUTATES the current vector. It is usually better to create a new vector.
     *
     * @warning **Be very careful using this, mutating vectors can cause hard to find bugs**
     */
    setTo(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Compares this point against another and tests for equality
     * @param vector The other point to compare to
     * @param tolerance Amount of euclidean distance off we are willing to tolerate
     */
    equals(vector, tolerance = 0.001) {
        return Math.abs(this.x - vector.x) <= tolerance && Math.abs(this.y - vector.y) <= tolerance;
    }
    /**
     * The distance to another vector. If no other Vector is specified, this will return the [[magnitude]].
     * @param v  The other vector. Leave blank to use origin vector.
     */
    distance(v) {
        if (!v) {
            v = vector_Vector.Zero;
        }
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    }
    squareDistance(v) {
        if (!v) {
            v = vector_Vector.Zero;
        }
        return Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2);
    }
    /**
     * The size (magnitude) of the Vector
     */
    get size() {
        return this.distance();
    }
    /**
     * Setting the size mutates the current vector
     *
     * @warning Can be used to set the size of the vector, **be very careful using this, mutating vectors can cause hard to find bugs**
     */
    set size(newLength) {
        const v = this.normalize().scale(newLength);
        this.setTo(v.x, v.y);
    }
    /**
     * Normalizes a vector to have a magnitude of 1.
     */
    normalize() {
        const d = this.distance();
        if (d > 0) {
            return new vector_Vector(this.x / d, this.y / d);
        }
        else {
            return new vector_Vector(0, 1);
        }
    }
    /**
     * Returns the average (midpoint) between the current point and the specified
     */
    average(vec) {
        return this.add(vec).scale(0.5);
    }
    scale(sizeOrScale) {
        if (sizeOrScale instanceof vector_Vector) {
            return new vector_Vector(this.x * sizeOrScale.x, this.y * sizeOrScale.y);
        }
        else {
            return new vector_Vector(this.x * sizeOrScale, this.y * sizeOrScale);
        }
    }
    /**
     * Adds one vector to another
     * @param v The vector to add
     */
    add(v) {
        return new vector_Vector(this.x + v.x, this.y + v.y);
    }
    /**
     * Subtracts a vector from another, if you subtract vector `B.sub(A)` the resulting vector points from A -> B
     * @param v The vector to subtract
     */
    sub(v) {
        return new vector_Vector(this.x - v.x, this.y - v.y);
    }
    /**
     * Adds one vector to this one modifying the original
     * @param v The vector to add
     * @warning Be very careful using this, mutating vectors can cause hard to find bugs
     */
    addEqual(v) {
        this.setTo(this.x + v.x, this.y + v.y);
        return this;
    }
    /**
     * Subtracts a vector from this one modifying the original
     * @param v The vector to subtract
     * @warning Be very careful using this, mutating vectors can cause hard to find bugs
     */
    subEqual(v) {
        this.setTo(this.x - v.x, this.y - v.y);
        return this;
    }
    /**
     * Scales this vector by a factor of size and modifies the original
     * @warning Be very careful using this, mutating vectors can cause hard to find bugs
     */
    scaleEqual(size) {
        this.setTo(this.x * size, this.y * size);
        return this;
    }
    /**
     * Performs a dot product with another vector
     * @param v  The vector to dot
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    cross(v) {
        if (v instanceof vector_Vector) {
            return this.x * v.y - this.y * v.x;
        }
        else if (typeof v === 'number') {
            return new vector_Vector(v * this.y, -v * this.x);
        }
    }
    static cross(num, vec) {
        return new vector_Vector(-num * vec.y, num * vec.x);
    }
    /**
     * Returns the perpendicular vector to this one
     */
    perpendicular() {
        return new vector_Vector(this.y, -this.x);
    }
    /**
     * Returns the normal vector to this one, same as the perpendicular of length 1
     */
    normal() {
        return this.perpendicular().normalize();
    }
    /**
     * Negate the current vector
     */
    negate() {
        return this.scale(-1);
    }
    /**
     * Returns the angle of this vector.
     */
    toAngle() {
        return Math.atan2(this.y, this.x);
    }
    /**
     * Rotates the current vector around a point by a certain number of
     * degrees in radians
     */
    rotate(angle, anchor) {
        if (!anchor) {
            anchor = new vector_Vector(0, 0);
        }
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);
        const x = cosAngle * (this.x - anchor.x) - sinAngle * (this.y - anchor.y) + anchor.x;
        const y = sinAngle * (this.x - anchor.x) + cosAngle * (this.y - anchor.y) + anchor.y;
        return new vector_Vector(x, y);
    }
    /**
     * Creates new vector that has the same values as the previous.
     */
    clone() {
        return new vector_Vector(this.x, this.y);
    }
    /**
     * Returns a string representation of the vector.
     */
    toString(fixed) {
        if (fixed) {
            return `(${this.x.toFixed(fixed)}, ${this.y.toFixed(fixed)})`;
        }
        return `(${this.x}, ${this.y})`;
    }
}
/**
 * Shorthand for creating new Vectors - returns a new Vector instance with the
 * provided X and Y components.
 *
 * @param x  X component of the Vector
 * @param y  Y component of the Vector
 */
function vec(x, y) {
    return new vector_Vector(x, y);
}

;// CONCATENATED MODULE: ./Collision/CollisionType.ts
/**
 * An enum that describes the types of collisions bodies can participate in
 */
var CollisionType;
(function (CollisionType) {
    /**
     * Bodies with the `PreventCollision` setting do not participate in any
     * collisions and do not raise collision events.
     */
    CollisionType["PreventCollision"] = "PreventCollision";
    /**
     * Bodies with the `Passive` setting only raise collision events, but are not
     * influenced or moved by other bodies and do not influence or move other bodies.
     * This is useful for use in trigger type behavior.
     */
    CollisionType["Passive"] = "Passive";
    /**
     * Bodies with the `Active` setting raise collision events and participate
     * in collisions with other bodies and will be push or moved by bodies sharing
     * the `Active` or `Fixed` setting.
     */
    CollisionType["Active"] = "Active";
    /**
     * Bodies with the `Fixed` setting raise collision events and participate in
     * collisions with other bodies. Actors with the `Fixed` setting will not be
     * pushed or moved by other bodies sharing the `Fixed`. Think of Fixed
     * bodies as "immovable/unstoppable" objects. If two `Fixed` bodies meet they will
     * not be pushed or moved by each other, they will not interact except to throw
     * collision events.
     */
    CollisionType["Fixed"] = "Fixed";
})(CollisionType || (CollisionType = {}));

;// CONCATENATED MODULE: ./Flags.ts
/**
 * Flags is a feature flag implementation for Excalibur. They can only be operated **before [[Engine]] construction**
 * after which they are frozen and are read-only.
 *
 * Flags are used to enable experimental or preview features in Excalibur.
 */
class Flags {
    /**
     * Force excalibur to load the Canvas 2D graphics context fallback
     *
     * @warning not all features of excalibur are supported in the Canvas 2D fallback
     */
    static useCanvasGraphicsContext() {
        Flags.enable('use-canvas-context');
    }
    /**
     * Freeze all flag modifications making them readonly
     */
    static freeze() {
        Flags._FROZEN = true;
    }
    /**
     * Resets internal flag state, not meant to be called by users. Only used for testing.
     *
     * Calling this in your game is UNSUPPORTED
     * @internal
     */
    static _reset() {
        Flags._FROZEN = false;
        Flags._FLAGS = {};
    }
    /**
     * Enable a specific feature flag by name. **Note: can only be set before [[Engine]] constructor time**
     * @param flagName
     */
    static enable(flagName) {
        if (this._FROZEN) {
            throw Error('Feature flags can only be enabled before Engine constructor time');
        }
        Flags._FLAGS[flagName] = true;
    }
    /**
     * Disable a specific feature flag by name. **Note: can only be set before [[Engine]] constructor time**
     * @param flagName
     */
    static disable(flagName) {
        if (this._FROZEN) {
            throw Error('Feature flags can only be disabled before Engine constructor time');
        }
        Flags._FLAGS[flagName] = false;
    }
    /**
     * Check if a flag is enabled. If the flag is disabled or does not exist `false` is returned
     * @param flagName
     */
    static isEnabled(flagName) {
        return !!Flags._FLAGS[flagName];
    }
    /**
     * Show a list of currently known flags
     */
    static show() {
        return Object.keys(Flags._FLAGS);
    }
}
Flags._FROZEN = false;
Flags._FLAGS = {};

;// CONCATENATED MODULE: ./Util/Log.ts
/* eslint-disable no-console */
/**
 * Logging level that Excalibur will tag
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
    LogLevel[LogLevel["Fatal"] = 4] = "Fatal";
})(LogLevel || (LogLevel = {}));
/**
 * Static singleton that represents the logging facility for Excalibur.
 * Excalibur comes built-in with a [[ConsoleAppender]] and [[ScreenAppender]].
 * Derive from [[Appender]] to create your own logging appenders.
 */
class Logger {
    constructor() {
        this._appenders = [];
        /**
         * Gets or sets the default logging level. Excalibur will only log
         * messages if equal to or above this level. Default: [[LogLevel.Info]]
         */
        this.defaultLevel = LogLevel.Info;
        if (Logger._INSTANCE) {
            throw new Error('Logger is a singleton');
        }
        Logger._INSTANCE = this;
        // Default console appender
        Logger._INSTANCE.addAppender(new ConsoleAppender());
        return Logger._INSTANCE;
    }
    /**
     * Gets the current static instance of Logger
     */
    static getInstance() {
        if (Logger._INSTANCE == null) {
            Logger._INSTANCE = new Logger();
        }
        return Logger._INSTANCE;
    }
    /**
     * Adds a new [[Appender]] to the list of appenders to write to
     */
    addAppender(appender) {
        this._appenders.push(appender);
    }
    /**
     * Clears all appenders from the logger
     */
    clearAppenders() {
        this._appenders.length = 0;
    }
    /**
     * Logs a message at a given LogLevel
     * @param level  The LogLevel`to log the message at
     * @param args   An array of arguments to write to an appender
     */
    _log(level, args) {
        if (level == null) {
            level = this.defaultLevel;
        }
        const len = this._appenders.length;
        for (let i = 0; i < len; i++) {
            if (level >= this.defaultLevel) {
                this._appenders[i].log(level, args);
            }
        }
    }
    /**
     * Writes a log message at the [[LogLevel.Debug]] level
     * @param args  Accepts any number of arguments
     */
    debug(...args) {
        this._log(LogLevel.Debug, args);
    }
    /**
     * Writes a log message at the [[LogLevel.Info]] level
     * @param args  Accepts any number of arguments
     */
    info(...args) {
        this._log(LogLevel.Info, args);
    }
    /**
     * Writes a log message at the [[LogLevel.Warn]] level
     * @param args  Accepts any number of arguments
     */
    warn(...args) {
        this._log(LogLevel.Warn, args);
    }
    /**
     * Writes a log message at the [[LogLevel.Error]] level
     * @param args  Accepts any number of arguments
     */
    error(...args) {
        this._log(LogLevel.Error, args);
    }
    /**
     * Writes a log message at the [[LogLevel.Fatal]] level
     * @param args  Accepts any number of arguments
     */
    fatal(...args) {
        this._log(LogLevel.Fatal, args);
    }
}
Logger._INSTANCE = null;
/**
 * Console appender for browsers (i.e. `console.log`)
 */
class ConsoleAppender {
    /**
     * Logs a message at the given [[LogLevel]]
     * @param level  Level to log at
     * @param args   Arguments to log
     */
    log(level, args) {
        // Check for console support
        if (!console && !console.log && console.warn && console.error) {
            // todo maybe do something better than nothing
            return;
        }
        // Create a new console args array
        const consoleArgs = [];
        consoleArgs.unshift.apply(consoleArgs, args);
        consoleArgs.unshift('[' + LogLevel[level] + '] : ');
        if (level < LogLevel.Warn) {
            // Call .log for Debug/Info
            if (console.log.apply) {
                // this is required on some older browsers that don't support apply on console.log :(
                console.log.apply(console, consoleArgs);
            }
            else {
                console.log(consoleArgs.join(' '));
            }
        }
        else if (level < LogLevel.Error) {
            // Call .warn for Warn
            if (console.warn.apply) {
                console.warn.apply(console, consoleArgs);
            }
            else {
                console.warn(consoleArgs.join(' '));
            }
        }
        else {
            // Call .error for Error/Fatal
            if (console.error.apply) {
                console.error.apply(console, consoleArgs);
            }
            else {
                console.error(consoleArgs.join(' '));
            }
        }
    }
}
/**
 * On-screen (canvas) appender
 */
class ScreenAppender {
    /**
     * @param width   Width of the screen appender in pixels
     * @param height  Height of the screen appender in pixels
     */
    constructor(width, height) {
        // @todo Clean this up
        this._messages = [];
        this._canvas = document.createElement('canvas');
        this._canvas.width = width || window.innerWidth;
        this._canvas.height = height || window.innerHeight;
        this._canvas.style.position = 'absolute';
        // eslint-disable-next-line
        this._ctx = this._canvas.getContext('2d'); // eslint-disable-line
        document.body.appendChild(this._canvas);
    }
    /**
     * Logs a message at the given [[LogLevel]]
     * @param level  Level to log at
     * @param args   Arguments to log
     */
    log(level, args) {
        const message = args.join(',');
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._messages.unshift('[' + LogLevel[level] + '] : ' + message);
        let pos = 10;
        let opacity = 1.0;
        for (let i = 0; i < this._messages.length; i++) {
            this._ctx.fillStyle = 'rgba(255,255,255,' + opacity.toFixed(2) + ')';
            this._ctx.fillText(this._messages[i], 200, pos);
            pos += 10;
            opacity = opacity > 0 ? opacity - 0.05 : 0;
        }
    }
}

;// CONCATENATED MODULE: ./Util/Decorators.ts


const maxMessages = 5;
const obsoleteMessage = {};
const resetObsoleteCounter = () => {
    for (const message in obsoleteMessage) {
        obsoleteMessage[message] = 0;
    }
};
const logMessage = (message, options) => {
    const suppressObsoleteMessages = Flags.isEnabled('suppress-obsolete-message');
    if (obsoleteMessage[message] < maxMessages && !suppressObsoleteMessages) {
        Logger.getInstance().warn(message);
        // tslint:disable-next-line: no-console
        if (console.trace && options.showStackTrace) {
            // tslint:disable-next-line: no-console
            console.trace();
        }
    }
    obsoleteMessage[message]++;
};
/**
 * Obsolete decorator for marking Excalibur methods obsolete, you can optionally specify a custom message and/or alternate replacement
 * method do the deprecated one. Inspired by https://github.com/jayphelps/core-decorators.js
 */
function obsolete(options) {
    options = {
        message: 'This feature will be removed in future versions of Excalibur.',
        alternateMethod: null,
        showStackTrace: false,
        ...options
    };
    return function (target, property, descriptor) {
        if (descriptor &&
            !(typeof descriptor.value === 'function' || typeof descriptor.get === 'function' || typeof descriptor.set === 'function')) {
            throw new SyntaxError('Only classes/functions/getters/setters can be marked as obsolete');
        }
        const methodSignature = `${target.name || ''}${target.name && property ? '.' : ''}${property ? property : ''}`;
        const message = `${methodSignature} is marked obsolete: ${options.message}` +
            (options.alternateMethod ? ` Use ${options.alternateMethod} instead` : '');
        if (!obsoleteMessage[message]) {
            obsoleteMessage[message] = 0;
        }
        // If descriptor is null it is a class
        const method = descriptor ? { ...descriptor } : target;
        if (!descriptor) {
            // with es2015 classes we need to change our decoration tactic
            class DecoratedClass extends method {
                constructor(...args) {
                    logMessage(message, options);
                    super(...args);
                }
            }
            return DecoratedClass;
        }
        if (descriptor && descriptor.value) {
            method.value = function () {
                logMessage(message, options);
                return descriptor.value.apply(this, arguments);
            };
            return method;
        }
        if (descriptor && descriptor.get) {
            method.get = function () {
                logMessage(message, options);
                return descriptor.get.apply(this, arguments);
            };
        }
        if (descriptor && descriptor.set) {
            method.set = function () {
                logMessage(message, options);
                return descriptor.set.apply(this, arguments);
            };
        }
        return method;
    };
}

;// CONCATENATED MODULE: ./Collision/Physics.ts
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


/**
 * Possible collision resolution strategies
 *
 * The default is [[CollisionResolutionStrategy.Arcade]] which performs simple axis aligned arcade style physics. This is useful for things
 * like platformers or top down games.
 *
 * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.Realistic]] which allows for complicated
 * simulated physical interactions.
 */
var CollisionResolutionStrategy;
(function (CollisionResolutionStrategy) {
    CollisionResolutionStrategy["Arcade"] = "arcade";
    CollisionResolutionStrategy["Realistic"] = "realistic";
})(CollisionResolutionStrategy || (CollisionResolutionStrategy = {}));
/**
 * Possible broadphase collision pair identification strategies
 *
 * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
 * potential collision pairs which is O(nlog(n)) faster.
 */
var BroadphaseStrategy;
(function (BroadphaseStrategy) {
    BroadphaseStrategy[BroadphaseStrategy["DynamicAABBTree"] = 0] = "DynamicAABBTree";
})(BroadphaseStrategy || (BroadphaseStrategy = {}));
/**
 * Possible numerical integrators for position and velocity
 */
var Integrator;
(function (Integrator) {
    Integrator[Integrator["Euler"] = 0] = "Euler";
})(Integrator || (Integrator = {}));
/**
 * The [[Physics]] object is the global configuration object for all Excalibur physics.
 */
/* istanbul ignore next */
class Physics {
    static get gravity() {
        return Physics.acc;
    }
    static set gravity(v) {
        Physics.acc = v;
    }
    /**
     * Configures Excalibur to use "arcade" physics. Arcade physics which performs simple axis aligned arcade style physics.
     */
    static useArcadePhysics() {
        Physics.collisionResolutionStrategy = CollisionResolutionStrategy.Arcade;
    }
    /**
     * Configures Excalibur to use rigid body physics. Rigid body physics allows for complicated
     * simulated physical interactions.
     */
    static useRealisticPhysics() {
        Physics.collisionResolutionStrategy = CollisionResolutionStrategy.Realistic;
    }
    static get dynamicTreeVelocityMultiplyer() {
        return Physics.dynamicTreeVelocityMultiplier;
    }
    static set dynamicTreeVelocityMultiplyer(value) {
        Physics.dynamicTreeVelocityMultiplier = value;
    }
}
/**
 * Global acceleration that is applied to all vanilla actors that have a [[CollisionType.Active|active]] collision type.
 * Global acceleration won't effect [[Label|labels]], [[ScreenElement|ui actors]], or [[Trigger|triggers]] in Excalibur.
 *
 * This is a great way to globally simulate effects like gravity.
 */
Physics.acc = new vector_Vector(0, 0);
/**
 * Globally switches all Excalibur physics behavior on or off.
 */
Physics.enabled = true;
/**
 * Gets or sets the broadphase pair identification strategy.
 *
 * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
 * potential collision pairs which is O(nlog(n)) faster.
 */
Physics.broadphaseStrategy = BroadphaseStrategy.DynamicAABBTree;
/**
 * Gets or sets the global collision resolution strategy (narrowphase).
 *
 * The default is [[CollisionResolutionStrategy.Arcade]] which performs simple axis aligned arcade style physics.
 *
 * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.Realistic]] which allows for complicated
 * simulated physical interactions.
 */
Physics.collisionResolutionStrategy = CollisionResolutionStrategy.Arcade;
/**
 * The default mass to use if none is specified
 */
Physics.defaultMass = 10;
/**
 * Gets or sets the position and velocity positional integrator, currently only Euler is supported.
 */
Physics.integrator = Integrator.Euler;
/**
 * Factor to add to the RigidBody BoundingBox, bounding box (dimensions += vel * dynamicTreeVelocityMultiplier);
 */
Physics.dynamicTreeVelocityMultiplier = 2;
/**
 * Pad RigidBody BoundingBox by a constant amount
 */
Physics.boundsPadding = 5;
/**
 * Number of position iterations (overlap) to run in the solver
 */
Physics.positionIterations = 3;
/**
 * Number of velocity iteration (response) to run in the solver
 */
Physics.velocityIterations = 8;
/**
 * Amount of overlap to tolerate in pixels
 */
Physics.slop = 1;
/**
 * Amount of positional overlap correction to apply each position iteration of the solver
 * O - meaning no correction, 1 - meaning correct all overlap
 */
Physics.steeringFactor = 0.2;
/**
 * Warm start set to true re-uses impulses from previous frames back in the solver
 */
Physics.warmStart = true;
/**
 * By default bodies do not sleep
 */
Physics.bodiesCanSleepByDefault = false;
/**
 * Surface epsilon is used to help deal with surface penetration
 */
Physics.surfaceEpsilon = 0.1;
Physics.sleepEpsilon = 0.07;
Physics.wakeThreshold = Physics.sleepEpsilon * 3;
Physics.sleepBias = 0.9;
/**
 * Enable fast moving body checking, this enables checking for collision pairs via raycast for fast moving objects to prevent
 * bodies from tunneling through one another.
 */
Physics.checkForFastBodies = true;
/**
 * Disable minimum fast moving body raycast, by default if ex.Physics.checkForFastBodies = true Excalibur will only check if the
 * body is moving at least half of its minimum dimension in an update. If ex.Physics.disableMinimumSpeedForFastBody is set to true,
 * Excalibur will always perform the fast body raycast regardless of speed.
 */
Physics.disableMinimumSpeedForFastBody = false;
__decorate([
    obsolete({
        message: 'Alias for incorrect spelling used in older versions, will be removed in v0.25.0',
        alternateMethod: 'dynamicTreeVelocityMultiplier'
    })
], Physics, "dynamicTreeVelocityMultiplyer", null);

;// CONCATENATED MODULE: ./Math/coord-plane.ts
/**
 * Enum representing the coordinate plane for the position 2D vector in the [[TransformComponent]]
 */
var CoordPlane;
(function (CoordPlane) {
    /**
     * The world coordinate plane (default) represents world space, any entities drawn with world
     * space move when the camera moves.
     */
    CoordPlane["World"] = "world";
    /**
     * The screen coordinate plane represents screen space, entities drawn in screen space are pinned
     * to screen coordinates ignoring the camera.
     */
    CoordPlane["Screen"] = "screen";
})(CoordPlane || (CoordPlane = {}));

;// CONCATENATED MODULE: ./Util/Watch.ts
/**
 * Watch an object with a proxy, only fires if property value is different
 */
function watch(type, change) {
    if (!type) {
        return type;
    }
    if (type.__isProxy === undefined) {
        // expando hack to mark a proxy
        return new Proxy(type, {
            set: (obj, prop, value) => {
                // The default behavior to store the value
                if (obj[prop] !== value) {
                    obj[prop] = value;
                    // Avoid watching private junk
                    if (typeof prop === 'string') {
                        if (prop[0] !== '_') {
                            change(obj);
                        }
                    }
                }
                // Indicate success
                return true;
            },
            get: (obj, prop) => {
                if (prop !== '__isProxy') {
                    return obj[prop];
                }
                return true;
            }
        });
    }
    return type;
}
/**
 * Watch an object with a proxy, fires change on any property value change
 */
function watchAny(type, change) {
    if (!type) {
        return type;
    }
    if (type.__isProxy === undefined) {
        // expando hack to mark a proxy
        return new Proxy(type, {
            set: (obj, prop, value) => {
                // The default behavior to store the value
                obj[prop] = value;
                // Avoid watching private junk
                if (typeof prop === 'string') {
                    if (prop[0] !== '_') {
                        change(obj);
                    }
                }
                // Indicate success
                return true;
            },
            get: (obj, prop) => {
                if (prop !== '__isProxy') {
                    return obj[prop];
                }
                return true;
            }
        });
    }
    return type;
}

;// CONCATENATED MODULE: ./Math/util.ts

/**
 * Two PI constant
 */
const TwoPI = Math.PI * 2;
/**
 * Returns the fractional part of a number
 * @param x
 */
function frac(x) {
    if (x >= 0) {
        return x - Math.floor(x);
    }
    else {
        return x - Math.ceil(x);
    }
}
/**
 * Returns the sign of a number, if 0 returns 0
 */
function sign(val) {
    if (val === 0) {
        return 0;
    }
    return val < 0 ? -1 : 1;
}
;
/**
 * Clamps a value between a min and max inclusive
 */
function clamp(val, min, max) {
    return Math.min(Math.max(min, val), max);
}
/**
 * Convert an angle to be the equivalent in the range [0, 2PI]
 */
function canonicalizeAngle(angle) {
    let tmpAngle = angle;
    if (angle > TwoPI) {
        while (tmpAngle > TwoPI) {
            tmpAngle -= TwoPI;
        }
    }
    if (angle < 0) {
        while (tmpAngle < 0) {
            tmpAngle += TwoPI;
        }
    }
    return tmpAngle;
}
/**
 * Convert radians to degrees
 */
function toDegrees(radians) {
    return (180 / Math.PI) * radians;
}
/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
    return (degrees / 180) * Math.PI;
}
/**
 * Generate a range of numbers
 * For example: range(0, 5) -> [0, 1, 2, 3, 4, 5]
 * @param from inclusive
 * @param to inclusive
 */
const range = (from, to) => Array.from(new Array(to - from + 1), (_x, i) => i + from);
/**
 * Find a random floating point number in range
 */
function randomInRange(min, max, random = new Random()) {
    return random ? random.floating(min, max) : min + Math.random() * (max - min);
}
/**
 * Find a random integer in a range
 */
function randomIntInRange(min, max, random = new Random()) {
    return random ? random.integer(min, max) : Math.round(randomInRange(min, max));
}

;// CONCATENATED MODULE: ./Math/matrix.ts



var MatrixLocations;
(function (MatrixLocations) {
    MatrixLocations[MatrixLocations["X"] = 12] = "X";
    MatrixLocations[MatrixLocations["Y"] = 13] = "Y";
})(MatrixLocations || (MatrixLocations = {}));
/**
 * Excalibur Matrix helper for 4x4 matrices
 *
 * Useful for webgl 4x4 matrices
 */
class Matrix {
    constructor() {
        /**
         *  4x4 matrix in column major order
         *
         * |         |         |          |          |
         * | ------- | ------- | -------- | -------- |
         * | data[0] | data[4] | data[8]  | data[12] |
         * | data[1] | data[5] | data[9]  | data[13] |
         * | data[2] | data[6] | data[10] | data[14] |
         * | data[3] | data[7] | data[11] | data[15] |
         *
         */
        this.data = new Float32Array(16);
        this._scaleX = 1;
        this._scaleSignX = 1;
        this._scaleY = 1;
        this._scaleSignY = 1;
    }
    /**
     * Creates an orthographic (flat non-perspective) projection
     * https://en.wikipedia.org/wiki/Orthographic_projection
     * @param left
     * @param right
     * @param bottom
     * @param top
     * @param near
     * @param far
     */
    static ortho(left, right, bottom, top, near, far) {
        const mat = new Matrix();
        mat.data[0] = 2 / (right - left);
        mat.data[1] = 0;
        mat.data[2] = 0;
        mat.data[3] = 0;
        mat.data[4] = 0;
        mat.data[5] = 2 / (top - bottom);
        mat.data[6] = 0;
        mat.data[7] = 0;
        mat.data[8] = 0;
        mat.data[9] = 0;
        mat.data[10] = -2 / (far - near);
        mat.data[11] = 0;
        mat.data[12] = -(right + left) / (right - left);
        mat.data[13] = -(top + bottom) / (top - bottom);
        mat.data[14] = -(far + near) / (far - near);
        mat.data[15] = 1;
        return mat;
    }
    /**
     * Creates a new Matrix with the same data as the current 4x4
     */
    clone(dest) {
        const mat = dest || new Matrix();
        mat.data[0] = this.data[0];
        mat.data[1] = this.data[1];
        mat.data[2] = this.data[2];
        mat.data[3] = this.data[3];
        mat.data[4] = this.data[4];
        mat.data[5] = this.data[5];
        mat.data[6] = this.data[6];
        mat.data[7] = this.data[7];
        mat.data[8] = this.data[8];
        mat.data[9] = this.data[9];
        mat.data[10] = this.data[10];
        mat.data[11] = this.data[11];
        mat.data[12] = this.data[12];
        mat.data[13] = this.data[13];
        mat.data[14] = this.data[14];
        mat.data[15] = this.data[15];
        return mat;
    }
    /**
     * Converts the current matrix into a DOMMatrix
     *
     * This is useful when working with the browser Canvas context
     * @returns {DOMMatrix} DOMMatrix
     */
    toDOMMatrix() {
        return new DOMMatrix([...this.data]);
    }
    static fromFloat32Array(data) {
        const matrix = new Matrix();
        matrix.data = data;
        return matrix;
    }
    /**
     * Creates a new identity matrix (a matrix that when applied does nothing)
     */
    static identity() {
        const mat = new Matrix();
        mat.data[0] = 1;
        mat.data[1] = 0;
        mat.data[2] = 0;
        mat.data[3] = 0;
        mat.data[4] = 0;
        mat.data[5] = 1;
        mat.data[6] = 0;
        mat.data[7] = 0;
        mat.data[8] = 0;
        mat.data[9] = 0;
        mat.data[10] = 1;
        mat.data[11] = 0;
        mat.data[12] = 0;
        mat.data[13] = 0;
        mat.data[14] = 0;
        mat.data[15] = 1;
        return mat;
    }
    /**
     * Resets the current matrix to the identity matrix, mutating it
     * @returns {Matrix} Current matrix as identity
     */
    reset() {
        const mat = this;
        mat.data[0] = 1;
        mat.data[1] = 0;
        mat.data[2] = 0;
        mat.data[3] = 0;
        mat.data[4] = 0;
        mat.data[5] = 1;
        mat.data[6] = 0;
        mat.data[7] = 0;
        mat.data[8] = 0;
        mat.data[9] = 0;
        mat.data[10] = 1;
        mat.data[11] = 0;
        mat.data[12] = 0;
        mat.data[13] = 0;
        mat.data[14] = 0;
        mat.data[15] = 1;
        return mat;
    }
    /**
     * Creates a brand new translation matrix at the specified 3d point
     * @param x
     * @param y
     */
    static translation(x, y) {
        const mat = Matrix.identity();
        mat.data[12] = x;
        mat.data[13] = y;
        return mat;
    }
    /**
     * Creates a brand new scaling matrix with the specified scaling factor
     * @param sx
     * @param sy
     */
    static scale(sx, sy) {
        const mat = Matrix.identity();
        mat.data[0] = sx;
        mat.data[5] = sy;
        mat.data[10] = 1;
        mat.data[15] = 1;
        return mat;
    }
    /**
     * Creates a brand new rotation matrix with the specified angle
     * @param angleRadians
     */
    static rotation(angleRadians) {
        const mat = Matrix.identity();
        mat.data[0] = Math.cos(angleRadians);
        mat.data[4] = -Math.sin(angleRadians);
        mat.data[1] = Math.sin(angleRadians);
        mat.data[5] = Math.cos(angleRadians);
        return mat;
    }
    multiply(vectorOrMatrix, dest) {
        if (vectorOrMatrix instanceof vector_Vector) {
            const result = dest || new vector_Vector(0, 0);
            const vector = vectorOrMatrix;
            // these shenanigans are to allow dest and vector to be the same instance
            const resultX = vector.x * this.data[0] + vector.y * this.data[4] + this.data[12];
            const resultY = vector.x * this.data[1] + vector.y * this.data[5] + this.data[13];
            result.x = resultX;
            result.y = resultY;
            return result;
        }
        else {
            const result = dest || new Matrix();
            const other = vectorOrMatrix;
            const a11 = this.data[0];
            const a21 = this.data[1];
            const a31 = this.data[2];
            const a41 = this.data[3];
            const a12 = this.data[4];
            const a22 = this.data[5];
            const a32 = this.data[6];
            const a42 = this.data[7];
            const a13 = this.data[8];
            const a23 = this.data[9];
            const a33 = this.data[10];
            const a43 = this.data[11];
            const a14 = this.data[12];
            const a24 = this.data[13];
            const a34 = this.data[14];
            const a44 = this.data[15];
            const b11 = other.data[0];
            const b21 = other.data[1];
            const b31 = other.data[2];
            const b41 = other.data[3];
            const b12 = other.data[4];
            const b22 = other.data[5];
            const b32 = other.data[6];
            const b42 = other.data[7];
            const b13 = other.data[8];
            const b23 = other.data[9];
            const b33 = other.data[10];
            const b43 = other.data[11];
            const b14 = other.data[12];
            const b24 = other.data[13];
            const b34 = other.data[14];
            const b44 = other.data[15];
            result.data[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
            result.data[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
            result.data[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
            result.data[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
            result.data[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
            result.data[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
            result.data[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
            result.data[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
            result.data[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
            result.data[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
            result.data[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
            result.data[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
            result.data[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
            result.data[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
            result.data[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
            result.data[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
            const s = this.getScale();
            result._scaleSignX = sign(s.x) * sign(result._scaleSignX);
            result._scaleSignY = sign(s.y) * sign(result._scaleSignY);
            return result;
        }
    }
    /**
     * Applies translation to the current matrix mutating it
     * @param x
     * @param y
     */
    translate(x, y) {
        const a11 = this.data[0];
        const a21 = this.data[1];
        const a31 = this.data[2];
        const a41 = this.data[3];
        const a12 = this.data[4];
        const a22 = this.data[5];
        const a32 = this.data[6];
        const a42 = this.data[7];
        const a13 = this.data[8];
        const a23 = this.data[9];
        const a33 = this.data[10];
        const a43 = this.data[11];
        const a14 = this.data[12];
        const a24 = this.data[13];
        const a34 = this.data[14];
        const a44 = this.data[15];
        // Doesn't change z
        const z = 0;
        const w = 1;
        this.data[12] = a11 * x + a12 * y + a13 * z + a14 * w;
        this.data[13] = a21 * x + a22 * y + a23 * z + a24 * w;
        this.data[14] = a31 * x + a32 * y + a33 * z + a34 * w;
        this.data[15] = a41 * x + a42 * y + a43 * z + a44 * w;
        return this;
    }
    setPosition(x, y) {
        this.data[12] = x;
        this.data[13] = y;
    }
    getPosition() {
        return vec(this.data[12], this.data[13]);
    }
    /**
     * Applies rotation to the current matrix mutating it
     * @param angle in Radians
     */
    rotate(angle) {
        const a11 = this.data[0];
        const a21 = this.data[1];
        const a31 = this.data[2];
        const a41 = this.data[3];
        const a12 = this.data[4];
        const a22 = this.data[5];
        const a32 = this.data[6];
        const a42 = this.data[7];
        const sine = Math.sin(angle);
        const cosine = Math.cos(angle);
        this.data[0] = cosine * a11 + sine * a12;
        this.data[1] = cosine * a21 + sine * a22;
        this.data[2] = cosine * a31 + sine * a32;
        this.data[3] = cosine * a41 + sine * a42;
        this.data[4] = cosine * a12 - sine * a11;
        this.data[5] = cosine * a22 - sine * a21;
        this.data[6] = cosine * a32 - sine * a31;
        this.data[7] = cosine * a42 - sine * a41;
        return this;
    }
    /**
     * Applies scaling to the current matrix mutating it
     * @param x
     * @param y
     */
    scale(x, y) {
        const a11 = this.data[0];
        const a21 = this.data[1];
        const a31 = this.data[2];
        const a41 = this.data[3];
        const a12 = this.data[4];
        const a22 = this.data[5];
        const a32 = this.data[6];
        const a42 = this.data[7];
        this.data[0] = a11 * x;
        this.data[1] = a21 * x;
        this.data[2] = a31 * x;
        this.data[3] = a41 * x;
        this.data[4] = a12 * y;
        this.data[5] = a22 * y;
        this.data[6] = a32 * y;
        this.data[7] = a42 * y;
        return this;
    }
    setRotation(angle) {
        const currentScale = this.getScale();
        const sine = Math.sin(angle);
        const cosine = Math.cos(angle);
        this.data[0] = cosine * currentScale.x;
        this.data[1] = sine * currentScale.y;
        this.data[4] = -sine * currentScale.x;
        this.data[5] = cosine * currentScale.y;
    }
    getRotation() {
        const angle = Math.atan2(this.data[1] / this.getScaleY(), this.data[0] / this.getScaleX());
        return canonicalizeAngle(angle);
    }
    getScaleX() {
        return this._scaleX;
        // absolute scale of the matrix (we lose sign so need to add it back)
        // const xscale = vec(this.data[0], this.data[4]).size;
        // return this._scaleSignX * xscale;
    }
    getScaleY() {
        return this._scaleY;
        // absolute scale of the matrix (we lose sign so need to add it back)
        // const yscale = vec(this.data[1], this.data[5]).size;
        // return this._scaleSignY * yscale;
    }
    /**
     * Get the scale of the matrix
     */
    getScale() {
        return vec(this.getScaleX(), this.getScaleY());
    }
    setScaleX(val) {
        if (this._scaleX === val) {
            return;
        }
        this._scaleSignX = sign(val);
        // negative scale acts like a 180 rotation, so flip
        const xscale = vec(this.data[0] * this._scaleSignX, this.data[4] * this._scaleSignX).normalize();
        this.data[0] = xscale.x * val;
        this.data[4] = xscale.y * val;
        this._scaleX = val;
    }
    setScaleY(val) {
        if (this._scaleY === val) {
            return;
        }
        this._scaleSignY = sign(val);
        // negative scale acts like a 180 rotation, so flip
        const yscale = vec(this.data[1] * this._scaleSignY, this.data[5] * this._scaleSignY).normalize();
        this.data[1] = yscale.x * val;
        this.data[5] = yscale.y * val;
        this._scaleY;
    }
    setScale(scale) {
        this.setScaleX(scale.x);
        this.setScaleY(scale.y);
    }
    /**
     * Determinant of the upper left 2x2 matrix
     */
    getBasisDeterminant() {
        return this.data[0] * this.data[5] - this.data[1] * this.data[4];
    }
    /**
     * Return the affine inverse, optionally store it in a target matrix.
     *
     * It's recommended you call .reset() the target unless you know what you're doing
     * @param target
     */
    getAffineInverse(target) {
        // See http://negativeprobability.blogspot.com/2011/11/affine-transformations-and-their.html
        // See https://www.mathsisfun.com/algebra/matrix-inverse.html
        // Since we are actually only doing 2D transformations we can use this hack
        // We don't actually use the 3rd or 4th dimension
        const det = this.getBasisDeterminant();
        const inverseDet = 1 / det; // todo zero check
        const a = this.data[0];
        const b = this.data[4];
        const c = this.data[1];
        const d = this.data[5];
        const m = target || Matrix.identity();
        // inverts rotation and scale
        m.data[0] = d * inverseDet;
        m.data[1] = -c * inverseDet;
        m.data[4] = -b * inverseDet;
        m.data[5] = a * inverseDet;
        const tx = this.data[12];
        const ty = this.data[13];
        // invert translation
        // transform translation into the matrix basis created by rot/scale
        m.data[12] = -(tx * m.data[0] + ty * m.data[4]);
        m.data[13] = -(tx * m.data[1] + ty * m.data[5]);
        return m;
    }
    isIdentity() {
        return (this.data[0] === 1 &&
            this.data[1] === 0 &&
            this.data[2] === 0 &&
            this.data[3] === 0 &&
            this.data[4] === 0 &&
            this.data[5] === 1 &&
            this.data[6] === 0 &&
            this.data[7] === 0 &&
            this.data[8] === 0 &&
            this.data[9] === 0 &&
            this.data[10] === 1 &&
            this.data[11] === 0 &&
            this.data[12] === 0 &&
            this.data[13] === 0 &&
            this.data[14] === 0 &&
            this.data[15] === 1);
    }
    toString() {
        return `
[${this.data[0]} ${this.data[4]} ${this.data[8]} ${this.data[12]}]
[${this.data[1]} ${this.data[5]} ${this.data[9]} ${this.data[13]}]
[${this.data[2]} ${this.data[6]} ${this.data[10]} ${this.data[14]}]
[${this.data[3]} ${this.data[7]} ${this.data[11]} ${this.data[15]}]
`;
    }
}

;// CONCATENATED MODULE: ./Math/affine-matrix.ts



class AffineMatrix {
    constructor() {
        /**
         * |         |         |          |
         * | ------- | ------- | -------- |
         * | data[0] | data[2] | data[4]  |
         * | data[1] | data[3] | data[5]  |
         * |   0     |    0    |    1     |
         */
        this.data = new Float64Array(6);
        this._scale = new Float64Array([1, 1]);
        this._scaleSignX = 1;
        this._scaleSignY = 1;
    }
    /**
     * Converts the current matrix into a DOMMatrix
     *
     * This is useful when working with the browser Canvas context
     * @returns {DOMMatrix} DOMMatrix
     */
    toDOMMatrix() {
        return new DOMMatrix([...this.data]);
    }
    static identity() {
        const mat = new AffineMatrix();
        mat.data[0] = 1;
        mat.data[1] = 0;
        mat.data[2] = 0;
        mat.data[3] = 1;
        mat.data[4] = 0;
        mat.data[5] = 0;
        return mat;
    }
    /**
     * Creates a brand new translation matrix at the specified 3d point
     * @param x
     * @param y
     */
    static translation(x, y) {
        const mat = AffineMatrix.identity();
        mat.data[4] = x;
        mat.data[5] = y;
        return mat;
    }
    /**
     * Creates a brand new scaling matrix with the specified scaling factor
     * @param sx
     * @param sy
     */
    static scale(sx, sy) {
        const mat = AffineMatrix.identity();
        mat.data[0] = sx;
        mat.data[3] = sy;
        mat._scale[0] = sx;
        mat._scale[1] = sy;
        return mat;
    }
    /**
     * Creates a brand new rotation matrix with the specified angle
     * @param angleRadians
     */
    static rotation(angleRadians) {
        const mat = AffineMatrix.identity();
        mat.data[0] = Math.cos(angleRadians);
        mat.data[1] = Math.sin(angleRadians);
        mat.data[2] = -Math.sin(angleRadians);
        mat.data[3] = Math.cos(angleRadians);
        return mat;
    }
    setPosition(x, y) {
        this.data[4] = x;
        this.data[5] = y;
    }
    getPosition() {
        return vec(this.data[4], this.data[5]);
    }
    /**
     * Applies rotation to the current matrix mutating it
     * @param angle in Radians
     */
    rotate(angle) {
        const a11 = this.data[0];
        const a21 = this.data[1];
        const a12 = this.data[2];
        const a22 = this.data[3];
        const sine = Math.sin(angle);
        const cosine = Math.cos(angle);
        this.data[0] = cosine * a11 + sine * a12;
        this.data[1] = cosine * a21 + sine * a22;
        this.data[2] = cosine * a12 - sine * a11;
        this.data[3] = cosine * a22 - sine * a21;
        return this;
    }
    /**
     * Applies translation to the current matrix mutating it
     * @param x
     * @param y
     */
    translate(x, y) {
        const a11 = this.data[0];
        const a21 = this.data[1];
        // const a31 = 0;
        const a12 = this.data[2];
        const a22 = this.data[3];
        // const a32 = 0;
        const a13 = this.data[4];
        const a23 = this.data[5];
        // const a33 = 1;
        // Doesn't change z
        this.data[4] = a11 * x + a12 * y + a13;
        this.data[5] = a21 * x + a22 * y + a23;
        return this;
    }
    /**
     * Applies scaling to the current matrix mutating it
     * @param x
     * @param y
     */
    scale(x, y) {
        const a11 = this.data[0];
        const a21 = this.data[1];
        const a12 = this.data[2];
        const a22 = this.data[3];
        this.data[0] = a11 * x;
        this.data[1] = a21 * x;
        this.data[2] = a12 * y;
        this.data[3] = a22 * y;
        this._scale[0] = x;
        this._scale[1] = y;
        return this;
    }
    determinant() {
        return this.data[0] * this.data[3] - this.data[1] * this.data[2];
    }
    /**
     * Return the affine inverse, optionally store it in a target matrix.
     *
     * It's recommended you call .reset() the target unless you know what you're doing
     * @param target
     */
    inverse(target) {
        // See http://negativeprobability.blogspot.com/2011/11/affine-transformations-and-their.html
        // See https://www.mathsisfun.com/algebra/matrix-inverse.html
        // Since we are actually only doing 2D transformations we can use this hack
        // We don't actually use the 3rd or 4th dimension
        const det = this.determinant();
        const inverseDet = 1 / det; // TODO zero check
        const a = this.data[0];
        const b = this.data[2];
        const c = this.data[1];
        const d = this.data[3];
        const m = target || AffineMatrix.identity();
        // inverts rotation and scale
        m.data[0] = d * inverseDet;
        m.data[1] = -c * inverseDet;
        m.data[2] = -b * inverseDet;
        m.data[3] = a * inverseDet;
        const tx = this.data[4];
        const ty = this.data[5];
        // invert translation
        // transform translation into the matrix basis created by rot/scale
        m.data[4] = -(tx * m.data[0] + ty * m.data[2]);
        m.data[5] = -(tx * m.data[1] + ty * m.data[3]);
        return m;
    }
    multiply(vectorOrMatrix, dest) {
        if (vectorOrMatrix instanceof vector_Vector) {
            const result = dest || new vector_Vector(0, 0);
            const vector = vectorOrMatrix;
            // these shenanigans are to allow dest and vector to be the same instance
            const resultX = vector.x * this.data[0] + vector.y * this.data[2] + this.data[4];
            const resultY = vector.x * this.data[1] + vector.y * this.data[3] + this.data[5];
            result.x = resultX;
            result.y = resultY;
            return result;
        }
        else {
            const result = dest || new AffineMatrix();
            const other = vectorOrMatrix;
            const a11 = this.data[0];
            const a21 = this.data[1];
            //  const a31 = 0;
            const a12 = this.data[2];
            const a22 = this.data[3];
            //  const a32 = 0;
            const a13 = this.data[4];
            const a23 = this.data[5];
            //  const a33 = 1;
            const b11 = other.data[0];
            const b21 = other.data[1];
            //  const b31 = 0;
            const b12 = other.data[2];
            const b22 = other.data[3];
            //  const b32 = 0;
            const b13 = other.data[4];
            const b23 = other.data[5];
            //  const b33 = 1;
            result.data[0] = a11 * b11 + a12 * b21; // + a13 * b31; // zero
            result.data[1] = a21 * b11 + a22 * b21; // + a23 * b31; // zero
            result.data[2] = a11 * b12 + a12 * b22; // + a13 * b32; // zero
            result.data[3] = a21 * b12 + a22 * b22; // + a23 * b32; // zero
            result.data[4] = a11 * b13 + a12 * b23 + a13; // * b33; // one
            result.data[5] = a21 * b13 + a22 * b23 + a23; // * b33; // one
            const s = this.getScale();
            result._scaleSignX = sign(s.x) * sign(result._scaleSignX);
            result._scaleSignY = sign(s.y) * sign(result._scaleSignY);
            return result;
        }
    }
    to4x4() {
        const mat = new Matrix();
        mat.data[0] = this.data[0];
        mat.data[1] = this.data[1];
        mat.data[2] = 0;
        mat.data[3] = 0;
        mat.data[4] = this.data[2];
        mat.data[5] = this.data[3];
        mat.data[6] = 0;
        mat.data[7] = 0;
        mat.data[8] = 0;
        mat.data[9] = 0;
        mat.data[10] = 1;
        mat.data[11] = 0;
        mat.data[12] = this.data[4];
        mat.data[13] = this.data[5];
        mat.data[14] = 0;
        mat.data[15] = 1;
        return mat;
    }
    setRotation(angle) {
        const currentScale = this.getScale();
        const sine = Math.sin(angle);
        const cosine = Math.cos(angle);
        this.data[0] = cosine * currentScale.x;
        this.data[1] = sine * currentScale.y;
        this.data[2] = -sine * currentScale.x;
        this.data[3] = cosine * currentScale.y;
    }
    getRotation() {
        const angle = Math.atan2(this.data[1] / this.getScaleY(), this.data[0] / this.getScaleX());
        return canonicalizeAngle(angle);
    }
    getScaleX() {
        return this._scale[0];
        // absolute scale of the matrix (we lose sign so need to add it back)
        // const xscale = vec(this.data[0], this.data[2]).size;
        // return this._scaleSignX * xscale;
    }
    getScaleY() {
        return this._scale[1];
        // absolute scale of the matrix (we lose sign so need to add it back)
        // const yscale = vec(this.data[1], this.data[3]).size;
        // return this._scaleSignY * yscale;
    }
    /**
     * Get the scale of the matrix
     */
    getScale() {
        return vec(this.getScaleX(), this.getScaleY());
    }
    setScaleX(val) {
        if (val === this._scale[0]) {
            return;
        }
        this._scaleSignX = sign(val);
        // negative scale acts like a 180 rotation, so flip
        const xscale = vec(this.data[0] * this._scaleSignX, this.data[2] * this._scaleSignX).normalize();
        this.data[0] = xscale.x * val;
        this.data[2] = xscale.y * val;
        this._scale[0] = val;
    }
    setScaleY(val) {
        if (val === this._scale[1]) {
            return;
        }
        this._scaleSignY = sign(val);
        // negative scale acts like a 180 rotation, so flip
        const yscale = vec(this.data[1] * this._scaleSignY, this.data[3] * this._scaleSignY).normalize();
        this.data[1] = yscale.x * val;
        this.data[3] = yscale.y * val;
        this._scale[1] = val;
    }
    setScale(scale) {
        this.setScaleX(scale.x);
        this.setScaleY(scale.y);
    }
    isIdentity() {
        return (this.data[0] === 1 &&
            this.data[1] === 0 &&
            this.data[2] === 0 &&
            this.data[3] === 1 &&
            this.data[4] === 0 &&
            this.data[5] === 0);
    }
    /**
   * Resets the current matrix to the identity matrix, mutating it
   * @returns {AffineMatrix} Current matrix as identity
   */
    reset() {
        const mat = this;
        mat.data[0] = 1;
        mat.data[1] = 0;
        mat.data[2] = 0;
        mat.data[3] = 1;
        mat.data[4] = 0;
        mat.data[5] = 0;
        return mat;
    }
    /**
     * Creates a new Matrix with the same data as the current 4x4
     */
    clone(dest) {
        const mat = dest || new AffineMatrix();
        mat.data[0] = this.data[0];
        mat.data[1] = this.data[1];
        mat.data[2] = this.data[2];
        mat.data[3] = this.data[3];
        mat.data[4] = this.data[4];
        mat.data[5] = this.data[5];
        return mat;
    }
    toString() {
        return `
[${this.data[0]} ${this.data[2]} ${this.data[4]}]
[${this.data[1]} ${this.data[3]} ${this.data[5]}]
[0 0 1]
`;
    }
}

;// CONCATENATED MODULE: ./Math/transform.ts



class Transform {
    constructor(matrix) {
        this._parent = null;
        this.children = [];
        this._pos = vec(0, 0);
        this._rotation = 0;
        this._scale = vec(1, 1);
        this._isDirty = false;
        this._isInverseDirty = false;
        this._matrix = AffineMatrix.identity();
        this._inverse = AffineMatrix.identity();
        if (matrix) {
            this.pos = matrix.getPosition();
            this.rotation = matrix.getRotation();
            this.scale = matrix.getScale();
        }
    }
    get parent() {
        return this._parent;
    }
    set parent(transform) {
        if (this._parent) {
            const index = this._parent.children.indexOf(this);
            if (index > -1) {
                this._parent.children.splice(index, 1);
            }
        }
        this._parent = transform;
        if (this._parent) {
            this._parent.children.push(this);
        }
        this.flagDirty();
    }
    set pos(v) {
        this._pos = v; // TODO watch(v, () => this.flagDirty());
        this.flagDirty();
    }
    get pos() {
        return this._pos;
    }
    set globalPos(v) {
        let localPos = v;
        if (this.parent) {
            localPos = this.inverse.multiply(v);
        }
        this._pos = watch(localPos, () => this.flagDirty());
        this.flagDirty();
    }
    get globalPos() {
        if (this.parent) {
            return this.matrix.getPosition();
        }
        return this.pos;
    }
    set rotation(rotation) {
        this._rotation = rotation;
        this.flagDirty();
    }
    get rotation() {
        return this._rotation;
    }
    set globalRotation(rotation) {
        let inverseRotation = 0;
        if (this.parent) {
            inverseRotation = this.parent.globalRotation;
        }
        this._rotation = rotation - inverseRotation;
    }
    get globalRotation() {
        if (this.parent) {
            return this.matrix.getRotation();
        }
        return this.rotation;
    }
    set scale(v) {
        this._scale = watch(v, () => this.flagDirty());
        this.flagDirty();
    }
    get scale() {
        return this._scale;
    }
    set globalScale(v) {
        let inverseScale = vec(1, 1);
        if (this.parent) {
            inverseScale = this.parent.globalScale;
        }
        this.scale = v.scale(vec(1 / inverseScale.x, 1 / inverseScale.y));
    }
    get globalScale() {
        if (this.parent) {
            return this.matrix.getScale();
        }
        return this.scale;
    }
    get matrix() {
        if (this._isDirty) {
            if (this.parent === null) {
                this._matrix = this._calculateMatrix();
            }
            else {
                this._matrix = this.parent.matrix.multiply(this._calculateMatrix());
            }
            this._isDirty = false;
        }
        return this._matrix;
    }
    get inverse() {
        if (this._isInverseDirty) {
            this._inverse = this.matrix.inverse();
            this._isInverseDirty = false;
        }
        return this._inverse;
    }
    _calculateMatrix() {
        const matrix = this._matrix; //new AffineMatrix();
        // todo not positive this is correct
        const sine = Math.sin(this.rotation);
        const cosine = Math.cos(this.rotation);
        matrix.data[0] = this.scale.x * cosine;
        matrix.data[1] = sine;
        matrix.data[2] = -sine;
        matrix.data[3] = this.scale.y * cosine;
        matrix.data[4] = this.pos.x;
        matrix.data[5] = this.pos.y;
        return matrix;
        // const matrix = AffineMatrix.identity()
        //   .translate(this.pos.x, this.pos.y)
        //   .rotate(this.rotation)
        //   .scale(this.scale.x, this.scale.y);
        // return matrix;
    }
    flagDirty() {
        this._isDirty = true;
        this._isInverseDirty = true;
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].flagDirty();
        }
    }
    apply(point) {
        return this.matrix.multiply(point);
    }
    applyInverse(point) {
        return this.inverse.multiply(point);
    }
}

;// CONCATENATED MODULE: ./EntityComponentSystem/Components/TransformComponent.ts




class TransformComponent extends Component {
    constructor() {
        super(...arguments);
        this.type = 'ex.transform';
        this._transform = new Transform();
        this._addChildTransform = (child) => {
            const childTxComponent = child.get(TransformComponent);
            if (childTxComponent) {
                childTxComponent._transform.parent = this._transform;
            }
        };
        /**
         * Observable that emits when the z index changes on this component
         */
        this.zIndexChanged$ = new Observable();
        this._z = 0;
        /**
         * The [[CoordPlane|coordinate plane|]] for this transform for the entity.
         */
        this.coordPlane = CoordPlane.World;
        /**
       * Observable that notifies when the position changes
       */
        this.posChanged$ = new Observable(); // TODO this is expensive
    }
    get() {
        return this._transform;
    }
    onAdd(owner) {
        for (let child of owner.children) {
            this._addChildTransform(child);
        }
        owner.childrenAdded$.subscribe(child => this._addChildTransform(child));
        owner.childrenRemoved$.subscribe(child => {
            const childTxComponent = child.get(TransformComponent);
            if (childTxComponent) {
                childTxComponent._transform.parent = null;
            }
        });
    }
    onRemove(_previousOwner) {
        this._transform.parent = null;
    }
    /**
     * The z-index ordering of the entity, a higher values are drawn on top of lower values.
     * For example z=99 would be drawn on top of z=0.
     */
    get z() {
        return this._z;
    }
    set z(val) {
        const oldz = this._z;
        this._z = val;
        if (oldz !== val) {
            this.zIndexChanged$.notifyAll(val);
        }
    }
    get pos() {
        return this._transform.pos;
    }
    set pos(v) {
        this._transform.pos = v;
        // this.posChanged$.notifyAll(v);
    }
    get globalPos() {
        return this._transform.globalPos;
    }
    set globalPos(v) {
        this._transform.globalPos = v;
        // this.posChanged$.notifyAll(v);
    }
    get rotation() {
        return this._transform.rotation;
    }
    set rotation(rotation) {
        this._transform.rotation = rotation;
    }
    get globalRotation() {
        return this._transform.globalRotation;
    }
    set globalRotation(rotation) {
        this._transform.globalRotation = rotation;
    }
    get scale() {
        return this._transform.scale;
    }
    set scale(v) {
        this._transform.scale = v;
    }
    get globalScale() {
        return this._transform.globalScale;
    }
    set globalScale(v) {
        this._transform.globalScale = v;
    }
    applyInverse(v) {
        return this._transform.applyInverse(v);
    }
    apply(v) {
        return this._transform.apply(v);
    }
}

;// CONCATENATED MODULE: ./EntityComponentSystem/Components/MotionComponent.ts


class MotionComponent extends Component {
    constructor() {
        super(...arguments);
        this.type = 'ex.motion';
        /**
         * The velocity of an entity in pixels per second
         */
        this.vel = vector_Vector.Zero;
        /**
         * The acceleration of entity in pixels per second^2
         */
        this.acc = vector_Vector.Zero;
        /**
         * The scale rate of change in scale units per second
         */
        this.scaleFactor = vector_Vector.Zero;
        /**
         * The angular velocity which is how quickly the entity is rotating in radians per second
         */
        this.angularVelocity = 0;
        /**
         * The amount of torque applied to the entity, angular acceleration is torque * inertia
         */
        this.torque = 0;
        /**
         * Inertia can be thought of as the resistance to motion
         */
        this.inertia = 1;
    }
}

;// CONCATENATED MODULE: ./Collision/Group/CollisionGroup.ts
/**
 * CollisionGroups indicate like members that do not collide with each other. Use [[CollisionGroupManager]] to create [[CollisionGroup]]s
 *
 * For example:
 *
 * Players have collision group "player"
 *
 * ![Player Collision Group](/assets/images/docs/CollisionGroupsPlayer.png)
 *
 * Enemies have collision group "enemy"
 *
 * ![Enemy Collision Group](/assets/images/docs/CollisionGroupsEnemy.png)
 *
 * Blocks have collision group "ground"
 *
 * ![Ground collision group](/assets/images/docs/CollisionGroupsGround.png)
 *
 * Players don't collide with each other, but enemies and blocks. Likewise, enemies don't collide with each other but collide
 * with players and blocks.
 *
 * This is done with bitmasking, see the following pseudo-code
 *
 * PlayerGroup = `0b001`
 * PlayerGroupMask = `0b110`
 *
 * EnemyGroup = `0b010`
 * EnemyGroupMask = `0b101`
 *
 * BlockGroup = `0b100`
 * BlockGroupMask = `0b011`
 *
 * Should Players collide? No because the bitwise mask evaluates to 0
 * `(player1.group & player2.mask) === 0`
 * `(0b001 & 0b110) === 0`
 *
 * Should Players and Enemies collide? Yes because the bitwise mask is non-zero
 * `(player1.group & enemy1.mask) === 1`
 * `(0b001 & 0b101) === 1`
 *
 * Should Players and Blocks collide? Yes because the bitwise mask is non-zero
 * `(player1.group & blocks1.mask) === 1`
 * `(0b001 & 0b011) === 1`
 */
class CollisionGroup {
    /**
     * STOP!!** It is preferred that [[CollisionGroupManager.create]] is used to create collision groups
     *  unless you know how to construct the proper bitmasks. See https://github.com/excaliburjs/Excalibur/issues/1091 for more info.
     * @param name Name of the collision group
     * @param category 32 bit category for the group, should be a unique power of 2. For example `0b001` or `0b010`
     * @param mask 32 bit mask of category, or `~category` generally. For a category of `0b001`, the mask would be `0b110`
     */
    constructor(name, category, mask) {
        this._name = name;
        this._category = category;
        this._mask = mask;
    }
    /**
     * Get the name of the collision group
     */
    get name() {
        return this._name;
    }
    /**
     * Get the category of the collision group, a 32 bit number which should be a unique power of 2
     */
    get category() {
        return this._category;
    }
    /**
     * Get the mask for this collision group
     */
    get mask() {
        return this._mask;
    }
    /**
     * Evaluates whether 2 collision groups can collide
     * @param other  CollisionGroup
     */
    canCollide(other) {
        return (this.category & other.mask) !== 0 && (other.category & this.mask) !== 0;
    }
    /**
     * Inverts the collision group. For example, if before the group specified "players",
     * inverting would specify all groups except players
     * @returns CollisionGroup
     */
    invert() {
        return new CollisionGroup('~(' + this.name + ')', ~this.category, ~this.mask);
    }
    /**
     * Combine collision groups with each other. The new group includes all of the previous groups.
     *
     * @param collisionGroups
     */
    static combine(collisionGroups) {
        const combinedName = collisionGroups.map((c) => c.name).join('+');
        const combinedCategory = collisionGroups.reduce((current, g) => g.category | current, 0b0);
        const combinedMask = ~combinedCategory;
        return new CollisionGroup(combinedName, combinedCategory, combinedMask);
    }
    /**
     * Creates a collision group that collides with the listed groups
     * @param collisionGroups
     */
    static collidesWith(collisionGroups) {
        return CollisionGroup.combine(collisionGroups).invert();
    }
}
/**
 * The `All` [[CollisionGroup]] is a special group that collides with all other groups including itself,
 * it is the default collision group on colliders.
 */
CollisionGroup.All = new CollisionGroup('Collide with all groups', -1, -1);

;// CONCATENATED MODULE: ./Id.ts
/**
 * Create a branded ID type from a number
 */
function createId(type, value) {
    return { type, value };
}
;

;// CONCATENATED MODULE: ./Color.ts
/**
 * Provides standard colors (e.g. [[Color.Black]])
 * but you can also create custom colors using RGB, HSL, or Hex. Also provides
 * useful color operations like [[Color.lighten]], [[Color.darken]], and more.
 */
class Color {
    /**
     * Creates a new instance of Color from an r, g, b, a
     *
     * @param r  The red component of color (0-255)
     * @param g  The green component of color (0-255)
     * @param b  The blue component of color (0-255)
     * @param a  The alpha component of color (0-1.0)
     */
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a != null ? a : 1;
    }
    /**
     * Creates a new instance of Color from an r, g, b, a
     *
     * @param r  The red component of color (0-255)
     * @param g  The green component of color (0-255)
     * @param b  The blue component of color (0-255)
     * @param a  The alpha component of color (0-1.0)
     */
    static fromRGB(r, g, b, a) {
        return new Color(r, g, b, a);
    }
    /**
     * Creates a new instance of Color from a rgb string
     *
     * @param string  CSS color string of the form rgba(255, 255, 255, 1) or rgb(255, 255, 255)
     */
    static fromRGBString(string) {
        const rgbaRegEx = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/i;
        let match = null;
        if ((match = string.match(rgbaRegEx))) {
            const r = parseInt(match[1], 10);
            const g = parseInt(match[2], 10);
            const b = parseInt(match[3], 10);
            let a = 1;
            if (match[4]) {
                a = parseFloat(match[4]);
            }
            return new Color(r, g, b, a);
        }
        else {
            throw new Error('Invalid rgb/a string: ' + string);
        }
    }
    /**
     * Creates a new instance of Color from a hex string
     *
     * @param hex  CSS color string of the form #ffffff, the alpha component is optional
     */
    static fromHex(hex) {
        const hexRegEx = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
        let match = null;
        if ((match = hex.match(hexRegEx))) {
            const r = parseInt(match[1], 16);
            const g = parseInt(match[2], 16);
            const b = parseInt(match[3], 16);
            let a = 1;
            if (match[4]) {
                a = parseInt(match[4], 16) / 255;
            }
            return new Color(r, g, b, a);
        }
        else {
            throw new Error('Invalid hex string: ' + hex);
        }
    }
    /**
     * Creates a new instance of Color from hsla values
     *
     * @param h  Hue is represented [0-1]
     * @param s  Saturation is represented [0-1]
     * @param l  Luminance is represented [0-1]
     * @param a  Alpha is represented [0-1]
     */
    static fromHSL(h, s, l, a = 1.0) {
        const temp = new HSLColor(h, s, l, a);
        return temp.toRGBA();
    }
    /**
     * Lightens the current color by a specified amount
     *
     * @param factor  The amount to lighten by [0-1]
     */
    lighten(factor = 0.1) {
        const temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
        temp.l += (1 - temp.l) * factor;
        return temp.toRGBA();
    }
    /**
     * Darkens the current color by a specified amount
     *
     * @param factor  The amount to darken by [0-1]
     */
    darken(factor = 0.1) {
        const temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
        temp.l -= temp.l * factor;
        return temp.toRGBA();
    }
    /**
     * Saturates the current color by a specified amount
     *
     * @param factor  The amount to saturate by [0-1]
     */
    saturate(factor = 0.1) {
        const temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
        temp.s += temp.s * factor;
        return temp.toRGBA();
    }
    /**
     * Desaturates the current color by a specified amount
     *
     * @param factor  The amount to desaturate by [0-1]
     */
    desaturate(factor = 0.1) {
        const temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
        temp.s -= temp.s * factor;
        return temp.toRGBA();
    }
    /**
     * Multiplies a color by another, results in a darker color
     *
     * @param color  The other color
     */
    multiply(color) {
        const newR = (((color.r / 255) * this.r) / 255) * 255;
        const newG = (((color.g / 255) * this.g) / 255) * 255;
        const newB = (((color.b / 255) * this.b) / 255) * 255;
        const newA = color.a * this.a;
        return new Color(newR, newG, newB, newA);
    }
    /**
     * Screens a color by another, results in a lighter color
     *
     * @param color  The other color
     */
    screen(color) {
        const color1 = color.invert();
        const color2 = color.invert();
        return color1.multiply(color2).invert();
    }
    /**
     * Inverts the current color
     */
    invert() {
        return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1.0 - this.a);
    }
    /**
     * Averages the current color with another
     *
     * @param color  The other color
     */
    average(color) {
        const newR = (color.r + this.r) / 2;
        const newG = (color.g + this.g) / 2;
        const newB = (color.b + this.b) / 2;
        const newA = (color.a + this.a) / 2;
        return new Color(newR, newG, newB, newA);
    }
    equal(color) {
        return this.toString() === color.toString();
    }
    /**
     * Returns a CSS string representation of a color.
     *
     * @param format Color representation, accepts: rgb, hsl, or hex
     */
    toString(format = 'rgb') {
        switch (format) {
            case 'rgb':
                return this.toRGBA();
            case 'hsl':
                return this.toHSLA();
            case 'hex':
                return this.toHex();
            default:
                throw new Error('Invalid Color format');
        }
    }
    /**
     * Returns Hex Value of a color component
     * @param c color component
     * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     */
    _componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
    /**
     * Return Hex representation of a color.
     */
    toHex() {
        return '#' + this._componentToHex(this.r) + this._componentToHex(this.g) + this._componentToHex(this.b);
    }
    /**
     * Return RGBA representation of a color.
     */
    toRGBA() {
        const result = String(this.r.toFixed(0)) + ', ' + String(this.g.toFixed(0)) + ', ' + String(this.b.toFixed(0));
        if (this.a !== undefined || this.a !== null) {
            return 'rgba(' + result + ', ' + String(this.a) + ')';
        }
        return 'rgb(' + result + ')';
    }
    /**
     * Return HSLA representation of a color.
     */
    toHSLA() {
        return HSLColor.fromRGBA(this.r, this.g, this.b, this.a).toString();
    }
    /**
     * Returns a CSS string representation of a color.
     */
    fillStyle() {
        return this.toString();
    }
    /**
     * Returns a clone of the current color.
     */
    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }
    /**
     * Black (#000000)
     */
    static get Black() {
        return Color.fromHex('#000000');
    }
    /**
     * White (#FFFFFF)
     */
    static get White() {
        return Color.fromHex('#FFFFFF');
    }
    /**
     * Gray (#808080)
     */
    static get Gray() {
        return Color.fromHex('#808080');
    }
    /**
     * Light gray (#D3D3D3)
     */
    static get LightGray() {
        return Color.fromHex('#D3D3D3');
    }
    /**
     * Dark gray (#A9A9A9)
     */
    static get DarkGray() {
        return Color.fromHex('#A9A9A9');
    }
    /**
     * Yellow (#FFFF00)
     */
    static get Yellow() {
        return Color.fromHex('#FFFF00');
    }
    /**
     * Orange (#FFA500)
     */
    static get Orange() {
        return Color.fromHex('#FFA500');
    }
    /**
     * Red (#FF0000)
     */
    static get Red() {
        return Color.fromHex('#FF0000');
    }
    /**
     * Vermilion (#FF5B31)
     */
    static get Vermilion() {
        return Color.fromHex('#FF5B31');
    }
    /**
     * Rose (#FF007F)
     */
    static get Rose() {
        return Color.fromHex('#FF007F');
    }
    /**
     * Magenta (#FF00FF)
     */
    static get Magenta() {
        return Color.fromHex('#FF00FF');
    }
    /**
     * Violet (#7F00FF)
     */
    static get Violet() {
        return Color.fromHex('#7F00FF');
    }
    /**
     * Blue (#0000FF)
     */
    static get Blue() {
        return Color.fromHex('#0000FF');
    }
    /**
     * Azure (#007FFF)
     */
    static get Azure() {
        return Color.fromHex('#007FFF');
    }
    /**
     * Cyan (#00FFFF)
     */
    static get Cyan() {
        return Color.fromHex('#00FFFF');
    }
    /**
     * Viridian (#59978F)
     */
    static get Viridian() {
        return Color.fromHex('#59978F');
    }
    /**
     * Green (#00FF00)
     */
    static get Green() {
        return Color.fromHex('#00FF00');
    }
    /**
     * Chartreuse (#7FFF00)
     */
    static get Chartreuse() {
        return Color.fromHex('#7FFF00');
    }
    /**
     * Transparent (#FFFFFF00)
     */
    static get Transparent() {
        return Color.fromHex('#FFFFFF00');
    }
    /**
     * ExcaliburBlue (#176BAA)
     */
    static get ExcaliburBlue() {
        return Color.fromHex('#176BAA');
    }
}
/**
 * Internal HSL Color representation
 *
 * http://en.wikipedia.org/wiki/HSL_and_HSV
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
class HSLColor {
    constructor(h, s, l, a) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }
    static hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    static fromRGBA(r, g, b, a) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;
        if (max === min) {
            h = s = 0; // achromatic
        }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return new HSLColor(h, s, l, a);
    }
    toRGBA() {
        let r, g, b;
        if (this.s === 0) {
            r = g = b = this.l; // achromatic
        }
        else {
            const q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
            const p = 2 * this.l - q;
            r = HSLColor.hue2rgb(p, q, this.h + 1 / 3);
            g = HSLColor.hue2rgb(p, q, this.h);
            b = HSLColor.hue2rgb(p, q, this.h - 1 / 3);
        }
        return new Color(r * 255, g * 255, b * 255, this.a);
    }
    toString() {
        const h = this.h.toFixed(0), s = this.s.toFixed(0), l = this.l.toFixed(0), a = this.a.toFixed(0);
        return `hsla(${h}, ${s}, ${l}, ${a})`;
    }
}

;// CONCATENATED MODULE: ./Collision/Side.ts

/**
 * An enum that describes the sides of an axis aligned box for collision
 */
var Side;
(function (Side) {
    Side["None"] = "None";
    Side["Top"] = "Top";
    Side["Bottom"] = "Bottom";
    Side["Left"] = "Left";
    Side["Right"] = "Right";
})(Side || (Side = {}));
(function (Side) {
    /**
     * Returns the opposite side from the current
     */
    function getOpposite(side) {
        if (side === Side.Top) {
            return Side.Bottom;
        }
        if (side === Side.Bottom) {
            return Side.Top;
        }
        if (side === Side.Left) {
            return Side.Right;
        }
        if (side === Side.Right) {
            return Side.Left;
        }
        return Side.None;
    }
    Side.getOpposite = getOpposite;
    /**
     * Given a vector, return the Side most in that direction (via dot product)
     */
    function fromDirection(direction) {
        const directions = [vector_Vector.Left, vector_Vector.Right, vector_Vector.Up, vector_Vector.Down];
        const directionEnum = [Side.Left, Side.Right, Side.Top, Side.Bottom];
        let max = -Number.MAX_VALUE;
        let maxIndex = -1;
        for (let i = 0; i < directions.length; i++) {
            if (directions[i].dot(direction) > max) {
                max = directions[i].dot(direction);
                maxIndex = i;
            }
        }
        return directionEnum[maxIndex];
    }
    Side.fromDirection = fromDirection;
})(Side || (Side = {}));

;// CONCATENATED MODULE: ./Collision/BoundingBox.ts



/**
 * Axis Aligned collision primitive for Excalibur.
 */
class BoundingBox {
    /**
     * Constructor allows passing of either an object with all coordinate components,
     * or the coordinate components passed separately.
     * @param leftOrOptions    Either x coordinate of the left edge or an options object
     * containing the four coordinate components.
     * @param top     y coordinate of the top edge
     * @param right   x coordinate of the right edge
     * @param bottom  y coordinate of the bottom edge
     */
    constructor(leftOrOptions = 0, top = 0, right = 0, bottom = 0) {
        if (typeof leftOrOptions === 'object') {
            this.left = leftOrOptions.left;
            this.top = leftOrOptions.top;
            this.right = leftOrOptions.right;
            this.bottom = leftOrOptions.bottom;
        }
        else if (typeof leftOrOptions === 'number') {
            this.left = leftOrOptions;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }
    }
    /**
     * Returns a new instance of [[BoundingBox]] that is a copy of the current instance
     */
    clone() {
        return new BoundingBox(this.left, this.top, this.right, this.bottom);
    }
    /**
     * Given bounding box A & B, returns the side relative to A when intersection is performed.
     * @param intersection Intersection vector between 2 bounding boxes
     */
    static getSideFromIntersection(intersection) {
        if (!intersection) {
            return Side.None;
        }
        if (intersection) {
            if (Math.abs(intersection.x) > Math.abs(intersection.y)) {
                if (intersection.x < 0) {
                    return Side.Right;
                }
                return Side.Left;
            }
            else {
                if (intersection.y < 0) {
                    return Side.Bottom;
                }
                return Side.Top;
            }
        }
        return Side.None;
    }
    static fromPoints(points) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < points.length; i++) {
            if (points[i].x < minX) {
                minX = points[i].x;
            }
            if (points[i].x > maxX) {
                maxX = points[i].x;
            }
            if (points[i].y < minY) {
                minY = points[i].y;
            }
            if (points[i].y > maxY) {
                maxY = points[i].y;
            }
        }
        return new BoundingBox(minX, minY, maxX, maxY);
    }
    static fromDimension(width, height, anchor = vector_Vector.Half, pos = vector_Vector.Zero) {
        return new BoundingBox(-width * anchor.x + pos.x, -height * anchor.y + pos.y, width - width * anchor.x + pos.x, height - height * anchor.y + pos.y);
    }
    /**
     * Returns the calculated width of the bounding box
     */
    get width() {
        return this.right - this.left;
    }
    /**
     * Returns the calculated height of the bounding box
     */
    get height() {
        return this.bottom - this.top;
    }
    /**
     * Return whether the bounding box has zero dimensions in height,width or both
     */
    hasZeroDimensions() {
        return this.width === 0 || this.height === 0;
    }
    /**
     * Returns the center of the bounding box
     */
    get center() {
        return new vector_Vector((this.left + this.right) / 2, (this.top + this.bottom) / 2);
    }
    translate(pos) {
        return new BoundingBox(this.left + pos.x, this.top + pos.y, this.right + pos.x, this.bottom + pos.y);
    }
    /**
     * Rotates a bounding box by and angle and around a point, if no point is specified (0, 0) is used by default. The resulting bounding
     * box is also axis-align. This is useful when a new axis-aligned bounding box is needed for rotated geometry.
     */
    rotate(angle, point = vector_Vector.Zero) {
        const points = this.getPoints().map((p) => p.rotate(angle, point));
        return BoundingBox.fromPoints(points);
    }
    /**
     * Scale a bounding box by a scale factor, optionally provide a point
     * @param scale
     * @param point
     */
    scale(scale, point = vector_Vector.Zero) {
        const shifted = this.translate(point);
        return new BoundingBox(shifted.left * scale.x, shifted.top * scale.y, shifted.right * scale.x, shifted.bottom * scale.y);
    }
    /**
     * Transform the axis aligned bounding box by a [[Matrix]], producing a new axis aligned bounding box
     * @param matrix
     */
    transform(matrix) {
        const matFirstColumn = vec(matrix.data[0], matrix.data[1]);
        const xa = matFirstColumn.scale(this.left);
        const xb = matFirstColumn.scale(this.right);
        const matSecondColumn = vec(matrix.data[2], matrix.data[3]);
        const ya = matSecondColumn.scale(this.top);
        const yb = matSecondColumn.scale(this.bottom);
        const matrixPos = matrix.getPosition();
        const topLeft = vector_Vector.min(xa, xb).add(vector_Vector.min(ya, yb)).add(matrixPos);
        const bottomRight = vector_Vector.max(xa, xb).add(vector_Vector.max(ya, yb)).add(matrixPos);
        return new BoundingBox({
            left: topLeft.x,
            top: topLeft.y,
            right: bottomRight.x,
            bottom: bottomRight.y
        });
    }
    /**
     * Returns the perimeter of the bounding box
     */
    getPerimeter() {
        const wx = this.width;
        const wy = this.height;
        return 2 * (wx + wy);
    }
    getPoints() {
        const results = [];
        results.push(new vector_Vector(this.left, this.top));
        results.push(new vector_Vector(this.right, this.top));
        results.push(new vector_Vector(this.right, this.bottom));
        results.push(new vector_Vector(this.left, this.bottom));
        return results;
    }
    /**
     * Determines whether a ray intersects with a bounding box
     */
    rayCast(ray, farClipDistance = Infinity) {
        // algorithm from https://tavianator.com/fast-branchless-raybounding-box-intersections/
        let tmin = -Infinity;
        let tmax = +Infinity;
        const xinv = ray.dir.x === 0 ? Number.MAX_VALUE : 1 / ray.dir.x;
        const yinv = ray.dir.y === 0 ? Number.MAX_VALUE : 1 / ray.dir.y;
        const tx1 = (this.left - ray.pos.x) * xinv;
        const tx2 = (this.right - ray.pos.x) * xinv;
        tmin = Math.min(tx1, tx2);
        tmax = Math.max(tx1, tx2);
        const ty1 = (this.top - ray.pos.y) * yinv;
        const ty2 = (this.bottom - ray.pos.y) * yinv;
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
        return tmax >= Math.max(0, tmin) && tmin < farClipDistance;
    }
    rayCastTime(ray, farClipDistance = Infinity) {
        // algorithm from https://tavianator.com/fast-branchless-raybounding-box-intersections/
        let tmin = -Infinity;
        let tmax = +Infinity;
        const xinv = ray.dir.x === 0 ? Number.MAX_VALUE : 1 / ray.dir.x;
        const yinv = ray.dir.y === 0 ? Number.MAX_VALUE : 1 / ray.dir.y;
        const tx1 = (this.left - ray.pos.x) * xinv;
        const tx2 = (this.right - ray.pos.x) * xinv;
        tmin = Math.min(tx1, tx2);
        tmax = Math.max(tx1, tx2);
        const ty1 = (this.top - ray.pos.y) * yinv;
        const ty2 = (this.bottom - ray.pos.y) * yinv;
        tmin = Math.max(tmin, Math.min(ty1, ty2));
        tmax = Math.min(tmax, Math.max(ty1, ty2));
        if (tmax >= Math.max(0, tmin) && tmin < farClipDistance) {
            return tmin;
        }
        return -1;
    }
    contains(val) {
        if (val instanceof vector_Vector) {
            return this.left <= val.x && this.top <= val.y && this.bottom >= val.y && this.right >= val.x;
        }
        else if (val instanceof BoundingBox) {
            if (this.left <= val.left && this.top <= val.top && val.bottom <= this.bottom && val.right <= this.right) {
                return true;
            }
            return false;
        }
        return false;
    }
    /**
     * Combines this bounding box and another together returning a new bounding box
     * @param other  The bounding box to combine
     */
    combine(other) {
        const compositeBB = new BoundingBox(Math.min(this.left, other.left), Math.min(this.top, other.top), Math.max(this.right, other.right), Math.max(this.bottom, other.bottom));
        return compositeBB;
    }
    get dimensions() {
        return new vector_Vector(this.width, this.height);
    }
    /**
     * Returns true if the bounding boxes overlap.
     * @param other
     */
    overlaps(other) {
        if (other.hasZeroDimensions()) {
            return this.contains(other);
        }
        if (this.hasZeroDimensions()) {
            return other.contains(this);
        }
        const totalBoundingBox = this.combine(other);
        return totalBoundingBox.width < other.width + this.width &&
            totalBoundingBox.height < other.height + this.height;
    }
    /**
     * Test wether this bounding box intersects with another returning
     * the intersection vector that can be used to resolve the collision. If there
     * is no intersection null is returned.
     *
     * @param other  Other [[BoundingBox]] to test intersection with
     * @returns A Vector in the direction of the current BoundingBox, this <- other
     */
    intersect(other) {
        const totalBoundingBox = this.combine(other);
        // If the total bounding box is less than or equal the sum of the 2 bounds then there is collision
        if (totalBoundingBox.width < other.width + this.width &&
            totalBoundingBox.height < other.height + this.height &&
            !totalBoundingBox.dimensions.equals(other.dimensions) &&
            !totalBoundingBox.dimensions.equals(this.dimensions)) {
            // collision
            let overlapX = 0;
            // right edge is between the other's left and right edge
            /**
             *     +-this-+
             *     |      |
             *     |    +-other-+
             *     +----|-+     |
             *          |       |
             *          +-------+
             *         <---
             *          ^ overlap
             */
            if (this.right >= other.left && this.right <= other.right) {
                overlapX = other.left - this.right;
                // right edge is past the other's right edge
                /**
                 *     +-other-+
                 *     |       |
                 *     |    +-this-+
                 *     +----|--+   |
                 *          |      |
                 *          +------+
                 *          --->
                 *          ^ overlap
                 */
            }
            else {
                overlapX = other.right - this.left;
            }
            let overlapY = 0;
            // top edge is between the other's top and bottom edge
            /**
             *     +-other-+
             *     |       |
             *     |    +-this-+   | <- overlap
             *     +----|--+   |   |
             *          |      |  \ /
             *          +------+   '
             */
            if (this.top <= other.bottom && this.top >= other.top) {
                overlapY = other.bottom - this.top;
                // top edge is above the other top edge
                /**
                 *     +-this-+         .
                 *     |      |        / \
                 *     |    +-other-+   | <- overlap
                 *     +----|-+     |   |
                 *          |       |
                 *          +-------+
                 */
            }
            else {
                overlapY = other.top - this.bottom;
            }
            if (Math.abs(overlapX) < Math.abs(overlapY)) {
                return new vector_Vector(overlapX, 0);
            }
            else {
                return new vector_Vector(0, overlapY);
            }
            // Case of total containment of one bounding box by another
        }
        else if (totalBoundingBox.dimensions.equals(other.dimensions) || totalBoundingBox.dimensions.equals(this.dimensions)) {
            let overlapX = 0;
            // this is wider than the other
            if (this.width - other.width >= 0) {
                // This right edge is closest to the others right edge
                if (this.right - other.right <= other.left - this.left) {
                    overlapX = other.left - this.right;
                    // This left edge is closest to the others left edge
                }
                else {
                    overlapX = other.right - this.left;
                }
                // other is wider than this
            }
            else {
                // This right edge is closest to the others right edge
                if (other.right - this.right <= this.left - other.left) {
                    overlapX = this.left - other.right;
                    // This left edge is closest to the others left edge
                }
                else {
                    overlapX = this.right - other.left;
                }
            }
            let overlapY = 0;
            // this is taller than other
            if (this.height - other.height >= 0) {
                // The bottom edge is closest to the others bottom edge
                if (this.bottom - other.bottom <= other.top - this.top) {
                    overlapY = other.top - this.bottom;
                }
                else {
                    overlapY = other.bottom - this.top;
                }
                // other is taller than this
            }
            else {
                // The bottom edge is closest to the others bottom edge
                if (other.bottom - this.bottom <= this.top - other.top) {
                    overlapY = this.top - other.bottom;
                }
                else {
                    overlapY = this.bottom - other.top;
                }
            }
            if (Math.abs(overlapX) < Math.abs(overlapY)) {
                return new vector_Vector(overlapX, 0);
            }
            else {
                return new vector_Vector(0, overlapY);
            }
        }
        else {
            return null;
        }
    }
    /**
     * Test whether the bounding box has intersected with another bounding box, returns the side of the current bb that intersected.
     * @param bb The other actor to test
     */
    intersectWithSide(bb) {
        const intersect = this.intersect(bb);
        return BoundingBox.getSideFromIntersection(intersect);
    }
    /**
     * Draw a debug bounding box
     * @param ex
     * @param color
     */
    draw(ex, color = Color.Yellow) {
        ex.debug.drawRect(this.left, this.top, this.width, this.height, { color });
    }
}

;// CONCATENATED MODULE: ./Collision/Detection/Pair.ts


/**
 * Models a potential collision between 2 colliders
 */
class Pair {
    constructor(colliderA, colliderB) {
        this.colliderA = colliderA;
        this.colliderB = colliderB;
        this.id = null;
        this.id = Pair.calculatePairHash(colliderA.id, colliderB.id);
    }
    /**
     * Returns whether a it is allowed for 2 colliders in a Pair to collide
     * @param colliderA
     * @param colliderB
     */
    static canCollide(colliderA, colliderB) {
        var _a, _b;
        const bodyA = (_a = colliderA === null || colliderA === void 0 ? void 0 : colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
        const bodyB = (_b = colliderB === null || colliderB === void 0 ? void 0 : colliderB.owner) === null || _b === void 0 ? void 0 : _b.get(BodyComponent);
        // Prevent self collision
        if (colliderA.id === colliderB.id) {
            return false;
        }
        // Colliders with the same owner do not collide (composite colliders)
        if (colliderA.owner &&
            colliderB.owner &&
            colliderA.owner.id === colliderB.owner.id) {
            return false;
        }
        // if the pair has a member with zero dimension don't collide
        if (colliderA.localBounds.hasZeroDimensions() || colliderB.localBounds.hasZeroDimensions()) {
            return false;
        }
        // Body's needed for collision in the current state
        // TODO can we collide without a body?
        if (!bodyA || !bodyB) {
            return false;
        }
        // If both are in the same collision group short circuit
        if (!bodyA.group.canCollide(bodyB.group)) {
            return false;
        }
        // if both are fixed short circuit
        if (bodyA.collisionType === CollisionType.Fixed && bodyB.collisionType === CollisionType.Fixed) {
            return false;
        }
        // if the either is prevent collision short circuit
        if (bodyB.collisionType === CollisionType.PreventCollision || bodyA.collisionType === CollisionType.PreventCollision) {
            return false;
        }
        // if either is dead short circuit
        if (!bodyA.active || !bodyB.active) {
            return false;
        }
        return true;
    }
    /**
     * Returns whether or not it is possible for the pairs to collide
     */
    get canCollide() {
        const colliderA = this.colliderA;
        const colliderB = this.colliderB;
        return Pair.canCollide(colliderA, colliderB);
    }
    /**
     * Runs the collision intersection logic on the members of this pair
     */
    collide() {
        return this.colliderA.collide(this.colliderB);
    }
    /**
     * Check if the collider is part of the pair
     * @param collider
     */
    hasCollider(collider) {
        return collider === this.colliderA || collider === this.colliderB;
    }
    /**
     * Calculates the unique pair hash id for this collision pair (owning id)
     */
    static calculatePairHash(idA, idB) {
        if (idA.value < idB.value) {
            return `#${idA.value}+${idB.value}`;
        }
        else {
            return `#${idB.value}+${idA.value}`;
        }
    }
}

;// CONCATENATED MODULE: ./Math/projection.ts
/**
 * A 1 dimensional projection on an axis, used to test overlaps
 */
class Projection {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    overlaps(projection) {
        return this.max > projection.min && projection.max > this.min;
    }
    getOverlap(projection) {
        if (this.overlaps(projection)) {
            if (this.max > projection.max) {
                return projection.max - this.min;
            }
            else {
                return this.max - projection.min;
            }
        }
        return 0;
    }
}

;// CONCATENATED MODULE: ./Collision/Detection/DynamicTree.ts





/**
 * Dynamic Tree Node used for tracking bounds within the tree
 */
class TreeNode {
    constructor(parent) {
        this.parent = parent;
        this.parent = parent || null;
        this.data = null;
        this.bounds = new BoundingBox();
        this.left = null;
        this.right = null;
        this.height = 0;
    }
    isLeaf() {
        return !this.left && !this.right;
    }
}
/**
 * The DynamicTrees provides a spatial partitioning data structure for quickly querying for overlapping bounding boxes for
 * all tracked bodies. The worst case performance of this is O(n*log(n)) where n is the number of bodies in the tree.
 *
 * Internally the bounding boxes are organized as a balanced binary tree of bounding boxes, where the leaf nodes are tracked bodies.
 * Every non-leaf node is a bounding box that contains child bounding boxes.
 */
class DynamicTree {
    constructor(worldBounds = new BoundingBox(-Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)) {
        this.worldBounds = worldBounds;
        this.root = null;
        this.nodes = {};
    }
    /**
     * Inserts a node into the dynamic tree
     */
    _insert(leaf) {
        // If there are no nodes in the tree, make this the root leaf
        if (this.root === null) {
            this.root = leaf;
            this.root.parent = null;
            return;
        }
        // Search the tree for a node that is not a leaf and find the best place to insert
        const leafAABB = leaf.bounds;
        let currentRoot = this.root;
        while (!currentRoot.isLeaf()) {
            const left = currentRoot.left;
            const right = currentRoot.right;
            const area = currentRoot.bounds.getPerimeter();
            const combinedAABB = currentRoot.bounds.combine(leafAABB);
            const combinedArea = combinedAABB.getPerimeter();
            // Calculate cost heuristic for creating a new parent and leaf
            const cost = 2 * combinedArea;
            // Minimum cost of pushing the leaf down the tree
            const inheritanceCost = 2 * (combinedArea - area);
            // Cost of descending
            let leftCost = 0;
            const leftCombined = leafAABB.combine(left.bounds);
            let newArea;
            let oldArea;
            if (left.isLeaf()) {
                leftCost = leftCombined.getPerimeter() + inheritanceCost;
            }
            else {
                oldArea = left.bounds.getPerimeter();
                newArea = leftCombined.getPerimeter();
                leftCost = newArea - oldArea + inheritanceCost;
            }
            let rightCost = 0;
            const rightCombined = leafAABB.combine(right.bounds);
            if (right.isLeaf()) {
                rightCost = rightCombined.getPerimeter() + inheritanceCost;
            }
            else {
                oldArea = right.bounds.getPerimeter();
                newArea = rightCombined.getPerimeter();
                rightCost = newArea - oldArea + inheritanceCost;
            }
            // cost is acceptable
            if (cost < leftCost && cost < rightCost) {
                break;
            }
            // Descend to the depths
            if (leftCost < rightCost) {
                currentRoot = left;
            }
            else {
                currentRoot = right;
            }
        }
        // Create the new parent node and insert into the tree
        const oldParent = currentRoot.parent;
        const newParent = new TreeNode(oldParent);
        newParent.bounds = leafAABB.combine(currentRoot.bounds);
        newParent.height = currentRoot.height + 1;
        if (oldParent !== null) {
            // The sibling node was not the root
            if (oldParent.left === currentRoot) {
                oldParent.left = newParent;
            }
            else {
                oldParent.right = newParent;
            }
            newParent.left = currentRoot;
            newParent.right = leaf;
            currentRoot.parent = newParent;
            leaf.parent = newParent;
        }
        else {
            // The sibling node was the root
            newParent.left = currentRoot;
            newParent.right = leaf;
            currentRoot.parent = newParent;
            leaf.parent = newParent;
            this.root = newParent;
        }
        // Walk up the tree fixing heights and AABBs
        let currentNode = leaf.parent;
        while (currentNode) {
            currentNode = this._balance(currentNode);
            if (!currentNode.left) {
                throw new Error('Parent of current leaf cannot have a null left child' + currentNode);
            }
            if (!currentNode.right) {
                throw new Error('Parent of current leaf cannot have a null right child' + currentNode);
            }
            currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);
            currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
            currentNode = currentNode.parent;
        }
    }
    /**
     * Removes a node from the dynamic tree
     */
    _remove(leaf) {
        if (leaf === this.root) {
            this.root = null;
            return;
        }
        const parent = leaf.parent;
        const grandParent = parent.parent;
        let sibling;
        if (parent.left === leaf) {
            sibling = parent.right;
        }
        else {
            sibling = parent.left;
        }
        if (grandParent) {
            if (grandParent.left === parent) {
                grandParent.left = sibling;
            }
            else {
                grandParent.right = sibling;
            }
            sibling.parent = grandParent;
            let currentNode = grandParent;
            while (currentNode) {
                currentNode = this._balance(currentNode);
                currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
                currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);
                currentNode = currentNode.parent;
            }
        }
        else {
            this.root = sibling;
            sibling.parent = null;
        }
    }
    /**
     * Tracks a body in the dynamic tree
     */
    trackCollider(collider) {
        const node = new TreeNode();
        node.data = collider;
        node.bounds = collider.bounds;
        node.bounds.left -= 2;
        node.bounds.top -= 2;
        node.bounds.right += 2;
        node.bounds.bottom += 2;
        this.nodes[collider.id.value] = node;
        this._insert(node);
    }
    /**
     * Updates the dynamic tree given the current bounds of each body being tracked
     */
    updateCollider(collider) {
        var _a;
        const node = this.nodes[collider.id.value];
        if (!node) {
            return false;
        }
        const b = collider.bounds;
        // if the body is outside the world no longer update it
        if (!this.worldBounds.contains(b)) {
            Logger.getInstance().warn('Collider with id ' + collider.id.value + ' is outside the world bounds and will no longer be tracked for physics');
            this.untrackCollider(collider);
            return false;
        }
        if (node.bounds.contains(b)) {
            return false;
        }
        this._remove(node);
        b.left -= Physics.boundsPadding;
        b.top -= Physics.boundsPadding;
        b.right += Physics.boundsPadding;
        b.bottom += Physics.boundsPadding;
        // THIS IS CAUSING UNECESSARY CHECKS
        if (collider.owner) {
            const body = (_a = collider.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
            if (body) {
                const multdx = ((body.vel.x * 32) / 1000) * Physics.dynamicTreeVelocityMultiplier;
                const multdy = ((body.vel.y * 32) / 1000) * Physics.dynamicTreeVelocityMultiplier;
                if (multdx < 0) {
                    b.left += multdx;
                }
                else {
                    b.right += multdx;
                }
                if (multdy < 0) {
                    b.top += multdy;
                }
                else {
                    b.bottom += multdy;
                }
            }
        }
        node.bounds = b;
        this._insert(node);
        return true;
    }
    /**
     * Untracks a body from the dynamic tree
     */
    untrackCollider(collider) {
        const node = this.nodes[collider.id.value];
        if (!node) {
            return;
        }
        this._remove(node);
        this.nodes[collider.id.value] = null;
        delete this.nodes[collider.id.value];
    }
    /**
     * Balances the tree about a node
     */
    _balance(node) {
        if (node === null) {
            throw new Error('Cannot balance at null node');
        }
        if (node.isLeaf() || node.height < 2) {
            return node;
        }
        const left = node.left;
        const right = node.right;
        const a = node;
        const b = left;
        const c = right;
        const d = left.left;
        const e = left.right;
        const f = right.left;
        const g = right.right;
        const balance = c.height - b.height;
        // Rotate c node up
        if (balance > 1) {
            // Swap the right node with it's parent
            c.left = a;
            c.parent = a.parent;
            a.parent = c;
            // The original node's old parent should point to the right node
            // this is mega confusing
            if (c.parent) {
                if (c.parent.left === a) {
                    c.parent.left = c;
                }
                else {
                    c.parent.right = c;
                }
            }
            else {
                this.root = c;
            }
            // Rotate
            if (f.height > g.height) {
                c.right = f;
                a.right = g;
                g.parent = a;
                a.bounds = b.bounds.combine(g.bounds);
                c.bounds = a.bounds.combine(f.bounds);
                a.height = 1 + Math.max(b.height, g.height);
                c.height = 1 + Math.max(a.height, f.height);
            }
            else {
                c.right = g;
                a.right = f;
                f.parent = a;
                a.bounds = b.bounds.combine(f.bounds);
                c.bounds = a.bounds.combine(g.bounds);
                a.height = 1 + Math.max(b.height, f.height);
                c.height = 1 + Math.max(a.height, g.height);
            }
            return c;
        }
        // Rotate left node up
        if (balance < -1) {
            // swap
            b.left = a;
            b.parent = a.parent;
            a.parent = b;
            // node's old parent should point to b
            if (b.parent) {
                if (b.parent.left === a) {
                    b.parent.left = b;
                }
                else {
                    if (b.parent.right !== a) {
                        throw 'Error rotating Dynamic Tree';
                    }
                    b.parent.right = b;
                }
            }
            else {
                this.root = b;
            }
            // rotate
            if (d.height > e.height) {
                b.right = d;
                a.left = e;
                e.parent = a;
                a.bounds = c.bounds.combine(e.bounds);
                b.bounds = a.bounds.combine(d.bounds);
                a.height = 1 + Math.max(c.height, e.height);
                b.height = 1 + Math.max(a.height, d.height);
            }
            else {
                b.right = e;
                a.left = d;
                d.parent = a;
                a.bounds = c.bounds.combine(d.bounds);
                b.bounds = a.bounds.combine(e.bounds);
                a.height = 1 + Math.max(c.height, d.height);
                b.height = 1 + Math.max(a.height, e.height);
            }
            return b;
        }
        return node;
    }
    /**
     * Returns the internal height of the tree, shorter trees are better. Performance drops as the tree grows
     */
    getHeight() {
        if (this.root === null) {
            return 0;
        }
        return this.root.height;
    }
    /**
     * Queries the Dynamic Axis Aligned Tree for bodies that could be colliding with the provided body.
     *
     * In the query callback, it will be passed a potential collider. Returning true from this callback indicates
     * that you are complete with your query and you do not want to continue. Returning false will continue searching
     * the tree until all possible colliders have been returned.
     */
    query(collider, callback) {
        const bounds = collider.bounds;
        const helper = (currentNode) => {
            if (currentNode && currentNode.bounds.overlaps(bounds)) {
                if (currentNode.isLeaf() && currentNode.data !== collider) {
                    if (callback.call(collider, currentNode.data)) {
                        return true;
                    }
                }
                else {
                    return helper(currentNode.left) || helper(currentNode.right);
                }
            }
            return false;
        };
        helper(this.root);
    }
    /**
     * Queries the Dynamic Axis Aligned Tree for bodies that could be intersecting. By default the raycast query uses an infinitely
     * long ray to test the tree specified by `max`.
     *
     * In the query callback, it will be passed a potential body that intersects with the raycast. Returning true from this
     * callback indicates that your are complete with your query and do not want to continue. Return false will continue searching
     * the tree until all possible bodies that would intersect with the ray have been returned.
     */
    rayCastQuery(ray, max = Infinity, callback) {
        const helper = (currentNode) => {
            if (currentNode && currentNode.bounds.rayCast(ray, max)) {
                if (currentNode.isLeaf()) {
                    if (callback.call(ray, currentNode.data)) {
                        // ray hit a leaf! return the body
                        return true;
                    }
                }
                else {
                    // ray hit but not at a leaf, recurse deeper
                    return helper(currentNode.left) || helper(currentNode.right);
                }
            }
            return false; // ray missed
        };
        helper(this.root);
    }
    getNodes() {
        const helper = (currentNode) => {
            if (currentNode) {
                return [currentNode].concat(helper(currentNode.left), helper(currentNode.right));
            }
            else {
                return [];
            }
        };
        return helper(this.root);
    }
    debug(ex) {
        // draw all the nodes in the Dynamic Tree
        const helper = (currentNode) => {
            if (currentNode) {
                if (currentNode.isLeaf()) {
                    currentNode.bounds.draw(ex, Color.Green);
                }
                else {
                    currentNode.bounds.draw(ex, Color.White);
                }
                if (currentNode.left) {
                    helper(currentNode.left);
                }
                if (currentNode.right) {
                    helper(currentNode.right);
                }
            }
        };
        helper(this.root);
    }
}

;// CONCATENATED MODULE: ./Math/ray.ts
/**
 * A 2D ray that can be cast into the scene to do collision detection
 */
class Ray {
    /**
     * @param pos The starting position for the ray
     * @param dir The vector indicating the direction of the ray
     */
    constructor(pos, dir) {
        this.pos = pos;
        this.dir = dir.normalize();
    }
    /**
     * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
     * This number indicates the mathematical intersection time.
     * @param line  The line to test
     */
    intersect(line) {
        const numerator = line.begin.sub(this.pos);
        // Test is line and ray are parallel and non intersecting
        if (this.dir.cross(line.getSlope()) === 0 && numerator.cross(this.dir) !== 0) {
            return -1;
        }
        // Lines are parallel
        const divisor = this.dir.cross(line.getSlope());
        if (divisor === 0) {
            return -1;
        }
        const t = numerator.cross(line.getSlope()) / divisor;
        if (t >= 0) {
            const u = numerator.cross(this.dir) / divisor / line.getLength();
            if (u >= 0 && u <= 1) {
                return t;
            }
        }
        return -1;
    }
    intersectPoint(line) {
        const time = this.intersect(line);
        if (time < 0) {
            return null;
        }
        return this.getPoint(time);
    }
    /**
     * Returns the point of intersection given the intersection time
     */
    getPoint(time) {
        return this.pos.add(this.dir.scale(time));
    }
}

;// CONCATENATED MODULE: ./Collision/Detection/DynamicTreeCollisionProcessor.ts









/**
 * Responsible for performing the collision broadphase (locating potential collisions) and
 * the narrowphase (actual collision contacts)
 */
class DynamicTreeCollisionProcessor {
    constructor() {
        this._dynamicCollisionTree = new DynamicTree();
        this._pairs = new Set();
        this._collisionPairCache = [];
        this._colliders = [];
    }
    getColliders() {
        return this._colliders;
    }
    /**
     * Tracks a physics body for collisions
     */
    track(target) {
        if (!target) {
            Logger.getInstance().warn('Cannot track null collider');
            return;
        }
        if (target instanceof CompositeCollider) {
            const colliders = target.getColliders();
            for (const c of colliders) {
                c.owner = target.owner;
                this._colliders.push(c);
                this._dynamicCollisionTree.trackCollider(c);
            }
        }
        else {
            this._colliders.push(target);
            this._dynamicCollisionTree.trackCollider(target);
        }
    }
    /**
     * Untracks a physics body
     */
    untrack(target) {
        if (!target) {
            Logger.getInstance().warn('Cannot untrack a null collider');
            return;
        }
        if (target instanceof CompositeCollider) {
            const colliders = target.getColliders();
            for (const c of colliders) {
                const index = this._colliders.indexOf(c);
                if (index !== -1) {
                    this._colliders.splice(index, 1);
                }
                this._dynamicCollisionTree.untrackCollider(c);
            }
        }
        else {
            const index = this._colliders.indexOf(target);
            if (index !== -1) {
                this._colliders.splice(index, 1);
            }
            this._dynamicCollisionTree.untrackCollider(target);
        }
    }
    _pairExists(colliderA, colliderB) {
        // if the collision pair has been calculated already short circuit
        const hash = Pair.calculatePairHash(colliderA.id, colliderB.id);
        return this._pairs.has(hash);
    }
    /**
     * Detects potential collision pairs in a broadphase approach with the dynamic AABB tree strategy
     */
    broadphase(targets, delta, stats) {
        const seconds = delta / 1000;
        // Retrieve the list of potential colliders, exclude killed, prevented, and self
        const potentialColliders = targets.filter((other) => {
            var _a, _b;
            const body = (_a = other.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
            return ((_b = other.owner) === null || _b === void 0 ? void 0 : _b.active) && body.collisionType !== CollisionType.PreventCollision;
        });
        // clear old list of collision pairs
        this._collisionPairCache = [];
        this._pairs.clear();
        // check for normal collision pairs
        let collider;
        for (let j = 0, l = potentialColliders.length; j < l; j++) {
            collider = potentialColliders[j];
            // Query the collision tree for potential colliders
            this._dynamicCollisionTree.query(collider, (other) => {
                if (!this._pairExists(collider, other) && Pair.canCollide(collider, other)) {
                    const pair = new Pair(collider, other);
                    this._pairs.add(pair.id);
                    this._collisionPairCache.push(pair);
                }
                // Always return false, to query whole tree. Returning true in the query method stops searching
                return false;
            });
        }
        if (stats) {
            stats.physics.pairs = this._collisionPairCache.length;
        }
        // Check dynamic tree for fast moving objects
        // Fast moving objects are those moving at least there smallest bound per frame
        if (Physics.checkForFastBodies) {
            for (const collider of potentialColliders) {
                const body = collider.owner.get(BodyComponent);
                // Skip non-active objects. Does not make sense on other collision types
                if (body.collisionType !== CollisionType.Active) {
                    continue;
                }
                // Maximum travel distance next frame
                const updateDistance = body.vel.size * seconds + // velocity term
                    body.acc.size * 0.5 * seconds * seconds; // acc term
                // Find the minimum dimension
                const minDimension = Math.min(collider.bounds.height, collider.bounds.width);
                if (Physics.disableMinimumSpeedForFastBody || updateDistance > minDimension / 2) {
                    if (stats) {
                        stats.physics.fastBodies++;
                    }
                    // start with the oldPos because the integration for actors has already happened
                    // objects resting on a surface may be slightly penetrating in the current position
                    const updateVec = body.pos.sub(body.oldPos);
                    const centerPoint = collider.center;
                    const furthestPoint = collider.getFurthestPoint(body.vel);
                    const origin = furthestPoint.sub(updateVec);
                    const ray = new Ray(origin, body.vel);
                    // back the ray up by -2x surfaceEpsilon to account for fast moving objects starting on the surface
                    ray.pos = ray.pos.add(ray.dir.scale(-2 * Physics.surfaceEpsilon));
                    let minCollider;
                    let minTranslate = new vector_Vector(Infinity, Infinity);
                    this._dynamicCollisionTree.rayCastQuery(ray, updateDistance + Physics.surfaceEpsilon * 2, (other) => {
                        if (!this._pairExists(collider, other) && Pair.canCollide(collider, other)) {
                            const hitPoint = other.rayCast(ray, updateDistance + Physics.surfaceEpsilon * 10);
                            if (hitPoint) {
                                const translate = hitPoint.sub(origin);
                                if (translate.size < minTranslate.size) {
                                    minTranslate = translate;
                                    minCollider = other;
                                }
                            }
                        }
                        return false;
                    });
                    if (minCollider && vector_Vector.isValid(minTranslate)) {
                        const pair = new Pair(collider, minCollider);
                        if (!this._pairs.has(pair.id)) {
                            this._pairs.add(pair.id);
                            this._collisionPairCache.push(pair);
                        }
                        // move the fast moving object to the other body
                        // need to push into the surface by ex.Physics.surfaceEpsilon
                        const shift = centerPoint.sub(furthestPoint);
                        body.pos = origin
                            .add(shift)
                            .add(minTranslate)
                            .add(ray.dir.scale(10 * Physics.surfaceEpsilon)); // needed to push the shape slightly into contact
                        collider.update(body.transform.get());
                        if (stats) {
                            stats.physics.fastBodyCollisions++;
                        }
                    }
                }
            }
        }
        // return cache
        return this._collisionPairCache;
    }
    /**
     * Applies narrow phase on collision pairs to find actual area intersections
     * Adds actual colliding pairs to stats' Frame data
     */
    narrowphase(pairs, stats) {
        let contacts = [];
        for (let i = 0; i < pairs.length; i++) {
            const newContacts = pairs[i].collide();
            contacts = contacts.concat(newContacts);
            if (stats && newContacts.length > 0) {
                for (const c of newContacts) {
                    stats.physics.contacts.set(c.id, c);
                }
            }
        }
        if (stats) {
            stats.physics.collisions += contacts.length;
        }
        return contacts;
    }
    /**
     * Update the dynamic tree positions
     */
    update(targets) {
        let updated = 0;
        const len = targets.length;
        for (let i = 0; i < len; i++) {
            if (this._dynamicCollisionTree.updateCollider(targets[i])) {
                updated++;
            }
        }
        return updated;
    }
    debug(ex) {
        this._dynamicCollisionTree.debug(ex);
    }
}

;// CONCATENATED MODULE: ./Collision/Colliders/Collider.ts


/**
 * A collision collider specifies the geometry that can detect when other collision colliders intersect
 * for the purposes of colliding 2 objects in excalibur.
 */
class Collider {
    constructor() {
        this.id = createId('collider', Collider._ID++);
        /**
         * Excalibur uses this to signal to the [[CollisionSystem]] this is part of a composite collider
         * @internal
         * @hidden
         */
        this.__compositeColliderId = null;
        this.events = new EventDispatcher();
    }
    /**
     * Returns a boolean indicating whether this body collided with
     * or was in stationary contact with
     * the body of the other [[Collider]]
     */
    touching(other) {
        const contact = this.collide(other);
        if (contact) {
            return true;
        }
        return false;
    }
}
Collider._ID = 0;

;// CONCATENATED MODULE: ./Collision/Colliders/CompositeCollider.ts








class CompositeCollider extends Collider {
    constructor(colliders) {
        super();
        this._collisionProcessor = new DynamicTreeCollisionProcessor();
        this._dynamicAABBTree = new DynamicTree();
        this._colliders = [];
        for (const c of colliders) {
            this.addCollider(c);
        }
    }
    clearColliders() {
        this._colliders = [];
    }
    addCollider(collider) {
        this.events.wire(collider.events);
        collider.__compositeColliderId = this.id;
        this._colliders.push(collider);
        this._collisionProcessor.track(collider);
        this._dynamicAABBTree.trackCollider(collider);
    }
    removeCollider(collider) {
        this.events.unwire(collider.events);
        collider.__compositeColliderId = null;
        removeItemFromArray(collider, this._colliders);
        this._collisionProcessor.untrack(collider);
        this._dynamicAABBTree.untrackCollider(collider);
    }
    getColliders() {
        return this._colliders;
    }
    get worldPos() {
        var _a, _b;
        // TODO transform component world pos
        return (_b = (_a = this._transform) === null || _a === void 0 ? void 0 : _a.pos) !== null && _b !== void 0 ? _b : vector_Vector.Zero;
    }
    get center() {
        var _a, _b;
        return (_b = (_a = this._transform) === null || _a === void 0 ? void 0 : _a.pos) !== null && _b !== void 0 ? _b : vector_Vector.Zero;
    }
    get bounds() {
        var _a, _b;
        // TODO cache this
        const colliders = this.getColliders();
        const results = colliders.reduce((acc, collider) => acc.combine(collider.bounds), (_b = (_a = colliders[0]) === null || _a === void 0 ? void 0 : _a.bounds) !== null && _b !== void 0 ? _b : new BoundingBox().translate(this.worldPos));
        return results;
    }
    get localBounds() {
        var _a, _b;
        // TODO cache this
        const colliders = this.getColliders();
        const results = colliders.reduce((acc, collider) => acc.combine(collider.localBounds), (_b = (_a = colliders[0]) === null || _a === void 0 ? void 0 : _a.localBounds) !== null && _b !== void 0 ? _b : new BoundingBox());
        return results;
    }
    get axes() {
        // TODO cache this
        const colliders = this.getColliders();
        let axes = [];
        for (const collider of colliders) {
            axes = axes.concat(collider.axes);
        }
        return axes;
    }
    getFurthestPoint(direction) {
        const colliders = this.getColliders();
        const furthestPoints = [];
        for (const collider of colliders) {
            furthestPoints.push(collider.getFurthestPoint(direction));
        }
        // Pick best point from all colliders
        let bestPoint = furthestPoints[0];
        let maxDistance = -Number.MAX_VALUE;
        for (const point of furthestPoints) {
            const distance = point.dot(direction);
            if (distance > maxDistance) {
                bestPoint = point;
                maxDistance = distance;
            }
        }
        return bestPoint;
    }
    getInertia(mass) {
        const colliders = this.getColliders();
        let totalInertia = 0;
        for (const collider of colliders) {
            totalInertia += collider.getInertia(mass);
        }
        return totalInertia;
    }
    collide(other) {
        let otherColliders = [other];
        if (other instanceof CompositeCollider) {
            otherColliders = other.getColliders();
        }
        const pairs = [];
        for (const c of otherColliders) {
            this._dynamicAABBTree.query(c, (potentialCollider) => {
                pairs.push(new Pair(c, potentialCollider));
                return false;
            });
        }
        let contacts = [];
        for (const p of pairs) {
            contacts = contacts.concat(p.collide());
        }
        return contacts;
    }
    getClosestLineBetween(other) {
        const colliders = this.getColliders();
        const lines = [];
        if (other instanceof CompositeCollider) {
            const otherColliders = other.getColliders();
            for (const colliderA of colliders) {
                for (const colliderB of otherColliders) {
                    const maybeLine = colliderA.getClosestLineBetween(colliderB);
                    if (maybeLine) {
                        lines.push(maybeLine);
                    }
                }
            }
        }
        else {
            for (const collider of colliders) {
                const maybeLine = other.getClosestLineBetween(collider);
                if (maybeLine) {
                    lines.push(maybeLine);
                }
            }
        }
        if (lines.length) {
            let minLength = lines[0].getLength();
            let minLine = lines[0];
            for (const line of lines) {
                const length = line.getLength();
                if (length < minLength) {
                    minLength = length;
                    minLine = line;
                }
            }
            return minLine;
        }
        return null;
    }
    contains(point) {
        const colliders = this.getColliders();
        for (const collider of colliders) {
            if (collider.contains(point)) {
                return true;
            }
        }
        return false;
    }
    rayCast(ray, max) {
        const colliders = this.getColliders();
        const points = [];
        for (const collider of colliders) {
            const vec = collider.rayCast(ray, max);
            if (vec) {
                points.push(vec);
            }
        }
        if (points.length) {
            let minPoint = points[0];
            let minDistance = minPoint.dot(ray.dir);
            for (const point of points) {
                const distance = ray.dir.dot(point);
                if (distance < minDistance) {
                    minPoint = point;
                    minDistance = distance;
                }
            }
            return minPoint;
        }
        return null;
    }
    project(axis) {
        const colliders = this.getColliders();
        const projs = [];
        for (const collider of colliders) {
            const proj = collider.project(axis);
            if (proj) {
                projs.push(proj);
            }
        }
        // Merge all proj's on the same axis
        if (projs.length) {
            const newProjection = new Projection(projs[0].min, projs[0].max);
            for (const proj of projs) {
                newProjection.min = Math.min(proj.min, newProjection.min);
                newProjection.max = Math.max(proj.max, newProjection.max);
            }
            return newProjection;
        }
        return null;
    }
    update(transform) {
        if (transform) {
            const colliders = this.getColliders();
            for (const collider of colliders) {
                collider.owner = this.owner;
                collider.update(transform);
            }
        }
    }
    debug(ex, color) {
        const colliders = this.getColliders();
        for (const collider of colliders) {
            collider.debug(ex, color);
        }
    }
    clone() {
        return new CompositeCollider(this._colliders.map((c) => c.clone()));
    }
}

;// CONCATENATED MODULE: ./Math/line-segment.ts

/**
 * A 2D line segment
 */
class LineSegment {
    /**
     * @param begin  The starting point of the line segment
     * @param end  The ending point of the line segment
     */
    constructor(begin, end) {
        this.begin = begin;
        this.end = end;
    }
    /**
     * Gets the raw slope (m) of the line. Will return (+/-)Infinity for vertical lines.
     */
    get slope() {
        return (this.end.y - this.begin.y) / (this.end.x - this.begin.x);
    }
    /**
     * Gets the Y-intercept (b) of the line. Will return (+/-)Infinity if there is no intercept.
     */
    get intercept() {
        return this.begin.y - this.slope * this.begin.x;
    }
    /**
     * Gets the normal of the line
     */
    normal() {
        return this.end.sub(this.begin).normal();
    }
    dir() {
        return this.end.sub(this.begin);
    }
    getPoints() {
        return [this.begin, this.end];
    }
    /**
     * Returns the slope of the line in the form of a vector of length 1
     */
    getSlope() {
        const begin = this.begin;
        const end = this.end;
        const distance = begin.distance(end);
        return end.sub(begin).scale(1 / distance);
    }
    /**
     * Returns the edge of the line as vector, the length of the vector is the length of the edge
     */
    getEdge() {
        const begin = this.begin;
        const end = this.end;
        return end.sub(begin);
    }
    /**
     * Returns the length of the line segment in pixels
     */
    getLength() {
        const begin = this.begin;
        const end = this.end;
        const distance = begin.distance(end);
        return distance;
    }
    /**
     * Returns the midpoint of the edge
     */
    get midpoint() {
        return this.begin.add(this.end).scale(0.5);
    }
    /**
     * Flips the direction of the line segment
     */
    flip() {
        return new LineSegment(this.end, this.begin);
    }
    /**
     * Tests if a given point is below the line, points in the normal direction above the line are considered above.
     * @param point
     */
    below(point) {
        const above2 = (this.end.x - this.begin.x) * (point.y - this.begin.y) - (this.end.y - this.begin.y) * (point.x - this.begin.x);
        return above2 >= 0;
    }
    /**
     * Returns the clip point
     * @param sideVector Vector that traces the line
     * @param length Length to clip along side
     */
    clip(sideVector, length) {
        let dir = sideVector;
        dir = dir.normalize();
        const near = dir.dot(this.begin) - length;
        const far = dir.dot(this.end) - length;
        const results = [];
        if (near <= 0) {
            results.push(this.begin);
        }
        if (far <= 0) {
            results.push(this.end);
        }
        if (near * far < 0) {
            const clipTime = near / (near - far);
            results.push(this.begin.add(this.end.sub(this.begin).scale(clipTime)));
        }
        if (results.length !== 2) {
            return null;
        }
        return new LineSegment(results[0], results[1]);
    }
    /**
     * Find the perpendicular distance from the line to a point
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     * @param point
     */
    distanceToPoint(point, signed = false) {
        const x0 = point.x;
        const y0 = point.y;
        const l = this.getLength();
        const dy = this.end.y - this.begin.y;
        const dx = this.end.x - this.begin.x;
        const distance = (dy * x0 - dx * y0 + this.end.x * this.begin.y - this.end.y * this.begin.x) / l;
        return signed ? distance : Math.abs(distance);
    }
    /**
     * Find the perpendicular line from the line to a point
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     * (a - p) - ((a - p) * n)n
     * a is a point on the line
     * p is the arbitrary point above the line
     * n is a unit vector in direction of the line
     * @param point
     */
    findVectorToPoint(point) {
        const aMinusP = this.begin.sub(point);
        const n = this.getSlope();
        return aMinusP.sub(n.scale(aMinusP.dot(n)));
    }
    /**
     * Finds a point on the line given only an X or a Y value. Given an X value, the function returns
     * a new point with the calculated Y value and vice-versa.
     *
     * @param x The known X value of the target point
     * @param y The known Y value of the target point
     * @returns A new point with the other calculated axis value
     */
    findPoint(x = null, y = null) {
        const m = this.slope;
        const b = this.intercept;
        if (x !== null) {
            return new vector_Vector(x, m * x + b);
        }
        else if (y !== null) {
            return new vector_Vector((y - b) / m, y);
        }
        else {
            throw new Error('You must provide an X or a Y value');
        }
    }
    /**
     * @see http://stackoverflow.com/a/11908158/109458
     */
    hasPoint() {
        let currPoint;
        let threshold = 0;
        if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
            currPoint = new vector_Vector(arguments[0], arguments[1]);
            threshold = arguments[2] || 0;
        }
        else if (arguments[0] instanceof vector_Vector) {
            currPoint = arguments[0];
            threshold = arguments[1] || 0;
        }
        else {
            throw 'Could not determine the arguments for Vector.hasPoint';
        }
        const dxc = currPoint.x - this.begin.x;
        const dyc = currPoint.y - this.begin.y;
        const dx1 = this.end.x - this.begin.x;
        const dy1 = this.end.y - this.begin.y;
        const cross = dxc * dy1 - dyc * dx1;
        // check whether point lines on the line
        if (Math.abs(cross) > threshold) {
            return false;
        }
        // check whether point lies in-between start and end
        if (Math.abs(dx1) >= Math.abs(dy1)) {
            return dx1 > 0 ? this.begin.x <= currPoint.x && currPoint.x <= this.end.x : this.end.x <= currPoint.x && currPoint.x <= this.begin.x;
        }
        else {
            return dy1 > 0 ? this.begin.y <= currPoint.y && currPoint.y <= this.end.y : this.end.y <= currPoint.y && currPoint.y <= this.begin.y;
        }
    }
}

;// CONCATENATED MODULE: ./Collision/Colliders/ClosestLineJumpTable.ts



/**
 * Finds the closes line between 2 line segments, were the magnitude of u, v are the lengths of each segment
 * L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
 * L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
 * @param p0 Point where L1 begins
 * @param u Direction and length of L1
 * @param q0 Point were L2 begins
 * @param v Direction and length of L2
 */
function ClosestLine(p0, u, q0, v) {
    // Distance between 2 lines http://geomalgorithms.com/a07-_distance.html
    // w(s, t) = P(s) - Q(t)
    // The w(s, t) that has the minimum distance we will say is w(sClosest, tClosest) = wClosest
    //
    // wClosest is the vector that is uniquely perpendicular to the 2 line directions u & v.
    // wClosest = w0 + sClosest * u - tClosest * v, where w0 is p0 - q0
    //
    // The closest point between 2 lines then satisfies this pair of equations
    // 1: u * wClosest = 0
    // 2: v * wClosest = 0
    //
    // Substituting wClosest into the equations we get
    //
    // 1: (u * u) * sClosest - (u * v) tClosest = -u * w0
    // 2: (v * u) * sClosest - (v * v) tClosest = -v * w0
    // simplify w0
    const w0 = p0.sub(q0);
    // simplify (u * u);
    const a = u.dot(u);
    // simplify (u * v);
    const b = u.dot(v);
    // simplify (v * v)
    const c = v.dot(v);
    // simplify (u * w0)
    const d = u.dot(w0);
    // simplify (v * w0)
    const e = v.dot(w0);
    // denominator ac - b^2
    const denom = a * c - b * b;
    let sDenom = denom;
    let tDenom = denom;
    // if denom is 0 they are parallel, use any point from either as the start in this case p0
    if (denom === 0 || denom <= 0.01) {
        const tClosestParallel = d / b;
        return new LineSegment(p0, q0.add(v.scale(tClosestParallel)));
    }
    // Solve for sClosest for infinite line
    let sClosest = b * e - c * d; // / denom;
    // Solve for tClosest for infinite line
    let tClosest = a * e - b * d; // / denom;
    // Solve for segments candidate edges, if sClosest and tClosest are outside their segments
    if (sClosest < 0) {
        sClosest = 0;
        tClosest = e;
        tDenom = c;
    }
    else if (sClosest > sDenom) {
        sClosest = sDenom;
        tClosest = e + b;
        tDenom = c;
    }
    if (tClosest < 0) {
        tClosest = 0;
        if (-d < 0) {
            sClosest = 0;
        }
        else if (-d > a) {
            sClosest = sDenom;
        }
        else {
            sClosest = -d;
            sDenom = a;
        }
    }
    else if (tClosest > tDenom) {
        tClosest = tDenom;
        if (-d + b < 0) {
            sClosest = 0;
        }
        else if (-d + b > a) {
            sClosest = sDenom;
        }
        else {
            sClosest = -d + b;
            sDenom = a;
        }
    }
    sClosest = Math.abs(sClosest) < 0.001 ? 0 : sClosest / sDenom;
    tClosest = Math.abs(tClosest) < 0.001 ? 0 : tClosest / tDenom;
    return new LineSegment(p0.add(u.scale(sClosest)), q0.add(v.scale(tClosest)));
}
const ClosestLineJumpTable = {
    PolygonPolygonClosestLine(polygonA, polygonB) {
        // Find the 2 closest faces on each polygon
        const otherWorldPos = polygonB.worldPos;
        const otherDirection = otherWorldPos.sub(polygonA.worldPos);
        const thisDirection = otherDirection.negate();
        const rayTowardsOther = new Ray(polygonA.worldPos, otherDirection);
        const rayTowardsThis = new Ray(otherWorldPos, thisDirection);
        const thisPoint = polygonA.rayCast(rayTowardsOther).add(rayTowardsOther.dir.scale(0.1));
        const otherPoint = polygonB.rayCast(rayTowardsThis).add(rayTowardsThis.dir.scale(0.1));
        const thisFace = polygonA.getClosestFace(thisPoint);
        const otherFace = polygonB.getClosestFace(otherPoint);
        // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
        const p0 = thisFace.face.begin;
        const u = thisFace.face.getEdge();
        // L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
        const q0 = otherFace.face.begin;
        const v = otherFace.face.getEdge();
        return ClosestLine(p0, u, q0, v);
    },
    PolygonEdgeClosestLine(polygon, edge) {
        // Find the 2 closest faces on each polygon
        const otherWorldPos = edge.worldPos;
        const otherDirection = otherWorldPos.sub(polygon.worldPos);
        const rayTowardsOther = new Ray(polygon.worldPos, otherDirection);
        const thisPoint = polygon.rayCast(rayTowardsOther).add(rayTowardsOther.dir.scale(0.1));
        const thisFace = polygon.getClosestFace(thisPoint);
        // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
        const p0 = thisFace.face.begin;
        const u = thisFace.face.getEdge();
        // L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
        const edgeLine = edge.asLine();
        const edgeStart = edgeLine.begin;
        const edgeVector = edgeLine.getEdge();
        const q0 = edgeStart;
        const v = edgeVector;
        return ClosestLine(p0, u, q0, v);
    },
    PolygonCircleClosestLine(polygon, circle) {
        // https://math.stackexchange.com/questions/1919177/how-to-find-point-on-line-closest-to-sphere
        // Find the 2 closest faces on each polygon
        const otherWorldPos = circle.worldPos;
        const otherDirection = otherWorldPos.sub(polygon.worldPos);
        const rayTowardsOther = new Ray(polygon.worldPos, otherDirection.normalize());
        const thisPoint = polygon.rayCast(rayTowardsOther).add(rayTowardsOther.dir.scale(0.1));
        const thisFace = polygon.getClosestFace(thisPoint);
        // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
        const p0 = thisFace.face.begin;
        const u = thisFace.face.getEdge();
        // Time of minimum distance
        let t = (u.x * (otherWorldPos.x - p0.x) + u.y * (otherWorldPos.y - p0.y)) / (u.x * u.x + u.y * u.y);
        // If time of minimum is past the edge clamp
        if (t > 1) {
            t = 1;
        }
        else if (t < 0) {
            t = 0;
        }
        // Minimum distance
        const d = Math.sqrt(Math.pow(p0.x + u.x * t - otherWorldPos.x, 2) + Math.pow(p0.y + u.y * t - otherWorldPos.y, 2)) - circle.radius;
        const circlex = ((p0.x + u.x * t - otherWorldPos.x) * circle.radius) / (circle.radius + d);
        const circley = ((p0.y + u.y * t - otherWorldPos.y) * circle.radius) / (circle.radius + d);
        return new LineSegment(u.scale(t).add(p0), new vector_Vector(otherWorldPos.x + circlex, otherWorldPos.y + circley));
    },
    CircleCircleClosestLine(circleA, circleB) {
        // Find the 2 closest faces on each polygon
        const otherWorldPos = circleB.worldPos;
        const otherDirection = otherWorldPos.sub(circleA.worldPos);
        const thisWorldPos = circleA.worldPos;
        const thisDirection = thisWorldPos.sub(circleB.worldPos);
        const rayTowardsOther = new Ray(circleA.worldPos, otherDirection);
        const rayTowardsThis = new Ray(circleB.worldPos, thisDirection);
        const thisPoint = circleA.rayCast(rayTowardsOther);
        const otherPoint = circleB.rayCast(rayTowardsThis);
        return new LineSegment(thisPoint, otherPoint);
    },
    CircleEdgeClosestLine(circle, edge) {
        // https://math.stackexchange.com/questions/1919177/how-to-find-point-on-line-closest-to-sphere
        const circleWorlPos = circle.worldPos;
        // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
        const edgeLine = edge.asLine();
        const edgeStart = edgeLine.begin;
        const edgeVector = edgeLine.getEdge();
        const p0 = edgeStart;
        const u = edgeVector;
        // Time of minimum distance
        let t = (u.x * (circleWorlPos.x - p0.x) + u.y * (circleWorlPos.y - p0.y)) / (u.x * u.x + u.y * u.y);
        // If time of minimum is past the edge clamp to edge
        if (t > 1) {
            t = 1;
        }
        else if (t < 0) {
            t = 0;
        }
        // Minimum distance
        const d = Math.sqrt(Math.pow(p0.x + u.x * t - circleWorlPos.x, 2) + Math.pow(p0.y + u.y * t - circleWorlPos.y, 2)) - circle.radius;
        const circlex = ((p0.x + u.x * t - circleWorlPos.x) * circle.radius) / (circle.radius + d);
        const circley = ((p0.y + u.y * t - circleWorlPos.y) * circle.radius) / (circle.radius + d);
        return new LineSegment(u.scale(t).add(p0), new vector_Vector(circleWorlPos.x + circlex, circleWorlPos.y + circley));
    },
    EdgeEdgeClosestLine(edgeA, edgeB) {
        // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
        const edgeLineA = edgeA.asLine();
        const edgeStartA = edgeLineA.begin;
        const edgeVectorA = edgeLineA.getEdge();
        const p0 = edgeStartA;
        const u = edgeVectorA;
        // L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
        const edgeLineB = edgeB.asLine();
        const edgeStartB = edgeLineB.begin;
        const edgeVectorB = edgeLineB.getEdge();
        const q0 = edgeStartB;
        const v = edgeVectorB;
        return ClosestLine(p0, u, q0, v);
    }
};

;// CONCATENATED MODULE: ./Collision/Colliders/CircleCollider.ts









/**
 * This is a circle collider for the excalibur rigid body physics simulation
 */
class CircleCollider extends Collider {
    constructor(options) {
        super();
        /**
         * Position of the circle relative to the collider, by default (0, 0).
         */
        this.offset = vector_Vector.Zero;
        this.offset = options.offset || vector_Vector.Zero;
        this.radius = options.radius || 0;
    }
    get worldPos() {
        var _a, _b, _c, _d;
        const tx = this._transform;
        const scale = (_a = tx === null || tx === void 0 ? void 0 : tx.globalScale) !== null && _a !== void 0 ? _a : vector_Vector.One;
        const rotation = (_b = tx === null || tx === void 0 ? void 0 : tx.globalRotation) !== null && _b !== void 0 ? _b : 0;
        const pos = ((_c = tx === null || tx === void 0 ? void 0 : tx.globalPos) !== null && _c !== void 0 ? _c : vector_Vector.Zero);
        return ((_d = this.offset) !== null && _d !== void 0 ? _d : vector_Vector.Zero).scale(scale).rotate(rotation).add(pos);
    }
    /**
     * Get the radius of the circle
     */
    get radius() {
        var _a;
        const tx = this._transform;
        const scale = (_a = tx === null || tx === void 0 ? void 0 : tx.globalScale) !== null && _a !== void 0 ? _a : vector_Vector.One;
        // This is a trade off, the alternative is retooling circles to support ellipse collisions
        return this._naturalRadius * Math.min(scale.x, scale.y);
    }
    /**
     * Set the radius of the circle
     */
    set radius(val) {
        var _a;
        const tx = this._transform;
        const scale = (_a = tx === null || tx === void 0 ? void 0 : tx.globalScale) !== null && _a !== void 0 ? _a : vector_Vector.One;
        // This is a trade off, the alternative is retooling circles to support ellipse collisions
        this._naturalRadius = val / Math.min(scale.x, scale.y);
    }
    /**
     * Returns a clone of this shape, not associated with any collider
     */
    clone() {
        return new CircleCollider({
            offset: this.offset.clone(),
            radius: this.radius
        });
    }
    /**
     * Get the center of the collider in world coordinates
     */
    get center() {
        var _a, _b, _c, _d;
        const tx = this._transform;
        const scale = (_a = tx === null || tx === void 0 ? void 0 : tx.globalScale) !== null && _a !== void 0 ? _a : vector_Vector.One;
        const rotation = (_b = tx === null || tx === void 0 ? void 0 : tx.globalRotation) !== null && _b !== void 0 ? _b : 0;
        const pos = ((_c = tx === null || tx === void 0 ? void 0 : tx.globalPos) !== null && _c !== void 0 ? _c : vector_Vector.Zero);
        return ((_d = this.offset) !== null && _d !== void 0 ? _d : vector_Vector.Zero).scale(scale).rotate(rotation).add(pos);
    }
    /**
     * Tests if a point is contained in this collider
     */
    contains(point) {
        var _a, _b;
        const pos = (_b = (_a = this._transform) === null || _a === void 0 ? void 0 : _a.pos) !== null && _b !== void 0 ? _b : this.offset;
        const distance = pos.distance(point);
        if (distance <= this.radius) {
            return true;
        }
        return false;
    }
    /**
     * Casts a ray at the Circle collider and returns the nearest point of collision
     * @param ray
     */
    rayCast(ray, max = Infinity) {
        //https://en.wikipedia.org/wiki/Line%E2%80%93sphere_intersection
        const c = this.center;
        const dir = ray.dir;
        const orig = ray.pos;
        const discriminant = Math.sqrt(Math.pow(dir.dot(orig.sub(c)), 2) - Math.pow(orig.sub(c).distance(), 2) + Math.pow(this.radius, 2));
        if (discriminant < 0) {
            // no intersection
            return null;
        }
        else {
            let toi = 0;
            if (discriminant === 0) {
                toi = -dir.dot(orig.sub(c));
                if (toi > 0 && toi < max) {
                    return ray.getPoint(toi);
                }
                return null;
            }
            else {
                const toi1 = -dir.dot(orig.sub(c)) + discriminant;
                const toi2 = -dir.dot(orig.sub(c)) - discriminant;
                const positiveToi = [];
                if (toi1 >= 0) {
                    positiveToi.push(toi1);
                }
                if (toi2 >= 0) {
                    positiveToi.push(toi2);
                }
                const mintoi = Math.min(...positiveToi);
                if (mintoi <= max) {
                    return ray.getPoint(mintoi);
                }
                return null;
            }
        }
    }
    getClosestLineBetween(shape) {
        if (shape instanceof CircleCollider) {
            return ClosestLineJumpTable.CircleCircleClosestLine(this, shape);
        }
        else if (shape instanceof PolygonCollider) {
            return ClosestLineJumpTable.PolygonCircleClosestLine(shape, this).flip();
        }
        else if (shape instanceof EdgeCollider) {
            return ClosestLineJumpTable.CircleEdgeClosestLine(this, shape).flip();
        }
        else {
            throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof shape}`);
        }
    }
    /**
     * @inheritdoc
     */
    collide(collider) {
        if (collider instanceof CircleCollider) {
            return CollisionJumpTable.CollideCircleCircle(this, collider);
        }
        else if (collider instanceof PolygonCollider) {
            return CollisionJumpTable.CollideCirclePolygon(this, collider);
        }
        else if (collider instanceof EdgeCollider) {
            return CollisionJumpTable.CollideCircleEdge(this, collider);
        }
        else {
            throw new Error(`Circle could not collide with unknown CollisionShape ${typeof collider}`);
        }
    }
    /**
     * Find the point on the collider furthest in the direction specified
     */
    getFurthestPoint(direction) {
        return this.center.add(direction.normalize().scale(this.radius));
    }
    /**
     * Find the local point on the shape in the direction specified
     * @param direction
     */
    getFurthestLocalPoint(direction) {
        const dir = direction.normalize();
        return dir.scale(this.radius);
    }
    /**
     * Get the axis aligned bounding box for the circle collider in world coordinates
     */
    get bounds() {
        var _a, _b, _c;
        const tx = this._transform;
        const scale = (_a = tx === null || tx === void 0 ? void 0 : tx.globalScale) !== null && _a !== void 0 ? _a : vector_Vector.One;
        const rotation = (_b = tx === null || tx === void 0 ? void 0 : tx.globalRotation) !== null && _b !== void 0 ? _b : 0;
        const pos = ((_c = tx === null || tx === void 0 ? void 0 : tx.globalPos) !== null && _c !== void 0 ? _c : vector_Vector.Zero);
        return new BoundingBox(this.offset.x - this._naturalRadius, this.offset.y - this._naturalRadius, this.offset.x + this._naturalRadius, this.offset.y + this._naturalRadius).rotate(rotation).scale(scale).translate(pos);
    }
    /**
     * Get the axis aligned bounding box for the circle collider in local coordinates
     */
    get localBounds() {
        return new BoundingBox(this.offset.x - this._naturalRadius, this.offset.y - this._naturalRadius, this.offset.x + this._naturalRadius, this.offset.y + this._naturalRadius);
    }
    /**
     * Get axis not implemented on circles, since there are infinite axis in a circle
     */
    get axes() {
        return [];
    }
    /**
     * Returns the moment of inertia of a circle given it's mass
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    getInertia(mass) {
        return (mass * this.radius * this.radius) / 2;
    }
    /* istanbul ignore next */
    update(transform) {
        this._transform = transform;
    }
    /**
     * Project the circle along a specified axis
     */
    project(axis) {
        const scalars = [];
        const point = this.center;
        const dotProduct = point.dot(axis);
        scalars.push(dotProduct);
        scalars.push(dotProduct + this.radius);
        scalars.push(dotProduct - this.radius);
        return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
    }
    debug(ex, color) {
        var _a, _b, _c, _d;
        const tx = this._transform;
        const scale = (_a = tx === null || tx === void 0 ? void 0 : tx.globalScale) !== null && _a !== void 0 ? _a : vector_Vector.One;
        const rotation = (_b = tx === null || tx === void 0 ? void 0 : tx.globalRotation) !== null && _b !== void 0 ? _b : 0;
        const pos = ((_c = tx === null || tx === void 0 ? void 0 : tx.globalPos) !== null && _c !== void 0 ? _c : vector_Vector.Zero);
        ex.save();
        ex.translate(pos.x, pos.y);
        ex.rotate(rotation);
        ex.scale(scale.x, scale.y);
        ex.drawCircle(((_d = this.offset) !== null && _d !== void 0 ? _d : vector_Vector.Zero), this._naturalRadius, Color.Transparent, color, 2);
        ex.restore();
    }
}

;// CONCATENATED MODULE: ./Collision/Detection/CollisionContact.ts




/**
 * Collision contacts are used internally by Excalibur to resolve collision between colliders. This
 * Pair prevents collisions from being evaluated more than one time
 */
class CollisionContact {
    constructor(colliderA, colliderB, mtv, normal, tangent, points, localPoints, info) {
        var _a, _b;
        this._canceled = false;
        this.colliderA = colliderA;
        this.colliderB = colliderB;
        this.mtv = mtv;
        this.normal = normal;
        this.tangent = tangent;
        this.points = points;
        this.localPoints = localPoints;
        this.info = info;
        this.id = Pair.calculatePairHash(colliderA.id, colliderB.id);
        if (colliderA.__compositeColliderId || colliderB.__compositeColliderId) {
            // Add on the parent composite pair for start/end contact
            this.id += '|' + Pair.calculatePairHash((_a = colliderA.__compositeColliderId) !== null && _a !== void 0 ? _a : colliderA.id, (_b = colliderB.__compositeColliderId) !== null && _b !== void 0 ? _b : colliderB.id);
        }
    }
    /**
     * Match contact awake state, except if body's are Fixed
     */
    matchAwake() {
        const bodyA = this.colliderA.owner.get(BodyComponent);
        const bodyB = this.colliderB.owner.get(BodyComponent);
        if (bodyA && bodyB) {
            if (bodyA.sleeping !== bodyB.sleeping) {
                if (bodyA.sleeping && bodyA.collisionType !== CollisionType.Fixed && bodyB.sleepMotion >= Physics.wakeThreshold) {
                    bodyA.setSleeping(false);
                }
                if (bodyB.sleeping && bodyB.collisionType !== CollisionType.Fixed && bodyA.sleepMotion >= Physics.wakeThreshold) {
                    bodyB.setSleeping(false);
                }
            }
        }
    }
    isCanceled() {
        return this._canceled;
    }
    cancel() {
        this._canceled = true;
    }
}

;// CONCATENATED MODULE: ./Collision/Colliders/SeparatingAxis.ts
class SeparatingAxis {
    static findPolygonPolygonSeparation(polyA, polyB) {
        let bestSeparation = -Number.MAX_VALUE;
        let bestSide = null;
        let bestAxis = null;
        let bestSideIndex = -1;
        let bestOtherPoint = null;
        const sides = polyA.getSides();
        const localSides = polyA.getLocalSides();
        for (let i = 0; i < sides.length; i++) {
            const side = sides[i];
            const axis = side.normal();
            const vertB = polyB.getFurthestPoint(axis.negate());
            // Separation on side i's axis
            // We are looking for the largest separation between poly A's sides
            const vertSeparation = side.distanceToPoint(vertB, true);
            if (vertSeparation > bestSeparation) {
                bestSeparation = vertSeparation;
                bestSide = side;
                bestAxis = axis;
                bestSideIndex = i;
                bestOtherPoint = vertB;
            }
        }
        return {
            collider: polyA,
            separation: bestAxis ? bestSeparation : 99,
            axis: bestAxis,
            side: bestSide,
            localSide: localSides[bestSideIndex],
            sideId: bestSideIndex,
            point: bestOtherPoint,
            localPoint: bestAxis ? polyB.getFurthestLocalPoint(bestAxis.negate()) : null
        };
    }
    static findCirclePolygonSeparation(circle, polygon) {
        const axes = polygon.axes;
        const pc = polygon.center;
        // Special SAT with circles
        const polyDir = pc.sub(circle.worldPos);
        const closestPointOnPoly = polygon.getFurthestPoint(polyDir.negate());
        axes.push(closestPointOnPoly.sub(circle.worldPos).normalize());
        let minOverlap = Number.MAX_VALUE;
        let minAxis = null;
        let minIndex = -1;
        for (let i = 0; i < axes.length; i++) {
            const proj1 = polygon.project(axes[i]);
            const proj2 = circle.project(axes[i]);
            const overlap = proj1.getOverlap(proj2);
            if (overlap <= 0) {
                return null;
            }
            else {
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    minAxis = axes[i];
                    minIndex = i;
                }
            }
        }
        if (minIndex < 0) {
            return null;
        }
        return minAxis.normalize().scale(minOverlap);
    }
}

;// CONCATENATED MODULE: ./Collision/Colliders/CollisionJumpTable.ts








const CollisionJumpTable = {
    CollideCircleCircle(circleA, circleB) {
        const circleAPos = circleA.worldPos;
        const circleBPos = circleB.worldPos;
        const combinedRadius = circleA.radius + circleB.radius;
        const distance = circleAPos.distance(circleBPos);
        if (distance > combinedRadius) {
            return [];
        }
        // negative means overlap
        const separation = combinedRadius - distance;
        // Normal points from A -> B
        const normal = circleBPos.sub(circleAPos).normalize();
        const tangent = normal.perpendicular();
        const mvt = normal.scale(separation);
        const point = circleA.getFurthestPoint(normal);
        const local = circleA.getFurthestLocalPoint(normal);
        const info = {
            collider: circleA,
            separation,
            axis: normal,
            point: point
        };
        return [new CollisionContact(circleA, circleB, mvt, normal, tangent, [point], [local], info)];
    },
    CollideCirclePolygon(circle, polygon) {
        var _a, _b;
        let minAxis = SeparatingAxis.findCirclePolygonSeparation(circle, polygon);
        if (!minAxis) {
            return [];
        }
        // make sure that the minAxis is pointing away from circle
        const samedir = minAxis.dot(polygon.center.sub(circle.center));
        minAxis = samedir < 0 ? minAxis.negate() : minAxis;
        const point = circle.getFurthestPoint(minAxis);
        const xf = (_b = (_a = circle.owner) === null || _a === void 0 ? void 0 : _a.get(TransformComponent)) !== null && _b !== void 0 ? _b : new TransformComponent();
        const local = xf.applyInverse(point);
        const normal = minAxis.normalize();
        const info = {
            collider: circle,
            separation: -minAxis.size,
            axis: normal,
            point: point,
            localPoint: local,
            side: polygon.findSide(normal.negate()),
            localSide: polygon.findLocalSide(normal.negate())
        };
        return [new CollisionContact(circle, polygon, minAxis, normal, normal.perpendicular(), [point], [local], info)];
    },
    CollideCircleEdge(circle, edge) {
        // TODO not sure this actually abides by local/world collisions
        // Are edge.begin and edge.end local space or world space? I think they should be local
        // center of the circle in world pos
        const cc = circle.center;
        // vector in the direction of the edge
        const edgeWorld = edge.asLine();
        const e = edgeWorld.end.sub(edgeWorld.begin);
        // amount of overlap with the circle's center along the edge direction
        const u = e.dot(edgeWorld.end.sub(cc));
        const v = e.dot(cc.sub(edgeWorld.begin));
        const side = edge.asLine();
        const localSide = edge.asLocalLine();
        // Potential region A collision (circle is on the left side of the edge, before the beginning)
        if (v <= 0) {
            const da = edgeWorld.begin.sub(cc);
            const dda = da.dot(da); // quick and dirty way of calc'n distance in r^2 terms saves some sqrts
            // save some sqrts
            if (dda > circle.radius * circle.radius) {
                return []; // no collision
            }
            const normal = da.normalize();
            const separation = circle.radius - Math.sqrt(dda);
            const info = {
                collider: circle,
                separation: separation,
                axis: normal,
                point: side.begin,
                side: side,
                localSide: localSide
            };
            return [
                new CollisionContact(circle, edge, normal.scale(separation), normal, normal.perpendicular(), [side.begin], [localSide.begin], info)
            ];
        }
        // Potential region B collision (circle is on the right side of the edge, after the end)
        if (u <= 0) {
            const db = edgeWorld.end.sub(cc);
            const ddb = db.dot(db);
            if (ddb > circle.radius * circle.radius) {
                return [];
            }
            const normal = db.normalize();
            const separation = circle.radius - Math.sqrt(ddb);
            const info = {
                collider: circle,
                separation: separation,
                axis: normal,
                point: side.end,
                side: side,
                localSide: localSide
            };
            return [
                new CollisionContact(circle, edge, normal.scale(separation), normal, normal.perpendicular(), [side.end], [localSide.end], info)
            ];
        }
        // Otherwise potential region AB collision (circle is in the middle of the edge between the beginning and end)
        const den = e.dot(e);
        const pointOnEdge = edgeWorld.begin
            .scale(u)
            .add(edgeWorld.end.scale(v))
            .scale(1 / den);
        const d = cc.sub(pointOnEdge);
        const dd = d.dot(d);
        if (dd > circle.radius * circle.radius) {
            return []; // no collision
        }
        let normal = e.perpendicular();
        // flip correct direction
        if (normal.dot(cc.sub(edgeWorld.begin)) < 0) {
            normal.x = -normal.x;
            normal.y = -normal.y;
        }
        normal = normal.normalize();
        const separation = circle.radius - Math.sqrt(dd);
        const mvt = normal.scale(separation);
        const info = {
            collider: circle,
            separation: separation,
            axis: normal,
            point: pointOnEdge,
            side: side,
            localSide: localSide
        };
        return [
            new CollisionContact(circle, edge, mvt, normal.negate(), normal.negate().perpendicular(), [pointOnEdge], [pointOnEdge.sub(edge.worldPos)], info)
        ];
    },
    CollideEdgeEdge() {
        // Edge-edge collision doesn't make sense
        return [];
    },
    CollidePolygonEdge(polygon, edge) {
        var _a;
        const pc = polygon.center;
        const ec = edge.center;
        const dir = ec.sub(pc).normalize();
        // build a temporary polygon from the edge to use SAT
        const linePoly = new PolygonCollider({
            points: [edge.begin, edge.end, edge.end.add(dir.scale(100)), edge.begin.add(dir.scale(100))],
            offset: edge.offset
        });
        linePoly.owner = edge.owner;
        const tx = (_a = edge.owner) === null || _a === void 0 ? void 0 : _a.get(TransformComponent);
        if (tx) {
            linePoly.update(edge.owner.get(TransformComponent).get());
        }
        // Gross hack but poly-poly works well
        const contact = this.CollidePolygonPolygon(polygon, linePoly);
        if (contact.length) {
            // Fudge the contact back to edge
            contact[0].colliderB = edge;
            contact[0].id = Pair.calculatePairHash(polygon.id, edge.id);
            // contact[0].info.collider
        }
        return contact;
    },
    CollidePolygonPolygon(polyA, polyB) {
        var _a, _b, _c, _d;
        // Multi contact from SAT
        // https://gamedev.stackexchange.com/questions/111390/multiple-contacts-for-sat-collision-detection
        // do a SAT test to find a min axis if it exists
        const separationA = SeparatingAxis.findPolygonPolygonSeparation(polyA, polyB);
        // If there is no overlap from boxA's perspective we can end early
        if (separationA.separation > 0) {
            return [];
        }
        const separationB = SeparatingAxis.findPolygonPolygonSeparation(polyB, polyA);
        // If there is no overlap from boxB's perspective exit now
        if (separationB.separation > 0) {
            return [];
        }
        // Separations are both negative, we want to pick the least negative (minimal movement)
        const separation = separationA.separation > separationB.separation ? separationA : separationB;
        // The incident side is the most opposite from the axes of collision on the other collider
        const other = separation.collider === polyA ? polyB : polyA;
        const incident = other.findSide(separation.axis.negate());
        // Clip incident side by the perpendicular lines at each end of the reference side
        // https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
        const reference = separation.side;
        const refDir = reference.dir().normalize();
        // Find our contact points by clipping the incident by the collision side
        const clipRight = incident.clip(refDir.negate(), -refDir.dot(reference.begin));
        let clipLeft = null;
        if (clipRight) {
            clipLeft = clipRight.clip(refDir, refDir.dot(reference.end));
        }
        // If there is no left there is no collision
        if (clipLeft) {
            // We only want clip points below the reference edge, discard the others
            const points = clipLeft.getPoints().filter((p) => {
                return reference.below(p);
            });
            let normal = separation.axis;
            let tangent = normal.perpendicular();
            // Point Contact A -> B
            if (polyB.center.sub(polyA.center).dot(normal) < 0) {
                normal = normal.negate();
                tangent = normal.perpendicular();
            }
            // Points are clipped from incident which is the other collider
            // Store those as locals
            let localPoints = [];
            if (separation.collider === polyA) {
                const xf = (_b = (_a = polyB.owner) === null || _a === void 0 ? void 0 : _a.get(TransformComponent)) !== null && _b !== void 0 ? _b : new TransformComponent();
                localPoints = points.map((p) => xf.applyInverse(p));
            }
            else {
                const xf = (_d = (_c = polyA.owner) === null || _c === void 0 ? void 0 : _c.get(TransformComponent)) !== null && _d !== void 0 ? _d : new TransformComponent();
                localPoints = points.map((p) => xf.applyInverse(p));
            }
            return [new CollisionContact(polyA, polyB, normal.scale(-separation.separation), normal, tangent, points, localPoints, separation)];
        }
        return [];
    },
    FindContactSeparation(contact, localPoint) {
        var _a, _b, _c, _d;
        const shapeA = contact.colliderA;
        const txA = (_b = (_a = contact.colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(TransformComponent)) !== null && _b !== void 0 ? _b : new TransformComponent();
        const shapeB = contact.colliderB;
        const txB = (_d = (_c = contact.colliderB.owner) === null || _c === void 0 ? void 0 : _c.get(TransformComponent)) !== null && _d !== void 0 ? _d : new TransformComponent();
        // both are circles
        if (shapeA instanceof CircleCollider && shapeB instanceof CircleCollider) {
            const combinedRadius = shapeA.radius + shapeB.radius;
            const distance = txA.pos.distance(txB.pos);
            const separation = combinedRadius - distance;
            return -separation;
        }
        // both are polygons
        if (shapeA instanceof PolygonCollider && shapeB instanceof PolygonCollider) {
            if (contact.info.localSide) {
                let side;
                let worldPoint;
                if (contact.info.collider === shapeA) {
                    side = new LineSegment(txA.apply(contact.info.localSide.begin), txA.apply(contact.info.localSide.end));
                    worldPoint = txB.apply(localPoint);
                }
                else {
                    side = new LineSegment(txB.apply(contact.info.localSide.begin), txB.apply(contact.info.localSide.end));
                    worldPoint = txA.apply(localPoint);
                }
                return side.distanceToPoint(worldPoint, true);
            }
        }
        // polygon v circle
        if ((shapeA instanceof PolygonCollider && shapeB instanceof CircleCollider) ||
            (shapeB instanceof PolygonCollider && shapeA instanceof CircleCollider)) {
            const worldPoint = txA.apply(localPoint);
            if (contact.info.side) {
                return contact.info.side.distanceToPoint(worldPoint, true);
            }
        }
        // polygon v edge
        if ((shapeA instanceof EdgeCollider && shapeB instanceof PolygonCollider) ||
            (shapeB instanceof EdgeCollider && shapeA instanceof PolygonCollider)) {
            let worldPoint;
            if (contact.info.collider === shapeA) {
                worldPoint = txB.apply(localPoint);
            }
            else {
                worldPoint = txA.apply(localPoint);
            }
            if (contact.info.side) {
                return contact.info.side.distanceToPoint(worldPoint, true);
            }
        }
        // circle v edge
        if ((shapeA instanceof CircleCollider && shapeB instanceof EdgeCollider) ||
            (shapeB instanceof CircleCollider && shapeA instanceof EdgeCollider)) {
            // Local point is always on the edge which is always shapeB
            const worldPoint = txB.apply(localPoint);
            let circlePoint;
            if (shapeA instanceof CircleCollider) {
                circlePoint = shapeA.getFurthestPoint(contact.normal);
            }
            const dist = worldPoint.distance(circlePoint);
            if (contact.info.side) {
                return dist > 0 ? -dist : 0;
            }
        }
        return 0;
    }
};

;// CONCATENATED MODULE: ./Collision/Colliders/EdgeCollider.ts









/**
 * Edge is a single line collider to create collisions with a single line.
 */
class EdgeCollider extends Collider {
    constructor(options) {
        var _a;
        super();
        this.begin = options.begin || vector_Vector.Zero;
        this.end = options.end || vector_Vector.Zero;
        this.offset = (_a = options.offset) !== null && _a !== void 0 ? _a : vector_Vector.Zero;
    }
    /**
     * Returns a clone of this Edge, not associated with any collider
     */
    clone() {
        return new EdgeCollider({
            begin: this.begin.clone(),
            end: this.end.clone()
        });
    }
    get worldPos() {
        var _a;
        const tx = this._transform;
        return (_a = tx === null || tx === void 0 ? void 0 : tx.globalPos.add(this.offset)) !== null && _a !== void 0 ? _a : this.offset;
    }
    /**
     * Get the center of the collision area in world coordinates
     */
    get center() {
        const pos = this.begin.average(this.end).add(this._getBodyPos());
        return pos;
    }
    _getBodyPos() {
        var _a;
        const tx = this._transform;
        const bodyPos = (_a = tx === null || tx === void 0 ? void 0 : tx.globalPos) !== null && _a !== void 0 ? _a : vector_Vector.Zero;
        return bodyPos;
    }
    _getTransformedBegin() {
        const tx = this._transform;
        const angle = tx ? tx.globalRotation : 0;
        return this.begin.rotate(angle).add(this._getBodyPos());
    }
    _getTransformedEnd() {
        const tx = this._transform;
        const angle = tx ? tx.globalRotation : 0;
        return this.end.rotate(angle).add(this._getBodyPos());
    }
    /**
     * Returns the slope of the line in the form of a vector
     */
    getSlope() {
        const begin = this._getTransformedBegin();
        const end = this._getTransformedEnd();
        const distance = begin.distance(end);
        return end.sub(begin).scale(1 / distance);
    }
    /**
     * Returns the length of the line segment in pixels
     */
    getLength() {
        const begin = this._getTransformedBegin();
        const end = this._getTransformedEnd();
        const distance = begin.distance(end);
        return distance;
    }
    /**
     * Tests if a point is contained in this collision area
     */
    contains() {
        return false;
    }
    /**
     * @inheritdoc
     */
    rayCast(ray, max = Infinity) {
        const numerator = this._getTransformedBegin().sub(ray.pos);
        // Test is line and ray are parallel and non intersecting
        if (ray.dir.cross(this.getSlope()) === 0 && numerator.cross(ray.dir) !== 0) {
            return null;
        }
        // Lines are parallel
        const divisor = ray.dir.cross(this.getSlope());
        if (divisor === 0) {
            return null;
        }
        const t = numerator.cross(this.getSlope()) / divisor;
        if (t >= 0 && t <= max) {
            const u = numerator.cross(ray.dir) / divisor / this.getLength();
            if (u >= 0 && u <= 1) {
                return ray.getPoint(t);
            }
        }
        return null;
    }
    /**
     * Returns the closes line between this and another collider, from this -> collider
     * @param shape
     */
    getClosestLineBetween(shape) {
        if (shape instanceof CircleCollider) {
            return ClosestLineJumpTable.CircleEdgeClosestLine(shape, this);
        }
        else if (shape instanceof PolygonCollider) {
            return ClosestLineJumpTable.PolygonEdgeClosestLine(shape, this).flip();
        }
        else if (shape instanceof EdgeCollider) {
            return ClosestLineJumpTable.EdgeEdgeClosestLine(this, shape);
        }
        else {
            throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof shape}`);
        }
    }
    /**
     * @inheritdoc
     */
    collide(shape) {
        if (shape instanceof CircleCollider) {
            return CollisionJumpTable.CollideCircleEdge(shape, this);
        }
        else if (shape instanceof PolygonCollider) {
            return CollisionJumpTable.CollidePolygonEdge(shape, this);
        }
        else if (shape instanceof EdgeCollider) {
            return CollisionJumpTable.CollideEdgeEdge();
        }
        else {
            throw new Error(`Edge could not collide with unknown CollisionShape ${typeof shape}`);
        }
    }
    /**
     * Find the point on the collider furthest in the direction specified
     */
    getFurthestPoint(direction) {
        const transformedBegin = this._getTransformedBegin();
        const transformedEnd = this._getTransformedEnd();
        if (direction.dot(transformedBegin) > 0) {
            return transformedBegin;
        }
        else {
            return transformedEnd;
        }
    }
    _boundsFromBeginEnd(begin, end, padding = 10) {
        // A perfectly vertical or horizontal edge would have a bounds 0 width or height
        // this causes problems for the collision system so we give them some padding
        return new BoundingBox(Math.min(begin.x, end.x) - padding, Math.min(begin.y, end.y) - padding, Math.max(begin.x, end.x) + padding, Math.max(begin.y, end.y) + padding);
    }
    /**
     * Get the axis aligned bounding box for the edge collider in world space
     */
    get bounds() {
        const transformedBegin = this._getTransformedBegin();
        const transformedEnd = this._getTransformedEnd();
        return this._boundsFromBeginEnd(transformedBegin, transformedEnd);
    }
    /**
     * Get the axis aligned bounding box for the edge collider in local space
     */
    get localBounds() {
        return this._boundsFromBeginEnd(this.begin, this.end);
    }
    /**
     * Returns this edge represented as a line in world coordinates
     */
    asLine() {
        return new LineSegment(this._getTransformedBegin(), this._getTransformedEnd());
    }
    /**
     * Return this edge as a line in local line coordinates (relative to the position)
     */
    asLocalLine() {
        return new LineSegment(this.begin, this.end);
    }
    /**
     * Get the axis associated with the edge
     */
    get axes() {
        const e = this._getTransformedEnd().sub(this._getTransformedBegin());
        const edgeNormal = e.normal();
        const axes = [];
        axes.push(edgeNormal);
        axes.push(edgeNormal.negate());
        axes.push(edgeNormal.normal());
        axes.push(edgeNormal.normal().negate());
        return axes;
    }
    /**
     * Get the moment of inertia for an edge
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    getInertia(mass) {
        const length = this.end.sub(this.begin).distance() / 2;
        return mass * length * length;
    }
    /**
     * @inheritdoc
     */
    update(transform) {
        this._transform = transform;
    }
    /**
     * Project the edge along a specified axis
     */
    project(axis) {
        const scalars = [];
        const points = [this._getTransformedBegin(), this._getTransformedEnd()];
        const len = points.length;
        for (let i = 0; i < len; i++) {
            scalars.push(points[i].dot(axis));
        }
        return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
    }
    debug(ex, color) {
        const begin = this._getTransformedBegin();
        const end = this._getTransformedEnd();
        ex.drawLine(begin, end, color, 2);
        ex.drawCircle(begin, 2, color);
        ex.drawCircle(end, 2, color);
    }
}

;// CONCATENATED MODULE: ./Collision/Colliders/PolygonCollider.ts














/**
 * Polygon collider for detecting collisions
 */
class PolygonCollider extends Collider {
    constructor(options) {
        var _a, _b;
        super();
        this._logger = Logger.getInstance();
        this._transformedPoints = [];
        this._axes = [];
        this._sides = [];
        this._localSides = [];
        this._globalMatrix = AffineMatrix.identity();
        this._localBoundsDirty = true;
        this.offset = (_a = options.offset) !== null && _a !== void 0 ? _a : vector_Vector.Zero;
        this._globalMatrix.translate(this.offset.x, this.offset.y);
        this.points = (_b = options.points) !== null && _b !== void 0 ? _b : [];
        const counterClockwise = this._isCounterClockwiseWinding(this.points);
        if (!counterClockwise) {
            this.points.reverse();
        }
        if (!this.isConvex()) {
            this._logger.warn('Excalibur only supports convex polygon colliders and will not behave properly.' +
                'Call PolygonCollider.triangulate() to build a new collider composed of smaller convex triangles');
        }
        // calculate initial transformation
        this._calculateTransformation();
    }
    /**
     * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
     * Excalibur stores these in counter-clockwise order
     */
    set points(points) {
        this._localBoundsDirty = true;
        this._points = points;
    }
    /**
     * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
     * Excalibur stores these in counter-clockwise order
     */
    get points() {
        return this._points;
    }
    _isCounterClockwiseWinding(points) {
        // https://stackoverflow.com/a/1165943
        let sum = 0;
        for (let i = 0; i < points.length; i++) {
            sum += (points[(i + 1) % points.length].x - points[i].x) * (points[(i + 1) % points.length].y + points[i].y);
        }
        return sum < 0;
    }
    /**
     * Returns if the polygon collider is convex, Excalibur does not handle non-convex collision shapes.
     * Call [[Polygon.triangulate]] to generate a [[CompositeCollider]] from this non-convex shape
     */
    isConvex() {
        // From SO: https://stackoverflow.com/a/45372025
        if (this.points.length < 3) {
            return false;
        }
        let oldPoint = this.points[this.points.length - 2];
        let newPoint = this.points[this.points.length - 1];
        let direction = Math.atan2(newPoint.y - oldPoint.y, newPoint.x - oldPoint.x);
        let oldDirection = 0;
        let orientation = 0;
        let angleSum = 0;
        for (const [i, point] of this.points.entries()) {
            oldPoint = newPoint;
            oldDirection = direction;
            newPoint = point;
            direction = Math.atan2(newPoint.y - oldPoint.y, newPoint.x - oldPoint.x);
            if (oldPoint.equals(newPoint)) {
                return false; // repeat point
            }
            let angle = direction - oldDirection;
            if (angle <= -Math.PI) {
                angle += Math.PI * 2;
            }
            else if (angle > Math.PI) {
                angle -= Math.PI * 2;
            }
            if (i === 0) {
                if (angle === 0.0) {
                    return false;
                }
                orientation = angle > 0 ? 1 : -1;
            }
            else {
                if (orientation * angle <= 0) {
                    return false;
                }
            }
            angleSum += angle;
        }
        return Math.abs(Math.round(angleSum / (Math.PI * 2))) === 1;
    }
    /**
     * Tessellates the polygon into a triangle fan as a [[CompositeCollider]] of triangle polygons
     */
    tessellate() {
        const polygons = [];
        for (let i = 1; i < this.points.length - 2; i++) {
            polygons.push([this.points[0], this.points[i + 1], this.points[i + 2]]);
        }
        polygons.push([this.points[0], this.points[1], this.points[2]]);
        return new CompositeCollider(polygons.map(points => Shape.Polygon(points)));
    }
    /**
     * Triangulate the polygon collider using the "Ear Clipping" algorithm.
     * Returns a new [[CompositeCollider]] made up of smaller triangles.
     */
    triangulate() {
        // https://www.youtube.com/watch?v=hTJFcHutls8
        if (this.points.length < 3) {
            throw Error('Invalid polygon');
        }
        /**
         * Helper to get a vertex in the list
         */
        function getItem(index, list) {
            if (index >= list.length) {
                return list[index % list.length];
            }
            else if (index < 0) {
                return list[index % list.length + list.length];
            }
            else {
                return list[index];
            }
        }
        /**
         * Quick test for point in triangle
         */
        function isPointInTriangle(point, a, b, c) {
            const ab = b.sub(a);
            const bc = c.sub(b);
            const ca = a.sub(c);
            const ap = point.sub(a);
            const bp = point.sub(b);
            const cp = point.sub(c);
            const cross1 = ab.cross(ap);
            const cross2 = bc.cross(bp);
            const cross3 = ca.cross(cp);
            if (cross1 > 0 || cross2 > 0 || cross3 > 0) {
                return false;
            }
            return true;
        }
        const triangles = [];
        const vertices = [...this.points];
        const indices = range(0, this.points.length - 1);
        // 1. Loop through vertices clockwise
        //    if the vertex is convex (interior angle is < 180) (cross product positive)
        //    if the polygon formed by it's edges doesn't contain the points
        //         it's an ear add it to our list of triangles, and restart
        while (indices.length > 3) {
            for (let i = 0; i < indices.length; i++) {
                const a = indices[i];
                const b = getItem(i - 1, indices);
                const c = getItem(i + 1, indices);
                const va = vertices[a];
                const vb = vertices[b];
                const vc = vertices[c];
                // Check convexity
                const leftArm = vb.sub(va);
                const rightArm = vc.sub(va);
                const isConvex = rightArm.cross(leftArm) > 0; // positive cross means convex
                if (!isConvex) {
                    continue;
                }
                let isEar = true;
                // Check that if any vertices are in the triangle a, b, c
                for (let j = 0; j < indices.length; j++) {
                    const vertIndex = indices[j];
                    // We can skip these
                    if (vertIndex === a || vertIndex === b || vertIndex === c) {
                        continue;
                    }
                    const point = vertices[vertIndex];
                    if (isPointInTriangle(point, vb, va, vc)) {
                        isEar = false;
                        break;
                    }
                }
                // Add ear to polygon list and remove from list
                if (isEar) {
                    triangles.push([vb, va, vc]);
                    indices.splice(i, 1);
                    break;
                }
            }
        }
        triangles.push([vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]]);
        return new CompositeCollider(triangles.map(points => Shape.Polygon(points)));
    }
    /**
     * Returns a clone of this ConvexPolygon, not associated with any collider
     */
    clone() {
        return new PolygonCollider({
            offset: this.offset.clone(),
            points: this.points.map((p) => p.clone())
        });
    }
    /**
     * Returns the world position of the collider, which is the current body transform plus any defined offset
     */
    get worldPos() {
        if (this._transform) {
            return this._transform.pos.add(this.offset);
        }
        return this.offset;
    }
    /**
     * Get the center of the collider in world coordinates
     */
    get center() {
        return this.bounds.center;
    }
    /**
     * Calculates the underlying transformation from the body relative space to world space
     */
    _calculateTransformation() {
        const len = this.points.length;
        this._transformedPoints.length = 0; // clear out old transform
        for (let i = 0; i < len; i++) {
            this._transformedPoints[i] = this._globalMatrix.multiply(this.points[i].clone());
        }
    }
    /**
     * Gets the points that make up the polygon in world space, from actor relative space (if specified)
     */
    getTransformedPoints() {
        this._calculateTransformation();
        return this._transformedPoints;
    }
    /**
     * Gets the sides of the polygon in world space
     */
    getSides() {
        if (this._sides.length) {
            return this._sides;
        }
        const lines = [];
        const points = this.getTransformedPoints();
        const len = points.length;
        for (let i = 0; i < len; i++) {
            // This winding is important
            lines.push(new LineSegment(points[i], points[(i + 1) % len]));
        }
        this._sides = lines;
        return this._sides;
    }
    /**
     * Returns the local coordinate space sides
     */
    getLocalSides() {
        if (this._localSides.length) {
            return this._localSides;
        }
        const lines = [];
        const points = this.points;
        const len = points.length;
        for (let i = 0; i < len; i++) {
            // This winding is important
            lines.push(new LineSegment(points[i], points[(i + 1) % len]));
        }
        this._localSides = lines;
        return this._localSides;
    }
    /**
     * Given a direction vector find the world space side that is most in that direction
     * @param direction
     */
    findSide(direction) {
        const sides = this.getSides();
        let bestSide = sides[0];
        let maxDistance = -Number.MAX_VALUE;
        for (let side = 0; side < sides.length; side++) {
            const currentSide = sides[side];
            const sideNormal = currentSide.normal();
            const mostDirection = sideNormal.dot(direction);
            if (mostDirection > maxDistance) {
                bestSide = currentSide;
                maxDistance = mostDirection;
            }
        }
        return bestSide;
    }
    /**
     * Given a direction vector find the local space side that is most in that direction
     * @param direction
     */
    findLocalSide(direction) {
        const sides = this.getLocalSides();
        let bestSide = sides[0];
        let maxDistance = -Number.MAX_VALUE;
        for (let side = 0; side < sides.length; side++) {
            const currentSide = sides[side];
            const sideNormal = currentSide.normal();
            const mostDirection = sideNormal.dot(direction);
            if (mostDirection > maxDistance) {
                bestSide = currentSide;
                maxDistance = mostDirection;
            }
        }
        return bestSide;
    }
    /**
     * Get the axis associated with the convex polygon
     */
    get axes() {
        if (this._axes.length) {
            return this._axes;
        }
        const axes = this.getSides().map((s) => s.normal());
        this._axes = axes;
        return this._axes;
    }
    /**
     * Updates the transform for the collision geometry
     *
     * Collision geometry (points/bounds) will not change until this is called.
     * @param transform
     */
    update(transform) {
        var _a;
        this._transform = transform;
        this._sides.length = 0;
        this._localSides.length = 0;
        this._axes.length = 0;
        // This change means an update must be performed in order for geometry to update
        const globalMat = (_a = transform.matrix) !== null && _a !== void 0 ? _a : this._globalMatrix;
        globalMat.clone(this._globalMatrix);
        this._globalMatrix.translate(this.offset.x, this.offset.y);
        this.getTransformedPoints();
        this.getSides();
        this.getLocalSides();
    }
    /**
     * Tests if a point is contained in this collider in world space
     */
    contains(point) {
        // Always cast to the right, as long as we cast in a consistent fixed direction we
        // will be fine
        const testRay = new Ray(point, new vector_Vector(1, 0));
        const intersectCount = this.getSides().reduce(function (accum, side) {
            if (testRay.intersect(side) >= 0) {
                return accum + 1;
            }
            return accum;
        }, 0);
        if (intersectCount % 2 === 0) {
            return false;
        }
        return true;
    }
    getClosestLineBetween(collider) {
        if (collider instanceof CircleCollider) {
            return ClosestLineJumpTable.PolygonCircleClosestLine(this, collider);
        }
        else if (collider instanceof PolygonCollider) {
            return ClosestLineJumpTable.PolygonPolygonClosestLine(this, collider);
        }
        else if (collider instanceof EdgeCollider) {
            return ClosestLineJumpTable.PolygonEdgeClosestLine(this, collider);
        }
        else {
            throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof collider}`);
        }
    }
    /**
     * Returns a collision contact if the 2 colliders collide, otherwise collide will
     * return null.
     * @param collider
     */
    collide(collider) {
        if (collider instanceof CircleCollider) {
            return CollisionJumpTable.CollideCirclePolygon(collider, this);
        }
        else if (collider instanceof PolygonCollider) {
            return CollisionJumpTable.CollidePolygonPolygon(this, collider);
        }
        else if (collider instanceof EdgeCollider) {
            return CollisionJumpTable.CollidePolygonEdge(this, collider);
        }
        else {
            throw new Error(`Polygon could not collide with unknown CollisionShape ${typeof collider}`);
        }
    }
    /**
     * Find the point on the collider furthest in the direction specified
     */
    getFurthestPoint(direction) {
        const pts = this.getTransformedPoints();
        let furthestPoint = null;
        let maxDistance = -Number.MAX_VALUE;
        for (let i = 0; i < pts.length; i++) {
            const distance = direction.dot(pts[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestPoint = pts[i];
            }
        }
        return furthestPoint;
    }
    /**
     * Find the local point on the collider furthest in the direction specified
     * @param direction
     */
    getFurthestLocalPoint(direction) {
        const pts = this.points;
        let furthestPoint = pts[0];
        let maxDistance = -Number.MAX_VALUE;
        for (let i = 0; i < pts.length; i++) {
            const distance = direction.dot(pts[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestPoint = pts[i];
            }
        }
        return furthestPoint;
    }
    /**
     * Finds the closes face to the point using perpendicular distance
     * @param point point to test against polygon
     */
    getClosestFace(point) {
        const sides = this.getSides();
        let min = Number.POSITIVE_INFINITY;
        let faceIndex = -1;
        let distance = -1;
        for (let i = 0; i < sides.length; i++) {
            const dist = sides[i].distanceToPoint(point);
            if (dist < min) {
                min = dist;
                faceIndex = i;
                distance = dist;
            }
        }
        if (faceIndex !== -1) {
            return {
                distance: sides[faceIndex].normal().scale(distance),
                face: sides[faceIndex]
            };
        }
        return null;
    }
    /**
     * Get the axis aligned bounding box for the polygon collider in world coordinates
     */
    get bounds() {
        return this.localBounds.transform(this._globalMatrix);
    }
    /**
     * Get the axis aligned bounding box for the polygon collider in local coordinates
     */
    get localBounds() {
        if (this._localBoundsDirty) {
            this._localBounds = BoundingBox.fromPoints(this.points);
            this._localBoundsDirty = false;
        }
        return this._localBounds;
    }
    /**
     * Get the moment of inertia for an arbitrary polygon
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    getInertia(mass) {
        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < this.points.length; i++) {
            const iplusone = (i + 1) % this.points.length;
            const crossTerm = this.points[iplusone].cross(this.points[i]);
            numerator +=
                crossTerm *
                    (this.points[i].dot(this.points[i]) + this.points[i].dot(this.points[iplusone]) + this.points[iplusone].dot(this.points[iplusone]));
            denominator += crossTerm;
        }
        return (mass / 6) * (numerator / denominator);
    }
    /**
     * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
     */
    rayCast(ray, max = Infinity) {
        // find the minimum contact time greater than 0
        // contact times less than 0 are behind the ray and we don't want those
        const sides = this.getSides();
        const len = sides.length;
        let minContactTime = Number.MAX_VALUE;
        let contactIndex = -1;
        for (let i = 0; i < len; i++) {
            const contactTime = ray.intersect(sides[i]);
            if (contactTime >= 0 && contactTime < minContactTime && contactTime <= max) {
                minContactTime = contactTime;
                contactIndex = i;
            }
        }
        // contact was found
        if (contactIndex >= 0) {
            return ray.getPoint(minContactTime);
        }
        // no contact found
        return null;
    }
    /**
     * Project the edges of the polygon along a specified axis
     */
    project(axis) {
        const points = this.getTransformedPoints();
        const len = points.length;
        let min = Number.MAX_VALUE;
        let max = -Number.MAX_VALUE;
        for (let i = 0; i < len; i++) {
            const scalar = points[i].dot(axis);
            min = Math.min(min, scalar);
            max = Math.max(max, scalar);
        }
        return new Projection(min, max);
    }
    debug(ex, color) {
        const firstPoint = this.getTransformedPoints()[0];
        const points = [firstPoint, ...this.getTransformedPoints(), firstPoint];
        for (let i = 0; i < points.length - 1; i++) {
            ex.drawLine(points[i], points[i + 1], color, 2);
            ex.drawCircle(points[i], 2, color);
            ex.drawCircle(points[i + 1], 2, color);
        }
    }
}

;// CONCATENATED MODULE: ./Collision/Colliders/Shape.ts







/**
 * Excalibur helper for defining colliders quickly
 */
class Shape {
    /**
     * Creates a box collider, under the hood defines a [[PolygonCollider]] collider
     * @param width Width of the box
     * @param height Height of the box
     * @param anchor Anchor of the box (default (.5, .5)) which positions the box relative to the center of the collider's position
     * @param offset Optional offset relative to the collider in local coordinates
     */
    static Box(width, height, anchor = vector_Vector.Half, offset = vector_Vector.Zero) {
        return new PolygonCollider({
            points: new BoundingBox(-width * anchor.x, -height * anchor.y, width - width * anchor.x, height - height * anchor.y).getPoints(),
            offset: offset
        });
    }
    /**
     * Creates a new [[PolygonCollider|arbitrary polygon]] collider
     *
     * PolygonColliders are useful for creating convex polygon shapes
     * @param points Points specified in counter clockwise
     * @param offset Optional offset relative to the collider in local coordinates
     */
    static Polygon(points, offset = vector_Vector.Zero) {
        return new PolygonCollider({
            points: points,
            offset: offset
        });
    }
    /**
     * Creates a new [[CircleCollider|circle]] collider
     *
     * Circle colliders are useful for balls, or to make collisions more forgiving on sharp edges
     * @param radius Radius of the circle collider
     * @param offset Optional offset relative to the collider in local coordinates
     */
    static Circle(radius, offset = vector_Vector.Zero) {
        return new CircleCollider({
            radius: radius,
            offset: offset
        });
    }
    /**
     * Creates a new [[EdgeCollider|edge]] collider
     *
     * Edge colliders are useful for  floors, walls, and other barriers
     * @param begin Beginning of the edge in local coordinates to the collider
     * @param end Ending of the edge in local coordinates to the collider
     */
    static Edge(begin, end) {
        return new EdgeCollider({
            begin: begin,
            end: end
        });
    }
    /**
     * Creates a new capsule shaped [[CompositeCollider]] using 2 circles and a box
     *
     * Capsule colliders are useful for platformers with incline or jagged floors to have a smooth
     * player experience.
     *
     * @param width
     * @param height
     * @param offset Optional offset
     */
    static Capsule(width, height, offset = vector_Vector.Zero) {
        const logger = Logger.getInstance();
        if (width === height) {
            logger.warn('A capsule collider with equal width and height is a circle, consider using a ex.Shape.Circle or ex.CircleCollider');
        }
        const vertical = height >= width;
        if (vertical) {
            // height > width, if equal maybe use a circle
            const capsule = new CompositeCollider([
                Shape.Circle(width / 2, vec(0, -height / 2 + width / 2).add(offset)),
                Shape.Box(width, height - width, vector_Vector.Half, offset),
                Shape.Circle(width / 2, vec(0, height / 2 - width / 2).add(offset))
            ]);
            return capsule;
        }
        else {
            // width > height, if equal maybe use a circle
            const capsule = new CompositeCollider([
                Shape.Circle(height / 2, vec(-width / 2 + height / 2, 0).add(offset)),
                Shape.Box(width - height, height, vector_Vector.Half, offset),
                Shape.Circle(height / 2, vec(width / 2 - height / 2, 0).add(offset))
            ]);
            return capsule;
        }
    }
}

;// CONCATENATED MODULE: ./Collision/ColliderComponent.ts









class ColliderComponent extends Component {
    constructor(collider) {
        super();
        this.type = 'ex.collider';
        this.events = new EventDispatcher();
        /**
         * Observable that notifies when a collider is added to the body
         */
        this.$colliderAdded = new Observable();
        /**
         * Observable that notifies when a collider is removed from the body
         */
        this.$colliderRemoved = new Observable();
        this.set(collider);
    }
    /**
     * Get the current collider geometry
     */
    get() {
        return this._collider;
    }
    /**
     * Set the collider geometry
     * @param collider
     * @returns the collider you set
     */
    set(collider) {
        this.clear();
        if (collider) {
            this._collider = collider;
            this._collider.owner = this.owner;
            this.events.wire(collider.events);
            this.$colliderAdded.notifyAll(collider);
            this.update();
        }
        return collider;
    }
    /**
     * Remove collider geometry from collider component
     */
    clear() {
        if (this._collider) {
            this.events.unwire(this._collider.events);
            this.$colliderRemoved.notifyAll(this._collider);
            this._collider.owner = null;
            this._collider = null;
        }
    }
    /**
     * Return world space bounds
     */
    get bounds() {
        var _a, _b;
        return (_b = (_a = this._collider) === null || _a === void 0 ? void 0 : _a.bounds) !== null && _b !== void 0 ? _b : new BoundingBox();
    }
    /**
     * Return local space bounds
     */
    get localBounds() {
        var _a, _b;
        return (_b = (_a = this._collider) === null || _a === void 0 ? void 0 : _a.localBounds) !== null && _b !== void 0 ? _b : new BoundingBox();
    }
    /**
     * Update the collider's transformed geometry
     */
    update() {
        var _a;
        // TODO move this to collision system worker 
        const tx = (_a = this.owner) === null || _a === void 0 ? void 0 : _a.get(TransformComponent);
        if (this._collider) {
            this._collider.owner = this.owner;
            if (tx) {
                this._collider.update(tx.get());
            }
        }
    }
    /**
     * Collide component with another
     * @param other
     */
    collide(other) {
        let colliderA = this._collider;
        let colliderB = other._collider;
        if (!colliderA || !colliderB) {
            return [];
        }
        // If we have a composite lefthand side :(
        // Might bite us, but to avoid updating all the handlers make composite always left side
        let flipped = false;
        if (colliderB instanceof CompositeCollider) {
            colliderA = colliderB;
            colliderB = this._collider;
            flipped = true;
        }
        if (this._collider) {
            const contacts = colliderA.collide(colliderB);
            if (contacts) {
                if (flipped) {
                    contacts.forEach((contact) => {
                        contact.mtv = contact.mtv.negate();
                        contact.normal = contact.normal.negate();
                        contact.tangent = contact.normal.perpendicular();
                        contact.colliderA = this._collider;
                        contact.colliderB = other._collider;
                    });
                }
                return contacts;
            }
            return [];
        }
        return [];
    }
    onAdd(entity) {
        if (this._collider) {
            this.update();
        }
        // Wire up the collider events to the owning entity
        this.events.on('precollision', (evt) => {
            const precollision = evt;
            entity.events.emit('precollision', new PreCollisionEvent(precollision.target.owner, precollision.other.owner, precollision.side, precollision.intersection));
        });
        this.events.on('postcollision', (evt) => {
            const postcollision = evt;
            entity.events.emit('postcollision', new PostCollisionEvent(postcollision.target.owner, postcollision.other.owner, postcollision.side, postcollision.intersection));
        });
        this.events.on('collisionstart', (evt) => {
            const start = evt;
            entity.events.emit('collisionstart', new CollisionStartEvent(start.target.owner, start.other.owner, start.contact));
        });
        this.events.on('collisionend', (evt) => {
            const end = evt;
            entity.events.emit('collisionend', new CollisionEndEvent(end.target.owner, end.other.owner));
        });
    }
    onRemove() {
        this.events.clear();
        this.$colliderRemoved.notifyAll(this._collider);
    }
    /**
     * Sets up a box geometry based on the current bounds of the associated actor of this physics body.
     *
     * If no width/height are specified the body will attempt to use the associated actor's width/height.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    useBoxCollider(width, height, anchor = vector_Vector.Half, center = vector_Vector.Zero) {
        const collider = Shape.Box(width, height, anchor, center);
        return (this.set(collider));
    }
    /**
     * Sets up a [[PolygonCollider|polygon]] collision geometry based on a list of of points relative
     *  to the anchor of the associated actor
     * of this physics body.
     *
     * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    usePolygonCollider(points, center = vector_Vector.Zero) {
        const poly = Shape.Polygon(points, center);
        return (this.set(poly));
    }
    /**
     * Sets up a [[Circle|circle collision geometry]] as the only collider with a specified radius in pixels.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    useCircleCollider(radius, center = vector_Vector.Zero) {
        const collider = Shape.Circle(radius, center);
        return (this.set(collider));
    }
    /**
     * Sets up an [[Edge|edge collision geometry]] with a start point and an end point relative to the anchor of the associated actor
     * of this physics body.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    useEdgeCollider(begin, end) {
        const collider = Shape.Edge(begin, end);
        return (this.set(collider));
    }
    /**
     * Setups up a [[CompositeCollider]] which can define any arbitrary set of excalibur colliders
     * @param colliders
     */
    useCompositeCollider(colliders) {
        return (this.set(new CompositeCollider(colliders)));
    }
}

;// CONCATENATED MODULE: ./Collision/BodyComponent.ts












var DegreeOfFreedom;
(function (DegreeOfFreedom) {
    DegreeOfFreedom["Rotation"] = "rotation";
    DegreeOfFreedom["X"] = "x";
    DegreeOfFreedom["Y"] = "y";
})(DegreeOfFreedom || (DegreeOfFreedom = {}));
/**
 * Body describes all the physical properties pos, vel, acc, rotation, angular velocity for the purpose of
 * of physics simulation.
 */
class BodyComponent extends Component {
    constructor(options) {
        var _a, _b, _c;
        super();
        this.type = 'ex.body';
        this.dependencies = [TransformComponent, MotionComponent];
        this.id = createId('body', BodyComponent._ID++);
        this.events = new EventDispatcher();
        this._oldTransform = AffineMatrix.identity();
        /**
         * Collision type for the rigidbody physics simulation, by default [[CollisionType.PreventCollision]]
         */
        this.collisionType = CollisionType.PreventCollision;
        /**
         * The collision group for the body's colliders, by default body colliders collide with everything
         */
        this.group = CollisionGroup.All;
        /**
         * The amount of mass the body has
         */
        this.mass = Physics.defaultMass;
        /**
         * Amount of "motion" the body has before sleeping. If below [[Physics.sleepEpsilon]] it goes to "sleep"
         */
        this.sleepMotion = Physics.sleepEpsilon * 5;
        /**
         * Can this body sleep, by default bodies do not sleep
         */
        this.canSleep = Physics.bodiesCanSleepByDefault;
        this._sleeping = false;
        /**
         * The also known as coefficient of restitution of this actor, represents the amount of energy preserved after collision or the
         * bounciness. If 1, it is 100% bouncy, 0 it completely absorbs.
         */
        this.bounciness = 0.2;
        /**
         * The coefficient of friction on this actor
         */
        this.friction = 0.99;
        /**
         * Should use global gravity [[Physics.gravity]] in it's physics simulation, default is true
         */
        this.useGravity = true;
        /**
         * Degrees of freedom to limit
         */
        this.limitDegreeOfFreedom = [];
        /**
         * The velocity of the actor last frame (vx, vy) in pixels/second
         */
        this.oldVel = new vector_Vector(0, 0);
        /**
         * Gets/sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
         */
        this.oldAcc = vector_Vector.Zero;
        if (options) {
            this.collisionType = (_a = options.type) !== null && _a !== void 0 ? _a : this.collisionType;
            this.group = (_b = options.group) !== null && _b !== void 0 ? _b : this.group;
            this.useGravity = (_c = options.useGravity) !== null && _c !== void 0 ? _c : this.useGravity;
        }
    }
    get matrix() {
        return this.transform.get().matrix;
    }
    /**
     * The inverse mass (1/mass) of the body. If [[CollisionType.Fixed]] this is 0, meaning "infinite" mass
     */
    get inverseMass() {
        return this.collisionType === CollisionType.Fixed ? 0 : 1 / this.mass;
    }
    /**
     * Whether this body is sleeping or not
     */
    get sleeping() {
        return this._sleeping;
    }
    /**
     * Set the sleep state of the body
     * @param sleeping
     */
    setSleeping(sleeping) {
        this._sleeping = sleeping;
        if (!sleeping) {
            // Give it a kick to keep it from falling asleep immediately
            this.sleepMotion = Physics.sleepEpsilon * 5;
        }
        else {
            this.vel = vector_Vector.Zero;
            this.acc = vector_Vector.Zero;
            this.angularVelocity = 0;
            this.sleepMotion = 0;
        }
    }
    /**
     * Update body's [[BodyComponent.sleepMotion]] for the purpose of sleeping
     */
    updateMotion() {
        if (this._sleeping) {
            this.setSleeping(true);
        }
        const currentMotion = this.vel.size * this.vel.size + Math.abs(this.angularVelocity * this.angularVelocity);
        const bias = Physics.sleepBias;
        this.sleepMotion = bias * this.sleepMotion + (1 - bias) * currentMotion;
        this.sleepMotion = clamp(this.sleepMotion, 0, 10 * Physics.sleepEpsilon);
        if (this.canSleep && this.sleepMotion < Physics.sleepEpsilon) {
            this.setSleeping(true);
        }
    }
    /**
     * Get the moment of inertia from the [[ColliderComponent]]
     */
    get inertia() {
        // Inertia is a property of the geometry, so this is a little goofy but seems to be okay?
        const collider = this.owner.get(ColliderComponent);
        if (collider === null || collider === void 0 ? void 0 : collider.get()) {
            return collider.get().getInertia(this.mass);
        }
        return 0;
    }
    /**
     * Get the inverse moment of inertial from the [[ColliderComponent]]. If [[CollisionType.Fixed]] this is 0, meaning "infinite" mass
     */
    get inverseInertia() {
        return this.collisionType === CollisionType.Fixed ? 0 : 1 / this.inertia;
    }
    /**
     * Returns if the owner is active
     */
    get active() {
        var _a;
        return !!((_a = this.owner) === null || _a === void 0 ? void 0 : _a.active);
    }
    get center() {
        return this.pos;
    }
    get transform() {
        var _a;
        return (_a = this.owner) === null || _a === void 0 ? void 0 : _a.get(TransformComponent);
    }
    get motion() {
        var _a;
        return (_a = this.owner) === null || _a === void 0 ? void 0 : _a.get(MotionComponent);
    }
    /**
     * The (x, y) position of the actor this will be in the middle of the actor if the
     * [[Actor.anchor]] is set to (0.5, 0.5) which is default.
     * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
     */
    get pos() {
        return this.transform.globalPos;
    }
    set pos(val) {
        this.transform.globalPos = val;
    }
    /**
     * The position of the actor last frame (x, y) in pixels
     */
    get oldPos() {
        return this._oldTransform.getPosition();
    }
    /**
     * The current velocity vector (vx, vy) of the actor in pixels/second
     */
    get vel() {
        return this.motion.vel;
    }
    set vel(val) {
        this.motion.vel = val;
    }
    /**
     * The current acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
     * be useful to simulate a gravitational effect.
     */
    get acc() {
        return this.motion.acc;
    }
    set acc(val) {
        this.motion.acc = val;
    }
    /**
     * The current torque applied to the actor
     */
    get torque() {
        return this.motion.torque;
    }
    set torque(val) {
        this.motion.torque = val;
    }
    /**
     * Gets/sets the rotation of the body from the last frame.
     */
    get oldRotation() {
        return this._oldTransform.getRotation();
    }
    /**
     * The rotation of the body in radians
     */
    get rotation() {
        return this.transform.globalRotation;
    }
    set rotation(val) {
        this.transform.globalRotation = val;
    }
    /**
     * The scale vector of the actor
     */
    get scale() {
        return this.transform.globalScale;
    }
    set scale(val) {
        this.transform.globalScale = val;
    }
    /**
     * The scale of the actor last frame
     */
    get oldScale() {
        return this._oldTransform.getScale();
    }
    /**
     * The scale rate of change of the actor in scale/second
     */
    get scaleFactor() {
        return this.motion.scaleFactor;
    }
    set scaleFactor(scaleFactor) {
        this.motion.scaleFactor = scaleFactor;
    }
    /**
     * Get the angular velocity in radians/second
     */
    get angularVelocity() {
        return this.motion.angularVelocity;
    }
    /**
     * Set the angular velocity in radians/second
     */
    set angularVelocity(value) {
        this.motion.angularVelocity = value;
    }
    /**
     * Apply a specific impulse to the body
     * @param point
     * @param impulse
     */
    applyImpulse(point, impulse) {
        if (this.collisionType !== CollisionType.Active) {
            return; // only active objects participate in the simulation
        }
        const finalImpulse = impulse.scale(this.inverseMass);
        if (this.limitDegreeOfFreedom.includes(DegreeOfFreedom.X)) {
            finalImpulse.x = 0;
        }
        if (this.limitDegreeOfFreedom.includes(DegreeOfFreedom.Y)) {
            finalImpulse.y = 0;
        }
        this.vel.addEqual(finalImpulse);
        if (!this.limitDegreeOfFreedom.includes(DegreeOfFreedom.Rotation)) {
            const distanceFromCenter = point.sub(this.pos);
            this.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
        }
    }
    /**
     * Apply only linear impulse to the body
     * @param impulse
     */
    applyLinearImpulse(impulse) {
        if (this.collisionType !== CollisionType.Active) {
            return; // only active objects participate in the simulation
        }
        const finalImpulse = impulse.scale(this.inverseMass);
        if (this.limitDegreeOfFreedom.includes(DegreeOfFreedom.X)) {
            finalImpulse.x = 0;
        }
        if (this.limitDegreeOfFreedom.includes(DegreeOfFreedom.Y)) {
            finalImpulse.y = 0;
        }
        this.vel = this.vel.add(finalImpulse);
    }
    /**
     * Apply only angular impulse to the body
     * @param point
     * @param impulse
     */
    applyAngularImpulse(point, impulse) {
        if (this.collisionType !== CollisionType.Active) {
            return; // only active objects participate in the simulation
        }
        if (!this.limitDegreeOfFreedom.includes(DegreeOfFreedom.Rotation)) {
            const distanceFromCenter = point.sub(this.pos);
            this.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
        }
    }
    /**
     * Sets the old versions of pos, vel, acc, and scale.
     */
    captureOldTransform() {
        // Capture old values before integration step updates them
        this.transform.get().matrix.clone(this._oldTransform);
        this.oldVel.setTo(this.vel.x, this.vel.y);
        this.oldAcc.setTo(this.acc.x, this.acc.y);
    }
}
BodyComponent._ID = 1;

;// CONCATENATED MODULE: ./EntityComponentSystem/System.ts
/**
 * Enum that determines whether to run the system in the update or draw phase
 */
var SystemType;
(function (SystemType) {
    SystemType["Update"] = "update";
    SystemType["Draw"] = "draw";
})(SystemType || (SystemType = {}));
/**
 * An Excalibur [[System]] that updates entities of certain types.
 * Systems are scene specific
 *
 * Excalibur Systems currently require at least 1 Component type to operated
 *
 * Multiple types are declared as a type union
 * For example:
 *
 * ```typescript
 * class MySystem extends System<ComponentA | ComponentB> {
 *   public readonly types = ['a', 'b'] as const;
 *   public readonly systemType = SystemType.Update;
 *   public update(entities: Entity<ComponentA | ComponentB>) {
 *      ...
 *   }
 * }
 * ```
 */
class System {
    constructor() {
        /**
         * System can execute in priority order, by default all systems are priority 0. Lower values indicated higher priority.
         * For a system to execute before all other a lower priority value (-1 for example) must be set.
         * For a system to execute after all other a higher priority value (10 for example) must be set.
         */
        this.priority = 0;
    }
    /**
     * Systems observe when entities match their types or no longer match their types, override
     * @param _entityAddedOrRemoved
     */
    notify(_entityAddedOrRemoved) {
        // Override me
    }
}
/**
 * An [[Entity]] with [[Component]] types that matches a [[System]] types exists in the current scene.
 */
class AddedEntity {
    constructor(data) {
        this.data = data;
        this.type = 'Entity Added';
    }
}
/**
 * Type guard to check for AddedEntity messages
 * @param x
 */
function isAddedSystemEntity(x) {
    return !!x && x.type === 'Entity Added';
}
/**
 * An [[Entity]] with [[Component]] types that no longer matches a [[System]] types exists in the current scene.
 */
class RemovedEntity {
    constructor(data) {
        this.data = data;
        this.type = 'Entity Removed';
    }
}
/**
 * type guard to check for the RemovedEntity message
 */
function isRemoveSystemEntity(x) {
    return !!x && x.type === 'Entity Removed';
}

;// CONCATENATED MODULE: ./Collision/Solver/Solver.ts
/**
 * A collision solver figures out how to position colliders such that they are no longer overlapping
 *
 * Solvers are executed in the order
 *
 * 1. preSolve
 * 2. solveVelocity
 * 3. solvePosition
 * 4. postSolve
 * @inheritdoc
 */
class CollisionSolver {
    /**
     * Solves overlapping contact in
     *
     * Solvers are executed in the order
     * 1. preSolve
     * 2. solveVelocity
     * 3. solvePosition
     * 4. postSolve
     * @param contacts
     */
    solve(contacts) {
        // Events and init
        this.preSolve(contacts);
        // Remove any canceled contacts
        contacts = contacts.filter(c => !c.isCanceled());
        // Solve velocity first
        this.solveVelocity(contacts);
        // Solve position last because non-overlap is the most important
        this.solvePosition(contacts);
        // Events and any contact house-keeping the solver needs
        this.postSolve(contacts);
        return contacts;
    }
}

;// CONCATENATED MODULE: ./Collision/Solver/ArcadeSolver.ts





/**
 * ArcadeSolver is the default in Excalibur. It solves collisions so that there is no overlap between contacts,
 * and negates velocity along the collision normal.
 *
 * This is usually the type of collisions used for 2D games that don't need a more realistic collision simulation.
 *
 */
class ArcadeSolver extends CollisionSolver {
    preSolve(contacts) {
        for (const contact of contacts) {
            const side = Side.fromDirection(contact.mtv);
            const mtv = contact.mtv.negate();
            // Publish collision events on both participants
            contact.colliderA.events.emit('precollision', new PreCollisionEvent(contact.colliderA, contact.colliderB, side, mtv));
            contact.colliderB.events.emit('precollision', new PreCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), mtv.negate()));
        }
    }
    postSolve(contacts) {
        var _a, _b;
        for (const contact of contacts) {
            const colliderA = contact.colliderA;
            const colliderB = contact.colliderB;
            const bodyA = (_a = colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
            const bodyB = (_b = colliderB.owner) === null || _b === void 0 ? void 0 : _b.get(BodyComponent);
            if (bodyA && bodyB) {
                if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
                    continue;
                }
            }
            const side = Side.fromDirection(contact.mtv);
            const mtv = contact.mtv.negate();
            // Publish collision events on both participants
            contact.colliderA.events.emit('postcollision', new PostCollisionEvent(contact.colliderA, contact.colliderB, side, mtv));
            contact.colliderB.events.emit('postcollision', new PostCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), mtv.negate()));
        }
    }
    solvePosition(contacts) {
        var _a, _b;
        for (const contact of contacts) {
            // if bounds no longer interesect skip to the next
            // this removes jitter from overlapping/stacked solid tiles or a wall of solid tiles
            if (!contact.colliderA.bounds.overlaps(contact.colliderB.bounds)) {
                continue;
            }
            let mtv = contact.mtv;
            const colliderA = contact.colliderA;
            const colliderB = contact.colliderB;
            const bodyA = (_a = colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
            const bodyB = (_b = colliderB.owner) === null || _b === void 0 ? void 0 : _b.get(BodyComponent);
            if (bodyA && bodyB) {
                if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
                    continue;
                }
                if (bodyA.collisionType === CollisionType.Active && bodyB.collisionType === CollisionType.Active) {
                    // split overlaps if both are Active
                    mtv = mtv.scale(0.5);
                }
                // Resolve overlaps
                if (bodyA.collisionType === CollisionType.Active) {
                    bodyA.pos.x -= mtv.x;
                    bodyA.pos.y -= mtv.y;
                    colliderA.update(bodyA.transform.get());
                }
                if (bodyB.collisionType === CollisionType.Active) {
                    bodyB.pos.x += mtv.x;
                    bodyB.pos.y += mtv.y;
                    colliderB.update(bodyB.transform.get());
                }
            }
        }
    }
    solveVelocity(contacts) {
        var _a, _b;
        for (const contact of contacts) {
            const colliderA = contact.colliderA;
            const colliderB = contact.colliderB;
            const bodyA = (_a = colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
            const bodyB = (_b = colliderB.owner) === null || _b === void 0 ? void 0 : _b.get(BodyComponent);
            if (bodyA && bodyB) {
                if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
                    continue;
                }
                const normal = contact.normal;
                const opposite = normal.negate();
                // Cancel out velocity opposite direction of collision normal
                if (bodyA.collisionType === CollisionType.Active) {
                    const velAdj = normal.scale(normal.dot(bodyA.vel.negate()));
                    bodyA.vel = bodyA.vel.add(velAdj);
                }
                if (bodyB.collisionType === CollisionType.Active) {
                    const velAdj = opposite.scale(opposite.dot(bodyB.vel.negate()));
                    bodyB.vel = bodyB.vel.add(velAdj);
                }
            }
        }
    }
}

;// CONCATENATED MODULE: ./Collision/Solver/ContactConstraintPoint.ts


/**
 * Holds information about contact points, meant to be reused over multiple frames of contact
 */
class ContactConstraintPoint {
    constructor(point, local, contact) {
        this.point = point;
        this.local = local;
        this.contact = contact;
        /**
         * Impulse accumulated over time in normal direction
         */
        this.normalImpulse = 0;
        /**
         * Impulse accumulated over time in the tangent direction
         */
        this.tangentImpulse = 0;
        /**
         * Effective mass seen in the normal direction
         */
        this.normalMass = 0;
        /**
         * Effective mass seen in the tangent direction
         */
        this.tangentMass = 0;
        /**
         * Direction from center of mass of bodyA to contact point
         */
        this.aToContact = new vector_Vector(0, 0);
        /**
         * Direction from center of mass of bodyB to contact point
         */
        this.bToContact = new vector_Vector(0, 0);
        this.update();
    }
    /**
     * Updates the contact information
     */
    update() {
        var _a, _b;
        const bodyA = (_a = this.contact.colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
        const bodyB = (_b = this.contact.colliderB.owner) === null || _b === void 0 ? void 0 : _b.get(BodyComponent);
        if (bodyA && bodyB) {
            const normal = this.contact.normal;
            const tangent = this.contact.tangent;
            this.aToContact = this.point.sub(bodyA.pos);
            this.bToContact = this.point.sub(bodyB.pos);
            const aToContactNormal = this.aToContact.cross(normal);
            const bToContactNormal = this.bToContact.cross(normal);
            this.normalMass =
                bodyA.inverseMass +
                    bodyB.inverseMass +
                    bodyA.inverseInertia * aToContactNormal * aToContactNormal +
                    bodyB.inverseInertia * bToContactNormal * bToContactNormal;
            const aToContactTangent = this.aToContact.cross(tangent);
            const bToContactTangent = this.bToContact.cross(tangent);
            this.tangentMass =
                bodyA.inverseMass +
                    bodyB.inverseMass +
                    bodyA.inverseInertia * aToContactTangent * aToContactTangent +
                    bodyB.inverseInertia * bToContactTangent * bToContactTangent;
        }
        return this;
    }
    /**
     * Returns the relative velocity between bodyA and bodyB
     */
    getRelativeVelocity() {
        var _a, _b;
        const bodyA = (_a = this.contact.colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
        const bodyB = (_b = this.contact.colliderB.owner) === null || _b === void 0 ? void 0 : _b.get(BodyComponent);
        if (bodyA && bodyB) {
            // Relative velocity in linear terms
            // Angular to linear velocity formula -> omega = velocity/radius so omega x radius = velocity
            const velA = bodyA.vel.add(vector_Vector.cross(bodyA.angularVelocity, this.aToContact));
            const velB = bodyB.vel.add(vector_Vector.cross(bodyB.angularVelocity, this.bToContact));
            return velB.sub(velA);
        }
        return vector_Vector.Zero;
    }
}

;// CONCATENATED MODULE: ./Collision/Solver/RealisticSolver.ts









class RealisticSolver extends CollisionSolver {
    constructor() {
        super(...arguments);
        this.lastFrameContacts = new Map();
        // map contact id to contact points
        this.idToContactConstraint = new Map();
    }
    getContactConstraints(id) {
        var _a;
        return (_a = this.idToContactConstraint.get(id)) !== null && _a !== void 0 ? _a : [];
    }
    preSolve(contacts) {
        var _a, _b, _c;
        for (const contact of contacts) {
            // Publish collision events on both participants
            const side = Side.fromDirection(contact.mtv);
            contact.colliderA.events.emit('precollision', new PreCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv));
            contact.colliderA.events.emit('beforecollisionresolve', new CollisionPreSolveEvent(contact.colliderA, contact.colliderB, side, contact.mtv, contact));
            contact.colliderB.events.emit('precollision', new PreCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate()));
            contact.colliderB.events.emit('beforecollisionresolve', new CollisionPreSolveEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate(), contact));
            // Match awake state for sleeping
            contact.matchAwake();
        }
        // Keep track of contacts that done
        const finishedContactIds = Array.from(this.idToContactConstraint.keys());
        for (const contact of contacts) {
            // Remove all current contacts that are not done
            const index = finishedContactIds.indexOf(contact.id);
            if (index > -1) {
                finishedContactIds.splice(index, 1);
            }
            const contactPoints = (_a = this.idToContactConstraint.get(contact.id)) !== null && _a !== void 0 ? _a : [];
            let pointIndex = 0;
            const bodyA = contact.colliderA.owner.get(BodyComponent);
            const bodyB = contact.colliderB.owner.get(BodyComponent);
            if (bodyA && bodyB) {
                for (const point of contact.points) {
                    const normal = contact.normal;
                    const tangent = contact.tangent;
                    const aToContact = point.sub(bodyA.pos);
                    const bToContact = point.sub(bodyB.pos);
                    const aToContactNormal = aToContact.cross(normal);
                    const bToContactNormal = bToContact.cross(normal);
                    const normalMass = bodyA.inverseMass +
                        bodyB.inverseMass +
                        bodyA.inverseInertia * aToContactNormal * aToContactNormal +
                        bodyB.inverseInertia * bToContactNormal * bToContactNormal;
                    const aToContactTangent = aToContact.cross(tangent);
                    const bToContactTangent = bToContact.cross(tangent);
                    const tangentMass = bodyA.inverseMass +
                        bodyB.inverseMass +
                        bodyA.inverseInertia * aToContactTangent * aToContactTangent +
                        bodyB.inverseInertia * bToContactTangent * bToContactTangent;
                    // Preserve normal/tangent impulse by re-using the contact point if it's close
                    if (contactPoints[pointIndex] && ((_c = (_b = contactPoints[pointIndex]) === null || _b === void 0 ? void 0 : _b.point) === null || _c === void 0 ? void 0 : _c.squareDistance(point)) < 4) {
                        contactPoints[pointIndex].point = point;
                        contactPoints[pointIndex].local = contact.localPoints[pointIndex];
                    }
                    else {
                        // new contact if it's not close or doesn't exist
                        contactPoints[pointIndex] = new ContactConstraintPoint(point, contact.localPoints[pointIndex], contact);
                    }
                    // Update contact point calculations
                    contactPoints[pointIndex].aToContact = aToContact;
                    contactPoints[pointIndex].bToContact = bToContact;
                    contactPoints[pointIndex].normalMass = normalMass;
                    contactPoints[pointIndex].tangentMass = tangentMass;
                    pointIndex++;
                }
            }
            this.idToContactConstraint.set(contact.id, contactPoints);
        }
        // Clean up any contacts that did not occur last frame
        for (const id of finishedContactIds) {
            this.idToContactConstraint.delete(id);
        }
        // Warm contacts with accumulated impulse
        // Useful for tall stacks
        if (Physics.warmStart) {
            this.warmStart(contacts);
        }
        else {
            for (const contact of contacts) {
                const contactPoints = this.getContactConstraints(contact.id);
                for (const point of contactPoints) {
                    point.normalImpulse = 0;
                    point.tangentImpulse = 0;
                }
            }
        }
    }
    postSolve(contacts) {
        for (const contact of contacts) {
            const bodyA = contact.colliderA.owner.get(BodyComponent);
            const bodyB = contact.colliderB.owner.get(BodyComponent);
            if (bodyA && bodyB) {
                // Skip post solve for active+passive collisions
                if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
                    continue;
                }
                // Update motion values for sleeping
                bodyA.updateMotion();
                bodyB.updateMotion();
            }
            // Publish collision events on both participants
            const side = Side.fromDirection(contact.mtv);
            contact.colliderA.events.emit('postcollision', new PostCollisionEvent(contact.colliderA, contact.colliderB, side, contact.mtv));
            contact.colliderA.events.emit('aftercollisionresolve', new CollisionPostSolveEvent(contact.colliderA, contact.colliderB, side, contact.mtv, contact));
            contact.colliderB.events.emit('postcollision', new PostCollisionEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate()));
            contact.colliderB.events.emit('aftercollisionresolve', new CollisionPostSolveEvent(contact.colliderB, contact.colliderA, Side.getOpposite(side), contact.mtv.negate(), contact));
        }
        // Store contacts
        this.lastFrameContacts.clear();
        for (const c of contacts) {
            this.lastFrameContacts.set(c.id, c);
        }
    }
    /**
     * Warm up body's based on previous frame contact points
     * @param contacts
     */
    warmStart(contacts) {
        var _a, _b, _c;
        for (const contact of contacts) {
            const bodyA = (_a = contact.colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
            const bodyB = (_b = contact.colliderB.owner) === null || _b === void 0 ? void 0 : _b.get(BodyComponent);
            if (bodyA && bodyB) {
                const contactPoints = (_c = this.idToContactConstraint.get(contact.id)) !== null && _c !== void 0 ? _c : [];
                for (const point of contactPoints) {
                    if (Physics.warmStart) {
                        const normalImpulse = contact.normal.scale(point.normalImpulse);
                        const tangentImpulse = contact.tangent.scale(point.tangentImpulse);
                        const impulse = normalImpulse.add(tangentImpulse);
                        bodyA.applyImpulse(point.point, impulse.negate());
                        bodyB.applyImpulse(point.point, impulse);
                    }
                    else {
                        point.normalImpulse = 0;
                        point.tangentImpulse = 0;
                    }
                }
            }
        }
    }
    /**
     * Iteratively solve the position overlap constraint
     * @param contacts
     */
    solvePosition(contacts) {
        var _a, _b, _c;
        for (let i = 0; i < Physics.positionIterations; i++) {
            for (const contact of contacts) {
                const bodyA = (_a = contact.colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
                const bodyB = (_b = contact.colliderB.owner) === null || _b === void 0 ? void 0 : _b.get(BodyComponent);
                if (bodyA && bodyB) {
                    // Skip solving active+passive
                    if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
                        continue;
                    }
                    const constraints = (_c = this.idToContactConstraint.get(contact.id)) !== null && _c !== void 0 ? _c : [];
                    for (const point of constraints) {
                        const normal = contact.normal;
                        const separation = CollisionJumpTable.FindContactSeparation(contact, point.local);
                        const steeringConstant = Physics.steeringFactor; //0.2;
                        const maxCorrection = -5;
                        const slop = Physics.slop; //1;
                        // Clamp to avoid over-correction
                        // Remember that we are shooting for 0 overlap in the end
                        const steeringForce = clamp(steeringConstant * (separation + slop), maxCorrection, 0);
                        const impulse = normal.scale(-steeringForce / point.normalMass);
                        // This is a pseudo impulse, meaning we aren't doing a real impulse calculation
                        // We adjust position and rotation instead of doing the velocity
                        if (bodyA.collisionType === CollisionType.Active) {
                            bodyA.pos = bodyA.pos.add(impulse.negate().scale(bodyA.inverseMass));
                            bodyA.rotation -= point.aToContact.cross(impulse) * bodyA.inverseInertia;
                        }
                        if (bodyB.collisionType === CollisionType.Active) {
                            bodyB.pos = bodyB.pos.add(impulse.scale(bodyB.inverseMass));
                            bodyB.rotation += point.bToContact.cross(impulse) * bodyB.inverseInertia;
                        }
                    }
                }
            }
        }
    }
    solveVelocity(contacts) {
        var _a, _b, _c;
        for (let i = 0; i < Physics.velocityIterations; i++) {
            for (const contact of contacts) {
                const bodyA = (_a = contact.colliderA.owner) === null || _a === void 0 ? void 0 : _a.get(BodyComponent);
                const bodyB = (_b = contact.colliderB.owner) === null || _b === void 0 ? void 0 : _b.get(BodyComponent);
                if (bodyA && bodyB) {
                    // Skip solving active+passive
                    if (bodyA.collisionType === CollisionType.Passive || bodyB.collisionType === CollisionType.Passive) {
                        continue;
                    }
                    const restitution = bodyA.bounciness * bodyB.bounciness;
                    const friction = Math.min(bodyA.friction, bodyB.friction);
                    const constraints = (_c = this.idToContactConstraint.get(contact.id)) !== null && _c !== void 0 ? _c : [];
                    for (const point of constraints) {
                        const relativeVelocity = point.getRelativeVelocity();
                        // Negate velocity in tangent direction to simulate friction
                        const tangentVelocity = -relativeVelocity.dot(contact.tangent);
                        let impulseDelta = tangentVelocity / point.tangentMass;
                        // Clamping based in Erin Catto's GDC 2006 talk
                        // Correct clamping https://github.com/erincatto/box2d-lite/blob/master/docs/GDC2006_Catto_Erin_PhysicsTutorial.pdf
                        // Accumulated fiction impulse is always between -uMaxFriction < dT < uMaxFriction
                        // But deltas can vary
                        const maxFriction = friction * point.normalImpulse;
                        const newImpulse = clamp(point.tangentImpulse + impulseDelta, -maxFriction, maxFriction);
                        impulseDelta = newImpulse - point.tangentImpulse;
                        point.tangentImpulse = newImpulse;
                        const impulse = contact.tangent.scale(impulseDelta);
                        bodyA.applyImpulse(point.point, impulse.negate());
                        bodyB.applyImpulse(point.point, impulse);
                    }
                    for (const point of constraints) {
                        // Need to recalc relative velocity because the previous step could have changed vel
                        const relativeVelocity = point.getRelativeVelocity();
                        // Compute impulse in normal direction
                        const normalVelocity = relativeVelocity.dot(contact.normal);
                        // See https://en.wikipedia.org/wiki/Collision_response
                        let impulseDelta = (-(1 + restitution) * normalVelocity) / point.normalMass;
                        // Clamping based in Erin Catto's GDC 2014 talk
                        // Accumulated impulse stored in the contact is always positive (dV > 0)
                        // But deltas can be negative
                        const newImpulse = Math.max(point.normalImpulse + impulseDelta, 0);
                        impulseDelta = newImpulse - point.normalImpulse;
                        point.normalImpulse = newImpulse;
                        const impulse = contact.normal.scale(impulseDelta);
                        bodyA.applyImpulse(point.point, impulse.negate());
                        bodyB.applyImpulse(point.point, impulse);
                    }
                }
            }
        }
    }
}

;// CONCATENATED MODULE: ./Collision/CollisionSystem.ts








class CollisionSystem extends System {
    constructor() {
        super(...arguments);
        this.types = ['ex.transform', 'ex.motion', 'ex.collider'];
        this.systemType = SystemType.Update;
        this.priority = -1;
        this._realisticSolver = new RealisticSolver();
        this._arcadeSolver = new ArcadeSolver();
        this._processor = new DynamicTreeCollisionProcessor();
        this._lastFrameContacts = new Map();
        this._currentFrameContacts = new Map();
        this._trackCollider = (c) => this._processor.track(c);
        this._untrackCollider = (c) => this._processor.untrack(c);
    }
    notify(message) {
        if (isAddedSystemEntity(message)) {
            const colliderComponent = message.data.get(ColliderComponent);
            colliderComponent.$colliderAdded.subscribe(this._trackCollider);
            colliderComponent.$colliderRemoved.subscribe(this._untrackCollider);
            const collider = colliderComponent.get();
            if (collider) {
                this._processor.track(collider);
                // if (this.useWebWorker) {
                //   if (collider instanceof PolygonCollider) {
                //     this.worker.postMessage({command: 'track', payload: {
                //       id: collider.id.value,
                //       type: 'polygon',
                //       offset: collider.offset,
                //       points: collider.points.map(p => ({x: p.x, y: p.y}))
                //     }});
                //   }
                //   if (collider instanceof CircleCollider) {
                //     this.worker.postMessage({command: 'track', payload: {id: collider.id.value, offset: collider.offset, points: collider.radius}});
                //   }
                // }
                // TODO composite collider
            }
        }
        else {
            const colliderComponent = message.data.get(ColliderComponent);
            const collider = colliderComponent.get();
            if (colliderComponent && collider) {
                this._processor.untrack(collider);
                // if (this.useWebWorker) {
                //   this.worker.postMessage({command: 'untrack', payload: collider});
                // }
            }
        }
    }
    initialize(scene) {
        this._engine = scene.engine;
        // if (this.useWebWorker) {
        //   this.worker.onmessage = (_data) => {
        //     // console.log('Message received', e.data)
        //   }
        // }
    }
    update(entities, elapsedMs) {
        var _a, _b, _c, _d;
        if (!Physics.enabled) {
            return;
        }
        // this.worker.postMessage({command: 'step'});
        // Collect up all the colliders and update them
        let colliders = [];
        for (const entity of entities) {
            const colliderComp = entity.get(ColliderComponent);
            // const transform = entity.get(TransformComponent);
            // this.worker.postMessage({command: 'transform', payload: { type: 'transform', data: transform.getGlobalMatrix().data }});
            const collider = colliderComp === null || colliderComp === void 0 ? void 0 : colliderComp.get();
            if (colliderComp && ((_a = colliderComp.owner) === null || _a === void 0 ? void 0 : _a.active) && collider) {
                colliderComp.update();
                if (collider instanceof CompositeCollider) {
                    const compositeColliders = collider.getColliders();
                    colliders = colliders.concat(compositeColliders);
                }
                else {
                    colliders.push(collider);
                }
            }
        }
        // Update the spatial partitioning data structures
        // TODO if collider invalid it will break the processor
        // TODO rename "update" to something more specific
        this._processor.update(colliders);
        // Run broadphase on all colliders and locates potential collisions
        const pairs = this._processor.broadphase(colliders, elapsedMs);
        this._currentFrameContacts.clear();
        // Given possible pairs find actual contacts
        let contacts = this._processor.narrowphase(pairs, (_d = (_c = (_b = this._engine) === null || _b === void 0 ? void 0 : _b.debug) === null || _c === void 0 ? void 0 : _c.stats) === null || _d === void 0 ? void 0 : _d.currFrame);
        const solver = this.getSolver();
        // Solve, this resolves the position/velocity so entities aren't overlapping
        contacts = solver.solve(contacts);
        // Record contacts for start/end
        for (const contact of contacts) {
            // Process composite ids, things with the same composite id are treated as the same collider for start/end
            const index = contact.id.indexOf('|');
            if (index > 0) {
                const compositeId = contact.id.substring(index + 1);
                this._currentFrameContacts.set(compositeId, contact);
            }
            else {
                this._currentFrameContacts.set(contact.id, contact);
            }
        }
        // Emit contact start/end events
        this.runContactStartEnd();
        // reset the last frame cache
        this._lastFrameContacts.clear();
        // Keep track of collisions contacts that have started or ended
        this._lastFrameContacts = new Map(this._currentFrameContacts);
    }
    getSolver() {
        return Physics.collisionResolutionStrategy === CollisionResolutionStrategy.Realistic ? this._realisticSolver : this._arcadeSolver;
    }
    debug(ex) {
        this._processor.debug(ex);
    }
    runContactStartEnd() {
        // Composite collider collisions may have a duplicate id because we want to treat those as a singular start/end
        for (const [id, c] of this._currentFrameContacts) {
            // find all new contacts
            if (!this._lastFrameContacts.has(id)) {
                const colliderA = c.colliderA;
                const colliderB = c.colliderB;
                colliderA.events.emit('collisionstart', new CollisionStartEvent(colliderA, colliderB, c));
                colliderA.events.emit('contactstart', new ContactStartEvent(colliderA, colliderB, c));
                colliderB.events.emit('collisionstart', new CollisionStartEvent(colliderB, colliderA, c));
                colliderB.events.emit('contactstart', new ContactStartEvent(colliderB, colliderA, c));
            }
        }
        // find all contacts that have ceased
        for (const [id, c] of this._lastFrameContacts) {
            if (!this._currentFrameContacts.has(id)) {
                const colliderA = c.colliderA;
                const colliderB = c.colliderB;
                colliderA.events.emit('collisionend', new CollisionEndEvent(colliderA, colliderB));
                colliderA.events.emit('contactend', new ContactEndEvent(colliderA, colliderB));
                colliderB.events.emit('collisionend', new CollisionEndEvent(colliderB, colliderA));
                colliderB.events.emit('contactend', new ContactEndEvent(colliderB, colliderA));
            }
        }
    }
}

;// CONCATENATED MODULE: ./Collision/Integrator.ts
class EulerIntegrator {
    static integrate(transform, motion, totalAcc, elapsedMs) {
        const seconds = elapsedMs / 1000;
        motion.vel.addEqual(totalAcc.scale(seconds));
        transform.pos = transform.pos.add(motion.vel.scale(seconds)).add(totalAcc.scale(0.5 * seconds * seconds));
        motion.angularVelocity += motion.torque * (1.0 / motion.inertia) * seconds;
        transform.rotation += motion.angularVelocity * seconds;
        transform.scale.addEqual(motion.scaleFactor.scale(seconds));
    }
}

;// CONCATENATED MODULE: ./Collision/MotionSystem.ts







class MotionSystem extends System {
    constructor() {
        super(...arguments);
        this.types = ['ex.transform', 'ex.motion'];
        this.systemType = SystemType.Update;
        this.priority = -1;
    }
    update(entities, elapsedMs) {
        let transform;
        let motion;
        for (const entity of entities) {
            transform = entity.get(TransformComponent);
            motion = entity.get(MotionComponent);
            const optionalBody = entity.get(BodyComponent);
            if (optionalBody === null || optionalBody === void 0 ? void 0 : optionalBody.sleeping) {
                continue;
            }
            const totalAcc = motion.acc.clone();
            if ((optionalBody === null || optionalBody === void 0 ? void 0 : optionalBody.collisionType) === CollisionType.Active && (optionalBody === null || optionalBody === void 0 ? void 0 : optionalBody.useGravity)) {
                totalAcc.addEqual(Physics.gravity);
            }
            optionalBody === null || optionalBody === void 0 ? void 0 : optionalBody.captureOldTransform();
            // Update transform and motion based on Euler linear algebra
            EulerIntegrator.integrate(transform, motion, totalAcc, elapsedMs);
        }
    }
}

;// CONCATENATED MODULE: ./Collision/Worker/VectorMessage.ts

const serializeToVectorMessage = (vector) => {
    return { x: vector.x, y: vector.y };
};
const messageToVector = (message) => {
    return vec(message.x, message.y);
};

;// CONCATENATED MODULE: ./Collision/Worker/BodyMessage.ts

const serializeToBodyMessage = (body) => {
    return {
        id: body.id.value,
        type: "body",
        // pos: serializeToVectorMessage(body.pos),
        vel: serializeToVectorMessage(body.vel),
        acc: serializeToVectorMessage(body.acc),
        data: body.matrix.data,
        // rotation: body.rotation,
        angularVelocity: body.angularVelocity
    };
};
// export const syncMatrixDataToBody = (data: Float32Array, body: BodyComponent)
const syncMessageToBody = (message, body) => {
    body.id.value = message.id;
    body.matrix.data = message.data;
    // body.pos = messageToVector(message.pos);
    body.vel = messageToVector(message.vel);
    body.acc = messageToVector(message.acc);
    // body.rotation = message.rotation;
    body.angularVelocity = message.angularVelocity;
};

;// CONCATENATED MODULE: ./Collision/Worker/ColliderMessage.ts


const syncMessageToCollider = (message, colliderComponent) => {
    const collider = colliderComponent.get();
    if (collider) {
        collider.id.value = message.id;
        if (collider instanceof PolygonCollider) {
            collider.points = message.points.map(messageToVector);
        }
    }
};

;// CONCATENATED MODULE: ./Collision/Worker/CollisionWorker.ts









const entitiesMap = new Map();
const colliderMap = new Map();
const bodyMap = new Map();
const posXOffset = 1;
const posYOffset = 2;
const rotationOffset = 3;
const scaleXOffset = 4;
const scaleYOffset = 5;
const velXOffset = 6;
const velYOffset = 7;
const accXOffset = 8;
const accYOffset = 9;
const angularVelocityOffset = 10;
const scaleFactorXOffset = 11;
const scaleFactorYOffset = 12;
onmessage = (e) => {
    switch (e.data.type) {
        case 'start': {
            // start(e.data.fps);
            break;
        }
        case 'step': {
            for (let bodyMessage of e.data.bodies) {
                const body = bodyMap.get(bodyMessage.id);
                if (body) {
                    syncMessageToBody(bodyMessage, body);
                }
            }
            runPhysicsStep(e.data.elapsed);
            break;
        }
        case 'step-flattened': {
            let bodiesFlattened = e.data.bodies;
            const elapsedMs = e.data.elapsed;
            // integrate position
            for (let i = 0; i < bodiesFlattened.length; i += 13) {
                // let posx = bodiesFlattened[i+posXOffset];
                // let posy = bodiesFlattened[i+posYOffset];
                // let rotation = bodiesFlattened[i+rotationOffset];
                // let scalex = bodiesFlattened[i+scaleXOffset];
                // let scaley = bodiesFlattened[i+scaleYOffset];
                let velx = bodiesFlattened[i + velXOffset];
                let vely = bodiesFlattened[i + velYOffset];
                let accx = bodiesFlattened[i + accXOffset];
                let accy = bodiesFlattened[i + accYOffset];
                let angularVelocity = bodiesFlattened[i + angularVelocityOffset];
                let scaleFactorx = bodiesFlattened[i + scaleFactorXOffset];
                let scaleFactory = bodiesFlattened[i + scaleFactorYOffset];
                const seconds = elapsedMs / 1000;
                // motion.vel.addEqual(totalAcc.scale(seconds));
                bodiesFlattened[i + velXOffset] += accx * seconds;
                bodiesFlattened[i + velYOffset] += accy * seconds;
                // transform.pos.addEqual(motion.vel.scale(seconds)).addEqual(totalAcc.scale(0.5 * seconds * seconds));
                bodiesFlattened[i + posXOffset] += velx * seconds + accx * .5 * seconds * seconds;
                bodiesFlattened[i + posYOffset] += vely * seconds + accy * .5 * seconds * seconds;
                // motion.angularVelocity += motion.torque * (1.0 / motion.inertia) * seconds;
                // TODO torque
                // transform.rotation += motion.angularVelocity * seconds;
                bodiesFlattened[i + rotationOffset] += angularVelocity * seconds;
                // transform.scale.addEqual(motion.scaleFactor.scale(seconds));
                bodiesFlattened[i + scaleXOffset] += scaleFactorx * seconds;
                bodiesFlattened[i + scaleYOffset] += scaleFactory * seconds;
            }
            postMessage(bodiesFlattened, [bodiesFlattened.buffer]);
            break;
        }
        case 'body': {
            const message = e.data;
            const body = new BodyComponent();
            const proxyEntity = new Entity();
            proxyEntity.addComponent(body);
            entitiesMap.set(message.id, proxyEntity);
            bodyMap.set(message.id, body);
            syncMessageToBody(message, body);
            break;
        }
        case 'collider': {
            const message = e.data;
            const collider = new ColliderComponent(new PolygonCollider({ points: message.points.map(messageToVector) }));
            colliderMap.set(message.id, collider);
            syncMessageToCollider(message, collider);
            break;
        }
        default: {
            console.log("Unknown message", e.data);
        }
    }
};
const motion = new MotionSystem();
const collision = new CollisionSystem();
const runPhysicsStep = (elapsedMs) => {
    const entities = Array.from(entitiesMap.values());
    // integrate
    motion.update(entities, elapsedMs);
    // physics
    collision.update(entities, elapsedMs);
    // Sync back
    const bodies = [];
    for (let entity of entities) {
        const body = entity.get(BodyComponent);
        bodies.push(serializeToBodyMessage(body));
    }
    postMessage(bodies);
};
// const start = (fps: number) => {
//   setInterval(() => {
//     runPhysicsStep(1000/fps);
//   }, 1000/fps)
// }

/******/ })()
;