/*! Excalibur - v0.2.0 - 2014-03-17
* https://github.com/excaliburjs/Excalibur
* Copyright (c) 2014 ; Licensed BSD*/
if (typeof window == 'undefined') {
    window = { audioContext: function () {
        } };
}

if (typeof window != 'undefined' && !window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setInterval(callback, 1000 / 60);
    };
}

if (typeof window != 'undefined' && !window.AudioContext) {
    window.AudioContext = window.webkitAudioContext || window.mozAudioContext;
}
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ex;
(function (ex) {
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();
    ex.Point = Point;

    var Vector = (function (_super) {
        __extends(Vector, _super);
        function Vector(x, y) {
            _super.call(this, x, y);
            this.x = x;
            this.y = y;
        }
        Vector.prototype.distance = function (v) {
            if (!v) {
                v = new Vector(0.0, 0.0);
            }
            return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
        };

        Vector.prototype.normalize = function () {
            var d = this.distance();
            if (d > 0) {
                return new Vector(this.x / d, this.y / d);
            } else {
                return new Vector(0, 1);
            }
        };

        Vector.prototype.scale = function (size) {
            return new Vector(this.x * size, this.y * size);
        };

        Vector.prototype.add = function (v) {
            return new Vector(this.x + v.x, this.y + v.y);
        };

        Vector.prototype.minus = function (v) {
            return new Vector(this.x - v.x, this.y - v.y);
        };

        Vector.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y;
        };

        Vector.prototype.cross = function (v) {
            return this.x * v.y - this.y * v.x;
        };
        return Vector;
    })(Point);
    ex.Vector = Vector;
})(ex || (ex = {}));
var ex;
(function (ex) {
    (function (Util) {
        var Class = (function () {
            function Class() {
            }
            Class.extend = function (methods) {
                var _super = this.prototype;
                var SubClass = function () {
                    if (this.init) {
                        this.init.apply(this, Array.prototype.slice.call(arguments));
                    }
                };

                var SuperClass = new this();
                for (var prop in methods) {
                    if (typeof _super[prop] == "function" && /\b_super\b/.test(methods[prop])) {
                        SuperClass[prop] = (function (name, fn) {
                            return function () {
                                var tmp = this._super;
                                this._super = _super[name];
                                var ret = fn.apply(this, arguments);
                                this._super = tmp;
                                return ret;
                            };
                        })(prop, methods[prop]);
                    } else {
                        SuperClass[prop] = methods[prop];
                    }
                }

                SubClass.prototype.constructor = SubClass;
                SubClass.prototype = SuperClass;
                SubClass.prototype._super = SubClass;
                SubClass.prototype.super = _super;
                SubClass.extend = Class.extend;

                return SubClass;
            };
            return Class;
        })();
        Util.Class = Class;

        function base64Encode(inputStr) {
            var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var outputStr = "";
            var i = 0;

            while (i < inputStr.length) {
                var byte1 = inputStr.charCodeAt(i++) & 0xff;
                var byte2 = inputStr.charCodeAt(i++) & 0xff;
                var byte3 = inputStr.charCodeAt(i++) & 0xff;

                var enc1 = byte1 >> 2;
                var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);

                var enc3, enc4;
                if (isNaN(byte2)) {
                    enc3 = enc4 = 64;
                } else {
                    enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
                    if (isNaN(byte3)) {
                        enc4 = 64;
                    } else {
                        enc4 = byte3 & 63;
                    }
                }

                outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
            }

            return outputStr;
        }
        Util.base64Encode = base64Encode;

        function clamp(val, min, max) {
            return val <= min ? min : (val >= max ? max : val);
        }
        Util.clamp = clamp;

        function drawLine(ctx, color, startx, starty, endx, endy) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(startx, starty);
            ctx.lineTo(endx, endy);
            ctx.closePath();
            ctx.stroke();
        }
        Util.drawLine = drawLine;

        function randomInRange(min, max) {
            return min + Math.random() * (max - min);
        }
        Util.randomInRange = randomInRange;

        function getPosition(el) {
            var oLeft = 0, oTop = 0;

            var calcOffsetLeft = function (parent) {
                oLeft += parent.offsetLeft;

                if (parent.offsetParent) {
                    calcOffsetLeft(parent.offsetParent);
                }
            };
            var calcOffsetTop = function (parent) {
                oTop += parent.offsetTop;
                if (parent.offsetParent) {
                    calcOffsetTop(parent.offsetParent);
                }
            };

            calcOffsetLeft(el);
            calcOffsetTop(el);

            return new ex.Point(oLeft, oTop);
        }
        Util.getPosition = getPosition;

        var Collection = (function () {
            function Collection(initialSize) {
                this.internalArray = null;
                this.endPointer = 0;
                var size = initialSize || Collection.DefaultSize;
                this.internalArray = new Array(size);
            }
            Collection.prototype.resize = function () {
                var newSize = this.internalArray.length * 2;
                var newArray = new Array(newSize);
                var count = this.count();
                for (var i = 0; i < count; i++) {
                    newArray[i] = this.internalArray[i];
                }

                delete this.internalArray;
                this.internalArray = newArray;
            };

            Collection.prototype.push = function (element) {
                if (this.endPointer === this.internalArray.length) {
                    this.resize();
                }
                return this.internalArray[this.endPointer++] = element;
            };

            Collection.prototype.pop = function () {
                this.endPointer = this.endPointer - 1 < 0 ? 0 : this.endPointer - 1;
                return this.internalArray[this.endPointer];
            };

            Collection.prototype.count = function () {
                return this.endPointer;
            };

            Collection.prototype.clear = function () {
                this.endPointer = 0;
            };

            Collection.prototype.internalSize = function () {
                return this.internalArray.length;
            };

            Collection.prototype.elementAt = function (index) {
                if (index >= this.count()) {
                    return;
                }
                return this.internalArray[index];
            };

            Collection.prototype.insert = function (index, value) {
                if (index >= this.count()) {
                    this.resize();
                }
                return this.internalArray[index] = value;
            };

            Collection.prototype.remove = function (index) {
                var count = this.count();
                if (count === 0)
                    return;

                var removed = this.internalArray[index];
                for (var i = index; i < count; i++) {
                    this.internalArray[i] = this.internalArray[i + 1];
                }
                this.endPointer--;
                return removed;
            };

            Collection.prototype.removeElement = function (element) {
                var index = this.internalArray.indexOf(element);
                this.remove(index);
            };

            Collection.prototype.toArray = function () {
                return this.internalArray.slice(0, this.endPointer);
            };

            Collection.prototype.forEach = function (func) {
                var count = this.count();
                for (var i = 0; i < count; i++) {
                    func.call(this, this.internalArray[i], i);
                }
            };

            Collection.prototype.map = function (func) {
                var count = this.count();
                for (var i = 0; i < count; i++) {
                    this.internalArray[i] = func.call(this, this.internalArray[i], i);
                }
            };
            Collection.DefaultSize = 200;
            return Collection;
        })();
        Util.Collection = Collection;
    })(ex.Util || (ex.Util = {}));
    var Util = ex.Util;
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Overlap = (function () {
        function Overlap(x, y) {
            this.x = x;
            this.y = y;
        }
        return Overlap;
    })();
    ex.Overlap = Overlap;

    var Scene = (function () {
        function Scene() {
            this.children = [];
            this.killQueue = [];
            this.timers = [];
            this.cancelQueue = [];
            this.collisionGroups = {};
        }
        Scene.prototype.onActivate = function () {
        };

        Scene.prototype.onDeactivate = function () {
        };

        Scene.prototype.publish = function (eventType, event) {
            this.children.forEach(function (actor) {
                actor.triggerEvent(eventType, event);
            });
        };

        Scene.prototype.update = function (engine, delta) {
            var len = 0;
            var start = 0;
            var end = 0;
            var actor;

            for (var i = 0, len = this.children.length; i < len; i++) {
                this.children[i].update(engine, delta);
            }

            var actorIndex = 0;
            for (var j = 0, len = this.killQueue.length; j < len; j++) {
                actorIndex = this.children.indexOf(this.killQueue[j]);
                this.children.splice(actorIndex, 1);
            }
            this.killQueue.length = 0;

            var timerIndex = 0;
            for (var k = 0, len = this.cancelQueue.length; k < len; k++) {
                this.removeTimer(this.cancelQueue[k]);
            }
            this.cancelQueue.length = 0;

            var that = this;
            this.timers = this.timers.filter(function (timer) {
                timer.update(delta);
                return !timer.complete;
            });
        };

        Scene.prototype.draw = function (ctx, delta) {
            var len = 0;
            var start = 0;
            var end = 0;
            var actor;
            for (var i = 0, len = this.children.length; i < len; i++) {
                actor = this.children[i];
                this.children[i].draw(ctx, delta);
            }
        };

        Scene.prototype.debugDraw = function (ctx) {
            this.children.forEach(function (actor) {
                actor.debugDraw(ctx);
            });
        };

        Scene.prototype.addChild = function (actor) {
            actor.scene = this;
            this.updateAddCollisionGroups(actor);
            this.children.push(actor);
            actor.parent = this.actor;
        };

        Scene.prototype.updateAddCollisionGroups = function (actor) {
            var _this = this;
            actor.collisionGroups.forEach(function (group) {
                if (!(_this.collisionGroups[group] instanceof Array)) {
                    _this.collisionGroups[group] = [];
                }
                _this.collisionGroups[group].push(actor);
            });
        };

        Scene.prototype.removeChild = function (actor) {
            this.updateRemoveCollisionGroups(actor);
            this.killQueue.push(actor);
            actor.parent = null;
        };

        Scene.prototype.updateRemoveCollisionGroups = function (actor) {
            for (var group in this.collisionGroups) {
                this.collisionGroups[group] = this.collisionGroups[group].filter(function (a) {
                    return a != actor;
                });
            }
        };

        Scene.prototype.addTimer = function (timer) {
            this.timers.push(timer);
            timer.scene = this;
            return timer;
        };

        Scene.prototype.removeTimer = function (timer) {
            var i = this.timers.indexOf(timer);
            this.timers.splice(i, 1);
            return timer;
        };

        Scene.prototype.cancelTimer = function (timer) {
            this.cancelQueue.push(timer);
            return timer;
        };

        Scene.prototype.isTimerActive = function (timer) {
            return (this.timers.indexOf(timer) > -1);
        };
        return Scene;
    })();
    ex.Scene = Scene;

    (function (Side) {
        Side[Side["NONE"] = 0] = "NONE";
        Side[Side["TOP"] = 1] = "TOP";
        Side[Side["BOTTOM"] = 2] = "BOTTOM";
        Side[Side["LEFT"] = 3] = "LEFT";
        Side[Side["RIGHT"] = 4] = "RIGHT";
    })(ex.Side || (ex.Side = {}));
    var Side = ex.Side;

    var Actor = (function (_super) {
        __extends(Actor, _super);
        function Actor(x, y, width, height, color) {
            _super.call(this);
            this.x = 0;
            this.y = 0;
            this.height = 0;
            this.width = 0;
            this.rotation = 0;
            this.rx = 0;
            this.scale = 1;
            this.sx = 0;
            this.dx = 0;
            this.dy = 0;
            this.ax = 0;
            this.ay = 0;
            this.invisible = false;
            this.opacity = 1;
            this.previousOpacity = 1;
            this.logger = ex.Logger.getInstance();
            this.scene = null;
            this.parent = null;
            this.fixed = true;
            this.preventCollisions = false;
            this.collisionGroups = [];
            this.frames = {};
            this.currentDrawing = null;
            this.centerDrawingX = false;
            this.centerDrawingY = false;
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
            this.color = color;
            this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
            this.eventDispatcher = new ex.EventDispatcher(this);
            this.sceneNode = new Scene();
            this.sceneNode.actor = this;
        }
        Actor.prototype.kill = function () {
            if (this.scene) {
                this.scene.removeChild(this);
            } else {
                this.logger.warn("Cannot kill actor, it was never added to the Scene");
            }
        };

        Actor.prototype.addChild = function (actor) {
            this.sceneNode.addChild(actor);
        };

        Actor.prototype.removeChild = function (actor) {
            this.sceneNode.removeChild(actor);
        };

        Actor.prototype.setDrawing = function (key) {
            if (this.currentDrawing != this.frames[key]) {
                this.frames[key].reset();
            }
            this.currentDrawing = this.frames[key];
        };

        Actor.prototype.addDrawing = function (key, drawing) {
            this.frames[key] = drawing;
            if (!this.currentDrawing) {
                this.currentDrawing = drawing;
            }
        };

        Actor.prototype.addEventListener = function (eventName, handler) {
            this.eventDispatcher.subscribe(eventName, handler);
        };

        Actor.prototype.removeEventListener = function (eventName, handler) {
            this.eventDispatcher.unsubscribe(eventName, handler);
        };

        Actor.prototype.triggerEvent = function (eventName, event) {
            this.eventDispatcher.publish(eventName, event);
        };

        Actor.prototype.addCollisionGroup = function (name) {
            this.collisionGroups.push(name);
            if (this.scene) {
                this.scene.updateAddCollisionGroups(this);
            }
        };

        Actor.prototype.removeCollisionGroup = function (name) {
            var index = this.collisionGroups.indexOf(name);
            this.collisionGroups.splice(index, 1);
            if (this.scene) {
                this.scene.updateRemoveCollisionGroups(this);
            }
        };

        Actor.prototype.getCenter = function () {
            return new ex.Vector(this.x + this.getWidth() / 2, this.y + this.getHeight() / 2);
        };

        Actor.prototype.getWidth = function () {
            return this.width * this.scale;
        };

        Actor.prototype.setWidth = function (width) {
            this.width = width / this.scale;
        };

        Actor.prototype.getHeight = function () {
            return this.height * this.scale;
        };

        Actor.prototype.setHeight = function (height) {
            this.height = height / this.scale;
        };

        Actor.prototype.setCenterDrawing = function (center) {
            this.centerDrawingY = true;
            this.centerDrawingX = true;
        };

        Actor.prototype.getLeft = function () {
            return this.x;
        };

        Actor.prototype.getRight = function () {
            return this.x + this.getWidth();
        };

        Actor.prototype.getTop = function () {
            return this.y;
        };

        Actor.prototype.getBottom = function () {
            return this.y + this.getHeight();
        };

        Actor.prototype.getGlobalX = function () {
            var previous;
            var current = this.parent;
            while (current) {
                previous = current;
                current = current.parent;
            }
            if (previous) {
                return this.x + previous.x;
            } else {
                return this.x;
            }
        };

        Actor.prototype.getGlobalY = function () {
            var previous;
            var current = this.parent;
            while (current) {
                previous = current;
                current = current.parent;
            }
            if (previous) {
                return this.y + previous.y;
            } else {
                return this.y;
            }
        };

        Actor.prototype.getOverlap = function (box) {
            var xover = 0;
            var yover = 0;
            if (this.collides(box)) {
                if (this.getLeft() < box.getRight()) {
                    xover = box.getRight() - this.getLeft();
                }
                if (box.getLeft() < this.getRight()) {
                    var tmp = box.getLeft() - this.getRight();
                    if (Math.abs(xover) > Math.abs(tmp)) {
                        xover = tmp;
                    }
                }

                if (this.getBottom() > box.getTop()) {
                    yover = box.getTop() - this.getBottom();
                }

                if (box.getBottom() > this.getTop()) {
                    var tmp = box.getBottom() - this.getTop();
                    if (Math.abs(yover) > Math.abs(tmp)) {
                        yover = tmp;
                    }
                }
            }
            return new Overlap(xover, yover);
        };

        Actor.prototype.contains = function (x, y) {
            return (this.x <= x && this.y <= y && this.getBottom() >= y && this.getRight() >= x);
        };

        Actor.prototype.collides = function (actor) {
            var w = 0.5 * (this.getWidth() + actor.getWidth());
            var h = 0.5 * (this.getHeight() + actor.getHeight());

            var dx = (this.x + this.getWidth() / 2.0) - (actor.x + actor.getWidth() / 2.0);
            var dy = (this.y + this.getHeight() / 2.0) - (actor.y + actor.getHeight() / 2.0);

            if (Math.abs(dx) < w && Math.abs(dy) < h) {
                var wy = w * dy;
                var hx = h * dx;

                if (wy > hx) {
                    if (wy > -hx) {
                        return 1 /* TOP */;
                    } else {
                        return 3 /* LEFT */;
                    }
                } else {
                    if (wy > -hx) {
                        return 4 /* RIGHT */;
                    } else {
                        return 2 /* BOTTOM */;
                    }
                }
            }

            return 0 /* NONE */;
        };

        Actor.prototype.within = function (actor, distance) {
            return Math.sqrt(Math.pow(this.x - actor.x, 2) + Math.pow(this.y - actor.y, 2)) <= distance;
        };

        Actor.prototype.clearActions = function () {
            this.actionQueue.clearActions();
        };

        Actor.prototype.moveTo = function (x, y, speed) {
            this.actionQueue.add(new ex.Internal.Actions.MoveTo(this, x, y, speed));
            return this;
        };

        Actor.prototype.moveBy = function (x, y, time) {
            this.actionQueue.add(new ex.Internal.Actions.MoveBy(this, x, y, time));
            return this;
        };

        Actor.prototype.rotateTo = function (angleRadians, speed) {
            this.actionQueue.add(new ex.Internal.Actions.RotateTo(this, angleRadians, speed));
            return this;
        };

        Actor.prototype.rotateBy = function (angleRadians, time) {
            this.actionQueue.add(new ex.Internal.Actions.RotateBy(this, angleRadians, time));
            return this;
        };

        Actor.prototype.scaleTo = function (size, speed) {
            this.actionQueue.add(new ex.Internal.Actions.ScaleTo(this, size, speed));
            return this;
        };

        Actor.prototype.scaleBy = function (size, time) {
            this.actionQueue.add(new ex.Internal.Actions.ScaleBy(this, size, time));
            return this;
        };

        Actor.prototype.blink = function (frequency, duration, blinkTime) {
            this.actionQueue.add(new ex.Internal.Actions.Blink(this, frequency, duration, blinkTime));
            return this;
        };

        Actor.prototype.fade = function (opacity, time) {
            this.actionQueue.add(new ex.Internal.Actions.Fade(this, opacity, time));
            return this;
        };

        Actor.prototype.delay = function (time) {
            this.actionQueue.add(new ex.Internal.Actions.Delay(this, time));
            return this;
        };

        Actor.prototype.repeat = function (times) {
            if (!times) {
                this.repeatForever();
                return this;
            }
            this.actionQueue.add(new ex.Internal.Actions.Repeat(this, times, this.actionQueue.getActions()));

            return this;
        };

        Actor.prototype.repeatForever = function () {
            this.actionQueue.add(new ex.Internal.Actions.RepeatForever(this, this.actionQueue.getActions()));
            return this;
        };

        Actor.prototype.follow = function (actor, followDistance) {
            if (followDistance == undefined) {
                this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor));
            } else {
                this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor, followDistance));
            }
            return this;
        };

        Actor.prototype.meet = function (actor, speed) {
            if (speed == undefined) {
                this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor));
            } else {
                this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor, speed));
            }
            return this;
        };

        Actor.prototype.update = function (engine, delta) {
            var _this = this;
            this.sceneNode.update(engine, delta);
            var eventDispatcher = this.eventDispatcher;

            eventDispatcher.update();

            this.actionQueue.update(delta);

            this.x += this.dx * delta / 1000;
            this.y += this.dy * delta / 1000;

            this.rotation += this.rx * delta / 1000;

            this.scale += this.sx * delta / 1000;

            var potentialColliders = engine.currentScene.children;
            if (this.collisionGroups.length !== 0) {
                potentialColliders = [];
                for (var group in this.scene.collisionGroups) {
                    potentialColliders = potentialColliders.concat(this.scene.collisionGroups[group]);
                }
            }

            for (var i = 0; i < potentialColliders.length; i++) {
                var other = potentialColliders[i];
                var side = 0 /* NONE */;
                if (other !== this && !other.preventCollisions && (side = this.collides(other)) !== 0 /* NONE */) {
                    var overlap = this.getOverlap(other);
                    eventDispatcher.publish(ex.EventType[12 /* Collision */], new ex.CollisionEvent(this, other, side));
                    if (!this.fixed) {
                        if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
                            this.y += overlap.y;
                        } else {
                            this.x += overlap.x;
                        }
                    }
                }
            }

            engine.keys.forEach(function (key) {
                eventDispatcher.publish(ex.InputKey[key], new ex.KeyEvent(key));
            });

            engine.clicks.forEach(function (e) {
                if (_this.contains(e.x, e.y)) {
                    eventDispatcher.publish(ex.EventType[10 /* Click */], new ex.Click(e.x, e.y, e.mouseEvent));
                    eventDispatcher.publish(ex.EventType[3 /* MouseDown */], new ex.MouseDown(e.x, e.y, e.mouseEvent));
                }
            });

            engine.mouseMove.forEach(function (e) {
                if (_this.contains(e.x, e.y)) {
                    eventDispatcher.publish(ex.EventType[4 /* MouseMove */], new ex.MouseMove(e.x, e.y, e.mouseEvent));
                }
            });

            engine.mouseUp.forEach(function (e) {
                if (_this.contains(e.x, e.y)) {
                    eventDispatcher.publish(ex.EventType[5 /* MouseUp */], new ex.MouseUp(e.x, e.y, e.mouseEvent));
                }
            });

            engine.touchStart.forEach(function (e) {
                if (_this.contains(e.x, e.y)) {
                    eventDispatcher.publish(ex.EventType[6 /* TouchStart */], new ex.TouchStart(e.x, e.y));
                }
            });

            engine.touchMove.forEach(function (e) {
                if (_this.contains(e.x, e.y)) {
                    eventDispatcher.publish(ex.EventType[7 /* TouchMove */], new ex.TouchMove(e.x, e.y));
                }
            });

            engine.touchEnd.forEach(function (e) {
                if (_this.contains(e.x, e.y)) {
                    eventDispatcher.publish(ex.EventType[8 /* TouchEnd */], new ex.TouchEnd(e.x, e.y));
                }
            });

            engine.touchCancel.forEach(function (e) {
                if (_this.contains(e.x, e.y)) {
                    eventDispatcher.publish(ex.EventType[9 /* TouchCancel */], new ex.TouchCancel(e.x, e.y));
                }
            });

            eventDispatcher.publish(ex.EventType[15 /* Update */], new ex.UpdateEvent(delta));
        };

        Actor.prototype.draw = function (ctx, delta) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scale, this.scale);

            if (this.previousOpacity != this.opacity) {
                for (var drawing in this.frames) {
                    this.frames[drawing].addEffect(new ex.Effects.Opacity(this.opacity));
                }
                this.previousOpacity = this.opacity;
            }

            if (!this.invisible) {
                if (this.currentDrawing) {
                    var xDiff = 0;
                    var yDiff = 0;
                    if (this.centerDrawingX) {
                        xDiff = (this.currentDrawing.width * this.currentDrawing.getScale() - this.width) / 2;
                    }

                    if (this.centerDrawingY) {
                        yDiff = (this.currentDrawing.height * this.currentDrawing.getScale() - this.height) / 2;
                    }

                    this.currentDrawing.draw(ctx, -xDiff, -yDiff);
                } else {
                    ctx.fillStyle = this.color ? this.color.toString() : (new ex.Color(0, 0, 0)).toString();
                    ctx.fillRect(0, 0, this.width, this.height);
                }
            }

            this.sceneNode.draw(ctx, delta);

            ctx.restore();
        };

        Actor.prototype.debugDraw = function (ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.fillStyle = ex.Color.Yellow.toString();
            ctx.strokeStyle = ex.Color.Yellow.toString();
            ctx.beginPath();
            ctx.rect(0, 0, this.getWidth(), this.getHeight());
            ctx.stroke();

            this.sceneNode.debugDraw(ctx);
            ctx.restore();
        };
        return Actor;
    })(ex.Util.Class);
    ex.Actor = Actor;

    (function (TextAlign) {
        TextAlign[TextAlign["Left"] = 0] = "Left";

        TextAlign[TextAlign["Right"] = 1] = "Right";

        TextAlign[TextAlign["Center"] = 2] = "Center";

        TextAlign[TextAlign["Start"] = 3] = "Start";

        TextAlign[TextAlign["End"] = 4] = "End";
    })(ex.TextAlign || (ex.TextAlign = {}));
    var TextAlign = ex.TextAlign;

    (function (BaseAlign) {
        BaseAlign[BaseAlign["Top"] = 0] = "Top";

        BaseAlign[BaseAlign["Hanging"] = 1] = "Hanging";

        BaseAlign[BaseAlign["Middle"] = 2] = "Middle";

        BaseAlign[BaseAlign["Alphabetic"] = 3] = "Alphabetic";

        BaseAlign[BaseAlign["Ideographic"] = 4] = "Ideographic";

        BaseAlign[BaseAlign["Bottom"] = 5] = "Bottom";
    })(ex.BaseAlign || (ex.BaseAlign = {}));
    var BaseAlign = ex.BaseAlign;

    var Label = (function (_super) {
        __extends(Label, _super);
        function Label(text, x, y, font, spriteFont) {
            _super.call(this, x, y);
            this.letterSpacing = 0;
            this.caseInsensitive = true;
            this._textShadowOn = false;
            this._shadowOffsetX = 0;
            this._shadowOffsetY = 0;
            this._shadowColor = ex.Color.Black.clone();
            this._shadowColorDirty = false;
            this._textSprites = {};
            this._shadowSprites = {};
            this._color = ex.Color.Black.clone();
            this.text = text || "";
            this.color = ex.Color.Black.clone();
            this.spriteFont = spriteFont;
            this.fixed = true;
            this.preventCollisions = true;
            this.font = font || "10px sans-serif";
            if (spriteFont) {
                this._textSprites = spriteFont.getTextSprites();
            }
        }
        Label.prototype.getTextWidth = function (ctx) {
            var oldFont = ctx.font;
            ctx.font = this.font;
            var width = ctx.measureText(this.text).width;
            ctx.font = oldFont;
            return width;
        };

        Label.prototype._lookupTextAlign = function (textAlign) {
            switch (textAlign) {
                case 0 /* Left */:
                    return "left";
                    break;
                case 1 /* Right */:
                    return "right";
                    break;
                case 2 /* Center */:
                    return "center";
                    break;
                case 4 /* End */:
                    return "end";
                    break;
                case 3 /* Start */:
                    return "start";
                    break;
                default:
                    return "start";
                    break;
            }
        };

        Label.prototype._lookupBaseAlign = function (baseAlign) {
            switch (baseAlign) {
                case 3 /* Alphabetic */:
                    return "alphabetic";
                    break;
                case 5 /* Bottom */:
                    return "bottom";
                    break;
                case 1 /* Hanging */:
                    return "hangin";
                    break;
                case 4 /* Ideographic */:
                    return "ideographic";
                    break;
                case 2 /* Middle */:
                    return "middle";
                    break;
                case 0 /* Top */:
                    return "top";
                    break;
                default:
                    return "alphabetic";
                    break;
            }
        };

        Label.prototype.setTextShadow = function (offsetX, offsetY, shadowColor) {
            this._textShadowOn = true;
            this._shadowOffsetX = offsetX;
            this._shadowOffsetY = offsetY;
            this._shadowColor = shadowColor.clone();
            this._shadowColorDirty = true;
            for (var character in this._textSprites) {
                this._shadowSprites[character] = this._textSprites[character].clone();
            }
        };

        Label.prototype.clearTextShadow = function () {
            this._textShadowOn = false;
            this._shadowOffsetX = 0;
            this._shadowOffsetY = 0;
            this._shadowColor = ex.Color.Black.clone();
        };

        Label.prototype.update = function (engine, delta) {
            _super.prototype.update.call(this, engine, delta);

            if (this.spriteFont && this._color !== this.color) {
                for (var character in this._textSprites) {
                    this._textSprites[character].clearEffects();
                    this._textSprites[character].addEffect(new ex.Effects.Fill(this.color.clone()));
                    this._color = this.color;
                }
            }

            if (this.spriteFont && this._textShadowOn && this._shadowColorDirty && this._shadowColor) {
                for (var character in this._shadowSprites) {
                    this._shadowSprites[character].clearEffects();
                    this._shadowSprites[character].addEffect(new ex.Effects.Fill(this._shadowColor.clone()));
                }
                this._shadowColorDirty = false;
            }
        };

        Label.prototype.draw = function (ctx, delta) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.scale, this.scale);
            ctx.rotate(this.rotation);

            if (this._textShadowOn) {
                ctx.save();
                ctx.translate(this._shadowOffsetX, this._shadowOffsetY);
                this._fontDraw(ctx, delta, this._shadowSprites);
                ctx.restore();
            }
            this._fontDraw(ctx, delta, this._textSprites);

            _super.prototype.draw.call(this, ctx, delta);
            ctx.restore();
        };

        Label.prototype._fontDraw = function (ctx, delta, sprites) {
            if (!this.invisible) {
                if (this.spriteFont) {
                    var currX = 0;
                    for (var i = 0; i < this.text.length; i++) {
                        var character = this.text[i];
                        if (this.caseInsensitive) {
                            character = character.toLowerCase();
                        }
                        try  {
                            var charSprite = sprites[character];
                            charSprite.draw(ctx, currX, 0);
                            currX += (charSprite.swidth + this.letterSpacing);
                        } catch (e) {
                            ex.Logger.getInstance().error("SpriteFont Error drawing char " + character);
                        }
                    }
                } else {
                    var oldAlign = ctx.textAlign;
                    var oldTextBaseline = ctx.textBaseline;

                    ctx.textAlign = this._lookupTextAlign(this.textAlign);
                    ctx.textBaseline = this._lookupBaseAlign(this.baseAlign);

                    ctx.fillStyle = this.color.toString();
                    ctx.font = this.font;
                    if (this.maxWidth) {
                        ctx.fillText(this.text, 0, 0, this.maxWidth);
                    } else {
                        ctx.fillText(this.text, 0, 0);
                    }

                    ctx.textAlign = oldAlign;
                    ctx.textBaseline = oldTextBaseline;
                }
            }
        };

        Label.prototype.debugDraw = function (ctx) {
            _super.prototype.debugDraw.call(this, ctx);
        };
        return Label;
    })(Actor);
    ex.Label = Label;

    var Trigger = (function (_super) {
        __extends(Trigger, _super);
        function Trigger(x, y, width, height, action, repeats) {
            _super.call(this, x, y, width, height);
            this.action = function () {
            };
            this.repeats = 1;
            this.target = null;
            this.repeats = repeats || this.repeats;
            this.action = action || this.action;
            this.preventCollisions = true;
            this.eventDispatcher = new ex.EventDispatcher(this);
            this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
        }
        Trigger.prototype.update = function (engine, delta) {
            var eventDispatcher = this.eventDispatcher;

            eventDispatcher.update();

            this.actionQueue.update(delta);

            this.x += this.dx * delta / 1000;
            this.y += this.dy * delta / 1000;

            this.rotation += this.rx * delta / 1000;

            this.scale += this.sx * delta / 1000;

            if (this.target) {
                if (this.collides(this.target) !== 0 /* NONE */) {
                    this.dispatchAction();
                }
            } else {
                for (var i = 0; i < engine.currentScene.children.length; i++) {
                    var other = engine.currentScene.children[i];
                    if (other !== this && this.collides(other) !== 0 /* NONE */) {
                        this.dispatchAction();
                    }
                }
            }

            if (this.repeats === 0) {
                this.kill();
            }
        };

        Trigger.prototype.dispatchAction = function () {
            this.action.call(this);
            this.repeats--;
        };

        Trigger.prototype.draw = function (ctx, delta) {
            return;
        };

        Trigger.prototype.debugDraw = function (ctx) {
            _super.prototype.debugDraw.call(this, ctx);

            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.fillStyle = ex.Color.Violet.toString();
            ctx.strokeStyle = ex.Color.Violet.toString();
            ctx.fillText('Trigger', 10, 10);
            ctx.beginPath();
            ctx.rect(0, 0, this.getWidth(), this.getHeight());
            ctx.stroke();

            ctx.restore();
        };
        return Trigger;
    })(Actor);
    ex.Trigger = Trigger;
})(ex || (ex = {}));
var ex;
(function (ex) {
    (function (Internal) {
        (function (Actions) {
            var MoveTo = (function () {
                function MoveTo(actor, destx, desty, speed) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.end = new ex.Vector(destx, desty);
                    this.speed = speed;
                }
                MoveTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.start = new ex.Vector(this.actor.x, this.actor.y);
                        this.distance = this.start.distance(this.end);
                        this.dir = this.end.minus(this.start).normalize();
                    }
                    var m = this.dir.scale(this.speed);
                    this.actor.dx = m.x;
                    this.actor.dy = m.y;

                    if (this.isComplete(this.actor)) {
                        this.actor.x = this.end.x;
                        this.actor.y = this.end.y;
                        this.actor.dy = 0;
                        this.actor.dx = 0;
                    }
                };

                MoveTo.prototype.isComplete = function (actor) {
                    return this._stopped || (new ex.Vector(actor.x, actor.y)).distance(this.start) >= this.distance;
                };

                MoveTo.prototype.stop = function () {
                    this.actor.dy = 0;
                    this.actor.dx = 0;
                    this._stopped = true;
                };

                MoveTo.prototype.reset = function () {
                    this._started = false;
                };
                return MoveTo;
            })();
            Actions.MoveTo = MoveTo;

            var MoveBy = (function () {
                function MoveBy(actor, destx, desty, time) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.end = new ex.Vector(destx, desty);
                    if (time <= 0) {
                        ex.Logger.getInstance().error("Attempted to moveBy time less than or equal to zero : " + time);
                        throw new Error("Cannot move in time <= 0");
                    }
                    this.time = time;
                }
                MoveBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.start = new ex.Vector(this.actor.x, this.actor.y);
                        this.distance = this.start.distance(this.end);
                        this.dir = this.end.minus(this.start).normalize();
                        this.speed = this.distance / (this.time / 1000);
                    }

                    var m = this.dir.scale(this.speed);
                    this.actor.dx = m.x;
                    this.actor.dy = m.y;

                    if (this.isComplete(this.actor)) {
                        this.actor.x = this.end.x;
                        this.actor.y = this.end.y;
                        this.actor.dy = 0;
                        this.actor.dx = 0;
                    }
                };

                MoveBy.prototype.isComplete = function (actor) {
                    return this._stopped || (new ex.Vector(actor.x, actor.y)).distance(this.start) >= this.distance;
                };

                MoveBy.prototype.stop = function () {
                    this.actor.dy = 0;
                    this.actor.dx = 0;
                    this._stopped = true;
                };

                MoveBy.prototype.reset = function () {
                    this._started = false;
                };
                return MoveBy;
            })();
            Actions.MoveBy = MoveBy;

            var Follow = (function () {
                function Follow(actor, actorToFollow, followDistance) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.actorToFollow = actorToFollow;
                    this.current = new ex.Vector(this.actor.x, this.actor.y);
                    this.end = new ex.Vector(actorToFollow.x, actorToFollow.y);
                    this.maximumDistance = (followDistance != undefined) ? followDistance : this.current.distance(this.end);
                    this.speed = 0;
                }
                Follow.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.distanceBetween = this.current.distance(this.end);
                        this.dir = this.end.minus(this.current).normalize();
                    }

                    var actorToFollowSpeed = Math.sqrt(Math.pow(this.actorToFollow.dx, 2) + Math.pow(this.actorToFollow.dy, 2));
                    if (actorToFollowSpeed != 0) {
                        this.speed = actorToFollowSpeed;
                    }
                    this.current.x = this.actor.x;
                    this.current.y = this.actor.y;

                    this.end.x = this.actorToFollow.x;
                    this.end.y = this.actorToFollow.y;
                    this.distanceBetween = this.current.distance(this.end);
                    this.dir = this.end.minus(this.current).normalize();

                    if (this.distanceBetween >= this.maximumDistance) {
                        var m = this.dir.scale(this.speed);
                        this.actor.dx = m.x;
                        this.actor.dy = m.y;
                    } else {
                        this.actor.dx = 0;
                        this.actor.dy = 0;
                    }

                    if (this.isComplete(this.actor)) {
                        this.actor.x = this.end.x;
                        this.actor.y = this.end.y;
                        this.actor.dy = 0;
                        this.actor.dx = 0;
                    }
                };

                Follow.prototype.stop = function () {
                    this.actor.dy = 0;
                    this.actor.dx = 0;
                    this._stopped = true;
                };

                Follow.prototype.isComplete = function (actor) {
                    return this._stopped;
                };

                Follow.prototype.reset = function () {
                    this._started = false;
                };
                return Follow;
            })();
            Actions.Follow = Follow;

            var Meet = (function () {
                function Meet(actor, actorToMeet, speed) {
                    this._started = false;
                    this._stopped = false;
                    this._speedWasSpecified = false;
                    this.actor = actor;
                    this.actorToMeet = actorToMeet;
                    this.current = new ex.Vector(this.actor.x, this.actor.y);
                    this.end = new ex.Vector(actorToMeet.x, actorToMeet.y);
                    this.speed = speed || 0;

                    if (speed != undefined) {
                        this._speedWasSpecified = true;
                    }
                }
                Meet.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.distanceBetween = this.current.distance(this.end);
                        this.dir = this.end.minus(this.current).normalize();
                    }

                    var actorToMeetSpeed = Math.sqrt(Math.pow(this.actorToMeet.dx, 2) + Math.pow(this.actorToMeet.dy, 2));
                    if ((actorToMeetSpeed != 0) && (!this._speedWasSpecified)) {
                        this.speed = actorToMeetSpeed;
                    }
                    this.current.x = this.actor.x;
                    this.current.y = this.actor.y;

                    this.end.x = this.actorToMeet.x;
                    this.end.y = this.actorToMeet.y;
                    this.distanceBetween = this.current.distance(this.end);
                    this.dir = this.end.minus(this.current).normalize();

                    var m = this.dir.scale(this.speed);
                    this.actor.dx = m.x;
                    this.actor.dy = m.y;

                    if (this.isComplete(this.actor)) {
                        this.actor.x = this.end.x;
                        this.actor.y = this.end.y;
                        this.actor.dy = 0;
                        this.actor.dx = 0;
                    }
                };

                Meet.prototype.isComplete = function (actor) {
                    return this._stopped || (this.distanceBetween <= 1);
                };

                Meet.prototype.stop = function () {
                    this.actor.dy = 0;
                    this.actor.dx = 0;
                    this._stopped = true;
                };

                Meet.prototype.reset = function () {
                    this._started = false;
                };
                return Meet;
            })();
            Actions.Meet = Meet;

            var RotateTo = (function () {
                function RotateTo(actor, angleRadians, speed) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.end = angleRadians;
                    this.speed = speed;
                }
                RotateTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.start = this.actor.rotation;
                        this.distance = Math.abs(this.end - this.start);
                    }
                    this.actor.rx = this.speed;

                    if (this.isComplete(this.actor)) {
                        this.actor.rotation = this.end;
                        this.actor.rx = 0;
                    }
                };

                RotateTo.prototype.isComplete = function (actor) {
                    return this._stopped || (Math.abs(this.actor.rotation - this.start) >= this.distance);
                };

                RotateTo.prototype.stop = function () {
                    this.actor.rx = 0;
                    this._stopped = true;
                };

                RotateTo.prototype.reset = function () {
                    this._started = false;
                };
                return RotateTo;
            })();
            Actions.RotateTo = RotateTo;

            var RotateBy = (function () {
                function RotateBy(actor, angleRadians, time) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.end = angleRadians;
                    this.time = time;
                    this.speed = (this.end - this.actor.rotation) / time * 1000;
                }
                RotateBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.start = this.actor.rotation;
                        this.distance = Math.abs(this.end - this.start);
                    }
                    this.actor.rx = this.speed;

                    if (this.isComplete(this.actor)) {
                        this.actor.rotation = this.end;
                        this.actor.rx = 0;
                    }
                };

                RotateBy.prototype.isComplete = function (actor) {
                    return this._stopped || (Math.abs(this.actor.rotation - this.start) >= this.distance);
                };

                RotateBy.prototype.stop = function () {
                    this.actor.rx = 0;
                    this._stopped = true;
                };

                RotateBy.prototype.reset = function () {
                    this._started = false;
                };
                return RotateBy;
            })();
            Actions.RotateBy = RotateBy;

            var ScaleTo = (function () {
                function ScaleTo(actor, scale, speed) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.end = scale;
                    this.speed = speed;
                }
                ScaleTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.start = this.actor.scale;
                        this.distance = Math.abs(this.end - this.start);
                    }
                    var direction = this.end < this.start ? -1 : 1;
                    this.actor.sx = this.speed * direction;

                    if (this.isComplete(this.actor)) {
                        this.actor.scale = this.end;
                        this.actor.sx = 0;
                    }
                };

                ScaleTo.prototype.isComplete = function (actor) {
                    return this._stopped || Math.abs(this.actor.scale - this.start) >= this.distance;
                };

                ScaleTo.prototype.stop = function () {
                    this.actor.sx = 0;
                    this._stopped = true;
                };

                ScaleTo.prototype.reset = function () {
                    this._started = false;
                };
                return ScaleTo;
            })();
            Actions.ScaleTo = ScaleTo;

            var ScaleBy = (function () {
                function ScaleBy(actor, scale, time) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.end = scale;
                    this.time = time;
                    this.speed = (this.end - this.actor.scale) / time * 1000;
                }
                ScaleBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.start = this.actor.scale;
                        this.distance = Math.abs(this.end - this.start);
                    }
                    var direction = this.end < this.start ? -1 : 1;
                    this.actor.sx = this.speed * direction;

                    if (this.isComplete(this.actor)) {
                        this.actor.scale = this.end;
                        this.actor.sx = 0;
                    }
                };

                ScaleBy.prototype.isComplete = function (actor) {
                    return this._stopped || (Math.abs(this.actor.scale - this.start) >= this.distance);
                };

                ScaleBy.prototype.stop = function () {
                    this.actor.sx = 0;
                    this._stopped = true;
                };

                ScaleBy.prototype.reset = function () {
                    this._started = false;
                };
                return ScaleBy;
            })();
            Actions.ScaleBy = ScaleBy;

            var Delay = (function () {
                function Delay(actor, delay) {
                    this.elapsedTime = 0;
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.delay = delay;
                }
                Delay.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                    }

                    this.x = this.actor.x;
                    this.y = this.actor.y;

                    this.elapsedTime += delta;
                };

                Delay.prototype.isComplete = function (actor) {
                    return this._stopped || (this.elapsedTime >= this.delay);
                };

                Delay.prototype.stop = function () {
                    this._stopped = true;
                };

                Delay.prototype.reset = function () {
                    this.elapsedTime = 0;
                    this._started = false;
                };
                return Delay;
            })();
            Actions.Delay = Delay;

            var Blink = (function () {
                function Blink(actor, frequency, duration, blinkTime) {
                    this._started = false;
                    this.nextBlink = 0;
                    this.elapsedTime = 0;
                    this.isBlinking = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.frequency = frequency;
                    this.duration = duration;
                    this.numBlinks = Math.floor(frequency * duration / 1000);
                    this.blinkTime = blinkTime || 200;
                }
                Blink.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.nextBlink += this.duration / this.numBlinks / 2;
                    }
                    this.x = this.actor.x;
                    this.y = this.actor.y;

                    this.elapsedTime += delta;
                    if ((this.elapsedTime + this.blinkTime / 2) > this.nextBlink && this.nextBlink > (this.elapsedTime - this.blinkTime / 2)) {
                        this.isBlinking = true;
                        this.actor.invisible = true;
                    } else {
                        if (this.isBlinking) {
                            this.isBlinking = false;
                            this.nextBlink += this.duration / this.numBlinks;
                        }
                        this.actor.invisible = false;
                    }

                    if (this.isComplete(this.actor)) {
                        this.actor.invisible = false;
                    }
                };

                Blink.prototype.isComplete = function (actor) {
                    return this._stopped || (this.elapsedTime >= this.duration);
                };

                Blink.prototype.stop = function () {
                    this.actor.invisible = false;
                    this._stopped = true;
                };

                Blink.prototype.reset = function () {
                    this._started = false;
                    this.nextBlink = 0;
                    this.elapsedTime = 0;
                    this.isBlinking = false;
                };
                return Blink;
            })();
            Actions.Blink = Blink;

            var Fade = (function () {
                function Fade(actor, endOpacity, speed) {
                    this.multiplyer = 1;
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.endOpacity = endOpacity;
                    this.speed = speed;
                    if (endOpacity < actor.opacity) {
                        this.multiplyer = -1;
                    }
                }
                Fade.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                    }
                    if (this.speed > 0) {
                        this.actor.opacity += this.multiplyer * (Math.abs(this.actor.opacity - this.endOpacity) * delta) / this.speed;
                    }
                    this.speed -= delta;

                    ex.Logger.getInstance().debug("actor opacity: " + this.actor.opacity);
                    if (this.isComplete(this.actor)) {
                        this.actor.opacity = this.endOpacity;
                    }
                };

                Fade.prototype.isComplete = function (actor) {
                    return this._stopped || (Math.abs(this.actor.opacity - this.endOpacity) < 0.01);
                };

                Fade.prototype.stop = function () {
                    this._stopped = true;
                };

                Fade.prototype.reset = function () {
                    this._started = false;
                };
                return Fade;
            })();
            Actions.Fade = Fade;

            var Repeat = (function () {
                function Repeat(actor, repeat, actions) {
                    var _this = this;
                    this._stopped = false;
                    this.actor = actor;
                    this.actionQueue = new ActionQueue(actor);
                    this.repeat = repeat;
                    this.originalRepeat = repeat;
                    actions.forEach(function (action) {
                        action.reset();
                        _this.actionQueue.add(action);
                    });
                }
                Repeat.prototype.update = function (delta) {
                    this.x = this.actor.x;
                    this.y = this.actor.y;
                    if (!this.actionQueue.hasNext()) {
                        this.actionQueue.reset();
                        this.repeat--;
                    }
                    this.actionQueue.update(delta);
                };

                Repeat.prototype.isComplete = function () {
                    return this._stopped || (this.repeat <= 0);
                };

                Repeat.prototype.stop = function () {
                    this._stopped = true;
                };

                Repeat.prototype.reset = function () {
                    this.repeat = this.originalRepeat;
                };
                return Repeat;
            })();
            Actions.Repeat = Repeat;

            var RepeatForever = (function () {
                function RepeatForever(actor, actions) {
                    var _this = this;
                    this._stopped = false;
                    this.actor = actor;
                    this.actionQueue = new ActionQueue(actor);
                    actions.forEach(function (action) {
                        action.reset();
                        _this.actionQueue.add(action);
                    });
                }
                RepeatForever.prototype.update = function (delta) {
                    this.x = this.actor.x;
                    this.y = this.actor.y;
                    if (this._stopped) {
                        return;
                    }

                    if (!this.actionQueue.hasNext()) {
                        this.actionQueue.reset();
                    }

                    this.actionQueue.update(delta);
                };

                RepeatForever.prototype.isComplete = function () {
                    return this._stopped;
                };

                RepeatForever.prototype.stop = function () {
                    this._stopped = true;
                    this.actionQueue.clearActions();
                };

                RepeatForever.prototype.reset = function () {
                };
                return RepeatForever;
            })();
            Actions.RepeatForever = RepeatForever;

            var ActionQueue = (function () {
                function ActionQueue(actor) {
                    this._actions = [];
                    this._completedActions = [];
                    this.actor = actor;
                }
                ActionQueue.prototype.add = function (action) {
                    this._actions.push(action);
                };

                ActionQueue.prototype.remove = function (action) {
                    var index = this._actions.indexOf(action);
                    this._actions.splice(index, 1);
                };

                ActionQueue.prototype.clearActions = function () {
                    this._actions.length = 0;
                    this._completedActions.length = 0;
                    this._currentAction.stop();
                };

                ActionQueue.prototype.getActions = function () {
                    return this._actions.concat(this._completedActions);
                };

                ActionQueue.prototype.hasNext = function () {
                    return this._actions.length > 0;
                };

                ActionQueue.prototype.reset = function () {
                    this._actions = this.getActions();
                    this._actions.forEach(function (action) {
                        action.reset();
                    });
                    this._completedActions = [];
                };

                ActionQueue.prototype.update = function (delta) {
                    if (this._actions.length > 0) {
                        this._currentAction = this._actions[0];
                        this._currentAction.update(delta);

                        if (this._currentAction.isComplete(this.actor)) {
                            this._completedActions.push(this._actions.shift());
                        }
                    }
                };
                return ActionQueue;
            })();
            Actions.ActionQueue = ActionQueue;
        })(Internal.Actions || (Internal.Actions = {}));
        var Actions = Internal.Actions;
    })(ex.Internal || (ex.Internal = {}));
    var Internal = ex.Internal;
})(ex || (ex = {}));
var ex;
(function (ex) {
    (function (LogLevel) {
        LogLevel[LogLevel["Debug"] = 0] = "Debug";
        LogLevel[LogLevel["Info"] = 1] = "Info";
        LogLevel[LogLevel["Warn"] = 2] = "Warn";
        LogLevel[LogLevel["Error"] = 3] = "Error";
        LogLevel[LogLevel["Fatal"] = 4] = "Fatal";
    })(ex.LogLevel || (ex.LogLevel = {}));
    var LogLevel = ex.LogLevel;

    var Logger = (function () {
        function Logger() {
            this.appenders = [];
            this.defaultLevel = 1 /* Info */;
            if (Logger._instance) {
                throw new Error("Logger is a singleton");
            }
            Logger._instance = this;

            Logger._instance.addAppender(new ConsoleAppender());
            return Logger._instance;
        }
        Logger.getInstance = function () {
            if (Logger._instance == null) {
                Logger._instance = new Logger();
            }
            return Logger._instance;
        };

        Logger.prototype.addAppender = function (appender) {
            this.appenders.push(appender);
        };

        Logger.prototype.clearAppenders = function () {
            this.appenders.length = 0;
        };

        Logger.prototype._log = function (level, args) {
            var _this = this;
            if (level == null) {
                level = this.defaultLevel;
            }

            this.appenders.forEach(function (appender) {
                if (level >= _this.defaultLevel) {
                    appender.log(level, args);
                }
            });
        };

        Logger.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            this._log(0 /* Debug */, args);
        };

        Logger.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            this._log(1 /* Info */, args);
        };

        Logger.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            this._log(2 /* Warn */, args);
        };

        Logger.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            this._log(3 /* Error */, args);
        };

        Logger.prototype.fatal = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            this._log(4 /* Fatal */, args);
        };
        Logger._instance = null;
        return Logger;
    })();
    ex.Logger = Logger;

    

    var ConsoleAppender = (function () {
        function ConsoleAppender() {
        }
        ConsoleAppender.prototype.log = function (level, args) {
            var consoleArgs = [];
            consoleArgs.unshift.apply(consoleArgs, args);
            consoleArgs.unshift("[" + LogLevel[level] + "] : ");

            if (level < 2 /* Warn */) {
                console.log.apply(console, consoleArgs);
            } else if (level < 3 /* Error */) {
                console.warn.apply(console, consoleArgs);
            } else {
                console.error.apply(console, consoleArgs);
            }
        };
        return ConsoleAppender;
    })();
    ex.ConsoleAppender = ConsoleAppender;

    var ScreenAppender = (function () {
        function ScreenAppender(width, height) {
            this._messages = [];
            this.canvas = document.createElement('canvas');
            this.canvas.width = width || window.innerWidth;
            this.canvas.height = height || window.innerHeight;
            this.canvas.style.position = 'absolute';
            this.ctx = this.canvas.getContext('2d');
            document.body.appendChild(this.canvas);
        }
        ScreenAppender.prototype.log = function (level, args) {
            var message = args.join(",");

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this._messages.unshift("[" + LogLevel[level] + "] : " + message);

            var pos = 10;
            var opacity = 1.0;
            for (var i = 0; i < this._messages.length; i++) {
                this.ctx.fillStyle = 'rgba(255,255,255,' + opacity.toFixed(2) + ')';
                this.ctx.fillText(this._messages[i], 200, pos);
                pos += 10;
                opacity = opacity > 0 ? opacity - .05 : 0;
            }
        };
        return ScreenAppender;
    })();
    ex.ScreenAppender = ScreenAppender;
})(ex || (ex = {}));
var ex;
(function (ex) {
    (function (EventType) {
        EventType[EventType["KeyDown"] = 0] = "KeyDown";
        EventType[EventType["KeyUp"] = 1] = "KeyUp";
        EventType[EventType["KeyPress"] = 2] = "KeyPress";
        EventType[EventType["MouseDown"] = 3] = "MouseDown";
        EventType[EventType["MouseMove"] = 4] = "MouseMove";
        EventType[EventType["MouseUp"] = 5] = "MouseUp";
        EventType[EventType["TouchStart"] = 6] = "TouchStart";
        EventType[EventType["TouchMove"] = 7] = "TouchMove";
        EventType[EventType["TouchEnd"] = 8] = "TouchEnd";
        EventType[EventType["TouchCancel"] = 9] = "TouchCancel";
        EventType[EventType["Click"] = 10] = "Click";
        EventType[EventType["UserEvent"] = 11] = "UserEvent";
        EventType[EventType["Collision"] = 12] = "Collision";
        EventType[EventType["Blur"] = 13] = "Blur";
        EventType[EventType["Focus"] = 14] = "Focus";
        EventType[EventType["Update"] = 15] = "Update";
    })(ex.EventType || (ex.EventType = {}));
    var EventType = ex.EventType;

    var GameEvent = (function () {
        function GameEvent() {
        }
        return GameEvent;
    })();
    ex.GameEvent = GameEvent;

    var FocusEvent = (function (_super) {
        __extends(FocusEvent, _super);
        function FocusEvent() {
            _super.call(this);
        }
        return FocusEvent;
    })(GameEvent);
    ex.FocusEvent = FocusEvent;

    var BlurEvent = (function (_super) {
        __extends(BlurEvent, _super);
        function BlurEvent() {
            _super.call(this);
        }
        return BlurEvent;
    })(GameEvent);
    ex.BlurEvent = BlurEvent;

    var CollisionEvent = (function (_super) {
        __extends(CollisionEvent, _super);
        function CollisionEvent(actor, other, side) {
            _super.call(this);
            this.actor = actor;
            this.other = other;
            this.side = side;
        }
        return CollisionEvent;
    })(GameEvent);
    ex.CollisionEvent = CollisionEvent;

    var UpdateEvent = (function (_super) {
        __extends(UpdateEvent, _super);
        function UpdateEvent(delta) {
            _super.call(this);
            this.delta = delta;
        }
        return UpdateEvent;
    })(GameEvent);
    ex.UpdateEvent = UpdateEvent;

    var KeyEvent = (function (_super) {
        __extends(KeyEvent, _super);
        function KeyEvent(key) {
            _super.call(this);
            this.key = key;
        }
        return KeyEvent;
    })(GameEvent);
    ex.KeyEvent = KeyEvent;

    var KeyDown = (function (_super) {
        __extends(KeyDown, _super);
        function KeyDown(key) {
            _super.call(this);
            this.key = key;
        }
        return KeyDown;
    })(GameEvent);
    ex.KeyDown = KeyDown;

    var KeyUp = (function (_super) {
        __extends(KeyUp, _super);
        function KeyUp(key) {
            _super.call(this);
            this.key = key;
        }
        return KeyUp;
    })(GameEvent);
    ex.KeyUp = KeyUp;

    var KeyPress = (function (_super) {
        __extends(KeyPress, _super);
        function KeyPress(key) {
            _super.call(this);
            this.key = key;
        }
        return KeyPress;
    })(GameEvent);
    ex.KeyPress = KeyPress;

    (function (MouseButton) {
        MouseButton[MouseButton["Left"] = 0] = "Left";

        MouseButton[MouseButton["Middle"] = 1] = "Middle";

        MouseButton[MouseButton["Right"] = 2] = "Right";
    })(ex.MouseButton || (ex.MouseButton = {}));
    var MouseButton = ex.MouseButton;

    var MouseDown = (function (_super) {
        __extends(MouseDown, _super);
        function MouseDown(x, y, mouseEvent) {
            _super.call(this);
            this.x = x;
            this.y = y;
            this.mouseEvent = mouseEvent;
        }
        return MouseDown;
    })(GameEvent);
    ex.MouseDown = MouseDown;

    var MouseMove = (function (_super) {
        __extends(MouseMove, _super);
        function MouseMove(x, y, mouseEvent) {
            _super.call(this);
            this.x = x;
            this.y = y;
            this.mouseEvent = mouseEvent;
        }
        return MouseMove;
    })(GameEvent);
    ex.MouseMove = MouseMove;

    var MouseUp = (function (_super) {
        __extends(MouseUp, _super);
        function MouseUp(x, y, mouseEvent) {
            _super.call(this);
            this.x = x;
            this.y = y;
            this.mouseEvent = mouseEvent;
        }
        return MouseUp;
    })(GameEvent);
    ex.MouseUp = MouseUp;

    

    var TouchStart = (function (_super) {
        __extends(TouchStart, _super);
        function TouchStart(x, y) {
            _super.call(this);
            this.x = x;
            this.y = y;
        }
        return TouchStart;
    })(GameEvent);
    ex.TouchStart = TouchStart;

    var TouchMove = (function (_super) {
        __extends(TouchMove, _super);
        function TouchMove(x, y) {
            _super.call(this);
            this.x = x;
            this.y = y;
        }
        return TouchMove;
    })(GameEvent);
    ex.TouchMove = TouchMove;

    var TouchEnd = (function (_super) {
        __extends(TouchEnd, _super);
        function TouchEnd(x, y) {
            _super.call(this);
            this.x = x;
            this.y = y;
        }
        return TouchEnd;
    })(GameEvent);
    ex.TouchEnd = TouchEnd;

    var TouchCancel = (function (_super) {
        __extends(TouchCancel, _super);
        function TouchCancel(x, y) {
            _super.call(this);
            this.x = x;
            this.y = y;
        }
        return TouchCancel;
    })(GameEvent);
    ex.TouchCancel = TouchCancel;

    var Click = (function (_super) {
        __extends(Click, _super);
        function Click(x, y, mouseEvent) {
            _super.call(this);
            this.x = x;
            this.y = y;
            this.mouseEvent = mouseEvent;
        }
        return Click;
    })(GameEvent);
    ex.Click = Click;

    var EventDispatcher = (function () {
        function EventDispatcher(target) {
            this._handlers = {};
            this.queue = [];
            this.log = ex.Logger.getInstance();
            this.target = target;
        }
        EventDispatcher.prototype.publish = function (eventName, event) {
            if (!eventName) {
                return;
            }
            eventName = eventName.toLowerCase();
            var queue = this.queue;
            var target = this.target;
            event.target = target;
            if (this._handlers[eventName]) {
                this._handlers[eventName].forEach(function (callback) {
                    queue.push(function () {
                        callback.call(target, event);
                    });
                });
            }
        };

        EventDispatcher.prototype.subscribe = function (eventName, handler) {
            eventName = eventName.toLowerCase();
            if (!this._handlers[eventName]) {
                this._handlers[eventName] = [];
            }
            this._handlers[eventName].push(handler);
        };

        EventDispatcher.prototype.unsubscribe = function (eventName, handler) {
            eventName = eventName.toLowerCase();
            var eventHandlers = this._handlers[eventName];

            if (eventHandlers) {
                if (!handler) {
                    this._handlers[eventName].length = 0;
                } else {
                    var index = eventHandlers.indexOf(handler);
                    this._handlers[eventName].splice(index, 1);
                }
            }
        };

        EventDispatcher.prototype.update = function () {
            var callback;
            while (callback = this.queue.shift()) {
                callback();
            }
        };
        return EventDispatcher;
    })();
    ex.EventDispatcher = EventDispatcher;
})(ex || (ex = {}));
var ex;
(function (ex) {
    (function (EmitterType) {
        EmitterType[EmitterType["Circle"] = 0] = "Circle";

        EmitterType[EmitterType["Rectangle"] = 1] = "Rectangle";
    })(ex.EmitterType || (ex.EmitterType = {}));
    var EmitterType = ex.EmitterType;

    var Particle = (function () {
        function Particle(emitter, life, opacity, beginColor, endColor, position, velocity, acceleration) {
            this.position = new ex.Vector(0, 0);
            this.velocity = new ex.Vector(0, 0);
            this.acceleration = new ex.Vector(0, 0);
            this.focus = null;
            this.focusAccel = 0;
            this.opacity = 1;
            this.beginColor = ex.Color.White.clone();
            this.endColor = ex.Color.White.clone();
            this.life = 300;
            this.fadeFlag = false;
            this.rRate = 1;
            this.gRate = 1;
            this.bRate = 1;
            this.aRate = 0;
            this.currentColor = ex.Color.White.clone();
            this.emitter = null;
            this.particleSize = 5;
            this.particleSprite = null;
            this.emitter = emitter;
            this.life = life || this.life;
            this.opacity = opacity || this.opacity;
            this.endColor = endColor || this.endColor.clone();
            this.beginColor = beginColor || this.beginColor.clone();
            this.currentColor = this.beginColor.clone();
            this.position = position || this.position;
            this.velocity = velocity || this.velocity;
            this.acceleration = acceleration || this.acceleration;
            this.rRate = (this.endColor.r - this.beginColor.r) / this.life;
            this.gRate = (this.endColor.g - this.beginColor.g) / this.life;
            this.bRate = (this.endColor.b - this.beginColor.b) / this.life;
            this.aRate = this.opacity / this.life;
        }
        Particle.prototype.kill = function () {
            this.emitter.removeParticle(this);
        };

        Particle.prototype.update = function (delta) {
            this.life = this.life - delta;

            if (this.life < 0) {
                this.kill();
            }

            if (this.fadeFlag) {
                this.opacity = ex.Util.clamp(this.aRate * this.life, 0.0001, 1);
            }

            this.currentColor.r = ex.Util.clamp(this.currentColor.r + this.rRate * delta, 0, 255);
            this.currentColor.g = ex.Util.clamp(this.currentColor.g + this.gRate * delta, 0, 255);
            this.currentColor.b = ex.Util.clamp(this.currentColor.b + this.bRate * delta, 0, 255);
            this.currentColor.a = ex.Util.clamp(this.opacity, 0.0001, 1);

            if (this.focus) {
                var accel = this.focus.minus(this.position).normalize().scale(this.focusAccel).scale(delta / 1000);
                this.velocity = this.velocity.add(accel);
            } else {
                this.velocity = this.velocity.add(this.acceleration.scale(delta / 1000));
            }
            this.position = this.position.add(this.velocity.scale(delta / 1000));
        };

        Particle.prototype.draw = function (ctx) {
            if (this.particleSprite) {
                this.particleSprite.draw(ctx, this.position.x, this.position.y);
                return;
            }

            this.currentColor.a = ex.Util.clamp(this.opacity, 0.0001, 1);
            ctx.fillStyle = this.currentColor.toString();
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.particleSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        };
        return Particle;
    })();
    ex.Particle = Particle;

    var ParticleEmitter = (function (_super) {
        __extends(ParticleEmitter, _super);
        function ParticleEmitter(x, y, width, height) {
            _super.call(this, x, y, width, height, ex.Color.White);
            this.numParticles = 0;
            this.isEmitting = true;
            this.particles = null;
            this.deadParticles = null;
            this.minVel = 0;
            this.maxVel = 0;
            this.acceleration = new ex.Vector(0, 0);
            this.minAngle = 0;
            this.maxAngle = 0;
            this.emitRate = 1;
            this.particleLife = 2000;
            this.opacity = 1;
            this.fadeFlag = false;
            this.focus = null;
            this.focusAccel = 1;
            this.minSize = 5;
            this.maxSize = 5;
            this.beginColor = ex.Color.White;
            this.endColor = ex.Color.White;
            this.particleSprite = null;
            this.emitterType = 1 /* Rectangle */;
            this.radius = 0;
            this.preventCollisions = true;
            this.particles = new ex.Util.Collection();
            this.deadParticles = new ex.Util.Collection();
        }
        ParticleEmitter.prototype.removeParticle = function (particle) {
            this.deadParticles.push(particle);
        };

        ParticleEmitter.prototype.emit = function (particleCount) {
            for (var i = 0; i < particleCount; i++) {
                this.particles.push(this.createParticle());
            }
        };

        ParticleEmitter.prototype.clearParticles = function () {
            this.particles.clear();
        };

        ParticleEmitter.prototype.createParticle = function () {
            var ranX = 0;
            var ranY = 0;

            var angle = ex.Util.randomInRange(this.minAngle, this.maxAngle);
            var vel = ex.Util.randomInRange(this.minVel, this.maxVel);
            var size = ex.Util.randomInRange(this.minSize, this.maxSize);
            var dx = vel * Math.cos(angle);
            var dy = vel * Math.sin(angle);

            if (this.emitterType === 1 /* Rectangle */) {
                ranX = ex.Util.randomInRange(this.x, this.x + this.getWidth());
                ranY = ex.Util.randomInRange(this.y, this.y + this.getHeight());
            } else if (this.emitterType === 0 /* Circle */) {
                var radius = ex.Util.randomInRange(0, this.radius);
                ranX = radius * Math.cos(angle) + this.x;
                ranY = radius * Math.sin(angle) + this.y;
            }

            var p = new Particle(this, this.particleLife, this.opacity, this.beginColor, this.endColor, new ex.Vector(ranX, ranY), new ex.Vector(dx, dy), this.acceleration);
            p.fadeFlag = this.fadeFlag;
            p.particleSize = size;
            p.particleSprite = this.particleSprite;
            if (this.focus) {
                p.focus = this.focus.add(new ex.Vector(this.x, this.y));
                p.focusAccel = this.focusAccel;
            }
            return p;
        };

        ParticleEmitter.prototype.update = function (engine, delta) {
            var _this = this;
            _super.prototype.update.call(this, engine, delta);
            if (this.isEmitting) {
                var numParticles = Math.ceil(this.emitRate * delta / 1000);
                this.emit(numParticles);
            }

            this.particles.forEach(function (particle, index) {
                particle.update(delta);
            });

            this.deadParticles.forEach(function (particle, index) {
                _this.particles.removeElement(particle);
            });
            this.deadParticles.clear();
        };

        ParticleEmitter.prototype.draw = function (ctx, delta) {
            this.particles.forEach(function (particle, index) {
                particle.draw(ctx);
            });
        };

        ParticleEmitter.prototype.debugDraw = function (ctx) {
            _super.prototype.debugDraw.call(this, ctx);
            ctx.fillStyle = ex.Color.Black.toString();
            ctx.fillText("Particles: " + this.particles.count(), this.x, this.y + 20);

            if (this.focus) {
                ctx.fillRect(this.focus.x + this.x, this.focus.y + this.y, 3, 3);
                ex.Util.drawLine(ctx, "yellow", this.focus.x + this.x, this.focus.y + this.y, _super.prototype.getCenter.call(this).x, _super.prototype.getCenter.call(this).y);
                ctx.fillText("Focus", this.focus.x + this.x, this.focus.y + this.y);
            }
        };
        return ParticleEmitter;
    })(ex.Actor);
    ex.ParticleEmitter = ParticleEmitter;
})(ex || (ex = {}));
var ex;
(function (ex) {
    (function (Internal) {
        var FallbackAudio = (function () {
            function FallbackAudio(path, volume) {
                this.log = ex.Logger.getInstance();
                this.onload = function () {
                };
                this.onprogress = function () {
                };
                this.onerror = function () {
                };
                if (window.AudioContext) {
                    this.log.debug("Using new Web Audio Api for " + path);
                    this.soundImpl = new WebAudio(path, volume);
                } else {
                    this.log.debug("Falling back to Audio Element for " + path);
                    this.soundImpl = new AudioTag(path, volume);
                }
            }
            FallbackAudio.prototype.setVolume = function (volume) {
                this.soundImpl.setVolume(volume);
            };

            FallbackAudio.prototype.setLoop = function (loop) {
                this.soundImpl.setLoop(loop);
            };

            FallbackAudio.prototype.load = function () {
                this.soundImpl.onload = this.onload;
                this.soundImpl.onprogress = this.onprogress;
                this.soundImpl.onerror = this.onerror;
                this.soundImpl.load();
            };

            FallbackAudio.prototype.play = function () {
                this.soundImpl.play();
            };

            FallbackAudio.prototype.stop = function () {
                this.soundImpl.stop();
            };
            return FallbackAudio;
        })();
        Internal.FallbackAudio = FallbackAudio;

        var AudioTag = (function () {
            function AudioTag(soundPath, volume) {
                var _this = this;
                this.soundPath = soundPath;
                this.audioElements = new Array(5);
                this._loadedAudio = null;
                this.isLoaded = false;
                this.index = 0;
                this.log = ex.Logger.getInstance();
                this.onload = function () {
                };
                this.onprogress = function () {
                };
                this.onerror = function () {
                };
                for (var i = 0; i < this.audioElements.length; i++) {
                    (function (i) {
                        _this.audioElements[i] = new Audio();
                    })(i);
                }

                this.setVolume(volume || 1.0);
            }
            AudioTag.prototype.audioLoaded = function () {
                this.isLoaded = true;
            };

            AudioTag.prototype.setVolume = function (volume) {
                this.audioElements.forEach(function (a) {
                    a.volume = volume;
                });
            };

            AudioTag.prototype.setLoop = function (loop) {
                this.audioElements.forEach(function (a) {
                    a.loop = loop;
                });
            };

            AudioTag.prototype.load = function () {
                var _this = this;
                var request = new XMLHttpRequest();
                request.open("GET", this.soundPath, true);
                request.responseType = 'blob';
                request.onprogress = this.onprogress;
                request.onload = function (e) {
                    _this._loadedAudio = URL.createObjectURL(request.response);
                    _this.audioElements.forEach(function (a) {
                        a.src = _this._loadedAudio;
                    });
                    _this.onload(e);
                };
                request.onerror = function (e) {
                    _this.onerror(e);
                };
                request.send();
            };

            AudioTag.prototype.play = function () {
                this.audioElements[this.index].load();
                this.audioElements[this.index].play();
                this.index = (this.index + 1) % this.audioElements.length;
            };

            AudioTag.prototype.stop = function () {
                this.audioElements.forEach(function (a) {
                    a.pause();
                });
            };
            return AudioTag;
        })();
        Internal.AudioTag = AudioTag;

        if (window.AudioContext) {
            var audioContext = new window.AudioContext();
        }

        var WebAudio = (function () {
            function WebAudio(soundPath, volume) {
                this.context = audioContext;
                this.volume = this.context.createGain();
                this.buffer = null;
                this.sound = null;
                this.path = "";
                this.isLoaded = false;
                this.loop = false;
                this.logger = ex.Logger.getInstance();
                this.onload = function () {
                };
                this.onprogress = function () {
                };
                this.onerror = function () {
                };
                this.path = soundPath;
                if (volume) {
                    this.volume.gain.value = volume;
                } else {
                    this.volume.gain.value = 1;
                }
            }
            WebAudio.prototype.setVolume = function (volume) {
                this.volume.gain.value = volume;
            };

            WebAudio.prototype.load = function () {
                var _this = this;
                var request = new XMLHttpRequest();
                request.open('GET', this.path);
                request.responseType = 'arraybuffer';
                request.onprogress = this.onprogress;
                request.onerror = this.onerror;
                request.onload = function () {
                    _this.context.decodeAudioData(request.response, function (buffer) {
                        _this.buffer = buffer;
                        _this.isLoaded = true;
                        _this.onload(_this);
                    }, function (e) {
                        _this.logger.error("Unable to decode " + _this.path + " this browser may not fully support this format, or the file may be corrupt, " + "if this is an mp3 try removing id3 tags and album art from the file.");
                        _this.isLoaded = false;
                        _this.onload(_this);
                    });
                };
                try  {
                    request.send();
                } catch (e) {
                    console.error("Error loading sound! If this is a cross origin error, you must host your sound with your html and javascript.");
                }
            };

            WebAudio.prototype.setLoop = function (loop) {
                this.loop = loop;
            };

            WebAudio.prototype.play = function () {
                if (this.isLoaded) {
                    this.sound = this.context.createBufferSource();
                    this.sound.buffer = this.buffer;
                    this.sound.loop = this.loop;
                    this.sound.connect(this.volume);
                    this.volume.connect(this.context.destination);
                    this.sound.start(0);
                }
            };

            WebAudio.prototype.stop = function () {
                if (this.sound) {
                    try  {
                        this.sound.stop(0);
                    } catch (e) {
                        this.logger.warn("The sound clip", this.path, "has already been stopped!");
                    }
                }
            };
            return WebAudio;
        })();
        Internal.WebAudio = WebAudio;
    })(ex.Internal || (ex.Internal = {}));
    var Internal = ex.Internal;
})(ex || (ex = {}));
var ex;
(function (ex) {
    (function (PromiseState) {
        PromiseState[PromiseState["Resolved"] = 0] = "Resolved";

        PromiseState[PromiseState["Rejected"] = 1] = "Rejected";

        PromiseState[PromiseState["Pending"] = 2] = "Pending";
    })(ex.PromiseState || (ex.PromiseState = {}));
    var PromiseState = ex.PromiseState;

    var Promise = (function () {
        function Promise() {
            this._state = 2 /* Pending */;
            this.successCallbacks = [];
            this.rejectCallback = function () {
            };
            this.logger = ex.Logger.getInstance();
        }
        Promise.wrap = function (value) {
            var promise = (new Promise()).resolve(value);

            return promise;
        };

        Promise.prototype.then = function (successCallback, rejectCallback) {
            if (successCallback) {
                this.successCallbacks.push(successCallback);

                if (this.state() === 0 /* Resolved */) {
                    try  {
                        successCallback.call(this, this.value);
                    } catch (e) {
                        this.handleError(e);
                    }
                }
            }
            if (rejectCallback) {
                this.rejectCallback = rejectCallback;

                if (this.state() === 1 /* Rejected */) {
                    try  {
                        rejectCallback.call(this, this.value);
                    } catch (e) {
                        this.handleError(e);
                    }
                }
            }

            return this;
        };

        Promise.prototype.error = function (errorCallback) {
            if (errorCallback) {
                this.errorCallback = errorCallback;
            }
            return this;
        };

        Promise.prototype.resolve = function (value) {
            var _this = this;
            if (this._state === 2 /* Pending */) {
                this.value = value;
                try  {
                    this._state = 0 /* Resolved */;
                    this.successCallbacks.forEach(function (cb) {
                        cb.call(_this, _this.value);
                    });
                } catch (e) {
                    this.handleError(e);
                }
            } else {
                throw new Error('Cannot resolve a promise that is not in a pending state!');
            }
            return this;
        };

        Promise.prototype.reject = function (value) {
            if (this._state === 2 /* Pending */) {
                this.value = value;
                try  {
                    this._state = 1 /* Rejected */;
                    this.rejectCallback.call(this, this.value);
                } catch (e) {
                    this.handleError(e);
                }
            } else {
                throw new Error('Cannot reject a promise that is not in a pending state!');
            }
            return this;
        };

        Promise.prototype.state = function () {
            return this._state;
        };

        Promise.prototype.handleError = function (e) {
            if (this.errorCallback) {
                this.errorCallback.call(this, e);
            }
        };
        return Promise;
    })();
    ex.Promise = Promise;
})(ex || (ex = {}));
var ex;
(function (ex) {
    

    var Texture = (function () {
        function Texture(path) {
            this.path = path;
            this.logger = ex.Logger.getInstance();
            this.onprogress = function () {
            };
            this.oncomplete = function () {
            };
            this.onerror = function () {
            };
        }
        Texture.prototype._start = function (e) {
            this.logger.debug("Started loading image " + this.path);
        };

        Texture.prototype.isLoaded = function () {
            return (!!this.image && !!this.image.src);
        };

        Texture.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();

            this.image = new Image();
            var request = new XMLHttpRequest();
            request.open("GET", this.path, true);
            request.responseType = "blob";
            request.onloadstart = function (e) {
                _this._start(e);
            };
            request.onprogress = this.onprogress;
            request.onload = function (e) {
                _this.image.src = URL.createObjectURL(request.response);
                _this.oncomplete();
                _this.logger.debug("Completed loading image", _this.path);
                complete.resolve(_this.image);
            };
            request.onerror = function (e) {
                _this.onerror(e);
                complete.reject(e);
            };
            if (request.overrideMimeType) {
                request.overrideMimeType('text/plain; charset=x-user-defined');
            }
            request.send();

            return complete;
        };
        return Texture;
    })();
    ex.Texture = Texture;

    var Sound = (function () {
        function Sound() {
            var paths = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                paths[_i] = arguments[_i + 0];
            }
            this.logger = ex.Logger.getInstance();
            this.onprogress = function () {
            };
            this.oncomplete = function () {
            };
            this.onerror = function () {
            };
            this.onload = function () {
            };
            this._isLoaded = false;
            this._selectedFile = "";
            this._selectedFile = "";
            for (var i = 0; i < paths.length; i++) {
                if (Sound.canPlayFile(paths[i])) {
                    this._selectedFile = paths[i];
                    break;
                }
            }

            if (!this._selectedFile) {
                this.logger.warn("This browser does not support any of the files specified");
                this._selectedFile = paths[0];
            }

            this.sound = new ex.Internal.FallbackAudio(this._selectedFile, 1.0);
        }
        Sound.canPlayFile = function (file) {
            var a = new Audio();
            var filetype = /.*\.([A-Za-z0-9]+)$/;
            var type = file.match(filetype)[1];
            if (a.canPlayType('audio/' + type)) {
                return true;
            }
             {
                return false;
            }
        };

        Sound.prototype.setVolume = function (volume) {
            if (this.sound)
                this.sound.setVolume(volume);
        };

        Sound.prototype.setLoop = function (loop) {
            if (this.sound)
                this.sound.setLoop(loop);
        };

        Sound.prototype.play = function () {
            if (this.sound)
                this.sound.play();
        };

        Sound.prototype.stop = function () {
            if (this.sound)
                this.sound.stop();
        };

        Sound.prototype.isLoaded = function () {
            return this._isLoaded;
        };

        Sound.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            this.logger.debug("Started loading sound", this._selectedFile);
            this.sound.onprogress = this.onprogress;
            this.sound.onload = function () {
                _this.oncomplete();
                _this._isLoaded = true;
                _this.logger.debug("Completed loading sound", _this._selectedFile);
                complete.resolve(_this.sound);
            };
            this.sound.onerror = function (e) {
                _this.onerror(e);
                complete.reject(e);
            };
            this.sound.load();
            return complete;
        };
        return Sound;
    })();
    ex.Sound = Sound;

    var Loader = (function () {
        function Loader(loadables) {
            this.resourceList = [];
            this.index = 0;
            this.resourceCount = 0;
            this.numLoaded = 0;
            this.progressCounts = {};
            this.totalCounts = {};
            this.onprogress = function () {
            };
            this.oncomplete = function () {
            };
            this.onerror = function () {
            };
            if (loadables) {
                this.addResources(loadables);
            }
        }
        Loader.prototype.addResource = function (loadable) {
            var key = this.index++;
            this.resourceList.push(loadable);
            this.progressCounts[key] = 0;
            this.totalCounts[key] = 1;
            this.resourceCount++;
        };

        Loader.prototype.addResources = function (loadables) {
            var _this = this;
            loadables.forEach(function (l) {
                _this.addResource(l);
            });
        };

        Loader.prototype.sumCounts = function (obj) {
            var sum = 0;
            var prev = 0;
            for (var i in obj) {
                sum += obj[i] | 0;
            }
            return sum;
        };

        Loader.prototype.isLoaded = function () {
            return this.numLoaded === this.resourceCount;
        };

        Loader.prototype.load = function () {
            var complete = new ex.Promise();
            var me = this;
            if (this.resourceList.length === 0) {
                me.oncomplete.call(me);
                return complete;
            }

            var progressArray = new Array(this.resourceList.length);
            var progressChunks = this.resourceList.length;

            this.resourceList.forEach(function (r, i) {
                r.onprogress = function (e) {
                    var total = e.total;
                    var loaded = e.loaded;
                    progressArray[i] = { loaded: ((loaded / total) * (100 / progressChunks)), total: 100 };

                    var progressResult = progressArray.reduce(function (accum, next) {
                        return { loaded: (accum.loaded + next.loaded), total: 100 };
                    }, { loaded: 0, total: 100 });

                    me.onprogress.call(me, progressResult);
                };
                r.oncomplete = function () {
                    me.numLoaded++;
                    if (me.numLoaded === me.resourceCount) {
                        me.oncomplete.call(me);
                        complete.resolve();
                    }
                };
            });

            function loadNext(list, index) {
                if (!list[index])
                    return;
                list[index].load().then(function () {
                    loadNext(list, index + 1);
                });
            }
            loadNext(this.resourceList, 0);

            return complete;
        };
        return Loader;
    })();
    ex.Loader = Loader;
})(ex || (ex = {}));
var ex;
(function (ex) {
    

    var SpriteSheet = (function () {
        function SpriteSheet(image, columns, rows, spWidth, spHeight) {
            this.image = image;
            this.columns = columns;
            this.rows = rows;
            this.sprites = [];
            this.internalImage = image.image;
            this.sprites = new Array(columns * rows);

            var i = 0;
            var j = 0;
            for (i = 0; i < rows; i++) {
                for (j = 0; j < columns; j++) {
                    this.sprites[j + i * columns] = new Sprite(this.image, j * spWidth, i * spHeight, spWidth, spHeight);
                }
            }
        }
        SpriteSheet.prototype.getAnimationByIndices = function (engine, indices, speed) {
            var images = this.sprites.filter(function (sprite, index) {
                return indices.indexOf(index) > -1;
            });

            images = images.map(function (i) {
                return i.clone();
            });
            return new Animation(engine, images, speed);
        };

        SpriteSheet.prototype.getAnimationBetween = function (engine, beginIndex, endIndex, speed) {
            var images = this.sprites.slice(beginIndex, endIndex);
            images = images.map(function (i) {
                return i.clone();
            });
            return new Animation(engine, images, speed);
        };

        SpriteSheet.prototype.getAnimationForAll = function (engine, speed) {
            var sprites = this.sprites.map(function (i) {
                return i.clone();
            });
            return new Animation(engine, sprites, speed);
        };

        SpriteSheet.prototype.getSprite = function (index) {
            if (index >= 0 && index < this.sprites.length) {
                return this.sprites[index].clone();
            }
        };
        return SpriteSheet;
    })();
    ex.SpriteSheet = SpriteSheet;

    var SpriteFont = (function (_super) {
        __extends(SpriteFont, _super);
        function SpriteFont(image, alphabet, caseInsensitive, columns, rows, spWidth, spHeight) {
            _super.call(this, image, columns, rows, spWidth, spHeight);
            this.image = image;
            this.alphabet = alphabet;
            this.caseInsensitive = caseInsensitive;
            this.spriteLookup = {};
            this.colorLookup = {};
            this._currentColor = ex.Color.Black;
        }
        SpriteFont.prototype.getTextSprites = function () {
            var lookup = {};
            for (var i = 0; i < this.alphabet.length; i++) {
                var char = this.alphabet[i];
                if (this.caseInsensitive) {
                    char = char.toLowerCase();
                }
                lookup[char] = this.sprites[i].clone();
            }
            return lookup;
        };
        return SpriteFont;
    })(SpriteSheet);
    ex.SpriteFont = SpriteFont;

    (function (Effects) {
        

        var Grayscale = (function () {
            function Grayscale() {
            }
            Grayscale.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var avg = (pixel[firstPixel + 0] + pixel[firstPixel + 1] + pixel[firstPixel + 2]) / 3;
                pixel[firstPixel + 0] = avg;
                pixel[firstPixel + 1] = avg;
                pixel[firstPixel + 2] = avg;
            };
            return Grayscale;
        })();
        Effects.Grayscale = Grayscale;

        var Invert = (function () {
            function Invert() {
            }
            Invert.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                pixel[firstPixel + 0] = 255 - pixel[firstPixel + 0];
                pixel[firstPixel + 1] = 255 - pixel[firstPixel + 1];
                pixel[firstPixel + 2] = 255 - pixel[firstPixel + 2];
            };
            return Invert;
        })();
        Effects.Invert = Invert;

        var Opacity = (function () {
            function Opacity(opacity) {
                this.opacity = opacity;
            }
            Opacity.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                if (pixel[firstPixel + 3] !== 0) {
                    pixel[firstPixel + 3] = Math.round(this.opacity * 255);
                }
            };
            return Opacity;
        })();
        Effects.Opacity = Opacity;

        var Colorize = (function () {
            function Colorize(color) {
                this.color = color;
            }
            Colorize.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                if (pixel[firstPixel + 3] !== 0) {
                    pixel[firstPixel + 0] = (pixel[firstPixel + 0] + this.color.r) / 2;
                    pixel[firstPixel + 1] = (pixel[firstPixel + 1] + this.color.g) / 2;
                    pixel[firstPixel + 2] = (pixel[firstPixel + 2] + this.color.b) / 2;
                }
            };
            return Colorize;
        })();
        Effects.Colorize = Colorize;

        var Fill = (function () {
            function Fill(color) {
                this.color = color;
            }
            Fill.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                if (pixel[firstPixel + 3] !== 0) {
                    pixel[firstPixel + 0] = this.color.r;
                    pixel[firstPixel + 1] = this.color.g;
                    pixel[firstPixel + 2] = this.color.b;
                }
            };
            return Fill;
        })();
        Effects.Fill = Fill;
    })(ex.Effects || (ex.Effects = {}));
    var Effects = ex.Effects;

    var Sprite = (function () {
        function Sprite(image, sx, sy, swidth, sheight) {
            this.sx = sx;
            this.sy = sy;
            this.swidth = swidth;
            this.sheight = sheight;
            this.scale = 1.0;
            this.rotation = 0.0;
            this.transformPoint = new ex.Point(0, 0);
            this.flipVertical = false;
            this.flipHorizontal = false;
            this.width = 0;
            this.height = 0;
            this.effects = [];
            this.internalImage = new Image();
            this.spriteCanvas = null;
            this.spriteCtx = null;
            this.pixelData = null;
            this.pixelsLoaded = false;
            this.dirtyEffect = false;
            this.texture = image;
            this.spriteCanvas = document.createElement('canvas');
            this.spriteCanvas.width = swidth;
            this.spriteCanvas.height = sheight;
            this.spriteCtx = this.spriteCanvas.getContext('2d');

            this.width = swidth;
            this.height = sheight;
        }
        Sprite.prototype.loadPixels = function () {
            if (this.texture.image && !this.pixelsLoaded) {
                this.spriteCtx.drawImage(this.texture.image, this.sx, this.sy, this.swidth, this.sheight, 0, 0, this.swidth, this.sheight);

                this.internalImage.src = this.spriteCanvas.toDataURL("image/png");
                this.pixelsLoaded = true;
            }
        };

        Sprite.prototype.addEffect = function (effect) {
            this.effects.push(effect);

            if (!this.texture.isLoaded() || !this.pixelsLoaded) {
                this.dirtyEffect = true;
            } else {
                this.applyEffects();
            }
        };

        Sprite.prototype.applyEffects = function () {
            var _this = this;
            this.spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
            this.spriteCtx.drawImage(this.texture.image, this.sx, this.sy, this.swidth, this.sheight, 0, 0, this.swidth, this.sheight);
            this.pixelData = this.spriteCtx.getImageData(0, 0, this.swidth, this.sheight);

            this.effects.forEach(function (effect) {
                for (var y = 0; y < _this.sheight; y++) {
                    for (var x = 0; x < _this.swidth; x++) {
                        effect.updatePixel(x, y, _this.pixelData);
                    }
                }
            });
            this.spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
            this.spriteCtx.putImageData(this.pixelData, 0, 0);
            this.internalImage.src = this.spriteCanvas.toDataURL("image/png");
        };

        Sprite.prototype.clearEffects = function () {
            this.effects.length = 0;
            this.applyEffects();
        };

        Sprite.prototype.transformAboutPoint = function (point) {
            this.transformPoint = point;
        };

        Sprite.prototype.setRotation = function (radians) {
            this.rotation = radians;
        };

        Sprite.prototype.getRotation = function () {
            return this.rotation;
        };

        Sprite.prototype.setScale = function (scale) {
            this.scale = scale;
        };

        Sprite.prototype.getScale = function () {
            return this.scale;
        };

        Sprite.prototype.reset = function () {
        };

        Sprite.prototype.draw = function (ctx, x, y) {
            this.loadPixels();
            if (this.dirtyEffect) {
                this.applyEffects();
                this.dirtyEffect = false;
            }

            ctx.save();

            ctx.translate(x + this.transformPoint.x, y + this.transformPoint.y);
            ctx.rotate(this.rotation);

            if (this.flipHorizontal) {
                ctx.translate(this.swidth, 0);
                ctx.scale(-1, 1);
            }

            if (this.flipVertical) {
                ctx.translate(0, this.sheight);
                ctx.scale(1, -1);
            }
            if (this.internalImage) {
                ctx.drawImage(this.internalImage, 0, 0, this.swidth, this.sheight, -this.transformPoint.x, -this.transformPoint.y, this.swidth * this.scale, this.sheight * this.scale);
            }
            ctx.restore();
        };

        Sprite.prototype.clone = function () {
            var result = new Sprite(this.texture, this.sx, this.sy, this.swidth, this.sheight);
            result.scale = this.scale;
            result.rotation = this.rotation;
            result.flipHorizontal = this.flipHorizontal;
            result.flipVertical = this.flipVertical;

            this.effects.forEach(function (e) {
                result.addEffect(e);
            });
            return result;
        };
        return Sprite;
    })();
    ex.Sprite = Sprite;

    var Animation = (function () {
        function Animation(engine, images, speed, loop) {
            this.currIndex = 0;
            this.oldTime = Date.now();
            this.rotation = 0.0;
            this.scale = 1.0;
            this.loop = false;
            this.freezeFrame = -1;
            this.flipVertical = false;
            this.flipHorizontal = false;
            this.width = 0;
            this.height = 0;
            this.sprites = images;
            this.speed = speed;
            this.engine = engine;
            if (loop != null) {
                this.loop = loop;
            }
            this.height = images[0] ? images[0].height : 0;
            this.width = images[0] ? images[0].width : 0;
        }
        Animation.prototype.addEffect = function (effect) {
            for (var i in this.sprites) {
                this.sprites[i].addEffect(effect);
            }
        };

        Animation.prototype.clearEffects = function () {
            for (var i in this.sprites) {
                this.sprites[i].clearEffects();
            }
        };

        Animation.prototype.transformAboutPoint = function (point) {
            for (var i in this.sprites) {
                this.sprites[i].transformAboutPoint(point);
            }
        };

        Animation.prototype.setRotation = function (radians) {
            this.rotation = radians;
            for (var i in this.sprites) {
                this.sprites[i].setRotation(radians);
            }
        };

        Animation.prototype.getRotation = function () {
            return this.rotation;
        };

        Animation.prototype.setScale = function (scale) {
            this.scale = scale;
            for (var i in this.sprites) {
                this.sprites[i].setScale(scale);
            }
        };

        Animation.prototype.getScale = function () {
            return this.scale;
        };

        Animation.prototype.reset = function () {
            this.currIndex = 0;
        };

        Animation.prototype.isDone = function () {
            return (!this.loop && this.currIndex >= this.sprites.length);
        };

        Animation.prototype.tick = function () {
            var time = Date.now();
            if ((time - this.oldTime) > this.speed) {
                this.currIndex = (this.loop ? (this.currIndex + 1) % this.sprites.length : this.currIndex + 1);
                this.oldTime = time;
            }
        };

        Animation.prototype.draw = function (ctx, x, y) {
            this.tick();
            if (this.currIndex < this.sprites.length) {
                var currSprite = this.sprites[this.currIndex];
                if (this.flipVertical) {
                    currSprite.flipVertical = this.flipVertical;
                }
                if (this.flipHorizontal) {
                    currSprite.flipHorizontal = this.flipHorizontal;
                }
                currSprite.draw(ctx, x, y);
            }

            if (this.freezeFrame !== -1 && this.currIndex >= this.sprites.length) {
                var currSprite = this.sprites[ex.Util.clamp(this.freezeFrame, 0, this.sprites.length - 1)];
                currSprite.draw(ctx, x, y);
            }
        };

        Animation.prototype.play = function (x, y) {
            this.reset();
            this.engine.playAnimation(this, x, y);
        };
        return Animation;
    })();
    ex.Animation = Animation;

    var Polygon = (function () {
        function Polygon(points) {
            this.lineWidth = 5;
            this.filled = false;
            this.points = [];
            this.transformationPoint = new ex.Point(0, 0);
            this.rotation = 0;
            this.scale = 1;
            this.points = points;

            var minX = this.points.reduce(function (prev, curr) {
                return Math.min(prev, curr.x);
            }, 0);
            var maxX = this.points.reduce(function (prev, curr) {
                return Math.max(prev, curr.x);
            }, 0);

            this.width = maxX - minX;

            var minY = this.points.reduce(function (prev, curr) {
                return Math.min(prev, curr.y);
            }, 0);
            var maxY = this.points.reduce(function (prev, curr) {
                return Math.max(prev, curr.y);
            }, 0);

            this.height = maxY - minY;
        }
        Polygon.prototype.addEffect = function (effect) {
        };

        Polygon.prototype.clearEffects = function () {
        };

        Polygon.prototype.transformAboutPoint = function (point) {
            this.transformationPoint = point;
        };

        Polygon.prototype.setScale = function (scale) {
            this.scale = scale;
        };

        Polygon.prototype.getScale = function () {
            return this.scale;
        };

        Polygon.prototype.setRotation = function (radians) {
            this.rotation = radians;
        };

        Polygon.prototype.getRotation = function () {
            return this.rotation;
        };

        Polygon.prototype.reset = function () {
        };

        Polygon.prototype.draw = function (ctx, x, y) {
            ctx.save();
            ctx.translate(x + this.transformationPoint.x, y + this.transformationPoint.y);
            ctx.scale(this.scale, this.scale);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            ctx.lineWidth = this.lineWidth;

            var firstPoint = this.points[0];
            ctx.moveTo(firstPoint.x, firstPoint.y);
            this.points.forEach(function (point) {
                ctx.lineTo(point.x, point.y);
            });
            ctx.lineTo(firstPoint.x, firstPoint.y);
            ctx.closePath();

            if (this.filled) {
                ctx.fillStyle = this.fillColor.toString();
                ctx.fill();
            }

            ctx.strokeStyle = this.lineColor.toString();

            if (this.flipHorizontal) {
                ctx.translate(this.width, 0);
                ctx.scale(-1, 1);
            }

            if (this.flipVertical) {
                ctx.translate(0, this.height);
                ctx.scale(1, -1);
            }

            ctx.stroke();
            ctx.restore();
        };
        return Polygon;
    })();
    ex.Polygon = Polygon;
    ;
})(ex || (ex = {}));
var ex;
(function (ex) {
    var BaseCamera = (function () {
        function BaseCamera(engine) {
            this.focus = new ex.Point(0, 0);
            this.isShaking = false;
            this.shakeMagnitudeX = 0;
            this.shakeMagnitudeY = 0;
            this.shakeDuration = 0;
            this.elapsedShakeTime = 0;
            this.isZooming = false;
            this.currentZoomScale = 1;
            this.maxZoomScale = 1;
            this.zoomDuration = 0;
            this.elapsedZoomTime = 0;
            this.zoomIncrement = 0.01;
            this.engine = engine;
        }
        BaseCamera.prototype.setActorToFollow = function (actor) {
            this.follow = actor;
        };

        BaseCamera.prototype.getFocus = function () {
            if (this.follow) {
                return new ex.Point(0, 0);
            } else {
                return this.focus;
            }
        };

        BaseCamera.prototype.setFocus = function (x, y) {
            if (!this.follow) {
                this.focus.x = x;
                this.focus.y = y;
            }
        };

        BaseCamera.prototype.shake = function (magnitudeX, magnitudeY, duration) {
            this.isShaking = true;
            this.shakeMagnitudeX = magnitudeX;
            this.shakeMagnitudeY = magnitudeY;
            this.shakeDuration = duration;
        };

        BaseCamera.prototype.zoom = function (scale, duration) {
            this.isZooming = true;
            this.maxZoomScale = scale;
            this.zoomDuration = duration | 0;
            if (duration) {
                this.zoomIncrement = Math.abs(this.maxZoomScale - this.currentZoomScale) / duration * 1000;
            }

            if (this.maxZoomScale < 1) {
                if (duration) {
                    this.zoomIncrement = -1 * this.zoomIncrement;
                } else {
                    this.zoomIncrement = -0.01;
                }
            }
        };

        BaseCamera.prototype.getCurrentZoomScale = function () {
            return this.currentZoomScale;
        };

        BaseCamera.prototype.setCurrentZoomScale = function (zoomScale) {
            this.currentZoomScale = zoomScale;
        };

        BaseCamera.prototype.update = function (delta) {
            var focus = this.getFocus();

            var xShake = 0;
            var yShake = 0;

            var canvasWidth = this.engine.ctx.canvas.width;
            var canvasHeight = this.engine.ctx.canvas.height;
            var newCanvasWidth = canvasWidth * this.getCurrentZoomScale();
            var newCanvasHeight = canvasHeight * this.getCurrentZoomScale();

            if (this.isDoneShaking()) {
                this.isShaking = false;
                this.elapsedShakeTime = 0;
                this.shakeMagnitudeX = 0;
                this.shakeMagnitudeY = 0;
                this.shakeDuration = 0;
            } else {
                this.elapsedShakeTime += delta;
                xShake = (Math.random() * this.shakeMagnitudeX | 0) + 1;
                yShake = (Math.random() * this.shakeMagnitudeY | 0) + 1;
            }

            this.engine.ctx.translate(focus.x + xShake, focus.y + yShake);

            if (this.isDoneZooming()) {
                this.isZooming = false;
                this.elapsedZoomTime = 0;
                this.zoomDuration = 0;
            } else {
                this.elapsedZoomTime += delta;

                this.setCurrentZoomScale(this.getCurrentZoomScale() + this.zoomIncrement * delta / 1000);
            }

            this.engine.ctx.translate(-((newCanvasWidth - canvasWidth) / 2), -((newCanvasHeight - canvasHeight) / 2));
            this.engine.ctx.scale(this.getCurrentZoomScale(), this.getCurrentZoomScale());
        };

        BaseCamera.prototype.isDoneShaking = function () {
            return !(this.isShaking) || (this.elapsedShakeTime >= this.shakeDuration);
        };

        BaseCamera.prototype.isDoneZooming = function () {
            if (this.zoomDuration != 0) {
                return (this.elapsedZoomTime >= this.zoomDuration);
            } else {
                if (this.maxZoomScale < 1) {
                    return (this.currentZoomScale <= this.maxZoomScale);
                } else {
                    return (this.currentZoomScale >= this.maxZoomScale);
                }
            }
        };
        return BaseCamera;
    })();
    ex.BaseCamera = BaseCamera;

    var SideCamera = (function (_super) {
        __extends(SideCamera, _super);
        function SideCamera() {
            _super.apply(this, arguments);
        }
        SideCamera.prototype.getFocus = function () {
            if (this.follow) {
                return new ex.Point((-this.follow.x * this.getCurrentZoomScale()) + (this.engine.width * this.getCurrentZoomScale()) / 2.0, 0);
            } else {
                return this.focus;
            }
        };
        return SideCamera;
    })(BaseCamera);
    ex.SideCamera = SideCamera;

    var TopCamera = (function (_super) {
        __extends(TopCamera, _super);
        function TopCamera() {
            _super.apply(this, arguments);
        }
        TopCamera.prototype.getFocus = function () {
            if (this.follow) {
                return new ex.Point((-this.follow.x * this.getCurrentZoomScale()) + (this.engine.width * this.getCurrentZoomScale()) / 2.0, (-this.follow.y * this.getCurrentZoomScale()) + (this.engine.height * this.getCurrentZoomScale()) / 2.0);
            } else {
                return this.focus;
            }
        };
        return TopCamera;
    })(BaseCamera);
    ex.TopCamera = TopCamera;
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Color = (function () {
        function Color(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            this.a = (a != null ? a : 1);
        }
        Color.fromRGB = function (r, g, b, a) {
            return new Color(r, g, b, a);
        };

        Color.fromHex = function (hex) {
            var hexRegEx = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
            var match = null;
            if (match = hex.match(hexRegEx)) {
                var r = parseInt(match[1], 16);
                var g = parseInt(match[2], 16);
                var b = parseInt(match[3], 16);
                var a = 1;
                if (match[4]) {
                    a = parseInt(match[4], 16) / 255;
                }
                return new Color(r, g, b, a);
            } else {
                throw new Error("Invalid hex string: " + hex);
            }
        };

        Color.prototype.toString = function () {
            var result = String(this.r.toFixed(0)) + ", " + String(this.g.toFixed(0)) + ", " + String(this.b.toFixed(0));
            if (this.a) {
                return "rgba(" + result + ", " + String(this.a) + ")";
            }
            return "rgb(" + result + ")";
        };

        Color.prototype.clone = function () {
            return new Color(this.r, this.g, this.b, this.a);
        };
        Color.Black = Color.fromHex('#000000');

        Color.White = Color.fromHex('#FFFFFF');

        Color.Yellow = Color.fromHex('#FFFF00');

        Color.Orange = Color.fromHex('#FFA500');

        Color.Red = Color.fromHex('#FF0000');

        Color.Vermillion = Color.fromHex('#FF5B31');

        Color.Rose = Color.fromHex('#FF007F');

        Color.Magenta = Color.fromHex('#FF00FF');

        Color.Violet = Color.fromHex('#7F00FF');

        Color.Blue = Color.fromHex('#0000FF');

        Color.Azure = Color.fromHex('#007FFF');

        Color.Cyan = Color.fromHex('#00FFFF');

        Color.Viridian = Color.fromHex('#59978F');

        Color.Green = Color.fromHex('#00FF00');

        Color.Chartreuse = Color.fromHex('#7FFF00');

        Color.Transparent = Color.fromHex('#FFFFFF00');
        return Color;
    })();
    ex.Color = Color;

    (function (InputKey) {
        InputKey[InputKey["Num1"] = 97] = "Num1";
        InputKey[InputKey["Num2"] = 98] = "Num2";
        InputKey[InputKey["Num3"] = 99] = "Num3";
        InputKey[InputKey["Num4"] = 100] = "Num4";
        InputKey[InputKey["Num5"] = 101] = "Num5";
        InputKey[InputKey["Num6"] = 102] = "Num6";
        InputKey[InputKey["Num7"] = 103] = "Num7";
        InputKey[InputKey["Num8"] = 104] = "Num8";
        InputKey[InputKey["Num9"] = 105] = "Num9";
        InputKey[InputKey["Num0"] = 96] = "Num0";

        InputKey[InputKey["Numlock"] = 144] = "Numlock";

        InputKey[InputKey["Semicolon"] = 186] = "Semicolon";

        InputKey[InputKey["A"] = 65] = "A";
        InputKey[InputKey["B"] = 66] = "B";
        InputKey[InputKey["C"] = 67] = "C";
        InputKey[InputKey["D"] = 68] = "D";
        InputKey[InputKey["E"] = 69] = "E";
        InputKey[InputKey["F"] = 70] = "F";
        InputKey[InputKey["G"] = 71] = "G";
        InputKey[InputKey["H"] = 72] = "H";
        InputKey[InputKey["I"] = 73] = "I";
        InputKey[InputKey["J"] = 74] = "J";
        InputKey[InputKey["K"] = 75] = "K";
        InputKey[InputKey["L"] = 76] = "L";
        InputKey[InputKey["M"] = 77] = "M";
        InputKey[InputKey["N"] = 78] = "N";
        InputKey[InputKey["O"] = 79] = "O";
        InputKey[InputKey["P"] = 80] = "P";
        InputKey[InputKey["Q"] = 81] = "Q";
        InputKey[InputKey["R"] = 82] = "R";
        InputKey[InputKey["S"] = 83] = "S";
        InputKey[InputKey["T"] = 84] = "T";
        InputKey[InputKey["U"] = 85] = "U";
        InputKey[InputKey["V"] = 86] = "V";
        InputKey[InputKey["W"] = 87] = "W";
        InputKey[InputKey["X"] = 88] = "X";
        InputKey[InputKey["Y"] = 89] = "Y";
        InputKey[InputKey["Z"] = 90] = "Z";

        InputKey[InputKey["Shift"] = 16] = "Shift";
        InputKey[InputKey["Alt"] = 18] = "Alt";
        InputKey[InputKey["Up"] = 38] = "Up";
        InputKey[InputKey["Down"] = 40] = "Down";
        InputKey[InputKey["Left"] = 37] = "Left";
        InputKey[InputKey["Right"] = 39] = "Right";
        InputKey[InputKey["Space"] = 32] = "Space";
        InputKey[InputKey["Esc"] = 27] = "Esc";
    })(ex.InputKey || (ex.InputKey = {}));
    var InputKey = ex.InputKey;
    ;

    (function (DisplayMode) {
        DisplayMode[DisplayMode["FullScreen"] = 0] = "FullScreen";

        DisplayMode[DisplayMode["Container"] = 1] = "Container";

        DisplayMode[DisplayMode["Fixed"] = 2] = "Fixed";
    })(ex.DisplayMode || (ex.DisplayMode = {}));
    var DisplayMode = ex.DisplayMode;

    var AnimationNode = (function () {
        function AnimationNode(animation, x, y) {
            this.animation = animation;
            this.x = x;
            this.y = y;
        }
        return AnimationNode;
    })();
    var Timer = (function () {
        function Timer(fcn, interval, repeats) {
            this.id = 0;
            this.interval = 10;
            this.fcn = function () {
            };
            this.repeats = false;
            this.elapsedTime = 0;
            this.complete = false;
            this.scene = null;
            this.id = Timer.id++;
            this.interval = interval || this.interval;
            this.fcn = fcn || this.fcn;
            this.repeats = repeats || this.repeats;
        }
        Timer.prototype.update = function (delta) {
            this.elapsedTime += delta;
            if (this.elapsedTime > this.interval) {
                this.fcn.call(this);
                if (this.repeats) {
                    this.elapsedTime = 0;
                } else {
                    this.complete = true;
                }
            }
        };

        Timer.prototype.cancel = function () {
            if (this.scene) {
                this.scene.cancelTimer(this);
            }
        };
        Timer.id = 0;
        return Timer;
    })();
    ex.Timer = Timer;

    var Engine = (function (_super) {
        __extends(Engine, _super);
        function Engine(width, height, canvasElementId, displayMode) {
            _super.call(this);
            this.hasStarted = false;
            this.keys = [];
            this.keysDown = [];
            this.keysUp = [];
            this.clicks = [];
            this.mouseDown = [];
            this.mouseMove = [];
            this.mouseUp = [];
            this.touchStart = [];
            this.touchMove = [];
            this.touchEnd = [];
            this.touchCancel = [];
            this.sceneHash = {};
            this.animations = [];
            this.isFullscreen = false;
            this.displayMode = 0 /* FullScreen */;
            this.isDebug = false;
            this.debugColor = new Color(255, 255, 255);
            this.backgroundColor = new Color(0, 0, 100);
            this.isSmoothingEnabled = true;
            this.isLoading = false;
            this.progress = 0;
            this.total = 1;

            this.logger = ex.Logger.getInstance();

            this.logger.debug("Building engine...");

            this.canvasElementId = canvasElementId;

            this.eventDispatcher = new ex.EventDispatcher(this);

            this.rootScene = this.currentScene = new ex.Scene();
            this.addScene('root', this.rootScene);

            if (canvasElementId) {
                this.logger.debug("Using Canvas element specified: " + canvasElementId);
                this.canvas = document.getElementById(canvasElementId);
            } else {
                this.logger.debug("Using generated canvas element");
                this.canvas = document.createElement('canvas');
            }
            if (width && height) {
                if (displayMode == undefined) {
                    this.displayMode = 2 /* Fixed */;
                }
                this.logger.debug("Engine viewport is size " + width + " x " + height);
                this.width = this.canvas.width = width;
                this.height = this.canvas.height = height;
            } else if (!displayMode) {
                this.logger.debug("Engine viewport is fullscreen");
                this.displayMode = 0 /* FullScreen */;
            }

            this.loader = new ex.Loader();

            this.initialize();
        }
        Engine.prototype.addEventListener = function (eventName, handler) {
            this.eventDispatcher.subscribe(eventName, handler);
        };

        Engine.prototype.removeEventListener = function (eventName, handler) {
            this.eventDispatcher.unsubscribe(eventName, handler);
        };

        Engine.prototype.playAnimation = function (animation, x, y) {
            this.animations.push(new AnimationNode(animation, x, y));
        };

        Engine.prototype.addChild = function (actor) {
            this.currentScene.addChild(actor);
        };

        Engine.prototype.removeChild = function (actor) {
            this.currentScene.removeChild(actor);
        };

        Engine.prototype.addTimer = function (timer) {
            return this.currentScene.addTimer(timer);
        };

        Engine.prototype.removeTimer = function (timer) {
            return this.currentScene.removeTimer(timer);
        };

        Engine.prototype.addScene = function (name, scene) {
            if (this.sceneHash[name]) {
                this.logger.warn("Scene", name, "already exists overwriting");
            }
            this.sceneHash[name] = scene;
            scene.engine = this;
        };

        Engine.prototype.goToScene = function (name) {
            if (this.sceneHash[name]) {
                this.currentScene.onDeactivate.call(this.currentScene);
                this.currentScene = this.sceneHash[name];
                this.currentScene.onActivate.call(this.currentScene);
            } else {
                this.logger.error("Scene", name, "does not exist!");
            }
        };

        Engine.prototype.getWidth = function () {
            return this.width;
        };

        Engine.prototype.getHeight = function () {
            return this.height;
        };

        Engine.prototype.screenToWorldCoordinates = function (point) {
            var newX = Math.floor(point.x * this.canvas.width / this.canvas.clientWidth);
            var newY = Math.floor(point.y * this.canvas.height / this.canvas.clientHeight);

            if (this.camera) {
                var focus = this.camera.getFocus();
                newX -= focus.x;
                newY -= focus.y;
            }
            return new ex.Point(newX, newY);
        };

        Engine.prototype.setHeightByDisplayMode = function (parent) {
            if (this.displayMode === 1 /* Container */) {
                this.width = this.canvas.width = parent.clientWidth;
                this.height = this.canvas.height = parent.clientHeight;
            }

            if (this.displayMode === 0 /* FullScreen */) {
                document.body.style.margin = '0px';
                document.body.style.overflow = 'hidden';
                this.width = this.canvas.width = parent.innerWidth;
                this.height = this.canvas.height = parent.innerHeight;
            }
        };

        Engine.prototype.initialize = function () {
            var _this = this;
            if (this.displayMode === 0 /* FullScreen */ || this.displayMode === 1 /* Container */) {
                var parent = (this.displayMode === 1 /* Container */ ? (this.canvas.parentElement || document.body) : window);

                this.setHeightByDisplayMode(parent);

                window.addEventListener('resize', function (ev) {
                    _this.logger.debug("View port resized");
                    _this.setHeightByDisplayMode(parent);
                    _this.logger.info("parent.clientHeight " + parent.clientHeight);
                    _this.setAntialiasing(_this.isSmoothingEnabled);
                });
            }

            window.addEventListener('blur', function (ev) {
                _this.keys.length = 0;
            });

            window.addEventListener('keyup', function (ev) {
                var key = _this.keys.indexOf(ev.keyCode);
                _this.keys.splice(key, 1);
                _this.keysUp.push(ev.keyCode);
                var keyEvent = new ex.KeyUp(ev.keyCode);
                _this.eventDispatcher.publish(ex.EventType[1 /* KeyUp */], keyEvent);
                _this.currentScene.publish(ex.EventType[1 /* KeyUp */], keyEvent);
            });

            window.addEventListener('keydown', function (ev) {
                if (_this.keys.indexOf(ev.keyCode) === -1) {
                    _this.keys.push(ev.keyCode);
                    _this.keysDown.push(ev.keyCode);
                    var keyEvent = new ex.KeyDown(ev.keyCode);
                    _this.eventDispatcher.publish(ex.EventType[0 /* KeyDown */], keyEvent);
                    _this.currentScene.publish(ex.EventType[0 /* KeyDown */], keyEvent);
                }
            });

            window.addEventListener('blur', function () {
                _this.eventDispatcher.publish(ex.EventType[13 /* Blur */], new ex.BlurEvent());
                _this.eventDispatcher.update();
            });

            window.addEventListener('focus', function () {
                _this.eventDispatcher.publish(ex.EventType[14 /* Focus */], new ex.FocusEvent());
                _this.eventDispatcher.update();
            });

            this.canvas.addEventListener('mousedown', function (e) {
                var x = e.pageX - ex.Util.getPosition(_this.canvas).x;
                var y = e.pageY - ex.Util.getPosition(_this.canvas).y;
                var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                var mousedown = new ex.MouseDown(transformedPoint.x, transformedPoint.y, e);
                _this.mouseDown.push(mousedown);
                _this.clicks.push(mousedown);
                _this.eventDispatcher.publish(ex.EventType[3 /* MouseDown */], mousedown);
            });

            this.canvas.addEventListener('mousemove', function (e) {
                var x = e.pageX - ex.Util.getPosition(_this.canvas).x;
                var y = e.pageY - ex.Util.getPosition(_this.canvas).y;
                var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                var mousemove = new ex.MouseMove(transformedPoint.x, transformedPoint.y, e);
                _this.mouseMove.push(mousemove);
                _this.eventDispatcher.publish(ex.EventType[4 /* MouseMove */], mousemove);
            });

            this.canvas.addEventListener('mouseup', function (e) {
                var x = e.pageX - ex.Util.getPosition(_this.canvas).x;
                var y = e.pageY - ex.Util.getPosition(_this.canvas).y;
                var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                var mouseup = new ex.MouseUp(transformedPoint.x, transformedPoint.y, e);
                _this.mouseUp.push(mouseup);
                _this.eventDispatcher.publish(ex.EventType[5 /* MouseUp */], mouseup);
            });

            this.canvas.addEventListener('touchstart', function (e) {
                var te = e;
                te.preventDefault();
                var x = te.changedTouches[0].pageX - ex.Util.getPosition(_this.canvas).x;
                var y = te.changedTouches[0].pageY - ex.Util.getPosition(_this.canvas).y;
                var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                var touchstart = new ex.TouchStart(transformedPoint.x, transformedPoint.y);
                _this.touchStart.push(touchstart);
                _this.eventDispatcher.publish(ex.EventType[6 /* TouchStart */], touchstart);
            });

            this.canvas.addEventListener('touchmove', function (e) {
                var te = e;
                te.preventDefault();
                var x = te.changedTouches[0].pageX - ex.Util.getPosition(_this.canvas).x;
                var y = te.changedTouches[0].pageY - ex.Util.getPosition(_this.canvas).y;
                var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                var touchmove = new ex.TouchMove(transformedPoint.x, transformedPoint.y);
                _this.touchMove.push(touchmove);
                _this.eventDispatcher.publish(ex.EventType[7 /* TouchMove */], touchmove);
            });

            this.canvas.addEventListener('touchend', function (e) {
                var te = e;
                te.preventDefault();
                var x = te.changedTouches[0].pageX - ex.Util.getPosition(_this.canvas).x;
                var y = te.changedTouches[0].pageY - ex.Util.getPosition(_this.canvas).y;
                var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                var touchend = new ex.TouchEnd(transformedPoint.x, transformedPoint.y);
                _this.touchEnd.push(touchend);
                _this.eventDispatcher.publish(ex.EventType[8 /* TouchEnd */], touchend);
            });

            this.canvas.addEventListener('touchcancel', function (e) {
                var te = e;
                te.preventDefault();
                var x = te.changedTouches[0].pageX - ex.Util.getPosition(_this.canvas).x;
                var y = te.changedTouches[0].pageY - ex.Util.getPosition(_this.canvas).y;
                var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                var touchcancel = new ex.TouchCancel(transformedPoint.x, transformedPoint.y);
                _this.touchCancel.push(touchcancel);
                _this.eventDispatcher.publish(ex.EventType[9 /* TouchCancel */], touchcancel);
            });

            if (navigator.maxTouchPoints) {
                this.canvas.addEventListener('pointerdown', function (e) {
                    if (e.pointerType !== "touch")
                        return;

                    e.preventDefault();
                    var x = e.pageX - ex.Util.getPosition(_this.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this.canvas).y;
                    var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                    var touchstart = new ex.TouchStart(transformedPoint.x, transformedPoint.y);
                    _this.touchStart.push(touchstart);
                    _this.eventDispatcher.publish(ex.EventType[6 /* TouchStart */], touchstart);
                });

                this.canvas.addEventListener('pointermove', function (e) {
                    if (e.pointerType !== "touch")
                        return;

                    e.preventDefault();
                    var x = e.pageX - ex.Util.getPosition(_this.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this.canvas).y;
                    var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                    var touchmove = new ex.TouchMove(transformedPoint.x, transformedPoint.y);
                    _this.touchMove.push(touchmove);
                    _this.eventDispatcher.publish(ex.EventType[7 /* TouchMove */], touchmove);
                });

                this.canvas.addEventListener('pointerup', function (e) {
                    if (e.pointerType !== "touch")
                        return;

                    e.preventDefault();
                    var x = e.pageX - ex.Util.getPosition(_this.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this.canvas).y;
                    var transformedPoint = _this.screenToWorldCoordinates(new ex.Point(x, y));
                    var touchend = new ex.TouchEnd(transformedPoint.x, transformedPoint.y);
                    _this.touchEnd.push(touchend);
                    _this.eventDispatcher.publish(ex.EventType[8 /* TouchEnd */], touchend);
                });
            }

            this.ctx = this.canvas.getContext('2d');
            if (!this.canvasElementId) {
                document.body.appendChild(this.canvas);
            }
        };

        Engine.prototype.setAntialiasing = function (isSmooth) {
            this.isSmoothingEnabled = isSmooth;
            this.ctx.imageSmoothingEnabled = isSmooth;
            this.ctx.webkitImageSmoothingEnabled = isSmooth;
            this.ctx.mozImageSmoothingEnabled = isSmooth;
            this.ctx.msImageSmoothingEnabled = isSmooth;
        };

        Engine.prototype.getAntialiasing = function () {
            return this.ctx.imageSmoothingEnabled || this.ctx.webkitImageSmoothingEnabled || this.ctx.mozImageSmoothingEnabled || this.ctx.msImageSmoothingEnabled;
        };

        Engine.prototype.isKeyDown = function (key) {
            return this.keysDown.indexOf(key) > -1;
        };

        Engine.prototype.isKeyPressed = function (key) {
            return this.keys.indexOf(key) > -1;
        };

        Engine.prototype.isKeyUp = function (key) {
            return this.keysUp.indexOf(key) > -1;
        };

        Engine.prototype.update = function (delta) {
            if (this.isLoading) {
                return;
            }

            this.eventDispatcher.update();
            this.currentScene.update(this, delta);

            var eventDispatcher = this.eventDispatcher;
            this.keys.forEach(function (key) {
                eventDispatcher.publish(InputKey[key], new ex.KeyEvent(key));
            });

            this.animations = this.animations.filter(function (a) {
                return !a.animation.isDone();
            });

            this.keysDown.length = 0;
            this.keysUp.length = 0;

            this.clicks.length = 0;

            this.mouseDown.length = 0;
            this.mouseMove.length = 0;
            this.mouseUp.length = 0;

            this.touchStart.length = 0;
            this.touchMove.length = 0;
            this.touchEnd.length = 0;
            this.touchCancel.length = 0;

            this.eventDispatcher.publish(ex.EventType[15 /* Update */], new ex.UpdateEvent(delta));
        };

        Engine.prototype.draw = function (delta) {
            var ctx = this.ctx;

            if (this.isLoading) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, this.width, this.height);
                this.drawLoadingBar(ctx, this.progress, this.total);

                return;
            }

            ctx.clearRect(0, 0, this.width, this.height);
            ctx.fillStyle = this.backgroundColor.toString();
            ctx.fillRect(0, 0, this.width, this.height);

            if (this.isDebug) {
                this.ctx.font = "Consolas";
                this.ctx.fillStyle = this.debugColor.toString();
                for (var j = 0; j < this.keys.length; j++) {
                    this.ctx.fillText(this.keys[j].toString() + " : " + (InputKey[this.keys[j]] ? InputKey[this.keys[j]] : "Not Mapped"), 100, 10 * j + 10);
                }

                var fps = 1.0 / (delta / 1000);
                this.ctx.fillText("FPS:" + fps.toFixed(2).toString(), 10, 10);
            }

            this.ctx.save();

            if (this.camera) {
                this.camera.update(delta);
            }

            this.currentScene.draw(this.ctx, delta);

            this.animations.forEach(function (a) {
                a.animation.draw(ctx, a.x, a.y);
            });

            if (this.isDebug) {
                this.ctx.strokeStyle = 'yellow';
                this.currentScene.debugDraw(this.ctx);
            }

            this.ctx.restore();
        };

        Engine.prototype.start = function (loader) {
            var loadingComplete;
            if (loader) {
                loadingComplete = this.load(loader);
            }

            if (!this.hasStarted) {
                this.hasStarted = true;
                this.logger.debug("Starting game...");

                var lastTime = Date.now();
                var game = this;
                (function mainloop() {
                    if (!game.hasStarted) {
                        return;
                    }

                    window.requestAnimationFrame(mainloop);

                    var now = Date.now();
                    var elapsed = Math.floor(now - lastTime) || 1;

                    if (elapsed > 200) {
                        elapsed = 1;
                    }
                    game.update(elapsed);
                    game.draw(elapsed);

                    lastTime = now;
                })();
                this.logger.debug("Game started");
            } else {
            }
            return loadingComplete;
        };

        Engine.prototype.stop = function () {
            if (this.hasStarted) {
                this.hasStarted = false;
                this.logger.debug("Game stopped");
            }
        };

        Engine.prototype.drawLoadingBar = function (ctx, loaded, total) {
            if (this.loadingDraw) {
                this.loadingDraw(ctx, loaded, total);
                return;
            }

            var y = this.canvas.height / 2;
            var width = this.canvas.width / 3;
            var x = width;

            var image = new Image();

            image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAEsCAYAAAA7Ldc6AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjenhJ3MAAA6Y0lEQVR4Xu3dUagkWZ3ncUEEQYSiRXBdmi2KdRUZxgJZhmV9qOdmkWJYlmYYhkKWcWcfpEDQFx9K2O4Fm6UaVhoahi4GF2wWh1pnYawHoXzxpVu6Gimatqni0kpTiGLhgy++3Pn9Mk6kkXlPZp4TGSfiROT3A39aq25EnMi6GfH/ZcSJ/BAAAAAAAAAAAAAAYAw/+9nPLqluqO6rroc/BgAAAIDhhNBxV3Ue6mn4KwAAAAA4nkLGddUdh40QOrp1J/wYAAAAAPSjYHHV4UIVCx3duhoWAQAAAIB0DhOq26qzEC4O1VlYFAAAAAAOU4i4rLrpMBFCxYV66623zt99993z999///ydd97p/t3tsBoAAAAAiFNwaEPHgxAkotWGjt/85jer+vWvf739M9x+BQAAAOAihYX2sbndJ1hdKF/hODs7W4WNNni09fjx4+7PPgirBgAAAICGgsLB0PHzn/98Z+joln+us9zNsAkAAAAAp0zhYN9jc1flMOErGk+ePImGje3yz22t43LYHAAAAIBTo0Bw8LG5b7/99vl7772XHDq6xe1XAAAAwIlTEDj42Nw2dHzwwQfRYJFaXk9nvTfCEAAAAAAsmZr/rMfmxsJEbjm8bG3jUhgOAAAAgKVRw9/rsblDla+gdLZzNwwLAAAAwFKo0T/6sblDFbdfAQAAAAvlBl81yGNzh6hf/epX3W17gju3XwEAAABzpqZ+8MfmDlW+raszjjthyAAAAADmRM180cfmDlWe0N4Z0/UwfAAAAAC1UwM/2mNzhyhPaO+M7WnYDQAAAAC1UwPvuR3dhn5dQz82d6ji9isAAABghtS8R8NHjaGjLU9w3xrv1bA7AAAAAGqlxn0jfPhqx1hPsDqmPMbOuM/C7gAAAAColRr3C+GjhrkdKeXvF+mM/XbYJQAAAAA1UtM+2/DB7VcAAADAjKhhn234cPn7RjrjfxB2CwAAAEBt1LDPOny4/KWHnX24GXYNAAAAQE3UrM8+fPhLD7v7oLocdg8AAABALdSozz58uB49etQNH9x+BQAAANRGjfpG+PAtTHMMHy5/E3tnX26EXQQAAABQAzfpnYZ9FT5q/46PXeXQ1N0X1aWwmwAAAACmpgZ9MeHD9d5773XDx92wmwAAAACmpgZ9UeHDxe1XAAAAQIXcnHca9UWEj/fff78bPp6quP0KAAAAmJoa88WFD9e7777bDSB3wu4CAAAAmIoa80WGD5cfG9zZt+thlwEAAABMQU35YsPH9u1XYZcBAAAATEFN+WLDh+udd97pBpDbYbcBAAAAjE0N+aLDh/elu3+qq2HXAQAAAIxJzfiiw4fr7OysGz7Owq4DAAAAGJOa8cWHDxe3XwEAAAATUyN+EuHjyZMn3fDhuhxeAgAAAABjUBN+EuHD9fjx4274eBBeAgAAAABjUBN+MuHD5f3r7O/N8DIAAAAAKE0N+EmFD26/AgAAACai5vukwofr0aNH3fBxP7wUAAAAAEpS831y4cP19ttvdwPIjfByAAAAACjFjXenCT+Z8PHBBx90w4frUnhJAAAAAJSgpvskw4frvffe64aPu+ElAQAAAFCCmu6TDR8ubr8CAAAARuKGu9N8n1z4eP/997vh42l4WQAAAAAMTQ33SYcP17vvvtsNIHfCSwMAAABgSGq2Tz58uN56661uALkeXh4AAAAAQ1GjTfhQPX78uBs+uP0KAAAAGJoabcKH6uzsrBs+XLfDSwQAAABgCGqyCR+qSPh4oOK7PwAAAIChqMEmfKgIHwAAAEBharAJHyrCBwAAAFCYGmzCh4rwAQAAABSmBpvwoSJ8AAAAAIWpwSZ8qAgfAAAAQGFqsAkfKsIHAAAAUJgabMKHivABAAAAFKYGm/ChInwAAAAAhanBvt1puAkffyrCBwAAADAkNdh3Og034eNPRfgAAAAAhqQGm/ChInwAAAAAhanBJnyoCB8AAABAYWqwCR8qwgcAAABQmBpswoeK8AEAAAAUpgab8KEifAAAAACFqcEmfKgIHwAAAEBharAJHyrCBwAAAFCYGmzCh4rwAQAAABSmBpvwoSJ8AAAAAIWpwSZ8qAgfAAAAQGFqsAkfKsIHAAAAUJgabMKHivABAAAAFKYGm/ChInwAAAAAhanBJnyoCB8AAABAYWqwCR8qwgcAAABQmBpswoeK8AEAAAAUpgab8KEifAAAAACFqcEmfKgIHwAAAEBharAJHyrCBwAAAFCYGmzCh4rwAQAAABSmBpvwoSJ8AAAAAIWpwSZ8qB49etQNHi7CBwAAADAkNdiED9W7777bDR4uwgcAAAAwJDXYhA8V4QMAAAAoTA024UNF+AAAAAAKU4NN+FARPgAAAIDC1GATPlSEDwAAAKAwNdiEDxXhAwAAAChMDTbhQ0X4AAAAAApTg034UBE+AAAAgMLUYBM+VIQPAAAAoDA12IQPFeEDAAAAKEwNNuFDRfgAAAAAClODTfhQET4AAACAwtRgEz5UhA8AAACgMDXYhA8V4QMAAAAoTA024UNF+AAAAAAKU4NN+FARPgAAAIDC1GATPlSEDwAAAKAwNdiEDxXhAwAAAChMDTbhQ0X4AAAAAApTg034UBE+AAAAgMLUYBM+VIQPAAAAoDA12IQPFeEDAAAAKEwNNuFDRfgAMHfn5+ffUCULixWh1b/QbCXJm2GxIrT+e81mktwLiwEASlCDTfhQET4ALIGa5yoCiFb9pWYLWV4Iiw9O6yaAAEAN1GBvhI+HDx8SPpoaLXz4RNec7xbhG2G3AEzE78Pm7ZgmLDY4rfrNZgvZroRVDErrJYAAwNTUYG+EDzfhseZ86TX1lQ+f6Jrz3SIQQICJ+X3YvB3ThMUGpdVeadbey1fDagal9RJAAGBKarAJH6oabrvyia453y0CAQSYmN+HzdsxTVhsUFptn9uvWq+E1QxK6yWAAMBU1GATPlQ1hA/zia453y0CAQSYmN+HzdsxTVhsUFrtMQGkSPPv9TarT0IAAYChqMEmfKhqCR/mE11zvlsEAggwMb8Pm7djmrDYoLRaroAAAAgfbdUUPswnuuZ8twgEEGBifh82b8c0YbFBabXMAQGAU6cGm/Chqi18mE90zfluEQggwMT8PmzejmnCYoPTqh81W8jGU7AAYO7UYBM+VDWGD/OJrjnfLQIBBJiY34fN2zFNWGxwWvVzzRayFDuGaN0EEAAYgxpswoeq1vBhPtE157tFIIAAE/P7sHk7pgmLFaHVv9JsJQnfhA4Ac6cGm/Chqjl8mE90zfluEQggwMT8PmzejmnCYsVoEynjcVD5RFikCK2fAAIAJanBJnyoag8f5hNdc75bBAIIMDG/D5u3Y5qwWFHajCelv6Dqfju654g4eHwp/FhR2g4BBABKUYNN+FDNIXyYT3TN+S5NWAwAonSYqC6A1EC7SgABgBLUYBM+VHMJH+YTXXO+SxMWA4AoHSYIIBHaVQIIAAxNDTbhQzWn8GE+0TXnuzRhMQCI0mGCABKhXSWAAMCQ1GATPlRzCx/mE11zvksTFgOAKB0mCCAR2lUCCAAMRQ024UM1x/BhPtE157s0YTEAiNJhggASoV0lgADAENRgEz5Ucw0f5hNdc75LExYDgCgdJgggEdpVAggAHEsNNuFDNefwYT7RNee7NGExAIjSYYIAEqFdJYAAwDHUYBM+VHMPH+YTXXO+SxMWA4AoHSYIIBHaVQIIAPSlBpvwoVpC+DCf6JrzXZqwGABE6TBBAInQrhJAAKAPNdiED9VSwof5RNec79KExQAgSocJAkiEdpUAAgC51GATPlRLCh/mE11zvksTFgOAKB0mCCAR2lUCCADkUINN+FBFwsd91WzDh/lE15zv0oTFACBKhwkCSIR2lQACAKnUYBM+VJHwcSe8RLPmE11zvksTFgOAKB0mCCAR2lUCCIDy/unvPnRZdS2hbiXUHdX9Tt0ImynKTXa36SZ8LCt8mE90zfkuTVgMAKJ0mCCARGhXCSAALlJT7zCw3ejvqvOJ61YYdjFusrtNN+FjeeHDfKJrzndpwmIAEKXDBAEkQruac6wlgACnwk39VpNfc90Nwy7CTXa36SZ8LDN8mE90zfkuTVgMAKJ0mCCARGhXc461BBDgVKipHzSA/OhrHz7/6bc+drAevvTM+S9e/uTeevzdT62qs/77YdiDc5PdbboJH8sNH+YTXXO+SxMWAwajX6svqZ5XuXH176PrkWoX/137c17Gy34hrK56Gqv396th7O1+vKna5Xeq2exvGGOysNjiaVf975dqkACi9XxB5d+XF7zOULvM5ncM86LfpSsqH/NeV8WOde0x7hWVf+5KWPQ0qKlfB5AHL146/+33Lu+sP/7ws+fn//z5UesPP/jMamxthWEPyk12t+kmfCw7fFh40ycLiwG96dfITVHbfA/N66zmBKZxfEL1nMon1n0how+ftL3e58LmqqDxEEAitKs5v++9A4iWdcD178W+EJ/K66judwzzoN8b/y72Oc6f1hVANfXrAOKrDrEQMHW14wt1OQx9EG6yu0034WP54cP8Rm/e72nCYrOnXfEnMm7gcj0fVjEpjcONbe74Jzuoa9t+vf0p7BBNUSo3/P4k9xNhGKPw9sJ2/WnfWPy6uvEfdV9jwjiShcWK0Opzjm9F3x9ef7OZJNlj0TL+nSv5/vK6He5r+B2b9XlLQ8p6j8iXwqKD07oH/73Uz/lDpqx/oy0EkNrKt2y1Y1RdD0M/mpvsbtNN+DiN8GF+ozfv9zRhsUXQ7vhkmutRWHxSGoeb+RwOK6NfFdA2/QnYmI14jPf9G2FIxWgbDln+tLhPsB2Ktz1pSNb2CSARXn+zmSTJY9HPlg4e22r4HZv1eUtDWmwA0c/0Oa9uO7kA4idgnbs83yIWAKYu3xrWjlE1yJOw3GR3m27Cx+mED/MbvXm/pwmLLYZ2KWv/g+LN7D7avj9dyvXVsPgotD03431e22LC0AanVfe9zaAkj2eST6q1XQJIhNffbCZJSqM39XvMVxgnmSei7Wbtd1isGhrSIgOI/t4fwAzh5ALI+vG6nucRCwBT1y9f/fRqfKGOnojuJrvbdBM+Tit8mN/ozfs9TVhsMbRLfZp5fwI42W0I2nbWv5mMdjDXtnz7Ue7VmVGEIQ5Gq2yveNTKv6ejN4jaJgEkwutvNpPkUKPneUVTXmlrTXI1RNuc9XlLQ1pcANHfDXksJIDUVr9//cpqfKGehqH34ia723QTPk4vfJjf6M37PU1YbFG0W7knA3slLD4qbde3W+RwgzDKrVfajsPcmLeCZAnDHIRW1+d3ZgqjhxBtjwAS4fU3m0myr9HLPQaMYdSrwtrerM9bGtKiAoj+fOgPYgggNZYf79uOU3U1DD+Lm+xu0034OM3wYX6jN+/3NGGxxdGu9XlC0diNXZ+J56PceqXt1NgUbQhDPZpW5Vuu5mS0EGraFgEkwutvNpNkrEZvSKN9KKNtzfq8pSEtJoDoz4aY87GNAFJjvfHtj6/GGOpmGH4SNdiXVPc7DTfh4091cuHD/EZv3u9pwmKLo13r01SOepDU9nJvbRplfNpOzU3RWhju0bSquQUQezMMvzhtiwAS4fU3m0kSa/Rym9YpvBCGW5S2M+vzloa0iACi/9/nFuYUo55bJ6dmfhYBpO8XEqrBdvh40Gm4CR9/qpMMH+Y3evN+TxMWWyTtXp+5C6M8H1/byT3Qj/Kpt7Yxi/BhYchH06rmGEBslNtkvJ1mc2nCYkVo9TnHt2oDiP5/9VcYO4rPCdE2Zn3e0pCWEkCG/m6jFgGkxtr+QkLVpbALO6nBJnyEInxs8hu9eb+nCYstknbPtzjlzmEY5bG82k7Wv5MUv/VK2xgyfDgw+XG9PjG7wY+ecPXnDmL+e1/29/aT/73CKo6mVR0bQDzmdl89mdjru/BQA/9Z+Dvvq38+9/a7mDFCKQEkwutvNpNkPRb97z6fMvt3zB+oOLj4d+jCv7v/LPxd+14a4verVfT2VK1/1uctDWn2AUT/u8StVy0CSK31469/ZDXOUDfCLkSpwSZ8hCJ8XOQ3evN+TxMWWyztohvCXEWbfa0/d0zFD97axlDhw+s56iqSlncj5ZPh3jASfvxoWlWfAOIA4WawdwDQsu0XHOaG5K7i9+lrGwSQCK+/2UyS1Vj035wPRRwg/Nof8zvmY80Q39vjMRd7UqDWPevzloY06wCi/+bMR/Tvk4/PF/ZBf9Z+yOLjWvcDJQJIrfXwpWdW4wx1N+zCBWqwCR+hCB9xfqM37/c0YbFF027mnoB9IC5ysvV6VTkNp8dS9FNurT/35BnjdQz+mmmdPplFf6fDjxxNq0oNIP5384l30P30+lTHBMCqfj/CYkVo9TnHtxoDSMqxaBU8VhsZiNbnqy5Z54aIYvNBtO5Zn7c0pLkHkJTx+xiVfazRMg7Bo8wlqkanoV/d5hRr/GuprcfxuqK3YanJvtttugkfhI9teqPfUyULiy2adjPn051WkQOm1pt7oqrtasw2N1RFG2DTNi4EkfBXR9OqDgUQ3xc9xn3wfecFFD25a/0EkAivv9lMEv9synvN76eSVxqOvc2myK1YWu+sz1sa0twDyL4Pxfx3o3//0Kx1G/pY019bpdyGpUb7Vrfx/vWvfx1t0JdchI/9dKC4tzpkJAqLLZ52tU9zN2hj7fU1q01WuoHqE8xaXm6KLyzzv+NqzOGPjqZV7QogPvGOuo/aXm4jY78Lixeh9RNAIrz+ZjNJHGIPXfkc6xHbvhrS931f5DX1epvVpwmLVUNDmm0AUe0Lxv77YoF4sTrNfLThr622bsOKPg1LzbZvwXraNt+PHj2KNulLLcLHYeGAkSwsdhK0u1mvjQx6svX6mtUmcYNQ+taa3Nej5bFN9omYtu3gNNi/jdYVCyBuKCY58Wq7ff5dSjY0BJAIr7/ZzCDGDrrHhJDBf9e0zqzXMixWDQ1pzgFk122Br4dVIlenmY82/LVV5GlYl8OubFDTvb4K8tZbb53MVRDCRxodNO41x440YbGToN31FYjck+4gJwqtJ/dWp1pvvfInucVvuRqT9qcbQCa/3cDbX40kT7FH8nrdzSbShMWK0Opzjm9zCSCjX0k0bbfP75kN/rp6nc2q04TFqqEhzTWA7Loq5+M8Vz766jbzsYa/xvrptz62HrPqdtiVDWq8T+4qCOEjnQ4a91aHj/kq+t0GXn+zmWRHP5ZX68ideF66cep761XxqzJT0D61AaTo/fc5NI7cSenFfme0bgJIhNffbOYok4SPlrbfd07I0LenZr2WYbFqaEhzDSAxizzOj6rTyEeb/Rrrl69+ej1m1VPVrsnoG3NBnjx5Em3cl1CEjzw6cNxbHULmq/iXq2kbuV+2dFSToOVzTk7FD/5af+7J0jyuRU5E1H45gIxy/30qjSf7ClVYdHBaNQEkwutvNtNb8Ucop9A4+uzHoA8+0PqyxhAWq4aGtKQAMsqX8S5ap5GPNvu11tZk9Jthdy5QI37WNuXvvPNOtHmfexE+8ungca85hszWGAEk99YDN9+9PhnXcrkTz0vfetX36gcnpZHpNc/9dyr1hCICSITX32ymF18RreVqW59bUwd98IHWl/VahsWqoSEtJYAUfc+cjE4TH230a61fvPzJ9bhVZ2F3LlAzfr3bnP/qV7+KNvFzLcJHPz6ANMeR2SoeQMzbaTaXrNe4tFzOv0fxg7+2kbvfdlrPcK+EXvfc27CKNDVaLwEkwutvNtNLsQa0D42nz3FhsA8ltK6s1zIsVg0NaSkBhFuvjqXG/VKniY82+rXWH3/42fMffe3D67Grdn4zupry+22D/vbbby9mQjrhoz8dQO41x5HZGiuA5M7LsKyDs34+5zYafwJZ/OCvbeTuczWf1J4ave659+cXee94vc3q04TFitDqc45vtQaQ6j5l1ph8PMw12AcTWlfWaxkWq4aGtIQAUsUtgbOnpv1a28B7Ynes0a+5Mq6CXFatJ6S/99570YZ+TkX4OI4OIn0PPrUYJYCYtrXr+x92SX4soX42N+AUn4OgbfR58tWkk2RPmV773N9PAsimWgNIVVc/WhpX7hW3ox/Q0dK6sl7LsFg1NKQlBBC+bHAIatpnHUAiV0FuhV27QA36xoT0Od+KRfg4ng4ifQ8+tRgtgJi2V+Q2F/1czglplE9EtZ1dz3vfZbAGA/n0+ud+Kl3Ft/eHxYrQ6nOObzUGkOqufrQ0tj6P5R3kqq3Wk/VahsWqoSHNPYC8GRbHsdSwzzqAuLaugux8IpapUX/QNu1z/W4QwscwdCDpc/CpydgBJHdS9sEDtX4mZ1LnWLde9bnFgqsfEwv/DqmKNLdaLwEkwutvNpOl6veUxpd7i+Yg80C0nqzXMixWDQ1p7gGkqqcAzpqa9dkHkMhVkOj3gpia9auq9a1Yc3sqFuFjODqQ9Dn41GTUAGLaZu6tSXubCP19zpWGUQ782s7zzeaScfWjAvp3yAnHBJBNNQaQqudTaXy5V4QHOV5rPVmvZVisGhrS3AMIt18NRc367AOI6/F3P7Xah05dDbt4gZr2m90mfi5fUEj4GJYOJPea48lsjR5ATNvNCQ07J2brz3Pu2x/tdgxtK7ex4MlXFdC/Q877mQCyqbYAMtr7vS+NMfeDikH2yetpVpcmLFYNDWnOAYQPm4akRn0RAcT1k29+dLUfoe6HXYxS836328zXPh+E8DE8HUxyDz61mSqA5D4LPzpO/XnqLQyj3HrV0rZyb63gE7EK6N8h5/1MANlUWwCZ5NiWQ2PM/d6iQZpXrSfrtQyLVUNDmnMASX64ChKoUV9MAPnt9y6v9qNT+76c8JJqYz7IBx98EG3+py7CRxk6mNxrjilpwmIQvRw5jz11gNi4CqL/n3MSGu2eW21rkqYC6fSa+8qZbwX075CvVvl9nBOIjQCyqbYAUqzpHFIYa7Kw2FG0mlmftzSkOQeQ6oPxrKhJX0wAcT148dJqX0J5QvrlsKsXqJHfmA/y85//vKpJ6R6L56i04wtF+BiIDiZZB5+wGAK9JDmv3/q56frfOVdQijZG27S93DkuPA++AL2uQ4SMfQggm2oLILP4Ph2NM3e/jr6Sq3VkbTMsVg0Nac4BZBbBeDbUoN9oG/Y3vv3xaFM/p4pMSD90K9bGt6TXEkI8Bo+lOzYV4WNAOphkHXzCYgj0kuQ+inJ18tV/U+eQjHrrlWl7uSdHnn7Vk1670iFjHwLIpqoCSFisehpq7uO6j25gtY5Zv5Ya0pwDyKjno8VTg36rbdb9ONtYUz+3evLas6v96dTO7wYxNfY3uo3+w4cPo6FgrCJ8jEMHk3vNMSVNWAwdellyTiZuMnMmno/+uENtM7ehYP7HAX6NVL5l7wWV33NjhYx9CCCbagogs/meBY119GZa65j1eUtDmm0ACYthKG7O20Z9KQHE9fClZ1b71KlrYZej3OB3G37Pu4iFg9JF+BiPjif3msNKmrAYtuilebN5hZKkNp+TNCHaLr8TR9LL4u9R8ROCHOZqCBsxBJBNNQWQomMZksZKAMmkIRFA0FBjvsgA4luxtp6KtfcLCs2NfrfxHzuEED7GpeMJB58B6KXJuaqRapIrC2HbqZiA3qHXw7dT5V5BmgoBZBMBpAeNNbeZPnoSs9Yx6/OWhjTXADKb38vZUFO+yADi+v3rV7bngzwIu72TG/5uAHAIGWNOCOFjfD6gNMeVNGExROjl8e01Q5nsSSNh+6k4IYleB1/tyH108dQIIJsIID1orASQTBoSAQQNNeWLDSCuX7766dW+depgU+/GvxsEHAxKhhDCxzR8QGmOK2nCYojQy+PbboZoQie7/1vb9j7kOOkTkvbfV77mFjxaBJBNBJAeNFYCSCYNiQCChhryRQcQV2Q+yN5J6eYA0A0EpUII4WM6PqA0x5U0YTHsoJco9xG2MZNN6ta2c28lO8lvQNd+O6gNecVrCgSQTQSQHjRWAkgmDYkAgoab8bYxX2oAcfkRw+1+hroRXoKdHAS6wWDoLyskfEzLB5TmuJImLIY99DIdMwdgsluvTNvPDSCTjncK2meHj5yHDpTg961/z9zI+PYv/7t5XDnvZwLIJgJIDxorASSThkQAQUON+DqA+IsI/W3if/jBZ6JN/JwrMindlRJCbnUDgkPI2dlZNFDkFOFjej6gNMeVNGEx7KGXKfc2pq5Jv3xM2yeA7KH99eN0x3iqlbfh96Yf27wRMsJQovT3Oe9nAsgmAkgPGisBJJOGRABBQ0343a2mfF0OJL59yd+r4QY+1tjPqbwPP/76R7b3MyWEbHxPiOuYJ2QRPurgA0pzXEkTFsMeepn8fQ99TXpLk7ZPANlB++pgOXT48JWUNmT49r2jGg0tn/N+JoBsIoD0oLGO3kxrHbM+b2lIBBA01IDf32rId5avILSBJNbgz6EiT8ZypYSQq6qnncCwChG5t2QRPurhA0pzXEkTFsMOeolyvxk9ptjJ5hBvuxlCslMKIEPcduV1uPko8m+s9ea8nwkgmwggPWisBJBMGhIBBA0131dV11W+FeuOKjmQeF6FnzI1t6sjR4SQS6oHneCwuiXr8ePH0bCxXYSPuviA0hxX0oTFsINeoiGaVD9VaZJbsbTd3AByEick7ecxE8797+mG40pYXTHaRs77mQCyiQDSg8aaO+eNAEIAwSFqyB1Mbqhuqx6ozvfVgxcvzerKSN8QYgoNt7dCxPnDhw/Pnzx5Eg0eLsJHfXxAaY4racJiiNDLk3tS2WeSW7G0XQLIFu1j36tavl3r+bCaUWh7Oe9nAsgmAkgPHmsz5GRHB3GtY9bnLQ2JAII8as4vqXylxFdJzlTnsfIcCz9Naw5XRXaEkKRQoPBwTXXWCROrevTo0SpsED7q5wNKc1xJExbDFr00uY17imInnV20zdwJ9KcQQLLeI4E/FR79Kpa2mTNWAsgmAkgPGmvW9+CExY6i1cz6vKUhEUBwHDXqvkLiqyPRMOLG3ldFan+i1o6nY/k2tEthV3dSiPAtWRuP6nW9/fbb5++//z7ho3I+oDTHlTRhMXToZXHTXuLL6Ca5FavZdLqw2CJp9/pc/XglLD46bTvn/UwA2UQA6SGMN9XvwmJH0Xpmfd7SkAggGI6a9WsqXxk5j1XtQWRHCPFtZ1fDLu6lQBG9GuLbsggf9fIBpTmupAmLoUMvi59ilMonnpywMvqtWNpm7pOeJn10cEnat5x/W5v0BO3tN8NIQgDZRADJpHFOcsum1pM1JyssVg0NiQCC4alh921aN1XRqyK1BxGPb2vMT1Wp80J8NcTfGbLxpKytInxUxAeU5riSJiyGQC9JzjefvxmW8Xc65Bj1VixtL+t3Qka/VWws2rfcMFZ8ovk+2n7OeAkgmwggmTTO3EeOD/KBitZTze9YHxoSAQRluXFXXZi87luzap4j8vi7n9oYbyh/V8rBW7JMIeOyg0YndBA+KuUDSnNcSRMWg+jlyP1eiC+ERb1sztOyRr0VS9vK/dR/kY/i1X7lfro72a1XrTCOVASQTTUFkEdhsappnLnHiq+GRY+i9cw9gOQ+VY8Agn7UuPv2rAtXRDxZvdanZvnb4COT070P18JuHaTA4e8NuU/4qJcPKM1xJU1YDKKXI+fxkxuf/On/5za3o92KpW3lfjq3yJOS9iv3dXguLDoJbf9KM4xkBJBNNQWQWRxrNczcuW/rD2GOofXkvjerukqr8WT9LggBBMdR8+4rIheCiL9LpMarIR6Tvwl+e7wqz3VJuhpiDiLhf6IyPqA0x5U0YbGTp5ci59YDXyW5cAVDf5b76eEoJ1Fvp9lclsXNA9E+Zb03ZNLXQNuf5H78bVovASTC6282k2yQZr0Uj68ZZrqw6NG0qrkHkNxbOwkgGIaad3/hoedWnLflqw21Xg3xLVmRqyHJc0NQLx9QmuNKmrDYSdPL4E+ac04g0e+C0J/nrme0W7GazWUZ9fsuxqB9yvl0d/JbZjSG3KaMALKptgAyyO1KpWh8ubcRDfb6al25v+vV3CaqseReqTQCCIaj5v2y6sI3rtd6NcQT53dcDfEcl+TbslAXH1Ca40qasNhJ08uQM39j7wFbfz/JJM5DtJ2s3wtZ3Ikp7FeqyfffY2iGkqzImLVeAkiE199sJtnrYdEqaXy5t18NFqi0rtnNz2ppLLkPITECCNL8q+f+x+XwPw9S8+4vNty4GuK5If6CwFgQmLp2XA1xOUwRRGbGB5TmuJImLHay9BLkfvJ28KlI+pmcQGPFbyfQNnKDkVV9y0gO7cusvpBR288drxFANtUWQKzKWxs1rj63aQ52fNC6cre/egJhDTSWnLmDLQIIDlP4uKU6D/9Nmiehxt2P7r1wNeSXr346GgKmLl+hiTyuty2CyIz4gNIcV9KExU6Sdj/3nueky/76udyTafFbsbT+PrcJVPMp47G0L1XMp0il7fcJjASQTTUGkCpvbdS4cpvoQW9R1Pr6BO7Jw5zH0AwlGwEE+ylwXA/ho62nqpvhrw9S4+7vD3ETvy43+rEQUEP5Ks2O27JcDiLXw66hUj6gNMeVNGGxk6Nd94mj2KNz9bO5E9KL34qlbeRembFFXAXRfswtgOTeDmMEkE01BpDqHserMfX5cGLwORhaZ+5E7snDnMaQewW9RQDBbgoaV0Pg6AaQth6okp4Epab9qmrjSVlu8mv9zhCXH9m7J4h4XzzpPvm2NIzHB5TmuJImLHZytOtFn9uun3fAqebJKKb197lXeREnKO3HbAKItt3n38kIIJtqDCBW1VUQjafPfgz+BZ1aZ+44Jp1To+33Oca3CCCIU7i4FELGKnD86//0P1fV/v9O3VYdvC1Lzbpvydr4AsOffPOjVYcQ14Eg4vJVET+KOPkRvijLB5TmuJImLHZStNu5zWivE52Wy72NpuitWF63qs8Js+qn96TQPuTebjfJJ9Xarv+N+lz9MALIploDiN+DVcwF0TieW40oT6nfs9wPhWzwIJRK2+579cMIIIhTqLjbCRnnX/zK98//w3/7f+efe/7VbvhoK+dqiL9vw437qjz5u9bJ6d3yE7N869iOyeptOYz4ljOujEzIB5TmuJImLHYytMu5Tbh/tvdJTsvm3vZU9FYsrb/vSXP2t2KF/cgxenOjbfZpwloEkE21BhCb/IlYGkPfDySKNM9ab58wNMnjeLVd37bW57VrEUBwkcJEO+l8VX/216+d/8f//v/X5TDyb67/r24AaetWWMVeoUl3w76quYQQl6/YeCK9r9509yFSvk3LYctXR/jSwhH5gNIcV9KExU6Gdjl3suVRn/5r+dyrLVby5NS36fAysw4hzW5kGbW50fb6/K50EUA21RxAbNJbsbT9Pk9vKvaaat0+NuU66gOivrTNPvPpuggg2KQQsTHp/N/9l1c2wke3Pv9Xf98NH23dV6XckuXG3I36quYUQtryVZGHLz2zesRwd1/2lK+Q3FZ5/sg1FcGkAB9QmuNKmrDYSdDu5n7CNsijHrWe3E+1S9+K1fcqiMc12S0Px9LYs94b4uZmlFtltB3fInbMJ6pGANlUewCx58LqRqXt5j4ko1WscTatv09jP+rVJG2v72vXRQDBnyg4bEw691UO33YVCx9t/fv/+n/Pn/3yd7ZDyJnqYHOtBnz2IaQthxF/n8iB+SLRCi8HBuIDSnNcSRMWWzztap9L5oN84q/19LnqUOxWLK3b4+k7z8D7MemVEG9flf36eBlVrjGeTjZE+DACyKY5BBD/uxdt6rdpe30b6OLNqrbR5/HTNsrVJG2n7/i2EUDQUGC4MOn8L/72H6OhY7scUnylpF02lIPMjbD6ndSAXwghtU9MTylPXv/Fy59cBZID80YIIAPzAaU5rqQJiy2edjXrdZFBG0+tr7Zvyz3mdh83TZPcPqLtts1w9olTy/S5x9yK7avWPVT4MALIpjkEkNZYDfQxn94X/+BB2/AHRX0VfQ21/r5XjmMIIGgoLFyYdB4LG/vKc0W66wh18DtD1IRvhJA5PB0rt3yF5Mlrz65CyRvf/vh6X1X3w8uAgfiA0hxX0oTFFk27mfuplRvCwW+90Tqz/m2k9K1Yx0x4Nt9DPtYtSg5w3as2fQJIn3vMW4M3N16nal/48N/lhBMCyKY5BRDz+7HI+0nrdWN/zHhHmw+lbfWZm9Iq8T71cePQmHI/RCCA4PCk85zyLVmRx/XeCZvaSY34hRASa+SXUL460tlXAsjAfEBpjiuL0vsgqWX7fMJc5L5srddjyVX6qVjHTqb0a+sGtURg84l/O3i0ev1OaLljPgEepAnTelKbQb+uOe9nAsimmgKIf4dTjkP+ucGaaK3L7yH/++UeA7sGmQuXSts79mEMg30wovX4qmns+NPlv896jwgB5NQpHCRPOk8t37oVeUpWSgjZeDpWzd+YfkwRQMryAaU5rizKMQEkt8Eu3bT0uepQ8mTVZ27MLm7ujw5vXkdY175x9fp30nLHNje9G0Qt522nBqBV06f/5ryfi/zuar0EkAivv9lMEv9szuu4+j1T9WqktZzf18cGD/PyUzxl6tjzmMft/e81di3n1z51DH5fE0CQTqEge9J5ank9PUPIxveE+JG3sSZ+zkUAKcsHlOa4sih9m83ck4IVPdlq/f5EMrcpcDNS7FYnrXvIeQjmdfn30K+/w4RP0BfG7z8Lf+ef8c/m/O72PnF62WYVR/E+Oky4UbnQTOjP2n3z3/vnDn2Kum11v73+O8prso/Wm/U+CosVodVP/nq0vP5mM0lWY9F/+1xx9Hb8b+DfpwvzMPRn3d81f8Bx7FXNrqme0tXnavEufj3aY9G+18+36vrqSc6xcHWFWv/Neo8IAeRUKQz0nnSeWjsmp6eEED+u9rytuT4Za1cRQMryAaU5rixK9kFSy/iEkmuU+5y1HTcKuUrfijV0CCmt94lTyw7Z3JSw/u4Z/e+c93ORZkLrJYBEeP3NZpKsxqL/DnnFsbSik7oP0faPnaNWmoPN6oMV/ZcAgjQKAkdPOk+t3BCipvySyl/kd+7y92wsaVI6AaQsH1Ca48qiZB0k9fP+RCv3E+dHYfFRaHt9/p2KnbRM659TCDnqxKnlcxuGsbwShrii/5/ze1KkmdB6CSARXn+zmSTrseh/+5P42k0aPloax5BXc4bk4+T6aor+NwEEhykADDbpPLV6hJCrnSZ99eSoWDM/xyKAlOUDSnNcWZSsg6R+vqp5FjHanj8JzVX0VizT+h1CcsPbFI4+cWodxzxtp4QL++Q/a/4qSZFmQuslgER4/c1mkmyMRf+/z1XQsVQRPkxj8YdJNX4osnG+0P8ngGA/Nf6DTzpPrUgI2fuIXjXnG5PS/UV/sYZ+bkUAKcsHlOa4sijJB0n9bJ9PFzc+dR6LttvnU/gxvhjPJ/3af4+OPnFqHd7PWj5h9esdmyeT8+9QpJnQegkgEV5/s5kkF8aiP6sthLjRryZ8tDSm2q7MXniN9GcEEOymhr/YpPOU2jExfe+XFapBv9s26/5CP3+fRqypn1M5SLX7pDo4JwZ5fEBpjiuLknSQ1M/1+bTMP1/0qsIu3q6qz9WGUa7WaDuelFnjp482yIlT66khhOwMwPq7nPdzkWZC6yWARHj9zWaSRMeiP68lhPg9UPyLBvvy2FRTX5n1sTD6GunPCSCIU6NffNJ5SkVCiAPR1TDMC9Sgez7I07Zh9zeLx5r6OZW/jLDdH9WtsKsYiA8ozXFlUZIOkvq5PrfUrCf8TkHb73PFpvitWC1tx7eK1fY75fEM+rQyrW+KCa9uaPb+/unvc157Asim6gOI6e+mbq5H+5LBY2icU16ZdUDbeczR3xFAEKcmf7RJ54fKwWfrywrPVJfCUC9Qk36907CvvlE81tjPpQggZfmA0hxXFuXgQVI/k/tt51bFwdfjaIaTpfitWF3anp8qNvXvlrdf8sTtMDhWI+h9ORiiws+lKvL7rPUSQCK8/mYzSfaORX/v5nrsEOzHQxd97HgJGrOvGo11ZdbbORjQ/DOrn05HADkFau5Hn3R+qPyN6d0xqfbOhVCjvr4Va+5PxSKAlOUDSnNcWZRDJ+++j7as4pYDjaPPhHQb5VasLm3Tn9Ye+pLAITkQuDEbrVHSttxMlAoifn8m/7uFn09FANk0mwDS0s/5WJD6ZZV9+H07y+DRpfE7sPn3stRxKOt10s8RQLBJjf1kk84P1Z//zT90A4hrZzOuRv2yan0rlpv4WHM/hyKAAMugk5evGPgkPXSz7tsdHDomDYjavvcv94vJYtpmptp77FEX/a44iAwVhNvfv+ommA9B+9Ueh4YIIz72+Gr6JPMCsRBq6CeddJ5SkSdj7ZsPcqvTuM92QjoBBFgenbDdMLkRcNPkpv2eat/kbjdW/hmXl/FJf/QrOqk8tjBGNzr79q3dL/+cf57QgaPod8jvLd925FC+73fPDXj3PeVlTur3z/ur8vuufa1cu3RfKx+7CB04nhr5KiadHyoHome//J1uADk0H2T9BYUPXrwUbfBrLwIIAAAAFkdNfDWTzg9VZD7I7bAbF6hh35iQPserIAQQAAAALIoa+OomnR+qz//V33cDiGvfrVj32wZ+jldBHr70DAEEAAAAy6DGvdpJ54dq6/tBHoRdukBN+7VOAz+7qyD+LpPO+K+F3QIAAADmRU179ZPO91XkVqybYdcuUOM+26sgBBAAAADMnpr1C5PO3dDHGv2aK/It6dEJ6WrcZzsXhAACAACA2VOjvjHp/OqN/xNt8GstX6m58pcvd8OHywHkctjFC9S8r5+INafvBSGAAAAAYNbUpG9MOveE7liTX2v5Ss3Wo3hdvpqzM3yYmvcbbSPvb0ePNfs1FgEEAAAAs6UmfWPS+b/9z/872uTXWv42dN8u1t0H1R3Vzu8Caal5v6Rafzv6k9eejTb8tRUBBAAAALOkJn3Wk84/9/yr28HDtXPieYwa+DttM//Gtz8ebfhrKwIIAAAAZkeN+mwnne+Z77Hzuz92UQN/tdPMn//xh5+NNv01FQEEAAAAs6NmfZaTzvfM9zh4y9UuauLXk9F/+eqno01/TfWjr324G0D2znMBAAAAJqdmfZaTznfN9wi71Zua+NttQz+H27DasbrCLgAAAAB1UsM+y0nn/kb27rhD3Qi7dRQ18rO6Das71rALAAAAQH3UsM9u0rnHt/Xlgq5e8z32UTO/vg2r9qdhteN0heEDAAAAdVHDPrtJ5x5f5Jaro+Z77KJmfn0b1oMXL0Ub/1qqHacrDB8AAACoi5r2WU0693yP7nhDHT3fYxc189fbpr72LyVsx+kKwwcAAADqocZ9VpPOS8732Kfb2P/hB5+JNv81VHecYegAAABAHdS4z2bS+Y75HmeqQed77KKG/n7b2Nf8ON52jK4wdAAAAGB6btxVs5h0vmO+x33V4PM9dlFDf6tt7B++9Ey0+Z+6/ISudoyuMHQAAABgWm7cVbOYdL5jvsftsCujUUO/ngfibxuPBYCp67ffu9wNIPfD0AEAAIBpqYGvftK5r8ZE5nv4ik3x+R4xaugvd5r7aACYugggAAAAqI4a+Judhr7KSed/8bf/OOl8j13U1D9tG/zfv34lGgKmLAIIAAAAqqIG/lqnoa9y0vkXv/L9yed77OKmvm3wa/xCQgIIAAAAqqEG/rKq6knnf/bXr20HD9fo8z12UVO/8YWEbvgP1ePvfur8Fy9/8mB5Xsmh+sk3P9oNGIeKAAIAAIBpqImvetJ5bfM9dlFTv34S1gyKAAIAAIBpqJG/02nsq5p0Xut8jxg19de2mvxay3NVqrlyBAAAgBOiRr7aSec1z/eIUVPfDSBu8j0n5FDdUfnKyaHyY369/r0VhgIAAADUR418tZPOd8z3uBWGDgAAAGBO1MxXOel8z3yP62HoAAAAAOZEzXyVk853zPfwOKub7wEAAAAgkRr66iadewyR+R7+RvYq53sAAAAASKCGvrpJ5x5Dd0yhmO8BAAAAzJma+qomnXu+h8fQHZOK+R4AAADA3Kmpr2rSueecMN8DAAAAWCA19RuTzl3+jo1YMBijmO8BAAAALJga+41J5y4HAM+9GPsqCPM9AAAAgIVTg++5Hw4h61uw2nr2y98Z5SlYe+Z78O3dAAAAwBKp2fetWH4K1plqIwz4y/9KXQ3ZM9/jchgaAAAAgKVS4+8gcku1cUXEIWHoLyTcMd/DV2OY7wEAAACcEoUAPxnrfggFqxryW9E/9/yr3dDR1s2weQAAAACnSKHAV0PWIeHYEOJbua785cvd0OFivgcAAAAwV//0dx+6prquutWpmyr/efbcCoWDGyEkHBVCvIwntrfrCcV8DwAAAGBOHCpCwLivOk+op6o7quRvFVdIuKraCCE5E9P//G/+gfkeAAAAwJwpQDh4OEjEQkZqnaluhFXupbDgELIOEJ6YHgsb28V8DwAAAGDGFBguqW6HAHGhfvz1j5z/9FsfO3/40jPnv3j5k6t68OKl1Z/Ffj6Ug8jBeRgKDr4dax0k/OWBsdDhYr4HAAAAMHMKCVdVD0JoWNdPvvnR88ff/dT5H37wmfPzf/783nry2rOrQPKjr314Yx2hbodN7aQAcbsTKKLzQZjvAQAAAMycwoHDh+dvrAODr3b89nuXo0HjUP3xh59dXR3pri+U55LsnJuhEOHvCll/YaGvcnTDx675HmFxAAAAALVTILgQPhweYsEit3zVxFdQuutW+SrLvhByrRswvviV76/Cx475HklzTAAAAABUQEFgI3z41qm+Vz32lW/LarcRau9VCwULP8VqFTJ8FcST0tv/H8rzPa6GHwcAAABQO4UATzhfz/lw+Pj961eiAWKIioSQnU+rUrjwt6Vvh462PN+DR+wCAAAAc6IAsPG0qxJXPrbrjW9/vBtAXDsnjitkrK+CdIr5HgAAAMDcuPHvBoGh5nwcKk9O9+T2zrbvhyFdoLCxMRdExXwPAAAAYI7U+K+/ZNCTxGNhoVT5Sku77VA7v7tDocNPxGK+BwAAADBXavg3rn6McevVdm19ceHO26oUPK6rmO8BAAAAzJUa/ptt8z/21Y+2IldBCBkAAADAEqnZXz/5yt9wHgsIY9TWXBDmdwAAAABL1Gn6V18UGAsHY9TDl57pBpDbYXgAAAAAlkKN/rW26fcViFgwGKuevPZsN4DsfBoWAAAAgJlSo3+jbfo9ETwWDMYqX31px+IKQwQAAACwFGr0b7UN/1jf/bGv2rG4whABAAAALIUafQIIAAAAgHGo0SeAAAAAABiHGv11APFTqGKhYMxqx+IKQwQAAACwFGr010/BmnoS+taXEZ6FIQIAAABYCjX6V9um/0df+3A0GIxVv3z1090AwmN4AQAAgCVSs/+0bfx///qVaDgYo9749se7AeRWGB4AAACAJVGzf7dt/KeaB/LHH352dQWmHYfqahgeAAAAgCVRs7/+MkKHAIeBWEgoWVu3XzH/AwAAAFgyNf3r27DGfhyvA8+Pv/6RbgDh9isAAABgydz0twHAV0H+8IPPRMNCiXLgabetchC6FIYFAAAAYInc9KvOQggY7ZG8nvTebjMUVz8AAACAU6Dm/3o3DDx48VI0NAxVvsqyNfH8QRgKAAAAgFOgEHCnEwiKhRCHj59886Pd8OFbr3jyFQAAAHBqFAQedILBKoQM+WQs33a1deXDdSNsHgAAAMApURjwfJCNEOKrFb/93uVooMiprQnnbRE+AAAAgFOmUOAQcr8TElblqyG535buqyf+no+tR+22RfgAAAAA0FBAWD+et1u+IuKrGb4qErs9yyHFocOBJXK7lctP3GLOBwAAAIBNDgqqC1dDepYnmzvU8F0fAAAAAHZTaLimuquKBYtDRfAAAAAAkM8hQnVD5Uf2bkxW75QDh6+aOHRcC4sCAAAAAAAAAAAAAAAAAAAAAAAg1Yc+9C+CyYFQsnpjxgAAAABJRU5ErkJggg==';

            var imageHeight = width * 3 / 8;
            var oldAntialias = this.getAntialiasing();
            this.setAntialiasing(true);
            ctx.drawImage(image, 0, 0, 800, 300, x, y - imageHeight - 20, width, imageHeight);

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, 20);

            var progress = width * (loaded / total);
            ctx.fillStyle = 'white';
            var margin = 5;
            var width = progress - margin * 2;
            var height = 20 - margin * 2;
            ctx.fillRect(x + margin, y + margin, width > 0 ? width : 0, height);
            this.setAntialiasing(oldAntialias);
        };

        Engine.prototype.setLoadingDrawFunction = function (fcn) {
            this.loadingDraw = fcn;
        };

        Engine.prototype.load = function (loader) {
            var _this = this;
            var complete = new ex.Promise();

            this.isLoading = true;

            loader.load();
            loader.onprogress = function (e) {
                _this.progress = e.loaded;
                _this.total = e.total;
                _this.logger.info('Loading ' + (100 * _this.progress / _this.total).toFixed(0));
            };
            loader.oncomplete = function () {
                setTimeout(function () {
                    _this.isLoading = false;
                    complete.resolve();
                }, 500);
            };

            return complete;
        };
        return Engine;
    })(ex.Util.Class);
    ex.Engine = Engine;
    ;
})(ex || (ex = {}));
//# sourceMappingURL=Excalibur-0.2.0.js.map
