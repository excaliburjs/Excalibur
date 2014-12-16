/*! excalibur - v0.2.5 - 2014-12-16
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
// Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
    Array.prototype.some = function (fun /*, thisArg */) {
        'use strict';
        if (this === void 0 || this === null)
            throw new TypeError();
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function')
            throw new TypeError();
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t))
                return true;
        }
        return false;
    };
}
// Polyfill from  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {
        }, fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}
var ex;
(function (ex) {
    var Effects;
    (function (Effects) {
        /**
         * Applies the "Grayscale" effect to a sprite, removing color information.
         * @class Effects.Grayscale
         * @constructor
         * @extends ISpriteEffect
         */
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
        /**
         * Applies the "Invert" effect to a sprite, inverting the pixel colors.
         * @class Effects.Invert
         * @constructor
         * @extends ISpriteEffect
         */
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
        /**
         * Applies the "Opacity" effect to a sprite, setting the alpha of all pixels to a given value.
         * @class Effects.Opacity
         * @extends ISpriteEffect
         * @constructor
         * @param opacity {number} The new opacity of the sprite from 0-1.0
         */
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
        /**
         * Applies the "Colorize" effect to a sprite, changing the color channels of all the pixels to an
         * average of the original color and the provided color
         * @class Effects.Colorize
         * @extends ISpriteEffect
         * @constructor
         * @param color {Color} The color to apply to the sprite
         */
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
        /**
         * Applies the "Fill" effect to a sprite, changing the color channels of all non-transparent pixels to match
         * a given color
         * @class Effects.Fill
         * @extends ISpriteEffect
         * @constructor
         * @param color {Color} The color to apply to the sprite
         */
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
    })(Effects = ex.Effects || (ex.Effects = {}));
})(ex || (ex = {}));
/// <reference path="../SpriteEffects.ts" />
/// <reference path="../Interfaces/IPipelineModule.ts" />
var ex;
(function (ex) {
    var MovementModule = (function () {
        function MovementModule() {
        }
        MovementModule.prototype.update = function (actor, engine, delta) {
            // Update placements based on linear algebra
            actor.x += actor.dx * delta / 1000;
            actor.y += actor.dy * delta / 1000;
            actor.dx += actor.ax * delta / 1000;
            actor.dy += actor.ay * delta / 1000;
            actor.rotation += actor.rx * delta / 1000;
            actor.scale.x += actor.sx * delta / 1000;
            actor.scale.y += actor.sy * delta / 1000;
        };
        return MovementModule;
    })();
    ex.MovementModule = MovementModule;
})(ex || (ex = {}));
/// <reference path="../Interfaces/IPipelineModule.ts" />
var ex;
(function (ex) {
    var OffscreenCullingModule = (function () {
        function OffscreenCullingModule() {
        }
        OffscreenCullingModule.prototype.update = function (actor, engine, delta) {
            var eventDispatcher = actor.eventDispatcher;
            var anchor = actor.anchor;
            var globalScale = actor.getGlobalScale();
            var width = globalScale.x * actor.getWidth() / actor.scale.x;
            var height = globalScale.y * actor.getHeight() / actor.scale.y;
            var actorScreenCoords = engine.worldToScreenCoordinates(new ex.Point(actor.getGlobalX() - anchor.x * width, actor.getGlobalY() - anchor.y * height));
            var zoom = 1.0;
            if (actor.scene && actor.scene.camera) {
                zoom = actor.scene.camera.getZoom();
            }
            if (!actor.isOffScreen) {
                if (actorScreenCoords.x + width * zoom < 0 || actorScreenCoords.y + height * zoom < 0 || actorScreenCoords.x > engine.width || actorScreenCoords.y > engine.height) {
                    eventDispatcher.publish('exitviewport', new ex.ExitViewPortEvent());
                    actor.isOffScreen = true;
                }
            }
            else {
                if (actorScreenCoords.x + width * zoom > 0 && actorScreenCoords.y + height * zoom > 0 && actorScreenCoords.x < engine.width && actorScreenCoords.y < engine.height) {
                    eventDispatcher.publish('enterviewport', new ex.EnterViewPortEvent());
                    actor.isOffScreen = false;
                }
            }
        };
        return OffscreenCullingModule;
    })();
    ex.OffscreenCullingModule = OffscreenCullingModule;
})(ex || (ex = {}));
/// <reference path="../Interfaces/IPipelineModule.ts" />
var ex;
(function (ex) {
    /**
     * Propogates pointer events to the actor
     */
    var CapturePointerModule = (function () {
        function CapturePointerModule() {
        }
        CapturePointerModule.prototype.update = function (actor, engine, delta) {
            if (!actor.enableCapturePointer)
                return;
            if (actor.isKilled())
                return;
            engine.input.pointers.propogate(actor);
        };
        return CapturePointerModule;
    })();
    ex.CapturePointerModule = CapturePointerModule;
})(ex || (ex = {}));
/// <reference path="../Interfaces/IPipelineModule.ts" />
var ex;
(function (ex) {
    var CollisionDetectionModule = (function () {
        function CollisionDetectionModule() {
        }
        CollisionDetectionModule.prototype.update = function (actor, engine, delta) {
            var eventDispatcher = actor.eventDispatcher;
            if (actor.collisionType !== 0 /* PreventCollision */) {
                for (var j = 0; j < engine.currentScene.tileMaps.length; j++) {
                    var map = engine.currentScene.tileMaps[j];
                    var intersectMap;
                    var side = 0 /* None */;
                    var max = 2;
                    var hasBounced = false;
                    while (intersectMap = map.collides(actor)) {
                        if (max-- < 0) {
                            break;
                        }
                        side = actor.getSideFromIntersect(intersectMap);
                        eventDispatcher.publish('collision', new ex.CollisionEvent(actor, null, side, intersectMap));
                        if ((actor.collisionType === 2 /* Active */ || actor.collisionType === 3 /* Elastic */)) {
                            actor.y += intersectMap.y;
                            actor.x += intersectMap.x;
                            // Naive elastic bounce
                            if (actor.collisionType === 3 /* Elastic */ && !hasBounced) {
                                hasBounced = true;
                                if (side === 3 /* Left */) {
                                    actor.dx = Math.abs(actor.dx);
                                }
                                else if (side === 4 /* Right */) {
                                    actor.dx = -Math.abs(actor.dx);
                                }
                                else if (side === 1 /* Top */) {
                                    actor.dy = Math.abs(actor.dy);
                                }
                                else if (side === 2 /* Bottom */) {
                                    actor.dy = -Math.abs(actor.dy);
                                }
                            }
                        }
                    }
                }
            }
        };
        return CollisionDetectionModule;
    })();
    ex.CollisionDetectionModule = CollisionDetectionModule;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * An enum that describes the sides of an Actor for collision
     * @class Side
     */
    (function (Side) {
        /**
        @property None {Side}
        @static
        @final
        */
        Side[Side["None"] = 0] = "None";
        /**
        @property Top {Side}
        @static
        @final
        */
        Side[Side["Top"] = 1] = "Top";
        /**
        @property Bottom {Side}
        @static
        @final
        */
        Side[Side["Bottom"] = 2] = "Bottom";
        /**
        @property Left {Side}
        @static
        @final
        */
        Side[Side["Left"] = 3] = "Left";
        /**
        @property Right {Side}
        @static
        @final
        */
        Side[Side["Right"] = 4] = "Right";
    })(ex.Side || (ex.Side = {}));
    var Side = ex.Side;
})(ex || (ex = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ex;
(function (ex) {
    /**
     * A simple 2D point on a plane
     * @class Point
     * @constructor
     * @param x {number} X coordinate of the point
     * @param y {number} Y coordinate of the point
     *
     */
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        /**
         * X Coordinate of the point
         * @property x {number}
         */
        /**
         * Y Coordinate of the point
         * @property y {number}
         */
        /**
         * Convert this point to a vector
         * @method toVector
         * @returns Vector
         */
        Point.prototype.toVector = function () {
            return new Vector(this.x, this.y);
        };
        /**
         * Rotates the current point around another by a certain number of
         * degrees in radians
         * @method rotate
         * @returns Point
         */
        Point.prototype.rotate = function (angle, anchor) {
            if (!anchor) {
                anchor = new ex.Point(0, 0);
            }
            var sinAngle = Math.sin(angle);
            var cosAngle = Math.cos(angle);
            var x = cosAngle * (this.x - anchor.x) - sinAngle * (this.y - anchor.y) + anchor.x;
            var y = sinAngle * (this.x - anchor.x) + cosAngle * (this.y - anchor.y) + anchor.y;
            return new Point(x, y);
        };
        /**
         * Translates the current point by a vector
         * @method add
         * @returns Point
         */
        Point.prototype.add = function (vector) {
            return new Point(this.x + vector.x, this.y + vector.y);
        };
        /**
         * Sets the x and y components at once
         * @method setTo
         * @param x {number}
         * @param y {number}
         */
        Point.prototype.setTo = function (x, y) {
            this.x = x;
            this.y = y;
        };
        /**
         * Clones a new point that is a copy of this one.
         * @method clone
         * @returns Point
         */
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        return Point;
    })();
    ex.Point = Point;
    /**
     * A 2D vector on a plane.
     * @class Vector
     * @extends Point
     * @constructor
     * @param x {number} X component of the Vector
     * @param y {number} Y component of the Vector
     */
    var Vector = (function (_super) {
        __extends(Vector, _super);
        function Vector(x, y) {
            _super.call(this, x, y);
            this.x = x;
            this.y = y;
        }
        /**
         * Returns a vector of unit length in the direction of the specified angle.
         * @method fromAngle
         * @static
         * @param angle {number} The angle to generate the vector
         * @returns Vector
         */
        Vector.fromAngle = function (angle) {
            return new Vector(Math.cos(angle), Math.sin(angle));
        };
        /**
         * The distance to another vector
         * @method distance
         * @param v {Vector} The other vector
         * @returns number
         */
        Vector.prototype.distance = function (v) {
            if (!v) {
                v = new Vector(0.0, 0.0);
            }
            return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
        };
        /**
         * Normalizes a vector to have a magnitude of 1.
         * @method normalize
         * @return Vector
         */
        Vector.prototype.normalize = function () {
            var d = this.distance();
            if (d > 0) {
                return new Vector(this.x / d, this.y / d);
            }
            else {
                return new Vector(0, 1);
            }
        };
        /**
         * Scales a vector's by a factor of size
         * @method scale
         * @param size {number} The factor to scale the magnitude by
         * @returns Vector
         */
        Vector.prototype.scale = function (size) {
            return new Vector(this.x * size, this.y * size);
        };
        /**
         * Adds one vector to another
         * @method add
         * @param v {Vector} The vector to add
         * @returns Vector
         */
        Vector.prototype.add = function (v) {
            return new Vector(this.x + v.x, this.y + v.y);
        };
        /**
         * Subtracts a vector from the current vector
         * @method minus
         * @param v {Vector} The vector to subtract
         * @returns Vector
         */
        Vector.prototype.minus = function (v) {
            return new Vector(this.x - v.x, this.y - v.y);
        };
        /**
         * Performs a dot product with another vector
         * @method dot
         * @param v {Vector} The vector to dot
         * @returns number
         */
        Vector.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y;
        };
        /**
         * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
         * @method cross
         * @param v {Vector} The vector to cross
         * @returns number
         */
        Vector.prototype.cross = function (v) {
            return this.x * v.y - this.y * v.x;
        };
        /**
         * Returns the perpendicular vector to this one
         * @method perpendicular
         * @return Vector
         */
        Vector.prototype.perpendicular = function () {
            return new Vector(this.y, -this.x);
        };
        /**
         * Returns the normal vector to this one
         * @method normal
         * @return Vector
         */
        Vector.prototype.normal = function () {
            return this.perpendicular().normalize();
        };
        /**
         * Returns the angle of this vector.
         * @method toAngle
         * @returns number
         */
        Vector.prototype.toAngle = function () {
            return Math.atan2(this.y, this.x);
        };
        /**
         * Returns the point represention of this vector
         * @method toPoint
         * @returns Point
         */
        Vector.prototype.toPoint = function () {
            return new Point(this.x, this.y);
        };
        /**
         * Rotates the current vector around a point by a certain number of
         * degrees in radians
         * @method rotate
         * @returns Vector
         */
        Vector.prototype.rotate = function (angle, anchor) {
            return _super.prototype.rotate.call(this, angle, anchor).toVector();
        };
        return Vector;
    })(Point);
    ex.Vector = Vector;
    /**
     * A 2D ray that can be cast into the scene to do collision detection
     * @class Ray
     * @constructor
     * @param pos {Point} The starting position for the ray
     * @param dir {Vector} The vector indicating the direction of the ray
     */
    var Ray = (function () {
        function Ray(pos, dir) {
            this.pos = pos;
            this.dir = dir.normalize();
        }
        /**
         * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
         * This number indicates the mathematical intersection time.
         * @method intersect
         * @param line {Line} The line to test
         * @returns number
         */
        Ray.prototype.intersect = function (line) {
            var numerator = line.begin.toVector().minus(this.pos.toVector());
            // Test is line and ray are parallel and non intersecting
            if (this.dir.cross(line.getSlope()) === 0 && numerator.cross(this.dir) !== 0) {
                return -1;
            }
            // Lines are parallel
            var divisor = (this.dir.cross(line.getSlope()));
            if (divisor === 0) {
                return -1;
            }
            var t = numerator.cross(line.getSlope()) / divisor;
            if (t >= 0) {
                var u = (numerator.cross(this.dir) / divisor) / line.getLength();
                if (u >= 0 && u <= 1) {
                    return t;
                }
            }
            return -1;
        };
        /**
         * Returns the point of intersection given the intersection time
         * @method getPoint
         * @returns Point
         */
        Ray.prototype.getPoint = function (time) {
            return this.pos.toVector().add(this.dir.scale(time)).toPoint();
        };
        return Ray;
    })();
    ex.Ray = Ray;
    /**
     * A 2D line segment
     * @class Line
     * @constructor
     * @param begin {Point} The starting point of the line segment
     * @param end {Point} The ending point of the line segment
     */
    var Line = (function () {
        function Line(begin, end) {
            this.begin = begin;
            this.end = end;
        }
        /**
         * Returns the slope of the line in the form of a vector
         * @method getSlope
         * @returns Vector
         */
        Line.prototype.getSlope = function () {
            var begin = this.begin.toVector();
            var end = this.end.toVector();
            var distance = begin.distance(end);
            return end.minus(begin).scale(1 / distance);
        };
        /**
         * Returns the length of the line segment in pixels
         * @method getLength
         * @returns number
         */
        Line.prototype.getLength = function () {
            var begin = this.begin.toVector();
            var end = this.end.toVector();
            var distance = begin.distance(end);
            return distance;
        };
        return Line;
    })();
    ex.Line = Line;
    var Projection = (function () {
        function Projection(min, max) {
            this.min = min;
            this.max = max;
        }
        Projection.prototype.overlaps = function (projection) {
            return this.max > projection.min && projection.max > this.min;
        };
        Projection.prototype.getOverlap = function (projection) {
            if (this.overlaps(projection)) {
                if (this.max > projection.max) {
                    return projection.max - this.min;
                }
                else {
                    return this.max - projection.min;
                }
            }
            return 0;
        };
        return Projection;
    })();
    ex.Projection = Projection;
})(ex || (ex = {}));
/// <reference path="Algebra.ts"/>
/// <reference path="Events.ts"/>
var ex;
(function (ex) {
    var Util;
    (function (Util) {
        Util.TwoPI = Math.PI * 2;
        function base64Encode(inputStr) {
            var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var outputStr = "";
            var i = 0;
            while (i < inputStr.length) {
                //all three "& 0xff" added below are there to fix a known bug 
                //with bytes returned by xhr.responseText
                var byte1 = inputStr.charCodeAt(i++) & 0xff;
                var byte2 = inputStr.charCodeAt(i++) & 0xff;
                var byte3 = inputStr.charCodeAt(i++) & 0xff;
                var enc1 = byte1 >> 2;
                var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
                var enc3, enc4;
                if (isNaN(byte2)) {
                    enc3 = enc4 = 64;
                }
                else {
                    enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
                    if (isNaN(byte3)) {
                        enc4 = 64;
                    }
                    else {
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
        function randomIntInRange(min, max) {
            return Math.round(randomInRange(min, max));
        }
        Util.randomIntInRange = randomIntInRange;
        function canonicalizeAngle(angle) {
            var tmpAngle = angle;
            if (angle > this.TwoPI) {
                while (tmpAngle > this.TwoPI) {
                    tmpAngle -= this.TwoPI;
                }
            }
            if (angle < 0) {
                while (tmpAngle < 0) {
                    tmpAngle += this.TwoPI;
                }
            }
            return tmpAngle;
        }
        Util.canonicalizeAngle = canonicalizeAngle;
        function toDegrees(radians) {
            return 180 / Math.PI * radians;
        }
        Util.toDegrees = toDegrees;
        function toRadians(degrees) {
            return degrees / 180 * Math.PI;
        }
        Util.toRadians = toRadians;
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
        function getOppositeSide(side) {
            if (side === 1 /* Top */)
                return 2 /* Bottom */;
            if (side === 2 /* Bottom */)
                return 1 /* Top */;
            if (side === 3 /* Left */)
                return 4 /* Right */;
            if (side === 4 /* Right */)
                return 3 /* Left */;
            return 0 /* None */;
        }
        Util.getOppositeSide = getOppositeSide;
        /**
         * Excaliburs dynamically resizing collection
         * @class Collection
         * @constructor
         * @param [initialSize=200] {number} Initial size of the internal backing array
         */
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
            /**
             * Push elements to the end of the collection
             * @method push
             * @param element {T}
             * @returns T
             */
            Collection.prototype.push = function (element) {
                if (this.endPointer === this.internalArray.length) {
                    this.resize();
                }
                return this.internalArray[this.endPointer++] = element;
            };
            /**
             * Removes elements from the end of the collection
             * @method pop
             * @returns T
             */
            Collection.prototype.pop = function () {
                this.endPointer = this.endPointer - 1 < 0 ? 0 : this.endPointer - 1;
                return this.internalArray[this.endPointer];
            };
            /**
             * Returns the count of the collection
             * @method count
             * @returns number
             */
            Collection.prototype.count = function () {
                return this.endPointer;
            };
            /**
             * Empties the collection
             * @method clear
             */
            Collection.prototype.clear = function () {
                this.endPointer = 0;
            };
            /**
             * Returns the size of the internal backing array
             * @method internalSize
             * @returns number
             */
            Collection.prototype.internalSize = function () {
                return this.internalArray.length;
            };
            /**
             * Returns an element at a specific index
             * @method elementAt
             * @param index {number} Index of element to retreive
             * @returns T
             */
            Collection.prototype.elementAt = function (index) {
                if (index >= this.count()) {
                    return;
                }
                return this.internalArray[index];
            };
            /**
             * Inserts an element at a specific index
             * @method insert
             * @param index {number} Index to insert the element
             * @returns T
             */
            Collection.prototype.insert = function (index, value) {
                if (index >= this.count()) {
                    this.resize();
                }
                return this.internalArray[index] = value;
            };
            /**
             * Removes an element at a specific index
             * @method remove
             * @param index {number} Index of element to remove
             * @returns T
             */
            Collection.prototype.remove = function (index) {
                var count = this.count();
                if (count === 0)
                    return;
                // O(n) Shift 
                var removed = this.internalArray[index];
                for (var i = index; i < count; i++) {
                    this.internalArray[i] = this.internalArray[i + 1];
                }
                this.endPointer--;
                return removed;
            };
            /**
             * Removes an element by reference
             * @method removeElement
             * @param element {T} Index of element to retreive
             */
            Collection.prototype.removeElement = function (element) {
                var index = this.internalArray.indexOf(element);
                this.remove(index);
            };
            /**
             * Returns a array representing the collection
             * @method toArray
             * @returns T[]
             */
            Collection.prototype.toArray = function () {
                return this.internalArray.slice(0, this.endPointer);
            };
            /**
             * Iterate over every element in the collection
             * @method forEach
             * @param func {(T,number)=>any} Callback to call for each element passing a reference to the element and its index, returned values are ignored
             */
            Collection.prototype.forEach = function (func) {
                var count = this.count();
                for (var i = 0; i < count; i++) {
                    func.call(this, this.internalArray[i], i);
                }
            };
            /**
             * Mutate every element in the collection
             * @method map
             * @param func {(T,number)=>any} Callback to call for each element passing a reference to the element and its index, any values returned mutate the collection
             */
            Collection.prototype.map = function (func) {
                var count = this.count();
                for (var i = 0; i < count; i++) {
                    this.internalArray[i] = func.call(this, this.internalArray[i], i);
                }
            };
            /**
             * Default collection size
             * @property DefaultSize {number}
             * @static
             * @final
             */
            Collection.DefaultSize = 200;
            return Collection;
        })();
        Util.Collection = Collection;
    })(Util = ex.Util || (ex.Util = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * A Sprite is one of the main drawing primitives. It is responsible for drawing
     * images or parts of images known as Textures to the screen.
     * @class Sprite
     * @constructor
     * @param image {Texture} The backing image texture to build the Sprite
     * @param sx {number} The x position of the sprite
     * @param sy {number} The y position of the sprite
     * @param swidth {number} The width of the sprite in pixels
     * @param sheight {number} The height of the sprite in pixels
     */
    var Sprite = (function () {
        function Sprite(image, sx, sy, swidth, sheight) {
            var _this = this;
            this.sx = sx;
            this.sy = sy;
            this.swidth = swidth;
            this.sheight = sheight;
            this.scaleX = 1.0;
            this.scaleY = 1.0;
            this.rotation = 0.0;
            this.transformPoint = new ex.Point(0, 0);
            this.logger = ex.Logger.getInstance();
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
            if (sx < 0 || sy < 0 || swidth < 0 || sheight < 0) {
                this.logger.error("Sprite cannot have any negative dimensions x:", sx, "y:", sy, "width:", swidth, "height:", sheight);
            }
            this.texture = image;
            this.spriteCanvas = document.createElement('canvas');
            this.spriteCanvas.width = swidth;
            this.spriteCanvas.height = sheight;
            this.spriteCtx = this.spriteCanvas.getContext('2d');
            this.texture.loaded.then(function () {
                _this.spriteCanvas.width = _this.spriteCanvas.width || _this.texture.image.naturalWidth;
                _this.spriteCanvas.height = _this.spriteCanvas.height || _this.texture.image.naturalHeight;
                _this.loadPixels();
                _this.dirtyEffect = true;
            }).error(function (e) {
                _this.logger.error("Error loading texture ", _this.texture.path, e);
            });
            this.width = swidth;
            this.height = sheight;
        }
        Sprite.prototype.loadPixels = function () {
            if (this.texture.isLoaded() && !this.pixelsLoaded) {
                var clamp = ex.Util.clamp;
                var naturalWidth = this.texture.image.naturalWidth || 0;
                var naturalHeight = this.texture.image.naturalHeight || 0;
                if (this.swidth > naturalWidth) {
                    this.logger.warn("The sprite width", this.swidth, "exceeds the width", naturalWidth, "of the backing texture", this.texture.path);
                }
                if (this.sheight > naturalHeight) {
                    this.logger.warn("The sprite height", this.sheight, "exceeds the height", naturalHeight, "of the backing texture", this.texture.path);
                }
                this.spriteCtx.drawImage(this.texture.image, clamp(this.sx, 0, naturalWidth), clamp(this.sy, 0, naturalHeight), clamp(this.swidth, 0, naturalWidth), clamp(this.sheight, 0, naturalHeight), 0, 0, this.swidth, this.sheight);
                //this.pixelData = this.spriteCtx.getImageData(0, 0, this.swidth, this.sheight);
                this.internalImage.src = this.spriteCanvas.toDataURL("image/png");
                this.pixelsLoaded = true;
            }
        };
        /**
         * Adds a new {{#crossLink Effects.ISpriteEffect}}{{/crossLink}} to this drawing.
         * @method addEffect
         * @param effect {Effects.ISpriteEffect} Effect to add to the this drawing
         */
        Sprite.prototype.addEffect = function (effect) {
            this.effects.push(effect);
            // We must check if the texture and the backing sprite pixels are loaded as well before 
            // an effect can be applied
            if (!this.texture.isLoaded() || !this.pixelsLoaded) {
                this.dirtyEffect = true;
            }
            else {
                this.applyEffects();
            }
        };
        Sprite.prototype.removeEffect = function (param) {
            var indexToRemove = null;
            if (typeof param === 'number') {
                indexToRemove = param;
            }
            else {
                indexToRemove = this.effects.indexOf(param);
            }
            this.effects.splice(indexToRemove, 1);
            // We must check if the texture and the backing sprite pixels are loaded as well before 
            // an effect can be applied
            if (!this.texture.isLoaded() || !this.pixelsLoaded) {
                this.dirtyEffect = true;
            }
            else {
                this.applyEffects();
            }
        };
        Sprite.prototype.applyEffects = function () {
            var _this = this;
            var clamp = ex.Util.clamp;
            var naturalWidth = this.texture.image.naturalWidth || 0;
            var naturalHeight = this.texture.image.naturalHeight || 0;
            this.spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
            this.spriteCtx.drawImage(this.texture.image, clamp(this.sx, 0, naturalWidth), clamp(this.sy, 0, naturalHeight), clamp(this.swidth, 0, naturalWidth), clamp(this.sheight, 0, naturalHeight), 0, 0, this.swidth, this.sheight);
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
        /**
         * Clears all effects from the drawing and return it to its original state.
         * @method clearEffects
         */
        Sprite.prototype.clearEffects = function () {
            this.effects.length = 0;
            this.applyEffects();
        };
        /**
         * Sets the point about which to apply transformations to the drawing relative to the
         * top left corner of the drawing.
         * @method transformAbotPoint
         * @param point {Point} The point about which to apply transformations
         */
        Sprite.prototype.transformAboutPoint = function (point) {
            this.transformPoint = point;
        };
        /**
         * Sets the current rotation transformation for the drawing.
         * @method setRotation
         * @param radians {number} The rotation to apply to the drawing.
         */
        Sprite.prototype.setRotation = function (radians) {
            this.rotation = radians;
        };
        /**
         * Returns the current rotation for the drawing in radians.
         * @method getRotation
         * @returns number
         */
        Sprite.prototype.getRotation = function () {
            return this.rotation;
        };
        /**
         * Sets the scale trasformation in the x direction
         * @method setScale
         * @param scale {number} The magnitude to scale the drawing in the x direction
         */
        Sprite.prototype.setScaleX = function (scaleX) {
            this.scaleX = scaleX;
        };
        /**
         * Sets the scale trasformation in the x direction
         * @method setScale
         * @param scale {number} The magnitude to scale the drawing in the x direction
         */
        Sprite.prototype.setScaleY = function (scaleY) {
            this.scaleY = scaleY;
        };
        /**
         * Returns the current magnitude of the drawing's scale in the x direction
         * @method getScale
         * @returns number
         */
        Sprite.prototype.getScaleX = function () {
            return this.scaleX;
        };
        /**
         * Returns the current magnitude of the drawing's scale in the y direction
         * @method getScale
         * @returns number
         */
        Sprite.prototype.getScaleY = function () {
            return this.scaleY;
        };
        /**
         * Resets the internal state of the drawing (if any)
         * @method reset
         */
        Sprite.prototype.reset = function () {
            // do nothing
        };
        /**
         * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The 2D rendering context
         * @param x {number} The x coordinate of where to draw
         * @param y {number} The y coordinate of where to draw
         */
        Sprite.prototype.draw = function (ctx, x, y) {
            if (this.dirtyEffect) {
                this.applyEffects();
                this.dirtyEffect = false;
            }
            ctx.save();
            ctx.translate(x, y);
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
                ctx.drawImage(this.internalImage, 0, 0, this.swidth, this.sheight, -(this.transformPoint.x * this.swidth) * this.scaleX, -(this.transformPoint.y * this.sheight) * this.scaleY, this.swidth * this.scaleX, this.sheight * this.scaleY);
            }
            ctx.restore();
        };
        /**
         * Produces a copy of the current sprite
         * @method clone
         * @returns Sprite
         */
        Sprite.prototype.clone = function () {
            var result = new Sprite(this.texture, this.sx, this.sy, this.swidth, this.sheight);
            result.scaleX = this.scaleX;
            result.scaleY = this.scaleY;
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
})(ex || (ex = {}));
/// <reference path="Sprite.ts" />
var ex;
(function (ex) {
    /**
     * SpriteSheets are a useful mechanism for slicing up image resources into
     * separate sprites or for generating in game animations. Sprites are organized
     * in row major order in the SpriteSheet.
     * @class SpriteSheet
     * @constructor
     * @param image {Texture} The backing image texture to build the SpriteSheet
     * @param columns {number} The number of columns in the image texture
     * @param rows {number} The number of rows in the image texture
     * @param spWidth {number} The width of each individual sprite in pixels
     * @param spHeight {number} The height of each individual sprite in pixels
     */
    var SpriteSheet = (function () {
        function SpriteSheet(image, columns, rows, spWidth, spHeight) {
            this.image = image;
            this.columns = columns;
            this.rows = rows;
            this.sprites = [];
            this.internalImage = image.image;
            this.sprites = new Array(columns * rows);
            // TODO: Inspect actual image dimensions with preloading
            /*if(spWidth * columns > this.internalImage.naturalWidth){
               throw new Error("SpriteSheet specified is wider than image width");
            }
   
            if(spHeight * rows > this.internalImage.naturalHeight){
               throw new Error("SpriteSheet specified is higher than image height");
            }*/
            var i = 0;
            var j = 0;
            for (i = 0; i < rows; i++) {
                for (j = 0; j < columns; j++) {
                    this.sprites[j + i * columns] = new ex.Sprite(this.image, j * spWidth, i * spHeight, spWidth, spHeight);
                }
            }
        }
        /**
         * Create an animation from the this SpriteSheet by listing out the
         * sprite indices. Sprites are organized in row major order in the SpriteSheet.
         * @method getAnimationByIndices
         * @param engine {Engine} Reference to the current game Engine
         * @param indices {number[]} An array of sprite indices to use in the animation
         * @param speed {number} The number in milliseconds to display each frame in the animation
         * @returns Animation
         */
        SpriteSheet.prototype.getAnimationByIndices = function (engine, indices, speed) {
            var _this = this;
            var images = indices.map(function (index) {
                return _this.sprites[index];
            });
            images = images.map(function (i) {
                return i.clone();
            });
            return new ex.Animation(engine, images, speed);
        };
        /**
         * Create an animation from the this SpriteSheet by specifing the range of
         * images with the beginning and ending index
         * @method getAnimationBetween
         * @param engine {Engine} Reference to the current game Engine
         * @param beginIndex {number} The index to start taking frames
         * @param endIndex {number} The index to stop taking frames
         * @param speed {number} The number in milliseconds to display each frame in the animation
         * @returns Animation
         */
        SpriteSheet.prototype.getAnimationBetween = function (engine, beginIndex, endIndex, speed) {
            var images = this.sprites.slice(beginIndex, endIndex);
            images = images.map(function (i) {
                return i.clone();
            });
            return new ex.Animation(engine, images, speed);
        };
        /**
         * Treat the entire SpriteSheet as one animation, organizing the frames in
         * row major order.
         * @method getAnimationForAll
         * @param engine {Engine} Reference to the current game Engine
         * @param speed {number} The number in milliseconds to display each frame the animation
         * @returns Animation
         */
        SpriteSheet.prototype.getAnimationForAll = function (engine, speed) {
            var sprites = this.sprites.map(function (i) {
                return i.clone();
            });
            return new ex.Animation(engine, sprites, speed);
        };
        /**
         * Retreive a specific sprite from the SpriteSheet by its index. Sprites are organized
         * in row major order in the SpriteSheet.
         * @method getSprite
         * @param index {number} The index of the sprite
         * @returns Sprite
         */
        SpriteSheet.prototype.getSprite = function (index) {
            if (index >= 0 && index < this.sprites.length) {
                return this.sprites[index];
            }
        };
        return SpriteSheet;
    })();
    ex.SpriteSheet = SpriteSheet;
    /**
     * SpriteFonts are a used in conjunction with a {{#crossLink Label}}{{/crossLink}} to specify
     * a particular bitmap as a font.
     * @class SpriteFont
     * @extends SpriteSheet
     * @constructor
     * @param image {Texture} The backing image texture to build the SpriteFont
     * @param alphabet {string} A string representing all the charaters in the image, in row major order.
     * @param caseInsensitve {boolean} Indicate whether this font takes case into account
     * @param columns {number} The number of columns of characters in the image
     * @param rows {number} The number of rows of characters in the image
     * @param spWdith {number} The width of each character in pixels
     * @param spHeight {number} The height of each character in pixels
     */
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
        /**
         * Returns a dictionary that maps each character in the alphabet to the appropriate Sprite.
         * @method getTextSprites
         * @returns {Object}
         */
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
})(ex || (ex = {}));
/// <reference path="Engine.ts" />
/// <reference path="SpriteSheet.ts" />
var ex;
(function (ex) {
    var TileSprite = (function () {
        function TileSprite(spriteSheetKey, spriteId) {
            this.spriteSheetKey = spriteSheetKey;
            this.spriteId = spriteId;
        }
        return TileSprite;
    })();
    ex.TileSprite = TileSprite;
    /**
     * A light-weight object that occupies a space in a collision map. Generally
     * created by a CollisionMap.
     * @class Cell
     * @constructor
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     * @param index {number}
     * @param [solid=false] {boolean}
     * @param [spriteId=-1] {number}
     */
    var Cell = (function () {
        function Cell(
            /**
             * Gets or sets x coordinate of the cell in world coordinates
             * @property x {number}
             */
            x, 
            /**
             * Gets or sets y coordinate of the cell in world coordinates
             * @property y {number}
             */
            y, 
            /**
             * Gets or sets the width of the cell
             * @property width {number}
             */
            width, 
            /**
             * Gets or sets the height of the cell
             * @property height {number}
             */
            height, 
            /**
             * The index of the cell in row major order
             * @property index {number}
             */
            index, 
            /**
             * Gets or sets whether this cell is solid
             * @property solid {boolean}
             */
            solid, 
            /**
             * The index of the sprite to use from the CollisionMap SpriteSheet, if -1 is specified nothing is drawn.
             * @property number {number}
             */
            sprites) {
            if (solid === void 0) { solid = false; }
            if (sprites === void 0) { sprites = []; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.index = index;
            this.solid = solid;
            this.sprites = sprites;
            this._bounds = new ex.BoundingBox(this.x, this.y, this.x + this.width, this.y + this.height);
        }
        /**
         * Returns the bounding box for this cell
         * @method getBounds
         * @returns BoundingBox
         */
        Cell.prototype.getBounds = function () {
            return this._bounds;
        };
        Cell.prototype.getCenter = function () {
            return new ex.Vector(this.x + this.width / 2, this.y + this.height / 2);
        };
        Cell.prototype.pushSprite = function (tileSprite) {
            this.sprites.push(tileSprite);
        };
        Cell.prototype.removeSprite = function (tileSprite) {
            var index = -1;
            if ((index = this.sprites.indexOf(tileSprite)) > -1) {
                this.sprites.splice(index, 1);
            }
        };
        Cell.prototype.clearSprites = function () {
            this.sprites.length = 0;
        };
        return Cell;
    })();
    ex.Cell = Cell;
    /**
     * The CollisionMap object provides a lightweight way to do large complex scenes with collision
     * without the overhead of actors.
     * @class CollisionMap
     * @constructor
     * @param x {number} The x coordinate to anchor the collision map's upper left corner (should not be changed once set)
     * @param y {number} The y coordinate to anchor the collision map's upper left corner (should not be changed once set)
     * @param cellWidth {number} The individual width of each cell (in pixels) (should not be changed once set)
     * @param cellHeight {number} The individual height of each cell (in pixels) (should not be changed once set)
     * @param rows {number} The number of rows in the collision map (should not be changed once set)
     * @param cols {number} The number of cols in the collision map (should not be changed once set)
     * @param spriteSheet {SpriteSheet} The spriteSheet to use for drawing
     */
    var TileMap = (function () {
        function TileMap(x, y, cellWidth, cellHeight, rows, cols) {
            var _this = this;
            this.x = x;
            this.y = y;
            this.cellWidth = cellWidth;
            this.cellHeight = cellHeight;
            this.rows = rows;
            this.cols = cols;
            this._collidingX = -1;
            this._collidingY = -1;
            this._onScreenXStart = 0;
            this._onScreenXEnd = 9999;
            this._onScreenYStart = 0;
            this._onScreenYEnd = 9999;
            this._spriteSheets = {};
            this.logger = ex.Logger.getInstance();
            this.data = [];
            this.data = new Array(rows * cols);
            for (var i = 0; i < cols; i++) {
                for (var j = 0; j < rows; j++) {
                    (function () {
                        var cd = new Cell(i * cellWidth + x, j * cellHeight + y, cellWidth, cellHeight, i + j * cols);
                        _this.data[i + j * cols] = cd;
                    })();
                }
            }
        }
        TileMap.prototype.registerSpriteSheet = function (key, spriteSheet) {
            this._spriteSheets[key] = spriteSheet;
        };
        /**
         * Returns the intesection vector that can be used to resolve collisions with actors. If there
         * is no collision null is returned.
         * @method collides
         * @param actor {Actor}
         * @returns Vector
         */
        TileMap.prototype.collides = function (actor) {
            var points = [];
            var width = actor.x + actor.getWidth();
            var height = actor.y + actor.getHeight();
            var actorBounds = actor.getBounds();
            var overlaps = [];
            for (var x = actorBounds.left; x <= width; x += Math.min(actor.getWidth() / 2, this.cellWidth / 2)) {
                for (var y = actorBounds.top; y <= height; y += Math.min(actor.getHeight() / 2, this.cellHeight / 2)) {
                    var cell = this.getCellByPoint(x, y);
                    if (cell && cell.solid) {
                        var overlap = actorBounds.collides(cell.getBounds());
                        var dir = actor.getCenter().minus(cell.getCenter());
                        if (overlap && overlap.dot(dir) > 0) {
                            overlaps.push(overlap);
                        }
                    }
                }
            }
            if (overlaps.length === 0) {
                return null;
            }
            // Return the smallest change other than zero
            var result = overlaps.reduce(function (accum, next) {
                var x = accum.x;
                var y = accum.y;
                if (Math.abs(accum.x) < Math.abs(next.x)) {
                    x = next.x;
                }
                if (Math.abs(accum.y) < Math.abs(next.y)) {
                    y = next.y;
                }
                return new ex.Vector(x, y);
            });
            return result;
        };
        /*
        public collidesActor(actor: Actor): boolean{
           
           var points: Point[] = [];
           var width = actor.x + actor.getWidth();
           var height = actor.y + actor.getHeight();
           for(var x = actor.x; x <= width; x += Math.min(actor.getWidth()/2,this.cellWidth/2)){
              for(var y = actor.y; y <= height; y += Math.min(actor.getHeight()/2, this.cellHeight/2)){
                 points.push(new Point(x,y))
              }
           }
  
           var result = points.some((p) => {
              return this.collidesPoint(p.x, p.y);
           });
  
           return result;
  
        }*/
        /*
        public collidesPoint(x: number, y: number): boolean{
           var x = Math.floor(x/this.cellWidth);// - Math.floor(this.x/this.cellWidth);
           var y = Math.floor(y/this.cellHeight);
  
  
           var cell = this.getCell(x, y);
           if(x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell){
              if(cell.solid){
                 this._collidingX = x;
                 this._collidingY = y;
              }
              return cell.solid;
           }
  
  
  
           
           return false;
        }*/
        /**
         * Returns the cell by index (row major order)
         * @method getCellByIndex
         * @param index {number}
         * @returns Cell
         */
        TileMap.prototype.getCellByIndex = function (index) {
            return this.data[index];
        };
        /**
         * Returns the cell by it's x and y coordinates
         * @method getCell
         * @param x {number}
         * @param y {number}
         * @returns Cell
         */
        TileMap.prototype.getCell = function (x, y) {
            if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
                return null;
            }
            return this.data[x + y * this.cols];
        };
        /**
         * Returns the cell by testing a point in global coordinates,
         * returns null if no cell was found.
         * @method getCellByPoint
         * @param x {number}
         * @param y {number}
         * @returns Cell
         */
        TileMap.prototype.getCellByPoint = function (x, y) {
            var x = Math.floor((x - this.x) / this.cellWidth); // - Math.floor(this.x/this.cellWidth);
            var y = Math.floor((y - this.y) / this.cellHeight);
            var cell = this.getCell(x, y);
            if (x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell) {
                return cell;
            }
            return null;
        };
        TileMap.prototype.update = function (engine, delta) {
            var worldCoordsUpperLeft = engine.screenToWorldCoordinates(new ex.Point(0, 0));
            var worldCoordsLowerRight = engine.screenToWorldCoordinates(new ex.Point(engine.width, engine.height));
            this._onScreenXStart = Math.max(Math.floor(worldCoordsUpperLeft.x / this.cellWidth) - 2, 0);
            this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y - this.y) / this.cellHeight) - 2, 0);
            this._onScreenXEnd = Math.max(Math.floor(worldCoordsLowerRight.x / this.cellWidth) + 2, 0);
            this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y - this.y) / this.cellHeight) + 2, 0);
        };
        /**
         * Draws the collision map to the screen. Called by the Scene.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The current rendering context
         * @param delta {number} The number of milliseconds since the last draw
         */
        TileMap.prototype.draw = function (ctx, delta) {
            var _this = this;
            ctx.save();
            ctx.translate(this.x, this.y);
            for (var x = this._onScreenXStart; x < Math.min(this._onScreenXEnd, this.cols); x++) {
                for (var y = this._onScreenYStart; y < Math.min(this._onScreenYEnd, this.rows); y++) {
                    this.getCell(x, y).sprites.filter(function (s) {
                        return s.spriteId > -1;
                    }).forEach(function (ts) {
                        var ss = _this._spriteSheets[ts.spriteSheetKey];
                        if (ss) {
                            var sprite = ss.getSprite(ts.spriteId);
                            if (sprite) {
                                sprite.draw(ctx, x * _this.cellWidth, y * _this.cellHeight);
                            }
                            else {
                                _this.logger.warn("Sprite does not exist for id", ts.spriteId, "in sprite sheet", ts.spriteSheetKey, sprite, ss);
                            }
                        }
                        else {
                            _this.logger.warn("Sprite sheet", ts.spriteSheetKey, "does not exist", ss);
                        }
                    });
                }
            }
            ctx.restore();
        };
        /**
         * Draws all the collision map's debug info. Called by the Scene.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The current rendering context
         */
        TileMap.prototype.debugDraw = function (ctx) {
            var width = this.cols * this.cellWidth;
            var height = this.rows * this.cellHeight;
            ctx.save();
            ctx.strokeStyle = ex.Color.Red.toString();
            for (var x = 0; x < this.cols + 1; x++) {
                ctx.beginPath();
                ctx.moveTo(this.x + x * this.cellWidth, this.y);
                ctx.lineTo(this.x + x * this.cellWidth, this.y + height);
                ctx.stroke();
            }
            for (var y = 0; y < this.rows + 1; y++) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + y * this.cellHeight);
                ctx.lineTo(this.x + width, this.y + y * this.cellHeight);
                ctx.stroke();
            }
            var solid = ex.Color.Red.clone();
            solid.a = .3;
            this.data.filter(function (cell) {
                return cell.solid;
            }).forEach(function (cell) {
                ctx.fillStyle = solid.toString();
                ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
            });
            if (this._collidingY > -1 && this._collidingX > -1) {
                ctx.fillStyle = ex.Color.Cyan.toString();
                ctx.fillRect(this.x + this._collidingX * this.cellWidth, this.y + this._collidingY * this.cellHeight, this.cellWidth, this.cellHeight);
            }
            ctx.restore();
        };
        return TileMap;
    })();
    ex.TileMap = TileMap;
})(ex || (ex = {}));
/// <reference path="../Algebra.ts" />
var ex;
(function (ex) {
    (function (CollisionStrategy) {
        CollisionStrategy[CollisionStrategy["Naive"] = 0] = "Naive";
        CollisionStrategy[CollisionStrategy["DynamicAABBTree"] = 1] = "DynamicAABBTree";
        CollisionStrategy[CollisionStrategy["SeparatingAxis"] = 2] = "SeparatingAxis";
    })(ex.CollisionStrategy || (ex.CollisionStrategy = {}));
    var CollisionStrategy = ex.CollisionStrategy;
    /**
     * Axis Aligned collision primitive for Excalibur.
     * @class BoundingBox
     * @constructor
     * @param left {number} x coordinate of the left edge
     * @param top {number} y coordinate of the top edge
     * @param right {number} x coordinate of the right edge
     * @param bottom {number} y coordinate of the bottom edge
     */
    var BoundingBox = (function () {
        function BoundingBox(left, top, right, bottom) {
            if (left === void 0) { left = 0; }
            if (top === void 0) { top = 0; }
            if (right === void 0) { right = 0; }
            if (bottom === void 0) { bottom = 0; }
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }
        /**
         * Returns the calculated width of the bounding box
         * @method getWidth
         * @returns number
         */
        BoundingBox.prototype.getWidth = function () {
            return this.right - this.left;
        };
        /**
         * Returns the calculated height of the bounding box
         * @method getHeight
         * @returns number
         */
        BoundingBox.prototype.getHeight = function () {
            return this.bottom - this.top;
        };
        /**
         * Returns the perimeter of the bounding box
         * @method getPerimeter
         * @returns number
         */
        BoundingBox.prototype.getPerimeter = function () {
            var wx = this.getWidth();
            var wy = this.getHeight();
            return 2 * (wx + wy);
        };
        BoundingBox.prototype.contains = function (val) {
            if (val instanceof ex.Point) {
                return (this.left <= val.x && this.top <= val.y && this.bottom >= val.y && this.right >= val.x);
            }
            else if (val instanceof BoundingBox) {
                if (this.left < val.left && this.top < val.top && val.bottom < this.bottom && val.right < this.right) {
                    return true;
                }
                return false;
            }
            return false;
        };
        /**
         * Combines this bounding box and another together returning a new bounding box
         * @method combine
         * @param other {BoundingBox} The bounding box to combine
         * @returns BoundingBox
         */
        BoundingBox.prototype.combine = function (other) {
            var compositeBB = new BoundingBox(Math.min(this.left, other.left), Math.min(this.top, other.top), Math.max(this.right, other.right), Math.max(this.bottom, other.bottom));
            return compositeBB;
        };
        /**
         * Test wether this bounding box collides with another returning,
         * the intersection vector that can be used to resovle the collision. If there
         * is no collision null is returned.
         * @method collides
         * @param collidable {ICollidable} Other collidable to test
         * @returns Vector
         */
        BoundingBox.prototype.collides = function (collidable) {
            if (collidable instanceof BoundingBox) {
                var other = collidable;
                var totalBoundingBox = this.combine(other);
                // If the total bounding box is less than the sum of the 2 bounds then there is collision
                if (totalBoundingBox.getWidth() < other.getWidth() + this.getWidth() && totalBoundingBox.getHeight() < other.getHeight() + this.getHeight()) {
                    // collision
                    var overlapX = 0;
                    if (this.right >= other.left && this.right <= other.right) {
                        overlapX = other.left - this.right;
                    }
                    else {
                        overlapX = other.right - this.left;
                    }
                    var overlapY = 0;
                    if (this.top <= other.bottom && this.top >= other.top) {
                        overlapY = other.bottom - this.top;
                    }
                    else {
                        overlapY = other.top - this.bottom;
                    }
                    if (Math.abs(overlapX) < Math.abs(overlapY)) {
                        return new ex.Vector(overlapX, 0);
                    }
                    else {
                        return new ex.Vector(0, overlapY);
                    }
                }
                else {
                    return null;
                }
            }
            return null;
        };
        BoundingBox.prototype.debugDraw = function (ctx) {
            ctx.lineWidth = 2;
            ctx.strokeRect(this.left, this.top, this.getWidth(), this.getHeight());
        };
        return BoundingBox;
    })();
    ex.BoundingBox = BoundingBox;
    var SATBoundingBox = (function () {
        function SATBoundingBox(points) {
            this._points = points.map(function (p) { return p.toVector(); });
        }
        SATBoundingBox.prototype.getSides = function () {
            var lines = [];
            var len = this._points.length;
            for (var i = 0; i < len; i++) {
                lines.push(new ex.Line(this._points[i], this._points[(i + 1) % len]));
            }
            return lines;
        };
        SATBoundingBox.prototype.getAxes = function () {
            var axes = [];
            var len = this._points.length;
            for (var i = 0; i < len; i++) {
                axes.push(this._points[i].minus(this._points[(i + 1) % len]).normal());
            }
            return axes;
        };
        SATBoundingBox.prototype.project = function (axis) {
            var scalars = [];
            var len = this._points.length;
            for (var i = 0; i < len; i++) {
                scalars.push(this._points[i].dot(axis));
            }
            return new ex.Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
        };
        /**
         * Returns the calculated width of the bounding box, by generating an axis aligned box around the current
         * @method getWidth
         * @returns number
         */
        SATBoundingBox.prototype.getWidth = function () {
            var left = this._points.reduce(function (accum, p, i, arr) {
                return Math.min(accum, p.x);
            }, Infinity);
            var right = this._points.reduce(function (accum, p, i, arr) {
                return Math.max(accum, p.x);
            }, -Infinity);
            return right - left;
        };
        /**
         * Returns the calculated height of the bounding box, by generating an axis aligned box around the current
         * @method getHeight
         * @returns number
         */
        SATBoundingBox.prototype.getHeight = function () {
            var top = this._points.reduce(function (accum, p, i, arr) {
                return Math.min(accum, p.y);
            }, Infinity);
            var bottom = this._points.reduce(function (accum, p, i, arr) {
                return Math.max(accum, p.y);
            }, -Infinity);
            return top - bottom;
        };
        /**
         * Tests wether a point is contained within the bounding box, using the PIP algorithm
         * http://en.wikipedia.org/wiki/Point_in_polygon
         * @method contains
         * @param p {Point} The point to test
         * @returns boolean
         */
        SATBoundingBox.prototype.contains = function (p) {
            // Always cast to the right, as long as we cast in a consitent fixed direction we
            // will be fine
            var testRay = new ex.Ray(p, new ex.Vector(1, 0));
            var intersectCount = this.getSides().reduce(function (accum, side, i, arr) {
                if (testRay.intersect(side) >= 0) {
                    return accum + 1;
                }
                return accum;
            }, 0);
            if (intersectCount % 2 === 0) {
                return false;
            }
            return true;
        };
        SATBoundingBox.prototype.collides = function (collidable) {
            if (collidable instanceof SATBoundingBox) {
                var other = collidable;
                var axes = this.getAxes();
                axes = other.getAxes().concat(axes);
                var minOverlap = 99999;
                var minAxis = null;
                for (var i = 0; i < axes.length; i++) {
                    var proj1 = this.project(axes[i]);
                    var proj2 = other.project(axes[i]);
                    var overlap = proj1.getOverlap(proj2);
                    if (overlap === 0) {
                        return null;
                    }
                    else {
                        if (overlap <= minOverlap) {
                            minOverlap = overlap;
                            minAxis = axes[i];
                        }
                    }
                }
                if (minAxis) {
                    return minAxis.normalize().scale(minOverlap);
                }
                else {
                    return null;
                }
            }
            return null;
        };
        SATBoundingBox.prototype.debugDraw = function (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            // Iterate through the supplied points and contruct a 'polygon'
            var firstPoint = this._points[0];
            ctx.moveTo(firstPoint.x, firstPoint.y);
            this._points.forEach(function (point) {
                ctx.lineTo(point.x, point.y);
            });
            ctx.lineTo(firstPoint.x, firstPoint.y);
            ctx.closePath();
            ctx.strokeStyle = ex.Color.Blue.toString();
            ctx.stroke();
        };
        return SATBoundingBox;
    })();
    ex.SATBoundingBox = SATBoundingBox;
})(ex || (ex = {}));
/// <reference path="Events.ts" />
var ex;
(function (ex) {
    /**
     * Excalibur base class
     * @class Class
     * @constructor
     */
    var Class = (function () {
        function Class() {
            this.eventDispatcher = new ex.EventDispatcher(this);
        }
        /**
         * Add an event listener. You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @method addEventListener
         * @param eventName {string} Name of the event to listen for
         * @param handler {event=>void} Event handler for the thrown event
         */
        Class.prototype.addEventListener = function (eventName, handler) {
            this.eventDispatcher.subscribe(eventName, handler);
        };
        /**
         * Removes an event listener. If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified just that handler will be removed.
         *
         * @method removeEventListener
         * @param eventName {string} Name of the event to listen for
         * @param [handler=undefined] {event=>void} Event handler for the thrown event
         */
        Class.prototype.removeEventListener = function (eventName, handler) {
            this.eventDispatcher.unsubscribe(eventName, handler);
        };
        /**
         * Alias for "addEventListener". You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @method on
         * @param eventName {string} Name of the event to listen for
         * @param handler {event=>void} Event handler for the thrown event
         */
        Class.prototype.on = function (eventName, handler) {
            this.eventDispatcher.subscribe(eventName, handler);
        };
        /**
         * Alias for "removeEventListener". If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified only that handler will be removed.
         *
         * @method off
         * @param eventName {string} Name of the event to listen for
         * @param [handler=undefined] {event=>void} Event handler for the thrown event
         */
        Class.prototype.off = function (eventName, handler) {
            this.eventDispatcher.unsubscribe(eventName, handler);
        };
        /**
         * You may wish to extend native Excalibur functionality. Any method on
         * actor may be extended to support additional functionaliy. In the
         * example below we create a new type called "MyActor"
         * <br/><b>Example</b><pre>var MyActor = Actor.extend({
     constructor : function(){
        this.newprop = 'something';
        Actor.apply(this, arguments);
     },
     update : function(engine, delta){
        // Implement custom update
  
           // Call super constructor update
           Actor.prototype.update.call(this, engine, delta);
           console.log("Something cool!");
     }
  });
  var myActor = new MyActor(100, 100, 100, 100, Color.Azure);</pre>
         * @method extend
         * @static
         * @param methods {any}
         */
        Class.extend = function (methods) {
            var parent = this;
            var child;
            if (methods && methods.hasOwnProperty('constructor')) {
                child = methods.constructor;
            }
            else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }
            // Using constructor allows JS to lazily instantiate super classes
            var Super = function () {
                this.constructor = child;
            };
            Super.prototype = parent.prototype;
            child.prototype = new Super;
            if (methods) {
                for (var prop in methods) {
                    if (methods.hasOwnProperty(prop)) {
                        child.prototype[prop] = methods[prop];
                    }
                }
            }
            // Make subclasses extendable
            child.extend = Class.extend;
            return child;
        };
        return Class;
    })();
    ex.Class = Class;
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Timer = (function () {
        /**
         * The Excalibur timer hooks into the internal timer and fires callbacks, after a certain interval, optionally repeating.
         *
         * @class Timer
         * @constructor
         * @param callback {callback} The callback to be fired after the interval is complete.
         * @param [repeats=false] {boolean} Indicates whether this call back should be fired only once, or repeat after every interval as completed.
         */
        function Timer(fcn, interval, repeats) {
            this.id = 0;
            this.interval = 10;
            this.fcn = function () {
            };
            this.repeats = false;
            this.elapsedTime = 0;
            this._totalTimeAlive = 0;
            this.complete = false;
            this.scene = null;
            this.id = Timer.id++;
            this.interval = interval || this.interval;
            this.fcn = fcn || this.fcn;
            this.repeats = repeats || this.repeats;
        }
        /**
         * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
         * @method update
         * @param delta {number} Number of elapsed milliseconds since the last update.
         */
        Timer.prototype.update = function (delta) {
            this._totalTimeAlive += delta;
            this.elapsedTime += delta;
            if (this.elapsedTime > this.interval) {
                this.fcn.call(this);
                if (this.repeats) {
                    this.elapsedTime = 0;
                }
                else {
                    this.complete = true;
                }
            }
        };
        Timer.prototype.getTimeRunning = function () {
            return this._totalTimeAlive;
        };
        /**
         * Cancels the timer, preventing any further executions.
         * @method cancel
         */
        Timer.prototype.cancel = function () {
            if (this.scene) {
                this.scene.cancelTimer(this);
            }
        };
        Timer.id = 0;
        return Timer;
    })();
    ex.Timer = Timer;
})(ex || (ex = {}));
/// <reference path="../Actor.ts"/>
/// <reference path="Side.ts"/>
/// <reference path="ICollisionResolver.ts"/> 
var ex;
(function (ex) {
    var NaiveCollisionResolver = (function () {
        function NaiveCollisionResolver() {
        }
        NaiveCollisionResolver.prototype.register = function (target) {
            // pass
        };
        NaiveCollisionResolver.prototype.remove = function (tartet) {
            // pass
        };
        NaiveCollisionResolver.prototype.evaluate = function (targets) {
            // Retrieve the list of potential colliders, exclude killed, prevented, and self
            var potentialColliders = targets.filter(function (other) {
                return !other.isKilled() && other.collisionType !== 0 /* PreventCollision */;
            });
            var actor1;
            var actor2;
            var collisionPairs = [];
            for (var j = 0, l = potentialColliders.length; j < l; j++) {
                actor1 = potentialColliders[j];
                for (var i = j + 1; i < l; i++) {
                    actor2 = potentialColliders[i];
                    var minimumTranslationVector;
                    if (minimumTranslationVector = actor1.collides(actor2)) {
                        var side = actor1.getSideFromIntersect(minimumTranslationVector);
                        var collisionPair = new ex.CollisionPair(actor1, actor2, minimumTranslationVector, side);
                        if (!collisionPairs.some(function (cp) {
                            return cp.equals(collisionPair);
                        })) {
                            collisionPairs.push(collisionPair);
                        }
                    }
                }
            }
            collisionPairs.forEach(function (p) { return p.evaluate(); });
            return collisionPairs;
        };
        NaiveCollisionResolver.prototype.update = function (targets) {
            return 0;
        };
        NaiveCollisionResolver.prototype.debugDraw = function (ctx, delta) {
        };
        return NaiveCollisionResolver;
    })();
    ex.NaiveCollisionResolver = NaiveCollisionResolver;
})(ex || (ex = {}));
/// <reference path="BoundingBox.ts"/>
var ex;
(function (ex) {
    var TreeNode = (function () {
        function TreeNode(parent) {
            this.parent = parent;
            this.parent = parent || null;
            this.actor = null;
            this.bounds = new ex.BoundingBox();
            this.left = null;
            this.right = null;
            this.height = 0;
        }
        TreeNode.prototype.isLeaf = function () {
            return (!this.left && !this.right);
        };
        return TreeNode;
    })();
    ex.TreeNode = TreeNode;
    var DynamicTree = (function () {
        function DynamicTree() {
            this.root = null;
            this.nodes = {};
        }
        DynamicTree.prototype.insert = function (leaf) {
            // If there are no nodes in the tree, make this the root leaf
            if (this.root === null) {
                this.root = leaf;
                this.root.parent = null;
                return;
            }
            // Search the tree for a node that is not a leaf and find the best place to insert
            var leafAABB = leaf.bounds;
            var currentRoot = this.root;
            while (!currentRoot.isLeaf()) {
                var left = currentRoot.left;
                var right = currentRoot.right;
                var area = currentRoot.bounds.getPerimeter();
                var combinedAABB = currentRoot.bounds.combine(leafAABB);
                var combinedArea = combinedAABB.getPerimeter();
                // Calculate cost heuristic for creating a new parent and leaf
                var cost = 2 * combinedArea;
                // Minimum cost of pushing the leaf down the tree
                var inheritanceCost = 2 * (combinedArea - area);
                // Cost of descending
                var leftCost = 0;
                var leftCombined = leafAABB.combine(left.bounds);
                var newArea;
                var oldArea;
                if (left.isLeaf()) {
                    leftCost = leftCombined.getPerimeter() + inheritanceCost;
                }
                else {
                    oldArea = left.bounds.getPerimeter();
                    newArea = leftCombined.getPerimeter();
                    leftCost = (newArea - oldArea) + inheritanceCost;
                }
                var rightCost = 0;
                var rightCombined = leafAABB.combine(right.bounds);
                if (right.isLeaf()) {
                    rightCost = rightCombined.getPerimeter() + inheritanceCost;
                }
                else {
                    oldArea = right.bounds.getPerimeter();
                    newArea = rightCombined.getPerimeter();
                    rightCost = (newArea - oldArea) + inheritanceCost;
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
            var oldParent = currentRoot.parent;
            var newParent = new TreeNode(oldParent);
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
            var currentNode = leaf.parent;
            while (currentNode) {
                currentNode = this.balance(currentNode);
                if (!currentNode.left) {
                    throw new Error("Parent of current leaf cannot have a null left child" + currentNode);
                }
                if (!currentNode.right) {
                    throw new Error("Parent of current leaf cannot have a null right child" + currentNode);
                }
                currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);
                currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
                currentNode = currentNode.parent;
            }
        };
        DynamicTree.prototype.remove = function (leaf) {
            if (leaf === this.root) {
                this.root = null;
                return;
            }
            var parent = leaf.parent;
            var grandParent = parent.parent;
            var sibling;
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
                var currentNode = grandParent;
                while (currentNode) {
                    currentNode = this.balance(currentNode);
                    currentNode.bounds = currentNode.left.bounds.combine(currentNode.right.bounds);
                    currentNode.height = 1 + Math.max(currentNode.left.height, currentNode.right.height);
                    currentNode = currentNode.parent;
                }
            }
            else {
                this.root = sibling;
                sibling.parent = null;
            }
        };
        DynamicTree.prototype.registerActor = function (actor) {
            var node = new TreeNode();
            node.actor = actor;
            node.bounds = actor.getBounds();
            node.bounds.left -= 2;
            node.bounds.top -= 2;
            node.bounds.right += 2;
            node.bounds.bottom += 2;
            this.nodes[actor.id] = node;
            this.insert(node);
        };
        DynamicTree.prototype.updateActor = function (actor) {
            var node = this.nodes[actor.id];
            if (!node)
                return;
            var b = actor.getBounds();
            if (node.bounds.contains(b)) {
                return false;
            }
            this.remove(node);
            b.left -= 5;
            b.top -= 5;
            b.right += 5;
            b.bottom += 5;
            var multdx = actor.dx * 2;
            var multdy = actor.dy * 2;
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
            node.bounds = b;
            this.insert(node);
            return true;
        };
        DynamicTree.prototype.removeActor = function (actor) {
            var node = this.nodes[actor.id];
            if (!node)
                return;
            this.remove(node);
            this.nodes[actor.id] = null;
            delete this.nodes[actor.id];
        };
        DynamicTree.prototype.balance = function (node) {
            if (node === null) {
                throw new Error("Cannot balance at null node");
            }
            if (node.isLeaf() || node.height < 2) {
                return node;
            }
            var left = node.left;
            var right = node.right;
            var a = node;
            var b = left;
            var c = right;
            var d = left.left;
            var e = left.right;
            var f = right.left;
            var g = right.right;
            var balance = c.height - b.height;
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
                        if (b.parent.right !== a)
                            throw "Error rotating Dynamic Tree";
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
        };
        DynamicTree.prototype.getHeight = function () {
            if (this.root === null) {
                return 0;
            }
            return this.root.height;
        };
        DynamicTree.prototype.query = function (actor, callback) {
            var bounds = actor.getBounds();
            var helper = function (currentNode) {
                if (currentNode && currentNode.bounds.collides(bounds)) {
                    if (currentNode.isLeaf() && currentNode.actor !== actor) {
                        if (callback.call(actor, currentNode.actor)) {
                            return true;
                        }
                    }
                    else {
                        return helper(currentNode.left) || helper(currentNode.right);
                    }
                }
                else {
                    return null;
                }
            };
            return helper(this.root);
        };
        DynamicTree.prototype.rayCast = function (ray, max) {
            // todo implement
            return null;
        };
        DynamicTree.prototype.getNodes = function () {
            var helper = function (currentNode) {
                if (currentNode) {
                    return [currentNode].concat(helper(currentNode.left), helper(currentNode.right));
                }
                else {
                    return [];
                }
            };
            return helper(this.root);
        };
        DynamicTree.prototype.debugDraw = function (ctx, delta) {
            // draw all the nodes in the Dynamic Tree
            var helper = function (currentNode) {
                if (currentNode) {
                    if (currentNode.isLeaf()) {
                        ctx.strokeStyle = 'green';
                    }
                    else {
                        ctx.strokeStyle = 'white';
                    }
                    currentNode.bounds.debugDraw(ctx);
                    if (currentNode.left)
                        helper(currentNode.left);
                    if (currentNode.right)
                        helper(currentNode.right);
                }
            };
            helper(this.root);
        };
        return DynamicTree;
    })();
    ex.DynamicTree = DynamicTree;
})(ex || (ex = {}));
/// <reference path="ICollisionResolver.ts"/>
/// <reference path="DynamicTree.ts"/>
var ex;
(function (ex) {
    var DynamicTreeCollisionResolver = (function () {
        function DynamicTreeCollisionResolver() {
            this._dynamicCollisionTree = new ex.DynamicTree();
        }
        DynamicTreeCollisionResolver.prototype.register = function (target) {
            this._dynamicCollisionTree.registerActor(target);
        };
        DynamicTreeCollisionResolver.prototype.remove = function (target) {
            this._dynamicCollisionTree.removeActor(target);
        };
        DynamicTreeCollisionResolver.prototype.evaluate = function (targets) {
            // Retrieve the list of potential colliders, exclude killed, prevented, and self
            var potentialColliders = targets.filter(function (other) {
                return !other.isKilled() && other.collisionType !== 0 /* PreventCollision */;
            });
            var actor;
            var collisionPairs = [];
            for (var j = 0, l = potentialColliders.length; j < l; j++) {
                actor = potentialColliders[j];
                this._dynamicCollisionTree.query(actor, function (other) {
                    if (other.collisionType === 0 /* PreventCollision */ || other.isKilled())
                        return false;
                    var minimumTranslationVector;
                    if (minimumTranslationVector = actor.collides(other)) {
                        var side = actor.getSideFromIntersect(minimumTranslationVector);
                        var collisionPair = new ex.CollisionPair(actor, other, minimumTranslationVector, side);
                        if (!collisionPairs.some(function (cp) {
                            return cp.equals(collisionPair);
                        })) {
                            collisionPairs.push(collisionPair);
                        }
                        return true;
                    }
                    return false;
                });
            }
            collisionPairs.forEach(function (p) { return p.evaluate(); });
            return collisionPairs;
        };
        DynamicTreeCollisionResolver.prototype.update = function (targets) {
            var _this = this;
            var updated = 0;
            targets.forEach(function (a) {
                if (_this._dynamicCollisionTree.updateActor(a)) {
                    updated++;
                }
            });
            return updated;
        };
        DynamicTreeCollisionResolver.prototype.debugDraw = function (ctx, delta) {
            this._dynamicCollisionTree.debugDraw(ctx, delta);
        };
        return DynamicTreeCollisionResolver;
    })();
    ex.DynamicTreeCollisionResolver = DynamicTreeCollisionResolver;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Collision pairs are used internally by Excalibur to resolve collision between actors. The
     * Pair prevents collisions from being evaluated more than one time
     * @class CollisionPair
     * @constructor
     * @param left {Actor} The first actor in the collision pair
     * @param right {Actor} The second actor in the collision pair
     * @param intersect {Vector} The minimum translation vector to separate the actors from the perspective of the left actor
     * @param side {Side} The side on which the collision occured from the perspective of the left actor
     */
    var CollisionPair = (function () {
        function CollisionPair(left, right, intersect, side) {
            this.left = left;
            this.right = right;
            this.intersect = intersect;
            this.side = side;
        }
        /**
         * Determines if this collision pair and another are equivalent.
         * @method equals
         * @param collisionPair {CollisionPair}
         * @returns boolean
         */
        CollisionPair.prototype.equals = function (collisionPair) {
            return (collisionPair.left === this.left && collisionPair.right === this.right) || (collisionPair.right === this.left && collisionPair.left === this.right);
        };
        /**
         * Evaluates the collision pair, performing collision resolution and event publishing appropriate to each collision type.
         * @method evaluate
         */
        CollisionPair.prototype.evaluate = function () {
            // todo fire collision events on left and right actor
            // todo resolve collisions                  
            // Publish collision events on both participants
            this.left.eventDispatcher.publish('collision', new ex.CollisionEvent(this.left, this.right, this.side, this.intersect));
            this.right.eventDispatcher.publish('collision', new ex.CollisionEvent(this.right, this.left, ex.Util.getOppositeSide(this.side), this.intersect.scale(-1.0)));
            // If the actor is active push the actor out if its not passive
            var leftSide = this.side;
            if ((this.left.collisionType === 2 /* Active */ || this.left.collisionType === 3 /* Elastic */) && this.right.collisionType !== 1 /* Passive */) {
                this.left.y += this.intersect.y;
                this.left.x += this.intersect.x;
                // Naive elastic bounce
                if (this.left.collisionType === 3 /* Elastic */) {
                    if (leftSide === 3 /* Left */) {
                        this.left.dx = Math.abs(this.left.dx);
                    }
                    else if (leftSide === 4 /* Right */) {
                        this.left.dx = -Math.abs(this.left.dx);
                    }
                    else if (leftSide === 1 /* Top */) {
                        this.left.dy = Math.abs(this.left.dy);
                    }
                    else if (leftSide === 2 /* Bottom */) {
                        this.left.dy = -Math.abs(this.left.dy);
                    }
                }
            }
            var rightSide = ex.Util.getOppositeSide(this.side);
            var rightIntersect = this.intersect.scale(-1.0);
            if ((this.right.collisionType === 2 /* Active */ || this.right.collisionType === 3 /* Elastic */) && this.left.collisionType !== 1 /* Passive */) {
                this.right.y += rightIntersect.y;
                this.right.x += rightIntersect.x;
                // Naive elastic bounce
                if (this.right.collisionType === 3 /* Elastic */) {
                    if (rightSide === 3 /* Left */) {
                        this.right.dx = Math.abs(this.right.dx);
                    }
                    else if (rightSide === 4 /* Right */) {
                        this.right.dx = -Math.abs(this.right.dx);
                    }
                    else if (rightSide === 1 /* Top */) {
                        this.right.dy = Math.abs(this.right.dy);
                    }
                    else if (rightSide === 2 /* Bottom */) {
                        this.right.dy = -Math.abs(this.right.dy);
                    }
                }
            }
        };
        return CollisionPair;
    })();
    ex.CollisionPair = CollisionPair;
})(ex || (ex = {}));
/// <reference path="Engine.ts" />
/// <reference path="Algebra.ts" />
var ex;
(function (ex) {
    /**
    * A base implementation of a camera. This class is meant to be extended.
    * @class Camera
    * @constructor
    * @param engine {Engine} Reference to the current engine
    */
    var BaseCamera = (function () {
        function BaseCamera() {
            this.focus = new ex.Point(0, 0);
            this.lerp = false;
            this._cameraMoving = false;
            this._currentLerpTime = 0;
            this._lerpDuration = 1 * 1000; // 5 seconds
            this._totalLerpTime = 0;
            this._lerpStart = null;
            this._lerpEnd = null;
            //camera effects
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
        }
        BaseCamera.prototype.easeInOutCubic = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration / 2;
            if (currentTime < 1)
                return endValue / 2 * currentTime * currentTime * currentTime + startValue;
            currentTime -= 2;
            return endValue / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
        };
        /**
        * Sets the {{#crossLink Actor}}{{/crossLink}} to follow with the camera
        * @method setActorToFollow
        * @param actor {Actor} The actor to follow
        */
        BaseCamera.prototype.setActorToFollow = function (actor) {
            this.follow = actor;
        };
        /**
        * Returns the focal point of the camera
        * @method getFocus
        * @returns Point
        */
        BaseCamera.prototype.getFocus = function () {
            return this.focus;
        };
        /**
        * Sets the focal point of the camera. This value can only be set if there is no actor to be followed.
        * @method setFocus
        * @param x {number} The x coordinate of the focal point
        * @param y {number} The y coordinate of the focal point
        */
        BaseCamera.prototype.setFocus = function (x, y) {
            if (!this.follow && !this.lerp) {
                this.focus.x = x;
                this.focus.y = y;
            }
            if (this.lerp) {
                this._lerpStart = this.focus.clone();
                this._lerpEnd = new ex.Point(x, y);
                this._currentLerpTime = 0;
                this._cameraMoving = true;
            }
        };
        /**
        * Sets the camera to shake at the specified magnitudes for the specified duration
        * @method shake
        * @param magnitudeX {number} the x magnitude of the shake
        * @param magnitudeY {number} the y magnitude of the shake
        * @param duration {number} the duration of the shake
        */
        BaseCamera.prototype.shake = function (magnitudeX, magnitudeY, duration) {
            this.isShaking = true;
            this.shakeMagnitudeX = magnitudeX;
            this.shakeMagnitudeY = magnitudeY;
            this.shakeDuration = duration;
        };
        /**
        * Zooms the camera in or out by the specified scale over the specified duration.
        * If no duration is specified, it will zoom by a set amount until the scale is reached.
        * @method zoom
        * @param scale {number} the scale of the zoom
        * @param [duration] {number} the duration of the zoom
        */
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
                }
                else {
                    this.isZooming = false;
                    this.setCurrentZoomScale(this.maxZoomScale);
                }
            }
            else {
                if (!duration) {
                    this.isZooming = false;
                    this.setCurrentZoomScale(this.maxZoomScale);
                }
            }
            // console.log("zoom increment: " + this.zoomIncrement);
        };
        /**
        * gets the current zoom scale
        * @method getZoom
        * @returns {Number} the current zoom scale
        */
        BaseCamera.prototype.getZoom = function () {
            return this.currentZoomScale;
        };
        BaseCamera.prototype.setCurrentZoomScale = function (zoomScale) {
            this.currentZoomScale = zoomScale;
        };
        /**
        * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
        * @method update
        * @param delta {number} The number of milliseconds since the last update
        */
        BaseCamera.prototype.update = function (ctx, delta) {
            var focus = this.getFocus();
            var xShake = 0;
            var yShake = 0;
            var canvasWidth = ctx.canvas.width;
            var canvasHeight = ctx.canvas.height;
            var newCanvasWidth = canvasWidth * this.getZoom();
            var newCanvasHeight = canvasHeight * this.getZoom();
            if (this.lerp) {
                if (this._currentLerpTime < this._lerpDuration && this._cameraMoving) {
                    if (this._lerpEnd.x < this._lerpStart.x) {
                        this.focus.x = this._lerpStart.x - (this.easeInOutCubic(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
                    }
                    else {
                        this.focus.x = this.easeInOutCubic(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
                    }
                    if (this._lerpEnd.y < this._lerpStart.y) {
                        this.focus.y = this._lerpStart.y - (this.easeInOutCubic(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
                    }
                    else {
                        this.focus.y = this.easeInOutCubic(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
                    }
                    this._currentLerpTime += delta;
                }
                else {
                    this._lerpStart = null;
                    this._lerpEnd = null;
                    this._currentLerpTime = 0;
                    this._cameraMoving = false;
                }
            }
            if (this.isDoneShaking()) {
                this.isShaking = false;
                this.elapsedShakeTime = 0;
                this.shakeMagnitudeX = 0;
                this.shakeMagnitudeY = 0;
                this.shakeDuration = 0;
            }
            else {
                this.elapsedShakeTime += delta;
                xShake = (Math.random() * this.shakeMagnitudeX | 0) + 1;
                yShake = (Math.random() * this.shakeMagnitudeY | 0) + 1;
            }
            ctx.translate(-focus.x + xShake + (newCanvasWidth / 2), -focus.y + yShake + (newCanvasHeight / 2));
            if (this.isDoneZooming()) {
                this.isZooming = false;
                this.elapsedZoomTime = 0;
                this.zoomDuration = 0;
                this.setCurrentZoomScale(this.maxZoomScale);
            }
            else {
                this.elapsedZoomTime += delta;
                this.setCurrentZoomScale(this.getZoom() + this.zoomIncrement * delta / 1000);
            }
            ctx.scale(this.getZoom(), this.getZoom());
        };
        BaseCamera.prototype.debugDraw = function (ctx) {
            var focus = this.getFocus();
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(focus.x, focus.y, 15, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        };
        BaseCamera.prototype.isDoneShaking = function () {
            return !(this.isShaking) || (this.elapsedShakeTime >= this.shakeDuration);
        };
        BaseCamera.prototype.isDoneZooming = function () {
            if (this.zoomDuration != 0) {
                return (this.elapsedZoomTime >= this.zoomDuration);
            }
            else {
                if (this.maxZoomScale < 1) {
                    return (this.currentZoomScale <= this.maxZoomScale);
                }
                else {
                    return (this.currentZoomScale >= this.maxZoomScale);
                }
            }
        };
        return BaseCamera;
    })();
    ex.BaseCamera = BaseCamera;
    /**
    * An extension of BaseCamera that is locked vertically; it will only move side to side.
    * @class SideCamera
    * @extends BaseCamera
    * @constructor
    * @param engine {Engine} Reference to the current engine
    */
    var SideCamera = (function (_super) {
        __extends(SideCamera, _super);
        function SideCamera() {
            _super.apply(this, arguments);
        }
        SideCamera.prototype.getFocus = function () {
            if (this.follow) {
                return new ex.Point(this.follow.x + this.follow.getWidth() / 2, this.focus.y);
            }
            else {
                return this.focus;
            }
        };
        return SideCamera;
    })(BaseCamera);
    ex.SideCamera = SideCamera;
    /**
    * An extension of BaseCamera that is locked to an actor or focal point; the actor will appear in the center of the screen.
    * @class TopCamera
    * @extends BaseCamera
    * @constructor
    * @param engine {Engine} Reference to the current engine
    */
    var TopCamera = (function (_super) {
        __extends(TopCamera, _super);
        function TopCamera() {
            _super.apply(this, arguments);
        }
        TopCamera.prototype.getFocus = function () {
            if (this.follow) {
                return new ex.Point(this.follow.x + this.follow.getWidth() / 2, this.follow.y + this.follow.getHeight() / 2);
            }
            else {
                return this.focus;
            }
        };
        return TopCamera;
    })(BaseCamera);
    ex.TopCamera = TopCamera;
})(ex || (ex = {}));
/// <reference path="Class.ts" />
/// <reference path="Timer.ts" />
/// <reference path="Collision/NaiveCollisionResolver.ts"/>
/// <reference path="Collision/DynamicTreeCollisionResolver.ts"/>
/// <reference path="CollisionPair.ts" />
/// <reference path="Camera.ts" />
var ex;
(function (ex) {
    /**
     * Actors are composed together into groupings called Scenes in
     * Excalibur. The metaphor models the same idea behind real world
     * actors in a scene. Only actors in scenes will be updated and drawn.
     * @class Scene
     * @constructor
     */
    var Scene = (function (_super) {
        __extends(Scene, _super);
        function Scene(engine) {
            _super.call(this);
            /**
             * The actors in the current scene
             * @property children {Actor[]}
             */
            this.children = [];
            this.tileMaps = [];
            this.uiActors = [];
            this._collisionResolver = new ex.DynamicTreeCollisionResolver();
            this._killQueue = [];
            this._timers = [];
            this._cancelQueue = [];
            this._isInitialized = false;
            this.camera = new ex.BaseCamera();
            if (engine) {
                this.camera.setFocus(engine.width / 2, engine.height / 2);
            }
        }
        /**
         * This is called when the scene is made active and started. It is meant to be overriden,
         * this is where you should setup any DOM UI or event handlers needed for the scene.
         * @method onActivate
         */
        Scene.prototype.onActivate = function () {
            // will be overridden
        };
        /**
         * This is called when the scene is made transitioned away from and stopped. It is meant to be overriden,
         * this is where you should cleanup any DOM UI or event handlers needed for the scene.
         * @method onDeactivate
         */
        Scene.prototype.onDeactivate = function () {
            // will be overridden
        };
        /**
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         * @method onInitialize
         * @param engine {Engine}
         */
        Scene.prototype.onInitialize = function (engine) {
            // will be overridden
        };
        /**
         * Publish an event to all actors in the scene
         * @method publish
         * @param eventType {string} The name of the event to publish
         * @param event {GameEvent} The event object to send
         */
        Scene.prototype.publish = function (eventType, event) {
            this.children.forEach(function (actor) {
                actor.triggerEvent(eventType, event);
            });
        };
        /**
         * Updates all the actors and timers in the Scene. Called by the Engine.
         * @method update
         * @param engine {Engine} Reference to the current Engine
         * @param delta {number} The number of milliseconds since the last update
         */
        Scene.prototype.update = function (engine, delta) {
            if (!this._isInitialized) {
                this.onInitialize(engine);
                this.eventDispatcher.publish('initialize', new ex.InitializeEvent(engine));
                this._isInitialized = true;
            }
            this.uiActors.forEach(function (ui) {
                ui.update(engine, delta);
            });
            this.tileMaps.forEach(function (cm) {
                cm.update(engine, delta);
            });
            var len = 0;
            for (var i = 0, len = this.children.length; i < len; i++) {
                this.children[i].update(engine, delta);
            }
            // Run collision resolution strategy
            if (this._collisionResolver) {
                this._collisionResolver.update(this.children);
                this._collisionResolver.evaluate(this.children);
            }
            // Remove actors from scene graph after being killed
            var actorIndex = 0;
            for (var i = 0, len = this._killQueue.length; i < len; i++) {
                actorIndex = this.children.indexOf(this._killQueue[i]);
                if (actorIndex > -1) {
                    this.children.splice(actorIndex, 1);
                }
            }
            this._killQueue.length = 0;
            // Remove timers in the cancel queue before updating them
            var timerIndex = 0;
            for (var i = 0, len = this._cancelQueue.length; i < len; i++) {
                this.removeTimer(this._cancelQueue[i]);
            }
            this._cancelQueue.length = 0;
            // Cycle through timers updating timers
            var that = this;
            this._timers = this._timers.filter(function (timer) {
                timer.update(delta);
                return !timer.complete;
            });
        };
        /**
         * Draws all the actors in the Scene. Called by the Engine.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The current rendering context
         * @param delta {number} The number of milliseconds since the last draw
         */
        Scene.prototype.draw = function (ctx, delta) {
            ctx.save();
            if (this.camera) {
                this.camera.update(ctx, delta);
            }
            this.tileMaps.forEach(function (cm) {
                cm.draw(ctx, delta);
            });
            var len = 0;
            var start = 0;
            var end = 0;
            var actor;
            for (var i = 0, len = this.children.length; i < len; i++) {
                actor = this.children[i];
                // only draw actors that are visible
                if (actor.visible) {
                    this.children[i].draw(ctx, delta);
                }
            }
            if (this.engine && this.engine.isDebug) {
                ctx.strokeStyle = 'yellow';
                this.debugDraw(ctx);
            }
            ctx.restore();
            this.uiActors.forEach(function (ui) {
                if (ui.visible) {
                    ui.draw(ctx, delta);
                }
            });
            if (this.engine && this.engine.isDebug) {
                this.uiActors.forEach(function (ui) {
                    ui.debugDraw(ctx);
                });
            }
        };
        /**
         * Draws all the actors' debug information in the Scene. Called by the Engine.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The current rendering context
         */
        Scene.prototype.debugDraw = function (ctx) {
            this.tileMaps.forEach(function (map) {
                map.debugDraw(ctx);
            });
            this.children.forEach(function (actor) {
                actor.debugDraw(ctx);
            });
            // todo possibly enable this with excalibur flags features?
            //this._collisionResolver.debugDraw(ctx, 20);
            //this.camera.debugDraw(ctx);
        };
        Scene.prototype.add = function (entity) {
            if (entity instanceof ex.UIActor) {
                this.addUIActor(entity);
                return;
            }
            if (entity instanceof ex.Actor) {
                this.addChild(entity);
            }
            if (entity instanceof ex.Timer) {
                this.addTimer(entity);
            }
            if (entity instanceof ex.TileMap) {
                this.addTileMap(entity);
            }
        };
        Scene.prototype.remove = function (entity) {
            if (entity instanceof ex.UIActor) {
                this.removeUIActor(entity);
                return;
            }
            if (entity instanceof ex.Actor) {
                this._collisionResolver.remove(entity);
                this.removeChild(entity);
            }
            if (entity instanceof ex.Timer) {
                this.removeTimer(entity);
            }
            if (entity instanceof ex.TileMap) {
                this.removeTileMap(entity);
            }
        };
        /**
         * Adds an actor to act as a piece of UI, meaning it is always positioned
         * in screen coordinates. UI actors do not participate in collisions
         * @method addUIActor
         * @param actor {Actor}
         */
        Scene.prototype.addUIActor = function (actor) {
            this.uiActors.push(actor);
        };
        /**
         * Removes an actor as a piec of UI
         * @method removeUIActor
         * @param actor {Actor}
         */
        Scene.prototype.removeUIActor = function (actor) {
            var index = this.uiActors.indexOf(actor);
            if (index > -1) {
                this.uiActors.splice(index, 1);
            }
        };
        /**
         * Adds an actor to the Scene, once this is done the actor will be drawn and updated.
         * @method addChild
         * @param actor {Actor}
         */
        Scene.prototype.addChild = function (actor) {
            this._collisionResolver.register(actor);
            actor.scene = this;
            this.children.push(actor);
            actor.parent = this.actor;
        };
        /**
         * Adds a TileMap to the Scene, once this is done the TileMap will be drawn and updated.
         * @method addTileMap
         * @param tileMap {TileMap}
         */
        Scene.prototype.addTileMap = function (tileMap) {
            this.tileMaps.push(tileMap);
        };
        /**
         * Removes a TileMap from the Scene, it willno longer be drawn or updated.
         * @method removeTileMap
         * @param tileMap {TileMap}
         */
        Scene.prototype.removeTileMap = function (tileMap) {
            var index = this.tileMaps.indexOf(tileMap);
            if (index > -1) {
                this.tileMaps.splice(index, 1);
            }
        };
        /**
         * Removes an actor from the Scene, it will no longer be drawn or updated.
         * @method removeChild
         * @param actor {Actor} The actor to remove
         */
        Scene.prototype.removeChild = function (actor) {
            this._collisionResolver.remove(actor);
            this._killQueue.push(actor);
            actor.parent = null;
        };
        /**
         * Adds a timer to the Scene
         * @method addTimer
         * @param timer {Timer} The timer to add
         * @returns Timer
         */
        Scene.prototype.addTimer = function (timer) {
            this._timers.push(timer);
            timer.scene = this;
            return timer;
        };
        /**
         * Removes a timer to the Scene, can be dangerous
         * @method removeTimer
         * @private
         * @param timer {Timer} The timer to remove
         * @returns Timer
         */
        Scene.prototype.removeTimer = function (timer) {
            var i = this._timers.indexOf(timer);
            if (i !== -1) {
                this._timers.splice(i, 1);
            }
            return timer;
        };
        /**
         * Cancels a timer, removing it from the scene nicely
         * @method cancelTimer
         * @param timer {Timer} The timer to cancel
         * @returns Timer
         */
        Scene.prototype.cancelTimer = function (timer) {
            this._cancelQueue.push(timer);
            return timer;
        };
        /**
         * Tests whether a timer is active in the scene
         * @method isTimerActive
         * @param timer {Timer}
         * @returns boolean
         */
        Scene.prototype.isTimerActive = function (timer) {
            return (this._timers.indexOf(timer) > -1);
        };
        return Scene;
    })(ex.Class);
    ex.Scene = Scene;
})(ex || (ex = {}));
/// <reference path="Algebra.ts" />
/// <reference path="Engine.ts" />
/// <reference path="Actor.ts" />
var ex;
(function (ex) {
    var Internal;
    (function (Internal) {
        var Actions;
        (function (Actions) {
            var EaseTo = (function () {
                function EaseTo(actor, x, y, duration, easingFcn) {
                    this.actor = actor;
                    this.easingFcn = easingFcn;
                    this._currentLerpTime = 0;
                    this._lerpDuration = 1 * 1000; // 5 seconds
                    this._lerpStart = new ex.Point(0, 0);
                    this._lerpEnd = new ex.Point(0, 0);
                    this._initialized = false;
                    this._stopped = false;
                    this._distance = 0;
                    this._lerpDuration = duration;
                    this._lerpEnd = new ex.Point(x, y);
                }
                EaseTo.prototype._initialize = function () {
                    this._lerpStart = new ex.Point(this.actor.x, this.actor.y);
                    this._currentLerpTime = 0;
                    this._distance = this._lerpStart.toVector().distance(this._lerpEnd.toVector());
                };
                EaseTo.prototype.update = function (delta) {
                    if (!this._initialized) {
                        this._initialize();
                        this._initialized = true;
                    }
                    var newX = this.actor.x;
                    var newY = this.actor.y;
                    if (this._currentLerpTime < this._lerpDuration) {
                        if (this._lerpEnd.x < this._lerpStart.x) {
                            newX = this._lerpStart.x - (this.easingFcn(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
                        }
                        else {
                            newX = this.easingFcn(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
                        }
                        if (this._lerpEnd.y < this._lerpStart.y) {
                            newY = this._lerpStart.y - (this.easingFcn(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
                        }
                        else {
                            newY = this.easingFcn(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
                        }
                        this.actor.x = newX;
                        this.actor.y = newY;
                        this._currentLerpTime += delta;
                    }
                    else {
                        this.actor.x = this._lerpEnd.x;
                        this.actor.y = this._lerpEnd.y;
                    }
                };
                EaseTo.prototype.isComplete = function (actor) {
                    return this._stopped || (new ex.Vector(actor.x, actor.y)).distance(this._lerpStart.toVector()) >= this._distance;
                };
                EaseTo.prototype.reset = function () {
                    this._initialized = false;
                };
                EaseTo.prototype.stop = function () {
                    this._stopped = true;
                };
                return EaseTo;
            })();
            Actions.EaseTo = EaseTo;
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
                    //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
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
                    //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
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
                    }
                    else {
                        this.actor.dx = 0;
                        this.actor.dy = 0;
                    }
                    if (this.isComplete(this.actor)) {
                        // TODO this should never occur
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
                    // the actor following should never stop unless specified to do so
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
                        // console.log("meeting is complete")
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
                    //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
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
                    //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
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
                function ScaleTo(actor, scaleX, scaleY, speedX, speedY) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.endX = scaleX;
                    this.endY = scaleY;
                    this.speedX = speedX;
                    this.speedY = speedY;
                }
                ScaleTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.startX = this.actor.scale.x;
                        this.startY = this.actor.scale.y;
                        this.distanceX = Math.abs(this.endX - this.startX);
                        this.distanceY = Math.abs(this.endY - this.startY);
                    }
                    if (!(Math.abs(this.actor.scale.x - this.startX) >= this.distanceX)) {
                        var directionX = this.endY < this.startY ? -1 : 1;
                        this.actor.sx = this.speedX * directionX;
                    }
                    else {
                        this.actor.sx = 0;
                    }
                    if (!(Math.abs(this.actor.scale.y - this.startY) >= this.distanceY)) {
                        var directionY = this.endY < this.startY ? -1 : 1;
                        this.actor.sy = this.speedY * directionY;
                    }
                    else {
                        this.actor.sy = 0;
                    }
                    //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
                    if (this.isComplete(this.actor)) {
                        this.actor.scale.x = this.endX;
                        this.actor.scale.y = this.endY;
                        this.actor.sx = 0;
                        this.actor.sy = 0;
                    }
                };
                ScaleTo.prototype.isComplete = function (actor) {
                    return this._stopped || ((Math.abs(this.actor.scale.y - this.startX) >= this.distanceX) && (Math.abs(this.actor.scale.y - this.startY) >= this.distanceY));
                };
                ScaleTo.prototype.stop = function () {
                    this.actor.sx = 0;
                    this.actor.sy = 0;
                    this._stopped = true;
                };
                ScaleTo.prototype.reset = function () {
                    this._started = false;
                };
                return ScaleTo;
            })();
            Actions.ScaleTo = ScaleTo;
            var ScaleBy = (function () {
                function ScaleBy(actor, scaleX, scaleY, time) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                    this.endX = scaleX;
                    this.endY = scaleY;
                    this.time = time;
                    this.speedX = (this.endX - this.actor.scale.x) / time * 1000;
                    this.speedY = (this.endY - this.actor.scale.y) / time * 1000;
                }
                ScaleBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.startX = this.actor.scale.x;
                        this.startY = this.actor.scale.y;
                        this.distanceX = Math.abs(this.endX - this.startX);
                        this.distanceY = Math.abs(this.endY - this.startY);
                    }
                    var directionX = this.endX < this.startX ? -1 : 1;
                    var directionY = this.endY < this.startY ? -1 : 1;
                    this.actor.sx = this.speedX * directionX;
                    this.actor.sy = this.speedY * directionY;
                    //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
                    if (this.isComplete(this.actor)) {
                        this.actor.scale.x = this.endX;
                        this.actor.scale.y = this.endY;
                        this.actor.sx = 0;
                        this.actor.sy = 0;
                    }
                };
                ScaleBy.prototype.isComplete = function (actor) {
                    return this._stopped || ((Math.abs(this.actor.scale.x - this.startX) >= this.distanceX) && (Math.abs(this.actor.scale.y - this.startY) >= this.distanceY));
                };
                ScaleBy.prototype.stop = function () {
                    this.actor.sx = 0;
                    this.actor.sy = 0;
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
                function Blink(actor, timeVisible, timeNotVisible, numBlinks) {
                    if (numBlinks === void 0) { numBlinks = 1; }
                    this.timeVisible = 0;
                    this.timeNotVisible = 0;
                    this.elapsedTime = 0;
                    this.totalTime = 0;
                    this._stopped = false;
                    this._started = false;
                    this.actor = actor;
                    this.timeVisible = timeVisible;
                    this.timeNotVisible = timeNotVisible;
                    this.duration = (timeVisible + timeNotVisible) * numBlinks;
                }
                Blink.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                    }
                    this.elapsedTime += delta;
                    this.totalTime += delta;
                    if (this.actor.visible && this.elapsedTime >= this.timeVisible) {
                        this.actor.visible = false;
                        this.elapsedTime = 0;
                    }
                    if (!this.actor.visible && this.elapsedTime >= this.timeNotVisible) {
                        this.actor.visible = true;
                        this.elapsedTime = 0;
                    }
                    if (this.isComplete(this.actor)) {
                        this.actor.visible = true;
                    }
                };
                Blink.prototype.isComplete = function (actor) {
                    return this._stopped || (this.totalTime >= this.duration);
                };
                Blink.prototype.stop = function () {
                    this.actor.visible = true;
                    this._stopped = true;
                };
                Blink.prototype.reset = function () {
                    this._started = false;
                    this.elapsedTime = 0;
                    this.totalTime = 0;
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
                    return this._stopped || (Math.abs(this.actor.opacity - this.endOpacity) < 0.05);
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
            var Die = (function () {
                function Die(actor) {
                    this._started = false;
                    this._stopped = false;
                    this.actor = actor;
                }
                Die.prototype.update = function (delta) {
                    this.actor.actionQueue.clearActions();
                    this.actor.kill();
                    this._stopped = true;
                };
                Die.prototype.isComplete = function () {
                    return this._stopped;
                };
                Die.prototype.stop = function () {
                };
                Die.prototype.reset = function () {
                };
                return Die;
            })();
            Actions.Die = Die;
            var CallMethod = (function () {
                function CallMethod(actor, method) {
                    this._method = null;
                    this._actor = null;
                    this._hasBeenCalled = false;
                    this._actor = actor;
                    this._method = method;
                }
                CallMethod.prototype.update = function (delta) {
                    this._method.call(this._actor);
                    this._hasBeenCalled = true;
                };
                CallMethod.prototype.isComplete = function (actor) {
                    return this._hasBeenCalled;
                };
                CallMethod.prototype.reset = function () {
                    this._hasBeenCalled = false;
                };
                CallMethod.prototype.stop = function () {
                    this._hasBeenCalled = true;
                };
                return CallMethod;
            })();
            Actions.CallMethod = CallMethod;
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
                            //Logger.getInstance().log("Action complete!", Log.DEBUG);
                            this._completedActions.push(this._actions.shift());
                        }
                    }
                };
                return ActionQueue;
            })();
            Actions.ActionQueue = ActionQueue;
        })(Actions = Internal.Actions || (Internal.Actions = {}));
    })(Internal = ex.Internal || (ex.Internal = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var EasingFunctions = (function () {
        function EasingFunctions() {
        }
        /*
       easeInQuad: function (t) { return t * t },
       // decelerating to zero velocity
       easeOutQuad: function (t) { return t * (2 - t) },
       // acceleration until halfway, then deceleration
       easeInOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
       // accelerating from zero velocity
       easeInCubic: function (t) { return t * t * t },
       // decelerating to zero velocity
       easeOutCubic: function (t) { return (--t) * t * t + 1 },
       // acceleration until halfway, then deceleration
       easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
       // accelerating from zero velocity
       easeInQuart: function (t) { return t * t * t * t },
       // decelerating to zero velocity
       easeOutQuart: function (t) { return 1 - (--t) * t * t * t },
       // acceleration until halfway, then deceleration
       easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
       // accelerating from zero velocity
       easeInQuint: function (t) { return t * t * t * t * t },
       // decelerating to zero velocity
       easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t },
       // acceleration until halfway, then deceleration
       easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
        */
        EasingFunctions.Linear = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            return endValue * currentTime / duration + startValue;
        };
        EasingFunctions.EaseInQuad = function (currentTime, startValue, endValue, duration) {
            //endValue = (endValue - startValue);
            currentTime /= duration;
            return endValue * currentTime * currentTime + startValue;
        };
        EasingFunctions.EaseOutQuad = function (currentTime, startValue, endValue, duration) {
            //endValue = (endValue - startValue);
            currentTime /= duration;
            return -endValue * currentTime * (currentTime - 2) + startValue;
        };
        EasingFunctions.EaseInOutQuad = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration / 2;
            if (currentTime < 1)
                return endValue / 2 * currentTime * currentTime + startValue;
            currentTime--;
            return -endValue / 2 * (currentTime * (currentTime - 2) - 1) + startValue;
        };
        EasingFunctions.EaseInCubic = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration;
            return endValue * currentTime * currentTime * currentTime + startValue;
        };
        EasingFunctions.EaseOutCubic = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration;
            return endValue * (currentTime * currentTime * currentTime + 1) + startValue;
        };
        EasingFunctions.EaseInOutCubic = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration / 2;
            if (currentTime < 1)
                return endValue / 2 * currentTime * currentTime * currentTime + startValue;
            currentTime -= 2;
            return endValue / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
        };
        return EasingFunctions;
    })();
    ex.EasingFunctions = EasingFunctions;
})(ex || (ex = {}));
/// <reference path="Interfaces/IDrawable.ts" />
/// <reference path="Modules/MovementModule.ts" />
/// <reference path="Modules/OffscreenCullingModule.ts" />
/// <reference path="Modules/CapturePointerModule.ts" />
/// <reference path="Modules/CollisionDetectionModule.ts" />
/// <reference path="Collision/Side.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="Collision/BoundingBox.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Action.ts" />
/// <reference path="EasingFunctions.ts"/>
var ex;
(function (ex) {
    /**
     * An enum that describes the types of collisions actors can participate in
     * @class CollisionType
     */
    (function (CollisionType) {
        /**
         * Actors with the PreventCollision setting do not participate in any
         * collisions and do not raise collision events.
         * @property PreventCollision {CollisionType}
         * @static
         */
        CollisionType[CollisionType["PreventCollision"] = 0] = "PreventCollision";
        /**
         * Actors with the Passive setting only raise collision events, but are not
         * influenced or moved by other actors and do not influence or move other actors.
         * @property Passive {CollisionType}
         * @static
         */
        CollisionType[CollisionType["Passive"] = 1] = "Passive";
        /**
         * Actors with the Active setting raise collision events and participate
         * in collisions with other actors and will be push or moved by actors sharing
         * the Active or Fixed setting.
         * @property Active {CollisionType}
         * @static
         */
        CollisionType[CollisionType["Active"] = 2] = "Active";
        /**
         * Actors with the Elastic setting will behave the same as Active, except that they will
         * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
         * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
         * @property Elastic {CollisionType}
         * @static
         */
        CollisionType[CollisionType["Elastic"] = 3] = "Elastic";
        /**
         * Actors with the Fixed setting raise collision events and participate in
         * collisions with other actors. Actors with the Fixed setting will not be
         * pushed or moved by other actors sharing the Fixed or Actors. Think of Fixed
         * actors as "immovable/onstoppable" objects. If two Fixed actors meet they will
         * not be pushed or moved by each other, they will not interact except to throw
         * collision events.
         * @property Fixed {CollisionType}
         * @static
         */
        CollisionType[CollisionType["Fixed"] = 4] = "Fixed";
    })(ex.CollisionType || (ex.CollisionType = {}));
    var CollisionType = ex.CollisionType;
    /**
     * The most important primitive in Excalibur is an "Actor." Anything that
     * can move on the screen, collide with another Actor, respond to events,
     * or interact with the current scene, must be an actor. An Actor <b>must</b>
     * be part of a {{#crossLink "Scene"}}{{/crossLink}} for it to be drawn to the screen.
     * @class Actor
     * @extends Class
     * @constructor
     * @param [x=0.0] {number} The starting x coordinate of the actor
     * @param [y=0.0] {number} The starting y coordinate of the actor
     * @param [width=0.0] {number} The starting width of the actor
     * @param [height=0.0] {number} The starting height of the actor
     * @param [color=undefined] {Color} The starting color of the actor
     */
    var Actor = (function (_super) {
        __extends(Actor, _super);
        function Actor(x, y, width, height, color) {
            _super.call(this);
            /**
             * The unique identifier for the actor
             */
            this.id = Actor.maxId++;
            /**
             * The x coordinate of the actor (left edge)
             * @property x {number}
             */
            this.x = 0;
            /**
             * The y coordinate of the actor (top edge)
             * @property y {number}
             */
            this.y = 0;
            /**
             * Gets the calculated anchor point, should not be set.
             * @property calculatedAnchor {Point}
             */
            this.calculatedAnchor = new ex.Point(0, 0);
            this.height = 0;
            this.width = 0;
            /**
             * The rotation of the actor in radians
             * @property rotation {number}
             */
            this.rotation = 0; // radians
            /**
             * The rotational velocity of the actor in radians/second
             * @property rx {number}
             */
            this.rx = 0; //radions/sec
            /**
             * The scale vector of the actor
             * @property scale
             */
            this.scale = new ex.Vector(1, 1);
            /**
             * The x scalar velocity of the actor in scale/second
             * @property sx {number}
             */
            this.sx = 0; //scale/sec
            /**
             * The y scalar velocity of the actor in scale/second
             * @property sy {number}
             */
            this.sy = 0; //scale/sec
            /**
             * The x velocity of the actor in pixels/second
             * @property dx {number}
             */
            this.dx = 0; // pixels/sec
            /**
             * The x velocity of the actor in pixels/second
             * @property dx {number}
             */
            this.dy = 0;
            /**
             * The x acceleration of the actor in pixels/second^2
             * @property ax {number}
             */
            this.ax = 0; // pixels/sec/sec
            /**
             * The y acceleration of the actor in pixels/second^2
             * @property ay {number}
             */
            this.ay = 0;
            /**
             * Indicates wether the actor is physically in the viewport
             * @property isOffScreen {boolean}
             */
            this.isOffScreen = false;
            /**
             * The visibility of an actor
             * @property visible {boolean}
             */
            this.visible = true;
            /**
             * The opacity of an actor
             * @property opacity {number}
             */
            this.opacity = 1;
            this.previousOpacity = 1;
            /**
             * Convenience reference to the global logger
             * @property logger {Logger}
             */
            this.logger = ex.Logger.getInstance();
            /**
            * The scene that the actor is in
            * @property scene {Scene}
            */
            this.scene = null; //formerly "parent"
            /**
            * The parent of this actor
            * @property parent {Actor}
            */
            this.parent = null;
            /**
             * Gets or sets the current collision type of this actor. By
             * default all actors participate in Active collisions.
             * @property collisionType {CollisionType}
             */
            this.collisionType = 0 /* PreventCollision */;
            this.collisionGroups = [];
            this._collisionHandlers = {};
            this._isInitialized = false;
            this.frames = {};
            /**
             * Access to the current drawing on for the actor, this can be an {{#crossLink "Animation"}}{{/crossLink}},
             * {{#crossLink "Sprite"}}{{/crossLink}}, or {{#crossLink "Polygon"}}{{/crossLink}}.
             * Set drawings with the {{#crossLink "Actor/setDrawing:method"}}{{/crossLink}}.
             * @property currentDrawing {IDrawable}
             */
            this.currentDrawing = null;
            this.centerDrawingX = false;
            this.centerDrawingY = false;
            /**
             * Modify the current actor update pipeline.
             *
             *
             */
            this.pipeline = [];
            /**
             * Whether or not to enable the CapturePointer trait that propogates pointer events to this actor
             * @property [enableCapturePointer=false] {boolean}
             */
            this.enableCapturePointer = false;
            /**
             * Configuration for CapturePointer trait
             * @property capturePointer {ICapturePointerConfig}
             */
            this.capturePointer = {
                captureMoveEvents: false
            };
            this._isKilled = false;
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
            if (color) {
                this.color = color.clone();
                // set default opacity of an actor to the color
                this.opacity = color.a;
            }
            // Build default pipeline
            this.pipeline.push(new ex.MovementModule());
            //this.pipeline.push(new ex.CollisionDetectionModule());
            this.pipeline.push(new ex.OffscreenCullingModule());
            this.pipeline.push(new ex.CapturePointerModule());
            this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
            this.sceneNode = new ex.Scene();
            this.sceneNode.actor = this;
            this.anchor = new ex.Point(.5, .5);
        }
        /**
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         * @method onInitialize
         * @param engine {Engine}
         */
        Actor.prototype.onInitialize = function (engine) {
        };
        /**
         * If the current actors is a member of the scene. This will remove
         * it from the scene graph. It will no longer be drawn or updated.
         * @method kill
         */
        Actor.prototype.kill = function () {
            if (this.scene) {
                this.scene.removeChild(this);
                this._isKilled = true;
            }
            else {
                this.logger.warn("Cannot kill actor, it was never added to the Scene");
            }
        };
        /**
         * Indicates wether the actor has been killed.
         * @method isKilled
         * @returns boolean
         */
        Actor.prototype.isKilled = function () {
            return this._isKilled;
        };
        /**
         * Adds a child actor to this actor. All movement of the child actor will be
         * relative to the parent actor. Meaning if the parent moves the child will
         * move with
         * @method addChild
         * @param actor {Actor} The child actor to add
         */
        Actor.prototype.addChild = function (actor) {
            actor.collisionType = 0 /* PreventCollision */;
            this.sceneNode.addChild(actor);
        };
        /**
         * Removes a child actor from this actor.
         * @method removeChild
         * @param actor {Actor} The child actor to remove
         */
        Actor.prototype.removeChild = function (actor) {
            this.sceneNode.removeChild(actor);
        };
        /**
         * Sets the current drawing of the actor to the drawing correspoding to
         * the key.
         * @method setDrawing
         * @param key {string} The key of the drawing
         */
        Actor.prototype.setDrawing = function (key) {
            if (this.currentDrawing != this.frames[key]) {
                this.frames[key].reset();
            }
            this.currentDrawing = this.frames[key];
        };
        Actor.prototype.addDrawing = function (args) {
            if (arguments.length === 2) {
                this.frames[arguments[0]] = arguments[1];
                if (!this.currentDrawing) {
                    this.currentDrawing = arguments[1];
                }
            }
            else {
                if (arguments[0] instanceof ex.Sprite) {
                    this.addDrawing("default", arguments[0]);
                }
                if (arguments[0] instanceof ex.Texture) {
                    this.addDrawing("default", arguments[0].asSprite());
                }
            }
        };
        /**
         * Artificially trigger an event on an actor, useful when creating custom events.
         * @method triggerEvent
         * @param eventName {string} The name of the event to trigger
         * @param [event=undefined] {GameEvent} The event object to pass to the callback
         */
        Actor.prototype.triggerEvent = function (eventName, event) {
            this.eventDispatcher.publish(eventName, event);
        };
        /**
         * Adds an actor to a collision group. Actors with no named collision group are
         * considered to be in every collision group.
         *
         * Once in a collision group(s) actors will only collide with other actors in
         * that group.
         *
         * @method addCollisionGroup
         * @param name {string} The name of the collision group
         */
        Actor.prototype.addCollisionGroup = function (name) {
            this.collisionGroups.push(name);
        };
        /**
         * Remove an actor from a collision group.
         * @method removeCollisionGroup
         * @param name {string} The name of the collision group
         */
        Actor.prototype.removeCollisionGroup = function (name) {
            var index = this.collisionGroups.indexOf(name);
            if (index !== -1) {
                this.collisionGroups.splice(index, 1);
            }
        };
        /**
         * Get the center point of an actor
         * @method getCenter
         * @returns Vector
         */
        Actor.prototype.getCenter = function () {
            var anchor = this.calculatedAnchor;
            return new ex.Vector(this.x + this.getWidth() / 2 - anchor.x, this.y + this.getHeight() / 2 - anchor.y);
        };
        /**
         * Gets the calculated width of an actor
         * @method getWidth
         * @returns number
         */
        Actor.prototype.getWidth = function () {
            return this.width * this.scale.x;
        };
        /**
         * Sets the width of an actor, factoring in the current scale
         * @method setWidth
         */
        Actor.prototype.setWidth = function (width) {
            this.width = width / this.scale.x;
        };
        /**
         * Gets the calculated height of an actor
         * @method getHeight
         * @returns number
         */
        Actor.prototype.getHeight = function () {
            return this.height * this.scale.y;
        };
        /**
         * Sets the height of an actor, factoring in the current scale
         * @method setHeight
         */
        Actor.prototype.setHeight = function (height) {
            this.height = height / this.scale.y;
        };
        /**
         * Centers the actor's drawing around the center of the actor's bounding box
         * @method setCenterDrawing
         * @param center {boolean} Indicates to center the drawing around the actor
         */
        Actor.prototype.setCenterDrawing = function (center) {
            this.centerDrawingY = true;
            this.centerDrawingX = true;
        };
        /**
         * Gets the left edge of the actor
         * @method getLeft
         * @returns number
         */
        Actor.prototype.getLeft = function () {
            return this.x;
        };
        /**
         * Gets the right edge of the actor
         * @method getRight
         * @returns number
         */
        Actor.prototype.getRight = function () {
            return this.x + this.getWidth();
        };
        /**
         * Gets the top edge of the actor
         * @method getTop
         * @returns number
         */
        Actor.prototype.getTop = function () {
            return this.y;
        };
        /**
         * Gets the bottom edge of the actor
         * @method getBottom
         * @returns number
         */
        Actor.prototype.getBottom = function () {
            return this.y + this.getHeight();
        };
        /**
        * Gets the x value of the Actor in global coordinates
        * @method getGlobalX
        * @returns number
        */
        Actor.prototype.getGlobalX = function () {
            if (!this.parent)
                return this.x;
            return this.x * this.parent.scale.y + this.parent.getGlobalX();
        };
        /**
        * Gets the y value of the Actor in global coordinates
        * @method getGlobalY
        * @returns number
        */
        Actor.prototype.getGlobalY = function () {
            if (!this.parent)
                return this.y;
            return this.y * this.parent.scale.y + this.parent.getGlobalY();
        };
        /**
         * Gets the global scale of the Actor
         * @method getGlobalScale
         * @returns Point
         */
        Actor.prototype.getGlobalScale = function () {
            if (!this.parent)
                return new ex.Point(this.scale.x, this.scale.y);
            var parentScale = this.parent.getGlobalScale();
            return new ex.Point(this.scale.x * parentScale.x, this.scale.y * parentScale.y);
        };
        /**
         * Returns the actor's bounding box calculated for this instant.
         * @method getBounds
         * @returns BoundingBox
         */
        Actor.prototype.getBounds = function () {
            var anchor = this.calculatedAnchor;
            return new ex.BoundingBox(this.getGlobalX() - anchor.x, this.getGlobalY() - anchor.y, this.getGlobalX() + this.getWidth() - anchor.x, this.getGlobalY() + this.getHeight() - anchor.y);
        };
        /**
         * Tests whether the x/y specified are contained in the actor
         * @method contains
         * @param x {number} X coordinate to test (in world coordinates)
         * @param y {number} Y coordinate to test (in world coordinates)
         */
        Actor.prototype.contains = function (x, y) {
            return this.getBounds().contains(new ex.Point(x, y));
        };
        /**
         * Returns the side of the collision based on the intersection
         * @method getSideFromIntersect
         * @param intersect {Vector} The displacement vector returned by a collision
         * @returns Side
        */
        Actor.prototype.getSideFromIntersect = function (intersect) {
            if (intersect) {
                if (Math.abs(intersect.x) > Math.abs(intersect.y)) {
                    if (intersect.x < 0) {
                        return 4 /* Right */;
                    }
                    return 3 /* Left */;
                }
                else {
                    if (intersect.y < 0) {
                        return 2 /* Bottom */;
                    }
                    return 1 /* Top */;
                }
            }
            return 0 /* None */;
        };
        /**
         * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
         * @method collides
         * @param actor {Actor} The other actor to test
         * @returns Side
         */
        Actor.prototype.collidesWithSide = function (actor) {
            var separationVector = this.collides(actor);
            if (!separationVector) {
                return 0 /* None */;
            }
            if (Math.abs(separationVector.x) > Math.abs(separationVector.y)) {
                if (this.x < actor.x) {
                    return 4 /* Right */;
                }
                else {
                    return 3 /* Left */;
                }
            }
            else {
                if (this.y < actor.y) {
                    return 2 /* Bottom */;
                }
                else {
                    return 1 /* Top */;
                }
            }
            return 0 /* None */;
        };
        /**
         * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
         * null when there is no collision;
         * @method collides
         * @param actor {Actor} The other actor to test
         * @returns Vector
         */
        Actor.prototype.collides = function (actor) {
            var bounds = this.getBounds();
            var otherBounds = actor.getBounds();
            var intersect = bounds.collides(otherBounds);
            return intersect;
        };
        /**
         * Register a handler to fire when this actor collides with another in a specified group
         * @method onCollidesWith
         * @param group {string} The group name to listen for
         * @param func {callback} The callback to fire on collision with another actor from the group. The callback is passed the other actor.
         */
        Actor.prototype.onCollidesWith = function (group, func) {
            if (!this._collisionHandlers[group]) {
                this._collisionHandlers[group] = [];
            }
            this._collisionHandlers[group].push(func);
        };
        Actor.prototype.getCollisionHandlers = function () {
            return this._collisionHandlers;
        };
        /**
         * Removes all collision handlers for this group on this actor
         * @method removeCollidesWith
         * @param group {string} Group to remove all handlers for on this actor.
         */
        Actor.prototype.removeCollidesWith = function (group) {
            this._collisionHandlers[group] = [];
        };
        /**
         * Returns true if the two actors are less than or equal to the distance specified from each other
         * @method within
         * @param actor {Actor} Actor to test
         * @param distance {number} Distance in pixels to test
         * @returns boolean
         */
        Actor.prototype.within = function (actor, distance) {
            return Math.sqrt(Math.pow(this.x - actor.x, 2) + Math.pow(this.y - actor.y, 2)) <= distance;
        };
        /**
         * Clears all queued actions from the Actor
         * @method clearActions
         */
        Actor.prototype.clearActions = function () {
            this.actionQueue.clearActions();
        };
        Actor.prototype.easeTo = function (x, y, duration, easingFcn) {
            if (easingFcn === void 0) { easingFcn = ex.EasingFunctions.Linear; }
            this.actionQueue.add(new ex.Internal.Actions.EaseTo(this, x, y, duration, easingFcn));
            return this;
        };
        /**
         * This method will move an actor to the specified x and y position at the
         * speed specified (in pixels per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @method moveTo
         * @param x {number} The x location to move the actor to
         * @param y {number} The y location to move the actor to
         * @param speed {number} The speed in pixels per second to move
         * @returns Actor
         */
        Actor.prototype.moveTo = function (x, y, speed) {
            this.actionQueue.add(new ex.Internal.Actions.MoveTo(this, x, y, speed));
            return this;
        };
        /**
         * This method will move an actor to the specified x and y position by a
         * certain time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @method moveBy
         * @param x {number} The x location to move the actor to
         * @param y {number} The y location to move the actor to
         * @param time {number} The time it should take the actor to move to the new location in milliseconds
         * @returns Actor
         */
        Actor.prototype.moveBy = function (x, y, time) {
            this.actionQueue.add(new ex.Internal.Actions.MoveBy(this, x, y, time));
            return this;
        };
        /**
         * This method will rotate an actor to the specified angle at the speed
         * specified (in radians per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @method rotateTo
         * @param angleRadians {number} The angle to rotate to in radians
         * @param speed {number} The angular velocity of the rotation specified in radians per second
         * @returns Actor
         */
        Actor.prototype.rotateTo = function (angleRadians, speed) {
            this.actionQueue.add(new ex.Internal.Actions.RotateTo(this, angleRadians, speed));
            return this;
        };
        /**
         * This method will rotate an actor to the specified angle by a certain
         * time (in milliseconds) and return back the actor. This method is part
         * of the actor 'Action' fluent API allowing action chaining.
         * @method rotateBy
         * @param angleRadians {number} The angle to rotate to in radians
         * @param time {number} The time it should take the actor to complete the rotation in milliseconds
         * @returns Actor
         */
        Actor.prototype.rotateBy = function (angleRadians, time) {
            this.actionQueue.add(new ex.Internal.Actions.RotateBy(this, angleRadians, time));
            return this;
        };
        /**
         * This method will scale an actor to the specified size at the speed
         * specified (in magnitude increase per second) and return back the
         * actor. This method is part of the actor 'Action' fluent API allowing
         * action chaining.
         * @method scaleTo
         * @param size {number} The scaling factor to apply
         * @param speed {number} The speed of scaling specified in magnitude increase per second
         * @returns Actor
         */
        Actor.prototype.scaleTo = function (sizeX, sizeY, speedX, speedY) {
            this.actionQueue.add(new ex.Internal.Actions.ScaleTo(this, sizeX, sizeY, speedX, speedY));
            return this;
        };
        /**
         * This method will scale an actor to the specified size by a certain time
         * (in milliseconds) and return back the actor. This method is part of the
         * actor 'Action' fluent API allowing action chaining.
         * @method scaleBy
         * @param size {number} The scaling factor to apply
         * @param time {number} The time it should take to complete the scaling in milliseconds
         * @returns Actor
         */
        Actor.prototype.scaleBy = function (sizeX, sizeY, time) {
            this.actionQueue.add(new ex.Internal.Actions.ScaleBy(this, sizeX, sizeY, time));
            return this;
        };
        /**
         * This method will cause an actor to blink (become visible and not
         * visible). Optionally, you may specify the number of blinks. Specify the amount of time
         * the actor should be visible per blink, and the amount of time not visible.
         * This method is part of the actor 'Action' fluent API allowing action chaining.
         * @method blink
         * @param timeVisible {number} The amount of time to stay visible per blink in milliseconds
         * @param timeNotVisible {number} The amount of time to stay not visible per blink in milliseconds
         * @param [numBlinks] {number} The number of times to blink
         * @returns Actor
         */
        Actor.prototype.blink = function (timeVisible, timeNotVisible, numBlinks) {
            if (numBlinks === void 0) { numBlinks = 1; }
            this.actionQueue.add(new ex.Internal.Actions.Blink(this, timeVisible, timeNotVisible, numBlinks));
            return this;
        };
        /**
         * This method will cause an actor's opacity to change from its current value
         * to the provided value by a specified time (in milliseconds). This method is
         * part of the actor 'Action' fluent API allowing action chaining.
         * @method fade
         * @param opacity {number} The ending opacity
         * @param time {number} The time it should take to fade the actor (in milliseconds)
         * @returns Actor
         */
        Actor.prototype.fade = function (opacity, time) {
            this.actionQueue.add(new ex.Internal.Actions.Fade(this, opacity, time));
            return this;
        };
        /**
         * This method will delay the next action from executing for a certain
         * amount of time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @method delay
         * @param time {number} The amount of time to delay the next action in the queue from executing in milliseconds
         * @returns Actor
         */
        Actor.prototype.delay = function (time) {
            this.actionQueue.add(new ex.Internal.Actions.Delay(this, time));
            return this;
        };
        /**
         * This method will add an action to the queue that will remove the actor from the
         * scene once it has completed its previous actions. Any actions on the
         * action queue after this action will not be executed.
         * @method die
         * @returns Actor
         */
        Actor.prototype.die = function () {
            this.actionQueue.add(new ex.Internal.Actions.Die(this));
            return this;
        };
        /**
         * This method allows you to call an arbitrary method as the next action in the
         * action queue. This is useful if you want to execute code in after a specific
         * action, i.e An actor arrives at a destinatino after traversing a path
         * @method callMethod
         * @returns Actor
         */
        Actor.prototype.callMethod = function (method) {
            this.actionQueue.add(new ex.Internal.Actions.CallMethod(this, method));
            return this;
        };
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions a certain number of times. If the number of repeats
         * is not specified it will repeat forever. This method is part of
         * the actor 'Action' fluent API allowing action chaining
         * @method repeat
         * @param [times=undefined] {number} The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions will repeat forever
         * @returns Actor
         */
        Actor.prototype.repeat = function (times) {
            if (!times) {
                this.repeatForever();
                return this;
            }
            this.actionQueue.add(new ex.Internal.Actions.Repeat(this, times, this.actionQueue.getActions()));
            return this;
        };
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions forever. This method is part of the actor 'Action'
         * fluent API allowing action chaining.
         * @method repeatForever
         * @returns Actor
         */
        Actor.prototype.repeatForever = function () {
            this.actionQueue.add(new ex.Internal.Actions.RepeatForever(this, this.actionQueue.getActions()));
            return this;
        };
        /**
         * This method will cause the actor to follow another at a specified distance
         * @method follow
         * @param actor {Actor} The actor to follow
         * @param [followDistance=currentDistance] {number} The distance to maintain when following, if not specified the actor will follow at the current distance.
         * @returns Actor
         */
        Actor.prototype.follow = function (actor, followDistance) {
            if (followDistance == undefined) {
                this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor));
            }
            else {
                this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor, followDistance));
            }
            return this;
        };
        /**
         * This method will cause the actor to move towards another until they
         * collide "meet" at a specified speed.
         * @method meet
         * @param actor {Actor} The actor to meet
         * @param [speed=0] {number} The speed in pixels per second to move, if not specified it will match the speed of the other actor
         * @returns Actor
         */
        Actor.prototype.meet = function (actor, speed) {
            if (speed == undefined) {
                this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor));
            }
            else {
                this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor, speed));
            }
            return this;
        };
        /**
         * Returns a promise that resolves when the current action queue up to now
         * is finished.
         * @method asPromise
         * @returns Promise
         */
        Actor.prototype.asPromise = function () {
            var complete = new ex.Promise();
            this.callMethod(function () {
                complete.resolve();
            });
            return complete;
        };
        /**
         * Called by the Engine, updates the state of the actor
         * @method update
         * @param engine {Engine} The reference to the current game engine
         * @param delta {number} The time elapsed since the last update in milliseconds
         */
        Actor.prototype.update = function (engine, delta) {
            if (!this._isInitialized) {
                this.onInitialize(engine);
                this.eventDispatcher.publish('initialize', new ex.InitializeEvent(engine));
                this._isInitialized = true;
            }
            // Recalcuate the anchor point
            this.calculatedAnchor = new ex.Point(this.getWidth() * this.anchor.x, this.getHeight() * this.anchor.y);
            var eventDispatcher = this.eventDispatcher;
            // Update action queue
            this.actionQueue.update(delta);
            for (var i = 0; i < this.pipeline.length; i++) {
                this.pipeline[i].update(this, engine, delta);
            }
            eventDispatcher.publish(ex.EventType[5 /* Update */], new ex.UpdateEvent(delta));
        };
        /**
         * Called by the Engine, draws the actor to the screen
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The rendering context
         * @param delta {number} The time since the last draw in milliseconds
         */
        Actor.prototype.draw = function (ctx, delta) {
            if (this.isOffScreen) {
                return;
            }
            var anchorPoint = this.calculatedAnchor;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scale.x, this.scale.y);
            // calculate changing opacity
            if (this.previousOpacity != this.opacity) {
                for (var drawing in this.frames) {
                    this.frames[drawing].addEffect(new ex.Effects.Opacity(this.opacity));
                }
                this.previousOpacity = this.opacity;
            }
            if (this.currentDrawing) {
                var xDiff = 0;
                var yDiff = 0;
                if (this.centerDrawingX) {
                    xDiff = (this.currentDrawing.width * this.currentDrawing.getScaleX() - this.getWidth()) / 2;
                }
                if (this.centerDrawingY) {
                    yDiff = (this.currentDrawing.height * this.currentDrawing.getScaleY() - this.getHeight()) / 2;
                }
                this.currentDrawing.draw(ctx, -xDiff - anchorPoint.x, -yDiff - anchorPoint.y);
            }
            else {
                if (this.color) {
                    ctx.fillStyle = this.color.toString();
                    ctx.fillRect(-anchorPoint.x, -anchorPoint.y, this.width, this.height);
                }
            }
            this.sceneNode.draw(ctx, delta);
            ctx.restore();
        };
        /**
         * Called by the Engine, draws the actors debugging to the screen
         * @method debugDraw
         * @param ctx {CanvasRenderingContext2D} The rendering context
         */
        Actor.prototype.debugDraw = function (ctx) {
            var bb = this.getBounds();
            bb.debugDraw(ctx);
            ctx.fillStyle = ex.Color.Yellow.toString();
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        };
        /**
         * Indicates the next id to be set
         */
        Actor.maxId = 0;
        return Actor;
    })(ex.Class);
    ex.Actor = Actor;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Logging level that Excalibur will tag
     * @class LogLevel
     */
    (function (LogLevel) {
        /**
         @property Debug {LogLevel}
         @static
         @final
         */
        /**
        @property Info {LogLevel}
        @static
        @final
        */
        /**
        @property Warn {LogLevel}
        @static
        @final
        */
        /**
        @property Error {LogLevel}
        @static
        @final
        */
        /**
        @property Fatal {LogLevel}
        @static
        @final
        */
        LogLevel[LogLevel["Debug"] = 0] = "Debug";
        LogLevel[LogLevel["Info"] = 1] = "Info";
        LogLevel[LogLevel["Warn"] = 2] = "Warn";
        LogLevel[LogLevel["Error"] = 3] = "Error";
        LogLevel[LogLevel["Fatal"] = 4] = "Fatal";
    })(ex.LogLevel || (ex.LogLevel = {}));
    var LogLevel = ex.LogLevel;
    /**
     * Static singleton that represents the logging facility for Excalibur.
     * Excalibur comes built-in with a ConsoleAppender and ScreenAppender.
     * Derive from IAppender to create your own logging appenders.
     * @class Logger
     * @static
     */
    var Logger = (function () {
        function Logger() {
            this.appenders = [];
            /**
             * Gets or sets the default logging level. Excalibur will only log
             * messages if equal to or above this level.
             * @property defaultLevel {LogLevel}
             */
            this.defaultLevel = 1 /* Info */;
            if (Logger._instance) {
                throw new Error("Logger is a singleton");
            }
            Logger._instance = this;
            // Default console appender
            Logger._instance.addAppender(new ConsoleAppender());
            return Logger._instance;
        }
        /**
         * Gets the current static instance of Logger
         * @method getInstance
         * @static
         * @returns Logger
         */
        Logger.getInstance = function () {
            if (Logger._instance == null) {
                Logger._instance = new Logger();
            }
            return Logger._instance;
        };
        /**
         * Adds a new IAppender to the list of appenders to write to
         * @method addAppender
         * @param appender {IAppender} Appender to add
         */
        Logger.prototype.addAppender = function (appender) {
            this.appenders.push(appender);
        };
        /**
         * Clears all appenders from the logger
         * @method clearAppenders
         */
        Logger.prototype.clearAppenders = function () {
            this.appenders.length = 0;
        };
        /**
         * Logs a message at a given LogLevel
         * @method _log
         * @private
         * @param level {LogLevel}The LogLevel`to log the message at
         * @param args An array of arguments to write to an appender
         */
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
        /**
         * Writes a log message at the LogLevel.Debug level
         * @method debug
         * @param ...args Accepts any number of arguments
         */
        Logger.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(0 /* Debug */, args);
        };
        /**
         * Writes a log message at the LogLevel.Info level
         * @method info
         * @param ...args Accepts any number of arguments
         */
        Logger.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(1 /* Info */, args);
        };
        /**
         * Writes a log message at the LogLevel.Warn level
         * @method warn
         * @param ...args Accepts any number of arguments
         */
        Logger.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(2 /* Warn */, args);
        };
        /**
         * Writes a log message at the LogLevel.Error level
         * @method error
         * @param ...args Accepts any number of arguments
         */
        Logger.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(3 /* Error */, args);
        };
        /**
         * Writes a log message at the LogLevel.Fatal level
         * @method fatal
         * @param ...args Accepts any number of arguments
         */
        Logger.prototype.fatal = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(4 /* Fatal */, args);
        };
        Logger._instance = null;
        return Logger;
    })();
    ex.Logger = Logger;
    /**
     * Console appender for browsers (i.e. console.log)
     * @class ConsoleAppender
     * @constructor
     * @extends IAppender
     */
    var ConsoleAppender = (function () {
        function ConsoleAppender() {
        }
        ConsoleAppender.prototype.log = function (level, args) {
            // Create a new console args array
            var consoleArgs = [];
            consoleArgs.unshift.apply(consoleArgs, args);
            consoleArgs.unshift("[" + LogLevel[level] + "] : ");
            if (level < 2 /* Warn */) {
                // Call .log for Debug/Info
                console.log.apply(console, consoleArgs);
            }
            else if (level < 3 /* Error */) {
                // Call .warn for Warn
                console.warn.apply(console, consoleArgs);
            }
            else {
                // Call .error for Error/Fatal
                console.error.apply(console, consoleArgs);
            }
        };
        return ConsoleAppender;
    })();
    ex.ConsoleAppender = ConsoleAppender;
    /**
     * On-screen (canvas) appender
     * @todo Clean this up
     * @class ScreenAppender
     * @extends IAppender
     * @constructor
     * @param width {number} Width of the screen appender in pixels
     * @param height {number} Height of the screen appender in pixels
     */
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
/// <reference path="Engine.ts" />
/// <reference path="Actor.ts" />
/// <reference path="Log.ts" />
var ex;
(function (ex) {
    /**
     * An enum representing all of the built in event types for Excalibur
     * @class EventType
     */
    (function (EventType) {
        /**
        @property UserEvent {EventType}
        @static
        @final
        */
        /**
        @property Blur {EventType}
        @static
        @final
        */
        /**
        @property Focus {EventType}
        @static
        @final
        */
        /**
        @property Update {EventType}
        @static
        @final
        */
        /**
        @property EnterViewPort {EventType}
        @static
        @final
        */
        /**
        @property ExitViewPort {EventType}
        @static
        @final
        */
        /**
        @property Activate {EventType}
        @static
        @final
        */
        /**
        @property Deactivate {EventType}
        @static
        @final
        */
        /**
        @property Initialize {EventType}
        @static
        @final
        */
        EventType[EventType["Collision"] = 0] = "Collision";
        EventType[EventType["EnterViewPort"] = 1] = "EnterViewPort";
        EventType[EventType["ExitViewPort"] = 2] = "ExitViewPort";
        EventType[EventType["Blur"] = 3] = "Blur";
        EventType[EventType["Focus"] = 4] = "Focus";
        EventType[EventType["Update"] = 5] = "Update";
        EventType[EventType["Activate"] = 6] = "Activate";
        EventType[EventType["Deactivate"] = 7] = "Deactivate";
        EventType[EventType["Initialize"] = 8] = "Initialize";
    })(ex.EventType || (ex.EventType = {}));
    var EventType = ex.EventType;
    /**
     * Base event type in Excalibur that all other event types derive from.
     *
     * @class GameEvent
     * @constructor
     * @param target {any} Events can have target game object, like the Engine, or an Actor.
     */
    var GameEvent = (function () {
        function GameEvent() {
        }
        return GameEvent;
    })();
    ex.GameEvent = GameEvent;
    /**
     * Event received by the Engine when the browser window is visible
     *
     * @class VisibleEvent
     * @extends GameEvent
     * @constructor
     */
    var VisibleEvent = (function (_super) {
        __extends(VisibleEvent, _super);
        function VisibleEvent() {
            _super.call(this);
        }
        return VisibleEvent;
    })(GameEvent);
    ex.VisibleEvent = VisibleEvent;
    /**
     * Event received by the Engine when the browser window is hidden
     *
     * @class HiddenEvent
     * @extends GameEvent
     * @constructor
     */
    var HiddenEvent = (function (_super) {
        __extends(HiddenEvent, _super);
        function HiddenEvent() {
            _super.call(this);
        }
        return HiddenEvent;
    })(GameEvent);
    ex.HiddenEvent = HiddenEvent;
    /**
     * Event thrown on an actor when a collision has occured
     *
     * @class CollisionEvent
     * @extends GameEvent
     * @constructor
     * @param actor {Actor} The actor the event was thrown on
     * @param other {Actor} The actor that was collided with
     * @param side {Side} The side that was collided with
     */
    var CollisionEvent = (function (_super) {
        __extends(CollisionEvent, _super);
        function CollisionEvent(actor, other, side, intersection) {
            _super.call(this);
            this.actor = actor;
            this.other = other;
            this.side = side;
            this.intersection = intersection;
        }
        return CollisionEvent;
    })(GameEvent);
    ex.CollisionEvent = CollisionEvent;
    /**
     * Event thrown on a game object on Excalibur update
     *
     * @class UpdateEvent
     * @extends GameEvent
     * @constructor
     * @param delta {number} The number of milliseconds since the last update
     */
    var UpdateEvent = (function (_super) {
        __extends(UpdateEvent, _super);
        function UpdateEvent(delta) {
            _super.call(this);
            this.delta = delta;
        }
        return UpdateEvent;
    })(GameEvent);
    ex.UpdateEvent = UpdateEvent;
    /**
     * Event thrown on an Actor only once before the first update call
     *
     * @class InitializeEvent
     * @extends GameEvent
     * @constructor
     * @param engine {Engine} The reference to the current engine
     */
    var InitializeEvent = (function (_super) {
        __extends(InitializeEvent, _super);
        function InitializeEvent(engine) {
            _super.call(this);
            this.engine = engine;
        }
        return InitializeEvent;
    })(GameEvent);
    ex.InitializeEvent = InitializeEvent;
    /**
     * Event thrown on a Scene on activation
     *
     * @class ActivateEvent
     * @extends GameEvent
     * @constructor
     * @param oldScene {Scene} The reference to the old scene
     */
    var ActivateEvent = (function (_super) {
        __extends(ActivateEvent, _super);
        function ActivateEvent(oldScene) {
            _super.call(this);
            this.oldScene = oldScene;
        }
        return ActivateEvent;
    })(GameEvent);
    ex.ActivateEvent = ActivateEvent;
    /**
     * Event thrown on a Scene on deactivation
     *
     * @class DeactivateEvent
     * @extends GameEvent
     * @constructor
     * @param newScene {Scene} The reference to the new scene
     */
    var DeactivateEvent = (function (_super) {
        __extends(DeactivateEvent, _super);
        function DeactivateEvent(newScene) {
            _super.call(this);
            this.newScene = newScene;
        }
        return DeactivateEvent;
    })(GameEvent);
    ex.DeactivateEvent = DeactivateEvent;
    /**
     * Event thrown on an Actor when it completely leaves the screen.
     * @class ExitViewPortEvent
     * @constructor
     */
    var ExitViewPortEvent = (function (_super) {
        __extends(ExitViewPortEvent, _super);
        function ExitViewPortEvent() {
            _super.call(this);
        }
        return ExitViewPortEvent;
    })(GameEvent);
    ex.ExitViewPortEvent = ExitViewPortEvent;
    /**
     * Event thrown on an Actor when it completely leaves the screen.
     * @class EnterViewPortEvent
     * @constructor
     */
    var EnterViewPortEvent = (function (_super) {
        __extends(EnterViewPortEvent, _super);
        function EnterViewPortEvent() {
            _super.call(this);
        }
        return EnterViewPortEvent;
    })(GameEvent);
    ex.EnterViewPortEvent = EnterViewPortEvent;
    /**
     * Enum representing the different mouse buttons
     * @class MouseButton
     */
    (function (MouseButton) {
        /**
         * @property Left
         * @static
         */
        MouseButton[MouseButton["Left"] = 0] = "Left";
        /**
         * @property Left
         * @static
         */
        MouseButton[MouseButton["Middle"] = 1] = "Middle";
        /**
         * @property Left
         * @static
         */
        MouseButton[MouseButton["Right"] = 2] = "Right";
    })(ex.MouseButton || (ex.MouseButton = {}));
    var MouseButton = ex.MouseButton;
})(ex || (ex = {}));
/// <reference path="Events.ts" />
var ex;
(function (ex) {
    /**
     * Excalibur's internal event dispatcher implementation. Callbacks are fired immediately after an event is published
     * @class EventDispatcher
     * @constructor
     * @param target {any} The object that will be the recipient of events from this event dispatcher
     */
    var EventDispatcher = (function () {
        function EventDispatcher(target) {
            this._handlers = {};
            this.log = ex.Logger.getInstance();
            this.target = target;
        }
        /**
         * Publish an event for target
         * @method publish
         * @param eventName {string} The name of the event to publish
         * @param [event=undefined] {GameEvent} Optionally pass an event data object to the handler
         */
        EventDispatcher.prototype.publish = function (eventName, event) {
            if (!eventName) {
                // key not mapped
                return;
            }
            eventName = eventName.toLowerCase();
            var target = this.target;
            if (!event) {
                event = new ex.GameEvent();
            }
            event.target = target;
            if (this._handlers[eventName]) {
                this._handlers[eventName].forEach(function (callback) {
                    callback.call(target, event);
                });
            }
        };
        /**
         * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
         * @method subscribe
         * @param eventName {string} The name of the event to subscribe to
         * @param handler {GameEvent=>void} The handler callback to fire on this event
         */
        EventDispatcher.prototype.subscribe = function (eventName, handler) {
            eventName = eventName.toLowerCase();
            if (!this._handlers[eventName]) {
                this._handlers[eventName] = [];
            }
            this._handlers[eventName].push(handler);
        };
        /**
         * Unsubscribe a event handler(s) from an event. If a specific handler
         * is specified for an event, only that handler will be unsubscribed.
         * Otherwise all handlers will be unsubscribed for that event.
         * @method unsubscribe
         * @param eventName {string} The name of the event to unsubscribe
         * @param [handler=undefined] Optionally the specific handler to unsubscribe
         *
         */
        EventDispatcher.prototype.unsubscribe = function (eventName, handler) {
            eventName = eventName.toLowerCase();
            var eventHandlers = this._handlers[eventName];
            if (eventHandlers) {
                // if no explicit handler is give with the event name clear all handlers
                if (!handler) {
                    this._handlers[eventName].length = 0;
                }
                else {
                    var index = eventHandlers.indexOf(handler);
                    if (index < 0)
                        return;
                    this._handlers[eventName].splice(index, 1);
                }
            }
        };
        return EventDispatcher;
    })();
    ex.EventDispatcher = EventDispatcher;
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Color = (function () {
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @class Color
         * @constructor
         * @param r {number} The red component of color (0-255)
         * @param g {number} The green component of color (0-255)
         * @param b {number} The blue component of color (0-255)
         * @param [a=1] {number} The alpha component of color (0-1.0)
         */
        function Color(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            this.a = (a != null ? a : 1);
        }
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @method fromRGB
         * @static
         * @param r {number} The red component of color (0-255)
         * @param g {number} The green component of color (0-255)
         * @param b {number} The blue component of color (0-255)
         * @param [a=1] {number} The alpha component of color (0-1.0)
         */
        Color.fromRGB = function (r, g, b, a) {
            return new Color(r, g, b, a);
        };
        /**
         * Creates a new inscance of Color from a hex string
         *
         * @method fromHex
         * @static
         * @param hex {string} CSS color string of the form #ffffff, the alpha component is optional
         */
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
            }
            else {
                throw new Error("Invalid hex string: " + hex);
            }
        };
        /**
         * Returns a CSS string representation of a color.
         * @method toString
         * @returns string
         */
        Color.prototype.toString = function () {
            var result = String(this.r.toFixed(0)) + ", " + String(this.g.toFixed(0)) + ", " + String(this.b.toFixed(0));
            if (this.a !== undefined || this.a !== null) {
                return "rgba(" + result + ", " + String(this.a) + ")";
            }
            return "rgb(" + result + ")";
        };
        /**
         * Returns a CSS string representation of a color.
         * @method fillStyle
         * @returns string
         */
        Color.prototype.fillStyle = function () {
            return this.toString();
        };
        /**
         * Returns a clone of the current color.
         * @method clone
         * @returns Color
         */
        Color.prototype.clone = function () {
            return new Color(this.r, this.g, this.b, this.a);
        };
        /**
         * Color constant
         * @property Black {ex.Color}
         * @static
         * @final
         */
        Color.Black = Color.fromHex('#000000');
        /**
         * Color constant
         * @property White {ex.Color}
         * @static
         * @final
         */
        Color.White = Color.fromHex('#FFFFFF');
        /**
         * Color constant
         * @property Gray {ex.Color}
         * @static
         * @final
         */
        Color.Gray = Color.fromHex('#808080');
        /**
         * Color constant
         * @property LightGray {ex.Color}
         * @static
         * @final
         */
        Color.LightGray = Color.fromHex('#D3D3D3');
        /**
         * Color constant
         * @property DarkGray {ex.Color}
         * @static
         * @final
         */
        Color.DarkGray = Color.fromHex('#A9A9A9');
        /**
         * Color constant
         * @property Yellow {ex.Color}
         * @static
         * @final
         */
        Color.Yellow = Color.fromHex('#FFFF00');
        /**
         * Color constant
         * @property Orange {ex.Color}
         * @static
         * @final
         */
        Color.Orange = Color.fromHex('#FFA500');
        /**
         * Color constant
         * @property Red {ex.Color}
         * @static
         * @final
         */
        Color.Red = Color.fromHex('#FF0000');
        /**
         * Color constant
         * @property Vermillion {ex.Color}
         * @static
         * @final
         */
        Color.Vermillion = Color.fromHex('#FF5B31');
        /**
         * Color constant
         * @property Rose {ex.Color}
         * @static
         * @final
         */
        Color.Rose = Color.fromHex('#FF007F');
        /**
         * Color constant
         * @property Magenta {ex.Color}
         * @static
         * @final
         */
        Color.Magenta = Color.fromHex('#FF00FF');
        /**
         * Color constant
         * @property Violet {ex.Color}
         * @static
         * @final
         */
        Color.Violet = Color.fromHex('#7F00FF');
        /**
         * Color constant
         * @property Blue {ex.Color}
         * @static
         * @final
         */
        Color.Blue = Color.fromHex('#0000FF');
        /**
         * Color constant
         * @property Azure {ex.Color}
         * @static
         * @final
         */
        Color.Azure = Color.fromHex('#007FFF');
        /**
         * Color constant
         * @property Cyan {ex.Color}
         * @static
         * @final
         */
        Color.Cyan = Color.fromHex('#00FFFF');
        /**
         * Color constant
         * @property Viridian {ex.Color}
         * @static
         * @final
         */
        Color.Viridian = Color.fromHex('#59978F');
        /**
         * Color constant
         * @property Green {ex.Color}
         * @static
         * @final
         */
        Color.Green = Color.fromHex('#00FF00');
        /**
         * Color constant
         * @property Chartreuse {ex.Color}
         * @static
         * @final
         */
        Color.Chartreuse = Color.fromHex('#7FFF00');
        /**
         * Color constant
         * @property Transparent {ex.Color}
         * @static
         * @final
         */
        Color.Transparent = Color.fromHex('#FFFFFF00');
        return Color;
    })();
    ex.Color = Color;
})(ex || (ex = {}));
/// <reference path="Actor.ts" />
var ex;
(function (ex) {
    /**
     * Helper Actor primitive for drawing UI's, optimized for UI drawing. Does
     * not participate in collisions.
     * @class UIActor
     * @extends Actor
     * @constructor
     * @param [x=0.0] {number} The starting x coordinate of the actor
     * @param [y=0.0] {number} The starting y coordinate of the actor
     * @param [width=0.0] {number} The starting width of the actor
     * @param [height=0.0] {number} The starting height of the actor
     */
    var UIActor = (function (_super) {
        __extends(UIActor, _super);
        function UIActor(x, y, width, height) {
            _super.call(this, x, y, width, height);
            this.pipeline = [];
            this.pipeline.push(new ex.MovementModule());
            this.pipeline.push(new ex.CapturePointerModule());
            this.anchor.setTo(0, 0);
            this.collisionType = 0 /* PreventCollision */;
            this.enableCapturePointer = true;
        }
        UIActor.prototype.onInitialize = function (engine) {
            this._engine = engine;
        };
        UIActor.prototype.contains = function (x, y, useWorld) {
            if (useWorld === void 0) { useWorld = true; }
            if (useWorld)
                return _super.prototype.contains.call(this, x, y);
            var coords = this._engine.worldToScreenCoordinates(new ex.Point(x, y));
            return _super.prototype.contains.call(this, coords.x, coords.y);
        };
        return UIActor;
    })(ex.Actor);
    ex.UIActor = UIActor;
})(ex || (ex = {}));
/// <reference path="Actor.ts" />
/// <reference path="Engine.ts" />
var ex;
(function (ex) {
    /**
     * Triggers a method of firing arbitrary code on collision. These are useful
     * as 'buttons', 'switches', or to trigger effects in a game. By defualt triggers
     * are invisible, and can only be seen with debug mode enabled on the Engine.
     * @class Trigger
     * @constructor
     * @param [x=0] {number} The x position of the trigger
     * @param [y=0] {number} The y position of the trigger
     * @param [width=0] {number} The width of the trigger
     * @param [height=0] {number} The height of the trigger
     * @param [action=null] {()=>void} Callback to fire when trigger is activated
     * @param [repeats=1] {number} The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
     */
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
            this.collisionType = 0 /* PreventCollision */;
            this.eventDispatcher = new ex.EventDispatcher(this);
            this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
        }
        Trigger.prototype.update = function (engine, delta) {
            // Recalcuate the anchor point
            this.calculatedAnchor = new ex.Point(this.getWidth() * this.anchor.x, this.getHeight() * this.anchor.y);
            var eventDispatcher = this.eventDispatcher;
            // Update action queue
            this.actionQueue.update(delta);
            // Update placements based on linear algebra
            this.x += this.dx * delta / 1000;
            this.y += this.dy * delta / 1000;
            this.rotation += this.rx * delta / 1000;
            this.scale.x += this.sx * delta / 1000;
            this.scale.y += this.sy * delta / 1000;
            // check for trigger collisions
            if (this.target) {
                if (this.collides(this.target)) {
                    this.dispatchAction();
                }
            }
            else {
                for (var i = 0; i < engine.currentScene.children.length; i++) {
                    var other = engine.currentScene.children[i];
                    if (other !== this && other.collisionType !== 0 /* PreventCollision */ && this.collides(other)) {
                        this.dispatchAction();
                    }
                }
            }
            // remove trigger if its done, -1 repeat forever
            if (this.repeats === 0) {
                this.kill();
            }
        };
        Trigger.prototype.dispatchAction = function () {
            this.action.call(this);
            this.repeats--;
        };
        Trigger.prototype.draw = function (ctx, delta) {
            // does not draw
            return;
        };
        Trigger.prototype.debugDraw = function (ctx) {
            _super.prototype.debugDraw.call(this, ctx);
            // Meant to draw debug information about actors
            ctx.save();
            ctx.translate(this.x, this.y);
            var bb = this.getBounds();
            bb.left = bb.left - this.getGlobalX();
            bb.right = bb.right - this.getGlobalX();
            bb.top = bb.top - this.getGlobalY();
            bb.bottom = bb.bottom - this.getGlobalY();
            // Currently collision primitives cannot rotate 
            // ctx.rotate(this.rotation);
            ctx.fillStyle = ex.Color.Violet.toString();
            ctx.strokeStyle = ex.Color.Violet.toString();
            ctx.fillText('Trigger', 10, 10);
            bb.debugDraw(ctx);
            ctx.restore();
        };
        return Trigger;
    })(ex.Actor);
    ex.Trigger = Trigger;
})(ex || (ex = {}));
/// <reference path="Engine.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util.ts" />
/// <reference path="Actor.ts" />
var ex;
(function (ex) {
    /**
     * An enum that represents the types of emitter nozzles
     * @class EmitterType
     */
    (function (EmitterType) {
        /**
         * Constant for the circular emitter type
         * @property Circle {EmitterType}
         */
        EmitterType[EmitterType["Circle"] = 0] = "Circle";
        /**
         * Constant for the rectangular emitter type
         * @property Rectangle {EmitterType}
         */
        EmitterType[EmitterType["Rectangle"] = 1] = "Rectangle";
    })(ex.EmitterType || (ex.EmitterType = {}));
    var EmitterType = ex.EmitterType;
    var Particle = (function () {
        function Particle(emitter, life, opacity, beginColor, endColor, position, velocity, acceleration, startSize, endSize) {
            this.position = new ex.Vector(0, 0);
            this.velocity = new ex.Vector(0, 0);
            this.acceleration = new ex.Vector(0, 0);
            this.particleRotationalVelocity = 0;
            this.currentRotation = 0;
            this.focus = null;
            this.focusAccel = 0;
            this.opacity = 1;
            this.beginColor = ex.Color.White.clone();
            this.endColor = ex.Color.White.clone();
            // Life is counted in ms
            this.life = 300;
            this.fadeFlag = false;
            // Color transitions
            this.rRate = 1;
            this.gRate = 1;
            this.bRate = 1;
            this.aRate = 0;
            this.currentColor = ex.Color.White.clone();
            this.emitter = null;
            this.particleSize = 5;
            this.particleSprite = null;
            this.sizeRate = 0;
            this.elapsedMultiplier = 0;
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
            this.startSize = startSize || 0;
            this.endSize = endSize || 0;
            if ((this.endSize > 0) && (this.startSize > 0)) {
                this.sizeRate = (this.endSize - this.startSize) / this.life;
                this.particleSize = this.startSize;
            }
        }
        Particle.prototype.kill = function () {
            this.emitter.removeParticle(this);
        };
        Particle.prototype.update = function (delta) {
            this.life = this.life - delta;
            this.elapsedMultiplier = this.elapsedMultiplier + delta;
            if (this.life < 0) {
                this.kill();
            }
            if (this.fadeFlag) {
                this.opacity = ex.Util.clamp(this.aRate * this.life, 0.0001, 1);
            }
            if ((this.startSize > 0) && (this.endSize > 0)) {
                this.particleSize = ex.Util.clamp(this.sizeRate * delta + this.particleSize, Math.min(this.startSize, this.endSize), Math.max(this.startSize, this.endSize));
            }
            this.currentColor.r = ex.Util.clamp(this.currentColor.r + this.rRate * delta, 0, 255);
            this.currentColor.g = ex.Util.clamp(this.currentColor.g + this.gRate * delta, 0, 255);
            this.currentColor.b = ex.Util.clamp(this.currentColor.b + this.bRate * delta, 0, 255);
            this.currentColor.a = ex.Util.clamp(this.opacity, 0.0001, 1);
            if (this.focus) {
                var accel = this.focus.minus(this.position).normalize().scale(this.focusAccel).scale(delta / 1000);
                this.velocity = this.velocity.add(accel);
            }
            else {
                this.velocity = this.velocity.add(this.acceleration.scale(delta / 1000));
            }
            this.position = this.position.add(this.velocity.scale(delta / 1000));
            if (this.particleRotationalVelocity) {
                this.currentRotation = (this.currentRotation + this.particleRotationalVelocity * delta / 1000) % (2 * Math.PI);
            }
        };
        Particle.prototype.draw = function (ctx) {
            if (this.particleSprite) {
                this.particleSprite.setRotation(this.currentRotation);
                this.particleSprite.setScaleX(this.particleSize);
                this.particleSprite.setScaleY(this.particleSize);
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
    /**
     * Using a particle emitter is a great way to create interesting effects
     * in your game, like smoke, fire, water, explosions, etc. Particle Emitters
     * extend Actor allowing you to use all of the features that come with Actor
     * @class ParticleEmitter
     * @constructor
     * @param [x=0] {number} The x position of the emitter
     * @param [y=0] {number} The y position of the emitter
     * @param [width=0] {number} The width of the emitter
     * @param [height=0] {number} The height of the emitter
     */
    var ParticleEmitter = (function (_super) {
        __extends(ParticleEmitter, _super);
        function ParticleEmitter(x, y, width, height) {
            _super.call(this, x, y, width, height, ex.Color.White);
            this._particlesToEmit = 0;
            this.numParticles = 0;
            /**
             * Gets or sets the isEmitting flag
             * @property isEmitting {boolean}
             */
            this.isEmitting = true;
            /**
             * Gets or sets the backing particle collection
             * @property particles {Util.Collection&lt;Particle&gt;}
             */
            this.particles = null;
            /**
             * Gets or sets the backing deadParticle collection
             * @property particles {Util.Collection&lt;Particle&gt;}
             */
            this.deadParticles = null;
            /**
             * Gets or sets the minimum partical velocity
             * @property [minVel=0] {number}
             */
            this.minVel = 0;
            /**
             * Gets or sets the maximum partical velocity
             * @property [maxVel=0] {number}
             */
            this.maxVel = 0;
            /**
             * Gets or sets the acceleration vector for all particles
             * @property [acceleration=new Vector(0,0)] {Vector}
             */
            this.acceleration = new ex.Vector(0, 0);
            /**
             * Gets or sets the minimum angle in radians
             * @property [minAngle=0] {number}
             */
            this.minAngle = 0;
            /**
             * Gets or sets the maximum angle in radians
             * @property [maxAngle=0] {number}
             */
            this.maxAngle = 0;
            /**
             * Gets or sets the emission rate for particles (particles/sec)
             * @property [emitRate=1] {number}
             */
            this.emitRate = 1; //particles/sec
            /**
             * Gets or sets the life of each particle in milliseconds
             * @property [particleLife=2000] {number}
             */
            this.particleLife = 2000;
            /**
             * Gets or sets the opacity of each particle from 0 to 1.0
             * @property [opacity=1.0] {number}
             */
            this.opacity = 1;
            /**
             * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
             * @property [fade=false] {boolean}
             */
            this.fadeFlag = false;
            /**
             * Gets or sets the optional focus where all particles should accelerate towards
             * @property [focus=null] {Vector}
             */
            this.focus = null;
            /**
             * Gets or sets the acceleration for focusing particles if a focus has been specified
             * @property [focusAccel=1] {number}
             */
            this.focusAccel = 1;
            /*
             * Gets or sets the optional starting size for the particles
             * @property [startSize=null] {number}
             */
            this.startSize = null;
            /*
             * Gets or sets the optional ending size for the particles
             * @property [endSize=null] {number}
             */
            this.endSize = null;
            /**
             * Gets or sets the minimum size of all particles
             * @property [minSize=5] {number}
             */
            this.minSize = 5;
            /**
             * Gets or sets the maximum size of all particles
             * @property [maxSize=5] {number}
             */
            this.maxSize = 5;
            /**
             * Gets or sets the beginning color of all particles
             * @property [beginColor=Color.White] {Color}
             */
            this.beginColor = ex.Color.White;
            /**
             * Gets or sets the ending color of all particles
             * @property [endColor=Color.White] {Color}
             */
            this.endColor = ex.Color.White;
            /**
             * Gets or sets the sprite that a particle should use
             * @property [particleSprite=null] {Sprite}
             */
            this.particleSprite = null;
            /**
             * Gets or sets the emitter type for the particle emitter
             * @property [emitterType=EmitterType.Rectangle] {EmitterType}
             */
            this.emitterType = 1 /* Rectangle */;
            /**
             * Gets or sets the emitter radius, only takes effect when the emitterType is Circle
             * @property [radius=0] {number}
             */
            this.radius = 0;
            /**
             * Gets or sets the particle rotational speed velocity
             * @property [particleRotationalVelocity=0] {number}
             */
            this.particleRotationalVelocity = 0;
            /**
             * Indicates whether particles should start with a random rotation
             * @property [randomRotation=false] {boolean}
             */
            this.randomRotation = false;
            this.collisionType = 0 /* PreventCollision */;
            this.particles = new ex.Util.Collection();
            this.deadParticles = new ex.Util.Collection();
        }
        ParticleEmitter.prototype.removeParticle = function (particle) {
            this.deadParticles.push(particle);
        };
        /**
         * Causes the emitter to emit particles
         * @method emit
         * @param particleCount {number} Number of particles to emit right now
         */
        ParticleEmitter.prototype.emit = function (particleCount) {
            for (var i = 0; i < particleCount; i++) {
                this.particles.push(this.createParticle());
            }
        };
        ParticleEmitter.prototype.clearParticles = function () {
            this.particles.clear();
        };
        // Creates a new particle given the contraints of the emitter
        ParticleEmitter.prototype.createParticle = function () {
            // todo implement emitter contraints;
            var ranX = 0;
            var ranY = 0;
            var angle = ex.Util.randomInRange(this.minAngle, this.maxAngle);
            var vel = ex.Util.randomInRange(this.minVel, this.maxVel);
            var size = this.startSize || ex.Util.randomInRange(this.minSize, this.maxSize);
            var dx = vel * Math.cos(angle);
            var dy = vel * Math.sin(angle);
            if (this.emitterType === 1 /* Rectangle */) {
                ranX = ex.Util.randomInRange(this.x, this.x + this.getWidth());
                ranY = ex.Util.randomInRange(this.y, this.y + this.getHeight());
            }
            else if (this.emitterType === 0 /* Circle */) {
                var radius = ex.Util.randomInRange(0, this.radius);
                ranX = radius * Math.cos(angle) + this.x;
                ranY = radius * Math.sin(angle) + this.y;
            }
            var p = new Particle(this, this.particleLife, this.opacity, this.beginColor, this.endColor, new ex.Vector(ranX, ranY), new ex.Vector(dx, dy), this.acceleration, this.startSize, this.endSize);
            p.fadeFlag = this.fadeFlag;
            p.particleSize = size;
            if (this.particleSprite) {
                p.particleSprite = this.particleSprite;
            }
            p.particleRotationalVelocity = this.particleRotationalVelocity;
            if (this.randomRotation) {
                p.currentRotation = ex.Util.randomInRange(0, Math.PI * 2);
            }
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
                this._particlesToEmit += this.emitRate * (delta / 1000);
                var numParticles = Math.ceil(this.emitRate * delta / 1000);
                if (this._particlesToEmit > 1.0) {
                    this.emit(Math.floor(this._particlesToEmit));
                    this._particlesToEmit = this._particlesToEmit - Math.floor(this._particlesToEmit);
                }
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
                // todo is there a more efficient to draw 
                // possibly use a webgl offscreen canvas and shaders to do particles?
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
    /**
     * Animations allow you to display a series of images one after another,
     * creating the illusion of change. Generally these images will come from a sprite sheet source.
     * @class Animation
     * @extends IDrawable
     * @constructor
     * @param engine {Engine} Reference to the current game engine
     * @param images {Sprite[]} An array of sprites to create the frames for the animation
     * @param speed {number} The number in milliseconds to display each frame in the animation
     * @param [loop=false] {boolean} Indicates whether the animation should loop after it is completed
     */
    var Animation = (function () {
        function Animation(engine, images, speed, loop) {
            this.currIndex = 0;
            this.oldTime = Date.now();
            this.rotation = 0.0;
            this.scaleX = 1.0;
            this.scaleY = 1.0;
            /**
             * Indicates whether the animation should loop after it is completed
             * @property [loop=false] {boolean}
             */
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
        Animation.prototype.removeEffect = function (param) {
            for (var i in this.sprites) {
                this.sprites[i].removeEffect(param);
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
        Animation.prototype.setScaleX = function (scaleX) {
            this.scaleX = scaleX;
            for (var i in this.sprites) {
                this.sprites[i].setScaleX(scaleX);
            }
        };
        Animation.prototype.setScaleY = function (scaleY) {
            this.scaleY = scaleY;
            for (var i in this.sprites) {
                this.sprites[i].setScaleY(scaleY);
            }
        };
        Animation.prototype.getScaleX = function () {
            return this.scaleX;
        };
        Animation.prototype.getScaleY = function () {
            return this.scaleY;
        };
        /**
         * Resets the animation to first frame.
         * @method reset
         */
        Animation.prototype.reset = function () {
            this.currIndex = 0;
        };
        /**
         * Indicates whether the animation is complete, animations that loop are never complete.
         * @method isDone
         * @returns boolean
         */
        Animation.prototype.isDone = function () {
            return (!this.loop && this.currIndex >= this.sprites.length);
        };
        /**
         * Not meant to be called by game developers. Ticks the animation forward internally an
         * calculates whether to change to teh frame.
         * @method tick
         */
        Animation.prototype.tick = function () {
            var time = Date.now();
            if ((time - this.oldTime) > this.speed) {
                this.currIndex = (this.loop ? (this.currIndex + 1) % this.sprites.length : this.currIndex + 1);
                this.oldTime = time;
            }
        };
        /**
         * Skips ahead a specified number of frames in the animation
         * @method skip
         * @param frames {number} Frames to skip ahead
         */
        Animation.prototype.skip = function (frames) {
            this.currIndex = (this.currIndex + frames) % this.sprites.length;
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
        /**
         * Plays an animation at an arbitrary location in the game.
         * @method play
         * @param x {number} The x position in the game to play
         * @param y {number} The y position in the game to play
         */
        Animation.prototype.play = function (x, y) {
            this.reset();
            this.engine.playAnimation(this, x, y);
        };
        return Animation;
    })();
    ex.Animation = Animation;
})(ex || (ex = {}));
/// <reference path="MonkeyPatch.ts" />
/// <reference path="Util.ts" />
/// <reference path="Log.ts" />
var ex;
(function (ex) {
    var Internal;
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
                }
                else {
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
            FallbackAudio.prototype.isPlaying = function () {
                return this.soundImpl.isPlaying();
            };
            FallbackAudio.prototype.play = function () {
                return this.soundImpl.play();
            };
            FallbackAudio.prototype.pause = function () {
                this.soundImpl.pause();
            };
            FallbackAudio.prototype.stop = function () {
                this.soundImpl.stop();
            };
            return FallbackAudio;
        })();
        Internal.FallbackAudio = FallbackAudio;
        var AudioTag = (function () {
            function AudioTag(path, volume) {
                var _this = this;
                this.path = path;
                this.audioElements = new Array(5);
                this._loadedAudio = null;
                this.isLoaded = false;
                this.index = 0;
                this.log = ex.Logger.getInstance();
                this._isPlaying = false;
                this._currentOffset = 0;
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
                if (volume) {
                    this.setVolume(ex.Util.clamp(volume, 0, 1.0));
                }
                else {
                    this.setVolume(1.0);
                }
            }
            AudioTag.prototype.isPlaying = function () {
                return this._isPlaying;
            };
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
            AudioTag.prototype.getLoop = function () {
                this.audioElements.some(function (a) { return a.loop; });
            };
            AudioTag.prototype.load = function () {
                var _this = this;
                var request = new XMLHttpRequest();
                request.open("GET", this.path, true);
                request.responseType = 'blob';
                request.onprogress = this.onprogress;
                request.onerror = this.onerror;
                request.onload = function (e) {
                    if (request.status !== 200) {
                        _this.log.error("Failed to load audio resource ", _this.path, " server responded with error code", request.status);
                        _this.onerror(request.response);
                        _this.isLoaded = false;
                        return;
                    }
                    _this._loadedAudio = URL.createObjectURL(request.response);
                    _this.audioElements.forEach(function (a) {
                        a.src = _this._loadedAudio;
                    });
                    _this.onload(e);
                };
                request.send();
            };
            AudioTag.prototype.play = function () {
                var _this = this;
                this.audioElements[this.index].load();
                //this.audioElements[this.index].currentTime = this._currentOffset;
                this.audioElements[this.index].play();
                this._currentOffset = 0;
                var done = new ex.Promise();
                this._isPlaying = true;
                if (!this.getLoop()) {
                    this.audioElements[this.index].addEventListener('ended', function () {
                        _this._isPlaying = false;
                        done.resolve(true);
                    });
                }
                this.index = (this.index + 1) % this.audioElements.length;
                return done;
            };
            AudioTag.prototype.pause = function () {
                this.index = (this.index - 1 + this.audioElements.length) % this.audioElements.length;
                this._currentOffset = this.audioElements[this.index].currentTime;
                this.audioElements.forEach(function (a) {
                    a.pause();
                });
                this._isPlaying = false;
            };
            AudioTag.prototype.stop = function () {
                this.audioElements.forEach(function (a) {
                    a.pause();
                    //a.currentTime = 0;
                });
                this._isPlaying = false;
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
                this._isPlaying = false;
                this._isPaused = false;
                this._currentOffset = 0;
                this.logger = ex.Logger.getInstance();
                this.onload = function () {
                };
                this.onprogress = function () {
                };
                this.onerror = function () {
                };
                this.path = soundPath;
                if (volume) {
                    this.volume.gain.value = ex.Util.clamp(volume, 0, 1.0);
                }
                else {
                    this.volume.gain.value = 1.0; // max volume
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
                    if (request.status !== 200) {
                        _this.logger.error("Failed to load audio resource ", _this.path, " server responded with error code", request.status);
                        _this.onerror(request.response);
                        _this.isLoaded = false;
                        return;
                    }
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
                try {
                    request.send();
                }
                catch (e) {
                    console.error("Error loading sound! If this is a cross origin error, you must host your sound with your html and javascript.");
                }
            };
            WebAudio.prototype.setLoop = function (loop) {
                this.loop = loop;
            };
            WebAudio.prototype.isPlaying = function () {
                return this._isPlaying;
            };
            WebAudio.prototype.play = function () {
                var _this = this;
                if (this.isLoaded) {
                    this.sound = this.context.createBufferSource();
                    this.sound.buffer = this.buffer;
                    this.sound.loop = this.loop;
                    this.sound.connect(this.volume);
                    this.volume.connect(this.context.destination);
                    this.sound.start(0, this._currentOffset % this.buffer.duration);
                    this._currentOffset = 0;
                    var done;
                    if (!this._isPaused || !this._playPromise) {
                        done = new ex.Promise();
                    }
                    else {
                        done = this._playPromise;
                    }
                    this._isPaused = false;
                    this._isPlaying = true;
                    if (!this.loop) {
                        this.sound.onended = (function () {
                            _this._isPlaying = false;
                            if (!_this._isPaused) {
                                done.resolve(true);
                            }
                        }).bind(this);
                    }
                    this._playPromise = done;
                    return done;
                }
                else {
                    return ex.Promise.wrap(true);
                }
            };
            WebAudio.prototype.pause = function () {
                if (this._isPlaying) {
                    try {
                        window.clearTimeout(this._playingTimer);
                        this.sound.stop(0);
                        this._currentOffset = this.context.currentTime;
                        this._isPlaying = false;
                        this._isPaused = true;
                    }
                    catch (e) {
                        this.logger.warn("The sound clip", this.path, "has already been paused!");
                    }
                }
            };
            WebAudio.prototype.stop = function () {
                if (this.sound) {
                    try {
                        window.clearTimeout(this._playingTimer);
                        this._currentOffset = 0;
                        this.sound.stop(0);
                        this._isPlaying = false;
                        this._isPaused = false;
                    }
                    catch (e) {
                        this.logger.warn("The sound clip", this.path, "has already been stopped!");
                    }
                }
            };
            return WebAudio;
        })();
        Internal.WebAudio = WebAudio;
    })(Internal = ex.Internal || (ex.Internal = {}));
})(ex || (ex = {}));
/// <reference path="Log.ts" />
// Promises/A+ Spec http://promises-aplus.github.io/promises-spec/
var ex;
(function (ex) {
    /**
     * Valid states for a promise to be in
     * @class PromiseState
     */
    (function (PromiseState) {
        /**
        @property Resolved {PromiseState}
        */
        PromiseState[PromiseState["Resolved"] = 0] = "Resolved";
        /**
        @property Rejected {PromiseState}
        */
        PromiseState[PromiseState["Rejected"] = 1] = "Rejected";
        /**
        @property Pending {PromiseState}
        */
        PromiseState[PromiseState["Pending"] = 2] = "Pending";
    })(ex.PromiseState || (ex.PromiseState = {}));
    var PromiseState = ex.PromiseState;
    /**
     * Promises/A+ spec implementation of promises
     * @class Promise
     * @constructor
     */
    var Promise = (function () {
        function Promise() {
            this._state = 2 /* Pending */;
            this.successCallbacks = [];
            this.rejectCallback = function () {
            };
            this.logger = ex.Logger.getInstance();
        }
        /**
         * Wrap a value in a resolved promise
         * @method wrap<T>
         * @param [value=undefined] {T} An optional value to wrap in a resolved promise
         * @returns Promise&lt;T&gt;
         */
        Promise.wrap = function (value) {
            var promise = (new Promise()).resolve(value);
            return promise;
        };
        /**
         * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
         * when at least 1 promise rejects.
         * @param promises {Promise[]}
         * @returns Promise
         */
        Promise.join = function () {
            var promises = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                promises[_i - 0] = arguments[_i];
            }
            var joinedPromise = new Promise();
            if (!promises) {
                return joinedPromise.resolve();
            }
            var total = promises.length;
            var successes = 0;
            var rejects = 0;
            var errors = [];
            promises.forEach(function (p) {
                p.then(function () {
                    successes += 1;
                    if (successes === total) {
                        joinedPromise.resolve();
                    }
                    else if (successes + rejects + errors.length === total) {
                        joinedPromise.reject(errors);
                    }
                }, function () {
                    rejects += 1;
                    if (successes + rejects + errors.length === total) {
                        joinedPromise.reject(errors);
                    }
                }).error(function (e) {
                    errors.push(e);
                    if ((errors.length + successes + rejects) === total) {
                        joinedPromise.reject(errors);
                    }
                });
            });
            return joinedPromise;
        };
        /**
         * Chain success and reject callbacks after the promise is resovled
         * @method then
         * @param successCallback {T=>any} Call on resolution of promise
         * @param rejectCallback {any=>any} Call on rejection of promise
         * @returns Promise&lt;T&gt;
         */
        Promise.prototype.then = function (successCallback, rejectCallback) {
            if (successCallback) {
                this.successCallbacks.push(successCallback);
                // If the promise is already resovled call immediately
                if (this.state() === 0 /* Resolved */) {
                    try {
                        successCallback.call(this, this.value);
                    }
                    catch (e) {
                        this.handleError(e);
                    }
                }
            }
            if (rejectCallback) {
                this.rejectCallback = rejectCallback;
                // If the promise is already rejected call immediately
                if (this.state() === 1 /* Rejected */) {
                    try {
                        rejectCallback.call(this, this.value);
                    }
                    catch (e) {
                        this.handleError(e);
                    }
                }
            }
            return this;
        };
        /**
         * Add an error callback to the promise
         * @method error
         * @param errorCallback {any=>any} Call if there was an error in a callback
         * @returns Promise&lt;T&gt;
         */
        Promise.prototype.error = function (errorCallback) {
            if (errorCallback) {
                this.errorCallback = errorCallback;
            }
            return this;
        };
        /**
         * Resolve the promise and pass an option value to the success callbacks
         * @method resolve
         * @param [value=undefined] {T} Value to pass to the success callbacks
         */
        Promise.prototype.resolve = function (value) {
            var _this = this;
            if (this._state === 2 /* Pending */) {
                this.value = value;
                try {
                    this._state = 0 /* Resolved */;
                    this.successCallbacks.forEach(function (cb) {
                        cb.call(_this, _this.value);
                    });
                }
                catch (e) {
                    this.handleError(e);
                }
            }
            else {
                throw new Error('Cannot resolve a promise that is not in a pending state!');
            }
            return this;
        };
        /**
         * Reject the promise and pass an option value to the reject callbacks
         * @method reject
         * @param [value=undefined] {T} Value to pass to the reject callbacks
         */
        Promise.prototype.reject = function (value) {
            if (this._state === 2 /* Pending */) {
                this.value = value;
                try {
                    this._state = 1 /* Rejected */;
                    this.rejectCallback.call(this, this.value);
                }
                catch (e) {
                    this.handleError(e);
                }
            }
            else {
                throw new Error('Cannot reject a promise that is not in a pending state!');
            }
            return this;
        };
        /**
         * Inpect the current state of a promise
         * @method state
         * @returns PromiseState
         */
        Promise.prototype.state = function () {
            return this._state;
        };
        Promise.prototype.handleError = function (e) {
            if (this.errorCallback) {
                this.errorCallback.call(this, e);
            }
            else {
                throw e;
            }
        };
        return Promise;
    })();
    ex.Promise = Promise;
})(ex || (ex = {}));
/// <reference path="Interfaces/ILoadable.ts" />
var ex;
(function (ex) {
    /**
     * The Resource type allows games built in Excalibur to load generic resources.
     * For any type of remote resource it is recome
     * @class Resource
     * @extend ILoadable
     * @constructor
     * @param path {string} Path to the remote resource
     */
    var Resource = (function () {
        function Resource(path, responseType, bustCache) {
            if (bustCache === void 0) { bustCache = true; }
            this.path = path;
            this.responseType = responseType;
            this.bustCache = bustCache;
            this.data = null;
            this.logger = ex.Logger.getInstance();
            this.onprogress = function () {
            };
            this.oncomplete = function () {
            };
            this.onerror = function () {
            };
        }
        /**
         * Returns true if the Resource is completely loaded and is ready
         * to be drawn.
         * @method isLoaded
         * @returns boolean
         */
        Resource.prototype.isLoaded = function () {
            return !!this.data;
        };
        Resource.prototype.wireEngine = function (engine) {
            this._engine = engine;
        };
        Resource.prototype.cacheBust = function (uri) {
            var query = /\?\w*=\w*/;
            if (query.test(uri)) {
                uri += ("&__=" + Date.now());
            }
            else {
                uri += ("?__=" + Date.now());
            }
            return uri;
        };
        Resource.prototype._start = function (e) {
            this.logger.debug("Started loading resource " + this.path);
        };
        /**
         * Begin loading the resource and returns a promise to be resolved on completion
         * @method load
         * @returns Promise&lt;any&gt;
         */
        Resource.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var request = new XMLHttpRequest();
            request.open("GET", this.bustCache ? this.cacheBust(this.path) : this.path, true);
            request.responseType = this.responseType;
            request.onloadstart = function (e) {
                _this._start(e);
            };
            request.onprogress = this.onprogress;
            request.onerror = this.onerror;
            request.onload = function (e) {
                if (request.status !== 200) {
                    _this.logger.error("Failed to load resource ", _this.path, " server responded with error code", request.status);
                    _this.onerror(request.response);
                    complete.resolve(request.response);
                    return;
                }
                _this.data = _this.processDownload(request.response);
                _this.oncomplete();
                _this.logger.debug("Completed loading resource", _this.path);
                complete.resolve(_this.data);
            };
            request.send();
            return complete;
        };
        /**
         * Returns the loaded data once the resource is loaded
         * @method GetData
         * @returns any
         */
        Resource.prototype.getData = function () {
            return this.data;
        };
        /**
         * This method is meant to be overriden to handle any additional
         * processing. Such as decoding downloaded audio bits.
         * @method ProcessDownload
         */
        Resource.prototype.processDownload = function (data) {
            // Handle any additional loading after the xhr has completed.
            return URL.createObjectURL(data);
        };
        return Resource;
    })();
    ex.Resource = Resource;
})(ex || (ex = {}));
/// <reference path="Sound.ts" />
/// <reference path="Util.ts" />
/// <reference path="Promises.ts" />
/// <reference path="Resource.ts" />
/// <reference path="Interfaces/ILoadable.ts" />
var ex;
(function (ex) {
    /**
     * The Texture object allows games built in Excalibur to load image resources.
     * It is generally recommended to preload images using the "Texture" object.
     * @class Texture
     * @extend Resource
     * @constructor
     * @param path {string} Path to the image resource
     * @param [bustCache=true] {boolean} Optionally load texture with cache busting
     */
    var Texture = (function (_super) {
        __extends(Texture, _super);
        function Texture(path, bustCache) {
            if (bustCache === void 0) { bustCache = true; }
            _super.call(this, path, 'blob', bustCache);
            this.path = path;
            this.bustCache = bustCache;
            this.loaded = new ex.Promise();
            this._isLoaded = false;
            this._sprite = null;
            this._sprite = new ex.Sprite(this, 0, 0, 0, 0);
        }
        /**
         * Returns true if the Texture is completely loaded and is ready
         * to be drawn.
         * @method isLoaded
         * @returns boolean
         */
        Texture.prototype.isLoaded = function () {
            return this._isLoaded;
        };
        /**
         * Begins loading the texture and returns a promise to be resolved on completion
         * @method load
         * @returns Promise&lt;HTMLImageElement&gt;
         */
        Texture.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var loaded = _super.prototype.load.call(this);
            loaded.then(function () {
                _this.image = new Image();
                _this.image.addEventListener("load", function () {
                    _this._isLoaded = true;
                    _this.width = _this._sprite.swidth = _this._sprite.width = _this.image.naturalWidth;
                    _this.height = _this._sprite.sheight = _this._sprite.height = _this.image.naturalHeight;
                    _this.loaded.resolve(_this.image);
                    complete.resolve(_this.image);
                });
                _this.image.src = _super.prototype.getData.call(_this);
            }, function () {
                complete.reject("Error loading texture.");
            });
            return complete;
        };
        Texture.prototype.asSprite = function () {
            return this._sprite;
        };
        return Texture;
    })(ex.Resource);
    ex.Texture = Texture;
    /**
     * The Sound object allows games built in Excalibur to load audio
     * components, from soundtracks to sound effects. It is generally
     * recommended to load sound resources when using Excalibur
     * @class Sound
     * @extend Resource
     * @constructor
     * @param ...paths {string[]} A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
     */
    var Sound = (function () {
        function Sound() {
            var paths = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paths[_i - 0] = arguments[_i];
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
            this._wasPlayingOnHidden = false;
            /* Chrome : MP3, WAV, Ogg
             * Firefox : WAV, Ogg,
             * IE : MP3, WAV coming soon
             * Safari MP3, WAV, Ogg
             */
            this._selectedFile = "";
            for (var i = 0; i < paths.length; i++) {
                if (Sound.canPlayFile(paths[i])) {
                    this._selectedFile = paths[i];
                    break;
                }
            }
            if (!this._selectedFile) {
                this.logger.warn("This browser does not support any of the files specified");
                this._selectedFile = paths[0]; // select the first specified
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
        Sound.prototype.wireEngine = function (engine) {
            var _this = this;
            if (engine) {
                this._engine = engine;
                this._engine.on('hidden', function () {
                    if (engine.pauseAudioWhenHidden && _this.isPlaying()) {
                        _this._wasPlayingOnHidden = true;
                        _this.pause();
                    }
                });
                this._engine.on('visible', function () {
                    if (engine.pauseAudioWhenHidden && _this._wasPlayingOnHidden) {
                        _this.play();
                        _this._wasPlayingOnHidden = false;
                    }
                });
            }
        };
        /**
         * Sets the volume of the sound clip
         * @method setVolume
         * @param volume {number} A volume value between 0-1.0
         */
        Sound.prototype.setVolume = function (volume) {
            if (this.sound)
                this.sound.setVolume(volume);
        };
        /**
         * Indicates whether the clip should loop when complete
         * @method setLoop
         * @param loop {boolean} Set the looping flag
         */
        Sound.prototype.setLoop = function (loop) {
            if (this.sound)
                this.sound.setLoop(loop);
        };
        Sound.prototype.isPlaying = function () {
            if (this.sound)
                return this.sound.isPlaying();
        };
        /**
         * Play the sound, returns a promise that resolves when the sound is done playing
         * @method play
         * @return ex.Promise
         */
        Sound.prototype.play = function () {
            if (this.sound)
                return this.sound.play();
        };
        /**
         * Stop the sound, and do not rewind
         * @method pause
         */
        Sound.prototype.pause = function () {
            if (this.sound)
                this.sound.pause();
        };
        /**
         * Stop the sound and rewind
         * @method stop
         */
        Sound.prototype.stop = function () {
            if (this.sound)
                this.sound.stop();
        };
        /**
         * Returns true if the sound is loaded
         * @method isLoaded
         */
        Sound.prototype.isLoaded = function () {
            return this._isLoaded;
        };
        /**
         * Begins loading the sound and returns a promise to be resolved on completion
         * @method load
         * @returns Promise&lt;Sound&gt;
         */
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
                complete.resolve(e);
            };
            this.sound.load();
            return complete;
        };
        return Sound;
    })();
    ex.Sound = Sound;
    /**
     * The loader provides a mechanism to preload multiple resources at
     * one time. The loader must be passed to the engine in order to
     * trigger the loading progress bar
     * @class Loader
     * @extend ILoadable
     * @constructor
     * @param [loadables=undefined] {ILoadable[]} Optionally provide the list of resources you want to load at constructor time
     */
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
        Loader.prototype.wireEngine = function (engine) {
            this._engine = engine;
        };
        /**
         * Add a resource to the loader to load
         * @method addResource
         * @param loadable {ILoadable} Resource to add
         */
        Loader.prototype.addResource = function (loadable) {
            var key = this.index++;
            this.resourceList.push(loadable);
            this.progressCounts[key] = 0;
            this.totalCounts[key] = 1;
            this.resourceCount++;
        };
        /**
         * Add a list of resources to the loader to load
         * @method addResources
         * @param loadables {ILoadable[]} The list of resources to load
         */
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
        /**
         * Returns true if the loader has completely loaded all resources
         * @method isLoaded
         */
        Loader.prototype.isLoaded = function () {
            return this.numLoaded === this.resourceCount;
        };
        /**
         * Begin loading all of the supplied resources, returning a promise that resolves when loading of all is complete
         * @method load
         * @returns Promsie&lt;any&gt;
         */
        Loader.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var me = this;
            if (this.resourceList.length === 0) {
                me.oncomplete.call(me);
                return complete;
            }
            var progressArray = new Array(this.resourceList.length);
            var progressChunks = this.resourceList.length;
            this.resourceList.forEach(function (r, i) {
                if (_this._engine) {
                    r.wireEngine(_this._engine);
                }
                r.onprogress = function (e) {
                    var total = e.total;
                    var loaded = e.loaded;
                    progressArray[i] = { loaded: ((loaded / total) * (100 / progressChunks)), total: 100 };
                    var progressResult = progressArray.reduce(function (accum, next) {
                        return { loaded: (accum.loaded + next.loaded), total: 100 };
                    }, { loaded: 0, total: 100 });
                    me.onprogress.call(me, progressResult);
                };
                r.oncomplete = r.onerror = function () {
                    me.numLoaded++;
                    if (me.numLoaded === me.resourceCount) {
                        me.onprogress.call(me, { loaded: 100, total: 100 });
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
/// <reference path="Promises.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Log.ts" />
var ex;
(function (ex) {
    /**
     * Excalibur's built in templating class, it is a loadable that will load
     * and html fragment from a url. Excalibur templating is very basic only
     * allowing bindings of the type data-text="this.obj.someprop",
     * data-style="color:this.obj.color.toString()". Bindings allow all valid
     * javascript expressions.
     * @class Template
     * @extends ILoadable
     * @constructor
     * @param path {string} Location of the html template
     */
    var Template = (function () {
        function Template(path) {
            this.path = path;
            this._isLoaded = false;
            this.logger = ex.Logger.getInstance();
            this.onprogress = function () {
            };
            this.oncomplete = function () {
            };
            this.onerror = function () {
            };
            this._innerElement = document.createElement('div');
            this._innerElement.className = "excalibur-template";
        }
        Template.prototype.wireEngine = function (engine) {
            this._engine = engine;
        };
        /**
         * Returns the full html template string once loaded.
         * @method getTemplateString
         * @returns string
         */
        Template.prototype.getTemplateString = function () {
            if (!this._isLoaded)
                return "";
            return this._htmlString;
        };
        Template.prototype._compile = function () {
            this._innerElement.innerHTML = this._htmlString;
            this._styleElements = this._innerElement.querySelectorAll('[data-style]');
            this._textElements = this._innerElement.querySelectorAll('[data-text]');
        };
        Template.prototype._evaluateExpresion = function (expression, ctx) {
            var func = new Function("return " + expression + ";");
            var val = func.call(ctx);
            return val;
        };
        /**
         * Applies any ctx object you wish and evaluates the template.
         * Overload this method to include your favorite template library.
         * You may return either an HTML string or a Dom node.
         * @method apply
         * @param ctx {any} Any object you wish to apply to the template
         * @returns any
         */
        Template.prototype.apply = function (ctx) {
            var _this = this;
            for (var j = 0; j < this._styleElements.length; j++) {
                (function () {
                    // poor man's json parse for things that aren't exactly json :(
                    // Extract style expressions
                    var styles = {};
                    _this._styleElements[j].dataset["style"].split(";").forEach(function (s) {
                        if (s) {
                            var vals = s.split(":");
                            styles[vals[0].trim()] = vals[1].trim();
                        }
                    });
                    for (var style in styles) {
                        (function () {
                            var expression = styles[style];
                            _this._styleElements[j].style[style] = _this._evaluateExpresion(expression, ctx);
                        })();
                    }
                })();
            }
            for (var i = 0; i < this._textElements.length; i++) {
                (function () {
                    // Evaluate text expressions
                    var expression = _this._textElements[i].dataset["text"];
                    _this._textElements[i].innerText = _this._evaluateExpresion(expression, ctx);
                })();
            }
            // If the template HTML has a root element return that, otherwise use constructed root
            if (this._innerElement.children.length === 1) {
                this._innerElement = this._innerElement.firstChild;
            }
            return this._innerElement;
        };
        /**
         * Begins loading the template. Returns a promise that resolves with the template string when loaded.
         * @method load
         * @returns {Promise}
         */
        Template.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var request = new XMLHttpRequest();
            request.open("GET", this.path, true);
            request.responseType = "text";
            request.onprogress = this.onprogress;
            request.onerror = this.onerror;
            request.onload = function (e) {
                if (request.status !== 200) {
                    _this.logger.error("Failed to load html template resource ", _this.path, " server responded with error code", request.status);
                    _this.onerror(request.response);
                    _this._isLoaded = false;
                    complete.resolve("error");
                    return;
                }
                _this._htmlString = request.response;
                _this.oncomplete();
                _this.logger.debug("Completed loading template", _this.path);
                _this._compile();
                _this._isLoaded = true;
                complete.resolve(_this._htmlString);
            };
            if (request.overrideMimeType) {
                request.overrideMimeType('text/plain; charset=x-user-defined');
            }
            request.send();
            return complete;
        };
        /**
         * Indicates whether the template has been loaded
         * @method isLoaded
         * @returns {boolean}
         */
        Template.prototype.isLoaded = function () {
            return this._isLoaded;
        };
        return Template;
    })();
    ex.Template = Template;
    /**
     * Excalibur's binding library that allows you to bind an html
     * template to the dom given a certain context. Excalibur bindings are only updated
     * when the update() method is called
     * @class Binding
     * @constructor
     * @param parentElementId {string} The id of the element in the dom to attach the template binding
     * @param template {Template} The template you wish to bind
     * @param ctx {any} The context of the binding, which can be any object
     */
    var Binding = (function () {
        function Binding(parentElementId, template, ctx) {
            this.parent = document.getElementById(parentElementId);
            this.template = template;
            this._ctx = ctx;
            this.update();
        }
        /**
         * Listen to any arbitrary object's events to update this binding
         * @method listen
         * @param obj {any} Any object that supports addEventListener
         * @param events {string[]} A list of events to listen for
         * @param [hander=defaultHandler] {callback} A optional handler to fire on any event
         */
        Binding.prototype.listen = function (obj, events, handler) {
            var _this = this;
            // todo
            if (!handler) {
                handler = function () {
                    _this.update();
                };
            }
            if (obj.addEventListener) {
                events.forEach(function (e) {
                    obj.addEventListener(e, handler);
                });
            }
        };
        /**
         * Update this template binding with the latest values from the ctx reference passed to the constructor
         * @method update
         */
        Binding.prototype.update = function () {
            var html = this._applyTemplate(this.template, this._ctx);
            if (html instanceof String) {
                this.parent.innerHTML = html;
            }
            if (html instanceof Node) {
                if (this.parent.lastChild !== html) {
                    this.parent.appendChild(html);
                }
            }
        };
        Binding.prototype._applyTemplate = function (template, ctx) {
            if (template.isLoaded()) {
                return template.apply(ctx);
            }
        };
        return Binding;
    })();
    ex.Binding = Binding;
})(ex || (ex = {}));
/// <reference path="Actor.ts" />
var ex;
(function (ex) {
    /**
     * Enum representing the different horizontal text alignments
     * @class TextAlign
     */
    (function (TextAlign) {
        /**
         * The text is left-aligned.
         * @property Left
         * @static
         */
        TextAlign[TextAlign["Left"] = 0] = "Left";
        /**
         * The text is right-aligned.
         * @property Right
         * @static
         */
        TextAlign[TextAlign["Right"] = 1] = "Right";
        /**
         * The text is centered.
         * @property Center
         * @static
         */
        TextAlign[TextAlign["Center"] = 2] = "Center";
        /**
         * The text is aligned at the normal start of the line (left-aligned for left-to-right locales, right-aligned for right-to-left locales).
         * @property Start
         * @static
         */
        TextAlign[TextAlign["Start"] = 3] = "Start";
        /**
         * The text is aligned at the normal end of the line (right-aligned for left-to-right locales, left-aligned for right-to-left locales).
         * @property End
         * @static
         */
        TextAlign[TextAlign["End"] = 4] = "End";
    })(ex.TextAlign || (ex.TextAlign = {}));
    var TextAlign = ex.TextAlign;
    /**
     * Enum representing the different baseline text alignments
     * @class BaseAlign
     */
    (function (BaseAlign) {
        /**
         * The text baseline is the top of the em square.
         * @property Top
         * @static
         */
        BaseAlign[BaseAlign["Top"] = 0] = "Top";
        /**
         * The text baseline is the hanging baseline.  Currently unsupported; this will act like alphabetic.
         * @property Hanging
         * @static
         */
        BaseAlign[BaseAlign["Hanging"] = 1] = "Hanging";
        /**
         * The text baseline is the middle of the em square.
         * @property Middle
         * @static
         */
        BaseAlign[BaseAlign["Middle"] = 2] = "Middle";
        /**
         * The text baseline is the normal alphabetic baseline.
         * @property Alphabetic
         * @static
         */
        BaseAlign[BaseAlign["Alphabetic"] = 3] = "Alphabetic";
        /**
         * The text baseline is the ideographic baseline; this is the bottom of
         * the body of the characters, if the main body of characters protrudes
         * beneath the alphabetic baseline.  Currently unsupported; this will
         * act like alphabetic.
         * @property Ideographic
         * @static
         */
        BaseAlign[BaseAlign["Ideographic"] = 4] = "Ideographic";
        /**
         * The text baseline is the bottom of the bounding box.  This differs
         * from the ideographic baseline in that the ideographic baseline
         * doesn't consider descenders.
         * @property Bottom
         * @static
         */
        BaseAlign[BaseAlign["Bottom"] = 5] = "Bottom";
    })(ex.BaseAlign || (ex.BaseAlign = {}));
    var BaseAlign = ex.BaseAlign;
    /**
     * Labels are the way to draw small amounts of text to the screen in Excalibur. They are
     * actors and inherit all of the benifits and capabilities.
     * @class Label
     * @extends Actor
     * @constructor
     * @param [text=empty] {string} The text of the label
     * @param [x=0] {number} The x position of the label
     * @param [y=0] {number} The y position of the label
     * @param [font=sans-serif] {string} Use any valid css font string for the label's font. Default is "10px sans-serif".
     * @param [spriteFont=undefined] {SpriteFont} Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precendence over a css font.
     *
     */
    var Label = (function (_super) {
        __extends(Label, _super);
        function Label(text, x, y, font, spriteFont) {
            _super.call(this, x, y);
            /**
             * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
             * @property [letterSpacing=0] {number}
             */
            this.letterSpacing = 0; //px
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
            this.collisionType = 0 /* PreventCollision */;
            this.font = font || "10px sans-serif"; // coallesce to default canvas font
            if (spriteFont) {
                this._textSprites = spriteFont.getTextSprites();
            }
        }
        /**
         * Returns the width of the text in the label (in pixels);
         * @method getTextWidth {number}
         * @param ctx {CanvasRenderingContext2D} Rending context to measure the string with
         */
        Label.prototype.getTextWidth = function (ctx) {
            var oldFont = ctx.font;
            ctx.font = this.font;
            var width = ctx.measureText(this.text).width;
            ctx.font = oldFont;
            return width;
        };
        // TypeScript doesn't support string enums :(
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
        /**
         * Sets the text shadow for sprite fonts
         * @method setTextShadow
         * @param offsetX {number} The x offset in pixels to place the shadow
         * @param offsetY {number} The y offset in pixles to place the shadow
         * @param shadowColor {Color} The color of the text shadow
         */
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
        /**
         * Clears the current text shadow
         * @method clearTextShadow
         */
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
            ctx.scale(this.scale.x, this.scale.y);
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
            if (this.spriteFont) {
                var currX = 0;
                for (var i = 0; i < this.text.length; i++) {
                    var character = this.text[i];
                    if (this.caseInsensitive) {
                        character = character.toLowerCase();
                    }
                    try {
                        var charSprite = sprites[character];
                        if (this.previousOpacity !== this.opacity) {
                            charSprite.clearEffects();
                            charSprite.addEffect(new ex.Effects.Opacity(this.opacity));
                        }
                        charSprite.draw(ctx, currX, 0);
                        currX += (charSprite.swidth + this.letterSpacing);
                    }
                    catch (e) {
                        ex.Logger.getInstance().error("SpriteFont Error drawing char " + character);
                    }
                }
                if (this.previousOpacity !== this.opacity) {
                    this.previousOpacity = this.opacity;
                }
            }
            else {
                var oldAlign = ctx.textAlign;
                var oldTextBaseline = ctx.textBaseline;
                ctx.textAlign = this._lookupTextAlign(this.textAlign);
                ctx.textBaseline = this._lookupBaseAlign(this.baseAlign);
                if (this.color) {
                    this.color.a = this.opacity;
                }
                ctx.fillStyle = this.color.toString();
                ctx.font = this.font;
                if (this.maxWidth) {
                    ctx.fillText(this.text, 0, 0, this.maxWidth);
                }
                else {
                    ctx.fillText(this.text, 0, 0);
                }
                ctx.textAlign = oldAlign;
                ctx.textBaseline = oldTextBaseline;
            }
        };
        Label.prototype.debugDraw = function (ctx) {
            _super.prototype.debugDraw.call(this, ctx);
        };
        return Label;
    })(ex.Actor);
    ex.Label = Label;
})(ex || (ex = {}));
/// <reference path="../Events.ts"/>
var ex;
(function (ex) {
    var Input;
    (function (Input) {
        (function (PointerType) {
            PointerType[PointerType["Touch"] = 0] = "Touch";
            PointerType[PointerType["Mouse"] = 1] = "Mouse";
            PointerType[PointerType["Pen"] = 2] = "Pen";
            PointerType[PointerType["Unknown"] = 3] = "Unknown";
        })(Input.PointerType || (Input.PointerType = {}));
        var PointerType = Input.PointerType;
        (function (PointerButton) {
            PointerButton[PointerButton["Left"] = 0] = "Left";
            PointerButton[PointerButton["Middle"] = 1] = "Middle";
            PointerButton[PointerButton["Right"] = 2] = "Right";
            PointerButton[PointerButton["Unknown"] = 3] = "Unknown";
        })(Input.PointerButton || (Input.PointerButton = {}));
        var PointerButton = Input.PointerButton;
        var PointerEvent = (function (_super) {
            __extends(PointerEvent, _super);
            function PointerEvent(x, y, index, pointerType, button, ev) {
                _super.call(this);
                this.x = x;
                this.y = y;
                this.index = index;
                this.pointerType = pointerType;
                this.button = button;
                this.ev = ev;
            }
            return PointerEvent;
        })(ex.GameEvent);
        Input.PointerEvent = PointerEvent;
        ;
        /**
         * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to W3C Pointer Events.
         * There is always at least one pointer available (primary).
         *
         * @class Pointers
         * @extends Class
         * @constructor
         */
        var Pointers = (function (_super) {
            __extends(Pointers, _super);
            function Pointers(engine) {
                _super.call(this);
                this._pointerDown = [];
                this._pointerUp = [];
                this._pointerMove = [];
                this._pointerCancel = [];
                this._pointers = [];
                this._activePointers = [];
                this._engine = engine;
                this._pointers.push(new Pointer());
                this._activePointers = [-1];
                this.primary = this._pointers[0];
            }
            /**
             * Initializes pointer event listeners
             */
            Pointers.prototype.init = function () {
                // Touch Events
                this._engine.canvas.addEventListener('touchstart', this._handleTouchEvent("down", this._pointerDown));
                this._engine.canvas.addEventListener('touchend', this._handleTouchEvent("up", this._pointerUp));
                this._engine.canvas.addEventListener('touchmove', this._handleTouchEvent("move", this._pointerMove));
                this._engine.canvas.addEventListener('touchcancel', this._handleTouchEvent("cancel", this._pointerCancel));
                // W3C Pointer Events
                // Current: IE11, IE10
                if (window.PointerEvent) {
                    // IE11
                    this._engine.canvas.style.touchAction = "none";
                    this._engine.canvas.addEventListener('pointerdown', this._handlePointerEvent("down", this._pointerDown));
                    this._engine.canvas.addEventListener('pointerup', this._handlePointerEvent("up", this._pointerUp));
                    this._engine.canvas.addEventListener('pointermove', this._handlePointerEvent("move", this._pointerMove));
                    this._engine.canvas.addEventListener('pointercancel', this._handlePointerEvent("cancel", this._pointerMove));
                }
                else if (window.MSPointerEvent) {
                    // IE10
                    this._engine.canvas.style.msTouchAction = "none";
                    this._engine.canvas.addEventListener('MSPointerDown', this._handlePointerEvent("down", this._pointerDown));
                    this._engine.canvas.addEventListener('MSPointerUp', this._handlePointerEvent("up", this._pointerUp));
                    this._engine.canvas.addEventListener('MSPointerMove', this._handlePointerEvent("move", this._pointerMove));
                    this._engine.canvas.addEventListener('MSPointerCancel', this._handlePointerEvent("cancel", this._pointerMove));
                }
                else {
                    // Mouse Events
                    this._engine.canvas.addEventListener('mousedown', this._handleMouseEvent("down", this._pointerDown));
                    this._engine.canvas.addEventListener('mouseup', this._handleMouseEvent("up", this._pointerUp));
                    this._engine.canvas.addEventListener('mousemove', this._handleMouseEvent("move", this._pointerMove));
                }
            };
            Pointers.prototype.update = function (delta) {
                this._pointerUp.length = 0;
                this._pointerDown.length = 0;
                this._pointerMove.length = 0;
                this._pointerCancel.length = 0;
            };
            /**
             * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
             * @param index {number} The pointer index to retrieve
             */
            Pointers.prototype.at = function (index) {
                if (index >= this._pointers.length) {
                    for (var i = this._pointers.length - 1, max = index; i < max; i++) {
                        this._pointers.push(new Pointer());
                        this._activePointers.push(-1);
                    }
                }
                return this._pointers[index];
            };
            /**
             * Get number of pointers being watched
             */
            Pointers.prototype.count = function () {
                return this._pointers.length;
            };
            /**
             * Propogates events to actor if necessary
             */
            Pointers.prototype.propogate = function (actor) {
                var isUIActor = actor instanceof ex.UIActor;
                this._pointerUp.forEach(function (e) {
                    if (actor.contains(e.x, e.y, !isUIActor)) {
                        actor.eventDispatcher.publish("pointerup", e);
                    }
                });
                this._pointerDown.forEach(function (e) {
                    if (actor.contains(e.x, e.y, !isUIActor)) {
                        actor.eventDispatcher.publish("pointerdown", e);
                    }
                });
                if (actor.capturePointer.captureMoveEvents) {
                    this._pointerMove.forEach(function (e) {
                        if (actor.contains(e.x, e.y, !isUIActor)) {
                            actor.eventDispatcher.publish("pointermove", e);
                        }
                    });
                }
                this._pointerCancel.forEach(function (e) {
                    if (actor.contains(e.x, e.y, !isUIActor)) {
                        actor.eventDispatcher.publish("pointercancel", e);
                    }
                });
            };
            Pointers.prototype._handleMouseEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    var x = e.pageX - ex.Util.getPosition(_this._engine.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this._engine.canvas).y;
                    var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Point(x, y));
                    var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, 0, 1 /* Mouse */, e.button, e);
                    eventArr.push(pe);
                    _this.at(0).eventDispatcher.publish(eventName, pe);
                };
            };
            Pointers.prototype._handleTouchEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    for (var i = 0, len = e.changedTouches.length; i < len; i++) {
                        var index = _this._pointers.length > 1 ? _this._getPointerIndex(e.changedTouches[i].identifier) : 0;
                        if (index === -1)
                            continue;
                        var x = e.changedTouches[i].pageX - ex.Util.getPosition(_this._engine.canvas).x;
                        var y = e.changedTouches[i].pageY - ex.Util.getPosition(_this._engine.canvas).y;
                        var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Point(x, y));
                        var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, 0 /* Touch */, 3 /* Unknown */, e);
                        eventArr.push(pe);
                        _this.at(index).eventDispatcher.publish(eventName, pe);
                        // only with multi-pointer
                        if (_this._pointers.length > 1) {
                            if (eventName === "up") {
                                // remove pointer ID from pool when pointer is lifted
                                _this._activePointers[index] = -1;
                            }
                            else if (eventName === "down") {
                                // set pointer ID to given index
                                _this._activePointers[index] = e.changedTouches[i].identifier;
                            }
                        }
                    }
                };
            };
            Pointers.prototype._handlePointerEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    // get the index for this pointer ID if multi-pointer is asked for
                    var index = _this._pointers.length > 1 ? _this._getPointerIndex(e.pointerId) : 0;
                    if (index === -1)
                        return;
                    var x = e.pageX - ex.Util.getPosition(_this._engine.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this._engine.canvas).y;
                    var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Point(x, y));
                    var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, _this._stringToPointerType(e.pointerType), e.button, e);
                    eventArr.push(pe);
                    _this.at(index).eventDispatcher.publish(eventName, pe);
                    // only with multi-pointer
                    if (_this._pointers.length > 1) {
                        if (eventName === "up") {
                            // remove pointer ID from pool when pointer is lifted
                            _this._activePointers[index] = -1;
                        }
                        else if (eventName === "down") {
                            // set pointer ID to given index
                            _this._activePointers[index] = e.pointerId;
                        }
                    }
                };
            };
            /**
             * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
             * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
             * @private
             */
            Pointers.prototype._getPointerIndex = function (pointerId) {
                var idx;
                if ((idx = this._activePointers.indexOf(pointerId)) > -1) {
                    return idx;
                }
                for (var i = 0; i < this._activePointers.length; i++) {
                    if (this._activePointers[i] === -1)
                        return i;
                }
                // ignore pointer because game isn't watching
                return -1;
            };
            Pointers.prototype._stringToPointerType = function (s) {
                switch (s) {
                    case "touch":
                        return 0 /* Touch */;
                    case "mouse":
                        return 1 /* Mouse */;
                    case "pen":
                        return 2 /* Pen */;
                    default:
                        return 3 /* Unknown */;
                }
            };
            return Pointers;
        })(ex.Class);
        Input.Pointers = Pointers;
        /**
         * Captures and dispatches PointerEvents
         * @class Pointer
         * @constructor
         * @extends Class
         */
        var Pointer = (function (_super) {
            __extends(Pointer, _super);
            function Pointer() {
                _super.apply(this, arguments);
            }
            return Pointer;
        })(ex.Class);
        Input.Pointer = Pointer;
    })(Input = ex.Input || (ex.Input = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Input;
    (function (Input) {
        /**
        * Enum representing input key codes
        * @class Keys
        *
        */
        (function (Keys) {
            /**
            @property Num1 {Keys}
            */
            /**
            @property Num2 {Keys}
            */
            /**
            @property Num3 {Keys}
            */
            /**
            @property Num4 {Keys}
            */
            /**
            @property Num5 {Keys}
            */
            /**
            @property Num6 {Keys}
            */
            /**
            @property Num7 {Keys}
            */
            /**
            @property Num8 {Keys}
            */
            /**
            @property Num9 {Keys}
            */
            /**
            @property Num0 {Keys}
            */
            Keys[Keys["Num1"] = 97] = "Num1";
            Keys[Keys["Num2"] = 98] = "Num2";
            Keys[Keys["Num3"] = 99] = "Num3";
            Keys[Keys["Num4"] = 100] = "Num4";
            Keys[Keys["Num5"] = 101] = "Num5";
            Keys[Keys["Num6"] = 102] = "Num6";
            Keys[Keys["Num7"] = 103] = "Num7";
            Keys[Keys["Num8"] = 104] = "Num8";
            Keys[Keys["Num9"] = 105] = "Num9";
            Keys[Keys["Num0"] = 96] = "Num0";
            /**
            @property Numlock {Keys}
            */
            Keys[Keys["Numlock"] = 144] = "Numlock";
            /**
            @property Semicolon {Keys}
            */
            Keys[Keys["Semicolon"] = 186] = "Semicolon";
            /**
            @property A {Keys}
            */
            /**
            @property B {Keys}
            */
            /**
            @property C {Keys}
            */
            /**
            @property D {Keys}
            */
            /**
            @property E {Keys}
            */
            /**
            @property F {Keys}
            */
            /**
            @property G {Keys}
            */
            /**
            @property H {Keys}
            */
            /**
            @property I {Keys}
            */
            /**
            @property J {Keys}
            */
            /**
            @property K {Keys}
            */
            /**
            @property L {Keys}
            */
            /**
            @property M {Keys}
            */
            /**
            @property N {Keys}
            */
            /**
            @property O {Keys}
            */
            /**
            @property P {Keys}
            */
            /**
            @property Q {Keys}
            */
            /**
            @property R {Keys}
            */
            /**
            @property S {Keys}
            */
            /**
            @property T {Keys}
            */
            /**
            @property U {Keys}
            */
            /**
            @property V {Keys}
            */
            /**
            @property W {Keys}
            */
            /**
            @property X {Keys}
            */
            /**
            @property Y {Keys}
            */
            /**
            @property Z {Keys}
            */
            Keys[Keys["A"] = 65] = "A";
            Keys[Keys["B"] = 66] = "B";
            Keys[Keys["C"] = 67] = "C";
            Keys[Keys["D"] = 68] = "D";
            Keys[Keys["E"] = 69] = "E";
            Keys[Keys["F"] = 70] = "F";
            Keys[Keys["G"] = 71] = "G";
            Keys[Keys["H"] = 72] = "H";
            Keys[Keys["I"] = 73] = "I";
            Keys[Keys["J"] = 74] = "J";
            Keys[Keys["K"] = 75] = "K";
            Keys[Keys["L"] = 76] = "L";
            Keys[Keys["M"] = 77] = "M";
            Keys[Keys["N"] = 78] = "N";
            Keys[Keys["O"] = 79] = "O";
            Keys[Keys["P"] = 80] = "P";
            Keys[Keys["Q"] = 81] = "Q";
            Keys[Keys["R"] = 82] = "R";
            Keys[Keys["S"] = 83] = "S";
            Keys[Keys["T"] = 84] = "T";
            Keys[Keys["U"] = 85] = "U";
            Keys[Keys["V"] = 86] = "V";
            Keys[Keys["W"] = 87] = "W";
            Keys[Keys["X"] = 88] = "X";
            Keys[Keys["Y"] = 89] = "Y";
            Keys[Keys["Z"] = 90] = "Z";
            /**
            @property Shift {Keys}
            */
            /**
            @property Alt {Keys}
            */
            /**
            @property Up {Keys}
            */
            /**
            @property Down {Keys}
            */
            /**
            @property Left {Keys}
            */
            /**
            @property Right {Keys}
            */
            /**
            @property Space {Keys}
            */
            /**
            @property Esc {Keys}
            */
            Keys[Keys["Shift"] = 16] = "Shift";
            Keys[Keys["Alt"] = 18] = "Alt";
            Keys[Keys["Up"] = 38] = "Up";
            Keys[Keys["Down"] = 40] = "Down";
            Keys[Keys["Left"] = 37] = "Left";
            Keys[Keys["Right"] = 39] = "Right";
            Keys[Keys["Space"] = 32] = "Space";
            Keys[Keys["Esc"] = 27] = "Esc";
        })(Input.Keys || (Input.Keys = {}));
        var Keys = Input.Keys;
        ;
        /**
         * Event thrown on a game object for a key event
         *
         * @class KeyEvent
         * @extends GameEvent
         * @constructor
         * @param key {InputKey} The key responsible for throwing the event
         */
        var KeyEvent = (function (_super) {
            __extends(KeyEvent, _super);
            function KeyEvent(key) {
                _super.call(this);
                this.key = key;
            }
            return KeyEvent;
        })(ex.GameEvent);
        Input.KeyEvent = KeyEvent;
        /**
         * Manages Keyboard input events that you can query or listen for events on
         *
         * @class Keyboard
         * @extends Class
         * @constructor
         *
         */
        var Keyboard = (function (_super) {
            __extends(Keyboard, _super);
            function Keyboard(engine) {
                _super.call(this);
                this._keys = [];
                this._keysUp = [];
                this._keysDown = [];
                this._engine = engine;
            }
            /**
             * Initialize Keyboard event listeners
             */
            Keyboard.prototype.init = function () {
                var _this = this;
                window.addEventListener('blur', function (ev) {
                    _this._keys.length = 0; // empties array efficiently
                });
                // key up is on window because canvas cannot have focus
                window.addEventListener('keyup', function (ev) {
                    var key = _this._keys.indexOf(ev.keyCode);
                    _this._keys.splice(key, 1);
                    _this._keysUp.push(ev.keyCode);
                    var keyEvent = new KeyEvent(ev.keyCode);
                    _this.eventDispatcher.publish("up", keyEvent);
                });
                // key down is on window because canvas cannot have focus
                window.addEventListener('keydown', function (ev) {
                    if (_this._keys.indexOf(ev.keyCode) === -1) {
                        _this._keys.push(ev.keyCode);
                        _this._keysDown.push(ev.keyCode);
                        var keyEvent = new KeyEvent(ev.keyCode);
                        _this.eventDispatcher.publish("down", keyEvent);
                    }
                });
            };
            Keyboard.prototype.update = function (delta) {
                // Reset keysDown and keysUp after update is complete
                this._keysDown.length = 0;
                this._keysUp.length = 0;
            };
            /**
             * Gets list of keys being pressed down
             */
            Keyboard.prototype.getKeys = function () {
                return this._keys;
            };
            /**
             *  Tests if a certain key is down.
             * @method isKeyDown
             * @param key {Keys} Test wether a key is down
             * @returns boolean
             */
            Keyboard.prototype.isKeyDown = function (key) {
                return this._keysDown.indexOf(key) > -1;
            };
            /**
             *  Tests if a certain key is pressed.
             * @method isKeyPressed
             * @param key {Keys} Test wether a key is pressed
             * @returns boolean
             */
            Keyboard.prototype.isKeyPressed = function (key) {
                return this._keys.indexOf(key) > -1;
            };
            /**
             *  Tests if a certain key is up.
             * @method isKeyUp
             * @param key {Keys} Test wether a key is up
             * @returns boolean
             */
            Keyboard.prototype.isKeyUp = function (key) {
                return this._keysUp.indexOf(key) > -1;
            };
            return Keyboard;
        })(ex.Class);
        Input.Keyboard = Keyboard;
    })(Input = ex.Input || (ex.Input = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Input;
    (function (Input) {
        /**
         * Manages Gamepad API input. You can query the gamepads that are connected
         * or listen to events ("button" and "axis").
         * @class Gamepads
         * @extends Class
         * @param pads {Gamepad[]} The connected gamepads.
         * @param supported {boolean} Whether or not the Gamepad API is present
         */
        var Gamepads = (function (_super) {
            __extends(Gamepads, _super);
            function Gamepads(engine) {
                _super.call(this);
                /**
                 * Whether or not to poll for Gamepad input (default: false)
                 * @property enabled {boolean}
                 */
                this.enabled = false;
                /**
                 * Whether or not Gamepad API is supported
                 * @property supported {boolean}
                 */
                this.supported = !!navigator.getGamepads;
                this._gamePadTimeStamps = [0, 0, 0, 0];
                this._oldPads = [];
                this._pads = [];
                this._initSuccess = false;
                this._navigator = navigator;
                this._engine = engine;
            }
            Gamepads.prototype.init = function () {
                if (!this.supported)
                    return;
                if (this._initSuccess)
                    return;
                // In Chrome, this will return 4 undefined items until a button is pressed
                // In FF, this will not return any items until a button is pressed
                this._oldPads = this._clonePads(this._navigator.getGamepads());
                if (this._oldPads.length && this._oldPads[0]) {
                    this._initSuccess = true;
                }
            };
            /**
             * Updates Gamepad state and publishes Gamepad events
             */
            Gamepads.prototype.update = function (delta) {
                if (!this.enabled || !this.supported)
                    return;
                this.init();
                var gamepads = this._navigator.getGamepads();
                for (var i = 0; i < gamepads.length; i++) {
                    if (!gamepads[i]) {
                        // Reset connection status
                        this.at(i).connected = false;
                        continue;
                    }
                    else {
                        // Set connection status
                        this.at(i).connected = true;
                    }
                    ;
                    // Only supported in Chrome
                    if (gamepads[i].timestamp && gamepads[i].timestamp === this._gamePadTimeStamps[i]) {
                        continue;
                    }
                    this._gamePadTimeStamps[i] = gamepads[i].timestamp;
                    // Buttons
                    var b, a, value, buttonIndex, axesIndex;
                    for (b in Buttons) {
                        if (typeof Buttons[b] !== "number")
                            continue;
                        buttonIndex = Buttons[b];
                        value = gamepads[i].buttons[buttonIndex].value;
                        if (value !== this._oldPads[i].getButton(buttonIndex)) {
                            if (gamepads[i].buttons[buttonIndex].pressed) {
                                this.at(i).updateButton(buttonIndex, value);
                                this.at(i).eventDispatcher.publish("button", new GamepadButtonEvent(buttonIndex, value));
                            }
                            else {
                                this.at(i).updateButton(buttonIndex, 0);
                            }
                        }
                    }
                    for (a in Axes) {
                        if (typeof Axes[a] !== "number")
                            continue;
                        axesIndex = Axes[a];
                        value = gamepads[i].axes[axesIndex];
                        if (value !== this._oldPads[i].getAxes(axesIndex)) {
                            this.at(i).updateAxes(axesIndex, value);
                            this.at(i).eventDispatcher.publish("axis", new GamepadAxisEvent(axesIndex, value));
                        }
                    }
                    this._oldPads[i] = this._clonePad(gamepads[i]);
                }
            };
            /**
             * Safely retrieves a Gamepad at a specific index and creates one if it doesn't yet exist
             */
            Gamepads.prototype.at = function (index) {
                if (index >= this._pads.length) {
                    for (var i = this._pads.length - 1, max = index; i < max; i++) {
                        this._pads.push(new Gamepad());
                        this._oldPads.push(new Gamepad());
                    }
                }
                return this._pads[index];
            };
            /**
             * Gets the number of connected gamepads
             */
            Gamepads.prototype.count = function () {
                return this._pads.filter(function (p) { return p.connected; }).length;
            };
            Gamepads.prototype._clonePads = function (pads) {
                var arr = [];
                for (var i = 0, len = pads.length; i < len; i++) {
                    arr.push(this._clonePad(pads[i]));
                }
                return arr;
            };
            /**
             * Fastest way to clone a known object is to do it yourself
             */
            Gamepads.prototype._clonePad = function (pad) {
                var i, len;
                var clonedPad = new Gamepad();
                if (!pad)
                    return clonedPad;
                for (i = 0, len = pad.buttons.length; i < len; i++) {
                    clonedPad.updateButton(i, pad.buttons[i].value);
                }
                for (i = 0, len = pad.axes.length; i < len; i++) {
                    clonedPad.updateAxes(i, pad.axes[i]);
                }
                return clonedPad;
            };
            /**
             * The minimum value an axis has to move before considering it a change
             * @property MinAxisMoveThreshold {number}
             * @static
             */
            Gamepads.MinAxisMoveThreshold = 0.05;
            return Gamepads;
        })(ex.Class);
        Input.Gamepads = Gamepads;
        /**
         * Individual state for a Gamepad
         * @class Gamepad
         * @extends Class
         */
        var Gamepad = (function (_super) {
            __extends(Gamepad, _super);
            function Gamepad() {
                _super.call(this);
                this.connected = false;
                this._buttons = new Array(16);
                this._axes = new Array(4);
                var i;
                for (i = 0; i < this._buttons.length; i++) {
                    this._buttons[i] = 0;
                }
                for (i = 0; i < this._axes.length; i++) {
                    this._axes[i] = 0;
                }
            }
            /**
             * Whether or not the given button is pressed
             * @param button {Buttons}
             * @param [threshold=1] {number} The threshold over which the button is considered to be pressed
             */
            Gamepad.prototype.isButtonPressed = function (button, threshold) {
                if (threshold === void 0) { threshold = 1; }
                return this._buttons[button] >= threshold;
            };
            /**
             * Gets the given button value
             * @param button {Buttons}
             */
            Gamepad.prototype.getButton = function (button) {
                return this._buttons[button];
            };
            /**
             * Gets the given axis value
             * @param axes {Axes}
             */
            Gamepad.prototype.getAxes = function (axes) {
                var value = this._axes[axes];
                if (Math.abs(value) < Gamepads.MinAxisMoveThreshold) {
                    return 0;
                }
                else {
                    return value;
                }
            };
            Gamepad.prototype.updateButton = function (buttonIndex, value) {
                this._buttons[buttonIndex] = value;
            };
            Gamepad.prototype.updateAxes = function (axesIndex, value) {
                this._axes[axesIndex] = value;
            };
            return Gamepad;
        })(ex.Class);
        Input.Gamepad = Gamepad;
        /**
         * Gamepad Buttons enumeration
         * @class Buttons
         */
        (function (Buttons) {
            /**
             * Face 1 button (e.g. A)
             * @property Face1 {Buttons}
             * @static
             */
            /**
             * Face 2 button (e.g. B)
             * @property Face2 {Buttons}
             * @static
             */
            /**
             * Face 3 button (e.g. X)
             * @property Face3 {Buttons}
             * @static
             */
            /**
             * Face 4 button (e.g. Y)
             * @property Face4 {Buttons}
             * @static
             */
            Buttons[Buttons["Face1"] = 0] = "Face1";
            Buttons[Buttons["Face2"] = 1] = "Face2";
            Buttons[Buttons["Face3"] = 2] = "Face3";
            Buttons[Buttons["Face4"] = 3] = "Face4";
            /**
             * Left bumper button
             * @property LeftBumper {Buttons}
             * @static
             */
            /**
             * Right bumper button
             * @property RightBumper {Buttons}
             * @static
             */
            Buttons[Buttons["LeftBumper"] = 4] = "LeftBumper";
            Buttons[Buttons["RightBumper"] = 5] = "RightBumper";
            /**
             * Left trigger button
             * @property LeftTrigger {Buttons}
             * @static
             */
            /**
             * Right trigger button
             * @property RightTrigger {Buttons}
             * @static
             */
            Buttons[Buttons["LeftTrigger"] = 6] = "LeftTrigger";
            Buttons[Buttons["RightTrigger"] = 7] = "RightTrigger";
            /**
             * Select button
             * @property Select {Buttons}
             * @static
             */
            /**
             * Start button
             * @property Start {Buttons}
             * @static
             */
            Buttons[Buttons["Select"] = 8] = "Select";
            Buttons[Buttons["Start"] = 9] = "Start";
            /**
             * Left analog stick press (e.g. L3)
             * @property LeftStick {Buttons}
             * @static
             */
            /**
             * Right analog stick press (e.g. R3)
             * @property Start {Buttons}
             * @static
             */
            Buttons[Buttons["LeftStick"] = 10] = "LeftStick";
            Buttons[Buttons["RightStick"] = 11] = "RightStick";
            /**
             * D-pad up
             * @property DpadUp {Buttons}
             * @static
             */
            /**
             * D-pad down
             * @property DpadDown {Buttons}
             * @static
             */
            /**
             * D-pad left
             * @property DpadLeft {Buttons}
             * @static
             */
            /**
             * D-pad right
             * @property DpadRight {Buttons}
             * @static
             */
            Buttons[Buttons["DpadUp"] = 12] = "DpadUp";
            Buttons[Buttons["DpadDown"] = 13] = "DpadDown";
            Buttons[Buttons["DpadLeft"] = 14] = "DpadLeft";
            Buttons[Buttons["DpadRight"] = 15] = "DpadRight";
        })(Input.Buttons || (Input.Buttons = {}));
        var Buttons = Input.Buttons;
        /**
         * Gamepad Axes enumeration
         * @class Axes
         */
        (function (Axes) {
            /**
             * Left analogue stick X direction
             * @property LeftStickX {Axes}
             * @static
             */
            /**
             * Left analogue stick Y direction
             * @property LeftStickY {Axes}
             * @static
             */
            /**
             * Right analogue stick X direction
             * @property RightStickX {Axes}
             * @static
             */
            /**
             * Right analogue stick Y direction
             * @property RightStickY {Axes}
             * @static
             */
            Axes[Axes["LeftStickX"] = 0] = "LeftStickX";
            Axes[Axes["LeftStickY"] = 1] = "LeftStickY";
            Axes[Axes["RightStickX"] = 2] = "RightStickX";
            Axes[Axes["RightStickY"] = 3] = "RightStickY";
        })(Input.Axes || (Input.Axes = {}));
        var Axes = Input.Axes;
        var GamepadButtonEvent = (function (_super) {
            __extends(GamepadButtonEvent, _super);
            function GamepadButtonEvent(button, value) {
                _super.call(this);
                this.button = button;
                this.value = value;
            }
            return GamepadButtonEvent;
        })(ex.GameEvent);
        Input.GamepadButtonEvent = GamepadButtonEvent;
        var GamepadAxisEvent = (function (_super) {
            __extends(GamepadAxisEvent, _super);
            function GamepadAxisEvent(axis, value) {
                _super.call(this);
                this.axis = axis;
                this.value = value;
            }
            return GamepadAxisEvent;
        })(ex.GameEvent);
        Input.GamepadAxisEvent = GamepadAxisEvent;
    })(Input = ex.Input || (ex.Input = {}));
})(ex || (ex = {}));
/// <reference path="MonkeyPatch.ts" />
/// <reference path="Events.ts" />
/// <reference path="EventDispatcher.ts" />
/// <reference path="Class.ts" />
/// <reference path="Color.ts" />
/// <reference path="Log.ts" />
/// <reference path="Collision/Side.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Actor.ts" />
/// <reference path="UIActor.ts" />
/// <reference path="Trigger.ts" />
/// <reference path="Particles.ts" />
/// <reference path="Animation.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Sound.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Promises.ts" />
/// <reference path="Util.ts" />
/// <reference path="Binding.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="Label.ts" />
/// <reference path="Input/IEngineInput.ts"/>
/// <reference path="Input/Pointer.ts"/>
/// <reference path="Input/Keyboard.ts"/>
/// <reference path="Input/Gamepad.ts"/>
var ex;
(function (ex) {
    /**
     * Enum representing the different display modes available to Excalibur
     * @class DisplayMode
     */
    (function (DisplayMode) {
        /**
         * Show the game as full screen
         * @property FullScreen {DisplayMode}
         */
        DisplayMode[DisplayMode["FullScreen"] = 0] = "FullScreen";
        /**
         * Scale the game to the parent DOM container
         * @property Container {DisplayMode}
         */
        DisplayMode[DisplayMode["Container"] = 1] = "Container";
        /**
         * Show the game as a fixed size
         * @Property Fixed {DisplayMode}
         */
        DisplayMode[DisplayMode["Fixed"] = 2] = "Fixed";
    })(ex.DisplayMode || (ex.DisplayMode = {}));
    var DisplayMode = ex.DisplayMode;
    // internal
    var AnimationNode = (function () {
        function AnimationNode(animation, x, y) {
            this.animation = animation;
            this.x = x;
            this.y = y;
        }
        return AnimationNode;
    })();
    /**
     * The 'Engine' is the main driver for a game. It is responsible for
     * starting/stopping the game, maintaining state, transmitting events,
     * loading resources, and managing the scene.
     *
     * @class Engine
     * @constructor
     * @param [width] {number} The width in pixels of the Excalibur game viewport
     * @param [height] {number} The height in pixels of the Excalibur game viewport
     * @param [canvasElementId] {string} If this is not specified, then a new canvas will be created and inserted into the body.
     * @param [displayMode] {DisplayMode} If this is not specified, then it will fall back to fixed if a height and width are specified, else the display mode will be FullScreen.
     */
    var Engine = (function (_super) {
        __extends(Engine, _super);
        function Engine(width, height, canvasElementId, displayMode) {
            _super.call(this);
            /**
             * Sets or gets the collision strategy for Excalibur
             * @property collisionStrategy {CollisionStrategy}
             */
            this.collisionStrategy = 1 /* DynamicAABBTree */;
            this.hasStarted = false;
            this.sceneHash = {};
            this.animations = [];
            /**
             * Indicates whether the engine is set to fullscreen or not
             * @property isFullscreen {boolean}
             */
            this.isFullscreen = false;
            /**
             * Indicates the current DisplayMode of the engine.
             * @property [displayMode=FullScreen] {DisplayMode}
             */
            this.displayMode = 0 /* FullScreen */;
            /**
             * Indicates whether audio should be paused when the game is no longer visible.
             * @property [pauseAudioWhenHidden=true] {boolean}
             */
            this.pauseAudioWhenHidden = true;
            /**
             * Indicates whether the engine should draw with debug information
             * @property [isDebug=false] {boolean}
             */
            this.isDebug = false;
            this.debugColor = new ex.Color(255, 255, 255);
            /**
             * Sets the background color for the engine.
             * @property [backgroundColor=new Color(0, 0, 100)] {Color}
             */
            this.backgroundColor = new ex.Color(0, 0, 100);
            this.isSmoothingEnabled = true;
            this.isLoading = false;
            this.progress = 0;
            this.total = 1;
            console.log("Powered by Excalibur.js visit", "http://excaliburjs.com", "for more information.");
            this.logger = ex.Logger.getInstance();
            this.logger.debug("Building engine...");
            this.canvasElementId = canvasElementId;
            if (canvasElementId) {
                this.logger.debug("Using Canvas element specified: " + canvasElementId);
                this.canvas = document.getElementById(canvasElementId);
            }
            else {
                this.logger.debug("Using generated canvas element");
                this.canvas = document.createElement('canvas');
            }
            if (width && height) {
                if (displayMode == undefined) {
                    this.displayMode = 2 /* Fixed */;
                }
                this.logger.debug("Engine viewport is size " + width + " x " + height);
                this.width = width;
                this.canvas.width = width;
                this.height = height;
                this.canvas.height = height;
            }
            else if (!displayMode) {
                this.logger.debug("Engine viewport is fullscreen");
                this.displayMode = 0 /* FullScreen */;
            }
            this.loader = new ex.Loader();
            this.initialize();
            this.rootScene = this.currentScene = new ex.Scene(this);
            this.addScene('root', this.rootScene);
        }
        /**
         * Plays a sprite animation on the screen at the specified x and y
         * (in game coordinates, not screen pixels). These animations play
         * independent of actors, and will be cleaned up internally as soon
         * as they are complete. Note animations that loop will never be
         * cleaned up.
         * @method playAnimation
         * @param animation {Animation} Animation to play
         * @param x {number} x game coordinate to play the animation
         * @param y {number} y game coordinate to play the animation
         */
        Engine.prototype.playAnimation = function (animation, x, y) {
            this.animations.push(new AnimationNode(animation, x, y));
        };
        /**
         * Adds an actor to the current scene of the game. This is synonymous
         * to calling engine.currentScene.addChild(actor : Actor).
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the 'currentScene' may be drawn or updated.
         * @method addChild
         * @param actor {Actor} The actor to add to the current scene
         */
        Engine.prototype.addChild = function (actor) {
            this.currentScene.addChild(actor);
        };
        /**
         * Removes an actor from the currentScene of the game. This is synonymous
         * to calling engine.currentScene.removeChild(actor : Actor).
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @method removeChild
         * @param actor {Actor} The actor to remove from the current scene.
         */
        Engine.prototype.removeChild = function (actor) {
            this.currentScene.removeChild(actor);
        };
        /**
         * Adds a TileMap to the Scene, once this is done the TileMap will be drawn and updated.
         * @method addTileMap
         * @param tileMap {TileMap}
         */
        Engine.prototype.addTileMap = function (tileMap) {
            this.currentScene.addTileMap(tileMap);
        };
        /**
         * Removes a TileMap from the Scene, it willno longer be drawn or updated.
         * @method removeTileMap
         * @param tileMap {TileMap}
         */
        Engine.prototype.removeTileMap = function (tileMap) {
            this.currentScene.removeTileMap(tileMap);
        };
        /**
         * Adds an excalibur timer to the current scene.
         * @param timer {Timer} The timer to add to the current scene.
         * @method addTimer
         */
        Engine.prototype.addTimer = function (timer) {
            return this.currentScene.addTimer(timer);
        };
        /**
         * Removes an excalibur timer from the current scene.
         * @method removeTimer
         * @param timer {Timer} The timer to remove to the current scene.
         */
        Engine.prototype.removeTimer = function (timer) {
            return this.currentScene.removeTimer(timer);
        };
        /**
         * Adds a scene to the engine, think of scenes in excalibur as you
         * would scenes in a play.
         * @method addScene
         * @param name {string} The name of the scene, must be unique
         * @param scene {Scene} The scene to add to the engine
         */
        Engine.prototype.addScene = function (name, scene) {
            if (this.sceneHash[name]) {
                this.logger.warn("Scene", name, "already exists overwriting");
            }
            this.sceneHash[name] = scene;
            scene.engine = this;
        };
        Engine.prototype.removeScene = function (entity) {
            if (entity instanceof ex.Scene) {
                for (var key in this.sceneHash) {
                    if (this.sceneHash.hasOwnProperty(key)) {
                        if (this.sceneHash[key] === entity) {
                            delete this.sceneHash[key];
                        }
                    }
                }
            }
            if (typeof entity === "string") {
                // remove scene
                delete this.sceneHash[entity];
            }
        };
        Engine.prototype.add = function (entity) {
            if (entity instanceof ex.UIActor) {
                this.currentScene.addUIActor(entity);
                return;
            }
            if (entity instanceof ex.Actor) {
                this.addChild(entity);
            }
            if (entity instanceof ex.Timer) {
                this.addTimer(entity);
            }
            if (entity instanceof ex.TileMap) {
                this.addTileMap(entity);
            }
            if (arguments.length === 2) {
                this.addScene(arguments[0], arguments[1]);
            }
        };
        Engine.prototype.remove = function (entity) {
            if (entity instanceof ex.UIActor) {
                this.currentScene.removeUIActor(entity);
                return;
            }
            if (entity instanceof ex.Actor) {
                this.removeChild(entity);
            }
            if (entity instanceof ex.Timer) {
                this.removeTimer(entity);
            }
            if (entity instanceof ex.TileMap) {
                this.removeTileMap(entity);
            }
            if (entity instanceof ex.Scene) {
                this.removeScene(entity);
            }
            if (typeof entity === "string") {
                this.removeScene(entity);
            }
        };
        /**
         * Changes the currently updating and drawing scene to a different,
         * named scene.
         * @method goToScene
         * @param name {string} The name of the scene to trasition to.
         */
        Engine.prototype.goToScene = function (name) {
            if (this.sceneHash[name]) {
                this.currentScene.onDeactivate.call(this.currentScene);
                var oldScene = this.currentScene;
                this.currentScene = this.sceneHash[name];
                oldScene.eventDispatcher.publish('deactivate', new ex.DeactivateEvent(this.currentScene));
                this.currentScene.onActivate.call(this.currentScene);
                this.currentScene.eventDispatcher.publish('activate', new ex.ActivateEvent(oldScene));
            }
            else {
                this.logger.error("Scene", name, "does not exist!");
            }
        };
        /**
         * Returns the width of the engines drawing surface in pixels.
         * @method getWidth
         * @returns number The width of the drawing surface in pixels.
         */
        Engine.prototype.getWidth = function () {
            if (this.currentScene && this.currentScene.camera) {
                return this.width / this.currentScene.camera.getZoom();
            }
            return this.width;
        };
        /**
         * Returns the height of the engines drawing surface in pixels.
         * @method getHeight
         * @returns number The height of the drawing surface in pixels.
         */
        Engine.prototype.getHeight = function () {
            if (this.currentScene && this.currentScene.camera) {
                return this.height / this.currentScene.camera.getZoom();
            }
            return this.height;
        };
        /**
         * Transforms the current x, y from screen coordinates to world coordinates
         * @method screenToWorldCoordinates
         * @param point {Point} screen coordinate to convert
         */
        Engine.prototype.screenToWorldCoordinates = function (point) {
            // todo set these back this.canvas.clientWidth
            var newX = point.x;
            var newY = point.y;
            if (this.currentScene && this.currentScene.camera) {
                var focus = this.currentScene.camera.getFocus();
                newX = focus.x + (point.x - (this.getWidth() / 2));
                newY = focus.y + (point.y - (this.getHeight() / 2));
            }
            newX = Math.floor((newX / this.canvas.clientWidth) * this.getWidth());
            newY = Math.floor((newY / this.canvas.clientHeight) * this.getHeight());
            return new ex.Point(newX, newY);
        };
        /**
         * Transforms a world coordinate, to a screen coordinate
         * @method worldToScreenCoordinates
         * @param point {Point} world coordinate to convert
         *
         */
        Engine.prototype.worldToScreenCoordinates = function (point) {
            // todo set these back this.canvas.clientWidth
            // this isn't correct on zoom
            var screenX = point.x;
            var screenY = point.y;
            if (this.currentScene && this.currentScene.camera) {
                var focus = this.currentScene.camera.getFocus();
                screenX = (point.x - focus.x) + (this.getWidth() / 2); //(this.getWidth() / this.canvas.clientWidth);
                screenY = (point.y - focus.y) + (this.getHeight() / 2); // (this.getHeight() / this.canvas.clientHeight);
            }
            screenX = Math.floor((screenX / this.getWidth()) * this.canvas.clientWidth);
            screenY = Math.floor((screenY / this.getHeight()) * this.canvas.clientHeight);
            return new ex.Point(screenX, screenY);
        };
        /**
         * Sets the internal canvas height based on the selected display mode.
         * @method setHeightByDisplayMode
         * @private
         */
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
        /**
         * Initializes the internal canvas, rendering context, displaymode, and native event listeners
         * @method initialize
         * @private
         */
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
            // initialize inputs
            this.input = {
                keyboard: new ex.Input.Keyboard(this),
                pointers: new ex.Input.Pointers(this),
                gamepads: new ex.Input.Gamepads(this)
            };
            this.input.keyboard.init();
            this.input.pointers.init();
            this.input.gamepads.init();
            // Issue #385 make use of the visibility api
            // https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API
            document.addEventListener("visibilitychange", function () {
                if (document.hidden || document.msHidden) {
                    _this.eventDispatcher.publish('hidden', new ex.HiddenEvent());
                    _this.logger.debug("Window hidden");
                }
                else {
                    _this.eventDispatcher.publish('visible', new ex.VisibleEvent());
                    _this.logger.debug("Window visible");
                }
            });
            /*
            // DEPRECATED in favor of visibility api
            window.addEventListener('blur', () => {
               this.eventDispatcher.publish(EventType[EventType.Blur], new BlurEvent());
            });
   
            window.addEventListener('focus', () => {
               this.eventDispatcher.publish(EventType[EventType.Focus], new FocusEvent());
            });*/
            this.ctx = this.canvas.getContext('2d');
            if (!this.canvasElementId) {
                document.body.appendChild(this.canvas);
            }
        };
        /**
         * If supported by the browser, this will set the antialiasing flag on the
         * canvas. Set this to false if you want a 'jagged' pixel art look to your
         * image resources.
         * @method setAntialiasing
         * @param isSmooth {boolean} Set smoothing to true or false
         */
        Engine.prototype.setAntialiasing = function (isSmooth) {
            this.isSmoothingEnabled = isSmooth;
            this.ctx.imageSmoothingEnabled = isSmooth;
            this.ctx.webkitImageSmoothingEnabled = isSmooth;
            this.ctx.mozImageSmoothingEnabled = isSmooth;
            this.ctx.msImageSmoothingEnabled = isSmooth;
        };
        /**
         *  Return the current smoothing status of the canvas
         * @method getAntialiasing
         * @returns boolean
         */
        Engine.prototype.getAntialiasing = function () {
            return this.ctx.imageSmoothingEnabled || this.ctx.webkitImageSmoothingEnabled || this.ctx.mozImageSmoothingEnabled || this.ctx.msImageSmoothingEnabled;
        };
        /**
         * Updates the entire state of the game
         * @method update
         * @private
         * @param delta {number} Number of milliseconds elapsed since the last update.
         */
        Engine.prototype.update = function (delta) {
            if (this.isLoading) {
                // suspend updates untill loading is finished
                return;
            }
            // process engine level events
            this.currentScene.update(this, delta);
            // update animations
            this.animations = this.animations.filter(function (a) {
                return !a.animation.isDone();
            });
            // Update input listeners
            this.input.keyboard.update(delta);
            this.input.pointers.update(delta);
            this.input.gamepads.update(delta);
            // Publish update event
            this.eventDispatcher.publish(ex.EventType[5 /* Update */], new ex.UpdateEvent(delta));
        };
        /**
         * Draws the entire game
         * @method draw
         * @private
         * @param draw {number} Number of milliseconds elapsed since the last draw.
         */
        Engine.prototype.draw = function (delta) {
            var ctx = this.ctx;
            if (this.isLoading) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, this.width, this.height);
                this.drawLoadingBar(ctx, this.progress, this.total);
                // Drawing nothing else while loading
                return;
            }
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.fillStyle = this.backgroundColor.toString();
            ctx.fillRect(0, 0, this.width, this.height);
            // Draw debug information
            if (this.isDebug) {
                this.ctx.font = "Consolas";
                this.ctx.fillStyle = this.debugColor.toString();
                var keys = this.input.keyboard.getKeys();
                for (var j = 0; j < keys.length; j++) {
                    this.ctx.fillText(keys[j].toString() + " : " + (ex.Input.Keys[keys[j]] ? ex.Input.Keys[keys[j]] : "Not Mapped"), 100, 10 * j + 10);
                }
                var fps = 1.0 / (delta / 1000);
                this.ctx.fillText("FPS:" + fps.toFixed(2).toString(), 10, 10);
            }
            this.currentScene.draw(this.ctx, delta);
            this.animations.forEach(function (a) {
                a.animation.draw(ctx, a.x, a.y);
            });
        };
        /**
         * Starts the internal game loop for Excalibur after loading
         * any provided assets.
         * @method start
         * @param [loader=undefined] {ILoadable} Optional resources to load before
         * starting the mainloop. Some loadable such as a Loader collection, Sound, or Texture.
         * @returns Promise
         */
        Engine.prototype.start = function (loader) {
            var loadingComplete;
            if (loader) {
                loader.wireEngine(this);
                loadingComplete = this.load(loader);
            }
            else {
                loadingComplete = ex.Promise.wrap();
            }
            if (!this.hasStarted) {
                this.hasStarted = true;
                this.logger.debug("Starting game...");
                // Mainloop
                var lastTime = Date.now();
                var game = this;
                (function mainloop() {
                    if (!game.hasStarted) {
                        return;
                    }
                    window.requestAnimationFrame(mainloop);
                    // Get the time to calculate time-elapsed
                    var now = Date.now();
                    var elapsed = Math.floor(now - lastTime) || 1;
                    // Resolves issue #138 if the game has been paused, or blurred for 
                    // more than a 200 milliseconds, reset elapsed time to 1. This improves reliability 
                    // and provides more expected behavior when the engine comes back
                    // into focus
                    if (elapsed > 200) {
                        elapsed = 1;
                    }
                    game.update(elapsed);
                    game.draw(elapsed);
                    lastTime = now;
                })();
                this.logger.debug("Game started");
            }
            else {
            }
            return loadingComplete;
        };
        /**
         * Stops Excalibur's mainloop, useful for pausing the game.
         * @method stop
         */
        Engine.prototype.stop = function () {
            if (this.hasStarted) {
                this.hasStarted = false;
                this.logger.debug("Game stopped");
            }
        };
        /**
         * Draws the Excalibur loading bar
         * @method drawLoadingBar
         * @private
         * @param ctx {CanvasRenderingContext2D} The canvas rendering context
         * @param loaded {number} Number of bytes loaded
         * @param total {number} Total number of bytes to load
         */
        Engine.prototype.drawLoadingBar = function (ctx, loaded, total) {
            if (this.loadingDraw) {
                this.loadingDraw(ctx, loaded, total);
                return;
            }
            var y = this.canvas.height / 2;
            var width = this.canvas.width / 3;
            var x = width;
            // loading image
            var image = new Image();
            // 64 bit string encoding of the excalibur logo
            image.src = 'data:image/png;base64,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';
            var imageHeight = width * 3 / 8;
            var oldAntialias = this.getAntialiasing();
            this.setAntialiasing(true);
            ctx.drawImage(image, 0, 0, 800, 300, x, y - imageHeight - 20, width, imageHeight);
            // loading box
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
        /**
         * Sets the loading screen draw function if you want to customize the draw
         * @method setLoadingDrawFunction
         * @param fcn {ctx: CanvasRenderingContext2D, loaded: number, total: number) => void}
         * Callback to draw the loading screen which is passed a rendering context, the number of bytes loaded, and the total number of bytes to load.
         */
        Engine.prototype.setLoadingDrawFunction = function (fcn) {
            this.loadingDraw = fcn;
        };
        /**
         * Another option available to you to load resources into the game.
         * Immediately after calling this the game will pause and the loading screen
         * will appear.
         * @method load
         * @param loader {ILoadable} Some loadable such as a Loader collection, Sound, or Texture.
         */
        Engine.prototype.load = function (loader) {
            var _this = this;
            var complete = new ex.Promise();
            this.isLoading = true;
            loader.onprogress = function (e) {
                _this.progress = e.loaded;
                _this.total = e.total;
                _this.logger.debug('Loading ' + (100 * _this.progress / _this.total).toFixed(0));
            };
            loader.oncomplete = function () {
                setTimeout(function () {
                    _this.isLoading = false;
                    complete.resolve();
                }, 500);
            };
            loader.load();
            return complete;
        };
        return Engine;
    })(ex.Class);
    ex.Engine = Engine;
    ;
})(ex || (ex = {}));
//# sourceMappingURL=excalibur-0.2.5.js.map
;
// Concatenated onto excalibur after build
// Exports the excalibur module so it can be used with browserify
// https://github.com/excaliburjs/Excalibur/issues/312
if (typeof module !== 'undefined') {module.exports = ex;}