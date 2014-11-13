var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ex;
(function (ex) {
    (function (Input) {
        var PointerEvent = (function (_super) {
            __extends(PointerEvent, _super);
            function PointerEvent(x, y, ev) {
                _super.call(this);
                this.x = x;
                this.y = y;
                this.ev = ev;
            }
            return PointerEvent;
        })(ex.GameEvent);
        Input.PointerEvent = PointerEvent;
        ;

        /**
        * Handles pointer events (mouse, touch, stylus, etc.) and conforms to W3C Pointer Events
        */
        var Pointer = (function (_super) {
            __extends(Pointer, _super);
            function Pointer(engine) {
                _super.call(this);
                this._pointerDown = [];
                this._pointerUp = [];
                this._pointerMove = [];
                this._pointerCancel = [];

                this._engine = engine;
            }
            /**
            * Initializes pointer event listeners
            */
            Pointer.prototype.init = function () {
                // Touch Events
                this._engine.canvas.addEventListener('touchstart', this._handleTouchEvent("down", this._pointerDown));
                this._engine.canvas.addEventListener('touchend', this._handleTouchEvent("up", this._pointerUp));
                this._engine.canvas.addEventListener('touchmove', this._handleTouchEvent("move", this._pointerMove));
                this._engine.canvas.addEventListener('touchcancel', this._handleTouchEvent("cancel", this._pointerCancel));

                // W3C Pointer Events
                // Current: IE11
                if (window.MSPointerEvent) {
                    this._engine.canvas.addEventListener('pointerdown', this._handlePointerEvent("down", this._pointerDown));
                    this._engine.canvas.addEventListener('pointerup', this._handlePointerEvent("up", this._pointerUp));
                    this._engine.canvas.addEventListener('pointermove', this._handlePointerEvent("move", this._pointerMove));
                    this._engine.canvas.addEventListener('pointercancel', this._handlePointerEvent("cancel", this._pointerMove));
                } else {
                    // Mouse Events
                    this._engine.canvas.addEventListener('mousedown', this._handleMouseEvent("down", this._pointerDown));
                    this._engine.canvas.addEventListener('mouseup', this._handleMouseEvent("up", this._pointerUp));
                    this._engine.canvas.addEventListener('mousemove', this._handleMouseEvent("move", this._pointerMove));
                }
            };

            Pointer.prototype.update = function (delta) {
                this._pointerUp.length = 0;
                this._pointerDown.length = 0;
                this._pointerMove.length = 0;
                this._pointerCancel.length = 0;
            };

            /**
            * Propogates events to actor if necessary
            */
            Pointer.prototype.propogate = function (actor) {
                this._pointerUp.forEach(function (e) {
                    if (actor.contains(e.x, e.y)) {
                        actor.eventDispatcher.publish("pointerup", e);
                    }
                });
                this._pointerDown.forEach(function (e) {
                    if (actor.contains(e.x, e.y)) {
                        actor.eventDispatcher.publish("pointerdown", e);
                    }
                });
                if (actor.inputEnableMoveEvents) {
                    this._pointerMove.forEach(function (e) {
                        if (actor.contains(e.x, e.y)) {
                            actor.eventDispatcher.publish("pointermove", e);
                        }
                    });
                }
                this._pointerCancel.forEach(function (e) {
                    if (actor.contains(e.x, e.y)) {
                        actor.eventDispatcher.publish("pointercancel", e);
                    }
                });
            };

            Pointer.prototype._handleMouseEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    var x = e.pageX - ex.Util.getPosition(_this._engine.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this._engine.canvas).y;
                    var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Point(x, y));
                    var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, e);
                    eventArr.push(pe);
                    _this.eventDispatcher.publish(eventName, pe);
                };
            };

            Pointer.prototype._handleTouchEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    var x = e.changedTouches[0].pageX - ex.Util.getPosition(_this._engine.canvas).x;
                    var y = e.changedTouches[0].pageY - ex.Util.getPosition(_this._engine.canvas).y;
                    var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Point(x, y));
                    var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, e);
                    eventArr.push(pe);
                    _this.eventDispatcher.publish(eventName, pe);
                };
            };

            Pointer.prototype._handlePointerEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    var x = e.pageX - ex.Util.getPosition(_this._engine.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this._engine.canvas).y;
                    var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Point(x, y));
                    var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, e);
                    eventArr.push(pe);
                    _this.eventDispatcher.publish(eventName, pe);
                };
            };
            return Pointer;
        })(ex.Class);
        Input.Pointer = Pointer;
    })(ex.Input || (ex.Input = {}));
    var Input = ex.Input;
})(ex || (ex = {}));
//# sourceMappingURL=Pointer.js.map
