(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ex = require("../dist/excalibur.js");

var game = new ex.Engine();

game.add(new ex.Actor(0, 0, 100, 100, ex.Color.Red));

game.start();
},{"../dist/excalibur.js":2}],2:[function(require,module,exports){
/*! excalibur - v0.2.5 - 2014-05-28
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
    Array.prototype.some = function (fun /*, thisArg */ ) {
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
var ex;
(function (ex) {
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
    })(ex.Effects || (ex.Effects = {}));
    var Effects = ex.Effects;
})(ex || (ex = {}));
/// <reference path="../SpriteEffects.ts" />
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
            var x = (this.x - anchor.x) * Math.cos(angle) + anchor.x;
            var y = (this.y - anchor.y) * Math.sin(angle) + anchor.y;

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
            } else {
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
                } else {
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
    (function (Util) {
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
            Collection.DefaultSize = 200;
            return Collection;
        })();
        Util.Collection = Collection;
    })(ex.Util || (ex.Util = {}));
    var Util = ex.Util;
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
            this.sx = sx;
            this.sy = sy;
            this.swidth = swidth;
            this.sheight = sheight;
            this.scaleX = 1.0;
            this.scaleY = 1.0;
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
            if (this.texture.isLoaded() && !this.pixelsLoaded) {
                this.spriteCtx.drawImage(this.texture.image, this.sx, this.sy, this.swidth, this.sheight, 0, 0, this.swidth, this.sheight);

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
            this.loadPixels();
            if (this.dirtyEffect) {
                this.applyEffects();
                this.dirtyEffect = false;
            }

            ctx.save();

            //var translateX = this.aboutCenter?this.swidth*this.scale/2:0;
            //var translateY = this.aboutCenter?this.sheight*this.scale/2:0;
            ctx.translate(x + this.transformPoint.x, y + this.transformPoint.y);
            ctx.rotate(this.rotation);

            //ctx.scale(this.scale, this.scale);
            if (this.flipHorizontal) {
                ctx.translate(this.swidth, 0);
                ctx.scale(-1, 1);
            }

            if (this.flipVertical) {
                ctx.translate(0, this.sheight);
                ctx.scale(1, -1);
            }
            if (this.internalImage) {
                ctx.drawImage(this.internalImage, 0, 0, this.swidth, this.sheight, -this.transformPoint.x, -this.transformPoint.y, this.swidth * this.scaleX, this.sheight * this.scaleY);
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
        function Cell(/**
        * Gets or sets x coordinate of the cell in world coordinates
        * @property x {number}
        */
        x, /**
        * Gets or sets y coordinate of the cell in world coordinates
        * @property y {number}
        */
        y, /**
        * Gets or sets the width of the cell
        * @property width {number}
        */
        width, /**
        * Gets or sets the height of the cell
        * @property height {number}
        */
        height, /**
        * The index of the cell in row major order
        * @property index {number}
        */
        index, /**
        * Gets or sets whether this cell is solid
        * @property solid {boolean}
        */
        solid, /**
        * The index of the sprite to use from the CollisionMap SpriteSheet, if -1 is specified nothing is drawn.
        * @property number {number}
        */
        sprites) {
            if (typeof solid === "undefined") { solid = false; }
            if (typeof sprites === "undefined") { sprites = []; }
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
            var x = Math.floor((x - this.x) / this.cellWidth);
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
                            } else {
                                _this.logger.warn("Sprite does not exist for id", ts.spriteId, "in sprite sheet", ts.spriteSheetKey, sprite, ss);
                            }
                        } else {
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
/// <reference path="Algebra.ts" />
var ex;
(function (ex) {
    (function (CollisionStrategy) {
        CollisionStrategy[CollisionStrategy["AxisAligned"] = 0] = "AxisAligned";
        CollisionStrategy[CollisionStrategy["SeparatingAxis"] = 1] = "SeparatingAxis";
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
        * Tests wether a point is contained within the bounding box
        * @method contains
        * @param p {Point} The point to test
        * @returns boolean
        */
        BoundingBox.prototype.contains = function (p) {
            return (this.left < p.x && this.top < p.y && this.bottom > p.y && this.right > p.x);
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
                var totalBoundingBox = new BoundingBox(Math.min(this.left, other.left), Math.min(this.top, other.top), Math.max(this.right, other.right), Math.max(this.bottom, other.bottom));

                // If the total bounding box is less than the sum of the 2 bounds then there is collision
                if (totalBoundingBox.getWidth() < other.getWidth() + this.getWidth() && totalBoundingBox.getHeight() < other.getHeight() + this.getHeight()) {
                    // collision
                    var overlapX = 0;
                    if (this.right >= other.left && this.right <= other.right) {
                        overlapX = other.left - this.right;
                    } else {
                        overlapX = other.right - this.left;
                    }

                    var overlapY = 0;
                    if (this.top <= other.bottom && this.top >= other.top) {
                        overlapY = other.bottom - this.top;
                    } else {
                        overlapY = other.top - this.bottom;
                    }

                    if (Math.abs(overlapX) < Math.abs(overlapY)) {
                        return new ex.Vector(overlapX, 0);
                    } else {
                        return new ex.Vector(0, overlapY);
                    }
                } else {
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
            this._points = points.map(function (p) {
                return p.toVector();
            });
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
                    } else {
                        if (overlap <= minOverlap) {
                            minOverlap = overlap;
                            minAxis = axes[i];
                        }
                    }
                }

                if (minAxis) {
                    return minAxis.normalize().scale(minOverlap);
                } else {
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
            } else {
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
                    } else if (leftSide === 4 /* Right */) {
                        this.left.dx = -Math.abs(this.left.dx);
                    } else if (leftSide === 1 /* Top */) {
                        this.left.dy = Math.abs(this.left.dy);
                    } else if (leftSide === 2 /* Bottom */) {
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
                    } else if (rightSide === 4 /* Right */) {
                        this.right.dx = -Math.abs(this.right.dx);
                    } else if (rightSide === 1 /* Top */) {
                        this.right.dy = Math.abs(this.right.dy);
                    } else if (rightSide === 2 /* Bottom */) {
                        this.right.dy = -Math.abs(this.right.dy);
                    }
                }
            }
        };
        return CollisionPair;
    })();
    ex.CollisionPair = CollisionPair;
})(ex || (ex = {}));
/// <reference path="Class.ts" />
/// <reference path="Timer.ts" />
/// <reference path="CollisionPair.ts" />
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
        function Scene() {
            _super.call(this);
            /**
            * The actors in the current scene
            * @property children {Actor[]}
            */
            this.children = [];
            this.tileMaps = [];
            this.killQueue = [];
            this.timers = [];
            this.cancelQueue = [];
            this._isInitialized = false;
            this._collisionPairs = [];
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

            this.tileMaps.forEach(function (cm) {
                cm.update(engine, delta);
            });

            var len = 0;
            var start = 0;
            var end = 0;
            var actor;

            for (var i = 0, len = this.children.length; i < len; i++) {
                this.children[i].update(engine, delta);
            }

            for (var i = 0, len = this._collisionPairs.length; i < len; i++) {
                this._collisionPairs[i].evaluate();
            }
            this._collisionPairs.length = 0;

            // Remove actors from scene graph after being killed
            var actorIndex = 0;
            for (var i = 0, len = this.killQueue.length; i < len; i++) {
                actorIndex = this.children.indexOf(this.killQueue[i]);
                if (actorIndex > -1) {
                    this.children.splice(actorIndex, 1);
                }
            }
            this.killQueue.length = 0;

            // Remove timers in the cancel queue before updating them
            var timerIndex = 0;
            for (var i = 0, len = this.cancelQueue.length; i < len; i++) {
                this.removeTimer(this.cancelQueue[i]);
            }
            this.cancelQueue.length = 0;

            // Cycle through timers updating timers
            var that = this;
            this.timers = this.timers.filter(function (timer) {
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
        };

        Scene.prototype.add = function (entity) {
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

        /**
        * Adds a collision resolution pair to the current scene. Should only be called
        * by actors.
        * @method addCollisionPair
        * @param collisionPair {CollisionPair}
        *
        */
        Scene.prototype.addCollisionPair = function (collisionPair) {
            if (!this._collisionPairs.some(function (cp) {
                return cp.equals(collisionPair);
            })) {
                this._collisionPairs.push(collisionPair);
            }
        };

        Scene.prototype.remove = function (entity) {
            if (entity instanceof ex.Actor) {
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
        * Adds an actor to the Scene, once this is done the actor will be drawn and updated.
        * @method addChild
        * @param actor {Actor}
        */
        Scene.prototype.addChild = function (actor) {
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
            this.killQueue.push(actor);
            actor.parent = null;
        };

        /**
        * Adds a timer to the Scene
        * @method addTimer
        * @param timer {Timer} The timer to add
        * @returns Timer
        */
        Scene.prototype.addTimer = function (timer) {
            this.timers.push(timer);
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
            var i = this.timers.indexOf(timer);
            if (i !== -1) {
                this.timers.splice(i, 1);
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
            this.cancelQueue.push(timer);
            return timer;
        };

        /**
        * Tests whether a timer is active in the scene
        * @method isTimerActive
        * @param timer {Timer}
        * @returns boolean
        */
        Scene.prototype.isTimerActive = function (timer) {
            return (this.timers.indexOf(timer) > -1);
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
                    } else {
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
                        this.startX = this.actor.scaleX;
                        this.startY = this.actor.scaleY;
                        this.distanceX = Math.abs(this.endX - this.startX);
                        this.distanceY = Math.abs(this.endY - this.startY);
                    }

                    if (!(Math.abs(this.actor.scaleX - this.startX) >= this.distanceX)) {
                        var directionX = this.endY < this.startY ? -1 : 1;
                        this.actor.sx = this.speedX * directionX;
                    } else {
                        this.actor.sx = 0;
                    }

                    if (!(Math.abs(this.actor.scaleY - this.startY) >= this.distanceY)) {
                        var directionY = this.endY < this.startY ? -1 : 1;
                        this.actor.sy = this.speedY * directionY;
                    } else {
                        this.actor.sy = 0;
                    }

                    //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
                    if (this.isComplete(this.actor)) {
                        this.actor.scaleX = this.endX;
                        this.actor.scaleY = this.endY;
                        this.actor.sx = 0;
                        this.actor.sy = 0;
                    }
                };

                ScaleTo.prototype.isComplete = function (actor) {
                    return this._stopped || ((Math.abs(this.actor.scaleX - this.startX) >= this.distanceX) && (Math.abs(this.actor.scaleY - this.startY) >= this.distanceY));
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
                    this.speedX = (this.endX - this.actor.scaleX) / time * 1000;
                    this.speedY = (this.endY - this.actor.scaleY) / time * 1000;
                }
                ScaleBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this.startX = this.actor.scaleX;
                        this.startY = this.actor.scaleY;
                        this.distanceX = Math.abs(this.endX - this.startX);
                        this.distanceY = Math.abs(this.endY - this.startY);
                    }
                    var directionX = this.endX < this.startX ? -1 : 1;
                    var directionY = this.endY < this.startY ? -1 : 1;
                    this.actor.sx = this.speedX * directionX;
                    this.actor.sy = this.speedY * directionY;

                    //Logger.getInstance().log("Pos x: " + this.actor.x +"  y:" + this.actor.y, Log.DEBUG);
                    if (this.isComplete(this.actor)) {
                        this.actor.scaleX = this.endX;
                        this.actor.scaleY = this.endY;
                        this.actor.sx = 0;
                        this.actor.sy = 0;
                    }
                };

                ScaleBy.prototype.isComplete = function (actor) {
                    return this._stopped || ((Math.abs(this.actor.scaleX - this.startX) >= this.distanceX) && (Math.abs(this.actor.scaleY - this.startY) >= this.distanceY));
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
                    if (typeof numBlinks === "undefined") { numBlinks = 1; }
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
        })(Internal.Actions || (Internal.Actions = {}));
        var Actions = Internal.Actions;
    })(ex.Internal || (ex.Internal = {}));
    var Internal = ex.Internal;
})(ex || (ex = {}));
/// <reference path="Interfaces/IDrawable.ts" />
/// <reference path="Side.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="BoundingBox.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Action.ts" />
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
            this.rotation = 0;
            /**
            * The rotational velocity of the actor in radians/second
            * @property rx {number}
            */
            this.rx = 0;
            /**
            * The x scale of the actor
            * @property scaleX {number}
            */
            this.scaleX = 1;
            /**
            * The y scale of the actor
            * @property scaleY {number}
            */
            this.scaleY = 1;
            /**
            * The x scalar velocity of the actor in scale/second
            * @property sx {number}
            */
            this.sx = 0;
            /**
            * The y scalar velocity of the actor in scale/second
            * @property sy {number}
            */
            this.sy = 0;
            /**
            * The x velocity of the actor in pixels/second
            * @property dx {number}
            */
            this.dx = 0;
            /**
            * The x velocity of the actor in pixels/second
            * @property dx {number}
            */
            this.dy = 0;
            /**
            * The x acceleration of the actor in pixels/second^2
            * @property ax {number}
            */
            this.ax = 0;
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
            this.scene = null;
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
            this.collisionType = 2 /* Active */;
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
            this._isKilled = false;
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
            this.color = color;
            if (color) {
                // set default opacticy of an actor to the color
                this.opacity = color.a || 1;
            }
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
            // will be overridden
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
            } else {
                this.logger.warn("Cannot kill actor, it was never added to the Scene");
            }
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

        /**
        * Adds a drawing to the list of available drawings for an actor.
        * @method addDrawing
        * @param key {string} The key to associate with a drawing for this actor
        * @param drawing {IDrawable} this can be an {{#crossLink "Animation"}}{{/crossLink}},
        * {{#crossLink "Sprite"}}{{/crossLink}}, or {{#crossLink "Polygon"}}{{/crossLink}}.
        */
        Actor.prototype.addDrawing = function (key, drawing) {
            this.frames[key] = drawing;
            if (!this.currentDrawing) {
                this.currentDrawing = drawing;
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
            return this.width * this.scaleX;
        };

        /**
        * Sets the width of an actor, factoring in the current scale
        * @method setWidth
        */
        Actor.prototype.setWidth = function (width) {
            this.width = width / this.scaleX;
        };

        /**
        * Gets the calculated height of an actor
        * @method getHeight
        * @returns number
        */
        Actor.prototype.getHeight = function () {
            return this.height * this.scaleY;
        };

        /**
        * Sets the height of an actor, factoring in the current scale
        * @method setHeight
        */
        Actor.prototype.setHeight = function (height) {
            this.height = height / this.scaleY;
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

        /**
        * Gets the y value of the Actor in global coordinates
        * @method getGlobalY
        * @returns number
        */
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
                } else {
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
                } else {
                    return 3 /* Left */;
                }
            } else {
                if (this.y < actor.y) {
                    return 2 /* Bottom */;
                } else {
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
            if (typeof numBlinks === "undefined") { numBlinks = 1; }
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
            } else {
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
            } else {
                this.actionQueue.add(new ex.Internal.Actions.Meet(this, actor, speed));
            }
            return this;
        };

        /**
        * Called by the Engine, updates the state of the actor
        * @method update
        * @param engine {Engine} The reference to the current game engine
        * @param delta {number} The time elapsed since the last update in milliseconds
        */
        Actor.prototype.update = function (engine, delta) {
            var _this = this;
            if (!this._isInitialized) {
                this.onInitialize(engine);
                this.eventDispatcher.publish('initialize', new ex.InitializeEvent(engine));
                this._isInitialized = true;
            }

            // Recalcuate the anchor point
            this.calculatedAnchor = new ex.Point(this.getWidth() * this.anchor.x, this.getHeight() * this.anchor.y);

            this.sceneNode.update(engine, delta);
            var eventDispatcher = this.eventDispatcher;

            // Update action queue
            this.actionQueue.update(delta);

            // Update placements based on linear algebra
            this.x += this.dx * delta / 1000;
            this.y += this.dy * delta / 1000;

            this.dx += this.ax * delta / 1000;
            this.dy += this.ay * delta / 1000;

            this.rotation += this.rx * delta / 1000;

            this.scaleX += this.sx * delta / 1000;
            this.scaleY += this.sy * delta / 1000;

            if (this.collisionType !== 0 /* PreventCollision */) {
                // Retrieve the list of potential colliders, exclude killed, prevented, and self
                var potentialColliders = engine.currentScene.children.filter(function (actor) {
                    return !actor._isKilled && actor.collisionType !== 0 /* PreventCollision */ && _this !== actor;
                });

                for (var i = 0; i < potentialColliders.length; i++) {
                    var intersectActor;
                    var side;
                    var collider = potentialColliders[i];

                    if (intersectActor = this.collides(collider)) {
                        side = this.getSideFromIntersect(intersectActor);
                        this.scene.addCollisionPair(new ex.CollisionPair(this, collider, intersectActor, side));

                        collider.collisionGroups.forEach(function (group) {
                            if (_this._collisionHandlers[group]) {
                                _this._collisionHandlers[group].forEach(function (handler) {
                                    handler.call(_this, collider);
                                });
                            }
                        });
                    }
                }

                for (var j = 0; j < engine.currentScene.tileMaps.length; j++) {
                    var map = engine.currentScene.tileMaps[j];
                    var intersectMap;
                    var side = 0 /* None */;
                    var max = 2;
                    var hasBounced = false;
                    while (intersectMap = map.collides(this)) {
                        if (max-- < 0) {
                            break;
                        }
                        side = this.getSideFromIntersect(intersectMap);
                        eventDispatcher.publish('collision', new ex.CollisionEvent(this, null, side, intersectMap));
                        if ((this.collisionType === 2 /* Active */ || this.collisionType === 3 /* Elastic */) && collider.collisionType !== 1 /* Passive */) {
                            this.y += intersectMap.y;
                            this.x += intersectMap.x;

                            // Naive elastic bounce
                            if (this.collisionType === 3 /* Elastic */ && !hasBounced) {
                                hasBounced = true;
                                if (side === 3 /* Left */) {
                                    this.dx = Math.abs(this.dx);
                                } else if (side === 4 /* Right */) {
                                    this.dx = -Math.abs(this.dx);
                                } else if (side === 1 /* Top */) {
                                    this.dy = Math.abs(this.dy);
                                } else if (side === 2 /* Bottom */) {
                                    this.dy = -Math.abs(this.dy);
                                }
                            }
                        }
                    }
                }
            }

            // Publish other events
            engine.keys.forEach(function (key) {
                eventDispatcher.publish(ex.InputKey[key], new ex.KeyEvent(key));
            });

            // Publish click events
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

            var anchor = this.calculatedAnchor;
            var actorScreenCoords = engine.worldToScreenCoordinates(new ex.Point(this.getGlobalX() - anchor.x, this.getGlobalY() - anchor.y));
            var zoom = 1.0;
            if (engine.camera) {
                zoom = engine.camera.getZoom();
            }

            if (!this.isOffScreen) {
                if (actorScreenCoords.x + this.getWidth() * zoom < 0 || actorScreenCoords.y + this.getHeight() * zoom < 0 || actorScreenCoords.x > engine.width || actorScreenCoords.y > engine.height) {
                    eventDispatcher.publish('exitviewport', new ex.ExitViewPortEvent());
                    this.isOffScreen = true;
                }
            } else {
                if (actorScreenCoords.x + this.getWidth() * zoom > 0 && actorScreenCoords.y + this.getHeight() * zoom > 0 && actorScreenCoords.x < engine.width && actorScreenCoords.y < engine.height) {
                    eventDispatcher.publish('enterviewport', new ex.EnterViewPortEvent());
                    this.isOffScreen = false;
                }
            }

            eventDispatcher.publish(ex.EventType[16 /* Update */], new ex.UpdateEvent(delta));
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
            ctx.scale(this.scaleX, this.scaleY);

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
            } else {
                if (this.color)
                    this.color.a = this.opacity;
                ctx.fillStyle = this.color ? this.color.toString() : (new ex.Color(0, 0, 0)).toString();
                ctx.fillRect(-anchorPoint.x, -anchorPoint.y, this.width, this.height);
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
            var anchorPoint = this.calculatedAnchor;

            // Meant to draw debug information about actors
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scaleX, this.scaleY);

            this.sceneNode.debugDraw(ctx);
            var bb = this.getBounds();
            bb.left = bb.left - this.getGlobalX();
            bb.right = bb.right - this.getGlobalX();
            bb.top = bb.top - this.getGlobalY();
            bb.bottom = bb.bottom - this.getGlobalY();
            bb.debugDraw(ctx);

            ctx.fillStyle = ex.Color.Yellow.toString();
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        };
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
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
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
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
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
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
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
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
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
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
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
            } else if (level < 3 /* Error */) {
                // Call .warn for Warn
                console.warn.apply(console, consoleArgs);
            } else {
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
        @property KeyDown {EventType}
        @static
        @final
        */
        /**
        @property KeyUp {EventType}
        @static
        @final
        */
        /**
        @property KeyPress {EventType}
        @static
        @final
        */
        /**
        @property MouseDown {EventType}
        @static
        @final
        */
        /**
        @property MouseMove {EventType}
        @static
        @final
        */
        /**
        @property MouseUp {EventType}
        @static
        @final
        */
        /**
        @property TouchStart {EventType}
        @static
        @final
        */
        /**
        @property TouchMove {EventType}
        @static
        @final
        */
        /**
        @property TouchEnd {EventType}
        @static
        @final
        */
        /**
        @property TouchCancel {EventType}
        @static
        @final
        */
        /**
        @property Click {EventType}
        @static
        @final
        */
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
        EventType[EventType["Collision"] = 11] = "Collision";
        EventType[EventType["EnterViewPort"] = 12] = "EnterViewPort";
        EventType[EventType["ExitViewPort"] = 13] = "ExitViewPort";
        EventType[EventType["Blur"] = 14] = "Blur";
        EventType[EventType["Focus"] = 15] = "Focus";
        EventType[EventType["Update"] = 16] = "Update";
        EventType[EventType["Activate"] = 17] = "Activate";
        EventType[EventType["Deactivate"] = 18] = "Deactivate";
        EventType[EventType["Initialize"] = 19] = "Initialize";
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
    * Event received by the Engine when the browser window receives focus
    *
    * @class FocusEvent
    * @extends GameEvent
    * @constructor
    */
    var FocusEvent = (function (_super) {
        __extends(FocusEvent, _super);
        function FocusEvent() {
            _super.call(this);
        }
        return FocusEvent;
    })(GameEvent);
    ex.FocusEvent = FocusEvent;

    /**
    * Event received by the Engine when the browser window is blurred
    *
    * @class BlurEvent
    * @extends GameEvent
    * @constructor
    */
    var BlurEvent = (function (_super) {
        __extends(BlurEvent, _super);
        function BlurEvent() {
            _super.call(this);
        }
        return BlurEvent;
    })(GameEvent);
    ex.BlurEvent = BlurEvent;

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
    * Event thrown on a game object on KeyEvent
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
    })(GameEvent);
    ex.KeyEvent = KeyEvent;

    /**
    * Event thrown on a game object on KeyDown
    *
    * @class KeyDown
    * @extends GameEvent
    * @constructor
    * @param key {InputKey} The key responsible for throwing the event
    */
    var KeyDown = (function (_super) {
        __extends(KeyDown, _super);
        function KeyDown(key) {
            _super.call(this);
            this.key = key;
        }
        return KeyDown;
    })(GameEvent);
    ex.KeyDown = KeyDown;

    /**
    * Event thrown on a game object on KeyUp
    *
    * @class KeyUp
    * @extends GameEvent
    * @constructor
    * @param key {InputKey} The key responsible for throwing the event
    */
    var KeyUp = (function (_super) {
        __extends(KeyUp, _super);
        function KeyUp(key) {
            _super.call(this);
            this.key = key;
        }
        return KeyUp;
    })(GameEvent);
    ex.KeyUp = KeyUp;

    /**
    * Event thrown on a game object on KeyPress
    *
    * @class KeyPress
    * @extends GameEvent
    * @constructor
    * @param key {InputKey} The key responsible for throwing the event
    */
    var KeyPress = (function (_super) {
        __extends(KeyPress, _super);
        function KeyPress(key) {
            _super.call(this);
            this.key = key;
        }
        return KeyPress;
    })(GameEvent);
    ex.KeyPress = KeyPress;

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

    /**
    * Event thrown on a game object on MouseDown
    *
    * @class MouseDown
    * @extends GameEvent
    * @constructor
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    * @param mouseEvent {MouseEvent} The native mouse event thrown
    */
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

    /**
    * Event thrown on a game object on MouseMove
    *
    * @class MouseMove
    * @extends GameEvent
    * @constructor
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    * @param mouseEvent {MouseEvent} The native mouse event thrown
    */
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

    /**
    * Event thrown on a game object on MouseUp
    *
    * @class MouseUp
    * @extends GameEvent
    * @constructor
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    * @param mouseEvent {MouseEvent} The native mouse event thrown
    */
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

    

    /**
    * Event thrown on a game object on TouchStart
    *
    * @class TouchStart
    * @extends GameEvent
    * @constructor
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
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

    /**
    * Event thrown on a game object on TouchMove
    *
    * @class TouchMove
    * @extends GameEvent
    * @constructor
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
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

    /**
    * Event thrown on a game object on TouchEnd
    *
    * @class TouchEnd
    * @extends GameEvent
    * @constructor
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
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

    /**
    * Event thrown on a game object on TouchCancel
    *
    * @class TouchCancel
    * @extends GameEvent
    * @constructor
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
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

    /**
    * Event thrown on a game object on Click
    *
    * @class Click
    * @extends GameEvent
    * @constructor
    * @param x {number} The x coordinate of the event
    * @param y {number} The y coordinate of the event
    */
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
                } else {
                    var index = eventHandlers.indexOf(handler);
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
            } else {
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
        * Returns a clone of the current color.
        * @method clone
        * @returns Color
        */
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

            this.scaleX += this.sx * delta / 1000;
            this.scaleY += this.sy * delta / 1000;

            // check for trigger collisions
            if (this.target) {
                if (this.collides(this.target)) {
                    this.dispatchAction();
                }
            } else {
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
            this.emitRate = 1;
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
            } else if (this.emitterType === 0 /* Circle */) {
                var radius = ex.Util.randomInRange(0, this.radius);
                ranX = radius * Math.cos(angle) + this.x;
                ranY = radius * Math.sin(angle) + this.y;
            }

            var p = new Particle(this, this.particleLife, this.opacity, this.beginColor, this.endColor, new ex.Vector(ranX, ranY), new ex.Vector(dx, dy), this.acceleration, this.startSize, this.endSize);
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
        function BaseCamera(engine) {
            this.focus = new ex.Point(0, 0);
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
            this.engine = engine;
        }
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
            // this should always be overridden
            if (this.follow) {
                return new ex.Point(0, 0);
            } else {
                return this.focus;
            }
        };

        /**
        * Sets the focal point of the camera. This value can only be set if there is no actor to be followed.
        * @method setFocus
        * @param x {number} The x coordinate of the focal point
        * @param y {number} The y coordinate of the focal point
        */
        BaseCamera.prototype.setFocus = function (x, y) {
            if (!this.follow) {
                this.focus.x = x;
                this.focus.y = y;
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
                } else {
                    this.isZooming = false;
                    this.setCurrentZoomScale(this.maxZoomScale);
                }
            } else {
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
        BaseCamera.prototype.update = function (delta) {
            var focus = this.getFocus();

            var xShake = 0;
            var yShake = 0;

            var canvasWidth = this.engine.ctx.canvas.width;
            var canvasHeight = this.engine.ctx.canvas.height;
            var newCanvasWidth = canvasWidth * this.getZoom();
            var newCanvasHeight = canvasHeight * this.getZoom();

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
                this.setCurrentZoomScale(this.maxZoomScale);
            } else {
                this.elapsedZoomTime += delta;

                this.setCurrentZoomScale(this.getZoom() + this.zoomIncrement * delta / 1000);
            }

            //this.engine.ctx.translate(-((newCanvasWidth - canvasWidth)/2), -((newCanvasHeight - canvasHeight)/2));
            this.engine.ctx.scale(this.getZoom(), this.getZoom());
        };

        BaseCamera.prototype.debugDraw = function (ctx) {
            var focus = this.getFocus();
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(this.follow.x + this.follow.getWidth() / 2, 0, 15, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
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
        /**
        * Returns the focal point of the camera in world space
        * @method getFocus
        * @returns point
        */
        SideCamera.prototype.getFocus = function () {
            if (this.follow) {
                // return new Point(-this.follow.x + this.engine.width / 2.0, 0);
                return new ex.Point(((-this.follow.x - this.follow.getWidth() / 2) * this.getZoom()) + (this.engine.getWidth() * this.getZoom()) / 2.0, 0);
            } else {
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
        /**
        * Returns the focal point of the camera in world space
        * @method getFocus
        * @returns Point
        */
        TopCamera.prototype.getFocus = function () {
            if (this.follow) {
                return new ex.Point(((-this.follow.x - this.follow.getWidth() / 2) * this.getZoom()) + (this.engine.getWidth() * this.getZoom()) / 2.0, ((-this.follow.y - this.follow.getHeight() / 2) * this.getZoom()) + (this.engine.getHeight() * this.getZoom()) / 2.0);
            } else {
                return this.focus;
            }
        };
        return TopCamera;
    })(BaseCamera);
    ex.TopCamera = TopCamera;
})(ex || (ex = {}));
/// <reference path="MonkeyPatch.ts" />
/// <reference path="Util.ts" />
/// <reference path="Log.ts" />
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
            function AudioTag(path, volume) {
                var _this = this;
                this.path = path;
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
                    this.volume.gain.value = 1; // max volume
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
                    try  {
                        successCallback.call(this, this.value);
                    } catch (e) {
                        this.handleError(e);
                    }
                }
            }
            if (rejectCallback) {
                this.rejectCallback = rejectCallback;

                // If the promise is already rejected call immediately
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

        /**
        * Reject the promise and pass an option value to the reject callbacks
        * @method reject
        * @param [value=undefined] {T} Value to pass to the reject callbacks
        */
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
        function Resource(path) {
            this.path = path;
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

        Resource.prototype.cacheBust = function (uri) {
            var query = /\?\w*=\w*/;
            if (query.test(uri)) {
                uri += ("&__=" + Date.now());
            } else {
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
            request.open("GET", this.cacheBust(this.path), true);
            request.responseType = "blob";
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

                _this.data = URL.createObjectURL(request.response);
                _this.ProcessDownload.call(_this);
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
        * @returns string
        */
        Resource.prototype.GetData = function () {
            return this.data;
        };

        /**
        * This method is meant to be overriden to handle any additional
        * processing. Such as decoding downloaded audio bits.
        * @method ProcessDownload
        */
        Resource.prototype.ProcessDownload = function () {
            // Handle any additional loading after the xhr has completed.
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
    */
    var Texture = (function (_super) {
        __extends(Texture, _super);
        function Texture(path) {
            _super.call(this, path);
            this.path = path;
        }
        /**
        * Returns true if the Texture is completely loaded and is ready
        * to be drawn.
        * @method isLoaded
        * @returns boolean
        */
        Texture.prototype.isLoaded = function () {
            return (!!this.image && !!this.image.src);
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
                _this.image.src = _super.prototype.GetData.call(_this);
                complete.resolve(_this.image);
            }, function () {
                complete.reject("Error loading texture.");
            });
            return complete;
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
            /* Chrome : MP3, WAV, Ogg
            * Firefox : WAV, Ogg,
            * IE : MP3,
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

        /**
        * Play the sound
        * @method play
        */
        Sound.prototype.play = function () {
            if (this.sound)
                this.sound.play();
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
            ctx.scale(this.scaleX, this.scaleY);
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
                    try  {
                        var charSprite = sprites[character];
                        if (this.previousOpacity !== this.opacity) {
                            charSprite.clearEffects();
                            charSprite.addEffect(new ex.Effects.Opacity(this.opacity));
                        }
                        charSprite.draw(ctx, currX, 0);
                        currX += (charSprite.swidth + this.letterSpacing);
                    } catch (e) {
                        ex.Logger.getInstance().error("SpriteFont Error drawing char " + character);
                    }
                }
                if (this.previousOpacity !== this.opacity) {
                    this.previousOpacity = this.opacity;
                }
                //this.spriteFont.draw(ctx, 0, 0, this.text, color, this.letterSpacing);
            } else {
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
                } else {
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
/// <reference path="MonkeyPatch.ts" />
/// <reference path="Events.ts" />
/// <reference path="EventDispatcher.ts" />
/// <reference path="Class.ts" />
/// <reference path="Color.ts" />
/// <reference path="Log.ts" />
/// <reference path="Side.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Actor.ts" />
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
var ex;
(function (ex) {
    /**
    * Enum representing input key codes
    * @class InputKey
    *
    */
    (function (InputKey) {
        /**
        @property Num1 {InputKey}
        */
        /**
        @property Num2 {InputKey}
        */
        /**
        @property Num3 {InputKey}
        */
        /**
        @property Num4 {InputKey}
        */
        /**
        @property Num5 {InputKey}
        */
        /**
        @property Num6 {InputKey}
        */
        /**
        @property Num7 {InputKey}
        */
        /**
        @property Num8 {InputKey}
        */
        /**
        @property Num9 {InputKey}
        */
        /**
        @property Num0 {InputKey}
        */
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

        /**
        @property Numlock {InputKey}
        */
        InputKey[InputKey["Numlock"] = 144] = "Numlock";

        /**
        @property Semicolon {InputKey}
        */
        InputKey[InputKey["Semicolon"] = 186] = "Semicolon";

        /**
        @property A {InputKey}
        */
        /**
        @property B {InputKey}
        */
        /**
        @property C {InputKey}
        */
        /**
        @property D {InputKey}
        */
        /**
        @property E {InputKey}
        */
        /**
        @property F {InputKey}
        */
        /**
        @property G {InputKey}
        */
        /**
        @property H {InputKey}
        */
        /**
        @property I {InputKey}
        */
        /**
        @property J {InputKey}
        */
        /**
        @property K {InputKey}
        */
        /**
        @property L {InputKey}
        */
        /**
        @property M {InputKey}
        */
        /**
        @property N {InputKey}
        */
        /**
        @property O {InputKey}
        */
        /**
        @property P {InputKey}
        */
        /**
        @property Q {InputKey}
        */
        /**
        @property R {InputKey}
        */
        /**
        @property S {InputKey}
        */
        /**
        @property T {InputKey}
        */
        /**
        @property U {InputKey}
        */
        /**
        @property V {InputKey}
        */
        /**
        @property W {InputKey}
        */
        /**
        @property X {InputKey}
        */
        /**
        @property Y {InputKey}
        */
        /**
        @property Z {InputKey}
        */
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

        /**
        @property Shift {InputKey}
        */
        /**
        @property Alt {InputKey}
        */
        /**
        @property Up {InputKey}
        */
        /**
        @property Down {InputKey}
        */
        /**
        @property Left {InputKey}
        */
        /**
        @property Right {InputKey}
        */
        /**
        @property Space {InputKey}
        */
        /**
        @property Esc {InputKey}
        */
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
            this.hasStarted = false;
            // Key Events
            this.keys = [];
            this.keysDown = [];
            this.keysUp = [];
            // Mouse Events
            this.clicks = [];
            this.mouseDown = [];
            this.mouseMove = [];
            this.mouseUp = [];
            // Touch Events
            this.touchStart = [];
            this.touchMove = [];
            this.touchEnd = [];
            this.touchCancel = [];
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

            this.camera = new ex.BaseCamera(this);
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
                this.width = width;
                this.canvas.width = width;
                this.height = height;
                this.canvas.height = height;
            } else if (!displayMode) {
                this.logger.debug("Engine viewport is fullscreen");
                this.displayMode = 0 /* FullScreen */;
            }

            this.loader = new ex.Loader();

            this.initialize();
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
            } else {
                this.logger.error("Scene", name, "does not exist!");
            }
        };

        /**
        * Returns the width of the engines drawing surface in pixels.
        * @method getWidth
        * @returns number The width of the drawing surface in pixels.
        */
        Engine.prototype.getWidth = function () {
            if (this.camera) {
                return this.width / this.camera.getZoom();
            }
            return this.width;
        };

        /**
        * Returns the height of the engines drawing surface in pixels.
        * @method getHeight
        * @returns number The height of the drawing surface in pixels.
        */
        Engine.prototype.getHeight = function () {
            if (this.camera) {
                return this.height / this.camera.getZoom();
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

            if (this.camera) {
                var focus = this.camera.getFocus();
                newX -= focus.x;
                newY -= focus.y;
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

            if (this.camera) {
                var focus = this.camera.getFocus();

                screenX += focus.x * (this.getWidth() / this.canvas.clientWidth);
                screenY += focus.y * (this.getHeight() / this.canvas.clientHeight);
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

            window.addEventListener('blur', function (ev) {
                _this.keys.length = 0; // empties array efficiently
            });

            // key up is on window because canvas cannot have focus
            window.addEventListener('keyup', function (ev) {
                var key = _this.keys.indexOf(ev.keyCode);
                _this.keys.splice(key, 1);
                _this.keysUp.push(ev.keyCode);
                var keyEvent = new ex.KeyUp(ev.keyCode);
                _this.eventDispatcher.publish(ex.EventType[1 /* KeyUp */], keyEvent);
                _this.currentScene.publish(ex.EventType[1 /* KeyUp */], keyEvent);
            });

            // key down is on window because canvas cannot have focus
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
                _this.eventDispatcher.publish(ex.EventType[14 /* Blur */], new ex.BlurEvent());
            });

            window.addEventListener('focus', function () {
                _this.eventDispatcher.publish(ex.EventType[15 /* Focus */], new ex.FocusEvent());
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

            //
            // Touch Events
            //
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

            // W3C Pointer Events (IE11)
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
        *  Tests if a certain key is down.
        * @method isKeyDown
        * @param key {InputKey} Test wether a key is down
        * @returns boolean
        */
        Engine.prototype.isKeyDown = function (key) {
            return this.keysDown.indexOf(key) > -1;
        };

        /**
        *  Tests if a certain key is pressed.
        * @method isKeyPressed
        * @param key {InputKey} Test wether a key is pressed
        * @returns boolean
        */
        Engine.prototype.isKeyPressed = function (key) {
            return this.keys.indexOf(key) > -1;
        };

        /**
        *  Tests if a certain key is up.
        * @method isKeyUp
        * @param key {InputKey} Test wether a key is up
        * @returns boolean
        */
        Engine.prototype.isKeyUp = function (key) {
            return this.keysUp.indexOf(key) > -1;
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

            var eventDispatcher = this.eventDispatcher;
            this.keys.forEach(function (key) {
                eventDispatcher.publish(InputKey[key], new ex.KeyEvent(key));
            });

            // update animations
            this.animations = this.animations.filter(function (a) {
                return !a.animation.isDone();
            });

            // Reset keysDown and keysUp after update is complete
            this.keysDown.length = 0;
            this.keysUp.length = 0;

            // Reset clicks
            this.clicks.length = 0;

            // Reset mouse
            this.mouseDown.length = 0;
            this.mouseMove.length = 0;
            this.mouseUp.length = 0;

            // Reset touch
            this.touchStart.length = 0;
            this.touchMove.length = 0;
            this.touchEnd.length = 0;
            this.touchCancel.length = 0;

            // Publish update event
            this.eventDispatcher.publish(ex.EventType[16 /* Update */], new ex.UpdateEvent(delta));
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
                this.camera.debugDraw(this.ctx);
            }

            this.ctx.restore();
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
                loadingComplete = this.load(loader);
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
            } else {
                // Game already started;
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

            loader.load();
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
},{}]},{},[1])