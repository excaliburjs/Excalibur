/*! excalibur - v0.6.0 - 2016-01-19
* https://github.com/excaliburjs/Excalibur
* Copyright (c) 2016 ; Licensed BSD-2-Clause*/
if (typeof window === 'undefined') {
    window = { audioContext: function () { return; } };
}
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
    window.requestAnimationFrame =
        window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) { window.setInterval(callback, 1000 / 60); };
}
if (typeof window !== 'undefined' && !window.cancelAnimationFrame) {
    window.cancelAnimationFrame =
        window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            function (callback) { return; };
}
if (typeof window !== 'undefined' && !window.AudioContext) {
    window.AudioContext = window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext ||
        window.msAudioContext ||
        window.oAudioContext;
}
// Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }
        // 1. Let O be the result of calling ToObject passing the |this| value as the argument. 
        var O = Object(this);
        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;
        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }
        // 6. Let k be 0
        k = 0;
        // 7. Repeat, while k < len
        while (k < len) {
            var kValue;
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {
                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[k];
                // ii. Call the Call internal method of callback with T as the this value and
                // argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}
// Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
    Array.prototype.some = function (fun /*, thisArg */) {
        'use strict';
        if (this === void 0 || this === null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t)) {
                return true;
            }
        }
        return false;
    };
}
// Polyfill from  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () { return; }, fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis
                ? this
                : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}
var ex;
(function (ex) {
    /**
     * Effects
     *
     * These effects can be applied to any bitmap image but are mainly used
     * for [[Sprite]] effects or [[Animation]] effects.
     *
     * Because these manipulate raw pixels, there is a performance impact to applying
     * too many effects. Excalibur tries its best to by using caching to mitigate
     * performance issues.
     *
     * Create your own effects by implementing [[ISpriteEffect]].
     */
    var Effects;
    (function (Effects) {
        /**
         * Applies the "Grayscale" effect to a sprite, removing color information.
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
         */
        var Opacity = (function () {
            /**
             * @param opacity  The new opacity of the sprite from 0-1.0
             */
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
         */
        var Colorize = (function () {
            /**
             * @param color  The color to apply to the sprite
             */
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
         * Applies the "Lighten" effect to a sprite, changes the lightness of the color according to HSL
         */
        var Lighten = (function () {
            /**
             * @param factor  The factor of the effect between 0-1
             */
            function Lighten(factor) {
                if (factor === void 0) { factor = 0.1; }
                this.factor = factor;
            }
            Lighten.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var color = ex.Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).lighten(this.factor);
                pixel[firstPixel + 0] = color.r;
                pixel[firstPixel + 1] = color.g;
                pixel[firstPixel + 2] = color.b;
                pixel[firstPixel + 3] = color.a;
            };
            return Lighten;
        })();
        Effects.Lighten = Lighten;
        /**
         * Applies the "Darken" effect to a sprite, changes the darkness of the color according to HSL
         */
        var Darken = (function () {
            /**
             * @param factor  The factor of the effect between 0-1
             */
            function Darken(factor) {
                if (factor === void 0) { factor = 0.1; }
                this.factor = factor;
            }
            Darken.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var color = ex.Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).darken(this.factor);
                pixel[firstPixel + 0] = color.r;
                pixel[firstPixel + 1] = color.g;
                pixel[firstPixel + 2] = color.b;
                pixel[firstPixel + 3] = color.a;
            };
            return Darken;
        })();
        Effects.Darken = Darken;
        /**
         * Applies the "Saturate" effect to a sprite, saturates the color acccording to HSL
         */
        var Saturate = (function () {
            /**
             * @param factor  The factor of the effect between 0-1
             */
            function Saturate(factor) {
                if (factor === void 0) { factor = 0.1; }
                this.factor = factor;
            }
            Saturate.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var color = ex.Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).saturate(this.factor);
                pixel[firstPixel + 0] = color.r;
                pixel[firstPixel + 1] = color.g;
                pixel[firstPixel + 2] = color.b;
                pixel[firstPixel + 3] = color.a;
            };
            return Saturate;
        })();
        Effects.Saturate = Saturate;
        /**
         * Applies the "Desaturate" effect to a sprite, desaturates the color acccording to HSL
         */
        var Desaturate = (function () {
            /**
             * @param factor  The factor of the effect between 0-1
             */
            function Desaturate(factor) {
                if (factor === void 0) { factor = 0.1; }
                this.factor = factor;
            }
            Desaturate.prototype.updatePixel = function (x, y, imageData) {
                var firstPixel = (x + y * imageData.width) * 4;
                var pixel = imageData.data;
                var color = ex.Color.fromRGB(pixel[firstPixel + 0], pixel[firstPixel + 1], pixel[firstPixel + 2], pixel[firstPixel + 3]).desaturate(this.factor);
                pixel[firstPixel + 0] = color.r;
                pixel[firstPixel + 1] = color.g;
                pixel[firstPixel + 2] = color.b;
                pixel[firstPixel + 3] = color.a;
            };
            return Desaturate;
        })();
        Effects.Desaturate = Desaturate;
        /**
         * Applies the "Fill" effect to a sprite, changing the color channels of all non-transparent pixels to match
         * a given color
         */
        var Fill = (function () {
            /**
             * @param color  The color to apply to the sprite
             */
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
/// <reference path="../Drawing/SpriteEffects.ts" />
/// <reference path="../Interfaces/IActorTrait.ts" />
var ex;
(function (ex) {
    var Traits;
    (function (Traits) {
        var Movement = (function () {
            function Movement() {
            }
            Movement.prototype.update = function (actor, engine, delta) {
                // Update placements based on linear algebra
                actor.x += actor.dx * delta / 1000;
                actor.y += actor.dy * delta / 1000;
                actor.dx += actor.ax * delta / 1000;
                actor.dy += actor.ay * delta / 1000;
                actor.rotation += actor.rx * delta / 1000;
                actor.scale.x += actor.sx * delta / 1000;
                actor.scale.y += actor.sy * delta / 1000;
            };
            return Movement;
        })();
        Traits.Movement = Movement;
    })(Traits = ex.Traits || (ex.Traits = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var CullingBox = (function () {
        function CullingBox() {
            this._topLeft = new ex.Point(0, 0);
            this._topRight = new ex.Point(0, 0);
            this._bottomLeft = new ex.Point(0, 0);
            this._bottomRight = new ex.Point(0, 0);
        }
        CullingBox.prototype.isSpriteOffScreen = function (actor, engine) {
            var drawingWidth = actor.currentDrawing.width * actor.currentDrawing.scale.x;
            var drawingHeight = actor.currentDrawing.height * actor.currentDrawing.scale.y;
            var rotation = actor.rotation;
            var anchor = actor.getCenter().toPoint();
            this._topLeft.x = actor.getWorldX() - (drawingWidth / 2);
            this._topLeft.y = actor.getWorldY() - (drawingHeight / 2);
            this._topLeft = this._topLeft.rotate(rotation, anchor);
            this._topRight.x = actor.getWorldX() + (drawingWidth / 2);
            this._topRight.y = actor.getWorldY() - (drawingHeight / 2);
            this._topRight = this._topRight.rotate(rotation, anchor);
            this._bottomLeft.x = actor.getWorldX() - (drawingWidth / 2);
            this._bottomLeft.y = actor.getWorldY() + (drawingHeight / 2);
            this._bottomLeft = this._bottomLeft.rotate(rotation, anchor);
            this._bottomRight.x = actor.getWorldX() + (drawingWidth / 2);
            this._bottomRight.y = actor.getWorldY() + (drawingHeight / 2);
            this._bottomRight = this._bottomRight.rotate(rotation, anchor);
            ///
            var topLeftScreen = engine.worldToScreenCoordinates(this._topLeft);
            var topRightScreen = engine.worldToScreenCoordinates(this._topRight);
            var bottomLeftScreen = engine.worldToScreenCoordinates(this._bottomLeft);
            var bottomRightScreen = engine.worldToScreenCoordinates(this._bottomRight);
            this._xCoords = [];
            this._yCoords = [];
            this._xCoords.push(topLeftScreen.x, topRightScreen.x, bottomLeftScreen.x, bottomRightScreen.x);
            this._yCoords.push(topLeftScreen.y, topRightScreen.y, bottomLeftScreen.y, bottomRightScreen.y);
            this._xMin = Math.min.apply(null, this._xCoords);
            this._yMin = Math.min.apply(null, this._yCoords);
            this._xMax = Math.max.apply(null, this._xCoords);
            this._yMax = Math.max.apply(null, this._yCoords);
            var minWorld = engine.screenToWorldCoordinates(new ex.Point(this._xMin, this._yMin));
            var maxWorld = engine.screenToWorldCoordinates(new ex.Point(this._xMax, this._yMax));
            this._xMinWorld = minWorld.x;
            this._yMinWorld = minWorld.y;
            this._xMaxWorld = maxWorld.x;
            this._yMaxWorld = maxWorld.y;
            var boundingPoints = new Array();
            boundingPoints.push(new ex.Point(this._xMin, this._yMin), new ex.Point(this._xMax, this._yMin), new ex.Point(this._xMin, this._yMax), new ex.Point(this._xMax, this._yMax));
            for (var i = 0; i < boundingPoints.length; i++) {
                if (boundingPoints[i].x > 0 &&
                    boundingPoints[i].y > 0 &&
                    boundingPoints[i].x < engine.canvas.clientWidth &&
                    boundingPoints[i].y < engine.canvas.clientHeight) {
                    return false;
                }
            }
            return true;
        };
        CullingBox.prototype.debugDraw = function (ctx) {
            // bounding rectangle
            ctx.beginPath();
            ctx.strokeStyle = ex.Color.White.toString();
            ctx.rect(this._xMinWorld, this._yMinWorld, this._xMaxWorld - this._xMinWorld, this._yMaxWorld - this._yMinWorld);
            ctx.stroke();
            ctx.fillStyle = ex.Color.Red.toString();
            ctx.beginPath();
            ctx.arc(this._topLeft.x, this._topLeft.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = ex.Color.Green.toString();
            ctx.beginPath();
            ctx.arc(this._topRight.x, this._topRight.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = ex.Color.Blue.toString();
            ctx.beginPath();
            ctx.arc(this._bottomLeft.x, this._bottomLeft.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = ex.Color.Magenta.toString();
            ctx.beginPath();
            ctx.arc(this._bottomRight.x, this._bottomRight.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        };
        return CullingBox;
    })();
    ex.CullingBox = CullingBox;
})(ex || (ex = {}));
/// <reference path="../Interfaces/IActorTrait.ts" />
/// <reference path="../Util/CullingBox.ts" />
var ex;
(function (ex) {
    var Traits;
    (function (Traits) {
        var OffscreenCulling = (function () {
            function OffscreenCulling() {
                this.cullingBox = new ex.CullingBox();
            }
            OffscreenCulling.prototype.update = function (actor, engine, delta) {
                var eventDispatcher = actor.eventDispatcher;
                var anchor = actor.anchor;
                var globalScale = actor.getGlobalScale();
                var width = globalScale.x * actor.getWidth() / actor.scale.x;
                var height = globalScale.y * actor.getHeight() / actor.scale.y;
                var actorScreenCoords = engine.worldToScreenCoordinates(new ex.Point(actor.getWorldX() - anchor.x * width, actor.getWorldY() - anchor.y * height));
                var zoom = 1.0;
                if (actor.scene && actor.scene.camera) {
                    zoom = actor.scene.camera.getZoom();
                }
                var isSpriteOffScreen = true;
                if (actor.currentDrawing != null) {
                    isSpriteOffScreen = this.cullingBox.isSpriteOffScreen(actor, engine);
                }
                if (!actor.isOffScreen) {
                    if ((actorScreenCoords.x + width * zoom < 0 ||
                        actorScreenCoords.y + height * zoom < 0 ||
                        actorScreenCoords.x > engine.width ||
                        actorScreenCoords.y > engine.height) &&
                        isSpriteOffScreen) {
                        eventDispatcher.emit('exitviewport', new ex.ExitViewPortEvent());
                        actor.isOffScreen = true;
                    }
                }
                else {
                    if ((actorScreenCoords.x + width * zoom > 0 &&
                        actorScreenCoords.y + height * zoom > 0 &&
                        actorScreenCoords.x < engine.width &&
                        actorScreenCoords.y < engine.height) ||
                        !isSpriteOffScreen) {
                        eventDispatcher.emit('enterviewport', new ex.EnterViewPortEvent());
                        actor.isOffScreen = false;
                    }
                }
            };
            return OffscreenCulling;
        })();
        Traits.OffscreenCulling = OffscreenCulling;
    })(Traits = ex.Traits || (ex.Traits = {}));
})(ex || (ex = {}));
/// <reference path="../Interfaces/IActorTrait.ts" />
var ex;
(function (ex) {
    var Traits;
    (function (Traits) {
        /**
         * Propogates pointer events to the actor
         */
        var CapturePointer = (function () {
            function CapturePointer() {
            }
            CapturePointer.prototype.update = function (actor, engine, delta) {
                if (!actor.enableCapturePointer) {
                    return;
                }
                if (actor.isKilled()) {
                    return;
                }
                engine.input.pointers.propogate(actor);
            };
            return CapturePointer;
        })();
        Traits.CapturePointer = CapturePointer;
    })(Traits = ex.Traits || (ex.Traits = {}));
})(ex || (ex = {}));
/// <reference path="../Interfaces/IActorTrait.ts" />
var ex;
(function (ex) {
    var Traits;
    (function (Traits) {
        var CollisionDetection = (function () {
            function CollisionDetection() {
            }
            CollisionDetection.prototype.update = function (actor, engine, delta) {
                var eventDispatcher = actor.eventDispatcher;
                if (actor.collisionType !== ex.CollisionType.PreventCollision && engine.currentScene && engine.currentScene.tileMaps) {
                    for (var j = 0; j < engine.currentScene.tileMaps.length; j++) {
                        var map = engine.currentScene.tileMaps[j];
                        var intersectMap;
                        var side = ex.Side.None;
                        var max = 2;
                        var hasBounced = false;
                        while (intersectMap = map.collides(actor)) {
                            if (max-- < 0) {
                                break;
                            }
                            side = actor.getSideFromIntersect(intersectMap);
                            eventDispatcher.emit('collision', new ex.CollisionEvent(actor, null, side, intersectMap));
                            if ((actor.collisionType === ex.CollisionType.Active || actor.collisionType === ex.CollisionType.Elastic)) {
                                actor.y += intersectMap.y;
                                actor.x += intersectMap.x;
                                // Naive elastic bounce
                                if (actor.collisionType === ex.CollisionType.Elastic && !hasBounced) {
                                    hasBounced = true;
                                    if (side === ex.Side.Left) {
                                        actor.dx = Math.abs(actor.dx);
                                    }
                                    else if (side === ex.Side.Right) {
                                        actor.dx = -Math.abs(actor.dx);
                                    }
                                    else if (side === ex.Side.Top) {
                                        actor.dy = Math.abs(actor.dy);
                                    }
                                    else if (side === ex.Side.Bottom) {
                                        actor.dy = -Math.abs(actor.dy);
                                    }
                                }
                            }
                        }
                    }
                }
            };
            return CollisionDetection;
        })();
        Traits.CollisionDetection = CollisionDetection;
    })(Traits = ex.Traits || (ex.Traits = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * An enum that describes the sides of an Actor for collision
     */
    (function (Side) {
        Side[Side["None"] = 0] = "None";
        Side[Side["Top"] = 1] = "Top";
        Side[Side["Bottom"] = 2] = "Bottom";
        Side[Side["Left"] = 3] = "Left";
        Side[Side["Right"] = 4] = "Right";
    })(ex.Side || (ex.Side = {}));
    var Side = ex.Side;
})(ex || (ex = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ex;
(function (ex) {
    /**
     * A simple 2D point on a plane
     * @obsolete Use [[Vector|vector]]s instead of [[Point|points]]
     */
    var Point = (function () {
        /**
         * @param x  X coordinate of the point
         * @param y  Y coordinate of the point
         */
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        /**
         * Convert this point to a vector
         */
        Point.prototype.toVector = function () {
            return new Vector(this.x, this.y);
        };
        /**
         * Rotates the current point around another by a certain number of
         * degrees in radians
         * @param angle  The angle in radians
         * @param anchor The point to rotate around
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
         * @param vector  The other vector to add to
         */
        Point.prototype.add = function (vector) {
            return new Point(this.x + vector.x, this.y + vector.y);
        };
        /**
         * Sets the x and y components at once
         */
        Point.prototype.setTo = function (x, y) {
            this.x = x;
            this.y = y;
        };
        /**
         * Clones a new point that is a copy of this one.
         */
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        /**
         * Compares this point against another and tests for equality
         * @param point  The other point to compare to
         */
        Point.prototype.equals = function (point) {
            return this.x === point.x && this.y === point.y;
        };
        return Point;
    })();
    ex.Point = Point;
    /**
     * A 2D vector on a plane.
     */
    var Vector = (function (_super) {
        __extends(Vector, _super);
        /**
         * @param x  X component of the Vector
         * @param y  Y component of the Vector
         */
        function Vector(x, y) {
            _super.call(this, x, y);
            this.x = x;
            this.y = y;
        }
        /**
         * Returns a vector of unit length in the direction of the specified angle.
         * @param angle The angle to generate the vector
         */
        Vector.fromAngle = function (angle) {
            return new Vector(Math.cos(angle), Math.sin(angle));
        };
        /**
         * The distance to another vector
         * @param v  The other vector
         */
        Vector.prototype.distance = function (v) {
            if (!v) {
                v = new Vector(0.0, 0.0);
            }
            return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
        };
        /**
         * Normalizes a vector to have a magnitude of 1.
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
         * @param size  The factor to scale the magnitude by
         */
        Vector.prototype.scale = function (size) {
            return new Vector(this.x * size, this.y * size);
        };
        /**
         * Adds one vector to another, alias for add
         * @param v  The vector to add
         */
        Vector.prototype.plus = function (v) {
            return this.add(v);
        };
        /**
         * Adds one vector to another
         * @param v The vector to add
         */
        Vector.prototype.add = function (v) {
            return new Vector(this.x + v.x, this.y + v.y);
        };
        /**
         * Subtracts a vector from another, alias for minus
         * @param v The vector to subtract
         */
        Vector.prototype.subtract = function (v) {
            return this.minus(v);
        };
        /**
         * Subtracts a vector from the current vector
         * @param v The vector to subtract
         */
        Vector.prototype.minus = function (v) {
            return new Vector(this.x - v.x, this.y - v.y);
        };
        /**
         * Performs a dot product with another vector
         * @param v  The vector to dot
         */
        Vector.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y;
        };
        /**
         * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
         * @param v  The vector to cross
         */
        Vector.prototype.cross = function (v) {
            return this.x * v.y - this.y * v.x;
        };
        /**
         * Returns the perpendicular vector to this one
         */
        Vector.prototype.perpendicular = function () {
            return new Vector(this.y, -this.x);
        };
        /**
         * Returns the normal vector to this one
         */
        Vector.prototype.normal = function () {
            return this.perpendicular().normalize();
        };
        /**
         * Returns the angle of this vector.
         */
        Vector.prototype.toAngle = function () {
            return Math.atan2(this.y, this.x);
        };
        /**
         * Returns the point represention of this vector
         */
        Vector.prototype.toPoint = function () {
            return new Point(this.x, this.y);
        };
        /**
         * Rotates the current vector around a point by a certain number of
         * degrees in radians
         */
        Vector.prototype.rotate = function (angle, anchor) {
            return _super.prototype.rotate.call(this, angle, anchor).toVector();
        };
        /**
         * Creates new vector that has the same values as the previous.
         */
        Vector.prototype.clone = function () {
            return new Vector(this.x, this.y);
        };
        /**
         * A (0, 0) vector
         */
        Vector.Zero = new Vector(0, 0);
        return Vector;
    })(Point);
    ex.Vector = Vector;
    /**
     * A 2D ray that can be cast into the scene to do collision detection
     */
    var Ray = (function () {
        /**
         * @param pos The starting position for the ray
         * @param dir The vector indicating the direction of the ray
         */
        function Ray(pos, dir) {
            this.pos = pos;
            this.dir = dir.normalize();
        }
        /**
         * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
         * This number indicates the mathematical intersection time.
         * @param line  The line to test
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
         */
        Ray.prototype.getPoint = function (time) {
            return this.pos.toVector().add(this.dir.scale(time)).toPoint();
        };
        return Ray;
    })();
    ex.Ray = Ray;
    /**
     * A 2D line segment
     */
    var Line = (function () {
        /**
         * @param begin  The starting point of the line segment
         * @param end  The ending point of the line segment
         */
        function Line(begin, end) {
            this.begin = begin;
            this.end = end;
        }
        /**
         * Returns the slope of the line in the form of a vector
         */
        Line.prototype.getSlope = function () {
            var begin = this.begin.toVector();
            var end = this.end.toVector();
            var distance = begin.distance(end);
            return end.minus(begin).scale(1 / distance);
        };
        /**
         * Returns the length of the line segment in pixels
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
    /**
     * A projection
     * @todo
     */
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
/// <reference path="../Algebra.ts"/>
/// <reference path="../Events.ts"/>
/**
 * Utilities
 *
 * Excalibur utilities for math, string manipulation, etc.
 */
var ex;
(function (ex) {
    var Util;
    (function (Util) {
        Util.TwoPI = Math.PI * 2;
        function base64Encode(inputStr) {
            var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            var outputStr = '';
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
        function addItemToArray(item, array) {
            if (array.indexOf(item) === -1) {
                array.push(item);
                return true;
            }
            return false;
        }
        Util.addItemToArray = addItemToArray;
        function removeItemToArray(item, array) {
            var index = -1;
            if ((index = array.indexOf(item)) > -1) {
                array.splice(index, 1);
                return true;
            }
            return false;
        }
        Util.removeItemToArray = removeItemToArray;
        function contains(array, obj) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === obj) {
                    return true;
                }
            }
            return false;
        }
        Util.contains = contains;
        function getOppositeSide(side) {
            if (side === ex.Side.Top) {
                return ex.Side.Bottom;
            }
            if (side === ex.Side.Bottom) {
                return ex.Side.Top;
            }
            if (side === ex.Side.Left) {
                return ex.Side.Right;
            }
            if (side === ex.Side.Right) {
                return ex.Side.Left;
            }
            return ex.Side.None;
        }
        Util.getOppositeSide = getOppositeSide;
        /**
         * Excaliburs dynamically resizing collection
         */
        var Collection = (function () {
            /**
             * @param initialSize  Initial size of the internal backing array
             */
            function Collection(initialSize) {
                if (initialSize === void 0) { initialSize = Collection.DefaultSize; }
                this._internalArray = null;
                this._endPointer = 0;
                this._internalArray = new Array(initialSize);
            }
            Collection.prototype._resize = function () {
                var newSize = this._internalArray.length * 2;
                var newArray = new Array(newSize);
                var count = this.count();
                for (var i = 0; i < count; i++) {
                    newArray[i] = this._internalArray[i];
                }
                delete this._internalArray;
                this._internalArray = newArray;
            };
            /**
             * Push elements to the end of the collection
             */
            Collection.prototype.push = function (element) {
                if (this._endPointer === this._internalArray.length) {
                    this._resize();
                }
                return this._internalArray[this._endPointer++] = element;
            };
            /**
             * Removes elements from the end of the collection
             */
            Collection.prototype.pop = function () {
                this._endPointer = this._endPointer - 1 < 0 ? 0 : this._endPointer - 1;
                return this._internalArray[this._endPointer];
            };
            /**
             * Returns the count of the collection
             */
            Collection.prototype.count = function () {
                return this._endPointer;
            };
            /**
             * Empties the collection
             */
            Collection.prototype.clear = function () {
                this._endPointer = 0;
            };
            /**
             * Returns the size of the internal backing array
             */
            Collection.prototype.internalSize = function () {
                return this._internalArray.length;
            };
            /**
             * Returns an element at a specific index
             * @param index  Index of element to retreive
             */
            Collection.prototype.elementAt = function (index) {
                if (index >= this.count()) {
                    return;
                }
                return this._internalArray[index];
            };
            /**
             * Inserts an element at a specific index
             * @param index  Index to insert the element
             */
            Collection.prototype.insert = function (index, value) {
                if (index >= this.count()) {
                    this._resize();
                }
                return this._internalArray[index] = value;
            };
            /**
             * Removes an element at a specific index
             * @param index  Index of element to remove
             */
            Collection.prototype.remove = function (index) {
                var count = this.count();
                if (count === 0) {
                    return;
                }
                // O(n) Shift 
                var removed = this._internalArray[index];
                for (var i = index; i < count; i++) {
                    this._internalArray[i] = this._internalArray[i + 1];
                }
                this._endPointer--;
                return removed;
            };
            /**
             * Removes an element by reference
             * @param element  Element to retreive
             */
            Collection.prototype.removeElement = function (element) {
                var index = this._internalArray.indexOf(element);
                this.remove(index);
            };
            /**
             * Returns a array representing the collection
             */
            Collection.prototype.toArray = function () {
                return this._internalArray.slice(0, this._endPointer);
            };
            /**
             * Iterate over every element in the collection
             * @param func  Callback to call for each element passing a reference to the element and its index, returned values are ignored
             */
            Collection.prototype.forEach = function (func) {
                var i = 0, count = this.count();
                for (i; i < count; i++) {
                    func.call(this, this._internalArray[i], i);
                }
            };
            /**
             * Mutate every element in the collection
             * @param func  Callback to call for each element passing a reference to the element and its index, any values returned mutate
             * the collection
             */
            Collection.prototype.map = function (func) {
                var count = this.count();
                for (var i = 0; i < count; i++) {
                    this._internalArray[i] = func.call(this, this._internalArray[i], i);
                }
            };
            /**
             * Default collection size
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
     * Sprites
     *
     * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
     * images or parts of images from a [[Texture]] resource to the screen.
     *
     * ## Creating a sprite
     *
     * To create a [[Sprite]] you need to have a loaded [[Texture]] resource. You can
     * then use [[Texture.asSprite]] to quickly create a [[Sprite]] or you can create
     * a new instance of [[Sprite]] using the constructor. This is useful if you
     * want to "slice" out a portion of an image or if you want to change the dimensions.
     *
     * ```js
     * var game = new ex.Engine();
     * var txPlayer = new ex.Texture("/assets/tx/player.png");
     *
     * // load assets
     * var loader = new ex.Loader(txPlayer);
     *
     * // start game
     * game.start(loader).then(function () {
     *
     *   // create a sprite (quick)
     *   var playerSprite = txPlayer.asSprite();
     *
     *   // create a sprite (custom)
     *   var playerSprite = new ex.Sprite(txPlayer, 0, 0, 80, 80);
     *
     * });
     * ```
     *
     * You can then assign an [[Actor]] a sprite through [[Actor.addDrawing]] and
     * [[Actor.setDrawing]].
     *
     * ## Sprite Effects
     *
     * Excalibur offers many sprite effects such as [[Effects.Colorize]] to let you manipulate
     * sprites. Keep in mind, more effects requires more power and can lead to memory or CPU
     * constraints and hurt performance. Each effect must be reprocessed every frame for each sprite.
     *
     * It's still recommended to create an [[Animation]] or build in your effects to the sprites
     * for optimal performance.
     *
     * There are a number of convenience methods available to perform sprite effects. Sprite effects are
     * side-effecting.
     *
     * ```typescript
     *
     * var playerSprite = new ex.Sprite(txPlayer, 0, 0, 80, 80);
     *
     * // darken a sprite by a percentage
     * playerSprite.darken(.2); // 20%
     *
     * // lighten a sprite by a percentage
     * playerSprite.lighten(.2); // 20%
     *
     * // saturate a sprite by a percentage
     * playerSprite.saturate(.2); // 20%
     *
     * // implement a custom effect
     * class CustomEffect implements ex.EffectsISpriteEffect {
     *
     *   updatePixel(x: number, y: number, imageData: ImageData) {
     *       // modify ImageData
     *   }
     * }
     *
     * playerSprite.addEffect(new CustomEffect());
     *
     * ```
     */
    var Sprite = (function () {
        /**
         * @param image   The backing image texture to build the Sprite
         * @param sx      The x position of the sprite
         * @param sy      The y position of the sprite
         * @param swidth  The width of the sprite in pixels
         * @param sheight The height of the sprite in pixels
         */
        function Sprite(image, sx, sy, swidth, sheight) {
            var _this = this;
            this.sx = sx;
            this.sy = sy;
            this.swidth = swidth;
            this.sheight = sheight;
            this.rotation = 0.0;
            this.anchor = new ex.Point(0.0, 0.0);
            this.scale = new ex.Point(1, 1);
            this.logger = ex.Logger.getInstance();
            /**
             * Draws the sprite flipped vertically
             */
            this.flipVertical = false;
            /**
             * Draws the sprite flipped horizontally
             */
            this.flipHorizontal = false;
            this.width = 0;
            this.height = 0;
            this.effects = [];
            this.internalImage = new Image();
            this.naturalWidth = 0;
            this.naturalHeight = 0;
            this._spriteCanvas = null;
            this._spriteCtx = null;
            this._pixelData = null;
            this._pixelsLoaded = false;
            this._dirtyEffect = false;
            if (sx < 0 || sy < 0 || swidth < 0 || sheight < 0) {
                this.logger.error('Sprite cannot have any negative dimensions x:', sx, 'y:', sy, 'width:', swidth, 'height:', sheight);
            }
            this._texture = image;
            this._spriteCanvas = document.createElement('canvas');
            this._spriteCanvas.width = swidth;
            this._spriteCanvas.height = sheight;
            this._spriteCtx = this._spriteCanvas.getContext('2d');
            this._texture.loaded.then(function () {
                _this._spriteCanvas.width = _this._spriteCanvas.width || _this._texture.image.naturalWidth;
                _this._spriteCanvas.height = _this._spriteCanvas.height || _this._texture.image.naturalHeight;
                _this._loadPixels();
                _this._dirtyEffect = true;
            }).error(function (e) {
                _this.logger.error('Error loading texture ', _this._texture.path, e);
            });
            this.width = swidth;
            this.height = sheight;
            this.naturalWidth = swidth;
            this.naturalHeight = sheight;
        }
        Sprite.prototype._loadPixels = function () {
            if (this._texture.isLoaded() && !this._pixelsLoaded) {
                var clamp = ex.Util.clamp;
                var naturalWidth = this._texture.image.naturalWidth || 0;
                var naturalHeight = this._texture.image.naturalHeight || 0;
                if (this.swidth > naturalWidth) {
                    this.logger.warn('The sprite width', this.swidth, 'exceeds the width', naturalWidth, 'of the backing texture', this._texture.path);
                }
                if (this.sheight > naturalHeight) {
                    this.logger.warn('The sprite height', this.sheight, 'exceeds the height', naturalHeight, 'of the backing texture', this._texture.path);
                }
                this._spriteCtx.drawImage(this._texture.image, clamp(this.sx, 0, naturalWidth), clamp(this.sy, 0, naturalHeight), clamp(this.swidth, 0, naturalWidth), clamp(this.sheight, 0, naturalHeight), 0, 0, this.swidth, this.sheight);
                //this.pixelData = this.spriteCtx.getImageData(0, 0, this.swidth, this.sheight);
                this.internalImage.src = this._spriteCanvas.toDataURL('image/png');
                this._pixelsLoaded = true;
            }
        };
        /**
         * Applies the [[Effects.Opacity]] to a sprite, setting the alpha of all pixels to a given value
         */
        Sprite.prototype.opacity = function (value) {
            this.addEffect(new ex.Effects.Opacity(value));
        };
        /**
         * Applies the [[Effects.Grayscale]] to a sprite, removing color information.
         */
        Sprite.prototype.grayscale = function () {
            this.addEffect(new ex.Effects.Grayscale());
        };
        /**
         * Applies the [[Effects.Invert]] to a sprite, inverting the pixel colors.
         */
        Sprite.prototype.invert = function () {
            this.addEffect(new ex.Effects.Invert());
        };
        /**
         * Applies the [[Effects.Fill]] to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        Sprite.prototype.fill = function (color) {
            this.addEffect(new ex.Effects.Fill(color));
        };
        /**
         * Applies the [[Effects.Colorize]] to a sprite, changing the color channels of all pixesl to be the average of the original color
         * and the provided color.
         */
        Sprite.prototype.colorize = function (color) {
            this.addEffect(new ex.Effects.Colorize(color));
        };
        /**
         * Applies the [[Effects.Lighten]] to a sprite, changes the lightness of the color according to HSL
         */
        Sprite.prototype.lighten = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Lighten(factor));
        };
        /**
         * Applies the [[Effects.Darken]] to a sprite, changes the darkness of the color according to HSL
         */
        Sprite.prototype.darken = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Darken(factor));
        };
        /**
         * Applies the [[Effects.Saturate]] to a sprite, saturates the color acccording to HSL
         */
        Sprite.prototype.saturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Saturate(factor));
        };
        /**
         * Applies the [[Effects.Desaturate]] to a sprite, desaturates the color acccording to HSL
         */
        Sprite.prototype.desaturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Desaturate(factor));
        };
        /**
         * Adds a new [[Effects.ISpriteEffect]] to this drawing.
         * @param effect  Effect to add to the this drawing
         */
        Sprite.prototype.addEffect = function (effect) {
            this.effects.push(effect);
            // We must check if the texture and the backing sprite pixels are loaded as well before 
            // an effect can be applied
            if (!this._texture.isLoaded() || !this._pixelsLoaded) {
                this._dirtyEffect = true;
            }
            else {
                this._applyEffects();
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
            if (!this._texture.isLoaded() || !this._pixelsLoaded) {
                this._dirtyEffect = true;
            }
            else {
                this._applyEffects();
            }
        };
        Sprite.prototype._applyEffects = function () {
            var clamp = ex.Util.clamp;
            var naturalWidth = this._texture.image.naturalWidth || 0;
            var naturalHeight = this._texture.image.naturalHeight || 0;
            this._spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
            this._spriteCtx.drawImage(this._texture.image, clamp(this.sx, 0, naturalWidth), clamp(this.sy, 0, naturalHeight), clamp(this.swidth, 0, naturalWidth), clamp(this.sheight, 0, naturalHeight), 0, 0, this.swidth, this.sheight);
            this._pixelData = this._spriteCtx.getImageData(0, 0, this.swidth, this.sheight);
            var i = 0, x = 0, y = 0, len = this.effects.length;
            for (i; i < len; i++) {
                y = 0;
                for (y; y < this.sheight; y++) {
                    x = 0;
                    for (x; x < this.swidth; x++) {
                        this.effects[i].updatePixel(x, y, this._pixelData);
                    }
                }
            }
            this._spriteCtx.clearRect(0, 0, this.swidth, this.sheight);
            this._spriteCtx.putImageData(this._pixelData, 0, 0);
            this.internalImage.src = this._spriteCanvas.toDataURL('image/png');
        };
        /**
         * Clears all effects from the drawing and return it to its original state.
         */
        Sprite.prototype.clearEffects = function () {
            this.effects.length = 0;
            this._applyEffects();
        };
        /**
         * Resets the internal state of the drawing (if any)
         */
        Sprite.prototype.reset = function () {
            // do nothing
        };
        Sprite.prototype.debugDraw = function (ctx, x, y) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.rotation);
            var xpoint = (this.width * this.scale.x) * this.anchor.x;
            var ypoint = (this.height * this.scale.y) * this.anchor.y;
            ctx.strokeStyle = ex.Color.Black;
            ctx.strokeRect(-xpoint, -ypoint, this.width * this.scale.x, this.height * this.scale.y);
            ctx.restore();
        };
        /**
         * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
         * @param ctx  The 2D rendering context
         * @param x    The x coordinate of where to draw
         * @param y    The y coordinate of where to draw
         */
        Sprite.prototype.draw = function (ctx, x, y) {
            if (this._dirtyEffect) {
                this._applyEffects();
                this._dirtyEffect = false;
            }
            // calculating current dimensions
            this.width = this.naturalWidth * this.scale.x;
            this.height = this.naturalHeight * this.scale.y;
            ctx.save();
            var xpoint = this.width * this.anchor.x;
            var ypoint = this.height * this.anchor.y;
            ctx.translate(x, y);
            ctx.rotate(this.rotation);
            // todo cache flipped sprites
            if (this.flipHorizontal) {
                ctx.translate(this.swidth * this.scale.x, 0);
                ctx.scale(-1, 1);
            }
            if (this.flipVertical) {
                ctx.translate(0, this.sheight * this.scale.y);
                ctx.scale(1, -1);
            }
            if (this.internalImage) {
                ctx.drawImage(this.internalImage, 0, 0, this.swidth, this.sheight, -xpoint, -ypoint, this.swidth * this.scale.x, this.sheight * this.scale.y);
            }
            ctx.restore();
        };
        /**
         * Produces a copy of the current sprite
         */
        Sprite.prototype.clone = function () {
            var result = new Sprite(this._texture, this.sx, this.sy, this.swidth, this.sheight);
            result.scale = this.scale.clone();
            result.rotation = this.rotation;
            result.flipHorizontal = this.flipHorizontal;
            result.flipVertical = this.flipVertical;
            var i = 0, len = this.effects.length;
            for (i; i < len; i++) {
                result.addEffect(this.effects[i]);
            }
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
     * Sprite Sheets
     *
     * Sprite sheets are a useful mechanism for slicing up image resources into
     * separate sprites or for generating in game animations. [[Sprite|Sprites]] are organized
     * in row major order in the [[SpriteSheet]].
     *
     * You can also use a [[SpriteFont]] which is special kind of [[SpriteSheet]] for use
     * with [[Label|Labels]].
     *
     * ## Creating a SpriteSheet
     *
     * To create a [[SpriteSheet]] you need a loaded [[Texture]] resource.
     *
     * ```js
     * var game = new ex.Engine();
     * var txAnimPlayerIdle = new ex.Texture("/assets/tx/anim-player-idle.png");
     *
     * // load assets
     * var loader = new ex.Loader(txAnimPlayerIdle);
     *
     * // start game
     * game.start(loader).then(function () {
     *   var player = new ex.Actor();
     *
     *   // create sprite sheet with 5 columns, 1 row, 80x80 frames
     *   var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
     *
     *   // create animation (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
     *
     *   // add drawing to player as "idle"
     *   player.addDrawing("idle", playerIdleAnimation);
     *
     *   // add player to game
     *   game.add(player);
     * });
     * ```
     *
     * ## Creating animations
     *
     * [[SpriteSheets]] provide a quick way to generate a new [[Animation]] instance.
     * You can use *all* the frames of a [[Texture]] ([[SpriteSheet.getAnimationForAll]])
     * or you can use a range of frames ([[SpriteSheet.getAnimationBetween]]) or you
     * can use specific frames ([[SpriteSheet.getAnimationByIndices]]).
     *
     * To create an [[Animation]] these methods must be passed an instance of [[Engine]].
     * It's recommended to generate animations for an [[Actor]] in their [[Actor.onInitialize]]
     * event because the [[Engine]] is passed to the initialization function. However, if your
     * [[Engine]] instance is in the global scope, you can create an [[Animation]] at any time
     * provided the [[Texture]] has been [[Loader|loaded]].
     *
     * ```js
     *   // create sprite sheet with 5 columns, 1 row, 80x80 frames
     *   var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
     *
     *   // create animation for all frames (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
     *
     *   // create animation for a range of frames (2-4) (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationBetween(game, 1, 3, 125);
     *
     *   // create animation for specific frames 2, 4, 5 (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationByIndices(game, [1, 3, 4], 125);
     *
     *   // create a repeating animation (ping-pong)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationByIndices(game, [1, 3, 4, 3, 1], 125);
     * ```
     *
     * ## Multiple rows
     *
     * Sheets are organized in "row major order" which means left-to-right, top-to-bottom.
     * Indexes are zero-based, so while you might think to yourself the first column is
     * column "1", to the engine it is column "0". You can easily calculate an index
     * of a frame using this formula:
     *
     *     Given: col = 5, row = 3, columns = 10
     *
     *     index = col + row * columns
     *     index = 4 + 2 * 10 // zero-based, subtract 1 from col & row
     *     index = 24
     *
     * You can also simply count the frames of the image visually starting from the top left
     * and beginning with zero.
     *
     * ```js
     * // get a sprite for column 3, row 6
     * var sprite = animation.getSprite(2 + 5 * 10)
     * ```
     */
    var SpriteSheet = (function () {
        /**
         * @param image     The backing image texture to build the SpriteSheet
         * @param columns   The number of columns in the image texture
         * @param rows      The number of rows in the image texture
         * @param spWidth   The width of each individual sprite in pixels
         * @param spHeight  The height of each individual sprite in pixels
         */
        function SpriteSheet(image, columns, rows, spWidth, spHeight) {
            this.image = image;
            this.columns = columns;
            this.rows = rows;
            this.sprites = [];
            this._internalImage = image.image;
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
         * @param engine   Reference to the current game [[Engine]]
         * @param indices  An array of sprite indices to use in the animation
         * @param speed    The number in milliseconds to display each frame in the animation
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
         * @param engine      Reference to the current game Engine
         * @param beginIndex  The index to start taking frames
         * @param endIndex    The index to stop taking frames
         * @param speed       The number in milliseconds to display each frame in the animation
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
         * @param engine  Reference to the current game [[Engine]]
         * @param speed   The number in milliseconds to display each frame the animation
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
         * @param index  The index of the sprite
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
     * Sprite Fonts
     *
     * Sprite fonts are a used in conjunction with a [[Label]] to specify
     * a particular bitmap as a font. Note that some font features are not
     * supported by Sprite fonts.
     *
     * ## Generating the font sheet
     *
     * You can use tools such as [Bitmap Font Builder](http://www.lmnopc.com/bitmapfontbuilder/) to
     * generate a sprite sheet for you to load into Excalibur.
     *
     * ## Creating a sprite font
     *
     * Start with an image with a grid containing all the letters you want to support.
     * Once you load it into Excalibur using a [[Texture]] resource, you can create
     * a [[SpriteFont]] using the constructor.
     *
     * For example, here is a representation of a font sprite sheet for an uppercase alphabet
     * with 4 columns and 7 rows:
     *
     * ```
     * ABCD
     * EFGH
     * IJKL
     * MNOP
     * QRST
     * UVWX
     * YZ
     * ```
     *
     * Each letter is 30x30 and after Z is a blank one to represent a space.
     *
     * Then to create the [[SpriteFont]]:
     *
     * ```js
     * var game = new ex.Engine();
     * var txFont = new ex.Texture("/assets/tx/font.png");
     *
     * // load assets
     * var loader = new ex.Loader(txFont);
     *
     * // start game
     * game.start(loader).then(function () {
     *
     *   // create a font
     *   var font = new ex.SpriteFont(txFont, "ABCDEFGHIJKLMNOPQRSTUVWXYZ ", true, 4, 7, 30, 30);
     *
     *   // create a label using this font
     *   var label = new ex.Label("Hello World", 0, 0, null, font);
     *
     *   // display in-game
     *   game.add(label);
     *
     * });
     * ```
     *
     * If you want to use a lowercase representation in the font, you can pass `false` for [[caseInsensitive]]
     * and the matching will be case-sensitive. In our example, you would need another 7 rows of
     * lowercase characters.
     *
     * ## Font colors
     *
     * When using sprite fonts with a [[Label]], you can set the [[Label.color]] property
     * to use different colors.
     *
     * ## Known Issues
     *
     * **One font per Label**
     * [Issue #172](https://github.com/excaliburjs/Excalibur/issues/172)
     *
     * If you intend on changing colors or applying opacity effects, you have to use
     * a new [[SpriteFont]] instance per [[Label]].
     *
     * **Using opacity removes other effects**
     * [Issue #148](https://github.com/excaliburjs/Excalibur/issues/148)
     *
     * If you apply any custom effects to the sprites in a SpriteFont, including trying to
     * use [[Label.color]], they will be removed when modifying [[Label.opacity]].
     *
     */
    var SpriteFont = (function (_super) {
        __extends(SpriteFont, _super);
        /**
         * @param image           The backing image texture to build the SpriteFont
         * @param alphabet        A string representing all the characters in the image, in row major order.
         * @param caseInsensitve  Indicate whether this font takes case into account
         * @param columns         The number of columns of characters in the image
         * @param rows            The number of rows of characters in the image
         * @param spWdith         The width of each character in pixels
         * @param spHeight        The height of each character in pixels
         */
        function SpriteFont(image, alphabet, caseInsensitive, columns, rows, spWidth, spHeight) {
            _super.call(this, image, columns, rows, spWidth, spHeight);
            this.image = image;
            this.alphabet = alphabet;
            this.caseInsensitive = caseInsensitive;
            this.spWidth = spWidth;
            this.spHeight = spHeight;
            this._spriteLookup = {};
            this._colorLookup = {};
            this._currentColor = ex.Color.Black.clone();
            this._currentOpacity = 1.0;
            this._sprites = {};
            // text shadow
            this._textShadowOn = false;
            this._textShadowDirty = true;
            this._textShadowColor = ex.Color.Black.clone();
            this._textShadowSprites = {};
            this._shadowOffsetX = 5;
            this._shadowOffsetY = 5;
            this._sprites = this.getTextSprites();
        }
        /**
         * Returns a dictionary that maps each character in the alphabet to the appropriate [[Sprite]].
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
        /**
         * Sets the text shadow for sprite fonts
         * @param offsetX      The x offset in pixels to place the shadow
         * @param offsetY      The y offset in pixles to place the shadow
         * @param shadowColor  The color of the text shadow
         */
        SpriteFont.prototype.setTextShadow = function (offsetX, offsetY, shadowColor) {
            this._textShadowOn = true;
            this._shadowOffsetX = offsetX;
            this._shadowOffsetY = offsetY;
            this._textShadowColor = shadowColor.clone();
            this._textShadowDirty = true;
            for (var character in this._sprites) {
                this._textShadowSprites[character] = this._sprites[character].clone();
            }
        };
        /**
         * Toggles text shadows on or off
         */
        SpriteFont.prototype.useTextShadow = function (on) {
            this._textShadowOn = on;
            if (on) {
                this.setTextShadow(5, 5, this._textShadowColor);
            }
        };
        /**
         * Draws the current sprite font
         */
        SpriteFont.prototype.draw = function (ctx, text, x, y, options) {
            options = this._parseOptions(options);
            if (this._currentColor.toString() !== options.color.toString() || this._currentOpacity !== options.opacity) {
                this._currentOpacity = options.opacity;
                this._currentColor = options.color;
                for (var char in this._sprites) {
                    this._sprites[char].clearEffects();
                    this._sprites[char].fill(options.color);
                    this._sprites[char].opacity(options.opacity);
                }
            }
            if (this._textShadowOn && this._textShadowDirty && this._textShadowColor) {
                for (var characterShadow in this._textShadowSprites) {
                    this._textShadowSprites[characterShadow].clearEffects();
                    this._textShadowSprites[characterShadow].addEffect(new ex.Effects.Fill(this._textShadowColor.clone()));
                }
                this._textShadowDirty = false;
            }
            // find the current length of text in pixels
            var sprite = this.sprites[0];
            // find the current height fo the text in pixels
            var height = sprite.sheight;
            // calculate appropriate scale for font size
            var scale = options.fontSize / height;
            var length = (text.length * sprite.swidth * scale) + (text.length * options.letterSpacing);
            var currX = x;
            if (options.textAlign === ex.TextAlign.Left || options.textAlign === ex.TextAlign.Start) {
                currX = x;
            }
            else if (options.textAlign === ex.TextAlign.Right || options.textAlign === ex.TextAlign.End) {
                currX = x - length;
            }
            else if (options.textAlign === ex.TextAlign.Center) {
                currX = x - length / 2;
            }
            var currY = y - height * scale;
            if (options.baseAlign === ex.BaseAlign.Top || options.baseAlign === ex.BaseAlign.Hanging) {
                currY = y;
            }
            else if (options.baseAlign === ex.BaseAlign.Ideographic ||
                options.baseAlign === ex.BaseAlign.Bottom ||
                options.baseAlign === ex.BaseAlign.Alphabetic) {
                currY = y - height * scale;
            }
            else if (options.baseAlign === ex.BaseAlign.Middle) {
                currY = y - (height * scale) / 2;
            }
            for (var i = 0; i < text.length; i++) {
                var character = text[i];
                if (this.caseInsensitive) {
                    character = character.toLowerCase();
                }
                try {
                    // if text shadow
                    if (this._textShadowOn) {
                        this._textShadowSprites[character].scale.x = scale;
                        this._textShadowSprites[character].scale.y = scale;
                        this._textShadowSprites[character].draw(ctx, currX + this._shadowOffsetX, currY + this._shadowOffsetY);
                    }
                    var charSprite = this._sprites[character];
                    charSprite.scale.x = scale;
                    charSprite.scale.y = scale;
                    charSprite.draw(ctx, currX, currY);
                    currX += (charSprite.width + options.letterSpacing);
                }
                catch (e) {
                    ex.Logger.getInstance().error("SpriteFont Error drawing char " + character);
                }
            }
        };
        SpriteFont.prototype._parseOptions = function (options) {
            return {
                fontSize: options.fontSize || 10,
                letterSpacing: options.letterSpacing || 0,
                color: options.color || ex.Color.Black.clone(),
                textAlign: typeof options.textAlign === undefined ? ex.TextAlign.Left : options.textAlign,
                baseAlign: typeof options.baseAlign === undefined ? ex.BaseAlign.Bottom : options.baseAlign,
                maxWidth: options.maxWidth || -1,
                opacity: options.opacity || 0
            };
        };
        return SpriteFont;
    })(SpriteSheet);
    ex.SpriteFont = SpriteFont;
})(ex || (ex = {}));
/// <reference path="Engine.ts" />
/// <reference path="Drawing/SpriteSheet.ts" />
var ex;
(function (ex) {
    /**
     * Tile Maps
     *
     * The [[TileMap]] class provides a lightweight way to do large complex scenes with collision
     * without the overhead of actors.
     *
     * Tile maps are made up of [[Cell|Cells]] which can draw [[TileSprite|TileSprites]]. Tile
     * maps support multiple layers and work well for building tile-based games such as RPGs,
     * adventure games, strategy games, and others. Cells can be [[Cell.solid|solid]] so
     * that Actors can't pass through them.
     *
     * We recommend using the [Tiled map editor](http://www.mapeditor.org/) to build your maps
     * and export them to JSON. You can then load them using a [[Resource|Generic Resource]]
     * and process them to create your levels. A [[TileMap]] can then be used as part of a
     * level or map class that adds enemies and builds game objects from the Tiled map.
     *
     *
     * ## Creating a tile map
     *
     * A [[TileMap]] is meant to be used in conjuction with a map editor. Creating
     * a tile map is fairly straightforward.
     *
     * You need a tile sheet (see [[SpriteSheet]]) that holds all the available tiles to
     * draw. [[TileMap]] supports multiple sprite sheets, letting you organize tile sheets
     * to your liking.
     *
     * Next, you need to populate each [[Cell]] with one or more [[TileSprite|TileSprites]]
     * using [[Cell.pushSprite]].
     * Once the [[TileMap]] is added to a [[Scene]], it will be drawn and updated.
     *
     * You can then add [[Actor|Actors]] to the [[Scene]] and interact with the [[TileMap]].
     *
     * In this example, we take in a map configuration that we designed (for example,
     * based on the exported structure of a JSON file).
     *
     * ```ts
     *
     * // define TypeScript interfaces to make our life easier
     *
     * public interface IMapDefinition {
     *   cells: IMapCellDefinition[];
     *   tileSheets: IMapTileSheet[];
     *   width: number;
     *   height: number;
     *   tileWidth: number;
     *   tileHeight: number;
     * }
     *
     * public interface IMapCellDefinition {
     *   x: number;
     *   y: number;
     *   tileId: number;
     *   sheetId: number;
     * }
     *
     * public interface IMapTileSheet {
     *   id: number;
     *   path: string;
     *   columns: number;
     *   rows: number;
     * }
     *
     * // create a Map class that creates a game map
     * // based on JSON configuration
     *
     * public class Map extends ex.Scene {
     *
     *   private _mapDefinition: IMapDefinition;
     *   private _tileMap: ex.TileMap;
     *
     *   constructor(mapDef: IMapDefinition) {
     *
     *     // store reference to definition
     *     this._mapDefinition = mapDef;
     *
     *     // create a tile map
     *     this._tileMap = new ex.TileMap(0, 0, mapDef.tileWidth, mapDef.tileHeight,
     *       mapDef.width / mapDef.tileWidth, mapDef.height / mapDef.tileHeight);
     *   }
     *
     *   public onInitialize() {
     *     // build our map based on JSON config
     *
     *     // build sprite sheets
     *     this._mapDefinition.tileSheets.forEach(sheet => {
     *
     *       // register sprite sheet with the tile map
     *       // normally, you will want to ensure you load the Texture before
     *       // creating the SpriteSheet
     *       // this can be done outside the Map class, in a Loader
     *       this._tileMap.registerSpriteSheet(sheet.id.toString(),
     *         new ex.SpriteSheet(new ex.Texture(sheet.path), sheet.columns, sheet.rows,
     *           this._mapDefinition.tileWidth, this._mapDefinition.tileHeight));
     *
     *     });
     *
     *     // fill cells with sprites
     *     this._mapDefinition.cells.forEach(cell => {
     *
     *       // create a TileSprite
     *       // assume tileId is the index of the frame in the sprite sheet
     *       var ts = new ex.TileSprite(cell.sheetId.toString(), cell.spriteId);
     *
     *       // add to cell
     *       this._tileMap.getCell(cell.x, cell.y).pushSprite(ts);
     *     }
     *   }
     * }
     *
     * // create a game
     * var game = new ex.Engine();
     *
     * // add our level (JSON from external source)
     * var map1 = new Map({ ... });
     *
     * game.add("map1", map1);
     *
     * game.start();
     * ```
     *
     * In a real game, you will want to ensure all the textures for the sprite sheets
     * have been loaded. You could do this in the [[Resource.processDownload]] function
     * of the generic resource when loading your JSON, before creating your `Map` object.
     *
     * ## Off-screen culling
     *
     * The [[TileMap]] takes care of only drawing the portion of the map that is on-screen.
     * This significantly improves performance and essentially means Excalibur can support
     * huge maps. Since Actors off-screen are not drawn, this also means maps can support
     * many actors.
     *
     * ## Collision checks
     *
     * You can use [[TileMap.collides]] to check if a given [[Actor]] is colliding with a
     * solid [[Cell]]. This method returns an intersection [[Vector]] that represents
     * the smallest overlap with colliding cells.
     */
    var TileMap = (function () {
        /**
         * @param x             The x coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
         * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
         * @param rows          The number of rows in the TileMap (should not be changed once set)
         * @param cols          The number of cols in the TileMap (should not be changed once set)
         * @param spriteSheet   The spriteSheet to use for drawing
         */
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
         * Returns the intersection vector that can be used to resolve collisions with actors. If there
         * is no collision null is returned.
         */
        TileMap.prototype.collides = function (actor) {
            var points = [];
            var width = actor.x + actor.getWidth();
            var height = actor.y + actor.getHeight();
            var actorBounds = actor.getBounds();
            var overlaps = [];
            // trace points for overlap
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
        /**
         * Returns the [[Cell]] by index (row major order)
         */
        TileMap.prototype.getCellByIndex = function (index) {
            return this.data[index];
        };
        /**
         * Returns the [[Cell]] by its x and y coordinates
         */
        TileMap.prototype.getCell = function (x, y) {
            if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
                return null;
            }
            return this.data[x + y * this.cols];
        };
        /**
         * Returns the [[Cell]] by testing a point in global coordinates,
         * returns `null` if no cell was found.
         */
        TileMap.prototype.getCellByPoint = function (x, y) {
            x = Math.floor((x - this.x) / this.cellWidth);
            y = Math.floor((y - this.y) / this.cellHeight);
            var cell = this.getCell(x, y);
            if (x >= 0 && y >= 0 && x < this.cols && y < this.rows && cell) {
                return cell;
            }
            return null;
        };
        TileMap.prototype.update = function (engine, delta) {
            var worldCoordsUpperLeft = engine.screenToWorldCoordinates(new ex.Point(0, 0));
            var worldCoordsLowerRight = engine.screenToWorldCoordinates(new ex.Point(engine.canvas.clientWidth, engine.canvas.clientHeight));
            this._onScreenXStart = Math.max(Math.floor(worldCoordsUpperLeft.x / this.cellWidth) - 2, 0);
            this._onScreenYStart = Math.max(Math.floor((worldCoordsUpperLeft.y - this.y) / this.cellHeight) - 2, 0);
            this._onScreenXEnd = Math.max(Math.floor(worldCoordsLowerRight.x / this.cellWidth) + 2, 0);
            this._onScreenYEnd = Math.max(Math.floor((worldCoordsLowerRight.y - this.y) / this.cellHeight) + 2, 0);
        };
        /**
         * Draws the tile map to the screen. Called by the [[Scene]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        TileMap.prototype.draw = function (ctx, delta) {
            ctx.save();
            ctx.translate(this.x, this.y);
            var x = this._onScreenXStart, xEnd = Math.min(this._onScreenXEnd, this.cols);
            var y = this._onScreenYStart, yEnd = Math.min(this._onScreenYEnd, this.rows);
            var cs, csi, cslen;
            for (x; x < xEnd; x++) {
                for (y; y < yEnd; y++) {
                    // get non-negative tile sprites
                    cs = this.getCell(x, y).sprites.filter(function (s) {
                        return s.spriteId > -1;
                    });
                    for (csi = 0, cslen = cs.length; csi < cslen; csi++) {
                        var ss = this._spriteSheets[cs[csi].spriteSheetKey];
                        // draw sprite, warning if sprite doesn't exist
                        if (ss) {
                            var sprite = ss.getSprite(cs[csi].spriteId);
                            if (sprite) {
                                sprite.draw(ctx, x * this.cellWidth, y * this.cellHeight);
                            }
                            else {
                                this.logger.warn('Sprite does not exist for id', cs[csi].spriteId, 'in sprite sheet', cs[csi].spriteSheetKey, sprite, ss);
                            }
                        }
                        else {
                            this.logger.warn('Sprite sheet', cs[csi].spriteSheetKey, 'does not exist', ss);
                        }
                    }
                }
                y = this._onScreenYStart;
            }
            ctx.restore();
        };
        /**
         * Draws all the tile map's debug info. Called by the [[Scene]].
         * @param ctx  The current rendering context
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
    /**
     * Tile sprites are used to render a specific sprite from a [[TileMap]]'s spritesheet(s)
     */
    var TileSprite = (function () {
        /**
         * @param spriteSheetKey  The key of the spritesheet to use
         * @param spriteId        The index of the sprite in the [[SpriteSheet]]
         */
        function TileSprite(spriteSheetKey, spriteId) {
            this.spriteSheetKey = spriteSheetKey;
            this.spriteId = spriteId;
        }
        return TileSprite;
    })();
    ex.TileSprite = TileSprite;
    /**
     * TileMap Cell
     *
     * A light-weight object that occupies a space in a collision map. Generally
     * created by a [[TileMap]].
     *
     * Cells can draw multiple sprites. Note that the order of drawing is the order
     * of the sprites in the array so the last one will be drawn on top. You can
     * use transparency to create layers this way.
     */
    var Cell = (function () {
        /**
         * @param x       Gets or sets x coordinate of the cell in world coordinates
         * @param y       Gets or sets y coordinate of the cell in world coordinates
         * @param width   Gets or sets the width of the cell
         * @param height  Gets or sets the height of the cell
         * @param index   The index of the cell in row major order
         * @param solid   Gets or sets whether this cell is solid
         * @param sprites The list of tile sprites to use to draw in this cell (in order)
         */
        function Cell(x, y, width, height, index, solid, sprites) {
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
         */
        Cell.prototype.getBounds = function () {
            return this._bounds;
        };
        /**
         * Gets the center coordinate of this cell
         */
        Cell.prototype.getCenter = function () {
            return new ex.Vector(this.x + this.width / 2, this.y + this.height / 2);
        };
        /**
         * Add another [[TileSprite]] to this cell
         */
        Cell.prototype.pushSprite = function (tileSprite) {
            this.sprites.push(tileSprite);
        };
        /**
         * Remove an instance of [[TileSprite]] from this cell
         */
        Cell.prototype.removeSprite = function (tileSprite) {
            var index = -1;
            if ((index = this.sprites.indexOf(tileSprite)) > -1) {
                this.sprites.splice(index, 1);
            }
        };
        /**
         * Clear all sprites from this cell
         */
        Cell.prototype.clearSprites = function () {
            this.sprites.length = 0;
        };
        return Cell;
    })();
    ex.Cell = Cell;
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
     */
    var BoundingBox = (function () {
        /**
         * @param left    x coordinate of the left edge
         * @param top     y coordinate of the top edge
         * @param right   x coordinate of the right edge
         * @param bottom  y coordinate of the bottom edge
         */
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
         */
        BoundingBox.prototype.getWidth = function () {
            return this.right - this.left;
        };
        /**
         * Returns the calculated height of the bounding box
         */
        BoundingBox.prototype.getHeight = function () {
            return this.bottom - this.top;
        };
        /**
         * Returns the perimeter of the bounding box
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
                if (this.left < val.left &&
                    this.top < val.top &&
                    val.bottom < this.bottom &&
                    val.right < this.right) {
                    return true;
                }
                return false;
            }
            return false;
        };
        /**
         * Combines this bounding box and another together returning a new bounding box
         * @param other  The bounding box to combine
         */
        BoundingBox.prototype.combine = function (other) {
            var compositeBB = new BoundingBox(Math.min(this.left, other.left), Math.min(this.top, other.top), Math.max(this.right, other.right), Math.max(this.bottom, other.bottom));
            return compositeBB;
        };
        /**
         * Test wether this bounding box collides with another returning,
         * the intersection vector that can be used to resovle the collision. If there
         * is no collision null is returned.
         * @param collidable  Other collidable to test
         */
        BoundingBox.prototype.collides = function (collidable) {
            if (collidable instanceof BoundingBox) {
                var other = collidable;
                var totalBoundingBox = this.combine(other);
                // If the total bounding box is less than the sum of the 2 bounds then there is collision
                if (totalBoundingBox.getWidth() < other.getWidth() + this.getWidth() &&
                    totalBoundingBox.getHeight() < other.getHeight() + this.getHeight()) {
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
         * Tests wether a point is contained within the bounding box,
         * using the [PIP algorithm](http://en.wikipedia.org/wiki/Point_in_polygon)
         *
         * @param p  The point to test
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
            var i = 0, len = this._points.length;
            for (i; i < len; i++) {
                ctx.lineTo(this._points[i].x, this._points[i].y);
            }
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
     * Excalibur base class that provides basic functionality such as [[EventDispatcher]]
     * and extending abilities for vanilla Javascript projects
     */
    var Class = (function () {
        function Class() {
            this.eventDispatcher = new ex.EventDispatcher(this);
        }
        /**
         * Add an event listener. You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         * @obsolete Use [[Class.on]] instead
         */
        Class.prototype.addEventListener = function (eventName, handler) {
            this.eventDispatcher.subscribe(eventName, handler);
        };
        /**
         * Removes an event listener. If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified just that handler will be removed.
         *
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         * @obsolete Use [[Class.off]] instead
         */
        Class.prototype.removeEventListener = function (eventName, handler) {
            this.eventDispatcher.unsubscribe(eventName, handler);
        };
        /**
         * Alias for `addEventListener`. You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        Class.prototype.on = function (eventName, handler) {
            this.eventDispatcher.subscribe(eventName, handler);
        };
        /**
         * Alias for `removeEventListener`. If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified only that handler will be removed.
         *
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        Class.prototype.off = function (eventName, handler) {
            this.eventDispatcher.unsubscribe(eventName, handler);
        };
        /**
         * Emits a new event
         * @param eventName   Name of the event to emit
         * @param eventObject Data associated with this event
         */
        Class.prototype.emit = function (eventName, eventObject) {
            this.eventDispatcher.emit(eventName, eventObject);
        };
        /**
         * You may wish to extend native Excalibur functionality in vanilla Javascript.
         * Any method on a class inheriting [[Class]] may be extended to support
         * additional functionaliy. In the example below we create a new type called `MyActor`.
         *
         *
         * ```js
         * var MyActor = Actor.extend({
         *
         *    constructor: function() {
         *       this.newprop = 'something';
         *       Actor.apply(this, arguments);
         *    },
         *
         *    update: function(engine, delta) {
         *       // Implement custom update
         *       // Call super constructor update
         *       Actor.prototype.update.call(this, engine, delta);
         *
         *       console.log("Something cool!");
         *    }
         * });
         *
         * var myActor = new MyActor(100, 100, 100, 100, Color.Azure);
         * ```
         *
         * In TypeScript, you only need to use the `extends` syntax, you do not need
         * to use this method of extension.
         *
         * @param methods A JSON object contain any methods/properties you want to extend
         */
        Class.extend = function (methods) {
            var parent = this;
            var child;
            if (methods && methods.hasOwnProperty('constructor')) {
                child = methods.constructor;
            }
            else {
                child = function () { return parent.apply(this, arguments); };
            }
            // Using constructor allows JS to lazily instantiate super classes
            var Super = function () { this.constructor = child; };
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
    /**
     * The Excalibur timer hooks into the internal timer and fires callbacks,
     * after a certain interval, optionally repeating.
     */
    var Timer = (function () {
        /**
         * @param callback   The callback to be fired after the interval is complete.
         * @param repeats    Indicates whether this call back should be fired only once, or repeat after every interval as completed.
         */
        function Timer(fcn, interval, repeats) {
            this.id = 0;
            this.interval = 10;
            this.fcn = function () { return; };
            this.repeats = false;
            this._elapsedTime = 0;
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
         * @param delta  Number of elapsed milliseconds since the last update.
         */
        Timer.prototype.update = function (delta) {
            this._totalTimeAlive += delta;
            this._elapsedTime += delta;
            if (this._elapsedTime > this.interval) {
                this.fcn.call(this);
                if (this.repeats) {
                    this._elapsedTime = 0;
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
                return !other.isKilled() && other.collisionType !== ex.CollisionType.PreventCollision;
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
            var k = 0, len = collisionPairs.length;
            for (k; k < len; k++) {
                collisionPairs[k].evaluate();
            }
            return collisionPairs;
        };
        NaiveCollisionResolver.prototype.update = function (targets) {
            return 0;
        };
        NaiveCollisionResolver.prototype.debugDraw = function (ctx, delta) {
            return;
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
                    throw new Error('Parent of current leaf cannot have a null left child' + currentNode);
                }
                if (!currentNode.right) {
                    throw new Error('Parent of current leaf cannot have a null right child' + currentNode);
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
            if (!node) {
                return;
            }
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
            if (!node) {
                return;
            }
            this.remove(node);
            this.nodes[actor.id] = null;
            delete this.nodes[actor.id];
        };
        DynamicTree.prototype.balance = function (node) {
            if (node === null) {
                throw new Error('Cannot balance at null node');
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
                    if (currentNode.left) {
                        helper(currentNode.left);
                    }
                    if (currentNode.right) {
                        helper(currentNode.right);
                    }
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
                return !other.isKilled() && other.collisionType !== ex.CollisionType.PreventCollision;
            });
            var actor;
            var collisionPairs = [];
            for (var j = 0, l = potentialColliders.length; j < l; j++) {
                actor = potentialColliders[j];
                this._dynamicCollisionTree.query(actor, function (other) {
                    if (other.collisionType === ex.CollisionType.PreventCollision || other.isKilled()) {
                        return false;
                    }
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
            var i = 0, len = collisionPairs.length;
            for (i; i < len; i++) {
                collisionPairs[i].evaluate();
            }
            return collisionPairs;
        };
        DynamicTreeCollisionResolver.prototype.update = function (targets) {
            var updated = 0, i = 0, len = targets.length;
            for (i; i < len; i++) {
                if (this._dynamicCollisionTree.updateActor(targets[i])) {
                    updated++;
                }
            }
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
     */
    var CollisionPair = (function () {
        /**
         * @param left       The first actor in the collision pair
         * @param right      The second actor in the collision pair
         * @param intersect  The minimum translation vector to separate the actors from the perspective of the left actor
         * @param side       The side on which the collision occured from the perspective of the left actor
         */
        function CollisionPair(left, right, intersect, side) {
            this.left = left;
            this.right = right;
            this.intersect = intersect;
            this.side = side;
        }
        /**
         * Determines if this collision pair and another are equivalent.
         */
        CollisionPair.prototype.equals = function (collisionPair) {
            return (collisionPair.left === this.left && collisionPair.right === this.right) ||
                (collisionPair.right === this.left && collisionPair.left === this.right);
        };
        /**
         * Evaluates the collision pair, performing collision resolution and event publishing appropriate to each collision type.
         */
        CollisionPair.prototype.evaluate = function () {
            // todo fire collision events on left and right actor
            // todo resolve collisions                  
            // Publish collision events on both participants
            this.left.eventDispatcher.emit('collision', new ex.CollisionEvent(this.left, this.right, this.side, this.intersect));
            this.right.eventDispatcher.emit('collision', new ex.CollisionEvent(this.right, this.left, ex.Util.getOppositeSide(this.side), this.intersect.scale(-1.0)));
            // If the actor is active push the actor out if its not passive
            var leftSide = this.side;
            if ((this.left.collisionType === ex.CollisionType.Active ||
                this.left.collisionType === ex.CollisionType.Elastic) &&
                this.right.collisionType !== ex.CollisionType.Passive) {
                this.left.y += this.intersect.y;
                this.left.x += this.intersect.x;
                // Naive elastic bounce
                if (this.left.collisionType === ex.CollisionType.Elastic) {
                    if (leftSide === ex.Side.Left) {
                        this.left.dx = Math.abs(this.left.dx);
                    }
                    else if (leftSide === ex.Side.Right) {
                        this.left.dx = -Math.abs(this.left.dx);
                    }
                    else if (leftSide === ex.Side.Top) {
                        this.left.dy = Math.abs(this.left.dy);
                    }
                    else if (leftSide === ex.Side.Bottom) {
                        this.left.dy = -Math.abs(this.left.dy);
                    }
                }
                else {
                    // Cancel velocities along intersection
                    if (this.intersect.x !== 0) {
                        if (this.left.dx <= 0 && this.right.dx <= 0) {
                            this.left.dx = Math.max(this.left.dx, this.right.dx);
                        }
                        else if (this.left.dx >= 0 && this.right.dx >= 0) {
                            this.left.dx = Math.min(this.left.dx, this.right.dx);
                        }
                        else {
                            this.left.dx = 0;
                        }
                    }
                    if (this.intersect.y !== 0) {
                        if (this.left.dy <= 0 && this.right.dy <= 0) {
                            this.left.dy = Math.max(this.left.dy, this.right.dy);
                        }
                        else if (this.left.dy >= 0 && this.right.dy >= 0) {
                            this.left.dy = Math.min(this.left.dy, this.right.dy);
                        }
                        else {
                            this.left.dy = 0;
                        }
                    }
                }
            }
            var rightSide = ex.Util.getOppositeSide(this.side);
            var rightIntersect = this.intersect.scale(-1.0);
            if ((this.right.collisionType === ex.CollisionType.Active ||
                this.right.collisionType === ex.CollisionType.Elastic) &&
                this.left.collisionType !== ex.CollisionType.Passive) {
                this.right.y += rightIntersect.y;
                this.right.x += rightIntersect.x;
                // Naive elastic bounce
                if (this.right.collisionType === ex.CollisionType.Elastic) {
                    if (rightSide === ex.Side.Left) {
                        this.right.dx = Math.abs(this.right.dx);
                    }
                    else if (rightSide === ex.Side.Right) {
                        this.right.dx = -Math.abs(this.right.dx);
                    }
                    else if (rightSide === ex.Side.Top) {
                        this.right.dy = Math.abs(this.right.dy);
                    }
                    else if (rightSide === ex.Side.Bottom) {
                        this.right.dy = -Math.abs(this.right.dy);
                    }
                }
                else {
                    // Cancel velocities along intersection
                    if (rightIntersect.x !== 0) {
                        if (this.right.dx <= 0 && this.left.dx <= 0) {
                            this.right.dx = Math.max(this.left.dx, this.right.dx);
                        }
                        else if (this.left.dx >= 0 && this.right.dx >= 0) {
                            this.right.dx = Math.min(this.left.dx, this.right.dx);
                        }
                        else {
                            this.right.dx = 0;
                        }
                    }
                    if (rightIntersect.y !== 0) {
                        if (this.right.dy <= 0 && this.left.dy <= 0) {
                            this.right.dy = Math.max(this.left.dy, this.right.dy);
                        }
                        else if (this.left.dy >= 0 && this.right.dy >= 0) {
                            this.right.dy = Math.min(this.left.dy, this.right.dy);
                        }
                        else {
                            this.right.dy = 0;
                        }
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
     * Cameras
     *
     * [[BaseCamera]] is the base class for all Excalibur cameras. Cameras are used
     * to move around your game and set focus. They are used to determine
     * what is "off screen" and can be used to scale the game.
     *
     * Excalibur comes with a [[LockedCamera]] and a [[SideCamera]], depending on
     * your game needs.
     *
     * Cameras are attached to [[Scene|Scenes]] and can be changed by
     * setting [[Scene.camera]]. By default, a [[Scene]] is initialized with a
     * [[BaseCamera]] that doesn't move and is centered on the screen.
     *
     * ## Focus
     *
     * Cameras have a [[BaseCamera.focus|focus]] which means they center around a specific
     * [[Point]]. This can be an [[Actor]] ([[BaseCamera.setActorToFollow]]) or a specific
     * [[Point]] ([[BaseCamera.setFocus]]).
     *
     * If a camera is following an [[Actor]], it will ensure the [[Actor]] is always at the
     * center of the screen. You can use [[BaseCamera.setFocus]] instead if you wish to
     * offset the focal point.
     *
     * ## Camera Shake
     *
     * To add some fun effects to your game, the [[BaseCamera.shake]] method
     * will do a random shake. This is great for explosions, damage, and other
     * in-game effects.
     *
     * ## Camera Lerp
     *
     * "Lerp" is short for [Linear Interpolation](http://en.wikipedia.org/wiki/Linear_interpolation)
     * and it enables the camera focus to move smoothly between two points using timing functions.
     * Set [[BaseCamera.lerp]] to `true` to enable "lerping".
     *
     * ## Camera Zooming
     *
     * To adjust the zoom for your game, use [[BaseCamera.zoom]] which will scale the
     * game accordingly. You can pass a duration to transition between zoom levels.
     *
     * ## Known Issues
     *
     * **Cameras do not support [[EasingFunctions]]**
     * [Issue #320](https://github.com/excaliburjs/Excalibur/issues/320)
     *
     * Currently [[BaseCamera.lerp]] only supports `easeInOutCubic` but will support
     * [[EasingFunctions|easing functions]] soon.
     *
     * **Actors following a path will wobble when camera is moving**
     * [Issue #276](https://github.com/excaliburjs/Excalibur/issues/276)
     *
     */
    var BaseCamera = (function () {
        function BaseCamera() {
            this.focus = new ex.Point(0, 0);
            this.lerp = false;
            // camera physical quantities
            this.x = 0;
            this.y = 0;
            this.z = 1;
            this.dx = 0;
            this.dy = 0;
            this.dz = 0;
            this.ax = 0;
            this.ay = 0;
            this.az = 0;
            this.rotation = 0;
            this.rx = 0;
            this._cameraMoving = false;
            this._currentLerpTime = 0;
            this._lerpDuration = 1 * 1000; // 5 seconds
            this._totalLerpTime = 0;
            this._lerpStart = null;
            this._lerpEnd = null;
            //camera effects
            this._isShaking = false;
            this._shakeMagnitudeX = 0;
            this._shakeMagnitudeY = 0;
            this._shakeDuration = 0;
            this._elapsedShakeTime = 0;
            this._isZooming = false;
            this._currentZoomScale = 1;
            this._maxZoomScale = 1;
            this._zoomDuration = 0;
            this._elapsedZoomTime = 0;
            this._zoomIncrement = 0.01;
        }
        BaseCamera.prototype._easeInOutCubic = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration / 2;
            if (currentTime < 1) {
                return endValue / 2 * currentTime * currentTime * currentTime + startValue;
            }
            currentTime -= 2;
            return endValue / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
        };
        /**
         * Sets the [[Actor]] to follow with the camera
         * @param actor  The actor to follow
         */
        BaseCamera.prototype.setActorToFollow = function (actor) {
            this._follow = actor;
        };
        /**
         * Returns the focal point of the camera, a new point giving the x and y position of the camera
         */
        BaseCamera.prototype.getFocus = function () {
            return new ex.Point(this.x, this.y);
        };
        /**
         * Sets the focal point of the camera. This value can only be set if there is no actor to be followed.
         * @param x The x coordinate of the focal point
         * @param y The y coordinate of the focal point
         * @deprecated
         */
        BaseCamera.prototype.setFocus = function (x, y) {
            if (!this._follow && !this.lerp) {
                this.x = x;
                this.y = y;
            }
            if (this.lerp) {
                this._lerpStart = this.getFocus().clone();
                this._lerpEnd = new ex.Point(x, y);
                this._currentLerpTime = 0;
                this._cameraMoving = true;
            }
        };
        /**
         * Sets the camera to shake at the specified magnitudes for the specified duration
         * @param magnitudeX  The x magnitude of the shake
         * @param magnitudeY  The y magnitude of the shake
         * @param duration    The duration of the shake in milliseconds
         */
        BaseCamera.prototype.shake = function (magnitudeX, magnitudeY, duration) {
            this._isShaking = true;
            this._shakeMagnitudeX = magnitudeX;
            this._shakeMagnitudeY = magnitudeY;
            this._shakeDuration = duration;
        };
        /**
         * Zooms the camera in or out by the specified scale over the specified duration.
         * If no duration is specified, it take effect immediately.
         * @param scale    The scale of the zoom
         * @param duration The duration of the zoom in milliseconds
         */
        BaseCamera.prototype.zoom = function (scale, duration) {
            if (duration === void 0) { duration = 0; }
            this._isZooming = true;
            this._maxZoomScale = scale;
            this._zoomDuration = duration;
            if (duration) {
                this._zoomIncrement = Math.abs(this._maxZoomScale - this._currentZoomScale) / duration * 1000;
            }
            if (this._maxZoomScale < 1) {
                if (duration) {
                    this._zoomIncrement = -1 * this._zoomIncrement;
                }
                else {
                    this._isZooming = false;
                    this._setCurrentZoomScale(this._maxZoomScale);
                }
            }
            else {
                if (!duration) {
                    this._isZooming = false;
                    this._setCurrentZoomScale(this._maxZoomScale);
                }
            }
        };
        /**
         * Gets the current zoom scale
         */
        BaseCamera.prototype.getZoom = function () {
            return this.z;
        };
        BaseCamera.prototype._setCurrentZoomScale = function (zoomScale) {
            this.z = zoomScale;
        };
        /**
         * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
         * @param delta  The number of milliseconds since the last update
         */
        BaseCamera.prototype.update = function (ctx, delta) {
            // Update placements based on linear algebra
            this.x += this.dx * delta / 1000;
            this.y += this.dy * delta / 1000;
            this.z += this.dz * delta / 1000;
            this.dx += this.ax * delta / 1000;
            this.dy += this.ay * delta / 1000;
            this.dz += this.az * delta / 1000;
            this.rotation += this.rx * delta / 1000;
            var focus = this.getFocus();
            var xShake = 0;
            var yShake = 0;
            var canvasWidth = ctx.canvas.width;
            var canvasHeight = ctx.canvas.height;
            // if zoom is 2x then canvas is 1/2 as high
            // if zoom is .5x then canvas is 2x as high
            var newCanvasWidth = canvasWidth / this.getZoom();
            var newCanvasHeight = canvasHeight / this.getZoom();
            if (this.lerp) {
                if (this._currentLerpTime < this._lerpDuration && this._cameraMoving) {
                    if (this._lerpEnd.x < this._lerpStart.x) {
                        this.x = this._lerpStart.x - (this._easeInOutCubic(this._currentLerpTime, this._lerpEnd.x, this._lerpStart.x, this._lerpDuration) - this._lerpEnd.x);
                    }
                    else {
                        this.x = this._easeInOutCubic(this._currentLerpTime, this._lerpStart.x, this._lerpEnd.x, this._lerpDuration);
                    }
                    if (this._lerpEnd.y < this._lerpStart.y) {
                        this.y = this._lerpStart.y - (this._easeInOutCubic(this._currentLerpTime, this._lerpEnd.y, this._lerpStart.y, this._lerpDuration) - this._lerpEnd.y);
                    }
                    else {
                        this.y = this._easeInOutCubic(this._currentLerpTime, this._lerpStart.y, this._lerpEnd.y, this._lerpDuration);
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
            if (this._isDoneShaking()) {
                this._isShaking = false;
                this._elapsedShakeTime = 0;
                this._shakeMagnitudeX = 0;
                this._shakeMagnitudeY = 0;
                this._shakeDuration = 0;
            }
            else {
                this._elapsedShakeTime += delta;
                xShake = (Math.random() * this._shakeMagnitudeX | 0) + 1;
                yShake = (Math.random() * this._shakeMagnitudeY | 0) + 1;
            }
            /*if (this._isDoneZooming()) {
               this._isZooming = false;
               this._elapsedZoomTime = 0;
               this._zoomDuration = 0;
               this._setCurrentZoomScale(this._maxZoomScale);
   
            } else {
               this._elapsedZoomTime += delta;
   
               this._setCurrentZoomScale(this.getZoom() + this._zoomIncrement * delta / 1000);
            }*/
            ctx.scale(this.getZoom(), this.getZoom());
            ctx.translate(-focus.x + newCanvasWidth / 2 + xShake, -focus.y + newCanvasHeight / 2 + yShake);
        };
        BaseCamera.prototype.debugDraw = function (ctx) {
            var focus = this.getFocus();
            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(focus.x, focus.y, 15, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(focus.x, focus.y, 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
        };
        BaseCamera.prototype._isDoneShaking = function () {
            return !(this._isShaking) || (this._elapsedShakeTime >= this._shakeDuration);
        };
        BaseCamera.prototype._isDoneZooming = function () {
            if (this._zoomDuration !== 0) {
                return (this._elapsedZoomTime >= this._zoomDuration);
            }
            else {
                if (this._maxZoomScale < 1) {
                    return (this._currentZoomScale <= this._maxZoomScale);
                }
                else {
                    return (this._currentZoomScale >= this._maxZoomScale);
                }
            }
        };
        return BaseCamera;
    })();
    ex.BaseCamera = BaseCamera;
    /**
     * An extension of [[BaseCamera]] that is locked vertically; it will only move side to side.
     *
     * Common usages: platformers.
     */
    var SideCamera = (function (_super) {
        __extends(SideCamera, _super);
        function SideCamera() {
            _super.apply(this, arguments);
        }
        SideCamera.prototype.getFocus = function () {
            if (this._follow) {
                return new ex.Point(this._follow.x + this._follow.getWidth() / 2, this.focus.y);
            }
            else {
                return this.focus;
            }
        };
        return SideCamera;
    })(BaseCamera);
    ex.SideCamera = SideCamera;
    /**
     * An extension of [[BaseCamera]] that is locked to an [[Actor]] or
     * [[LockedCamera.focus|focal point]]; the actor will appear in the
     * center of the screen.
     *
     * Common usages: RPGs, adventure games, top-down games.
     */
    var LockedCamera = (function (_super) {
        __extends(LockedCamera, _super);
        function LockedCamera() {
            _super.apply(this, arguments);
        }
        LockedCamera.prototype.getFocus = function () {
            if (this._follow) {
                return new ex.Point(this._follow.x + this._follow.getWidth() / 2, this._follow.y + this._follow.getHeight() / 2);
            }
            else {
                return this.focus;
            }
        };
        return LockedCamera;
    })(BaseCamera);
    ex.LockedCamera = LockedCamera;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * An enum that describes the strategies that rotation actions can use
     */
    (function (RotationType) {
        /**
         * Rotation via `ShortestPath` will use the smallest angle
         * between the starting and ending points. This strategy is the default behavior.
         */
        RotationType[RotationType["ShortestPath"] = 0] = "ShortestPath";
        /**
         * Rotation via `LongestPath` will use the largest angle
         * between the starting and ending points.
         */
        RotationType[RotationType["LongestPath"] = 1] = "LongestPath";
        /**
         * Rotation via `Clockwise` will travel in a clockwise direction,
         * regardless of the starting and ending points.
         */
        RotationType[RotationType["Clockwise"] = 2] = "Clockwise";
        /**
         * Rotation via `CounterClockwise` will travel in a counterclockwise direction,
         * regardless of the starting and ending points.
         */
        RotationType[RotationType["CounterClockwise"] = 3] = "CounterClockwise";
    })(ex.RotationType || (ex.RotationType = {}));
    var RotationType = ex.RotationType;
})(ex || (ex = {}));
/// <reference path="../Algebra.ts" />
/// <reference path="../Engine.ts" />
/// <reference path="../Actor.ts" />
/// <reference path="RotationType.ts" />
/**
 * See [[ActionContext|Action API]] for more information about Actions.
 */
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
                    this._actor = actor;
                    this._end = new ex.Vector(destx, desty);
                    this._speed = speed;
                }
                MoveTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._start = new ex.Vector(this._actor.x, this._actor.y);
                        this._distance = this._start.distance(this._end);
                        this._dir = this._end.minus(this._start).normalize();
                    }
                    var m = this._dir.scale(this._speed);
                    this._actor.dx = m.x;
                    this._actor.dy = m.y;
                    if (this.isComplete(this._actor)) {
                        this._actor.x = this._end.x;
                        this._actor.y = this._end.y;
                        this._actor.dy = 0;
                        this._actor.dx = 0;
                    }
                };
                MoveTo.prototype.isComplete = function (actor) {
                    return this._stopped || (new ex.Vector(actor.x, actor.y)).distance(this._start) >= this._distance;
                };
                MoveTo.prototype.stop = function () {
                    this._actor.dy = 0;
                    this._actor.dx = 0;
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
                    this._actor = actor;
                    this._end = new ex.Vector(destx, desty);
                    if (time <= 0) {
                        ex.Logger.getInstance().error('Attempted to moveBy time less than or equal to zero : ' + time);
                        throw new Error('Cannot move in time <= 0');
                    }
                    this._time = time;
                }
                MoveBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._start = new ex.Vector(this._actor.x, this._actor.y);
                        this._distance = this._start.distance(this._end);
                        this._dir = this._end.minus(this._start).normalize();
                        this._speed = this._distance / (this._time / 1000);
                    }
                    var m = this._dir.scale(this._speed);
                    this._actor.dx = m.x;
                    this._actor.dy = m.y;
                    if (this.isComplete(this._actor)) {
                        this._actor.x = this._end.x;
                        this._actor.y = this._end.y;
                        this._actor.dy = 0;
                        this._actor.dx = 0;
                    }
                };
                MoveBy.prototype.isComplete = function (actor) {
                    return this._stopped || (new ex.Vector(actor.x, actor.y)).distance(this._start) >= this._distance;
                };
                MoveBy.prototype.stop = function () {
                    this._actor.dy = 0;
                    this._actor.dx = 0;
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
                    this._actor = actor;
                    this._actorToFollow = actorToFollow;
                    this._current = new ex.Vector(this._actor.x, this._actor.y);
                    this._end = new ex.Vector(actorToFollow.x, actorToFollow.y);
                    this._maximumDistance = (followDistance !== undefined) ? followDistance : this._current.distance(this._end);
                    this._speed = 0;
                }
                Follow.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._distanceBetween = this._current.distance(this._end);
                        this._dir = this._end.minus(this._current).normalize();
                    }
                    var actorToFollowSpeed = Math.sqrt(Math.pow(this._actorToFollow.dx, 2) + Math.pow(this._actorToFollow.dy, 2));
                    if (actorToFollowSpeed !== 0) {
                        this._speed = actorToFollowSpeed;
                    }
                    this._current.x = this._actor.x;
                    this._current.y = this._actor.y;
                    this._end.x = this._actorToFollow.x;
                    this._end.y = this._actorToFollow.y;
                    this._distanceBetween = this._current.distance(this._end);
                    this._dir = this._end.minus(this._current).normalize();
                    if (this._distanceBetween >= this._maximumDistance) {
                        var m = this._dir.scale(this._speed);
                        this._actor.dx = m.x;
                        this._actor.dy = m.y;
                    }
                    else {
                        this._actor.dx = 0;
                        this._actor.dy = 0;
                    }
                    if (this.isComplete(this._actor)) {
                        // TODO this should never occur
                        this._actor.x = this._end.x;
                        this._actor.y = this._end.y;
                        this._actor.dy = 0;
                        this._actor.dx = 0;
                    }
                };
                Follow.prototype.stop = function () {
                    this._actor.dy = 0;
                    this._actor.dx = 0;
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
                    this._actor = actor;
                    this._actorToMeet = actorToMeet;
                    this._current = new ex.Vector(this._actor.x, this._actor.y);
                    this._end = new ex.Vector(actorToMeet.x, actorToMeet.y);
                    this._speed = speed || 0;
                    if (speed !== undefined) {
                        this._speedWasSpecified = true;
                    }
                }
                Meet.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._distanceBetween = this._current.distance(this._end);
                        this._dir = this._end.minus(this._current).normalize();
                    }
                    var actorToMeetSpeed = Math.sqrt(Math.pow(this._actorToMeet.dx, 2) + Math.pow(this._actorToMeet.dy, 2));
                    if ((actorToMeetSpeed !== 0) && (!this._speedWasSpecified)) {
                        this._speed = actorToMeetSpeed;
                    }
                    this._current.x = this._actor.x;
                    this._current.y = this._actor.y;
                    this._end.x = this._actorToMeet.x;
                    this._end.y = this._actorToMeet.y;
                    this._distanceBetween = this._current.distance(this._end);
                    this._dir = this._end.minus(this._current).normalize();
                    var m = this._dir.scale(this._speed);
                    this._actor.dx = m.x;
                    this._actor.dy = m.y;
                    if (this.isComplete(this._actor)) {
                        this._actor.x = this._end.x;
                        this._actor.y = this._end.y;
                        this._actor.dy = 0;
                        this._actor.dx = 0;
                    }
                };
                Meet.prototype.isComplete = function (actor) {
                    return this._stopped || (this._distanceBetween <= 1);
                };
                Meet.prototype.stop = function () {
                    this._actor.dy = 0;
                    this._actor.dx = 0;
                    this._stopped = true;
                };
                Meet.prototype.reset = function () {
                    this._started = false;
                };
                return Meet;
            })();
            Actions.Meet = Meet;
            var RotateTo = (function () {
                function RotateTo(actor, angleRadians, speed, rotationType) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._end = angleRadians;
                    this._speed = speed;
                    this._rotationType = rotationType || ex.RotationType.ShortestPath;
                }
                RotateTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._start = this._actor.rotation;
                        var distance1 = Math.abs(this._end - this._start);
                        var distance2 = ex.Util.TwoPI - distance1;
                        if (distance1 > distance2) {
                            this._shortDistance = distance2;
                            this._longDistance = distance1;
                        }
                        else {
                            this._shortDistance = distance1;
                            this._longDistance = distance2;
                        }
                        this._shortestPathIsPositive = (this._start - this._end + ex.Util.TwoPI) % ex.Util.TwoPI >= Math.PI;
                        switch (this._rotationType) {
                            case ex.RotationType.ShortestPath:
                                this._distance = this._shortDistance;
                                if (this._shortestPathIsPositive) {
                                    this._direction = 1;
                                }
                                else {
                                    this._direction = -1;
                                }
                                break;
                            case ex.RotationType.LongestPath:
                                this._distance = this._longDistance;
                                if (this._shortestPathIsPositive) {
                                    this._direction = -1;
                                }
                                else {
                                    this._direction = 1;
                                }
                                break;
                            case ex.RotationType.Clockwise:
                                this._direction = 1;
                                if (this._shortestPathIsPositive) {
                                    this._distance = this._shortDistance;
                                }
                                else {
                                    this._distance = this._longDistance;
                                }
                                break;
                            case ex.RotationType.CounterClockwise:
                                this._direction = -1;
                                if (!this._shortestPathIsPositive) {
                                    this._distance = this._shortDistance;
                                }
                                else {
                                    this._distance = this._longDistance;
                                }
                                break;
                        }
                    }
                    this._actor.rx = this._direction * this._speed;
                    if (this.isComplete(this._actor)) {
                        this._actor.rotation = this._end;
                        this._actor.rx = 0;
                        this._stopped = true;
                    }
                };
                RotateTo.prototype.isComplete = function (actor) {
                    var distanceTravelled = Math.abs(this._actor.rotation - this._start);
                    return this._stopped || (distanceTravelled >= Math.abs(this._distance));
                };
                RotateTo.prototype.stop = function () {
                    this._actor.rx = 0;
                    this._stopped = true;
                };
                RotateTo.prototype.reset = function () {
                    this._started = false;
                };
                return RotateTo;
            })();
            Actions.RotateTo = RotateTo;
            var RotateBy = (function () {
                function RotateBy(actor, angleRadians, time, rotationType) {
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._end = angleRadians;
                    this._time = time;
                    this._rotationType = rotationType || ex.RotationType.ShortestPath;
                }
                RotateBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._start = this._actor.rotation;
                        var distance1 = Math.abs(this._end - this._start);
                        var distance2 = ex.Util.TwoPI - distance1;
                        if (distance1 > distance2) {
                            this._shortDistance = distance2;
                            this._longDistance = distance1;
                        }
                        else {
                            this._shortDistance = distance1;
                            this._longDistance = distance2;
                        }
                        this._shortestPathIsPositive = (this._start - this._end + ex.Util.TwoPI) % ex.Util.TwoPI >= Math.PI;
                        switch (this._rotationType) {
                            case ex.RotationType.ShortestPath:
                                this._distance = this._shortDistance;
                                if (this._shortestPathIsPositive) {
                                    this._direction = 1;
                                }
                                else {
                                    this._direction = -1;
                                }
                                break;
                            case ex.RotationType.LongestPath:
                                this._distance = this._longDistance;
                                if (this._shortestPathIsPositive) {
                                    this._direction = -1;
                                }
                                else {
                                    this._direction = 1;
                                }
                                break;
                            case ex.RotationType.Clockwise:
                                this._direction = 1;
                                if (this._shortDistance >= 0) {
                                    this._distance = this._shortDistance;
                                }
                                else {
                                    this._distance = this._longDistance;
                                }
                                break;
                            case ex.RotationType.CounterClockwise:
                                this._direction = -1;
                                if (this._shortDistance <= 0) {
                                    this._distance = this._shortDistance;
                                }
                                else {
                                    this._distance = this._longDistance;
                                }
                                break;
                        }
                        this._speed = Math.abs(this._distance / this._time * 1000);
                    }
                    this._actor.rx = this._direction * this._speed;
                    if (this.isComplete(this._actor)) {
                        this._actor.rotation = this._end;
                        this._actor.rx = 0;
                        this._stopped = true;
                    }
                };
                RotateBy.prototype.isComplete = function (actor) {
                    var distanceTravelled = Math.abs(this._actor.rotation - this._start);
                    return this._stopped || (distanceTravelled >= Math.abs(this._distance));
                };
                RotateBy.prototype.stop = function () {
                    this._actor.rx = 0;
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
                    this._actor = actor;
                    this._endX = scaleX;
                    this._endY = scaleY;
                    this._speedX = speedX;
                    this._speedY = speedY;
                }
                ScaleTo.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._startX = this._actor.scale.x;
                        this._startY = this._actor.scale.y;
                        this._distanceX = Math.abs(this._endX - this._startX);
                        this._distanceY = Math.abs(this._endY - this._startY);
                    }
                    if (!(Math.abs(this._actor.scale.x - this._startX) >= this._distanceX)) {
                        var directionX = this._endY < this._startY ? -1 : 1;
                        this._actor.sx = this._speedX * directionX;
                    }
                    else {
                        this._actor.sx = 0;
                    }
                    if (!(Math.abs(this._actor.scale.y - this._startY) >= this._distanceY)) {
                        var directionY = this._endY < this._startY ? -1 : 1;
                        this._actor.sy = this._speedY * directionY;
                    }
                    else {
                        this._actor.sy = 0;
                    }
                    if (this.isComplete(this._actor)) {
                        this._actor.scale.x = this._endX;
                        this._actor.scale.y = this._endY;
                        this._actor.sx = 0;
                        this._actor.sy = 0;
                    }
                };
                ScaleTo.prototype.isComplete = function (actor) {
                    return this._stopped || ((Math.abs(this._actor.scale.y - this._startX) >= this._distanceX) &&
                        (Math.abs(this._actor.scale.y - this._startY) >= this._distanceY));
                };
                ScaleTo.prototype.stop = function () {
                    this._actor.sx = 0;
                    this._actor.sy = 0;
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
                    this._actor = actor;
                    this._endX = scaleX;
                    this._endY = scaleY;
                    this._time = time;
                    this._speedX = (this._endX - this._actor.scale.x) / time * 1000;
                    this._speedY = (this._endY - this._actor.scale.y) / time * 1000;
                }
                ScaleBy.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                        this._startX = this._actor.scale.x;
                        this._startY = this._actor.scale.y;
                        this._distanceX = Math.abs(this._endX - this._startX);
                        this._distanceY = Math.abs(this._endY - this._startY);
                    }
                    var directionX = this._endX < this._startX ? -1 : 1;
                    var directionY = this._endY < this._startY ? -1 : 1;
                    this._actor.sx = this._speedX * directionX;
                    this._actor.sy = this._speedY * directionY;
                    if (this.isComplete(this._actor)) {
                        this._actor.scale.x = this._endX;
                        this._actor.scale.y = this._endY;
                        this._actor.sx = 0;
                        this._actor.sy = 0;
                    }
                };
                ScaleBy.prototype.isComplete = function (actor) {
                    return this._stopped || ((Math.abs(this._actor.scale.x - this._startX) >= this._distanceX) &&
                        (Math.abs(this._actor.scale.y - this._startY) >= this._distanceY));
                };
                ScaleBy.prototype.stop = function () {
                    this._actor.sx = 0;
                    this._actor.sy = 0;
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
                    this._elapsedTime = 0;
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._delay = delay;
                }
                Delay.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                    }
                    this.x = this._actor.x;
                    this.y = this._actor.y;
                    this._elapsedTime += delta;
                };
                Delay.prototype.isComplete = function (actor) {
                    return this._stopped || (this._elapsedTime >= this._delay);
                };
                Delay.prototype.stop = function () {
                    this._stopped = true;
                };
                Delay.prototype.reset = function () {
                    this._elapsedTime = 0;
                    this._started = false;
                };
                return Delay;
            })();
            Actions.Delay = Delay;
            var Blink = (function () {
                function Blink(actor, timeVisible, timeNotVisible, numBlinks) {
                    if (numBlinks === void 0) { numBlinks = 1; }
                    this._timeVisible = 0;
                    this._timeNotVisible = 0;
                    this._elapsedTime = 0;
                    this._totalTime = 0;
                    this._stopped = false;
                    this._started = false;
                    this._actor = actor;
                    this._timeVisible = timeVisible;
                    this._timeNotVisible = timeNotVisible;
                    this._duration = (timeVisible + timeNotVisible) * numBlinks;
                }
                Blink.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                    }
                    this._elapsedTime += delta;
                    this._totalTime += delta;
                    if (this._actor.visible && this._elapsedTime >= this._timeVisible) {
                        this._actor.visible = false;
                        this._elapsedTime = 0;
                    }
                    if (!this._actor.visible && this._elapsedTime >= this._timeNotVisible) {
                        this._actor.visible = true;
                        this._elapsedTime = 0;
                    }
                    if (this.isComplete(this._actor)) {
                        this._actor.visible = true;
                    }
                };
                Blink.prototype.isComplete = function (actor) {
                    return this._stopped || (this._totalTime >= this._duration);
                };
                Blink.prototype.stop = function () {
                    this._actor.visible = true;
                    this._stopped = true;
                };
                Blink.prototype.reset = function () {
                    this._started = false;
                    this._elapsedTime = 0;
                    this._totalTime = 0;
                };
                return Blink;
            })();
            Actions.Blink = Blink;
            var Fade = (function () {
                function Fade(actor, endOpacity, speed) {
                    this._multiplyer = 1;
                    this._started = false;
                    this._stopped = false;
                    this._actor = actor;
                    this._endOpacity = endOpacity;
                    this._speed = speed;
                    if (endOpacity < actor.opacity) {
                        this._multiplyer = -1;
                    }
                }
                Fade.prototype.update = function (delta) {
                    if (!this._started) {
                        this._started = true;
                    }
                    if (this._speed > 0) {
                        this._actor.opacity += this._multiplyer * (Math.abs(this._actor.opacity - this._endOpacity) * delta) / this._speed;
                    }
                    this._speed -= delta;
                    ex.Logger.getInstance().debug('actor opacity: ' + this._actor.opacity);
                    if (this.isComplete(this._actor)) {
                        this._actor.opacity = this._endOpacity;
                    }
                };
                Fade.prototype.isComplete = function (actor) {
                    return this._stopped || (Math.abs(this._actor.opacity - this._endOpacity) < 0.05);
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
                    this._actor = actor;
                }
                Die.prototype.update = function (delta) {
                    this._actor.actionQueue.clearActions();
                    this._actor.kill();
                    this._stopped = true;
                };
                Die.prototype.isComplete = function () {
                    return this._stopped;
                };
                Die.prototype.stop = function () { return; };
                Die.prototype.reset = function () { return; };
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
                    this._stopped = false;
                    this._actor = actor;
                    this._actionQueue = new ActionQueue(actor);
                    this._repeat = repeat;
                    this._originalRepeat = repeat;
                    var i = 0, len = actions.length;
                    for (i; i < len; i++) {
                        actions[i].reset();
                        this._actionQueue.add(actions[i]);
                    }
                    ;
                }
                Repeat.prototype.update = function (delta) {
                    this.x = this._actor.x;
                    this.y = this._actor.y;
                    if (!this._actionQueue.hasNext()) {
                        this._actionQueue.reset();
                        this._repeat--;
                    }
                    this._actionQueue.update(delta);
                };
                Repeat.prototype.isComplete = function () {
                    return this._stopped || (this._repeat <= 0);
                };
                Repeat.prototype.stop = function () {
                    this._stopped = true;
                };
                Repeat.prototype.reset = function () {
                    this._repeat = this._originalRepeat;
                };
                return Repeat;
            })();
            Actions.Repeat = Repeat;
            var RepeatForever = (function () {
                function RepeatForever(actor, actions) {
                    this._stopped = false;
                    this._actor = actor;
                    this._actionQueue = new ActionQueue(actor);
                    var i = 0, len = actions.length;
                    for (i; i < len; i++) {
                        actions[i].reset();
                        this._actionQueue.add(actions[i]);
                    }
                    ;
                }
                RepeatForever.prototype.update = function (delta) {
                    this.x = this._actor.x;
                    this.y = this._actor.y;
                    if (this._stopped) {
                        return;
                    }
                    if (!this._actionQueue.hasNext()) {
                        this._actionQueue.reset();
                    }
                    this._actionQueue.update(delta);
                };
                RepeatForever.prototype.isComplete = function () {
                    return this._stopped;
                };
                RepeatForever.prototype.stop = function () {
                    this._stopped = true;
                    this._actionQueue.clearActions();
                };
                RepeatForever.prototype.reset = function () { return; };
                return RepeatForever;
            })();
            Actions.RepeatForever = RepeatForever;
            /**
             * Action Queues
             *
             * Action queues are part of the [[ActionContext|Action API]] and
             * store the list of actions to be executed for an [[Actor]].
             *
             * Actors implement [[Action.actionQueue]] which can be manipulated by
             * advanced users to adjust the actions currently being executed in the
             * queue.
             */
            var ActionQueue = (function () {
                function ActionQueue(actor) {
                    this._actions = [];
                    this._completedActions = [];
                    this._actor = actor;
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
                    if (this._currentAction) {
                        this._currentAction.stop();
                    }
                };
                ActionQueue.prototype.getActions = function () {
                    return this._actions.concat(this._completedActions);
                };
                ActionQueue.prototype.hasNext = function () {
                    return this._actions.length > 0;
                };
                ActionQueue.prototype.reset = function () {
                    this._actions = this.getActions();
                    var i = 0, len = this._actions.length;
                    for (i; i < len; i++) {
                        this._actions[i].reset();
                    }
                    this._completedActions = [];
                };
                ActionQueue.prototype.update = function (delta) {
                    if (this._actions.length > 0) {
                        this._currentAction = this._actions[0];
                        this._currentAction.update(delta);
                        if (this._currentAction.isComplete(this._actor)) {
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
/// <reference path="Action.ts"/>
var ex;
(function (ex) {
    /**
     * Action API
     *
     * The fluent Action API allows you to perform "actions" on
     * [[Actor|Actors]] such as following, moving, rotating, and
     * more. You can implement your own actions by implementing
     * the [[IAction]] interface.
     *
     * Actions can be chained together and can be set to repeat,
     * or can be interrupted to change.
     *
     * ## Chaining Actions
     *
     * You can chain actions to create a script because the action
     * methods return the context, allowing you to build a queue of
     * actions that get executed as part of an [[ActionQueue]].
     *
     * ```ts
     * class Enemy extends ex.Actor {
     *
     *   public patrol() {
     *
     *      // clear existing queue
     *      this.clearActions();
     *
     *      // guard a choke point
     *      // move to 100, 100 and take 1.2s
     *      // wait for 3s
     *      // move back to 0, 100 and take 1.2s
     *      // wait for 3s
     *      // repeat
     *      this.moveTo(100, 100, 1200)
     *        .delay(3000)
     *        .moveTo(0, 100, 1200)
     *        .delay(3000)
     *        .repeatForever();
     *   }
     * }
     * ```
     *
     * ## Example: Follow a Path
     *
     * You can use [[Actor.moveTo]] to move to a specific point,
     * allowing you to chain together actions to form a path.
     *
     * This example has a `Ship` follow a path that it guards by
     * spawning at the start point, moving to the end, then reversing
     * itself and repeating that forever.
     *
     * ```ts
     * public Ship extends ex.Actor {
     *
     *   public onInitialize() {
     *     var path = [
     *       new ex.Point(20, 20),
     *       new ex.Point(50, 40),
     *       new ex.Point(25, 30),
     *       new ex.Point(75, 80)
     *     ];
     *
     *     // spawn at start point
     *     this.x = path[0].x;
     *     this.y = path[0].y;
     *
     *     // create action queue
     *
     *     // forward path (skip first spawn point)
     *     for (var i = 1; i < path.length; i++) {
     *       this.moveTo(path[i].x, path[i].y, 300);
     *     }
     *
     *     // reverse path (skip last point)
     *     for (var j = path.length - 2; j >= 0; j--) {
     *       this.moveTo(path[j].x, path[j].y, 300);
     *     }
     *
     *     // repeat
     *     this.repeatForever();
     *   }
     * }
     * ```
     *
     * While this is a trivial example, the Action API allows complex
     * routines to be programmed for Actors. For example, using the
     * [Tiled Map Editor](http://mapeditor.org) you can create a map that
     * uses polylines to create paths, load in the JSON using a
     * [[Resource|Generic Resource]], create a [[TileMap]],
     * and spawn ships programmatically  while utilizing the polylines
     * to automatically generate the actions needed to do pathing.
     *
     * ## Custom Actions
     *
     * The API does allow you to implement new actions by implementing the [[IAction]]
     * interface, but this will be improved in future versions as right now it
     * is meant for the Excalibur team and can be advanced to implement.
     *
     * You can manually manipulate an Actor's [[ActionQueue]] using
     * [[Actor.actionQueue]]. For example, using [[ActionQueue.add]] for
     * custom actions.
     *
     * ## Future Plans
     *
     * The Excalibur team is working on extending and rebuilding the Action API
     * in future versions to support multiple timelines/scripts, better eventing,
     * and a more robust API to allow for complex and customized actions.
     *
     */
    var ActionContext = (function () {
        function ActionContext() {
            this._actors = [];
            this._queues = [];
            if (arguments !== null) {
                this._actors = Array.prototype.slice.call(arguments, 0);
                this._queues = this._actors.map(function (a) {
                    return a.actionQueue;
                });
            }
        }
        /**
         * Clears all queued actions from the Actor
         */
        ActionContext.prototype.clearActions = function () {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].clearActions();
            }
        };
        ActionContext.prototype.addActorToContext = function (actor) {
            this._actors.push(actor);
            // if we run into problems replace the line below with:
            this._queues.push(actor.actionQueue);
        };
        ActionContext.prototype.removeActorFromContext = function (actor) {
            var index = this._actors.indexOf(actor);
            if (index > -1) {
                this._actors.splice(index, 1);
                this._queues.splice(index, 1);
            }
        };
        /**
         * This method will move an actor to the specified `x` and `y` position over the
         * specified duration using a given [[EasingFunctions]] and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x         The x location to move the actor to
         * @param y         The y location to move the actor to
         * @param duration  The time it should take the actor to move to the new location in milliseconds
         * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position
         */
        ActionContext.prototype.easeTo = function (x, y, duration, easingFcn) {
            if (easingFcn === void 0) { easingFcn = ex.EasingFunctions.Linear; }
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.EaseTo(this._actors[i], x, y, duration, easingFcn));
            }
            return this;
        };
        /**
         * This method will move an actor to the specified x and y position at the
         * speed specified (in pixels per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x      The x location to move the actor to
         * @param y      The y location to move the actor to
         * @param speed  The speed in pixels per second to move
         */
        ActionContext.prototype.moveTo = function (x, y, speed) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.MoveTo(this._actors[i], x, y, speed));
            }
            return this;
        };
        /**
         * This method will move an actor to the specified x and y position by a
         * certain time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param x     The x location to move the actor to
         * @param y     The y location to move the actor to
         * @param time  The time it should take the actor to move to the new location in milliseconds
         */
        ActionContext.prototype.moveBy = function (x, y, time) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.MoveBy(this._actors[i], x, y, time));
            }
            return this;
        };
        /**
         * This method will rotate an actor to the specified angle at the speed
         * specified (in radians per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param speed         The angular velocity of the rotation specified in radians per second
         */
        ActionContext.prototype.rotateTo = function (angleRadians, speed) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.RotateTo(this._actors[i], angleRadians, speed));
            }
            return this;
        };
        /**
         * This method will rotate an actor to the specified angle by a certain
         * time (in milliseconds) and return back the actor. This method is part
         * of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param time          The time it should take the actor to complete the rotation in milliseconds
         */
        ActionContext.prototype.rotateBy = function (angleRadians, time) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.RotateBy(this._actors[i], angleRadians, time));
            }
            return this;
        };
        /**
         * This method will scale an actor to the specified size at the speed
         * specified (in magnitude increase per second) and return back the
         * actor. This method is part of the actor 'Action' fluent API allowing
         * action chaining.
         * @param size   The scaling factor to apply
         * @param speed  The speed of scaling specified in magnitude increase per second
         */
        ActionContext.prototype.scaleTo = function (sizeX, sizeY, speedX, speedY) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.ScaleTo(this._actors[i], sizeX, sizeY, speedX, speedY));
            }
            return this;
        };
        /**
         * This method will scale an actor to the specified size by a certain time
         * (in milliseconds) and return back the actor. This method is part of the
         * actor 'Action' fluent API allowing action chaining.
         * @param size   The scaling factor to apply
         * @param time   The time it should take to complete the scaling in milliseconds
         */
        ActionContext.prototype.scaleBy = function (sizeX, sizeY, time) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.ScaleBy(this._actors[i], sizeX, sizeY, time));
            }
            return this;
        };
        /**
         * This method will cause an actor to blink (become visible and not
         * visible). Optionally, you may specify the number of blinks. Specify the amount of time
         * the actor should be visible per blink, and the amount of time not visible.
         * This method is part of the actor 'Action' fluent API allowing action chaining.
         * @param timeVisible     The amount of time to stay visible per blink in milliseconds
         * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
         * @param numBlinks       The number of times to blink
         */
        ActionContext.prototype.blink = function (timeVisible, timeNotVisible, numBlinks) {
            if (numBlinks === void 0) { numBlinks = 1; }
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Blink(this._actors[i], timeVisible, timeNotVisible, numBlinks));
            }
            return this;
        };
        /**
         * This method will cause an actor's opacity to change from its current value
         * to the provided value by a specified time (in milliseconds). This method is
         * part of the actor 'Action' fluent API allowing action chaining.
         * @param opacity  The ending opacity
         * @param time     The time it should take to fade the actor (in milliseconds)
         */
        ActionContext.prototype.fade = function (opacity, time) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Fade(this._actors[i], opacity, time));
            }
            return this;
        };
        /**
         * This method will delay the next action from executing for a certain
         * amount of time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param time  The amount of time to delay the next action in the queue from executing in milliseconds
         */
        ActionContext.prototype.delay = function (time) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Delay(this._actors[i], time));
            }
            return this;
        };
        /**
         * This method will add an action to the queue that will remove the actor from the
         * scene once it has completed its previous actions. Any actions on the
         * action queue after this action will not be executed.
         */
        ActionContext.prototype.die = function () {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Die(this._actors[i]));
            }
            return this;
        };
        /**
         * This method allows you to call an arbitrary method as the next action in the
         * action queue. This is useful if you want to execute code in after a specific
         * action, i.e An actor arrives at a destinatino after traversing a path
         */
        ActionContext.prototype.callMethod = function (method) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.CallMethod(this._actors[i], method));
            }
            return this;
        };
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions a certain number of times. If the number of repeats
         * is not specified it will repeat forever. This method is part of
         * the actor 'Action' fluent API allowing action chaining
         * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions
         * will repeat forever
         */
        ActionContext.prototype.repeat = function (times) {
            if (!times) {
                this.repeatForever();
                return this;
            }
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.Repeat(this._actors[i], times, this._actors[i].actionQueue.getActions()));
            }
            return this;
        };
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions forever. This method is part of the actor 'Action'
         * fluent API allowing action chaining.
         */
        ActionContext.prototype.repeatForever = function () {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                this._queues[i].add(new ex.Internal.Actions.RepeatForever(this._actors[i], this._actors[i].actionQueue.getActions()));
            }
            return this;
        };
        /**
         * This method will cause the actor to follow another at a specified distance
         * @param actor           The actor to follow
         * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
         */
        ActionContext.prototype.follow = function (actor, followDistance) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                if (followDistance === undefined) {
                    this._queues[i].add(new ex.Internal.Actions.Follow(this._actors[i], actor));
                }
                else {
                    this._queues[i].add(new ex.Internal.Actions.Follow(this._actors[i], actor, followDistance));
                }
            }
            return this;
        };
        /**
         * This method will cause the actor to move towards another until they
         * collide "meet" at a specified speed.
         * @param actor  The actor to meet
         * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
         */
        ActionContext.prototype.meet = function (actor, speed) {
            var i = 0, len = this._queues.length;
            for (i; i < len; i++) {
                if (speed === undefined) {
                    this._queues[i].add(new ex.Internal.Actions.Meet(this._actors[i], actor));
                }
                else {
                    this._queues[i].add(new ex.Internal.Actions.Meet(this._actors[i], actor, speed));
                }
            }
            return this;
        };
        /**
         * Returns a promise that resolves when the current action queue up to now
         * is finished.
         */
        ActionContext.prototype.asPromise = function () {
            var _this = this;
            var promises = this._queues.map(function (q, i) {
                var temp = new ex.Promise();
                q.add(new ex.Internal.Actions.CallMethod(_this._actors[i], function () {
                    temp.resolve();
                }));
                return temp;
            });
            return ex.Promise.join.apply(this, promises);
        };
        return ActionContext;
    })();
    ex.ActionContext = ActionContext;
})(ex || (ex = {}));
/// <reference path="Actions/IActionable.ts"/>
/// <reference path="Actions/ActionContext.ts"/>
/// <reference path="Collision/BoundingBox.ts"/>
var ex;
(function (ex) {
    /**
     * Grouping
     *
     * Groups are used for logically grouping Actors so they can be acted upon
     * in bulk.
     *
     * ## Using Groups
     *
     * Groups can be used to detect collisions across a large nubmer of actors. For example
     * perhaps a large group of "enemy" actors.
     *
     * ```typescript
     * var enemyShips = engine.currentScene.createGroup("enemy");
     * var enemies = [...]; // Large array of enemies;
     * enemyShips.add(enemies);
     *
     * var player = new Actor();
     * engine.currentScene.add(player);
     *
     * enemyShips.on('collision', function(ev: CollisionEvent){
     *   if (e.other === player) {
     *       //console.log("collision with player!");
     *   }
     * });
     *
     * ```
     */
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(name, scene) {
            _super.call(this);
            this.name = name;
            this.scene = scene;
            this._logger = ex.Logger.getInstance();
            this._members = [];
            this.actions = new ex.ActionContext();
            if (scene == null) {
                this._logger.error('Invalid constructor arguments passed to Group: ', name, ', scene must not be null!');
            }
            else {
                var existingGroup = scene.groups[name];
                if (existingGroup) {
                    this._logger.warn('Group with name', name, 'already exists. This new group will replace it.');
                }
                scene.groups[name] = this;
            }
        }
        Group.prototype.add = function (actorOrActors) {
            if (actorOrActors instanceof ex.Actor) {
                actorOrActors = [].concat(actorOrActors);
            }
            var i = 0, len = actorOrActors.length, groupIdx;
            for (i; i < len; i++) {
                groupIdx = this.getMembers().indexOf(actorOrActors[i]);
                if (groupIdx === -1) {
                    this._members.push(actorOrActors[i]);
                    this.scene.add(actorOrActors[i]);
                    this.actions.addActorToContext(actorOrActors[i]);
                    this.eventDispatcher.wire(actorOrActors[i].eventDispatcher);
                }
            }
        };
        Group.prototype.remove = function (actor) {
            var index = this._members.indexOf(actor);
            if (index > -1) {
                this._members.splice(index, 1);
                this.actions.removeActorFromContext(actor);
                this.eventDispatcher.unwire(actor.eventDispatcher);
            }
        };
        Group.prototype.move = function (args) {
            var i = 0, members = this.getMembers(), len = members.length;
            if (arguments.length === 1 && args instanceof ex.Vector) {
                for (i; i < len; i++) {
                    members[i].x += args.x;
                    members[i].y += args.y;
                }
            }
            else if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
                var x = arguments[0];
                var y = arguments[1];
                for (i; i < len; i++) {
                    members[i].x += x;
                    members[i].y += y;
                }
            }
            else {
                this._logger.error('Invalid arguments passed to group move', this.name, 'args:', arguments);
            }
        };
        Group.prototype.rotate = function (angle) {
            if (typeof arguments[0] === 'number') {
                var r = arguments[0], i = 0, members = this.getMembers(), len = members.length;
                for (i; i < len; i++) {
                    members[i].rotation += r;
                }
            }
            else {
                this._logger.error('Invalid arguments passed to group rotate', this.name, 'args:', arguments);
            }
        };
        Group.prototype.on = function (eventName, handler) {
            this.eventDispatcher.subscribe(eventName, handler);
        };
        Group.prototype.off = function (eventName, handler) {
            this.eventDispatcher.unsubscribe(eventName, handler);
        };
        Group.prototype.emit = function (topic, event) {
            this.eventDispatcher.emit(topic, event);
        };
        Group.prototype.contains = function (actor) {
            return this.getMembers().indexOf(actor) > -1;
        };
        Group.prototype.getMembers = function () {
            return this._members;
        };
        Group.prototype.getRandomMember = function () {
            return this._members[Math.floor(Math.random() * this._members.length)];
        };
        Group.prototype.getBounds = function () {
            return this.getMembers().map(function (a) { return a.getBounds(); }).reduce(function (prev, curr) {
                return prev.combine(curr);
            });
        };
        return Group;
    })(ex.Class);
    ex.Group = Group;
})(ex || (ex = {}));
var ex;
(function (ex) {
    // NOTE: this implementation is not self-balancing
    var SortedList = (function () {
        function SortedList(getComparable) {
            this._getComparable = getComparable;
        }
        SortedList.prototype.find = function (element) {
            return this._find(this._root, element);
        };
        SortedList.prototype._find = function (node, element) {
            if (node == null) {
                return false;
            }
            else if (this._getComparable.call(element) === node.getKey()) {
                if (node.getData().indexOf(element) > -1) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else if (this._getComparable.call(element) < node.getKey()) {
                return this._find(node.getLeft(), element);
            }
            else {
                return this._find(node.getRight(), element);
            }
        };
        // returns the array of elements at a specific key value
        SortedList.prototype.get = function (key) {
            return this._get(this._root, key);
        };
        SortedList.prototype._get = function (node, key) {
            if (node == null) {
                return [];
            }
            else if (key === node.getKey()) {
                return node.getData();
            }
            else if (key < node.getKey()) {
                return this._get(node.getLeft(), key);
            }
            else {
                return this._get(node.getRight(), key);
            }
        };
        SortedList.prototype.add = function (element) {
            if (this._root == null) {
                this._root = new BinaryTreeNode(this._getComparable.call(element), [element], null, null);
                return true;
            }
            else {
                return this._insert(this._root, element);
            }
            return false;
        };
        SortedList.prototype._insert = function (node, element) {
            if (node != null) {
                if (this._getComparable.call(element) === node.getKey()) {
                    if (node.getData().indexOf(element) > -1) {
                        return false; // the element we're trying to insert already exists
                    }
                    else {
                        node.getData().push(element);
                        return true;
                    }
                }
                else if (this._getComparable.call(element) < node.getKey()) {
                    if (node.getLeft() == null) {
                        node.setLeft(new BinaryTreeNode(this._getComparable.call(element), [element], null, null));
                        return true;
                    }
                    else {
                        return this._insert(node.getLeft(), element);
                    }
                }
                else {
                    if (node.getRight() == null) {
                        node.setRight(new BinaryTreeNode(this._getComparable.call(element), [element], null, null));
                        return true;
                    }
                    else {
                        return this._insert(node.getRight(), element);
                    }
                }
            }
            return false;
        };
        SortedList.prototype.removeByComparable = function (element) {
            this._root = this._remove(this._root, element);
        };
        SortedList.prototype._remove = function (node, element) {
            if (node == null) {
                return null;
            }
            else if (this._getComparable.call(element) === node.getKey()) {
                var elementIndex = node.getData().indexOf(element);
                // if the node contains the element, remove the element
                if (elementIndex > -1) {
                    node.getData().splice(elementIndex, 1);
                    // if we have removed the last element at this node, remove the node
                    if (node.getData().length === 0) {
                        // if the node is a leaf
                        if (node.getLeft() == null && node.getRight() == null) {
                            return null;
                        }
                        else if (node.getLeft() == null) {
                            return node.getRight();
                        }
                        else if (node.getRight() == null) {
                            return node.getLeft();
                        }
                        // if node has 2 children
                        var temp = this._findMinNode(node.getRight());
                        node.setKey(temp.getKey());
                        node.setData(temp.getData());
                        node.setRight(this._cleanup(node.getRight(), temp)); //"cleanup nodes" (move them up recursively)
                        return node;
                    }
                    else {
                        // this prevents the node from being removed since it still contains elements
                        return node;
                    }
                }
            }
            else if (this._getComparable.call(element) < node.getKey()) {
                node.setLeft(this._remove(node.getLeft(), element));
                return node;
            }
            else {
                node.setRight(this._remove(node.getRight(), element));
                return node;
            }
        };
        // called once we have successfully removed the element we wanted, recursively corrects the part of the tree below the removed node
        SortedList.prototype._cleanup = function (node, element) {
            var comparable = element.getKey();
            if (node == null) {
                return null;
            }
            else if (comparable === node.getKey()) {
                // if the node is a leaf
                if (node.getLeft() == null && node.getRight() == null) {
                    return null;
                }
                else if (node.getLeft() == null) {
                    return node.getRight();
                }
                else if (node.getRight() == null) {
                    return node.getLeft();
                }
                // if node has 2 children
                var temp = this._findMinNode(node.getRight());
                node.setKey(temp.getKey());
                node.setData(temp.getData());
                node.setRight(this._cleanup(node.getRight(), temp));
                return node;
            }
            else if (this._getComparable.call(element) < node.getKey()) {
                node.setLeft(this._cleanup(node.getLeft(), element));
                return node;
            }
            else {
                node.setRight(this._cleanup(node.getRight(), element));
                return node;
            }
        };
        SortedList.prototype._findMinNode = function (node) {
            var current = node;
            while (current.getLeft() != null) {
                current = current.getLeft();
            }
            return current;
        };
        SortedList.prototype.list = function () {
            var results = new Array();
            this._list(this._root, results);
            return results;
        };
        SortedList.prototype._list = function (treeNode, results) {
            if (treeNode != null) {
                this._list(treeNode.getLeft(), results);
                treeNode.getData().forEach(function (element) {
                    results.push(element);
                });
                this._list(treeNode.getRight(), results);
            }
        };
        return SortedList;
    })();
    ex.SortedList = SortedList;
    var BinaryTreeNode = (function () {
        function BinaryTreeNode(key, data, left, right) {
            this._key = key;
            this._data = data;
            this._left = left;
            this._right = right;
        }
        BinaryTreeNode.prototype.getKey = function () {
            return this._key;
        };
        BinaryTreeNode.prototype.setKey = function (key) {
            this._key = key;
        };
        BinaryTreeNode.prototype.getData = function () {
            return this._data;
        };
        BinaryTreeNode.prototype.setData = function (data) {
            this._data = data;
        };
        BinaryTreeNode.prototype.getLeft = function () {
            return this._left;
        };
        BinaryTreeNode.prototype.setLeft = function (left) {
            this._left = left;
        };
        BinaryTreeNode.prototype.getRight = function () {
            return this._right;
        };
        BinaryTreeNode.prototype.setRight = function (right) {
            this._right = right;
        };
        return BinaryTreeNode;
    })();
    ex.BinaryTreeNode = BinaryTreeNode;
    var MockedElement = (function () {
        function MockedElement(key) {
            this._key = 0;
            this._key = key;
        }
        MockedElement.prototype.getTheKey = function () {
            return this._key;
        };
        MockedElement.prototype.setKey = function (key) {
            this._key = key;
        };
        return MockedElement;
    })();
    ex.MockedElement = MockedElement;
})(ex || (ex = {}));
/// <reference path="Class.ts" />
/// <reference path="Timer.ts" />
/// <reference path="Collision/NaiveCollisionResolver.ts"/>
/// <reference path="Collision/DynamicTreeCollisionResolver.ts"/>
/// <reference path="Collision/CollisionPair.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Group.ts"/>
/// <reference path="Util/SortedList.ts"/>
var ex;
(function (ex) {
    /**
     * Scenes
     *
     * [[Actor|Actors]] are composed together into groupings called Scenes in
     * Excalibur. The metaphor models the same idea behind real world
     * actors in a scene. Only actors in scenes will be updated and drawn.
     *
     * Typical usages of a scene include: levels, menus, loading screens, etc.
     *
     * ## Adding actors to the scene
     *
     * For an [[Actor]] to be drawn and updated, it needs to be part of the "scene graph".
     * The [[Engine]] provides several easy ways to quickly add/remove actors from the
     * current scene.
     *
     * ```js
     * var game   = new ex.Engine(...);
     *
     * var player = new ex.Actor();
     * var enemy  = new ex.Actor();
     *
     * // add them to the "root" scene
     *
     * game.add(player);
     * game.add(enemy);
     *
     * // start game
     * game.start();
     * ```
     *
     * You can also add actors to a [[Scene]] instance specifically.
     *
     * ```js
     * var game   = new ex.Engine();
     * var level1 = new ex.Scene();
     *
     * var player = new ex.Actor();
     * var enemy  = new ex.Actor();
     *
     * // add actors to level1
     * level1.add(player);
     * level1.add(enemy);
     *
     * // add level1 to the game
     * game.add("level1", level1);
     *
     * // start the game
     * game.start();
     *
     * // after player clicks start game, for example
     * game.goToScene("level1");
     *
     * ```
     *
     * ## Scene Lifecycle
     *
     * A [[Scene|scene]] has a basic lifecycle that dictacts how it is initialized, updated, and drawn. Once a [[Scene|scene]] is added to
     * the [[Engine|engine]] it will follow this lifecycle.
     *
     * ![Scene Lifecycle](/assets/images/docs/SceneLifeCycle.png)
     *
     * ## Extending scenes
     *
     * For more complex games, you might want more control over a scene in which
     * case you can extend [[Scene]]. This is useful for menus, custom loaders,
     * and levels.
     *
     * Just use [[Engine.add]] to add a new scene to the game. You can then use
     * [[Engine.goToScene]] to switch scenes which calls [[Scene.onActivate]] for the
     * new scene and [[Scene.onDeactivate]] for the old scene. Use [[Scene.onInitialize]]
     * to perform any start-up logic, which is called once.
     *
     * **TypeScript**
     *
     * ```ts
     * class MainMenu extends ex.Scene {
     *
     *   // start-up logic, called once
     *   public onInitialize(engine: ex.Engine) { }
     *
     *   // each time the scene is entered (Engine.goToScene)
     *   public onActivate() { }
     *
     *   // each time the scene is exited (Engine.goToScene)
     *   public onDeactivate() { }
     * }
     *
     * // add to game and activate it
     * game.add("mainmenu", new MainMenu());
     * game.goToScene("mainmenu");
     * ```
     *
     * **Javascript**
     *
     * ```js
     * var MainMenu = ex.Scene.extend({
     *   // start-up logic, called once
     *   onInitialize: function (engine) { },
     *
     *   // each time the scene is activated by Engine.goToScene
     *   onActivate: function () { },
     *
     *   // each time the scene is deactivated by Engine.goToScene
     *   onDeactivate: function () { }
     * });
     *
     * game.add("mainmenu", new MainMenu());
     * game.goToScene("mainmenu");
     * ```
     *
     * ## Scene camera
     *
     * By default, a [[Scene]] is initialized with a [[BaseCamera]] which
     * does not move and centers the game world.
     *
     * Learn more about [[BaseCamera|Cameras]] and how to modify them to suit
     * your game.
     */
    var Scene = (function (_super) {
        __extends(Scene, _super);
        function Scene(engine) {
            _super.call(this);
            /**
             * The actors in the current scene
             */
            this.children = [];
            /**
             * The [[TileMap]]s in the scene, if any
             */
            this.tileMaps = [];
            /**
             * The [[Group]]s in the scene, if any
             */
            this.groups = {};
            /**
             * The [[UIActor]]s in a scene, if any; these are drawn last
             */
            this.uiActors = [];
            /**
             * Whether or the [[Scene]] has been initialized
             */
            this.isInitialized = false;
            this._sortedDrawingTree = new ex.SortedList(ex.Actor.prototype.getZIndex);
            this._collisionResolver = new ex.DynamicTreeCollisionResolver();
            this._killQueue = [];
            this._timers = [];
            this._cancelQueue = [];
            this._logger = ex.Logger.getInstance();
            this.camera = new ex.BaseCamera();
            if (engine) {
                this.camera.setFocus(engine.width / 2, engine.height / 2);
            }
        }
        /**
         * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        Scene.prototype.onInitialize = function (engine) {
            // will be overridden
            if (this.camera) {
                this.camera.setFocus(engine.width / 2, engine.height / 2);
            }
            this._logger.debug('Scene.onInitialize', this, engine);
        };
        /**
         * This is called when the scene is made active and started. It is meant to be overriden,
         * this is where you should setup any DOM UI or event handlers needed for the scene.
         */
        Scene.prototype.onActivate = function () {
            // will be overridden
            this._logger.debug('Scene.onActivate', this);
        };
        /**
         * This is called when the scene is made transitioned away from and stopped. It is meant to be overriden,
         * this is where you should cleanup any DOM UI or event handlers needed for the scene.
         */
        Scene.prototype.onDeactivate = function () {
            // will be overridden
            this._logger.debug('Scene.onDeactivate', this);
        };
        /**
         * Updates all the actors and timers in the scene. Called by the [[Engine]].
         * @param engine  Reference to the current Engine
         * @param delta   The number of milliseconds since the last update
         */
        Scene.prototype.update = function (engine, delta) {
            this.emit('preupdate', new ex.PreUpdateEvent(engine, delta, this));
            var i, len;
            // Cycle through actors updating UI actors
            for (i = 0, len = this.uiActors.length; i < len; i++) {
                this.uiActors[i].update(engine, delta);
            }
            // Cycle through actors updating tile maps
            for (i = 0, len = this.tileMaps.length; i < len; i++) {
                this.tileMaps[i].update(engine, delta);
            }
            // Cycle through actors updating actors
            for (i = 0, len = this.children.length; i < len; i++) {
                this.children[i].update(engine, delta);
            }
            // Run collision resolution strategy
            if (this._collisionResolver) {
                this._collisionResolver.update(this.children);
                this._collisionResolver.evaluate(this.children);
            }
            // Remove actors from scene graph after being killed
            var actorIndex;
            for (i = 0, len = this._killQueue.length; i < len; i++) {
                actorIndex = this.children.indexOf(this._killQueue[i]);
                if (actorIndex > -1) {
                    this._sortedDrawingTree.removeByComparable(this._killQueue[i]);
                    this.children.splice(actorIndex, 1);
                }
            }
            this._killQueue.length = 0;
            // Remove timers in the cancel queue before updating them
            for (i = 0, len = this._cancelQueue.length; i < len; i++) {
                this.removeTimer(this._cancelQueue[i]);
            }
            this._cancelQueue.length = 0;
            // Cycle through timers updating timers
            this._timers = this._timers.filter(function (timer) {
                timer.update(delta);
                return !timer.complete;
            });
            this.emit('postupdate', new ex.PostUpdateEvent(engine, delta, this));
        };
        /**
         * Draws all the actors in the Scene. Called by the [[Engine]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        Scene.prototype.draw = function (ctx, delta) {
            this.emit('predraw', new ex.PreDrawEvent(ctx, delta, this));
            ctx.save();
            if (this.camera) {
                this.camera.update(ctx, delta);
            }
            var i, len;
            for (i = 0, len = this.tileMaps.length; i < len; i++) {
                this.tileMaps[i].draw(ctx, delta);
            }
            var sortedChildren = this._sortedDrawingTree.list();
            for (i = 0, len = sortedChildren.length; i < len; i++) {
                // only draw actors that are visible and on screen
                if (sortedChildren[i].visible && !sortedChildren[i].isOffScreen) {
                    sortedChildren[i].draw(ctx, delta);
                }
            }
            if (this.engine && this.engine.isDebug) {
                ctx.strokeStyle = 'yellow';
                this.debugDraw(ctx);
            }
            ctx.restore();
            for (i = 0, len = this.uiActors.length; i < len; i++) {
                // only draw ui actors that are visible and on screen
                if (this.uiActors[i].visible) {
                    this.uiActors[i].draw(ctx, delta);
                }
            }
            if (this.engine && this.engine.isDebug) {
                for (i = 0, len = this.uiActors.length; i < len; i++) {
                    this.uiActors[i].debugDraw(ctx);
                }
            }
            this.emit('postdraw', new ex.PreDrawEvent(ctx, delta, this));
        };
        /**
         * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
         * @param ctx  The current rendering context
         */
        Scene.prototype.debugDraw = function (ctx) {
            this.emit('predebugdraw', new ex.PreDebugDrawEvent(ctx, this));
            var i, len;
            for (i = 0, len = this.tileMaps.length; i < len; i++) {
                this.tileMaps[i].debugDraw(ctx);
            }
            for (i = 0, len = this.children.length; i < len; i++) {
                this.children[i].debugDraw(ctx);
            }
            // todo possibly enable this with excalibur flags features?
            //this._collisionResolver.debugDraw(ctx, 20);
            this.camera.debugDraw(ctx);
            this.emit('postdebugdraw', new ex.PostDebugDrawEvent(ctx, this));
        };
        /**
         * Checks whether an actor is contained in this scene or not
         */
        Scene.prototype.contains = function (actor) {
            return this.children.indexOf(actor) > -1;
        };
        Scene.prototype.add = function (entity) {
            if (entity instanceof ex.UIActor) {
                if (!ex.Util.contains(this.uiActors, entity)) {
                    this.addUIActor(entity);
                }
                return;
            }
            if (entity instanceof ex.Actor) {
                if (!ex.Util.contains(this.children, entity)) {
                    this.addChild(entity);
                    this._sortedDrawingTree.add(entity);
                }
                return;
            }
            if (entity instanceof ex.Timer) {
                if (!ex.Util.contains(this._timers, entity)) {
                    this.addTimer(entity);
                }
                return;
            }
            if (entity instanceof ex.TileMap) {
                if (!ex.Util.contains(this.tileMaps, entity)) {
                    this.addTileMap(entity);
                }
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
         * Adds (any) actor to act as a piece of UI, meaning it is always positioned
         * in screen coordinates. UI actors do not participate in collisions.
         * @todo Should this be `UIActor` only?
         */
        Scene.prototype.addUIActor = function (actor) {
            this.uiActors.push(actor);
            actor.scene = this;
        };
        /**
         * Removes an actor as a piece of UI
         */
        Scene.prototype.removeUIActor = function (actor) {
            var index = this.uiActors.indexOf(actor);
            if (index > -1) {
                this.uiActors.splice(index, 1);
            }
        };
        /**
         * Adds an actor to the scene, once this is done the actor will be drawn and updated.
         *
         * @obsolete Use [[add]] instead.
         */
        Scene.prototype.addChild = function (actor) {
            this._collisionResolver.register(actor);
            actor.scene = this;
            this.children.push(actor);
            this._sortedDrawingTree.add(actor);
            actor.parent = this.actor;
        };
        /**
         * Adds a [[TileMap]] to the scene, once this is done the TileMap will be drawn and updated.
         */
        Scene.prototype.addTileMap = function (tileMap) {
            this.tileMaps.push(tileMap);
        };
        /**
         * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
         */
        Scene.prototype.removeTileMap = function (tileMap) {
            var index = this.tileMaps.indexOf(tileMap);
            if (index > -1) {
                this.tileMaps.splice(index, 1);
            }
        };
        /**
         * Removes an actor from the scene, it will no longer be drawn or updated.
         */
        Scene.prototype.removeChild = function (actor) {
            this._collisionResolver.remove(actor);
            this._killQueue.push(actor);
            actor.parent = null;
        };
        /**
         * Adds a [[Timer]] to the scene
         * @param timer  The timer to add
         */
        Scene.prototype.addTimer = function (timer) {
            this._timers.push(timer);
            timer.scene = this;
            return timer;
        };
        /**
         * Removes a [[Timer]] from the scene.
         * @warning Can be dangerous, use [[cancelTimer]] instead
         * @param timer  The timer to remove
         */
        Scene.prototype.removeTimer = function (timer) {
            var i = this._timers.indexOf(timer);
            if (i !== -1) {
                this._timers.splice(i, 1);
            }
            return timer;
        };
        /**
         * Cancels a [[Timer]], removing it from the scene nicely
         * @param timer  The timer to cancel
         */
        Scene.prototype.cancelTimer = function (timer) {
            this._cancelQueue.push(timer);
            return timer;
        };
        /**
         * Tests whether a [[Timer]] is active in the scene
         */
        Scene.prototype.isTimerActive = function (timer) {
            return (this._timers.indexOf(timer) > -1);
        };
        /**
         * Creates and adds a [[Group]] to the scene with a name
         */
        Scene.prototype.createGroup = function (name) {
            return new ex.Group(name, this);
        };
        /**
         * Returns a [[Group]] by name
         */
        Scene.prototype.getGroup = function (name) {
            return this.groups[name];
        };
        Scene.prototype.removeGroup = function (group) {
            if (typeof group === 'string') {
                delete this.groups[group];
            }
            else if (group instanceof ex.Group) {
                delete this.groups[group.name];
            }
            else {
                this._logger.error('Invalid arguments to removeGroup', group);
            }
        };
        /**
         * Removes the given actor from the sorted drawing tree
         */
        Scene.prototype.cleanupDrawTree = function (actor) {
            this._sortedDrawingTree.removeByComparable(actor);
        };
        /**
         * Updates the given actor's position in the sorted drawing tree
         */
        Scene.prototype.updateDrawTree = function (actor) {
            this._sortedDrawingTree.add(actor);
        };
        return Scene;
    })(ex.Class);
    ex.Scene = Scene;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Standard easing functions for motion in Excalibur, defined on a domain of [0, duration] and a range from [+startValue,+endValue]
     * Given a time, the function will return a value from postive startValue to postive endValue.
     *
     * ```js
     * function Linear (t) {
     *    return t * t;
     * }
     *
     * // accelerating from zero velocity
     * function EaseInQuad (t) {
     *    return t * t;
     * }
     *
     * // decelerating to zero velocity
     * function EaseOutQuad (t) {
     *    return t * (2 - t);
     * }
     *
     * // acceleration until halfway, then deceleration
     * function EaseInOutQuad (t) {
     *    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
     * }
     *
     * // accelerating from zero velocity
     * function EaseInCubic (t) {
     *    return t * t * t;
     * }
     *
     * // decelerating to zero velocity
     * function EaseOutCubic (t) {
     *    return (--t) * t * t + 1;
     * }
     *
     * // acceleration until halfway, then deceleration
     * function EaseInOutCubic (t) {
     *    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
     * }
     * ```
     */
    var EasingFunctions = (function () {
        function EasingFunctions() {
        }
        EasingFunctions.Linear = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            return endValue * currentTime / duration + startValue;
        };
        EasingFunctions.EaseInQuad = function (currentTime, startValue, endValue, duration) {
            //endValue = (endValue - startValue);
            currentTime /= duration;
        };
        EasingFunctions.EaseOutQuad = function (currentTime, startValue, endValue, duration) {
            //endValue = (endValue - startValue);
            currentTime /= duration;
            return -endValue * currentTime * (currentTime - 2) + startValue;
        };
        EasingFunctions.EaseInOutQuad = function (currentTime, startValue, endValue, duration) {
            endValue = (endValue - startValue);
            currentTime /= duration / 2;
            if (currentTime < 1) {
                return endValue / 2 * currentTime * currentTime + startValue;
            }
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
            if (currentTime < 1) {
                return endValue / 2 * currentTime * currentTime * currentTime + startValue;
            }
            currentTime -= 2;
            return endValue / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
        };
        return EasingFunctions;
    })();
    ex.EasingFunctions = EasingFunctions;
})(ex || (ex = {}));
/// <reference path="Interfaces/IDrawable.ts" />
/// <reference path="Traits/Movement.ts" />
/// <reference path="Traits/OffscreenCulling.ts" />
/// <reference path="Traits/CapturePointer.ts" />
/// <reference path="Traits/CollisionDetection.ts" />
/// <reference path="Collision/Side.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="Collision/BoundingBox.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Actions/IActionable.ts"/>
/// <reference path="Actions/Action.ts" />
/// <reference path="Actions/ActionContext.ts"/>
/// <reference path="Util/EasingFunctions.ts"/>
var ex;
(function (ex) {
    /**
     * Actors
     *
     * The most important primitive in Excalibur is an `Actor`. Anything that
     * can move on the screen, collide with another `Actor`, respond to events,
     * or interact with the current scene, must be an actor. An `Actor` **must**
     * be part of a [[Scene]] for it to be drawn to the screen.
     *
     * ## Basic actors
     *
     * For quick and dirty games, you can just create an instance of an `Actor`
     * and manipulate it directly.
     *
     * Actors (and other entities) must be added to a [[Scene]] to be drawn
     * and updated on-screen.
     *
     * ```ts
     * var player = new ex.Actor();
     *
     * // move the player
     * player.dx = 5;
     *
     * // add player to the current scene
     * game.add(player);
     *
     * ```
     * `game.add` is a convenience method for adding an `Actor` to the current scene. The equivalent verbose call is `game.currentScene.add`.
     *
     * ## Actor Lifecycle
     *
     * An [[Actor|actor]] has a basic lifecycle that dictacts how it is initialized, updated, and drawn. Once an actor is part of a
     * [[Scene|scene]], it will follow this lifecycle.
     *
     * ![Actor Lifecycle](/assets/images/docs/ActorLifeCycle.png)
     *
     * ## Extending actors
     *
     * For "real-world" games, you'll want to `extend` the `Actor` class.
     * This gives you much greater control and encapsulates logic for that
     * actor.
     *
     * You can override the [[onInitialize]] method to perform any startup logic
     * for an actor (such as configuring state). [[onInitialize]] gets called
     * **once** before the first frame an actor is drawn/updated. It is passed
     * an instance of [[Engine]] to access global state or perform coordinate math.
     *
     * **TypeScript**
     *
     * ```ts
     * class Player extends ex.Actor {
     *
     *   public level = 1;
     *   public endurance = 0;
     *   public fortitude = 0;
     *
     *   constructor() {
     *     super();
     *   }
     *
     *   public onInitialize(engine: ex.Engine) {
     *     this.endurance = 20;
     *     this.fortitude = 16;
     *   }
     *
     *   public getMaxHealth() {
     *     return (0.4 * this.endurance) + (0.9 * this.fortitude) + (this.level * 1.2);
     *   }
     * }
     * ```
     *
     * **Javascript**
     *
     * In Javascript you can use the [[extend]] method to override or add
     * methods to an `Actor`.
     *
     * ```js
     * var Player = ex.Actor.extend({
     *
     *   level: 1,
     *   endurance: 0,
     *   fortitude: 0,
     *
     *   onInitialize: function (engine) {
     *     this.endurance = 20;
     *     this.fortitude = 16;
     *   },
     *
     *   getMaxHealth: function () {
     *     return (0.4 * this.endurance) + (0.9 * this.fortitude) + (this.level * 1.2);
     *   }
     * });
     * ```
     *
     * ## Updating actors
     *
     * Override the [[update]] method to update the state of your actor each frame.
     * Typically things that need to be updated include state, drawing, or position.
     *
     * Remember to call `super.update` to ensure the base update logic is performed.
     * You can then write your own logic for what happens after that.
     *
     * The [[update]] method is passed an instance of the Excalibur engine, which
     * can be used to perform coordinate math or access global state. It is also
     * passed `delta` which is the time in milliseconds since the last frame, which can be used
     * to perform time-based movement or time-based math (such as a timer).
     *
     * **TypeScript**
     *
     * ```ts
     * class Player extends Actor {
     *   public update(engine: ex.Engine, delta: number) {
     *     super.update(engine, delta); // call base update logic
     *
     *     // check if player died
     *     if (this.health <= 0) {
     *       this.emit("death");
     *       this.onDeath();
     *       return;
     *     }
     *   }
     * }
     * ```
     *
     * **Javascript**
     *
     * ```js
     * var Player = ex.Actor.extend({
     *   update: function (engine, delta) {
     *     ex.Actor.prototype.update.call(this, engine, delta); // call base update logic
     *
     *     // check if player died
     *     if (this.health <= 0) {
     *       this.emit("death");
     *       this.onDeath();
     *       return;
     *     }
     *   }
     * });
     * ```
     *
     * ## Drawing actors
     *
     * Override the [[draw]] method to perform any custom drawing. For simple games,
     * you don't need to override `draw`, instead you can use [[addDrawing]] and [[setDrawing]]
     * to manipulate the [[Sprite|sprites]]/[[Animation|animations]] that the actor is using.
     *
     * ### Working with Textures & Sprites
     *
     * Think of a [[Texture|texture]] as the raw image file that will be loaded into Excalibur. In order for it to be drawn
     * it must be converted to a [[Sprite.sprite]].
     *
     * A common usage is to load a [[Texture]] and convert it to a [[Sprite]] for an actor. If you are using the [[Loader]] to
     * pre-load assets, you can simply assign an actor a [[Sprite]] to draw. You can also create a
     * [[Texture.asSprite|sprite from a Texture]] to quickly create a [[Sprite]] instance.
     *
     * ```ts
     * // assume Resources.TxPlayer is a 80x80 png image
     *
     * public onInitialize(engine: ex.Engine) {
     *
     *   // set as the "default" drawing
     *   this.addDrawing(Resources.TxPlayer);
     *
     *   // you can also set a Sprite instance to draw
     *   this.addDrawing(Resources.TxPlayer.asSprite());
     * }
     * ```
     *
     * ### Working with Animations
     *
     * A [[SpriteSheet]] holds a collection of sprites from a single [[Texture]].
     * Use [[SpriteSheet.getAnimationForAll]] to easily generate an [[Animation]].
     *
     * ```ts
     * // assume Resources.TxPlayerIdle is a texture containing several frames of an animation
     *
     * public onInitialize(engine: ex.Engine) {
     *
     *   // create a SpriteSheet for the animation
     *   var playerIdleSheet = new ex.SpriteSheet(Resources.TxPlayerIdle, 5, 1, 80, 80);
     *
     *   // create an animation
     *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(engine, 120);
     *
     *   // the first drawing is always the current
     *   this.addDrawing("idle", playerIdleAnimation);
     * }
     * ```
     *
     * ### Custom drawing
     *
     * You can always override the default drawing logic for an actor in the [[draw]] method,
     * for example, to draw complex shapes or to use the raw
     * [[https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D|Canvas API]].
     *
     * Usually you should call `super.draw` to perform the base drawing logic, but other times
     * you may want to take over the drawing completely.
     *
     * ```ts
     * public draw(ctx: Canvas2DRenderingContext, delta: number) {
     *
     *   super.draw(ctx, delta); // perform base drawing logic
     *
     *   // custom drawing
     *   ctx.lineTo(...);
     * }
     * ```
     *
     * ## Actions
     *
     * You can use the [[ActionContext|Action API]] to create chains of
     * actions and script actors into doing your bidding for your game.
     *
     * Actions can be simple or can be chained together to create complex
     * AI routines. In the future, it will be easier to create timelines or
     * scripts to run depending on the state of your actor, such as an
     * enemy ship that is Guarding a path and then is Alerted when a Player
     * draws near.
     *
     * Learn more about the [[ActionContext|Action API]].
     *
     * ## Collision Detection
     *
     * By default Actors do not participate in collisions. If you wish to make
     * an actor participate, you need to switch from the default [[CollisionType.PreventCollision|prevent collision]]
     * to [[CollisionType.Active|active]], [[CollisionType.Fixed|fixed]], or [[CollisionType.Passive|passive]] collision type.
     *
     * ```ts
     * public Player extends ex.Actor {
     *   constructor() {
     *     super();
     *     // set preferred CollisionType
     *     this.collisionType = ex.CollisionType.Active;
     *   }
     * }
     *
     * // or set the collisionType
     *
     * var actor = new ex.Actor();
     * actor.collisionType = ex.CollisionType.Active;
     *
     * ```
     * ### Collision Groups
     * TODO, needs more information.
     *
     * ## Traits
     *
     * Traits describe actor behavior that occurs every update. If you wish to build a generic behavior
     * without needing to extend every actor you can do it with a trait, a good example of this may be
     * plugging in an external collision detection library like [[https://github.com/kripken/box2d.js/|Box2D]] or
     * [[http://wellcaffeinated.net/PhysicsJS/|PhysicsJS]] by wrapping it in a trait. Removing traits can also make your
     * actors more efficient.
     *
     * Default traits provided by Excalibur are [[Traits.CapturePointer|pointer capture]],
     * [[Traits.CollisionDetection|tile map collision]], [[Traits.Movement|Euler style movement]],
     * and [[Traits.OffscreenCulling|offscreen culling]].
     *
     *
     * ## Known Issues
     *
     * **Actor bounding boxes do not rotate**
     * [Issue #68](https://github.com/excaliburjs/Excalibur/issues/68)
     *
     */
    var Actor = (function (_super) {
        __extends(Actor, _super);
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
         * initial [[opacity]].
         */
        function Actor(x, y, width, height, color) {
            _super.call(this);
            /**
             * The unique identifier for the actor
             */
            this.id = Actor.maxId++;
            /**
             * The x coordinate of the actor (middle if anchor is (0.5, 0.5) left edge if anchor is (0, 0))
             */
            this.x = 0;
            /**
             * The y coordinate of the actor (middle if anchor is (0.5, 0.5) and top edge if anchor is (0, 0))
             */
            this.y = 0;
            this._height = 0;
            this._width = 0;
            /**
             * The rotation of the actor in radians
             */
            this.rotation = 0; // radians
            /**
             * The rotational velocity of the actor in radians/second
             */
            this.rx = 0; //radions/sec
            /**
             * The scale vector of the actor
             */
            this.scale = new ex.Vector(1, 1);
            /**
             * The x scalar velocity of the actor in scale/second
             */
            this.sx = 0; //scale/sec
            /**
             * The y scalar velocity of the actor in scale/second
             */
            this.sy = 0; //scale/sec
            /**
             * The x velocity of the actor in pixels/second
             */
            this.dx = 0; // pixels/sec
            /**
             * The x velocity of the actor in pixels/second
             */
            this.dy = 0;
            /**
             * The x acceleration of the actor in pixels/second^2
             */
            this.ax = 0; // pixels/sec/sec
            /**
             * The y acceleration of the actor in pixels/second^2
             */
            this.ay = 0;
            /**
             * Indicates whether the actor is physically in the viewport
             */
            this.isOffScreen = false;
            /**
             * The visibility of an actor
             */
            this.visible = true;
            /**
             * The opacity of an actor. Passing in a color in the [[constructor]] will use the
             * color's opacity.
             */
            this.opacity = 1;
            this.previousOpacity = 1;
            this.actions = new ex.ActionContext(this);
            /**
             * Convenience reference to the global logger
             */
            this.logger = ex.Logger.getInstance();
            /**
             * The scene that the actor is in
             */
            this.scene = null;
            /**
             * The parent of this actor
             */
            this.parent = null;
            // TODO: Replace this with the new actor collection once z-indexing is built
            /**
             * The children of this actor
             */
            this.children = [];
            /**
             * Gets or sets the current collision type of this actor. By
             * default it is ([[CollisionType.PreventCollision]]).
             */
            this.collisionType = CollisionType.PreventCollision;
            this.collisionGroups = [];
            this._collisionHandlers = {};
            this._isInitialized = false;
            this.frames = {};
            /**
             * Access to the current drawing for the actor, this can be
             * an [[Animation]], [[Sprite]], or [[Polygon]].
             * Set drawings with [[setDrawing]].
             */
            this.currentDrawing = null;
            this.centerDrawingX = true;
            this.centerDrawingY = true;
            /**
             * Modify the current actor update pipeline.
             */
            this.traits = [];
            /**
             * Whether or not to enable the [[CapturePointer]] trait that propogates
             * pointer events to this actor
             */
            this.enableCapturePointer = false;
            /**
             * Configuration for [[CapturePointer]] trait
             */
            this.capturePointer = {
                captureMoveEvents: false
            };
            this._zIndex = 0;
            this._isKilled = false;
            this.x = x || 0;
            this.y = y || 0;
            this._width = width || 0;
            this._height = height || 0;
            if (color) {
                this.color = color.clone();
                // set default opacity of an actor to the color
                this.opacity = color.a;
            }
            // Build default pipeline
            this.traits.push(new ex.Traits.Movement());
            this.traits.push(new ex.Traits.CollisionDetection());
            this.traits.push(new ex.Traits.OffscreenCulling());
            this.traits.push(new ex.Traits.CapturePointer());
            this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
            this.anchor = new ex.Point(.5, .5);
        }
        /**
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        Actor.prototype.onInitialize = function (engine) {
            // Override me
        };
        Actor.prototype._checkForPointerOptIn = function (eventName) {
            if (eventName && (eventName.toLowerCase() === 'pointerdown' ||
                eventName.toLowerCase() === 'pointerdown' ||
                eventName.toLowerCase() === 'pointermove')) {
                this.enableCapturePointer = true;
                if (eventName.toLowerCase() === 'pointermove') {
                    this.capturePointer.captureMoveEvents = true;
                }
            }
        };
        /**
         * Add an event listener. You can listen for a variety of
         * events off of the engine; see [[GameEvent]]
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         * @obsolete Use [[on]] instead.
         */
        Actor.prototype.addEventListener = function (eventName, handler) {
            this._checkForPointerOptIn(eventName);
            _super.prototype.addEventListener.call(this, eventName, handler);
        };
        /**
         * Alias for `addEventListener`. You can listen for a variety of
         * events off of the engine; see [[GameEvent]]
         * @param eventName   Name of the event to listen for
         * @param handler     Event handler for the thrown event
         */
        Actor.prototype.on = function (eventName, handler) {
            this._checkForPointerOptIn(eventName);
            this.eventDispatcher.subscribe(eventName, handler);
        };
        /**
         * If the current actor is a member of the scene, this will remove
         * it from the scene graph. It will no longer be drawn or updated.
         */
        Actor.prototype.kill = function () {
            if (this.scene) {
                this.scene.remove(this);
                this._isKilled = true;
            }
            else {
                this.logger.warn('Cannot kill actor, it was never added to the Scene');
            }
        };
        /**
         * Indicates wether the actor has been killed.
         */
        Actor.prototype.isKilled = function () {
            return this._isKilled;
        };
        /**
         * Adds a child actor to this actor. All movement of the child actor will be
         * relative to the parent actor. Meaning if the parent moves the child will
         * move with it.
         * @param actor The child actor to add
         */
        Actor.prototype.add = function (actor) {
            actor.collisionType = CollisionType.PreventCollision;
            if (ex.Util.addItemToArray(actor, this.children)) {
                actor.parent = this;
            }
        };
        /**
         * Removes a child actor from this actor.
         * @param actor The child actor to remove
         */
        Actor.prototype.remove = function (actor) {
            if (ex.Util.removeItemToArray(actor, this.children)) {
                actor.parent = null;
            }
        };
        Actor.prototype.setDrawing = function (key) {
            key = key.toString();
            if (this.currentDrawing !== this.frames[key]) {
                if (this.frames[key] != null) {
                    this.frames[key].reset();
                    this.currentDrawing = this.frames[key];
                }
                else {
                    ex.Logger.getInstance().error('the specified drawing key \'' + key + '\' does not exist');
                }
            }
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
                    this.addDrawing('default', arguments[0]);
                }
                if (arguments[0] instanceof ex.Texture) {
                    this.addDrawing('default', arguments[0].asSprite());
                }
            }
        };
        /**
         * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         */
        Actor.prototype.getZIndex = function () {
            return this._zIndex;
        };
        /**
         * Sets the z-index of an actor and updates it in the drawing list for the scene.
         * The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         * @param actor The child actor to remove
         */
        Actor.prototype.setZIndex = function (newIndex) {
            this.scene.cleanupDrawTree(this);
            this._zIndex = newIndex;
            this.scene.updateDrawTree(this);
        };
        /**
         * Adds an actor to a collision group. Actors with no named collision groups are
         * considered to be in every collision group.
         *
         * Once in a collision group(s) actors will only collide with other actors in
         * that group.
         *
         * @param name The name of the collision group
         */
        Actor.prototype.addCollisionGroup = function (name) {
            this.collisionGroups.push(name);
        };
        /**
         * Removes an actor from a collision group.
         * @param name The name of the collision group
         */
        Actor.prototype.removeCollisionGroup = function (name) {
            var index = this.collisionGroups.indexOf(name);
            if (index !== -1) {
                this.collisionGroups.splice(index, 1);
            }
        };
        /**
         * Get the center point of an actor
         */
        Actor.prototype.getCenter = function () {
            return new ex.Vector(this.x + this.getWidth() / 2 - this.anchor.x * this.getWidth(), this.y + this.getHeight() / 2 - this.anchor.y * this.getHeight());
        };
        /**
         * Gets the calculated width of an actor, factoring in scale
         */
        Actor.prototype.getWidth = function () {
            return this._width * this.scale.x;
        };
        /**
         * Sets the width of an actor, factoring in the current scale
         */
        Actor.prototype.setWidth = function (width) {
            this._width = width / this.scale.x;
        };
        /**
         * Gets the calculated height of an actor, factoring in scale
         */
        Actor.prototype.getHeight = function () {
            return this._height * this.scale.y;
        };
        /**
         * Sets the height of an actor, factoring in the current scale
         */
        Actor.prototype.setHeight = function (height) {
            this._height = height / this.scale.y;
        };
        /**
         * Centers the actor's drawing around the center of the actor's bounding box
         * @param center Indicates to center the drawing around the actor
         */
        Actor.prototype.setCenterDrawing = function (center) {
            this.centerDrawingY = center;
            this.centerDrawingX = center;
        };
        /**
         * Gets the left edge of the actor
         */
        Actor.prototype.getLeft = function () {
            return this.x;
        };
        /**
         * Gets the right edge of the actor
         */
        Actor.prototype.getRight = function () {
            return this.x + this.getWidth();
        };
        /**
         * Gets the top edge of the actor
         */
        Actor.prototype.getTop = function () {
            return this.y;
        };
        /**
         * Gets the bottom edge of the actor
         */
        Actor.prototype.getBottom = function () {
            return this.y + this.getHeight();
        };
        /**
         * Gets the x value of the Actor in global coordinates
         */
        Actor.prototype.getWorldX = function () {
            if (!this.parent) {
                return this.x;
            }
            return this.x * this.parent.scale.x + this.parent.getWorldX();
        };
        /**
         * Gets the y value of the Actor in global coordinates
         */
        Actor.prototype.getWorldY = function () {
            if (!this.parent) {
                return this.y;
            }
            return this.y * this.parent.scale.y + this.parent.getWorldY();
        };
        /**
         * Gets the global scale of the Actor
         */
        Actor.prototype.getGlobalScale = function () {
            if (!this.parent) {
                return new ex.Point(this.scale.x, this.scale.y);
            }
            var parentScale = this.parent.getGlobalScale();
            return new ex.Point(this.scale.x * parentScale.x, this.scale.y * parentScale.y);
        };
        /**
         * Returns the actor's [[BoundingBox]] calculated for this instant.
         */
        Actor.prototype.getBounds = function () {
            var anchor = this._getCalculatedAnchor();
            return new ex.BoundingBox(this.getWorldX() - anchor.x, this.getWorldY() - anchor.y, this.getWorldX() + this.getWidth() - anchor.x, this.getWorldY() + this.getHeight() - anchor.y);
        };
        /**
         * Tests whether the x/y specified are contained in the actor
         * @param x  X coordinate to test (in world coordinates)
         * @param y  Y coordinate to test (in world coordinates)
         * @param recurse checks whether the x/y are contained in any child actors (if they exist).
         */
        Actor.prototype.contains = function (x, y, recurse) {
            if (recurse === void 0) { recurse = false; }
            var containment = this.getBounds().contains(new ex.Point(x, y));
            if (recurse) {
                return containment || this.children.some(function (child) {
                    return child.contains(x, y, true);
                });
            }
            return containment;
        };
        /**
         * Returns the side of the collision based on the intersection
         * @param intersect The displacement vector returned by a collision
         */
        Actor.prototype.getSideFromIntersect = function (intersect) {
            if (intersect) {
                if (Math.abs(intersect.x) > Math.abs(intersect.y)) {
                    if (intersect.x < 0) {
                        return ex.Side.Right;
                    }
                    return ex.Side.Left;
                }
                else {
                    if (intersect.y < 0) {
                        return ex.Side.Bottom;
                    }
                    return ex.Side.Top;
                }
            }
            return ex.Side.None;
        };
        /**
         * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
         * @param actor The other actor to test
         */
        Actor.prototype.collidesWithSide = function (actor) {
            var separationVector = this.collides(actor);
            if (!separationVector) {
                return ex.Side.None;
            }
            if (Math.abs(separationVector.x) > Math.abs(separationVector.y)) {
                if (this.x < actor.x) {
                    return ex.Side.Right;
                }
                else {
                    return ex.Side.Left;
                }
            }
            else {
                if (this.y < actor.y) {
                    return ex.Side.Bottom;
                }
                else {
                    return ex.Side.Top;
                }
            }
            return ex.Side.None;
        };
        /**
         * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
         * `null` when there is no collision;
         * @param actor The other actor to test
         */
        Actor.prototype.collides = function (actor) {
            var bounds = this.getBounds();
            var otherBounds = actor.getBounds();
            var intersect = bounds.collides(otherBounds);
            return intersect;
        };
        /**
         * Register a handler to fire when this actor collides with another in a specified group
         * @param group The group name to listen for
         * @param func The callback to fire on collision with another actor from the group. The callback is passed the other actor.
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
         * @param group Group to remove all handlers for on this actor.
         */
        Actor.prototype.removeCollidesWith = function (group) {
            this._collisionHandlers[group] = [];
        };
        /**
         * Returns true if the two actors are less than or equal to the distance specified from each other
         * @param actor     Actor to test
         * @param distance  Distance in pixels to test
         */
        Actor.prototype.within = function (actor, distance) {
            return Math.sqrt(Math.pow(this.x - actor.x, 2) + Math.pow(this.y - actor.y, 2)) <= distance;
        };
        /**
         * Clears all queued actions from the Actor
         * @obsolete Use [[ActionContext.clearActions|Actor.actions.clearActions]]
         */
        Actor.prototype.clearActions = function () {
            this.actionQueue.clearActions();
        };
        /**
         * This method will move an actor to the specified `x` and `y` position over the
         * specified duration using a given [[EasingFunctions]] and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x         The x location to move the actor to
         * @param y         The y location to move the actor to
         * @param duration  The time it should take the actor to move to the new location in milliseconds
         * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position
         * @obsolete Use [[ActionContext.easeTo|Actor.actions.easeTo]]
         */
        Actor.prototype.easeTo = function (x, y, duration, easingFcn) {
            if (easingFcn === void 0) { easingFcn = ex.EasingFunctions.Linear; }
            this.actionQueue.add(new ex.Internal.Actions.EaseTo(this, x, y, duration, easingFcn));
            return this;
        };
        /**
         * This method will move an actor to the specified `x` and `y` position at the
         * `speed` specified (in pixels per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x       The x location to move the actor to
         * @param y       The y location to move the actor to
         * @param speed   The speed in pixels per second to move
         * @obsolete Use [[ActionContext.moveTo|Actor.actions.moveTo]]
         */
        Actor.prototype.moveTo = function (x, y, speed) {
            this.actionQueue.add(new ex.Internal.Actions.MoveTo(this, x, y, speed));
            return this;
        };
        /**
         * This method will move an actor to the specified `x` and `y` position by a
         * certain `duration` (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param x         The x location to move the actor to
         * @param y         The y location to move the actor to
         * @param duration  The time it should take the actor to move to the new location in milliseconds
         * @obsolete Use [[ActionContext.moveBy|Actor.actions.moveBy]]
         */
        Actor.prototype.moveBy = function (x, y, duration) {
            this.actionQueue.add(new ex.Internal.Actions.MoveBy(this, x, y, duration));
            return this;
        };
        /**
         * This method will rotate an actor to the specified angle (in radians) at the `speed`
         * specified (in radians per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param speed         The angular velocity of the rotation specified in radians per second
         * @obsolete Use [[ActionContext.rotateTo|Actor.actions.rotateTo]]
         */
        Actor.prototype.rotateTo = function (angleRadians, speed, rotationType) {
            this.actionQueue.add(new ex.Internal.Actions.RotateTo(this, angleRadians, speed, rotationType));
            return this;
        };
        /**
         * This method will rotate an actor to the specified angle by a certain
         * `duration` (in milliseconds) and return back the actor. This method is part
         * of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param duration          The time it should take the actor to complete the rotation in milliseconds
         * @obsolete Use [[ActionContext.rotateBy|ex.Actor.actions.rotateBy]]
         */
        Actor.prototype.rotateBy = function (angleRadians, duration, rotationType) {
            this.actionQueue.add(new ex.Internal.Actions.RotateBy(this, angleRadians, duration, rotationType));
            return this;
        };
        /**
         * This method will scale an actor to the specified size at the speed
         * specified (in magnitude increase per second) and return back the
         * actor. This method is part of the actor 'Action' fluent API allowing
         * action chaining.
         * @param sizeX  The scaling factor in the x direction to apply
         * @param sizeY  The scaling factor in the y direction to apply
         * @param speedX The speed of scaling in the x direction specified in magnitude increase per second
         * @param speedY The speed of scaling in the y direction specified in magnitude increase per second
         * @obsolete Use [[ActionContext.scaleTo|Actor.actions.scaleTo]]
         */
        Actor.prototype.scaleTo = function (sizeX, sizeY, speedX, speedY) {
            this.actionQueue.add(new ex.Internal.Actions.ScaleTo(this, sizeX, sizeY, speedX, speedY));
            return this;
        };
        /**
         * This method will scale an actor to the specified size by a certain duration
         * (in milliseconds) and return back the actor. This method is part of the
         * actor 'Action' fluent API allowing action chaining.
         * @param sizeX     The scaling factor in the x direction to apply
         * @param sizeY     The scaling factor in the y direction to apply
         * @param duration  The time it should take to complete the scaling in milliseconds
         * @obsolete Use [[ActionContext.scaleBy|Actor.actions.scaleBy]]
         */
        Actor.prototype.scaleBy = function (sizeX, sizeY, duration) {
            this.actionQueue.add(new ex.Internal.Actions.ScaleBy(this, sizeX, sizeY, duration));
            return this;
        };
        /**
         * This method will cause an actor to blink (become visible and not
         * visible). Optionally, you may specify the number of blinks. Specify the amount of time
         * the actor should be visible per blink, and the amount of time not visible.
         * This method is part of the actor 'Action' fluent API allowing action chaining.
         * @param timeVisible     The amount of time to stay visible per blink in milliseconds
         * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
         * @param numBlinks       The number of times to blink
         * @obsolete Use [[ActionContext.blink|Actor.actions.blink]]
         */
        Actor.prototype.blink = function (timeVisible, timeNotVisible, numBlinks) {
            if (numBlinks === void 0) { numBlinks = 1; }
            this.actionQueue.add(new ex.Internal.Actions.Blink(this, timeVisible, timeNotVisible, numBlinks));
            return this;
        };
        /**
         * This method will cause an actor's opacity to change from its current value
         * to the provided value by a specified `duration` (in milliseconds). This method is
         * part of the actor 'Action' fluent API allowing action chaining.
         * @param opacity   The ending opacity
         * @param duration  The time it should take to fade the actor (in milliseconds)
         * @obsolete Use [[ActionContext.fade|Actor.actions.fade]]
         */
        Actor.prototype.fade = function (opacity, duration) {
            this.actionQueue.add(new ex.Internal.Actions.Fade(this, opacity, duration));
            return this;
        };
        /**
         * This method will delay the next action from executing for the specified
         * `duration` (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param duration The amount of time to delay the next action in the queue from executing in milliseconds
         * @obsolete Use [[ActionContext.delay|Actor.actions.delay]]
         */
        Actor.prototype.delay = function (duration) {
            this.actionQueue.add(new ex.Internal.Actions.Delay(this, duration));
            return this;
        };
        /**
         * This method will add an action to the queue that will remove the actor from the
         * scene once it has completed its previous actions. Any actions on the
         * action queue after this action will not be executed.
         * @obsolete Use [[ActionContext.die|Actor.actions.die]]
         */
        Actor.prototype.die = function () {
            this.actionQueue.add(new ex.Internal.Actions.Die(this));
            return this;
        };
        /**
         * This method allows you to call an arbitrary method as the next action in the
         * action queue. This is useful if you want to execute code in after a specific
         * action, i.e An actor arrives at a destination after traversing a path
         * @obsolete Use [[ActionContext.callMethod|Actor.actions.callMethod]]
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
         * @param times The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions will
         * repeat forever
         * @obsolete Use [[ActionContext.repeat|Actor.actions.repeat]]
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
         * @obsolete Use [[ActionContext.repeatForever|Actor.actions.repeatForever]]
         */
        Actor.prototype.repeatForever = function () {
            this.actionQueue.add(new ex.Internal.Actions.RepeatForever(this, this.actionQueue.getActions()));
            return this;
        };
        /**
         * This method will cause the actor to follow another at a specified distance
         * @param actor           The actor to follow
         * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
         * @obsolete Use [[ActionContext.follow|Actor.actions.follow]]
         */
        Actor.prototype.follow = function (actor, followDistance) {
            if (typeof followDistance === 'undefined') {
                this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor));
            }
            else {
                this.actionQueue.add(new ex.Internal.Actions.Follow(this, actor, followDistance));
            }
            return this;
        };
        /**
         * This method will cause the actor to move towards another Actor until they
         * collide ("meet") at a specified speed.
         * @param actor  The actor to meet
         * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
         * @obsolete Use [[ActionContext.meet|Actor.actions.meet]]
         */
        Actor.prototype.meet = function (actor, speed) {
            if (typeof speed === 'undefined') {
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
         * @obsolete Use [[ActionContext.asPromise|Actor.actions.asPromise]]
         */
        Actor.prototype.asPromise = function () {
            var complete = new ex.Promise();
            this.callMethod(function () {
                complete.resolve();
            });
            return complete;
        };
        Actor.prototype._getCalculatedAnchor = function () {
            return new ex.Point(this.getWidth() * this.anchor.x, this.getHeight() * this.anchor.y);
        };
        /**
         * Called by the Engine, updates the state of the actor
         * @param engine The reference to the current game engine
         * @param delta  The time elapsed since the last update in milliseconds
         */
        Actor.prototype.update = function (engine, delta) {
            if (!this._isInitialized) {
                this.onInitialize(engine);
                this.eventDispatcher.emit('initialize', new ex.InitializeEvent(engine));
                this._isInitialized = true;
            }
            this.emit('preupdate', new ex.PreUpdateEvent(engine, delta, this));
            var eventDispatcher = this.eventDispatcher;
            // Update action queue
            this.actionQueue.update(delta);
            // Update color only opacity
            if (this.color) {
                this.color.a = this.opacity;
            }
            // Update actor pipeline (movement, collision detection, event propagation, offscreen culling)
            for (var i = 0; i < this.traits.length; i++) {
                this.traits[i].update(this, engine, delta);
            }
            eventDispatcher.emit('update', new ex.UpdateEvent(delta));
            this.emit('postupdate', new ex.PostUpdateEvent(engine, delta, this));
        };
        /**
         * Called by the Engine, draws the actor to the screen
         * @param ctx   The rendering context
         * @param delta The time since the last draw in milliseconds
         */
        Actor.prototype.draw = function (ctx, delta) {
            var anchorPoint = this._getCalculatedAnchor();
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.scale.x, this.scale.y);
            ctx.rotate(this.rotation);
            this.emit('predraw', new ex.PreDrawEvent(ctx, delta, this));
            // calculate changing opacity
            if (this.previousOpacity !== this.opacity) {
                for (var drawing in this.frames) {
                    this.frames[drawing].addEffect(new ex.Effects.Opacity(this.opacity));
                }
                this.previousOpacity = this.opacity;
            }
            if (this.currentDrawing) {
                var xDiff = 0;
                var yDiff = 0;
                if (this.centerDrawingX) {
                    xDiff = (this.currentDrawing.naturalWidth * this.currentDrawing.scale.x - this.getWidth()) / 2 -
                        this.currentDrawing.naturalWidth * this.currentDrawing.scale.x * this.currentDrawing.anchor.x;
                }
                if (this.centerDrawingY) {
                    yDiff = (this.currentDrawing.naturalHeight * this.currentDrawing.scale.y - this.getHeight()) / 2 -
                        this.currentDrawing.naturalHeight * this.currentDrawing.scale.y * this.currentDrawing.anchor.y;
                }
                this.currentDrawing.draw(ctx, -anchorPoint.x - xDiff, -anchorPoint.y - yDiff);
            }
            else {
                if (this.color) {
                    ctx.fillStyle = this.color.toString();
                    ctx.fillRect(-anchorPoint.x, -anchorPoint.y, this._width, this._height);
                }
            }
            // Draw child actors
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].visible) {
                    this.children[i].draw(ctx, delta);
                }
            }
            this.emit('postdraw', new ex.PostDrawEvent(ctx, delta, this));
            ctx.restore();
        };
        /**
         * Called by the Engine, draws the actors debugging to the screen
         * @param ctx The rendering context
         */
        Actor.prototype.debugDraw = function (ctx) {
            this.emit('predebugdraw', new ex.PreDebugDrawEvent(ctx, this));
            // Draw actor bounding box
            var bb = this.getBounds();
            bb.debugDraw(ctx);
            // Draw actor Id
            ctx.fillText('id: ' + this.id, bb.left + 3, bb.top + 10);
            // Draw actor anchor point
            ctx.fillStyle = ex.Color.Yellow.toString();
            ctx.beginPath();
            ctx.arc(this.getWorldX(), this.getWorldY(), 3, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            // Culling Box debug draw
            for (var j = 0; j < this.traits.length; j++) {
                if (this.traits[j] instanceof ex.Traits.OffscreenCulling) {
                    this.traits[j].cullingBox.debugDraw(ctx);
                }
            }
            // Unit Circle debug draw
            ctx.strokeStyle = ex.Color.Yellow.toString();
            ctx.beginPath();
            var radius = Math.min(this.getWidth(), this.getHeight());
            ctx.arc(this.getWorldX(), this.getWorldY(), radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
            var ticks = { '0 Pi': 0,
                'Pi/2': Math.PI / 2,
                'Pi': Math.PI,
                '3/2 Pi': 3 * Math.PI / 2 };
            var oldFont = ctx.font;
            for (var tick in ticks) {
                ctx.fillStyle = ex.Color.Yellow.toString();
                ctx.font = '14px';
                ctx.textAlign = 'center';
                ctx.fillText(tick, this.getWorldX() + Math.cos(ticks[tick]) * (radius + 10), this.getWorldY() + Math.sin(ticks[tick]) * (radius + 10));
            }
            ctx.font = oldFont;
            // Draw child actors
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            // Draw child actors
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].debugDraw(ctx);
            }
            ctx.restore();
            this.emit('postdebugdraw', new ex.PostDebugDrawEvent(ctx, this));
        };
        /**
         * Indicates the next id to be set
         */
        Actor.maxId = 0;
        return Actor;
    })(ex.Class);
    ex.Actor = Actor;
    /**
     * An enum that describes the types of collisions actors can participate in
     */
    (function (CollisionType) {
        /**
         * Actors with the `PreventCollision` setting do not participate in any
         * collisions and do not raise collision events.
         */
        CollisionType[CollisionType["PreventCollision"] = 0] = "PreventCollision";
        /**
         * Actors with the `Passive` setting only raise collision events, but are not
         * influenced or moved by other actors and do not influence or move other actors.
         */
        CollisionType[CollisionType["Passive"] = 1] = "Passive";
        /**
         * Actors with the `Active` setting raise collision events and participate
         * in collisions with other actors and will be push or moved by actors sharing
         * the `Active` or `Fixed` setting.
         */
        CollisionType[CollisionType["Active"] = 2] = "Active";
        /**
         * Actors with the `Elastic` setting will behave the same as `Active`, except that they will
         * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
         * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
         * @obsolete This behavior will be handled by a future physics system
         */
        CollisionType[CollisionType["Elastic"] = 3] = "Elastic";
        /**
         * Actors with the `Fixed` setting raise collision events and participate in
         * collisions with other actors. Actors with the `Fixed` setting will not be
         * pushed or moved by other actors sharing the `Fixed`. Think of Fixed
         * actors as "immovable/onstoppable" objects. If two `Fixed` actors meet they will
         * not be pushed or moved by each other, they will not interact except to throw
         * collision events.
         */
        CollisionType[CollisionType["Fixed"] = 4] = "Fixed";
    })(ex.CollisionType || (ex.CollisionType = {}));
    var CollisionType = ex.CollisionType;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Logging level that Excalibur will tag
     */
    (function (LogLevel) {
        LogLevel[LogLevel["Debug"] = 0] = "Debug";
        LogLevel[LogLevel["Info"] = 1] = "Info";
        LogLevel[LogLevel["Warn"] = 2] = "Warn";
        LogLevel[LogLevel["Error"] = 3] = "Error";
        LogLevel[LogLevel["Fatal"] = 4] = "Fatal";
    })(ex.LogLevel || (ex.LogLevel = {}));
    var LogLevel = ex.LogLevel;
    /**
     * Static singleton that represents the logging facility for Excalibur.
     * Excalibur comes built-in with a [[ConsoleAppender]] and [[ScreenAppender]].
     * Derive from [[IAppender]] to create your own logging appenders.
     *
     * ## Example: Logging
     *
     * ```js
     * // set default log level (default: Info)
     * ex.Logger.getInstance().defaultLevel = ex.LogLevel.Warn;
     *
     * // this will not be shown because it is below Warn
     * ex.Logger.getInstance().info("This will be logged as Info");
     * // this will show because it is Warn
     * ex.Logger.getInstance().warn("This will be logged as Warn");
     * // this will show because it is above Warn
     * ex.Logger.getInstance().error("This will be logged as Error");
     * // this will show because it is above Warn
     * ex.Logger.getInstance().fatal("This will be logged as Fatal");
     * ```
     */
    var Logger = (function () {
        function Logger() {
            this._appenders = [];
            /**
             * Gets or sets the default logging level. Excalibur will only log
             * messages if equal to or above this level. Default: [[LogLevel.Info]]
             */
            this.defaultLevel = LogLevel.Info;
            if (Logger._instance) {
                throw new Error('Logger is a singleton');
            }
            Logger._instance = this;
            // Default console appender
            Logger._instance.addAppender(new ConsoleAppender());
            return Logger._instance;
        }
        /**
         * Gets the current static instance of Logger
         */
        Logger.getInstance = function () {
            if (Logger._instance == null) {
                Logger._instance = new Logger();
            }
            return Logger._instance;
        };
        /**
         * Adds a new [[IAppender]] to the list of appenders to write to
         */
        Logger.prototype.addAppender = function (appender) {
            this._appenders.push(appender);
        };
        /**
         * Clears all appenders from the logger
         */
        Logger.prototype.clearAppenders = function () {
            this._appenders.length = 0;
        };
        /**
         * Logs a message at a given LogLevel
         * @param level  The LogLevel`to log the message at
         * @param args   An array of arguments to write to an appender
         */
        Logger.prototype._log = function (level, args) {
            if (level == null) {
                level = this.defaultLevel;
            }
            var i = 0, len = this._appenders.length;
            for (i; i < len; i++) {
                if (level >= this.defaultLevel) {
                    this._appenders[i].log(level, args);
                }
            }
        };
        /**
         * Writes a log message at the [[LogLevel.Debug]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Debug, args);
        };
        /**
         * Writes a log message at the [[LogLevel.Info]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Info, args);
        };
        /**
         * Writes a log message at the [[LogLevel.Warn]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Warn, args);
        };
        /**
         * Writes a log message at the [[LogLevel.Error]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Error, args);
        };
        /**
         * Writes a log message at the [[LogLevel.Fatal]] level
         * @param args  Accepts any number of arguments
         */
        Logger.prototype.fatal = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this._log(LogLevel.Fatal, args);
        };
        Logger._instance = null;
        return Logger;
    })();
    ex.Logger = Logger;
    /**
     * Console appender for browsers (i.e. `console.log`)
     */
    var ConsoleAppender = (function () {
        function ConsoleAppender() {
        }
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        ConsoleAppender.prototype.log = function (level, args) {
            // Check for console support
            if (!console && !console.log && console.warn && console.error) {
                // todo maybe do something better than nothing
                return;
            }
            // Create a new console args array
            var consoleArgs = [];
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
        };
        return ConsoleAppender;
    })();
    ex.ConsoleAppender = ConsoleAppender;
    /**
     * On-screen (canvas) appender
     */
    var ScreenAppender = (function () {
        /**
         * @param width   Width of the screen appender in pixels
         * @param height  Height of the screen appender in pixels
         */
        function ScreenAppender(width, height) {
            // @todo Clean this up
            this._messages = [];
            this._canvas = document.createElement('canvas');
            this._canvas.width = width || window.innerWidth;
            this._canvas.height = height || window.innerHeight;
            this._canvas.style.position = 'absolute';
            this._ctx = this._canvas.getContext('2d');
            document.body.appendChild(this._canvas);
        }
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        ScreenAppender.prototype.log = function (level, args) {
            var message = args.join(',');
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._messages.unshift('[' + LogLevel[level] + '] : ' + message);
            var pos = 10;
            var opacity = 1.0;
            for (var i = 0; i < this._messages.length; i++) {
                this._ctx.fillStyle = 'rgba(255,255,255,' + opacity.toFixed(2) + ')';
                this._ctx.fillText(this._messages[i], 200, pos);
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
/// <reference path="Util/Log.ts" />
var ex;
(function (ex) {
    /**
     * Base event type in Excalibur that all other event types derive from. Not all event types are thrown on all Excalibur game objects,
     * some events are unique to a type, others are not.
     *
     * Excalibur events follow the convention that the name of the thrown event for listening will be the same as the Event object in all
     * lower case with the 'Event' suffix removed.
     *
     * For example:
     * - PreDrawEvent event object and "predraw" as the event name
     *
     * ```typescript
     *
     * actor.on('predraw', (evtObj: PreDrawEvent) => {
     *    // do some pre drawing
     * })
     *
     * ```
     *
     */
    var GameEvent = (function () {
        function GameEvent() {
        }
        return GameEvent;
    })();
    ex.GameEvent = GameEvent;
    /**
     * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics
     * transform so that all drawing takes place with the actor as the origin.
     *
     */
    var PreDrawEvent = (function (_super) {
        __extends(PreDrawEvent, _super);
        function PreDrawEvent(ctx, delta, target) {
            _super.call(this);
            this.ctx = ctx;
            this.delta = delta;
            this.target = target;
        }
        return PreDrawEvent;
    })(GameEvent);
    ex.PreDrawEvent = PreDrawEvent;
    /**
     * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics
     * transform so that all drawing takes place with the actor as the origin.
     *
     */
    var PostDrawEvent = (function (_super) {
        __extends(PostDrawEvent, _super);
        function PostDrawEvent(ctx, delta, target) {
            _super.call(this);
            this.ctx = ctx;
            this.delta = delta;
            this.target = target;
        }
        return PostDrawEvent;
    })(GameEvent);
    ex.PostDrawEvent = PostDrawEvent;
    /**
     * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
     */
    var PreDebugDrawEvent = (function (_super) {
        __extends(PreDebugDrawEvent, _super);
        function PreDebugDrawEvent(ctx, target) {
            _super.call(this);
            this.ctx = ctx;
            this.target = target;
        }
        return PreDebugDrawEvent;
    })(GameEvent);
    ex.PreDebugDrawEvent = PreDebugDrawEvent;
    /**
     * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
     */
    var PostDebugDrawEvent = (function (_super) {
        __extends(PostDebugDrawEvent, _super);
        function PostDebugDrawEvent(ctx, target) {
            _super.call(this);
            this.ctx = ctx;
            this.target = target;
        }
        return PostDebugDrawEvent;
    })(GameEvent);
    ex.PostDebugDrawEvent = PostDebugDrawEvent;
    /**
     * The 'preupdate' event is emitted on actors, scenes, and engine before the update starts.
     */
    var PreUpdateEvent = (function (_super) {
        __extends(PreUpdateEvent, _super);
        function PreUpdateEvent(engine, delta, target) {
            _super.call(this);
            this.engine = engine;
            this.delta = delta;
            this.target = target;
        }
        return PreUpdateEvent;
    })(GameEvent);
    ex.PreUpdateEvent = PreUpdateEvent;
    /**
     * The 'postupdate' event is emitted on actors, scenes, and engine after the update ends. This is equivalent to the obsolete 'update'
     * event.
     */
    var PostUpdateEvent = (function (_super) {
        __extends(PostUpdateEvent, _super);
        function PostUpdateEvent(engine, delta, target) {
            _super.call(this);
            this.engine = engine;
            this.delta = delta;
            this.target = target;
        }
        return PostUpdateEvent;
    })(GameEvent);
    ex.PostUpdateEvent = PostUpdateEvent;
    /**
     * Event received when a gamepad is connected to Excalibur. [[Input.Gamepads|engine.input.gamepads]] receives this event.
     */
    var GamepadConnectEvent = (function (_super) {
        __extends(GamepadConnectEvent, _super);
        function GamepadConnectEvent(index, gamepad) {
            _super.call(this);
            this.index = index;
            this.gamepad = gamepad;
        }
        return GamepadConnectEvent;
    })(GameEvent);
    ex.GamepadConnectEvent = GamepadConnectEvent;
    /**
     * Event received when a gamepad is disconnected from Excalibur. [[Input.Gamepads|engine.input.gamepads]] receives this event.
     */
    var GamepadDisconnectEvent = (function (_super) {
        __extends(GamepadDisconnectEvent, _super);
        function GamepadDisconnectEvent(index) {
            _super.call(this);
            this.index = index;
        }
        return GamepadDisconnectEvent;
    })(GameEvent);
    ex.GamepadDisconnectEvent = GamepadDisconnectEvent;
    /**
     * Gamepad button event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
     */
    var GamepadButtonEvent = (function (_super) {
        __extends(GamepadButtonEvent, _super);
        /**
         * @param button  The Gamepad button
         * @param value   A numeric value between 0 and 1
         */
        function GamepadButtonEvent(button, value) {
            _super.call(this);
            this.button = button;
            this.value = value;
        }
        return GamepadButtonEvent;
    })(ex.GameEvent);
    ex.GamepadButtonEvent = GamepadButtonEvent;
    /**
     * Gamepad axis event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
     */
    var GamepadAxisEvent = (function (_super) {
        __extends(GamepadAxisEvent, _super);
        /**
         * @param axis  The Gamepad axis
         * @param value A numeric value between -1 and 1
         */
        function GamepadAxisEvent(axis, value) {
            _super.call(this);
            this.axis = axis;
            this.value = value;
        }
        return GamepadAxisEvent;
    })(ex.GameEvent);
    ex.GamepadAxisEvent = GamepadAxisEvent;
    /**
     * Subscribe event thrown when handlers for events other than subscribe are added. Meta event that is received by
     * [[EventDispatcher|event dispatchers]].
     */
    var SubscribeEvent = (function (_super) {
        __extends(SubscribeEvent, _super);
        function SubscribeEvent(topic, handler) {
            _super.call(this);
            this.topic = topic;
            this.handler = handler;
        }
        return SubscribeEvent;
    })(GameEvent);
    ex.SubscribeEvent = SubscribeEvent;
    /**
     * Unsubscribe event thrown when handlers for events other than unsubscribe are removed. Meta event that is received by
     * [[EventDispatcher|event dispatchers]].
     */
    var UnsubscribeEvent = (function (_super) {
        __extends(UnsubscribeEvent, _super);
        function UnsubscribeEvent(topic, handler) {
            _super.call(this);
            this.topic = topic;
            this.handler = handler;
        }
        return UnsubscribeEvent;
    })(GameEvent);
    ex.UnsubscribeEvent = UnsubscribeEvent;
    /**
     * Event received by the [[Engine]] when the browser window is visible on a screen.
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
     * Event received by the [[Engine]] when the browser window is hidden from all screens.
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
     * Event thrown on an [[Actor|actor]] when a collision has occured
     */
    var CollisionEvent = (function (_super) {
        __extends(CollisionEvent, _super);
        /**
         * @param actor  The actor the event was thrown on
         * @param other  The actor that was collided with
         * @param side   The side that was collided with
         */
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
     * Event thrown on a game object on Excalibur update, this is equivalent to postupdate.
     * @obsolete Please use [[PostUpdateEvent|postupdate]], or [[PreUpdateEvent|preupdate]].
     */
    var UpdateEvent = (function (_super) {
        __extends(UpdateEvent, _super);
        /**
         * @param delta  The number of milliseconds since the last update
         */
        function UpdateEvent(delta) {
            _super.call(this);
            this.delta = delta;
        }
        return UpdateEvent;
    })(GameEvent);
    ex.UpdateEvent = UpdateEvent;
    /**
     * Event thrown on an [[Actor]] only once before the first update call
     */
    var InitializeEvent = (function (_super) {
        __extends(InitializeEvent, _super);
        /**
         * @param engine  The reference to the current engine
         */
        function InitializeEvent(engine) {
            _super.call(this);
            this.engine = engine;
        }
        return InitializeEvent;
    })(GameEvent);
    ex.InitializeEvent = InitializeEvent;
    /**
     * Event thrown on a [[Scene]] on activation
     */
    var ActivateEvent = (function (_super) {
        __extends(ActivateEvent, _super);
        /**
         * @param oldScene  The reference to the old scene
         */
        function ActivateEvent(oldScene) {
            _super.call(this);
            this.oldScene = oldScene;
        }
        return ActivateEvent;
    })(GameEvent);
    ex.ActivateEvent = ActivateEvent;
    /**
     * Event thrown on a [[Scene]] on deactivation
     */
    var DeactivateEvent = (function (_super) {
        __extends(DeactivateEvent, _super);
        /**
         * @param newScene  The reference to the new scene
         */
        function DeactivateEvent(newScene) {
            _super.call(this);
            this.newScene = newScene;
        }
        return DeactivateEvent;
    })(GameEvent);
    ex.DeactivateEvent = DeactivateEvent;
    /**
     * Event thrown on an [[Actor]] when it completely leaves the screen.
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
     * Event thrown on an [[Actor]] when it completely leaves the screen.
     */
    var EnterViewPortEvent = (function (_super) {
        __extends(EnterViewPortEvent, _super);
        function EnterViewPortEvent() {
            _super.call(this);
        }
        return EnterViewPortEvent;
    })(GameEvent);
    ex.EnterViewPortEvent = EnterViewPortEvent;
})(ex || (ex = {}));
/// <reference path="Events.ts" />
var ex;
(function (ex) {
    /**
     * Excalibur's internal event dispatcher implementation.
     * Callbacks are fired immediately after an event is published.
     * Typically you will use [[Class.eventDispatcher]] since most classes in
     * Excalibur inherit from [[Class]]. You will rarely create an `EventDispatcher`
     * yourself.
     *
     * When working with events, be sure to keep in mind the order of subscriptions
     * and try not to create a situation that requires specific things to happen in
     * order. Events are best used for input events, tying together disparate objects,
     * or for UI updates.
     *
     * ## Example: Actor events
     *
     * Actors implement an EventDispatcher ([[Actor.eventDispatcher]]) so they can
     * send and receive events. For example, they can enable Pointer events (mouse/touch)
     * and you can respond to them by subscribing to the event names.
     *
     * You can also emit any other kind of event for your game just by using a custom
     * `string` value and implementing a class that inherits from [[GameEvent]].
     *
     * ```js
     * var player = new ex.Actor(...);
     *
     * // Enable pointer events for this actor
     * player.enableCapturePointer = true;
     *
     * // subscribe to pointerdown event
     * player.on("pointerdown", function (evt: ex.Input.PointerEvent) {
     *   console.log("Player was clicked!");
     * });
     *
     * // turn off subscription
     * player.off("pointerdown");
     *
     * // subscribe to custom event
     * player.on("death", function (evt) {
     *   console.log("Player died:", evt);
     * });
     *
     * // trigger custom event
     * player.emit("death", new DeathEvent());
     *
     * ```
     *
     * ## Example: Pub/Sub with Excalibur
     *
     * You can also create an EventDispatcher for any arbitrary object, for example
     * a global game event aggregator (shown below as `vent`). Anything in your game can subscribe to
     * it, if the event aggregator is in the global scope.
     *
     * *Warning:* This can easily get out of hand. Avoid this usage, it just serves as
     * an example.
     *
     * ```js
     * // create a publisher on an empty object
     * var vent = new ex.EventDispatcher({});
     *
     * // handler for an event
     * var subscription = function (event) {
     *   console.log(event);
     * }
     *
     * // add a subscription
     * vent.subscribe("someevent", subscription);
     *
     * // publish an event somewhere in the game
     * vent.emit("someevent", new ex.GameEvent());
     * ```
     */
    var EventDispatcher = (function () {
        /**
         * @param target  The object that will be the recipient of events from this event dispatcher
         */
        function EventDispatcher(target) {
            this._handlers = {};
            this._wiredEventDispatchers = [];
            this._log = ex.Logger.getInstance();
            this._target = target;
        }
        /**
         * Publish an event for target
         * @param eventName  The name of the event to publish
         * @param event      Optionally pass an event data object to the handler
         *
         * @obsolete Use [[emit]] instead.
         */
        EventDispatcher.prototype.publish = function (eventName, event) {
            if (!eventName) {
                // key not mapped
                return;
            }
            eventName = eventName.toLowerCase();
            var target = this._target;
            if (!event) {
                event = new ex.GameEvent();
            }
            event.target = target;
            var i, len;
            if (this._handlers[eventName]) {
                i = 0;
                len = this._handlers[eventName].length;
                for (i; i < len; i++) {
                    this._handlers[eventName][i].call(target, event);
                }
            }
            i = 0;
            len = this._wiredEventDispatchers.length;
            for (i; i < len; i++) {
                this._wiredEventDispatchers[i].emit(eventName, event);
            }
        };
        /**
         * Alias for [[publish]], publishes an event for target
         * @param eventName  The name of the event to publish
         * @param event      Optionally pass an event data object to the handler
         */
        EventDispatcher.prototype.emit = function (eventName, event) {
            this.publish(eventName, event);
        };
        /**
         * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
         * @param eventName  The name of the event to subscribe to
         * @param handler    The handler callback to fire on this event
         */
        EventDispatcher.prototype.subscribe = function (eventName, handler) {
            eventName = eventName.toLowerCase();
            if (!this._handlers[eventName]) {
                this._handlers[eventName] = [];
            }
            this._handlers[eventName].push(handler);
            // meta event handlers
            if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
                this.emit('subscribe', new ex.SubscribeEvent(eventName, handler));
            }
        };
        /**
         * Unsubscribe an event handler(s) from an event. If a specific handler
         * is specified for an event, only that handler will be unsubscribed.
         * Otherwise all handlers will be unsubscribed for that event.
         *
         * @param eventName  The name of the event to unsubscribe
         * @param handler    Optionally the specific handler to unsubscribe
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
                    this._handlers[eventName].splice(index, 1);
                }
            }
            // meta event handlers
            if (eventName !== 'unsubscribe' && eventName !== 'subscribe') {
                this.emit('unsubscribe', new ex.UnsubscribeEvent(eventName, handler));
            }
        };
        /**
         * Wires this event dispatcher to also recieve events from another
         */
        EventDispatcher.prototype.wire = function (eventDispatcher) {
            eventDispatcher._wiredEventDispatchers.push(this);
        };
        /**
         * Unwires this event dispatcher from another
         */
        EventDispatcher.prototype.unwire = function (eventDispatcher) {
            var index = eventDispatcher._wiredEventDispatchers.indexOf(this);
            if (index > -1) {
                eventDispatcher._wiredEventDispatchers.splice(index, 1);
            }
        };
        return EventDispatcher;
    })();
    ex.EventDispatcher = EventDispatcher;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Provides standard colors (e.g. [[Color.Black]])
     * but you can also create custom colors using RGB, HSL, or Hex. Also provides
     * useful color operations like [[Color.lighten]], [[Color.darken]], and more.
     *
     * ## Creating colors
     *
     * ```js
     * // RGBA
     * new ex.Color(r, g, b, a);
     * ex.Color.fromRGB(r, g, b, a);
     *
     * // HSLA
     * ex.Color.fromHSL(h, s, l, a);
     *
     * // Hex, alpha optional
     * ex.Color.fromHex("#000000");
     * ex.Color.fromHex("#000000FF");
     * ```
     *
     * ## Working with colors
     *
     * Since Javascript does not support structs, if you change a color "constant" like [[Color.Black]]
     * it will change it across the entire game. You can safely use the color operations
     * like [[Color.lighten]] and [[Color.darken]] because they `clone` the color to
     * return a new color. However, be aware that this can use up memory if used excessively.
     *
     * Just be aware that if you directly alter properties (i.e. [[Color.r]], etc.) , this will change it
     * for all the code that uses that instance of Color.
     */
    var Color = (function () {
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        function Color(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = (a != null ? a : 1);
        }
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        Color.fromRGB = function (r, g, b, a) {
            return new Color(r, g, b, a);
        };
        /**
         * Creates a new inscance of Color from a hex string
         *
         * @param hex  CSS color string of the form #ffffff, the alpha component is optional
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
                throw new Error('Invalid hex string: ' + hex);
            }
        };
        /**
         * Creats a new instance of Color from hsla values
         *
         * @param h  Hue is represented [0-1]
         * @param s  Saturation is represented [0-1]
         * @param l  Luminance is represented [0-1]
         * @param a  Alpha is represented [0-1]
         */
        Color.fromHSL = function (h, s, l, a) {
            if (a === void 0) { a = 1.0; }
            var temp = new HSLColor(h, s, l, a);
            return temp.toRGBA();
        };
        /**
         * Lightens the current color by a specified amount
         *
         * @param factor  The amount to lighten by [0-1]
         */
        Color.prototype.lighten = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
            temp.l += (temp.l * factor);
            return temp.toRGBA();
        };
        /**
         * Darkens the current color by a specified amount
         *
         * @param factor  The amount to darken by [0-1]
         */
        Color.prototype.darken = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
            temp.l -= (temp.l * factor);
            return temp.toRGBA();
        };
        /**
         * Saturates the current color by a specified amount
         *
         * @param factor  The amount to saturate by [0-1]
         */
        Color.prototype.saturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
            temp.s += (temp.s * factor);
            return temp.toRGBA();
        };
        /**
         * Desaturates the current color by a specified amount
         *
         * @param factor  The amount to desaturate by [0-1]
         */
        Color.prototype.desaturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            var temp = HSLColor.fromRGBA(this.r, this.g, this.b, this.a);
            temp.s -= (temp.s * factor);
            return temp.toRGBA();
        };
        /**
         * Multiplies a color by another, results in a darker color
         *
         * @param color  The other color
         */
        Color.prototype.mulitiply = function (color) {
            var newR = ((color.r / 255 * this.r / 255) * 255);
            var newG = ((color.g / 255 * this.g / 255) * 255);
            var newB = ((color.b / 255 * this.b / 255) * 255);
            var newA = (color.a * this.a);
            return new Color(newR, newG, newB, newA);
        };
        /**
         * Screens a color by another, results in a lighter color
         *
         * @param color  The other color
         */
        Color.prototype.screen = function (color) {
            var color1 = color.invert();
            var color2 = color.invert();
            return color1.mulitiply(color2).invert();
        };
        /**
         * Inverts the current color
         */
        Color.prototype.invert = function () {
            return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1.0 - this.a);
        };
        /**
         * Averages the current color with another
         *
         * @param color  The other color
         */
        Color.prototype.average = function (color) {
            var newR = (color.r + this.r) / 2;
            var newG = (color.g + this.g) / 2;
            var newB = (color.b + this.b) / 2;
            var newA = (color.a + this.a) / 2;
            return new Color(newR, newG, newB, newA);
        };
        /**
         * Returns a CSS string representation of a color.
         */
        Color.prototype.toString = function () {
            var result = String(this.r.toFixed(0)) + ', ' + String(this.g.toFixed(0)) + ', ' + String(this.b.toFixed(0));
            if (this.a !== undefined || this.a !== null) {
                return 'rgba(' + result + ', ' + String(this.a) + ')';
            }
            return 'rgb(' + result + ')';
        };
        /**
         * Returns a CSS string representation of a color.
         */
        Color.prototype.fillStyle = function () {
            return this.toString();
        };
        /**
         * Returns a clone of the current color.
         */
        Color.prototype.clone = function () {
            return new Color(this.r, this.g, this.b, this.a);
        };
        /**
         * Black (#000000)
         */
        Color.Black = Color.fromHex('#000000');
        /**
         * White (#FFFFFF)
         */
        Color.White = Color.fromHex('#FFFFFF');
        /**
         * Gray (#808080)
         */
        Color.Gray = Color.fromHex('#808080');
        /**
         * Light gray (#D3D3D3)
         */
        Color.LightGray = Color.fromHex('#D3D3D3');
        /**
         * Dark gray (#A9A9A9)
         */
        Color.DarkGray = Color.fromHex('#A9A9A9');
        /**
         * Yellow (#FFFF00)
         */
        Color.Yellow = Color.fromHex('#FFFF00');
        /**
         * Orange (#FFA500)
         */
        Color.Orange = Color.fromHex('#FFA500');
        /**
         * Red (#FF0000)
         */
        Color.Red = Color.fromHex('#FF0000');
        /**
         * Vermillion (#FF5B31)
         */
        Color.Vermillion = Color.fromHex('#FF5B31');
        /**
         * Rose (#FF007F)
         */
        Color.Rose = Color.fromHex('#FF007F');
        /**
         * Magenta (#FF00FF)
         */
        Color.Magenta = Color.fromHex('#FF00FF');
        /**
         * Violet (#7F00FF)
         */
        Color.Violet = Color.fromHex('#7F00FF');
        /**
         * Blue (#0000FF)
         */
        Color.Blue = Color.fromHex('#0000FF');
        /**
         * Azure (#007FFF)
         */
        Color.Azure = Color.fromHex('#007FFF');
        /**
         * Cyan (#00FFFF)
         */
        Color.Cyan = Color.fromHex('#00FFFF');
        /**
         * Viridian (#59978F)
         */
        Color.Viridian = Color.fromHex('#59978F');
        /**
         * Green (#00FF00)
         */
        Color.Green = Color.fromHex('#00FF00');
        /**
         * Chartreuse (#7FFF00)
         */
        Color.Chartreuse = Color.fromHex('#7FFF00');
        /**
         * Transparent (#FFFFFF00)
         */
        Color.Transparent = Color.fromHex('#FFFFFF00');
        return Color;
    })();
    ex.Color = Color;
    /**
     * Internal HSL Color representation
     *
     * http://en.wikipedia.org/wiki/HSL_and_HSV
     * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
     */
    var HSLColor = (function () {
        function HSLColor(h, s, l, a) {
            this.h = h;
            this.s = s;
            this.l = l;
            this.a = a;
        }
        HSLColor.fromRGBA = function (r, g, b, a) {
            r /= 255;
            g /= 255;
            b /= 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0; // achromatic
            }
            else {
                var d = max - min;
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
        };
        HSLColor.prototype.toRGBA = function () {
            var r, g, b;
            if (this.s === 0) {
                r = g = b = this.l; // achromatic
            }
            else {
                function hue2rgb(p, q, t) {
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
                var q = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
                var p = 2 * this.l - q;
                r = hue2rgb(p, q, this.h + 1 / 3);
                g = hue2rgb(p, q, this.h);
                b = hue2rgb(p, q, this.h - 1 / 3);
            }
            return new Color(r * 255, g * 255, b * 255, this.a);
        };
        return HSLColor;
    })();
})(ex || (ex = {}));
/// <reference path="Actor.ts" />
var ex;
(function (ex) {
    /**
     * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
     * not participate in collisions. Drawn on top of all other actors.
     */
    var UIActor = (function (_super) {
        __extends(UIActor, _super);
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         */
        function UIActor(x, y, width, height) {
            _super.call(this, x, y, width, height);
            this.traits = [];
            this.traits.push(new ex.Traits.Movement());
            this.traits.push(new ex.Traits.CapturePointer());
            this.anchor.setTo(0, 0);
            this.collisionType = ex.CollisionType.PreventCollision;
            this.enableCapturePointer = true;
        }
        UIActor.prototype.onInitialize = function (engine) {
            this._engine = engine;
        };
        UIActor.prototype.contains = function (x, y, useWorld) {
            if (useWorld === void 0) { useWorld = true; }
            if (useWorld) {
                return _super.prototype.contains.call(this, x, y);
            }
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
     * Triggers
     *
     * Triggers are a method of firing arbitrary code on collision. These are useful
     * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
     * are invisible, and can only be seen when [[Engine.isDebug]] is set to `true`.
     *
     * ## Creating a trigger
     *
     * ```js
     * var game = new ex.Game();
     *
     * // create a handler
     * function onTrigger() {
     *
     *   // `this` will be the Trigger instance
     *   ex.Logger.getInstance().info("Trigger was triggered!", this);
     * }
     *
     * // set a trigger at (100, 100) that is 40x40px
     * var trigger = new ex.Trigger(100, 100, 40, 40, onTrigger, 1);
     *
     * // create an actor across from the trigger
     * var actor = new ex.Actor(100, 0, 40, 40, ex.Color.Red);
     *
     * // tell the actor to move towards the trigger over 3 seconds
     * actor.moveTo(100, 200, 3000);
     *
     * game.add(trigger);
     * game.add(actor);
     *
     * game.start();
     * ```
     */
    var Trigger = (function (_super) {
        __extends(Trigger, _super);
        /**
         * @param x       The x position of the trigger
         * @param y       The y position of the trigger
         * @param width   The width of the trigger
         * @param height  The height of the trigger
         * @param action  Callback to fire when trigger is activated, `this` will be bound to the Trigger instance
         * @param repeats The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
         */
        function Trigger(x, y, width, height, action, repeats) {
            _super.call(this, x, y, width, height);
            this._action = function () { return; };
            this.repeats = 1;
            this.target = null;
            this.repeats = repeats || this.repeats;
            this._action = action || this._action;
            this.collisionType = ex.CollisionType.PreventCollision;
            this.eventDispatcher = new ex.EventDispatcher(this);
            this.actionQueue = new ex.Internal.Actions.ActionQueue(this);
        }
        Trigger.prototype.update = function (engine, delta) {
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
                    this._dispatchAction();
                }
            }
            else {
                for (var i = 0; i < engine.currentScene.children.length; i++) {
                    var other = engine.currentScene.children[i];
                    if (other !== this &&
                        other.collisionType !== ex.CollisionType.PreventCollision &&
                        this.collides(other)) {
                        this._dispatchAction();
                    }
                }
            }
            // remove trigger if its done, -1 repeat forever
            if (this.repeats === 0) {
                this.kill();
            }
        };
        Trigger.prototype._dispatchAction = function () {
            this._action.call(this);
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
            bb.left = bb.left - this.getWorldX();
            bb.right = bb.right - this.getWorldX();
            bb.top = bb.top - this.getWorldY();
            bb.bottom = bb.bottom - this.getWorldY();
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
/// <reference path="Util/Util.ts" />
/// <reference path="Actor.ts" />
var ex;
(function (ex) {
    /**
     * An enum that represents the types of emitter nozzles
     */
    (function (EmitterType) {
        /**
         * Constant for the circular emitter type
         */
        EmitterType[EmitterType["Circle"] = 0] = "Circle";
        /**
         * Constant for the rectangular emitter type
         */
        EmitterType[EmitterType["Rectangle"] = 1] = "Rectangle";
    })(ex.EmitterType || (ex.EmitterType = {}));
    var EmitterType = ex.EmitterType;
    /**
     * Particle is used in a [[ParticleEmitter]]
     */
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
            this._rRate = 1;
            this._gRate = 1;
            this._bRate = 1;
            this._aRate = 0;
            this._currentColor = ex.Color.White.clone();
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
            this._currentColor = this.beginColor.clone();
            this.position = position || this.position;
            this.velocity = velocity || this.velocity;
            this.acceleration = acceleration || this.acceleration;
            this._rRate = (this.endColor.r - this.beginColor.r) / this.life;
            this._gRate = (this.endColor.g - this.beginColor.g) / this.life;
            this._bRate = (this.endColor.b - this.beginColor.b) / this.life;
            this._aRate = this.opacity / this.life;
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
                this.opacity = ex.Util.clamp(this._aRate * this.life, 0.0001, 1);
            }
            if ((this.startSize > 0) && (this.endSize > 0)) {
                this.particleSize = ex.Util.clamp(this.sizeRate * delta + this.particleSize, Math.min(this.startSize, this.endSize), Math.max(this.startSize, this.endSize));
            }
            this._currentColor.r = ex.Util.clamp(this._currentColor.r + this._rRate * delta, 0, 255);
            this._currentColor.g = ex.Util.clamp(this._currentColor.g + this._gRate * delta, 0, 255);
            this._currentColor.b = ex.Util.clamp(this._currentColor.b + this._bRate * delta, 0, 255);
            this._currentColor.a = ex.Util.clamp(this.opacity, 0.0001, 1);
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
                this.particleSprite.rotation = this.currentRotation;
                this.particleSprite.scale.setTo(this.particleSize, this.particleSize);
                this.particleSprite.draw(ctx, this.position.x, this.position.y);
                return;
            }
            this._currentColor.a = ex.Util.clamp(this.opacity, 0.0001, 1);
            ctx.fillStyle = this._currentColor.toString();
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.particleSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        };
        return Particle;
    })();
    ex.Particle = Particle;
    /**
     * Particle Emitters
     *
     * Using a particle emitter is a great way to create interesting effects
     * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
     * extend [[Actor]] allowing you to use all of the features that come with.
     *
     * The easiest way to create a `ParticleEmitter` is to use the
     * [Particle Tester](http://excaliburjs.com/particle-tester/) to generate code for emitters.
     *
     * ## Example: Adding an emitter
     *
     * ```js
     * var actor = new ex.Actor(...);
     * var emitter = new ex.ParticleEmitter(...);
     *
     * emitter.emitterType = ex.EmitterType.Circle; // Shape of emitter nozzle
     * emitter.radius = 5;
     * emitter.minVel = 100;
     * emitter.maxVel = 200;
     * emitter.minAngle = 0;
     * emitter.maxAngle = Math.PI * 2;
     * emitter.emitRate = 300; // 300 particles/second
     * emitter.opacity = 0.5;
     * emitter.fadeFlag = true; // fade particles overtime
     * emitter.particleLife = 1000; // in milliseconds = 1 sec
     * emitter.maxSize = 10; // in pixels
     * emitter.minSize = 1;
     * emitter.particleColor = ex.Color.Rose;
     *
     * // set emitter settings
     * emitter.isEmitting = true;  // should the emitter be emitting
     *
     * // add the emitter as a child actor, it will draw on top of the parent actor
     * // and move with the parent
     * actor.add(emitter);
     *
     * // or, alternatively, add it to the current scene
     * engine.add(emitter);
     * ```
     */
    var ParticleEmitter = (function (_super) {
        __extends(ParticleEmitter, _super);
        /**
         * @param x       The x position of the emitter
         * @param y       The y position of the emitter
         * @param width   The width of the emitter
         * @param height  The height of the emitter
         */
        function ParticleEmitter(x, y, width, height) {
            _super.call(this, x, y, width, height, ex.Color.White);
            this._particlesToEmit = 0;
            this.numParticles = 0;
            /**
             * Gets or sets the isEmitting flag
             */
            this.isEmitting = true;
            /**
             * Gets or sets the backing particle collection
             */
            this.particles = null;
            /**
             * Gets or sets the backing deadParticle collection
             */
            this.deadParticles = null;
            /**
             * Gets or sets the minimum partical velocity
             */
            this.minVel = 0;
            /**
             * Gets or sets the maximum partical velocity
             */
            this.maxVel = 0;
            /**
             * Gets or sets the acceleration vector for all particles
             */
            this.acceleration = new ex.Vector(0, 0);
            /**
             * Gets or sets the minimum angle in radians
             */
            this.minAngle = 0;
            /**
             * Gets or sets the maximum angle in radians
             */
            this.maxAngle = 0;
            /**
             * Gets or sets the emission rate for particles (particles/sec)
             */
            this.emitRate = 1; //particles/sec
            /**
             * Gets or sets the life of each particle in milliseconds
             */
            this.particleLife = 2000;
            /**
             * Gets or sets the opacity of each particle from 0 to 1.0
             */
            this.opacity = 1;
            /**
             * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
             */
            this.fadeFlag = false;
            /**
             * Gets or sets the optional focus where all particles should accelerate towards
             */
            this.focus = null;
            /**
             * Gets or sets the acceleration for focusing particles if a focus has been specified
             */
            this.focusAccel = 1;
            /*
             * Gets or sets the optional starting size for the particles
             */
            this.startSize = null;
            /*
             * Gets or sets the optional ending size for the particles
             */
            this.endSize = null;
            /**
             * Gets or sets the minimum size of all particles
             */
            this.minSize = 5;
            /**
             * Gets or sets the maximum size of all particles
             */
            this.maxSize = 5;
            /**
             * Gets or sets the beginning color of all particles
             */
            this.beginColor = ex.Color.White;
            /**
             * Gets or sets the ending color of all particles
             */
            this.endColor = ex.Color.White;
            /**
             * Gets or sets the sprite that a particle should use
             * @warning Performance intensive
             */
            this.particleSprite = null;
            /**
             * Gets or sets the emitter type for the particle emitter
             */
            this.emitterType = EmitterType.Rectangle;
            /**
             * Gets or sets the emitter radius, only takes effect when the [[emitterType]] is [[EmitterType.Circle]]
             */
            this.radius = 0;
            /**
             * Gets or sets the particle rotational speed velocity
             */
            this.particleRotationalVelocity = 0;
            /**
             * Indicates whether particles should start with a random rotation
             */
            this.randomRotation = false;
            this.collisionType = ex.CollisionType.PreventCollision;
            this.particles = new ex.Util.Collection();
            this.deadParticles = new ex.Util.Collection();
            // Remove offscreen culling from particle emitters
            for (var trait in this.traits) {
                if (this.traits[trait] instanceof ex.Traits.OffscreenCulling) {
                    this.traits.splice(trait, 1);
                }
            }
        }
        ParticleEmitter.prototype.removeParticle = function (particle) {
            this.deadParticles.push(particle);
        };
        /**
         * Causes the emitter to emit particles
         * @param particleCount  Number of particles to emit right now
         */
        ParticleEmitter.prototype.emitParticles = function (particleCount) {
            for (var i = 0; i < particleCount; i++) {
                this.particles.push(this._createParticle());
            }
        };
        ParticleEmitter.prototype.clearParticles = function () {
            this.particles.clear();
        };
        // Creates a new particle given the contraints of the emitter
        ParticleEmitter.prototype._createParticle = function () {
            // todo implement emitter contraints;
            var ranX = 0;
            var ranY = 0;
            var angle = ex.Util.randomInRange(this.minAngle, this.maxAngle);
            var vel = ex.Util.randomInRange(this.minVel, this.maxVel);
            var size = this.startSize || ex.Util.randomInRange(this.minSize, this.maxSize);
            var dx = vel * Math.cos(angle);
            var dy = vel * Math.sin(angle);
            if (this.emitterType === EmitterType.Rectangle) {
                ranX = ex.Util.randomInRange(this.x, this.x + this.getWidth());
                ranY = ex.Util.randomInRange(this.y, this.y + this.getHeight());
            }
            else if (this.emitterType === EmitterType.Circle) {
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
                //var numParticles = Math.ceil(this.emitRate * delta / 1000);
                if (this._particlesToEmit > 1.0) {
                    this.emitParticles(Math.floor(this._particlesToEmit));
                    this._particlesToEmit = this._particlesToEmit - Math.floor(this._particlesToEmit);
                }
            }
            this.particles.forEach(function (p) { return p.update(delta); });
            this.deadParticles.forEach(function (p) { return _this.particles.removeElement(p); });
            this.deadParticles.clear();
        };
        ParticleEmitter.prototype.draw = function (ctx, delta) {
            // todo is there a more efficient to draw 
            // possibly use a webgl offscreen canvas and shaders to do particles?
            this.particles.forEach(function (p) { return p.draw(ctx); });
        };
        ParticleEmitter.prototype.debugDraw = function (ctx) {
            _super.prototype.debugDraw.call(this, ctx);
            ctx.fillStyle = ex.Color.Black.toString();
            ctx.fillText('Particles: ' + this.particles.count(), this.x, this.y + 20);
            if (this.focus) {
                ctx.fillRect(this.focus.x + this.x, this.focus.y + this.y, 3, 3);
                ex.Util.drawLine(ctx, 'yellow', this.focus.x + this.x, this.focus.y + this.y, _super.prototype.getCenter.call(this).x, _super.prototype.getCenter.call(this).y);
                ctx.fillText('Focus', this.focus.x + this.x, this.focus.y + this.y);
            }
        };
        return ParticleEmitter;
    })(ex.Actor);
    ex.ParticleEmitter = ParticleEmitter;
})(ex || (ex = {}));
var ex;
(function (ex) {
    /**
     * Animations
     *
     * Animations allow you to display a series of images one after another,
     * creating the illusion of change. Generally these images will come from a [[SpriteSheet]] source.
     *
     * ## Creating an animation
     *
     * Create a [[Texture]] that contains the frames of your animation. Once the texture
     * is [[Loader|loaded]], you can then generate an [[Animation]] by creating a [[SpriteSheet]]
     * and using [[SpriteSheet.getAnimationForAll]].
     *
     * ```js
     * var game = new ex.Engine();
     * var txAnimPlayerIdle = new ex.Texture("/assets/tx/anim-player-idle.png");
     *
     * // load assets
     * var loader = new ex.Loader(txAnimPlayerIdle);
     *
     * // start game
     * game.start(loader).then(function () {
     *   var player = new ex.Actor();
     *
     *   // create sprite sheet with 5 columns, 1 row, 80x80 frames
     *   var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
     *
     *   // create animation (125ms frame speed)
     *   var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
     *
     *   // add drawing to player as "idle"
     *   player.addDrawing("idle", playerIdleAnimation);
     *
     *   // add player to game
     *   game.add(player);
     * });
     * ```
     *
     * ## Sprite effects
     *
     * You can add [[SpriteEffect|sprite effects]] to an animation through methods
     * like [[Animation.invert]] or [[Animation.lighten]]. Keep in mind, since this
     * manipulates the raw pixel values of a [[Sprite]], it can have a performance impact.
     */
    var Animation = (function () {
        /**
         * Typically you will use a [[SpriteSheet]] to generate an [[Animation]].
         *
         * @param engine  Reference to the current game engine
         * @param images  An array of sprites to create the frames for the animation
         * @param speed   The number in milliseconds to display each frame in the animation
         * @param loop    Indicates whether the animation should loop after it is completed
         */
        function Animation(engine, images, speed, loop) {
            /**
             * Current frame index being shown
             */
            this.currentFrame = 0;
            this._oldTime = Date.now();
            this.anchor = new ex.Point(0.0, 0.0);
            this.rotation = 0.0;
            this.scale = new ex.Point(1, 1);
            /**
             * Indicates whether the animation should loop after it is completed
             */
            this.loop = false;
            /**
             * Indicates the frame index the animation should freeze on for a non-looping
             * animation. By default it is the last frame.
             */
            this.freezeFrame = -1;
            /**
             * Flip each frame vertically. Sets [[Sprite.flipVertical]].
             */
            this.flipVertical = false;
            /**
             * Flip each frame horizontally. Sets [[Sprite.flipHorizontal]].
             */
            this.flipHorizontal = false;
            this.width = 0;
            this.height = 0;
            this.naturalWidth = 0;
            this.naturalHeight = 0;
            this.sprites = images;
            this.speed = speed;
            this._engine = engine;
            if (loop != null) {
                this.loop = loop;
            }
            if (images && images[0]) {
                this.height = images[0] ? images[0].height : 0;
                this.width = images[0] ? images[0].width : 0;
                this.naturalWidth = images[0] ? images[0].naturalWidth : 0;
                this.naturalHeight = images[0] ? images[0].naturalHeight : 0;
                this.freezeFrame = images.length - 1;
            }
        }
        /**
         * Applies the opacity effect to a sprite, setting the alpha of all pixels to a given value
         */
        Animation.prototype.opacity = function (value) {
            this.addEffect(new ex.Effects.Opacity(value));
        };
        /**
         * Applies the grayscale effect to a sprite, removing color information.
         */
        Animation.prototype.grayscale = function () {
            this.addEffect(new ex.Effects.Grayscale());
        };
        /**
         * Applies the invert effect to a sprite, inverting the pixel colors.
         */
        Animation.prototype.invert = function () {
            this.addEffect(new ex.Effects.Invert());
        };
        /**
         * Applies the fill effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        Animation.prototype.fill = function (color) {
            this.addEffect(new ex.Effects.Fill(color));
        };
        /**
         * Applies the colorize effect to a sprite, changing the color channels of all pixesl to be the average of the original color and the
         * provided color.
         */
        Animation.prototype.colorize = function (color) {
            this.addEffect(new ex.Effects.Colorize(color));
        };
        /**
         * Applies the lighten effect to a sprite, changes the lightness of the color according to hsl
         */
        Animation.prototype.lighten = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Lighten(factor));
        };
        /**
         * Applies the darken effect to a sprite, changes the darkness of the color according to hsl
         */
        Animation.prototype.darken = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Darken(factor));
        };
        /**
         * Applies the saturate effect to a sprite, saturates the color acccording to hsl
         */
        Animation.prototype.saturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Saturate(factor));
        };
        /**
         * Applies the desaturate effect to a sprite, desaturates the color acccording to hsl
         */
        Animation.prototype.desaturate = function (factor) {
            if (factor === void 0) { factor = 0.1; }
            this.addEffect(new ex.Effects.Desaturate(factor));
        };
        /**
         * Add a [[ISpriteEffect]] manually
         */
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
        /**
         * Clear all sprite effects
         */
        Animation.prototype.clearEffects = function () {
            for (var i in this.sprites) {
                this.sprites[i].clearEffects();
            }
        };
        Animation.prototype._setAnchor = function (point) {
            //if (!this.anchor.equals(point)) {
            for (var i in this.sprites) {
                this.sprites[i].anchor.setTo(point.x, point.y);
            }
            //}
        };
        Animation.prototype._setRotation = function (radians) {
            //if (this.rotation !== radians) {
            for (var i in this.sprites) {
                this.sprites[i].rotation = radians;
            }
            //}
        };
        Animation.prototype._setScale = function (scale) {
            //if (!this.scale.equals(scale)) {
            for (var i in this.sprites) {
                this.sprites[i].scale = scale;
            }
            //}
        };
        /**
         * Resets the animation to first frame.
         */
        Animation.prototype.reset = function () {
            this.currentFrame = 0;
        };
        /**
         * Indicates whether the animation is complete, animations that loop are never complete.
         */
        Animation.prototype.isDone = function () {
            return (!this.loop && this.currentFrame >= this.sprites.length);
        };
        /**
         * Not meant to be called by game developers. Ticks the animation forward internally and
         * calculates whether to change to the frame.
         * @internal
         */
        Animation.prototype.tick = function () {
            var time = Date.now();
            if ((time - this._oldTime) > this.speed) {
                this.currentFrame = (this.loop ? (this.currentFrame + 1) % this.sprites.length : this.currentFrame + 1);
                this._oldTime = time;
            }
        };
        Animation.prototype._updateValues = function () {
            this._setAnchor(this.anchor);
            this._setRotation(this.rotation);
            this._setScale(this.scale);
        };
        /**
         * Skips ahead a specified number of frames in the animation
         * @param frames  Frames to skip ahead
         */
        Animation.prototype.skip = function (frames) {
            this.currentFrame = (this.currentFrame + frames) % this.sprites.length;
        };
        Animation.prototype.draw = function (ctx, x, y) {
            this.tick();
            this._updateValues();
            var currSprite;
            if (this.currentFrame < this.sprites.length) {
                currSprite = this.sprites[this.currentFrame];
                if (this.flipVertical) {
                    currSprite.flipVertical = this.flipVertical;
                }
                if (this.flipHorizontal) {
                    currSprite.flipHorizontal = this.flipHorizontal;
                }
                currSprite.draw(ctx, x, y);
            }
            if (this.freezeFrame !== -1 && this.currentFrame >= this.sprites.length) {
                currSprite = this.sprites[ex.Util.clamp(this.freezeFrame, 0, this.sprites.length - 1)];
                currSprite.draw(ctx, x, y);
            }
            // add the calculated width
            if (currSprite) {
                this.width = currSprite.width;
                this.height = currSprite.height;
            }
        };
        /**
         * Plays an animation at an arbitrary location in the game.
         * @param x  The x position in the game to play
         * @param y  The y position in the game to play
         */
        Animation.prototype.play = function (x, y) {
            this.reset();
            this._engine.playAnimation(this, x, y);
        };
        return Animation;
    })();
    ex.Animation = Animation;
})(ex || (ex = {}));
/// <reference path="MonkeyPatch.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Util/Log.ts" />
var ex;
(function (ex) {
    var Internal;
    (function (Internal) {
        var FallbackAudio = (function () {
            function FallbackAudio(path, volume) {
                this._log = ex.Logger.getInstance();
                this.onload = function () { return; };
                this.onprogress = function () { return; };
                this.onerror = function () { return; };
                if (window.AudioContext) {
                    this._log.debug('Using new Web Audio Api for ' + path);
                    this._soundImpl = new WebAudio(path, volume);
                }
                else {
                    this._log.debug('Falling back to Audio Element for ' + path);
                    this._soundImpl = new AudioTag(path, volume);
                }
            }
            FallbackAudio.prototype.setVolume = function (volume) {
                this._soundImpl.setVolume(volume);
            };
            FallbackAudio.prototype.setLoop = function (loop) {
                this._soundImpl.setLoop(loop);
            };
            FallbackAudio.prototype.load = function () {
                this._soundImpl.onload = this.onload;
                this._soundImpl.onprogress = this.onprogress;
                this._soundImpl.onerror = this.onerror;
                this._soundImpl.load();
            };
            FallbackAudio.prototype.isPlaying = function () {
                return this._soundImpl.isPlaying();
            };
            FallbackAudio.prototype.play = function () {
                return this._soundImpl.play();
            };
            FallbackAudio.prototype.pause = function () {
                this._soundImpl.pause();
            };
            FallbackAudio.prototype.stop = function () {
                this._soundImpl.stop();
            };
            return FallbackAudio;
        })();
        Internal.FallbackAudio = FallbackAudio;
        var AudioTag = (function () {
            function AudioTag(path, volume) {
                var _this = this;
                this.path = path;
                this._audioElements = new Array(5);
                this._loadedAudio = null;
                this._isLoaded = false;
                this._index = 0;
                this._log = ex.Logger.getInstance();
                this._isPlaying = false;
                this._currentOffset = 0;
                this.onload = function () { return; };
                this.onprogress = function () { return; };
                this.onerror = function () { return; };
                for (var i = 0; i < this._audioElements.length; i++) {
                    (function (i) {
                        _this._audioElements[i] = new Audio();
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
            AudioTag.prototype._audioLoaded = function () {
                this._isLoaded = true;
            };
            AudioTag.prototype.setVolume = function (volume) {
                var i = 0, len = this._audioElements.length;
                for (i; i < len; i++) {
                    this._audioElements[i].volume = volume;
                }
            };
            AudioTag.prototype.setLoop = function (loop) {
                var i = 0, len = this._audioElements.length;
                for (i; i < len; i++) {
                    this._audioElements[i].loop = loop;
                }
            };
            AudioTag.prototype.getLoop = function () {
                this._audioElements.some(function (a) { return a.loop; });
            };
            AudioTag.prototype.load = function () {
                var _this = this;
                var request = new XMLHttpRequest();
                request.open('GET', this.path, true);
                request.responseType = 'blob';
                request.onprogress = this.onprogress;
                request.onerror = this.onerror;
                request.onload = function (e) {
                    if (request.status !== 200) {
                        _this._log.error('Failed to load audio resource ', _this.path, ' server responded with error code', request.status);
                        _this.onerror(request.response);
                        _this._isLoaded = false;
                        return;
                    }
                    _this._loadedAudio = URL.createObjectURL(request.response);
                    _this._audioElements.forEach(function (a) {
                        a.src = _this._loadedAudio;
                    });
                    _this.onload(e);
                };
                request.send();
            };
            AudioTag.prototype.play = function () {
                var _this = this;
                this._audioElements[this._index].load();
                //this.audioElements[this.index].currentTime = this._currentOffset;
                this._audioElements[this._index].play();
                this._currentOffset = 0;
                var done = new ex.Promise();
                this._isPlaying = true;
                if (!this.getLoop()) {
                    this._audioElements[this._index].addEventListener('ended', function () {
                        _this._isPlaying = false;
                        done.resolve(true);
                    });
                }
                this._index = (this._index + 1) % this._audioElements.length;
                return done;
            };
            AudioTag.prototype.pause = function () {
                this._index = (this._index - 1 + this._audioElements.length) % this._audioElements.length;
                this._currentOffset = this._audioElements[this._index].currentTime;
                this._audioElements.forEach(function (a) {
                    a.pause();
                });
                this._isPlaying = false;
            };
            AudioTag.prototype.stop = function () {
                this._audioElements.forEach(function (a) {
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
                this._context = audioContext;
                this._volume = this._context.createGain();
                this._buffer = null;
                this._sound = null;
                this._path = '';
                this._isLoaded = false;
                this._loop = false;
                this._isPlaying = false;
                this._isPaused = false;
                this._currentOffset = 0;
                this._logger = ex.Logger.getInstance();
                this.onload = function () { return; };
                this.onprogress = function () { return; };
                this.onerror = function () { return; };
                this._path = soundPath;
                if (volume) {
                    this._volume.gain.value = ex.Util.clamp(volume, 0, 1.0);
                }
                else {
                    this._volume.gain.value = 1.0; // max volume
                }
            }
            WebAudio.prototype.setVolume = function (volume) {
                this._volume.gain.value = volume;
            };
            WebAudio.prototype.load = function () {
                var _this = this;
                var request = new XMLHttpRequest();
                request.open('GET', this._path);
                request.responseType = 'arraybuffer';
                request.onprogress = this.onprogress;
                request.onerror = this.onerror;
                request.onload = function () {
                    if (request.status !== 200) {
                        _this._logger.error('Failed to load audio resource ', _this._path, ' server responded with error code', request.status);
                        _this.onerror(request.response);
                        _this._isLoaded = false;
                        return;
                    }
                    _this._context.decodeAudioData(request.response, function (buffer) {
                        _this._buffer = buffer;
                        _this._isLoaded = true;
                        _this.onload(_this);
                    }, function (e) {
                        _this._logger.error('Unable to decode ' + _this._path +
                            ' this browser may not fully support this format, or the file may be corrupt, ' +
                            'if this is an mp3 try removing id3 tags and album art from the file.');
                        _this._isLoaded = false;
                        _this.onload(_this);
                    });
                };
                try {
                    request.send();
                }
                catch (e) {
                    console.error('Error loading sound! If this is a cross origin error, you must host your sound with your html and javascript.');
                }
            };
            WebAudio.prototype.setLoop = function (loop) {
                this._loop = loop;
            };
            WebAudio.prototype.isPlaying = function () {
                return this._isPlaying;
            };
            WebAudio.prototype.play = function () {
                var _this = this;
                if (this._isLoaded) {
                    this._sound = this._context.createBufferSource();
                    this._sound.buffer = this._buffer;
                    this._sound.loop = this._loop;
                    this._sound.connect(this._volume);
                    this._volume.connect(this._context.destination);
                    this._sound.start(0, this._currentOffset % this._buffer.duration);
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
                    if (!this._loop) {
                        this._sound.onended = (function () {
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
                        this._sound.stop(0);
                        this._currentOffset = this._context.currentTime;
                        this._isPlaying = false;
                        this._isPaused = true;
                    }
                    catch (e) {
                        this._logger.warn('The sound clip', this._path, 'has already been paused!');
                    }
                }
            };
            WebAudio.prototype.stop = function () {
                if (this._sound) {
                    try {
                        window.clearTimeout(this._playingTimer);
                        this._currentOffset = 0;
                        this._sound.stop(0);
                        this._isPlaying = false;
                        this._isPaused = false;
                    }
                    catch (e) {
                        this._logger.warn('The sound clip', this._path, 'has already been stopped!');
                    }
                }
            };
            return WebAudio;
        })();
        Internal.WebAudio = WebAudio;
    })(Internal = ex.Internal || (ex.Internal = {}));
})(ex || (ex = {}));
/// <reference path="Util/Log.ts" />
// Promises/A+ Spec http://promises-aplus.github.io/promises-spec/
var ex;
(function (ex) {
    /**
     * Valid states for a promise to be in
     */
    (function (PromiseState) {
        PromiseState[PromiseState["Resolved"] = 0] = "Resolved";
        PromiseState[PromiseState["Rejected"] = 1] = "Rejected";
        PromiseState[PromiseState["Pending"] = 2] = "Pending";
    })(ex.PromiseState || (ex.PromiseState = {}));
    var PromiseState = ex.PromiseState;
    /**
     * Promises/A+ spec implementation of promises
     *
     * Promises are used to do asynchronous work and they are useful for
     * creating a chain of actions. In Excalibur they are used for loading,
     * sounds, animation, actions, and more.
     *
     * ## A Promise Chain
     *
     * Promises can be chained together and can be useful for creating a queue
     * of functions to be called when something is done.
     *
     * The first [[Promise]] you will encounter is probably [[Engine.start]]
     * which resolves when the game has finished loading.
     *
     * ```js
     * var game = new ex.Engine();
     *
     * // perform start-up logic once game is ready
     * game.start().then(function () {
     *
     *   // start-up & initialization logic
     *
     * });
     * ```
     *
     * ## Handling errors
     *
     * You can optionally pass an error handler to [[Promise.then]] which will handle
     * any errors that occur during Promise execution.
     *
     * ```js
     * var game = new ex.Engine();
     *
     * game.start().then(
     *   // success handler
     *   function () {
     *   },
     *
     *   // error handler
     *   function (err) {
     *   }
     * );
     * ```
     *
     * Any errors that go unhandled will be bubbled up to the browser.
     */
    var Promise = (function () {
        function Promise() {
            this._state = PromiseState.Pending;
            this._successCallbacks = [];
            this._rejectCallback = function () { return; };
            this._logger = ex.Logger.getInstance();
        }
        /**
         * Wrap a value in a resolved promise
         * @param value  An optional value to wrap in a resolved promise
         */
        Promise.wrap = function (value) {
            var promise = (new Promise()).resolve(value);
            return promise;
        };
        /**
         * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
         * when at least 1 promise rejects.
         */
        Promise.join = function () {
            var promises = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                promises[_i - 0] = arguments[_i];
            }
            var joinedPromise = new Promise();
            if (!promises || !promises.length) {
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
         * @param successCallback  Call on resolution of promise
         * @param rejectCallback   Call on rejection of promise
         */
        Promise.prototype.then = function (successCallback, rejectCallback) {
            if (successCallback) {
                this._successCallbacks.push(successCallback);
                // If the promise is already resovled call immediately
                if (this.state() === PromiseState.Resolved) {
                    try {
                        successCallback.call(this, this._value);
                    }
                    catch (e) {
                        this._handleError(e);
                    }
                }
            }
            if (rejectCallback) {
                this._rejectCallback = rejectCallback;
                // If the promise is already rejected call immediately
                if (this.state() === PromiseState.Rejected) {
                    try {
                        rejectCallback.call(this, this._value);
                    }
                    catch (e) {
                        this._handleError(e);
                    }
                }
            }
            return this;
        };
        /**
         * Add an error callback to the promise
         * @param errorCallback  Call if there was an error in a callback
         */
        Promise.prototype.error = function (errorCallback) {
            if (errorCallback) {
                this._errorCallback = errorCallback;
            }
            return this;
        };
        /**
         * Resolve the promise and pass an option value to the success callbacks
         * @param value  Value to pass to the success callbacks
         */
        Promise.prototype.resolve = function (value) {
            var _this = this;
            if (this._state === PromiseState.Pending) {
                this._value = value;
                try {
                    this._state = PromiseState.Resolved;
                    this._successCallbacks.forEach(function (cb) {
                        cb.call(_this, _this._value);
                    });
                }
                catch (e) {
                    this._handleError(e);
                }
            }
            else {
                throw new Error('Cannot resolve a promise that is not in a pending state!');
            }
            return this;
        };
        /**
         * Reject the promise and pass an option value to the reject callbacks
         * @param value  Value to pass to the reject callbacks
         */
        Promise.prototype.reject = function (value) {
            if (this._state === PromiseState.Pending) {
                this._value = value;
                try {
                    this._state = PromiseState.Rejected;
                    this._rejectCallback.call(this, this._value);
                }
                catch (e) {
                    this._handleError(e);
                }
            }
            else {
                throw new Error('Cannot reject a promise that is not in a pending state!');
            }
            return this;
        };
        /**
         * Inpect the current state of a promise
         */
        Promise.prototype.state = function () {
            return this._state;
        };
        Promise.prototype._handleError = function (e) {
            if (this._errorCallback) {
                this._errorCallback.call(this, e);
            }
            else {
                // rethrow error
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
     * Generic Resources
     *
     * The [[Resource]] type allows games built in Excalibur to load generic resources.
     * For any type of remote resource it is recommended to use [[Resource]] for preloading.
     *
     * [[Resource]] is an [[ILoadable]] so it can be passed to a [[Loader]] to pre-load before
     * a level or game.
     *
     * Example usages: JSON, compressed files, blobs.
     *
     * ## Pre-loading generic resources
     *
     * ```js
     * var resLevel1 = new ex.Resource("/assets/levels/1.json", "application/json");
     * var loader = new ex.Loader(resLevel1);
     *
     * // attach a handler to process once loaded
     * resLevel1.processDownload = function (data) {
     *
     *   // process JSON
     *   var json = JSON.parse(data);
     *
     *   // create a new level (inherits Scene) with the JSON configuration
     *   var level = new Level(json);
     *
     *   // add a new scene
     *   game.add(level.name, level);
     * }
     *
     * game.start(loader);
     * ```
     */
    var Resource = (function () {
        /**
         * @param path          Path to the remote resource
         * @param responseType  The Content-Type to expect (e.g. `application/json`)
         * @param bustCache     Whether or not to cache-bust requests
         */
        function Resource(path, responseType, bustCache) {
            if (bustCache === void 0) { bustCache = true; }
            this.path = path;
            this.responseType = responseType;
            this.bustCache = bustCache;
            this.data = null;
            this.logger = ex.Logger.getInstance();
            this.onprogress = function () { return; };
            this.oncomplete = function () { return; };
            this.onerror = function () { return; };
        }
        /**
         * Returns true if the Resource is completely loaded and is ready
         * to be drawn.
         */
        Resource.prototype.isLoaded = function () {
            return !!this.data;
        };
        Resource.prototype.wireEngine = function (engine) {
            this._engine = engine;
        };
        Resource.prototype._cacheBust = function (uri) {
            var query = /\?\w*=\w*/;
            if (query.test(uri)) {
                uri += ('&__=' + Date.now());
            }
            else {
                uri += ('?__=' + Date.now());
            }
            return uri;
        };
        Resource.prototype._start = function (e) {
            this.logger.debug('Started loading resource ' + this.path);
        };
        /**
         * Begin loading the resource and returns a promise to be resolved on completion
         */
        Resource.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var request = new XMLHttpRequest();
            request.open('GET', this.bustCache ? this._cacheBust(this.path) : this.path, true);
            request.responseType = this.responseType;
            request.onloadstart = function (e) { _this._start(e); };
            request.onprogress = this.onprogress;
            request.onerror = this.onerror;
            request.onload = function (e) {
                if (request.status !== 200) {
                    _this.logger.error('Failed to load resource ', _this.path, ' server responded with error code', request.status);
                    _this.onerror(request.response);
                    complete.resolve(request.response);
                    return;
                }
                _this.data = _this.processDownload(request.response);
                _this.oncomplete();
                _this.logger.debug('Completed loading resource', _this.path);
                complete.resolve(_this.data);
            };
            request.send();
            return complete;
        };
        /**
         * Returns the loaded data once the resource is loaded
         */
        Resource.prototype.getData = function () {
            return this.data;
        };
        /**
         * This method is meant to be overriden to handle any additional
         * processing. Such as decoding downloaded audio bits.
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
/// <reference path="Util/Util.ts" />
/// <reference path="Promises.ts" />
/// <reference path="Resource.ts" />
/// <reference path="Interfaces/ILoadable.ts" />
var ex;
(function (ex) {
    /**
     * Textures
     *
     * The [[Texture]] object allows games built in Excalibur to load image resources.
     * [[Texture]] is an [[ILoadable]] which means it can be passed to a [[Loader]]
     * to pre-load before starting a level or game.
     *
     * Textures are the raw image so to add a drawing to a game, you must create
     * a [[Sprite]]. You can use [[Texture.asSprite]] to quickly generate a Sprite
     * instance.
     *
     * ## Pre-loading textures
     *
     * Pass the [[Texture]] to a [[Loader]] to pre-load the asset. Once a [[Texture]]
     * is loaded, you can generate a [[Sprite]] with it.
     *
     * ```js
     * var txPlayer = new ex.Texture("/assets/tx/player.png");
     *
     * var loader = new ex.Loader(txPlayer);
     *
     * game.start(loader).then(function () {
     *
     *   var player = new ex.Actor();
     *
     *   player.addDrawing(txPlayer);
     *
     *   game.add(player);
     * });
     * ```
     */
    var Texture = (function (_super) {
        __extends(Texture, _super);
        /**
         * @param path       Path to the image resource
         * @param bustCache  Optionally load texture with cache busting
         */
        function Texture(path, bustCache) {
            if (bustCache === void 0) { bustCache = true; }
            _super.call(this, path, 'blob', bustCache);
            this.path = path;
            this.bustCache = bustCache;
            /**
             * A [[Promise]] that resolves when the Texture is loaded.
             */
            this.loaded = new ex.Promise();
            this._isLoaded = false;
            this._sprite = null;
            this._sprite = new ex.Sprite(this, 0, 0, 0, 0);
        }
        /**
         * Returns true if the Texture is completely loaded and is ready
         * to be drawn.
         */
        Texture.prototype.isLoaded = function () {
            return this._isLoaded;
        };
        /**
         * Begins loading the texture and returns a promise to be resolved on completion
         */
        Texture.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var loaded = _super.prototype.load.call(this);
            loaded.then(function () {
                _this.image = new Image();
                _this.image.addEventListener('load', function () {
                    _this._isLoaded = true;
                    _this.width = _this._sprite.swidth = _this._sprite.naturalWidth = _this._sprite.width = _this.image.naturalWidth;
                    _this.height = _this._sprite.sheight = _this._sprite.naturalHeight = _this._sprite.height = _this.image.naturalHeight;
                    _this.loaded.resolve(_this.image);
                    complete.resolve(_this.image);
                });
                _this.image.src = _super.prototype.getData.call(_this);
            }, function () {
                complete.reject('Error loading texture.');
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
     * Sounds
     *
     * The [[Sound]] object allows games built in Excalibur to load audio
     * components, from soundtracks to sound effects. [[Sound]] is an [[ILoadable]]
     * which means it can be passed to a [[Loader]] to pre-load before a game or level.
     *
     * ## Pre-loading sounds
     *
     * Pass the [[Sound]] to a [[Loader]] to pre-load the asset. Once a [[Sound]]
     * is loaded, you can [[Sound.play|play]] it.
     *
     * ```js
     * // define multiple sources (such as mp3/wav/ogg) as a browser fallback
     * var sndPlayerDeath = new ex.Sound("/assets/snd/player-death.mp3", "/assets/snd/player-death.wav");
     *
     * var loader = new ex.Loader(sndPlayerDeath);
     *
     * game.start(loader).then(function () {
     *
     *   sndPlayerDeath.play();
     * });
     * ```
     */
    var Sound = (function () {
        /**
         * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
         */
        function Sound() {
            var paths = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paths[_i - 0] = arguments[_i];
            }
            this._logger = ex.Logger.getInstance();
            this.onprogress = function () { return; };
            this.oncomplete = function () { return; };
            this.onerror = function () { return; };
            this.onload = function () { return; };
            this._isLoaded = false;
            this._selectedFile = '';
            this._wasPlayingOnHidden = false;
            /* Chrome : MP3, WAV, Ogg
             * Firefox : WAV, Ogg,
             * IE : MP3, WAV coming soon
             * Safari MP3, WAV, Ogg
             */
            this._selectedFile = '';
            for (var i = 0; i < paths.length; i++) {
                if (Sound.canPlayFile(paths[i])) {
                    this._selectedFile = paths[i];
                    break;
                }
            }
            if (!this._selectedFile) {
                this._logger.warn('This browser does not support any of the audio files specified:', paths.join(', '));
                this._logger.warn('Attempting to use', paths[0]);
                this._selectedFile = paths[0]; // select the first specified
            }
            this.sound = new ex.Internal.FallbackAudio(this._selectedFile, 1.0);
        }
        /**
         * Whether or not the browser can play this file as HTML5 Audio
         */
        Sound.canPlayFile = function (file) {
            try {
                var a = new Audio();
                var filetype = /.*\.([A-Za-z0-9]+)$/;
                var type = file.match(filetype)[1];
                if (a.canPlayType('audio/' + type)) {
                    return true;
                }
                {
                    return false;
                }
            }
            catch (e) {
                ex.Logger.getInstance().warn('Cannot determine audio support, assuming no support for the Audio Tag', e);
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
         * @param volume  A volume value between 0-1.0
         */
        Sound.prototype.setVolume = function (volume) {
            if (this.sound) {
                this.sound.setVolume(volume);
            }
        };
        /**
         * Indicates whether the clip should loop when complete
         * @param loop  Set the looping flag
         */
        Sound.prototype.setLoop = function (loop) {
            if (this.sound) {
                this.sound.setLoop(loop);
            }
        };
        /**
         * Whether or not the sound is playing right now
         */
        Sound.prototype.isPlaying = function () {
            if (this.sound) {
                return this.sound.isPlaying();
            }
        };
        /**
         * Play the sound, returns a promise that resolves when the sound is done playing
         */
        Sound.prototype.play = function () {
            if (this.sound) {
                return this.sound.play();
            }
        };
        /**
         * Stop the sound, and do not rewind
         */
        Sound.prototype.pause = function () {
            if (this.sound) {
                this.sound.pause();
            }
        };
        /**
         * Stop the sound and rewind
         */
        Sound.prototype.stop = function () {
            if (this.sound) {
                this.sound.stop();
            }
        };
        /**
         * Returns true if the sound is loaded
         */
        Sound.prototype.isLoaded = function () {
            return this._isLoaded;
        };
        /**
         * Begins loading the sound and returns a promise to be resolved on completion
         */
        Sound.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            this._logger.debug('Started loading sound', this._selectedFile);
            this.sound.onprogress = this.onprogress;
            this.sound.onload = function () {
                _this.oncomplete();
                _this._isLoaded = true;
                _this._logger.debug('Completed loading sound', _this._selectedFile);
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
     * Pre-loading assets
     *
     * The loader provides a mechanism to preload multiple resources at
     * one time. The loader must be passed to the engine in order to
     * trigger the loading progress bar.
     *
     * The [[Loader]] itself implements [[ILoadable]] so you can load loaders.
     *
     * ## Example: Pre-loading resources for a game
     *
     * ```js
     * // create a loader
     * var loader = new ex.Loader();
     *
     * // create a resource dictionary (best practice is to keep a separate file)
     * var resources = {
     *   TextureGround: new ex.Texture("/images/textures/ground.png"),
     *   SoundDeath: new ex.Sound("/sound/death.wav", "/sound/death.mp3")
     * };
     *
     * // loop through dictionary and add to loader
     * for (var loadable in resources) {
     *   if (resources.hasOwnProperty(loadable)) {
     *     loader.addResource(loadable);
     *   }
     * }
     *
     * // start game
     * game.start(loader).then(function () {
     *   console.log("Game started!");
     * });
     * ```
     */
    var Loader = (function () {
        /**
         * @param loadables  Optionally provide the list of resources you want to load at constructor time
         */
        function Loader(loadables) {
            this._resourceList = [];
            this._index = 0;
            this._resourceCount = 0;
            this._numLoaded = 0;
            this._progressCounts = {};
            this._totalCounts = {};
            this.onprogress = function () { return; };
            this.oncomplete = function () { return; };
            this.onerror = function () { return; };
            if (loadables) {
                this.addResources(loadables);
            }
        }
        Loader.prototype.wireEngine = function (engine) {
            this._engine = engine;
        };
        /**
         * Add a resource to the loader to load
         * @param loadable  Resource to add
         */
        Loader.prototype.addResource = function (loadable) {
            var key = this._index++;
            this._resourceList.push(loadable);
            this._progressCounts[key] = 0;
            this._totalCounts[key] = 1;
            this._resourceCount++;
        };
        /**
         * Add a list of resources to the loader to load
         * @param loadables  The list of resources to load
         */
        Loader.prototype.addResources = function (loadables) {
            var i = 0, len = loadables.length;
            for (i; i < len; i++) {
                this.addResource(loadables[i]);
            }
        };
        Loader.prototype._sumCounts = function (obj) {
            var sum = 0;
            var prev = 0;
            for (var i in obj) {
                sum += obj[i] | 0;
            }
            return sum;
        };
        /**
         * Returns true if the loader has completely loaded all resources
         */
        Loader.prototype.isLoaded = function () {
            return this._numLoaded === this._resourceCount;
        };
        /**
         * Begin loading all of the supplied resources, returning a promise
         * that resolves when loading of all is complete
         */
        Loader.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var me = this;
            if (this._resourceList.length === 0) {
                me.oncomplete.call(me);
                return complete;
            }
            var progressArray = new Array(this._resourceList.length);
            var progressChunks = this._resourceList.length;
            this._resourceList.forEach(function (r, i) {
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
                    me._numLoaded++;
                    if (me._numLoaded === me._resourceCount) {
                        me.onprogress.call(me, { loaded: 100, total: 100 });
                        me.oncomplete.call(me);
                        complete.resolve();
                    }
                };
            });
            function loadNext(list, index) {
                if (!list[index]) {
                    return;
                }
                list[index].load().then(function () {
                    loadNext(list, index + 1);
                });
            }
            loadNext(this._resourceList, 0);
            return complete;
        };
        return Loader;
    })();
    ex.Loader = Loader;
})(ex || (ex = {}));
/// <reference path="Log.ts" />
var ex;
(function (ex) {
    var Detector = (function () {
        function Detector() {
            this.failedTests = [];
            // critical browser features required for ex to run
            this._criticalTests = {
                // Test canvas/2d context support
                canvasSupport: function () {
                    var elem = document.createElement('canvas');
                    return !!(elem.getContext && elem.getContext('2d'));
                },
                // Test array buffer support ex uses for downloading binary data
                arrayBufferSupport: function () {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', '/');
                    try {
                        xhr.responseType = 'arraybuffer';
                    }
                    catch (e) {
                        return false;
                    }
                    return xhr.responseType === 'arraybuffer';
                },
                // Test data urls ex uses for sprites
                dataUrlSupport: function () {
                    var canvas = document.createElement('canvas');
                    return canvas.toDataURL('image/png').indexOf('data:image/png') === 0;
                },
                // Test object url support for loading
                objectUrlSupport: function () {
                    return 'URL' in window && 'revokeObjectURL' in URL && 'createObjectURL' in URL;
                },
                // RGBA support for colors
                rgbaSupport: function () {
                    var style = document.createElement('a').style;
                    style.cssText = 'background-color:rgba(150,255,150,.5)';
                    return ('' + style.backgroundColor).indexOf('rgba') > -1;
                }
            };
            // warnings excalibur performance will be degraded
            this._warningTest = {
                webAudioSupport: function () {
                    return !!(window.AudioContext ||
                        window.webkitAudioContext ||
                        window.mozAudioContext ||
                        window.msAudioContext ||
                        window.oAudioContext);
                },
                webglSupport: function () {
                    var elem = document.createElement('canvas');
                    return !!(elem.getContext && elem.getContext('webgl'));
                }
            };
        }
        Detector.prototype.test = function () {
            // Critical test will for ex not to run
            var failedCritical = false;
            for (var test in this._criticalTests) {
                if (!this._criticalTests[test]()) {
                    this.failedTests.push(test);
                    ex.Logger.getInstance().error('Critical browser feature missing, Excalibur requires:', test);
                    failedCritical = true;
                }
            }
            if (failedCritical) {
                return false;
            }
            // Warning tests do not for ex to return false to compatibility
            for (var warning in this._warningTest) {
                if (!this._warningTest[warning]()) {
                    ex.Logger.getInstance().warn('Warning browser feature missing, Excalibur will have reduced performance:', warning);
                }
            }
            return true;
        };
        return Detector;
    })();
    ex.Detector = Detector;
})(ex || (ex = {}));
/// <reference path="Promises.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Util/Log.ts" />
var ex;
(function (ex) {
    /**
     * Excalibur's built in templating class, it is a loadable that will load
     * and html fragment from a url. Excalibur templating is very basic only
     * allowing bindings of the type `data-text="this.obj.someprop"`,
     * `data-style="color:this.obj.color.toString()"`. Bindings allow all valid
     * Javascript expressions.
     */
    var Template = (function () {
        /**
         * @param path  Location of the html template
         */
        function Template(path) {
            this.path = path;
            this._isLoaded = false;
            this.logger = ex.Logger.getInstance();
            this.onprogress = function () { return; };
            this.oncomplete = function () { return; };
            this.onerror = function () { return; };
            this._innerElement = document.createElement('div');
            this._innerElement.className = 'excalibur-template';
        }
        Template.prototype.wireEngine = function (engine) {
            this._engine = engine;
        };
        /**
         * Returns the full html template string once loaded.
         */
        Template.prototype.getTemplateString = function () {
            if (!this._isLoaded) {
                return '';
            }
            return this._htmlString;
        };
        Template.prototype._compile = function () {
            this._innerElement.innerHTML = this._htmlString;
            this._styleElements = this._innerElement.querySelectorAll('[data-style]');
            this._textElements = this._innerElement.querySelectorAll('[data-text]');
        };
        Template.prototype._evaluateExpresion = function (expression, ctx) {
            var func = new Function('return ' + expression + ';');
            var val = func.call(ctx);
            return val;
        };
        /**
         * Applies any ctx object you wish and evaluates the template.
         * Overload this method to include your favorite template library.
         * You may return either an HTML string or a Dom node.
         * @param ctx Any object you wish to apply to the template
         */
        Template.prototype.apply = function (ctx) {
            var _this = this;
            /* tslint:disable:no-string-literal */
            for (var j = 0; j < this._styleElements.length; j++) {
                (function () {
                    // poor man's json parse for things that aren't exactly json :(
                    // Extract style expressions
                    var styles = {};
                    _this._styleElements[j].dataset['style'].split(';').forEach(function (s) {
                        if (s) {
                            var vals = s.split(':');
                            styles[vals[0].trim()] = vals[1].trim();
                        }
                    });
                    // Evaluate parsed style expressions
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
                    var expression = _this._textElements[i].dataset['text'];
                    _this._textElements[i].innerText = _this._evaluateExpresion(expression, ctx);
                })();
            }
            // If the template HTML has a root element return that, otherwise use constructed root
            if (this._innerElement.children.length === 1) {
                this._innerElement = this._innerElement.firstChild;
            }
            /* tslint:enable:no-string-literal */
            return this._innerElement;
        };
        /**
         * Begins loading the template. Returns a promise that resolves with the template string when loaded.
         */
        Template.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var request = new XMLHttpRequest();
            request.open('GET', this.path, true);
            request.responseType = 'text';
            request.onprogress = this.onprogress;
            request.onerror = this.onerror;
            request.onload = function (e) {
                if (request.status !== 200) {
                    _this.logger.error('Failed to load html template resource ', _this.path, ' server responded with error code', request.status);
                    _this.onerror(request.response);
                    _this._isLoaded = false;
                    complete.resolve('error');
                    return;
                }
                _this._htmlString = request.response;
                _this.oncomplete();
                _this.logger.debug('Completed loading template', _this.path);
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
     */
    var Binding = (function () {
        /**
         * @param parentElementId  The id of the element in the dom to attach the template binding
         * @param template         The template you wish to bind
         * @param ctx              The context of the binding, which can be any object
         */
        function Binding(parentElementId, template, ctx) {
            this.parent = document.getElementById(parentElementId);
            this.template = template;
            this._ctx = ctx;
            this.update();
        }
        /**
         * Listen to any arbitrary object's events to update this binding
         * @param obj     Any object that supports addEventListener
         * @param events  A list of events to listen for
         * @param handler A optional handler to fire on any event
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
         * Update this template binding with the latest values from
         * the ctx reference passed to the constructor
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
     * Enum representing the different font size units
     * https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
     */
    (function (FontUnit) {
        /**
         * Em is a scalable unit, 1 em is equal to the current font size of the current element, parent elements can effect em values
         */
        FontUnit[FontUnit["Em"] = 0] = "Em";
        /**
         * Rem is similar to the Em, it is a scalable unit. 1 rem is eqaul to the font size of the root element
         */
        FontUnit[FontUnit["Rem"] = 1] = "Rem";
        /**
         * Pixel is a unit of length in screen pixels
         */
        FontUnit[FontUnit["Px"] = 2] = "Px";
        /**
         * Point is a physical unit length (1/72 of an inch)
         */
        FontUnit[FontUnit["Pt"] = 3] = "Pt";
        /**
         * Percent is a scalable unit similar to Em, the only difference is the Em units scale faster when Text-Size stuff
         */
        FontUnit[FontUnit["Percent"] = 4] = "Percent";
    })(ex.FontUnit || (ex.FontUnit = {}));
    var FontUnit = ex.FontUnit;
    /**
     * Enum representing the different horizontal text alignments
     */
    (function (TextAlign) {
        /**
         * The text is left-aligned.
         */
        TextAlign[TextAlign["Left"] = 0] = "Left";
        /**
         * The text is right-aligned.
         */
        TextAlign[TextAlign["Right"] = 1] = "Right";
        /**
         * The text is centered.
         */
        TextAlign[TextAlign["Center"] = 2] = "Center";
        /**
         * The text is aligned at the normal start of the line (left-aligned for left-to-right locales,
         * right-aligned for right-to-left locales).
         */
        TextAlign[TextAlign["Start"] = 3] = "Start";
        /**
         * The text is aligned at the normal end of the line (right-aligned for left-to-right locales,
         * left-aligned for right-to-left locales).
         */
        TextAlign[TextAlign["End"] = 4] = "End";
    })(ex.TextAlign || (ex.TextAlign = {}));
    var TextAlign = ex.TextAlign;
    /**
     * Enum representing the different baseline text alignments
     */
    (function (BaseAlign) {
        /**
         * The text baseline is the top of the em square.
         */
        BaseAlign[BaseAlign["Top"] = 0] = "Top";
        /**
         * The text baseline is the hanging baseline.  Currently unsupported; this will act like
         * alphabetic.
         */
        BaseAlign[BaseAlign["Hanging"] = 1] = "Hanging";
        /**
         * The text baseline is the middle of the em square.
         */
        BaseAlign[BaseAlign["Middle"] = 2] = "Middle";
        /**
         * The text baseline is the normal alphabetic baseline.
         */
        BaseAlign[BaseAlign["Alphabetic"] = 3] = "Alphabetic";
        /**
         * The text baseline is the ideographic baseline; this is the bottom of
         * the body of the characters, if the main body of characters protrudes
         * beneath the alphabetic baseline.  Currently unsupported; this will
         * act like alphabetic.
         */
        BaseAlign[BaseAlign["Ideographic"] = 4] = "Ideographic";
        /**
         * The text baseline is the bottom of the bounding box.  This differs
         * from the ideographic baseline in that the ideographic baseline
         * doesn't consider descenders.
         */
        BaseAlign[BaseAlign["Bottom"] = 5] = "Bottom";
    })(ex.BaseAlign || (ex.BaseAlign = {}));
    var BaseAlign = ex.BaseAlign;
    /**
     * Labels
     *
     * Labels are the way to draw small amounts of text to the screen. They are
     * actors and inherit all of the benifits and capabilities.
     *
     * ## Creating a Label
     *
     * You can pass in arguments to the [[Label.constructor]] or simply set the
     * properties you need after creating an instance of the [[Label]].
     *
     * Since labels are [[Actor|Actors]], they need to be added to a [[Scene]]
     * to be drawn and updated on-screen.
     *
     * ```js
     * var game = new ex.Engine();
     *
     * // constructor
     * var label = new ex.Label("Hello World", 50, 50, "10px Arial");
     *
     * // properties
     * var label = new ex.Label();
     * label.x = 50;
     * label.y = 50;
     * label.font = "10px Arial";
     * label.text = "Foo";
     * label.color = ex.Color.White;
     * label.textAlign = ex.TextAlign.Center;
     *
     * // add to current scene
     * game.add(label);
     *
     * // start game
     * game.start();
     * ```
     *
     * ## Web Fonts
     *
     * The HTML5 Canvas API draws text using CSS syntax. Because of this, web fonts
     * are fully supported. To draw a web font, follow the same procedure you use
     * for CSS. Then simply pass in the font string to the [[Label]] constructor
     * or set [[Label.font]].
     *
     * **index.html**
     *
     * ```html
     * <!doctype html>
     * <html>
     * <head>
     *   <!-- Include the web font per usual -->
     *   <script src="//google.com/fonts/foobar"></script>
     * </head>
     * <body>
     *   <canvas id="game"></canvas>
     *   <script src="game.js"></script>
     * </body>
     * </html>
     * ```
     *
     * **game.js**
     *
     * ```js
     * var game = new ex.Engine();
     *
     * var label = new ex.Label();
     * label.font = "12px Foobar, Arial, Sans-Serif";
     * label.text = "Hello World";
     *
     * game.add(label);
     * game.start();
     * ```
     *
     * ## Performance Implications
     *
     * It is recommended to use a [[SpriteFont]] for labels as the raw Canvas
     * API for drawing text is slow (`fillText`). Too many labels that
     * do not use sprite fonts will visibly affect the frame rate of your game.
     *
     * Alternatively, you can always use HTML and CSS to draw UI elements, but
     * currently Excalibur does not provide a way to easily interact with the
     * DOM. Still, this will not affect canvas performance and is a way to
     * lighten your game, if needed.
     */
    var Label = (function (_super) {
        __extends(Label, _super);
        /**
         * @param text        The text of the label
         * @param x           The x position of the label
         * @param y           The y position of the label
         * @param font        Use any valid CSS font string for the label's font. Web fonts are supported. Default is `10px sans-serif`.
         * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precendence
         * over a css font.
         */
        function Label(text, x, y, fontFamily, spriteFont) {
            _super.call(this, x, y);
            /**
             * The font size in the selected units, default is 10 (default units is pixel)
             */
            this.fontSize = 10;
            /**
             * The css units for a font size such as px, pt, em (SpriteFont only support px), by default is 'px';
             */
            this.fontUnit = FontUnit.Px;
            /**
             * Gets or sets the horizontal text alignment property for the label.
             */
            this.textAlign = TextAlign.Left;
            /**
             * Gets or sets the baseline alignment property for the label.
             */
            this.baseAlign = BaseAlign.Bottom;
            /**
             * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
             */
            this.letterSpacing = 0; //px
            /**
             * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
             */
            this.caseInsensitive = true;
            this._textShadowOn = false;
            this._shadowOffsetX = 0;
            this._shadowOffsetY = 0;
            this._shadowColor = ex.Color.Black.clone();
            this._shadowColorDirty = false;
            this._textSprites = {};
            this._shadowSprites = {};
            this._color = ex.Color.Black.clone();
            this.text = text || '';
            this.color = ex.Color.Black.clone();
            this.spriteFont = spriteFont;
            this.collisionType = ex.CollisionType.PreventCollision;
            this.fontFamily = fontFamily || '10px sans-serif'; // coallesce to default canvas font
            if (spriteFont) {
            }
        }
        /**
         * Returns the width of the text in the label (in pixels);
         * @param ctx  Rending context to measure the string with
         */
        Label.prototype.getTextWidth = function (ctx) {
            var oldFont = ctx.font;
            ctx.font = this.fontFamily;
            var width = ctx.measureText(this.text).width;
            ctx.font = oldFont;
            return width;
        };
        // TypeScript doesn't support string enums :(
        Label.prototype._lookupFontUnit = function (fontUnit) {
            switch (fontUnit) {
                case FontUnit.Em:
                    return 'em';
                case FontUnit.Rem:
                    return 'rem';
                case FontUnit.Pt:
                    return 'pt';
                case FontUnit.Px:
                    return 'px';
                case FontUnit.Percent:
                    return '%';
                default:
                    return 'px';
            }
        };
        Label.prototype._lookupTextAlign = function (textAlign) {
            switch (textAlign) {
                case TextAlign.Left:
                    return 'left';
                case TextAlign.Right:
                    return 'right';
                case TextAlign.Center:
                    return 'center';
                case TextAlign.End:
                    return 'end';
                case TextAlign.Start:
                    return 'start';
                default:
                    return 'start';
            }
        };
        Label.prototype._lookupBaseAlign = function (baseAlign) {
            switch (baseAlign) {
                case BaseAlign.Alphabetic:
                    return 'alphabetic';
                case BaseAlign.Bottom:
                    return 'bottom';
                case BaseAlign.Hanging:
                    return 'hangin';
                case BaseAlign.Ideographic:
                    return 'ideographic';
                case BaseAlign.Middle:
                    return 'middle';
                case BaseAlign.Top:
                    return 'top';
                default:
                    return 'alphabetic';
            }
        };
        /**
         * Sets the text shadow for sprite fonts
         * @param offsetX      The x offset in pixels to place the shadow
         * @param offsetY      The y offset in pixles to place the shadow
         * @param shadowColor  The color of the text shadow
         */
        Label.prototype.setTextShadow = function (offsetX, offsetY, shadowColor) {
            this.spriteFont.setTextShadow(offsetX, offsetY, shadowColor);
        };
        /**
         * Toggles text shadows on or off, only applies when using sprite fonts
         */
        Label.prototype.useTextShadow = function (on) {
            this.spriteFont.useTextShadow(on);
        };
        /**
         * Clears the current text shadow
         */
        Label.prototype.clearTextShadow = function () {
            this._textShadowOn = false;
            this._shadowOffsetX = 0;
            this._shadowOffsetY = 0;
            this._shadowColor = ex.Color.Black.clone();
        };
        Label.prototype.update = function (engine, delta) {
            _super.prototype.update.call(this, engine, delta);
            /*
           if (this.spriteFont && (this._color !== this.color || this.previousOpacity !== this.opacity)) {
              for (var character in this._textSprites) {
                 this._textSprites[character].clearEffects();
                 this._textSprites[character].fill(this.color.clone());
                 this._textSprites[character].opacity(this.opacity);
                 
              }
              this._color = this.color;
              this.previousOpacity = this.opacity;
           }
  
           if (this.spriteFont && this._textShadowOn && this._shadowColorDirty && this._shadowColor) {
              for (var characterShadow in this._shadowSprites) {
                 this._shadowSprites[characterShadow].clearEffects();
                 this._shadowSprites[characterShadow].addEffect(new Effects.Fill(this._shadowColor.clone()));
              }
              this._shadowColorDirty = false;
           }*/
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
                this.spriteFont.draw(ctx, this.text, 0, 0, {
                    color: this.color.clone(),
                    baseAlign: this.baseAlign,
                    textAlign: this.textAlign,
                    fontSize: this.fontSize,
                    letterSpacing: this.letterSpacing,
                    opacity: this.opacity
                });
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
                ctx.font = "" + this.fontSize + this._lookupFontUnit(this.fontUnit) + " " + this.fontFamily;
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
        /**
         * The type of pointer for a [[PointerEvent]].
         */
        (function (PointerType) {
            PointerType[PointerType["Touch"] = 0] = "Touch";
            PointerType[PointerType["Mouse"] = 1] = "Mouse";
            PointerType[PointerType["Pen"] = 2] = "Pen";
            PointerType[PointerType["Unknown"] = 3] = "Unknown";
        })(Input.PointerType || (Input.PointerType = {}));
        var PointerType = Input.PointerType;
        /**
         * The mouse button being pressed.
         */
        (function (PointerButton) {
            PointerButton[PointerButton["Left"] = 0] = "Left";
            PointerButton[PointerButton["Middle"] = 1] = "Middle";
            PointerButton[PointerButton["Right"] = 2] = "Right";
            PointerButton[PointerButton["Unknown"] = 3] = "Unknown";
        })(Input.PointerButton || (Input.PointerButton = {}));
        var PointerButton = Input.PointerButton;
        /**
         * Determines the scope of handling mouse/touch events. See [[Pointers]] for more information.
         */
        (function (PointerScope) {
            /**
             * Handle events on the `canvas` element only. Events originating outside the
             * `canvas` will not be handled.
             */
            PointerScope[PointerScope["Canvas"] = 0] = "Canvas";
            /**
             * Handles events on the entire document. All events will be handled by Excalibur.
             */
            PointerScope[PointerScope["Document"] = 1] = "Document";
        })(Input.PointerScope || (Input.PointerScope = {}));
        var PointerScope = Input.PointerScope;
        /**
         * Pointer events
         *
         * Represents a mouse, touch, or stylus event. See [[Pointers]] for more information on
         * handling pointer input.
         *
         * For mouse-based events, you can inspect [[PointerEvent.button]] to see what button was pressed.
         */
        var PointerEvent = (function (_super) {
            __extends(PointerEvent, _super);
            /**
             * @param x            The `x` coordinate of the event (in world coordinates)
             * @param y            The `y` coordinate of the event (in world coordinates)
             * @param index        The index of the pointer (zero-based)
             * @param pointerType  The type of pointer
             * @param button       The button pressed (if [[PointerType.Mouse]])
             * @param ev           The raw DOM event being handled
             */
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
         * Mouse and Touch (Pointers)
         *
         * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to
         * [W3C Pointer Events](http://www.w3.org/TR/pointerevents/).
         *
         * There is always at least one [[Pointer]] available ([[Pointers.primary]]) and
         * you can request multiple pointers to support multi-touch scenarios.
         *
         * Since [[Pointers.primary]] normalizes both mouse and touch events, your game
         * automatically supports touch for the primary pointer by default. When
         * you handle the events, you can customize what your game does based on the type
         * of pointer, if applicable.
         *
         * Excalibur handles mouse/touch events and normalizes them to a [[PointerEvent]]
         * that your game can subscribe to and handle (`engine.input.pointers`).
         *
         * ## Events
         *
         * You can subscribe to pointer events through `engine.input.pointers.on`. A [[PointerEvent]] object is
         * passed to your handler which offers information about the pointer input being received.
         *
         * - `down` - When a pointer is pressed down (any mouse button or finger press)
         * - `up` - When a pointer is lifted
         * - `move` - When a pointer moves (be wary of performance issues when subscribing to this)
         * - `cancel` - When a pointer event is canceled for some reason
         *
         * ```js
         * engine.input.pointers.primary.on("down", function (evt) { });
         * engine.input.pointers.primary.on("up", function (evt) { });
         * engine.input.pointers.primary.on("move", function (evt) { });
         * engine.input.pointers.primary.on("cancel", function (evt) { });
         * ```
         *
         * ## Pointer scope (window vs. canvas)
         *
         * You have the option to handle *all* pointer events in the browser by setting
         * [[IEngineOptions.pointerScope]] to [[PointerScope.Document]]. If this is enabled,
         * Excalibur will handle every pointer event in the browser. This is useful for handling
         * complex input and having control over every interaction.
         *
         * You can also use [[PointerScope.Canvas]] to only scope event handling to the game
         * canvas. This is useful if you don't care about events that occur outside the game.
         *
         * One real-world example is dragging and gestures. Sometimes a player will drag their
         * finger outside your game and then into it, expecting it to work. If [[PointerScope]]
         * is set to [[PointerScope.Canvas|Canvas]] this will not work. If it is set to
         * [[PointerScope.Document|Document]], it will.
         *
         * ## Responding to input
         *
         * The primary pointer can be a mouse, stylus, or single finger touch event. You
         * can inspect what type of pointer it is from the [[PointerEvent]] handled.
         *
         * ```js
         * engine.input.pointers.primary.on("down", function (pe) {
         *   if (pe.pointerType === ex.Input.PointerType.Mouse) {
         *     ex.Logger.getInstance().info("Mouse event:", pe);
         *   } else if (pe.pointerType === ex.Input.PointerType.Touch) {
         *     ex.Logger.getInstance().info("Touch event:", pe);
         *   }
         * });
         * ```
         *
         * ## Multiple Pointers (Multi-Touch)
         *
         * When there is more than one pointer detected on the screen,
         * this is considered multi-touch. For example, pressing one finger,
         * then another, will create two pointers. If you lift a finger,
         * the first one remains and the second one disappears.
         *
         * You can handle multi-touch by subscribing to however many pointers
         * you would like to support. If a pointer doesn't yet exist, it will
         * be created. You do not need to check if a pointer exists. If it does
         * exist, it will propogate events, otherwise it will remain idle.
         *
         * Excalibur does not impose a limit to the amount of pointers you can
         * subscribe to, so by all means, support all 10 fingers.
         *
         * *Note:* There is no way to identify touches after they happen; you can only
         * know that there are *n* touches on the screen at once.
         *
         * ```js
         * function paint(color) {
         *
         *   // create a handler for the event
         *   return function (pe) {
         *     if (pe.pointerType === ex.Input.PointerType.Touch) {
         *       engine.canvas.fillStyle = color;
         *       engine.canvas.fillRect(pe.x, pe.y, 5, 5);
         *     }
         *   }
         * }
         *
         * engine.input.pointers.at(0).on("move", paint("blue"));  // 1st finger
         * engine.input.pointers.at(1).on("move", paint("red"));   // 2nd finger
         * engine.input.pointers.at(2).on("move", paint("green")); // 3rd finger
         * ```
         *
         * ## Actor pointer events
         *
         * By default, [[Actor|Actors]] do not participate in pointer events. In other
         * words, when you "click" an Actor, it will not throw an event **for that Actor**,
         * only a generic pointer event for the game. This is to keep performance
         * high and allow actors to "opt-in" to handling pointer events. Actors will automatically
         * opt-in if a pointer related event handler is set on them `actor.on("pointerdown", () => {})` for example.
         *
         * To opt-in manually, set [[Actor.enableCapturePointer]] to `true` and the [[Actor]] will
         * start publishing `pointerup` and `pointerdown` events. `pointermove` events
         * will not be published by default due to performance implications. If you want
         * an actor to receive move events, set [[ICapturePointerConfig.captureMoveEvents]] to
         * `true`.
         *
         * Actor pointer events will be prefixed with `pointer`.
         *
         * ```js
         * var player = new ex.Actor();
         *
         * // enable propogating pointer events
         * player.enableCapturePointer = true;
         *
         * // enable move events, warning: performance intensive!
         * player.capturePointer.captureMoveEvents = true;
         *
         * // subscribe to input
         * player.on("pointerup", function (ev) {
         *   player.logger.info("Player selected!", ev);
         * });
         * ```
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
            Pointers.prototype.init = function (scope) {
                if (scope === void 0) { scope = PointerScope.Document; }
                var target = document;
                if (scope === PointerScope.Document) {
                    target = document;
                }
                else {
                    target = this._engine.canvas;
                }
                // Touch Events
                target.addEventListener('touchstart', this._handleTouchEvent('down', this._pointerDown));
                target.addEventListener('touchend', this._handleTouchEvent('up', this._pointerUp));
                target.addEventListener('touchmove', this._handleTouchEvent('move', this._pointerMove));
                target.addEventListener('touchcancel', this._handleTouchEvent('cancel', this._pointerCancel));
                // W3C Pointer Events
                // Current: IE11, IE10
                if (window.PointerEvent) {
                    // IE11
                    this._engine.canvas.style.touchAction = 'none';
                    target.addEventListener('pointerdown', this._handlePointerEvent('down', this._pointerDown));
                    target.addEventListener('pointerup', this._handlePointerEvent('up', this._pointerUp));
                    target.addEventListener('pointermove', this._handlePointerEvent('move', this._pointerMove));
                    target.addEventListener('pointercancel', this._handlePointerEvent('cancel', this._pointerMove));
                }
                else if (window.MSPointerEvent) {
                    // IE10
                    this._engine.canvas.style.msTouchAction = 'none';
                    target.addEventListener('MSPointerDown', this._handlePointerEvent('down', this._pointerDown));
                    target.addEventListener('MSPointerUp', this._handlePointerEvent('up', this._pointerUp));
                    target.addEventListener('MSPointerMove', this._handlePointerEvent('move', this._pointerMove));
                    target.addEventListener('MSPointerCancel', this._handlePointerEvent('cancel', this._pointerMove));
                }
                else {
                    // Mouse Events
                    target.addEventListener('mousedown', this._handleMouseEvent('down', this._pointerDown));
                    target.addEventListener('mouseup', this._handleMouseEvent('up', this._pointerUp));
                    target.addEventListener('mousemove', this._handleMouseEvent('move', this._pointerMove));
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
             * @param index  The pointer index to retrieve
             */
            Pointers.prototype.at = function (index) {
                if (index >= this._pointers.length) {
                    // Ensure there is a pointer to retrieve
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
                var i = 0, len = this._pointerUp.length;
                for (i; i < len; i++) {
                    if (actor.contains(this._pointerUp[i].x, this._pointerUp[i].y, !isUIActor)) {
                        actor.eventDispatcher.emit('pointerup', this._pointerUp[i]);
                    }
                }
                i = 0;
                len = this._pointerDown.length;
                for (i; i < len; i++) {
                    if (actor.contains(this._pointerDown[i].x, this._pointerDown[i].y, !isUIActor)) {
                        actor.eventDispatcher.emit('pointerdown', this._pointerDown[i]);
                    }
                }
                if (actor.capturePointer.captureMoveEvents) {
                    i = 0;
                    len = this._pointerMove.length;
                    for (i; i < len; i++) {
                        if (actor.contains(this._pointerMove[i].x, this._pointerMove[i].y, !isUIActor)) {
                            actor.eventDispatcher.emit('pointermove', this._pointerMove[i]);
                        }
                    }
                }
                i = 0;
                len = this._pointerCancel.length;
                for (i; i < len; i++) {
                    if (actor.contains(this._pointerCancel[i].x, this._pointerCancel[i].y, !isUIActor)) {
                        actor.eventDispatcher.emit('pointercancel', this._pointerCancel[i]);
                    }
                }
            };
            Pointers.prototype._handleMouseEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    var x = e.pageX - ex.Util.getPosition(_this._engine.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this._engine.canvas).y;
                    var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Point(x, y));
                    var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, 0, PointerType.Mouse, e.button, e);
                    eventArr.push(pe);
                    _this.at(0).eventDispatcher.emit(eventName, pe);
                };
            };
            Pointers.prototype._handleTouchEvent = function (eventName, eventArr) {
                var _this = this;
                return function (e) {
                    e.preventDefault();
                    for (var i = 0, len = e.changedTouches.length; i < len; i++) {
                        var index = _this._pointers.length > 1 ? _this._getPointerIndex(e.changedTouches[i].identifier) : 0;
                        if (index === -1) {
                            continue;
                        }
                        var x = e.changedTouches[i].pageX - ex.Util.getPosition(_this._engine.canvas).x;
                        var y = e.changedTouches[i].pageY - ex.Util.getPosition(_this._engine.canvas).y;
                        var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Point(x, y));
                        var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, PointerType.Touch, PointerButton.Unknown, e);
                        eventArr.push(pe);
                        _this.at(index).eventDispatcher.emit(eventName, pe);
                        // only with multi-pointer
                        if (_this._pointers.length > 1) {
                            if (eventName === 'up') {
                                // remove pointer ID from pool when pointer is lifted
                                _this._activePointers[index] = -1;
                            }
                            else if (eventName === 'down') {
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
                    if (index === -1) {
                        return;
                    }
                    var x = e.pageX - ex.Util.getPosition(_this._engine.canvas).x;
                    var y = e.pageY - ex.Util.getPosition(_this._engine.canvas).y;
                    var transformedPoint = _this._engine.screenToWorldCoordinates(new ex.Point(x, y));
                    var pe = new PointerEvent(transformedPoint.x, transformedPoint.y, index, _this._stringToPointerType(e.pointerType), e.button, e);
                    eventArr.push(pe);
                    _this.at(index).eventDispatcher.emit(eventName, pe);
                    // only with multi-pointer
                    if (_this._pointers.length > 1) {
                        if (eventName === 'up') {
                            // remove pointer ID from pool when pointer is lifted
                            _this._activePointers[index] = -1;
                        }
                        else if (eventName === 'down') {
                            // set pointer ID to given index
                            _this._activePointers[index] = e.pointerId;
                        }
                    }
                };
            };
            /**
             * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
             * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
             */
            Pointers.prototype._getPointerIndex = function (pointerId) {
                var idx;
                if ((idx = this._activePointers.indexOf(pointerId)) > -1) {
                    return idx;
                }
                for (var i = 0; i < this._activePointers.length; i++) {
                    if (this._activePointers[i] === -1) {
                        return i;
                    }
                }
                // ignore pointer because game isn't watching
                return -1;
            };
            Pointers.prototype._stringToPointerType = function (s) {
                switch (s) {
                    case 'touch':
                        return PointerType.Touch;
                    case 'mouse':
                        return PointerType.Mouse;
                    case 'pen':
                        return PointerType.Pen;
                    default:
                        return PointerType.Unknown;
                }
            };
            return Pointers;
        })(ex.Class);
        Input.Pointers = Pointers;
        /**
         * Captures and dispatches PointerEvents
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
         */
        (function (Keys) {
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
            Keys[Keys["Numlock"] = 144] = "Numlock";
            Keys[Keys["Semicolon"] = 186] = "Semicolon";
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
         */
        var KeyEvent = (function (_super) {
            __extends(KeyEvent, _super);
            /**
             * @param key  The key responsible for throwing the event
             */
            function KeyEvent(key) {
                _super.call(this);
                this.key = key;
            }
            return KeyEvent;
        })(ex.GameEvent);
        Input.KeyEvent = KeyEvent;
        /**
         * Keyboard input
         *
         * Working with the keyboard is easy in Excalibur. You can inspect
         * whether a button was just [[Keyboard.wasPressed|pressed]] or [[Keyboard.wasReleased|released]] this frame, or
         * if the key is currently being [[Keyboard.isHeld|held]] down. Common keys are held in the [[Input.Keys]]
         * enumeration but you can pass any character code to the methods.
         *
         * Excalibur subscribes to the browser events and keeps track of
         * what keys are currently held, released, or pressed. A key can be held
         * for multiple frames, but a key cannot be pressed or released for more than one subsequent
         * update frame.
         *
         * ## Inspecting the keyboard
         *
         * You can inspect [[Engine.input]] to see what the state of the keyboard
         * is during an update.
         *
         * It is recommended that keyboard actions that directly effect actors be handled like so to improve code quality:
         * ```ts
         * class Player extends ex.Actor {
         *   public update(engine, delta) {
         *
         *     if (engine.input.keyboard.isHeld(ex.Input.Keys.W) ||
         *         engine.input.keyboard.isHeld(ex.Input.Keys.Up)) {
         *
         *       player._moveForward();
         *     }
         *
         *     if (engine.input.keyboard.wasPressed(ex.Input.Keys.Right)) {
         *       player._fire();
         *     }
         *   }
         * }
         * ```
         * ## Events
         * You can subscribe to keyboard events through `engine.input.keyboard.on`. A [[KeyEvent]] object is
         * passed to your handler which offers information about the key that was part of the event.
         *
         * - `press` - When a key was just pressed this frame
         * - `release` - When a key was just released this frame
         * - `hold` - Whenever a key is in the down position
         *
         * ```ts
         * engine.input.pointers.primary.on("press", (evt: KeyEvent) => {...});
         * engine.input.pointers.primary.on("release", (evt: KeyEvent) => {...});
         * engine.input.pointers.primary.on("hold", (evt: KeyEvent) => {...});
         * ```
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
                    // alias the old api, we may want to deprecate this in the future
                    _this.eventDispatcher.emit('up', keyEvent);
                    _this.eventDispatcher.emit('release', keyEvent);
                });
                // key down is on window because canvas cannot have focus
                window.addEventListener('keydown', function (ev) {
                    if (_this._keys.indexOf(ev.keyCode) === -1) {
                        _this._keys.push(ev.keyCode);
                        _this._keysDown.push(ev.keyCode);
                        var keyEvent = new KeyEvent(ev.keyCode);
                        _this.eventDispatcher.emit('down', keyEvent);
                        _this.eventDispatcher.emit('press', keyEvent);
                    }
                });
            };
            Keyboard.prototype.update = function (delta) {
                // Reset keysDown and keysUp after update is complete
                this._keysDown.length = 0;
                this._keysUp.length = 0;
                // Emit synthetic "hold" event
                for (var i = 0; i < this._keys.length; i++) {
                    this.eventDispatcher.emit('hold', new KeyEvent(this._keys[i]));
                }
            };
            /**
             * Gets list of keys being pressed down
             */
            Keyboard.prototype.getKeys = function () {
                return this._keys;
            };
            /**
             * Tests if a certain key was just pressed this frame. This is cleared at the end of the update frame.
             * @param key Test wether a key was just pressed
             */
            Keyboard.prototype.wasPressed = function (key) {
                return this._keysDown.indexOf(key) > -1;
            };
            /**
             * Tests if a certain key is held down. This is persisted between frames.
             * @param key  Test wether a key is held down
             */
            Keyboard.prototype.isHeld = function (key) {
                return this._keys.indexOf(key) > -1;
            };
            /**
             * Tests if a certain key was just released this frame. This is cleared at the end of the update frame.
             * @param key  Test wether a key was just released
             */
            Keyboard.prototype.wasReleased = function (key) {
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
         * Controller Support (Gamepads)
         *
         * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
         * to provide controller support for your games.
         *
         * You can query any [[Gamepad|Gamepads]] that are connected or listen to events ("button" and "axis").
         *
         * You must opt-in to controller support ([[Gamepads.enabled]]) because it is a polling-based
         * API, so we have to check it each update frame. If an gamepad related event handler is set, you will
         * automatically opt-in to controller polling.
         *
         * HTML5 Gamepad API only supports a maximum of 4 gamepads. You can access them using the [[Gamepads.at]] method. If a [[Gamepad]] is
         * not connected, it will simply not throw events.
         *
         * ## Gamepad Filtering
         *
         * Different browsers/devices are sometimes loose about the devices they consider Gamepads, you can set minimum device requirements with
         * `engine.inpute.gamepads.setMinimumGamepadConfiguration` so that undesired devices are not reported to you (Touchpads, Mice, Web
         * Cameras, etc.).
         * ```js
         * // ensures that only gamepads with at least 4 axis and 8 buttons are reported for events
         * engine.input.gamepads.setMinimumGamepadConfiguration({
         *    axis: 4,
         *    buttons: 8
         * });
         * ```
         *
         * ## Events
         *
         * You can subscribe to gamepad connect and disconnect events through `engine.input.gamepads.on`.
         * A [[GamepadConnectEvent]] or [[GamepadDisconnectEvent]] will be passed to you.
         *
         * - `connect` - When a gamepad connects it will fire this event and pass a [[GamepadConnectEvent]] with a reference to the gamepad.
         * - `disconnect` - When a gamepad disconnects it will fire this event and pass a [[GamepadDisconnectEvent]]
         *
         * Once you have a reference to a gamepad you may listen to changes on that gamepad with `.on`. A [[GamepadButtonEvent]] or
         * [[GamepadAxisEvent]] will be passed to you.
         * - `button` - Whenever a button is pressed on the game
         * - `axis` - Whenever an axis
         *
         * ```ts
         *
         * engine.input.gamepads.on('connect', (ce: ex.Input.GamepadConnectEvent) => {
         *    var newPlayer = CreateNewPlayer(); // pseudo-code for new player logic on gamepad connection
         *    console.log("Gamepad connected", ce);
         *    ce.gamepad.on('button', (be: ex.GamepadButtonEvent) => {
         *       if(be.button === ex.Input.Buttons.Face1) {
         *          newPlayer.jump();
         *       }
         *    });
         *
         *    ce.gamepad.on('axis', (ae: ex.GamepadAxisEvent) => {
         *      if(ae.axis === ex.Input.Axis.LeftStickX && ae.value > .5){
         *         newPlayer.moveRight();
         *      }
         *    })
         *
         *  });
         *
         *
         * ```
         *
         * ## Responding to button input
         *
         * [[Buttons|Gamepad buttons]] typically have values between 0 and 1, however depending on
         * the sensitivity of the controller, even if a button is idle it could have a
         * very tiny value. For this reason, you can pass in a threshold to several
         * methods to customize how sensitive you want to be in detecting button presses.
         *
         * You can inspect any connected [[Gamepad]] using [[Gamepad.isButtonPressed]], [[Gamepad.getButton]],
         * or you can subscribe to the `button` event published on the [[Gamepad]] which passes
         * a [[GamepadButtonEvent]] to your handler.
         *
         * ```js
         * // enable gamepad support
         * engine.input.gamepads.enabled = true;
         *
         * // query gamepad on update
         * engine.on("update", function (ev) {
         *
         *   // access any gamepad by index
         *   if (engine.input.gamepads.at(0).isButtonPressed(ex.Input.Buttons.Face1)) {
         *     ex.Logger.getInstance().info("Controller A button pressed");
         *   }
         *
         *   // query individual button
         *   if (engine.input.gamepads.at(0).getButton(ex.Input.Buttons.DpadLeft) > 0.2) {
         *     ex.Logger.getInstance().info("Controller D-pad left value is > 0.2")
         *   }
         * });
         *
         * // subscribe to button events
         * engine.input.gamepads.at(0).on("button", function (ev) {
         *   ex.Logger.getInstance().info(ev.button, ev.value);
         * });
         * ```
         *
         * ## Responding to axis input
         *
         * [[Axes|Gamepad axes]] typically have values between -1 and 1, but even idle
         * sticks can still propogate very small values depending on the quality and age
         * of a controller. For this reason, you can set [[Gamepads.MinAxisMoveThreshold]]
         * to set the (absolute) threshold after which Excalibur will start publishing `axis` events.
         * By default it is set to a value that normally will not throw events if a stick is idle.
         *
         * You can query axes via [[Gamepad.getAxes]] or by subscribing to the `axis` event on [[Gamepad]]
         * which passes a [[GamepadAxisEvent]] to your handler.
         *
         * ```js
         * // enable gamepad support
         * engine.input.gamepads.enabled = true;
         *
         * // query gamepad on update
         * engine.on("update", function (ev) {
         *
         *   // access any gamepad by index
         *   var axisValue;
         *   if ((axisValue = engine.input.gamepads.at(0).getAxes(ex.Input.Axes.LeftStickX)) > 0.5) {
         *     ex.Logger.getInstance().info("Move right", axisValue);
         *   }
         * });
         *
         * // subscribe to axis events
         * engine.input.gamepads.at(0).on("axis", function (ev) {
         *   ex.Logger.getInstance().info(ev.axis, ev.value);
         * });
         * ```
         */
        var Gamepads = (function (_super) {
            __extends(Gamepads, _super);
            function Gamepads(engine) {
                _super.call(this);
                /**
                 * Whether or not to poll for Gamepad input (default: `false`)
                 */
                this.enabled = false;
                /**
                 * Whether or not Gamepad API is supported
                 */
                this.supported = !!navigator.getGamepads;
                this._gamePadTimeStamps = [0, 0, 0, 0];
                this._oldPads = [];
                this._pads = [];
                this._initSuccess = false;
                this._navigator = navigator;
                this._minimumConfiguration = null;
                this._engine = engine;
            }
            Gamepads.prototype.init = function () {
                if (!this.supported) {
                    return;
                }
                if (this._initSuccess) {
                    return;
                }
                // In Chrome, this will return 4 undefined items until a button is pressed
                // In FF, this will not return any items until a button is pressed
                this._oldPads = this._clonePads(this._navigator.getGamepads());
                if (this._oldPads.length && this._oldPads[0]) {
                    this._initSuccess = true;
                }
            };
            /**
             * Sets the minimum gamepad configuration, for example {axis: 4, buttons: 4} means
             * this game requires at minimum 4 axis inputs and 4 buttons, this is not restrictive
             * all other controllers with more axis or buttons are valid as well. If no minimum
             * configuration is set all pads are valid.
             */
            Gamepads.prototype.setMinimumGamepadConfiguration = function (config) {
                this._enableAndUpdate(); // if config is used, implicitely enable
                this._minimumConfiguration = config;
            };
            /**
             * When implicitely enabled, set the enabled flag and run an update so information is updated
             */
            Gamepads.prototype._enableAndUpdate = function () {
                if (!this.enabled) {
                    this.enabled = true;
                    this.update(100);
                }
            };
            /**
             * Checks a navigator gamepad against the minimum configuration if present.
             */
            Gamepads.prototype._isGamepadValid = function (pad) {
                if (!this._minimumConfiguration) {
                    return true;
                }
                ;
                if (!pad) {
                    return false;
                }
                ;
                var axesLength = pad.axes.filter(function (value, index, array) {
                    return (typeof value !== undefined);
                }).length;
                var buttonLength = pad.buttons.filter(function (value, index, array) {
                    return (typeof value !== undefined);
                }).length;
                return axesLength >= this._minimumConfiguration.axis &&
                    buttonLength >= this._minimumConfiguration.buttons &&
                    pad.connected;
            };
            Gamepads.prototype.on = function (eventName, handler) {
                this._enableAndUpdate(); // implicitly enable
                _super.prototype.on.call(this, eventName, handler);
            };
            Gamepads.prototype.off = function (eventName, handler) {
                this._enableAndUpdate(); // implicitly enable
                _super.prototype.off.call(this, eventName, handler);
            };
            /**
             * Updates Gamepad state and publishes Gamepad events
             */
            Gamepads.prototype.update = function (delta) {
                if (!this.enabled || !this.supported) {
                    return;
                }
                this.init();
                var gamepads = this._navigator.getGamepads();
                for (var i = 0; i < gamepads.length; i++) {
                    if (!gamepads[i]) {
                        // If was connected, but now isn't emit the disconnect event
                        if (this.at(i).connected) {
                            this.eventDispatcher.emit('disconnect', new ex.GamepadDisconnectEvent(i));
                        }
                        // Reset connection status
                        this.at(i).connected = false;
                        continue;
                    }
                    else {
                        if (!this.at(i).connected && this._isGamepadValid(gamepads[i])) {
                            this.eventDispatcher.emit('connect', new ex.GamepadConnectEvent(i, this.at(i)));
                        }
                        // Set connection status
                        this.at(i).connected = true;
                    }
                    ;
                    // Only supported in Chrome
                    if (gamepads[i].timestamp && gamepads[i].timestamp === this._gamePadTimeStamps[i]) {
                        continue;
                    }
                    this._gamePadTimeStamps[i] = gamepads[i].timestamp;
                    // Add reference to navigator gamepad
                    this.at(i).navigatorGamepad = gamepads[i];
                    // Buttons
                    var b, a, value, buttonIndex, axesIndex;
                    for (b in Buttons) {
                        if (typeof Buttons[b] !== 'number') {
                            continue;
                        }
                        buttonIndex = Buttons[b];
                        if (gamepads[i].buttons[buttonIndex]) {
                            value = gamepads[i].buttons[buttonIndex].value;
                            if (value !== this._oldPads[i].getButton(buttonIndex)) {
                                if (gamepads[i].buttons[buttonIndex].pressed) {
                                    this.at(i).updateButton(buttonIndex, value);
                                    this.at(i).eventDispatcher.publish('button', new ex.GamepadButtonEvent(buttonIndex, value));
                                }
                                else {
                                    this.at(i).updateButton(buttonIndex, 0);
                                }
                            }
                        }
                    }
                    // Axes
                    for (a in Axes) {
                        if (typeof Axes[a] !== 'number') {
                            continue;
                        }
                        axesIndex = Axes[a];
                        value = gamepads[i].axes[axesIndex];
                        if (value !== this._oldPads[i].getAxes(axesIndex)) {
                            this.at(i).updateAxes(axesIndex, value);
                            this.at(i).eventDispatcher.emit('axis', new ex.GamepadAxisEvent(axesIndex, value));
                        }
                    }
                    this._oldPads[i] = this._clonePad(gamepads[i]);
                }
            };
            /**
             * Safely retrieves a Gamepad at a specific index and creates one if it doesn't yet exist
             */
            Gamepads.prototype.at = function (index) {
                this._enableAndUpdate(); // implicitly enable gamepads when at() is called         
                if (index >= this._pads.length) {
                    // Ensure there is a pad to retrieve
                    for (var i = this._pads.length - 1, max = index; i < max; i++) {
                        this._pads.push(new Gamepad());
                        this._oldPads.push(new Gamepad());
                    }
                }
                return this._pads[index];
            };
            /**
             * Returns a list of all valid gamepads that meet the minimum configuration requirment.
             */
            Gamepads.prototype.getValidGamepads = function () {
                this._enableAndUpdate();
                var result = [];
                for (var i = 0; i < this._pads.length; i++) {
                    if (this._isGamepadValid(this.at(i).navigatorGamepad) && this.at(i).connected) {
                        result.push(this.at(i));
                    }
                }
                return result;
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
                if (!pad) {
                    return clonedPad;
                }
                for (i = 0, len = pad.buttons.length; i < len; i++) {
                    if (pad.buttons[i]) {
                        clonedPad.updateButton(i, pad.buttons[i].value);
                    }
                }
                for (i = 0, len = pad.axes.length; i < len; i++) {
                    clonedPad.updateAxes(i, pad.axes[i]);
                }
                return clonedPad;
            };
            /**
             * The minimum value an axis has to move before considering it a change
             */
            Gamepads.MinAxisMoveThreshold = 0.05;
            return Gamepads;
        })(ex.Class);
        Input.Gamepads = Gamepads;
        /**
         * Gamepad holds state information for a connected controller. See [[Gamepads]]
         * for more information on handling controller input.
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
             * @param button     The button to query
             * @param threshold  The threshold over which the button is considered to be pressed
             */
            Gamepad.prototype.isButtonPressed = function (button, threshold) {
                if (threshold === void 0) { threshold = 1; }
                return this._buttons[button] >= threshold;
            };
            /**
             * Gets the given button value between 0 and 1
             */
            Gamepad.prototype.getButton = function (button) {
                return this._buttons[button];
            };
            /**
             * Gets the given axis value between -1 and 1. Values below
             * [[MinAxisMoveThreshold]] are considered 0.
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
         */
        (function (Buttons) {
            /**
             * Face 1 button (e.g. A)
             */
            Buttons[Buttons["Face1"] = 0] = "Face1";
            /**
             * Face 2 button (e.g. B)
             */
            Buttons[Buttons["Face2"] = 1] = "Face2";
            /**
             * Face 3 button (e.g. X)
             */
            Buttons[Buttons["Face3"] = 2] = "Face3";
            /**
             * Face 4 button (e.g. Y)
             */
            Buttons[Buttons["Face4"] = 3] = "Face4";
            /**
             * Left bumper button
             */
            Buttons[Buttons["LeftBumper"] = 4] = "LeftBumper";
            /**
             * Right bumper button
             */
            Buttons[Buttons["RightBumper"] = 5] = "RightBumper";
            /**
             * Left trigger button
             */
            Buttons[Buttons["LeftTrigger"] = 6] = "LeftTrigger";
            /**
             * Right trigger button
             */
            Buttons[Buttons["RightTrigger"] = 7] = "RightTrigger";
            /**
             * Select button
             */
            Buttons[Buttons["Select"] = 8] = "Select";
            /**
             * Start button
             */
            Buttons[Buttons["Start"] = 9] = "Start";
            /**
             * Left analog stick press (e.g. L3)
             */
            Buttons[Buttons["LeftStick"] = 10] = "LeftStick";
            /**
             * Right analog stick press (e.g. R3)
             */
            Buttons[Buttons["RightStick"] = 11] = "RightStick";
            /**
             * D-pad up
             */
            Buttons[Buttons["DpadUp"] = 12] = "DpadUp";
            /**
             * D-pad down
             */
            Buttons[Buttons["DpadDown"] = 13] = "DpadDown";
            /**
             * D-pad left
             */
            Buttons[Buttons["DpadLeft"] = 14] = "DpadLeft";
            /**
             * D-pad right
             */
            Buttons[Buttons["DpadRight"] = 15] = "DpadRight";
        })(Input.Buttons || (Input.Buttons = {}));
        var Buttons = Input.Buttons;
        /**
         * Gamepad Axes enumeration
         */
        (function (Axes) {
            /**
             * Left analogue stick X direction
             */
            Axes[Axes["LeftStickX"] = 0] = "LeftStickX";
            /**
             * Left analogue stick Y direction
             */
            Axes[Axes["LeftStickY"] = 1] = "LeftStickY";
            /**
             * Right analogue stick X direction
             */
            Axes[Axes["RightStickX"] = 2] = "RightStickX";
            /**
             * Right analogue stick Y direction
             */
            Axes[Axes["RightStickY"] = 3] = "RightStickY";
        })(Input.Axes || (Input.Axes = {}));
        var Axes = Input.Axes;
    })(Input = ex.Input || (ex.Input = {}));
})(ex || (ex = {}));
/// <reference path="MonkeyPatch.ts" />
/// <reference path="Events.ts" />
/// <reference path="EventDispatcher.ts" />
/// <reference path="Class.ts" />
/// <reference path="Drawing/Color.ts" />
/// <reference path="Util/Log.ts" />
/// <reference path="Collision/Side.ts" />
/// <reference path="Scene.ts" />
/// <reference path="Actor.ts" />
/// <reference path="UIActor.ts" />
/// <reference path="Trigger.ts" />
/// <reference path="Particles.ts" />
/// <reference path="Drawing/Animation.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Sound.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Promises.ts" />
/// <reference path="Util/Util.ts" />
/// <reference path="Util/Detector.ts" />
/// <reference path="Binding.ts" />
/// <reference path="TileMap.ts" />
/// <reference path="Label.ts" />
/// <reference path="PostProcessing/IPostProcessor.ts"/>
/// <reference path="Input/IEngineInput.ts"/>
/// <reference path="Input/Pointer.ts"/>
/// <reference path="Input/Keyboard.ts"/>
/// <reference path="Input/Gamepad.ts"/>
/**
 * # Welcome to the Excalibur API
 *
 * This documentation is automatically generated from the Excalibur
 * source code on [GitHub](http://github.com/excaliburjs/Excalibur).
 *
 * If you're just starting out, we recommend reading the tutorials and guides
 * on [Excaliburjs.com](http://excaliburjs.com/docs). If you have questions,
 * feel free to get help on the [Excalibur.js mailing list](https://groups.google.com/forum/#!forum/excaliburjs).
 *
 * If you're looking for a specific method or property, you can search the documentation
 * using the search icon at the top or just start typing.
 *
 * ## Where to Start
 *
 * These are the core concepts of Excalibur that you should become
 * familiar with.
 *
 * - [[Engine|Intro to the Engine]]
 *   - [[EventDispatcher|Eventing]]
 * - [[Scene|Working with Scenes]]
 *   - [[BaseCamera|Working with Cameras]]
 * - [[Actor|Working with Actors]]
 *   - [[Label|Labels]]
 *   - [[Trigger|Triggers]]
 *   - [[UIActor|UI Actors (HUD)]]
 *   - [[ActionContext|Action API]]
 *   - [[Group|Groups]]
 *
 * ## Working with Resources
 *
 * Excalibur provides easy ways of loading assets, from images to JSON files.
 *
 * - [[Loader|Working with the Loader]]
 * - [[Texture|Loading Textures]]
 * - [[Sound|Loading Sounds]]
 * - [[Resource|Loading Generic Resources]]
 *
 * ## Working with Input
 *
 * Excalibur comes built-in with support for mouse, keyboard, touch, and controllers.
 *
 * - [[Pointers|Mouse and Touch]]
 * - [[Keyboard]]
 * - [[Gamepads|Controller Support]]
 *
 * ## Working with Media
 *
 * Add sounds, images, and animations to your game.
 *
 * - [[Sprite|Working with Sprites]]
 * - [[Sound|Working with Sounds]]
 * - [[SpriteSheet|Working with SpriteSheets]]
 * - [[Animation|Working with Animations]]
 * - [[TileMap|Working with TileMaps]]
 *
 * ## Effects and Particles
 *
 * Every game needs an explosion or two. Add sprite effects such as lighten,
 * darken, and colorize.
 *
 * - [[Effects|Sprite Effects]]
 * - [[ParticleEmitter|Particle Emitters]]
 * - [[IPostProcessor|Post Processors]]
 *
 * ## Math
 *
 * These classes provide the basics for math & algebra operations.
 *
 * - [[Point]]
 * - [[Vector]]
 * - [[Ray]]
 * - [[Line]]
 * - [[Projection]]
 *
 * ## Utilities
 *
 * - [[Util|Utility Functions]]
 * - [[Promise|Promises and Async]]
 * - [[Logger|Logging]]
 * - [[Color|Colors]]
 * - [[Timer|Timers]]
 */
var ex;
(function (ex) {
    /**
     * The Excalibur Engine
     *
     * The [[Engine]] is the main driver for a game. It is responsible for
     * starting/stopping the game, maintaining state, transmitting events,
     * loading resources, and managing the scene.
     *
     * Excalibur uses the HTML5 Canvas API for drawing your game to the screen.
     * The canvas is available to all `draw` functions for raw manipulation,
     * but Excalibur is meant to simplify or completely remove the need to use
     * the canvas directly.
     *
     * ## Creating a Game
     *
     * To create a new game, create a new instance of [[Engine]] and pass in
     * the configuration ([[IEngineOptions]]). Excalibur only supports a single
     * instance of a game at a time, so it is safe to use globally.
     *
     * You can then call [[start]] which starts the game and optionally accepts
     * a [[Loader]] which you can use to pre-load assets.
     *
     * ```js
     * var game = new ex.Engine({ width: 800, height: 600 });
     *
     * // call game.start, which is a Promise
     * game.start().then(function () {
     *   // ready, set, go!
     * });
     * ```
     *
     * ## The Main Loop
     *
     * The Excalibur engine uses a simple main loop. The engine updates and renders
     * the "scene graph" which is the [[Scene|scenes]] and the tree of [[Actor|actors]] within that
     * scene. Only one [[Scene]] can be active at a time. The engine does not update/draw any other
     * scene, which means any actors will not be updated/drawn if they are part of a deactivated scene.
     *
     * ![Engine Lifecycle](/assets/images/docs/EngineLifeCycle.png)
     *
     * **Scene Graph**
     *
     * ```
     * Engine
     *   |_ Scene 1 (activated)
     *     |_ Actor 1
     *       |_ Child Actor 1
     *     |_ Actor 2
     *   |_ Scene 2 (deactiveated)
     *   |_ Scene 3 (deactiveated)
     * ```
     *
     * The engine splits the game into two primary responsibilities: updating and drawing. This is
     * to keep your game smart about splitting duties so that you aren't drawing when doing
     * logic or performing logic as you draw.
     *
     * ### Update Loop
     *
     * The first operation run is the [[Engine._update|update]] loop. [[Actor]] and [[Scene]] both implement
     * an overridable/extendable `update` method. Use it to perform any logic-based operations
     * in your game for a particular class.
     *
     * ### Draw Loop
     *
     * The next step is the [[Engine._draw|draw]] loop. A [[Scene]] loops through its child [[Actor|actors]] and
     * draws each one. You can override the `draw` method on an actor to customize its drawing.
     * You should **not** perform any logic in a draw call, it should only relate to drawing.
     *
     * ## Working with Scenes
     *
     * The engine automatically creates a "root" [[Scene]]. You can use this for whatever you want.
     * You can manipulate scenes using [[Engine.add|add]], [[Engine.remove|remove]],
     * and [[Engine.goToScene|goToScene]]. You can overwrite or remove the `root` scene if
     * you want. There always has to be at least one scene and only **one** scene can be
     * active at any one time.
     *
     * Learn more about the [[Scene|scene lifecycle]].
     *
     * ### Adding a scene
     *
     * ```js
     * var game = new ex.Engine();
     *
     * // create a new level
     * var level1 = new ex.Scene();
     *
     * // add level 1 to the game
     * game.add("level1", level1);
     *
     * // in response to user input, go to level 1
     * game.goToScene("level1");
     *
     * // go back to main menu
     * game.goToScene("root");
     * ```
     *
     * ### Accessing the current scene
     *
     * To add actors and other entities to the current [[Scene]], you can use [[Engine.add|add]]. Alternatively,
     * you can use [[Engine.currentScene]] to directly access the current scene.
     *
     * ## Managing the Viewport
     *
     * Excalibur supports multiple [[DisplayMode|display modes]] for a game. Pass in a `displayMode`
     * option when creating a game to customize the viewport.
     *
     * ## Extending the Engine
     *
     * For complex games, any entity that inherits [[Class]] can be extended to override built-in
     * functionality. This is recommended for [[Actor|actors]] and [[Scene|scenes]], especially.
     *
     * You can customize the options or provide more for your game by extending [[Engine]].
     *
     * **TypeScript**
     *
     * ```ts
     * class Game extends ex.Engine {
     *
     *   constructor() {
     *     super({ width: 800, height: 600, displayMode: DisplayMode.FullScreen });
     *   }
     *
     *   public start() {
     *     // add custom scenes
     *     this.add("mainmenu", new MainMenu());
     *
     *     return super.start(myLoader).then(() => {
     *
     *       this.goToScene("mainmenu");
     *
     *       // custom start-up
     *     });
     *   }
     * }
     *
     * var game = new Game();
     * game.start();
     * ```
     *
     * **Javascript**
     *
     * ```js
     * var Game = ex.Engine.extend({
     *
     *   constructor: function () {
     *     Engine.call(this, { width: 800, height: 600, displayMode: DisplayMode.FullScreen });
     *   }
     *
     *   start: function() {
     *     // add custom scenes
     *     this.add("mainmenu", new MainMenu());
     *
     *     var _this = this;
     *     return Engine.prototype.start.call(this, myLoader).then(function() {
     *
     *       _this.goToScene("mainmenu");
     *
     *       // custom start-up
     *     });
     *   }
     * });
     *
     * var game = new Game();
     * game.start();
     * ```
     */
    var Engine = (function (_super) {
        __extends(Engine, _super);
        /**
         * @internal
         */
        function Engine(args) {
            _super.call(this);
            /**
             * Gets or sets the [[CollisionStrategy]] for Excalibur actors
             */
            this.collisionStrategy = ex.CollisionStrategy.DynamicAABBTree;
            this._hasStarted = false;
            /**
             * Current FPS
             */
            this.fps = 0;
            /**
             * Gets or sets the list of post processors to apply at the end of drawing a frame (such as [[ColorBlindCorrector]])
             */
            this.postProcessors = [];
            /**
             * Contains all the scenes currently registered with Excalibur
             */
            this.scenes = {};
            this._animations = [];
            /**
             * Indicates whether the engine is set to fullscreen or not
             */
            this.isFullscreen = false;
            /**
             * Indicates the current [[DisplayMode]] of the engine.
             */
            this.displayMode = DisplayMode.FullScreen;
            /**
             * Indicates whether audio should be paused when the game is no longer visible.
             */
            this.pauseAudioWhenHidden = true;
            /**
             * Indicates whether the engine should draw with debug information
             */
            this.isDebug = false;
            this.debugColor = new ex.Color(255, 255, 255);
            /**
             * Sets the background color for the engine.
             */
            this.backgroundColor = new ex.Color(0, 0, 100);
            /**
             * The action to take when a fatal exception is thrown
             */
            this.onFatalException = function (e) { ex.Logger.getInstance().fatal(e); };
            this._isSmoothingEnabled = true;
            this._isLoading = false;
            this._progress = 0;
            this._total = 1;
            var width;
            var height;
            var canvasElementId;
            var displayMode;
            var options = null;
            if (typeof arguments[0] === 'number') {
                width = arguments[0];
                height = arguments[1];
                canvasElementId = arguments[2];
                displayMode = arguments[3];
            }
            else {
                options = arguments[0] || { width: 0, height: 0, canvasElementId: '', displayMode: DisplayMode.FullScreen };
                width = options.width;
                height = options.height;
                canvasElementId = options.canvasElementId;
                displayMode = options.displayMode;
            }
            // Check compatibility 
            var detector = new ex.Detector();
            if (!(this._compatible = detector.test())) {
                var message = document.createElement('div');
                message.innerText = 'Sorry, your browser does not support all the features needed for Excalibur';
                document.body.appendChild(message);
                detector.failedTests.forEach(function (test) {
                    var testMessage = document.createElement('div');
                    testMessage.innerText = 'Browser feature missing ' + test;
                    document.body.appendChild(testMessage);
                });
                if (canvasElementId) {
                    var canvas = document.getElementById(canvasElementId);
                    if (canvas) {
                        canvas.parentElement.removeChild(canvas);
                    }
                }
                return;
            }
            this._logger = ex.Logger.getInstance();
            this._logger.info('Powered by Excalibur.js visit", "http://excaliburjs.com", "for more information.');
            this._logger.debug('Building engine...');
            this.canvasElementId = canvasElementId;
            if (canvasElementId) {
                this._logger.debug('Using Canvas element specified: ' + canvasElementId);
                this.canvas = document.getElementById(canvasElementId);
            }
            else {
                this._logger.debug('Using generated canvas element');
                this.canvas = document.createElement('canvas');
            }
            if (width && height) {
                if (displayMode === undefined) {
                    this.displayMode = DisplayMode.Fixed;
                }
                this._logger.debug('Engine viewport is size ' + width + ' x ' + height);
                this.width = width;
                this.canvas.width = width;
                this.height = height;
                this.canvas.height = height;
            }
            else if (!displayMode) {
                this._logger.debug('Engine viewport is fullscreen');
                this.displayMode = DisplayMode.FullScreen;
            }
            this._loader = new ex.Loader();
            this._initialize(options);
            this.rootScene = this.currentScene = new ex.Scene(this);
            this.addScene('root', this.rootScene);
            this.goToScene('root');
        }
        /**
         * Plays a sprite animation on the screen at the specified `x` and `y`
         * (in game coordinates, not screen pixels). These animations play
         * independent of actors, and will be cleaned up internally as soon
         * as they are complete. Note animations that loop will never be
         * cleaned up.
         *
         * @param animation  Animation to play
         * @param x          x game coordinate to play the animation
         * @param y          y game coordinate to play the animation
         */
        Engine.prototype.playAnimation = function (animation, x, y) {
            this._animations.push(new AnimationNode(animation, x, y));
        };
        /**
         * Adds an actor to the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.addChild(actor)`.
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the [[currentScene]] may be drawn or updated.
         *
         * @param actor  The actor to add to the [[currentScene]]
         *
         * @obsolete Use [[add]] instead.
         */
        Engine.prototype.addChild = function (actor) {
            this.currentScene.addChild(actor);
        };
        /**
         * Removes an actor from the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.removeChild(actor)`.
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @param actor  The actor to remove from the [[currentScene]].
         */
        Engine.prototype.removeChild = function (actor) {
            this.currentScene.removeChild(actor);
        };
        /**
         * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
         * will be drawn and updated.
         */
        Engine.prototype.addTileMap = function (tileMap) {
            this.currentScene.addTileMap(tileMap);
        };
        /**
         * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
         */
        Engine.prototype.removeTileMap = function (tileMap) {
            this.currentScene.removeTileMap(tileMap);
        };
        /**
         * Adds a [[Timer]] to the [[currentScene]].
         * @param timer  The timer to add to the [[currentScene]].
         */
        Engine.prototype.addTimer = function (timer) {
            return this.currentScene.addTimer(timer);
        };
        /**
         * Removes a [[Timer]] from the [[currentScene]].
         * @param timer  The timer to remove to the [[currentScene]].
         */
        Engine.prototype.removeTimer = function (timer) {
            return this.currentScene.removeTimer(timer);
        };
        /**
         * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
         * would levels or menus.
         *
         * @param key  The name of the scene, must be unique
         * @param scene The scene to add to the engine
         */
        Engine.prototype.addScene = function (key, scene) {
            if (this.scenes[key]) {
                this._logger.warn('Scene', key, 'already exists overwriting');
            }
            this.scenes[key] = scene;
            scene.engine = this;
        };
        /**
         * @internal
         */
        Engine.prototype.removeScene = function (entity) {
            if (entity instanceof ex.Scene) {
                // remove scene
                for (var key in this.scenes) {
                    if (this.scenes.hasOwnProperty(key)) {
                        if (this.scenes[key] === entity) {
                            delete this.scenes[key];
                        }
                    }
                }
            }
            if (typeof entity === 'string') {
                // remove scene
                delete this.scenes[entity];
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
            if (typeof entity === 'string') {
                this.removeScene(entity);
            }
        };
        /**
         * Changes the currently updating and drawing scene to a different,
         * named scene. Calls the [[Scene]] lifecycle events.
         * @param key  The key of the scene to trasition to.
         */
        Engine.prototype.goToScene = function (key) {
            if (this.scenes[key]) {
                var oldScene = this.currentScene;
                var newScene = this.scenes[key];
                this._logger.debug('Going to scene:', key);
                // only deactivate when initialized
                if (this.currentScene.isInitialized) {
                    this.currentScene.onDeactivate.call(this.currentScene);
                    this.currentScene.eventDispatcher.emit('deactivate', new ex.DeactivateEvent(newScene));
                }
                // set current scene to new one
                this.currentScene = newScene;
                if (!this.currentScene.isInitialized) {
                    this.currentScene.onInitialize.call(this.currentScene, this);
                    this.currentScene.eventDispatcher.emit('initialize', new ex.InitializeEvent(this));
                    this.currentScene.isInitialized = true;
                }
                this.currentScene.onActivate.call(this.currentScene);
                this.currentScene.eventDispatcher.emit('activate', new ex.ActivateEvent(oldScene));
            }
            else {
                this._logger.error('Scene', key, 'does not exist!');
            }
        };
        /**
         * Returns the width of the engine's drawing surface in pixels.
         */
        Engine.prototype.getWidth = function () {
            if (this.currentScene && this.currentScene.camera) {
                return this.width / this.currentScene.camera.getZoom();
            }
            return this.width;
        };
        /**
         * Returns the height of the engine's drawing surface in pixels.
         */
        Engine.prototype.getHeight = function () {
            if (this.currentScene && this.currentScene.camera) {
                return this.height / this.currentScene.camera.getZoom();
            }
            return this.height;
        };
        /**
         * Transforms the current x, y from screen coordinates to world coordinates
         * @param point  Screen coordinate to convert
         */
        Engine.prototype.screenToWorldCoordinates = function (point) {
            var newX = point.x;
            var newY = point.y;
            // transform back to world space
            newX = (newX / this.canvas.clientWidth) * this.getWidth();
            newY = (newY / this.canvas.clientHeight) * this.getHeight();
            // transform based on zoom
            newX = newX - this.getWidth() / 2;
            newY = newY - this.getHeight() / 2;
            // shift by focus
            if (this.currentScene && this.currentScene.camera) {
                var focus = this.currentScene.camera.getFocus();
                newX += focus.x;
                newY += focus.y;
            }
            return new ex.Point(Math.floor(newX), Math.floor(newY));
        };
        /**
         * Transforms a world coordinate, to a screen coordinate
         * @param point  World coordinate to convert
         */
        Engine.prototype.worldToScreenCoordinates = function (point) {
            var screenX = point.x;
            var screenY = point.y;
            // shift by focus
            if (this.currentScene && this.currentScene.camera) {
                var focus = this.currentScene.camera.getFocus();
                screenX -= focus.x;
                screenY -= focus.y;
            }
            // transfrom back on zoom
            screenX = screenX + this.getWidth() / 2;
            screenY = screenY + this.getHeight() / 2;
            // transform back to screen space
            screenX = (screenX * this.canvas.clientWidth) / this.getWidth();
            screenY = (screenY * this.canvas.clientHeight) / this.getHeight();
            return new ex.Point(Math.floor(screenX), Math.floor(screenY));
        };
        /**
         * Sets the internal canvas height based on the selected display mode.
         */
        Engine.prototype._setHeightByDisplayMode = function (parent) {
            if (this.displayMode === DisplayMode.Container) {
                this.width = this.canvas.width = parent.clientWidth;
                this.height = this.canvas.height = parent.clientHeight;
            }
            if (this.displayMode === DisplayMode.FullScreen) {
                document.body.style.margin = '0px';
                document.body.style.overflow = 'hidden';
                this.width = this.canvas.width = parent.innerWidth;
                this.height = this.canvas.height = parent.innerHeight;
            }
        };
        /**
         * Initializes the internal canvas, rendering context, displaymode, and native event listeners
         */
        Engine.prototype._initialize = function (options) {
            var _this = this;
            if (this.displayMode === DisplayMode.FullScreen || this.displayMode === DisplayMode.Container) {
                var parent = (this.displayMode === DisplayMode.Container ?
                    (this.canvas.parentElement || document.body) : window);
                this._setHeightByDisplayMode(parent);
                window.addEventListener('resize', function (ev) {
                    _this._logger.debug('View port resized');
                    _this._setHeightByDisplayMode(parent);
                    _this._logger.info('parent.clientHeight ' + parent.clientHeight);
                    _this.setAntialiasing(_this._isSmoothingEnabled);
                });
            }
            // initialize inputs
            this.input = {
                keyboard: new ex.Input.Keyboard(this),
                pointers: new ex.Input.Pointers(this),
                gamepads: new ex.Input.Gamepads(this)
            };
            this.input.keyboard.init();
            this.input.pointers.init(options ? options.pointerScope : ex.Input.PointerScope.Document);
            this.input.gamepads.init();
            // Issue #385 make use of the visibility api
            // https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API
            document.addEventListener('visibilitychange', function () {
                if (document.hidden || document.msHidden) {
                    _this.eventDispatcher.emit('hidden', new ex.HiddenEvent());
                    _this._logger.debug('Window hidden');
                }
                else {
                    _this.eventDispatcher.emit('visible', new ex.VisibleEvent());
                    _this._logger.debug('Window visible');
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
         * canvas. Set this to `false` if you want a 'jagged' pixel art look to your
         * image resources.
         * @param isSmooth  Set smoothing to true or false
         */
        Engine.prototype.setAntialiasing = function (isSmooth) {
            this._isSmoothingEnabled = isSmooth;
            this.ctx.imageSmoothingEnabled = isSmooth;
            this.ctx.webkitImageSmoothingEnabled = isSmooth;
            this.ctx.mozImageSmoothingEnabled = isSmooth;
            this.ctx.msImageSmoothingEnabled = isSmooth;
        };
        /**
         * Return the current smoothing status of the canvas
         */
        Engine.prototype.getAntialiasing = function () {
            return this.ctx.imageSmoothingEnabled ||
                this.ctx.webkitImageSmoothingEnabled ||
                this.ctx.mozImageSmoothingEnabled ||
                this.ctx.msImageSmoothingEnabled;
        };
        /**
         * Updates the entire state of the game
         * @param delta  Number of milliseconds elapsed since the last update.
         */
        Engine.prototype._update = function (delta) {
            if (this._isLoading) {
                // suspend updates untill loading is finished
                return;
            }
            this.emit('preupdate', new ex.PreUpdateEvent(this, delta, this));
            // process engine level events
            this.currentScene.update(this, delta);
            // update animations
            this._animations = this._animations.filter(function (a) {
                return !a.animation.isDone();
            });
            // Update input listeners
            this.input.keyboard.update(delta);
            this.input.pointers.update(delta);
            this.input.gamepads.update(delta);
            // Publish update event
            this.eventDispatcher.emit('update', new ex.UpdateEvent(delta));
            this.emit('postupdate', new ex.PreUpdateEvent(this, delta, this));
        };
        /**
         * Draws the entire game
         * @param draw  Number of milliseconds elapsed since the last draw.
         */
        Engine.prototype._draw = function (delta) {
            var ctx = this.ctx;
            this.emit('predraw', new ex.PreDrawEvent(ctx, delta, this));
            if (this._isLoading) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, this.width, this.height);
                this._drawLoadingBar(ctx, this._progress, this._total);
                // Drawing nothing else while loading
                return;
            }
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.fillStyle = this.backgroundColor.toString();
            ctx.fillRect(0, 0, this.width, this.height);
            this.currentScene.draw(this.ctx, delta);
            // todo needs to be a better way of doing this
            var a = 0, len = this._animations.length;
            for (a; a < len; a++) {
                this._animations[a].animation.draw(ctx, this._animations[a].x, this._animations[a].y);
            }
            this.fps = 1.0 / (delta / 1000);
            // Draw debug information
            if (this.isDebug) {
                this.ctx.font = 'Consolas';
                this.ctx.fillStyle = this.debugColor.toString();
                var keys = this.input.keyboard.getKeys();
                for (var j = 0; j < keys.length; j++) {
                    this.ctx.fillText(keys[j].toString() + ' : ' + (ex.Input.Keys[keys[j]] ? ex.Input.Keys[keys[j]] : 'Not Mapped'), 100, 10 * j + 10);
                }
                this.ctx.fillText('FPS:' + this.fps.toFixed(2).toString(), 10, 10);
            }
            // Post processing
            for (var i = 0; i < this.postProcessors.length; i++) {
                this.postProcessors[i].process(this.ctx.getImageData(0, 0, this.width, this.height), this.ctx);
            }
            this.emit('postdraw', new ex.PreDrawEvent(ctx, delta, this));
        };
        /**
         * Starts the internal game loop for Excalibur after loading
         * any provided assets.
         * @param loader  Optional resources to load before starting the main loop. Some [[ILoadable]] such as a [[Loader]] collection,
         * [[Sound]], or [[Texture]].
         */
        Engine.prototype.start = function (loader) {
            if (!this._compatible) {
                var promise = new ex.Promise();
                return promise.reject('Excalibur is incompatible with your browser');
            }
            var loadingComplete;
            if (loader) {
                loader.wireEngine(this);
                loadingComplete = this.load(loader);
            }
            else {
                loadingComplete = ex.Promise.wrap();
            }
            if (!this._hasStarted) {
                this._hasStarted = true;
                this._logger.debug('Starting game...');
                // Mainloop
                var lastTime = Date.now();
                var game = this;
                (function mainloop() {
                    if (!game._hasStarted) {
                        return;
                    }
                    try {
                        game._requestId = window.requestAnimationFrame(mainloop);
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
                        game._update(elapsed);
                        game._draw(elapsed);
                        lastTime = now;
                    }
                    catch (e) {
                        window.cancelAnimationFrame(game._requestId);
                        game.stop();
                        game.onFatalException(e);
                    }
                })();
                this._logger.debug('Game started');
            }
            else {
            }
            return loadingComplete;
        };
        /**
         * Stops Excalibur's main loop, useful for pausing the game.
         */
        Engine.prototype.stop = function () {
            if (this._hasStarted) {
                this._hasStarted = false;
                this._logger.debug('Game stopped');
            }
        };
        /**
         * Takes a screen shot of the current viewport and returns it as an
         * HTML Image Element.
         */
        Engine.prototype.screenshot = function () {
            var result = new Image();
            var raw = this.canvas.toDataURL('image/png');
            result.src = raw;
            return result;
        };
        /**
         * Draws the Excalibur loading bar
         * @param ctx     The canvas rendering context
         * @param loaded  Number of bytes loaded
         * @param total   Total number of bytes to load
         */
        Engine.prototype._drawLoadingBar = function (ctx, loaded, total) {
            if (this._loadingDraw) {
                this._loadingDraw(ctx, loaded, total);
                return;
            }
            var y = this.canvas.height / 2;
            var width = this.canvas.width / 3;
            var x = width;
            // loading image
            var image = new Image();
            /* tslint:disable:max-line-length */
            // 64 bit string encoding of the excalibur logo
            image.src = 'data:image/png;base64,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';
            /* tslint:enable:max-line-length */
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
            var progressWidth = progress - margin * 2;
            var height = 20 - margin * 2;
            ctx.fillRect(x + margin, y + margin, progressWidth > 0 ? progressWidth : 0, height);
            this.setAntialiasing(oldAntialias);
        };
        /**
         * Sets the loading screen draw function if you want to customize the draw
         * @param fcn  Callback to draw the loading screen which is passed a rendering context, the number of bytes loaded, and the total
         * number of bytes to load.
         */
        Engine.prototype.setLoadingDrawFunction = function (fcn) {
            this._loadingDraw = fcn;
        };
        /**
         * Another option available to you to load resources into the game.
         * Immediately after calling this the game will pause and the loading screen
         * will appear.
         * @param loader  Some [[ILoadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
         */
        Engine.prototype.load = function (loader) {
            var _this = this;
            var complete = new ex.Promise();
            this._isLoading = true;
            loader.onprogress = function (e) {
                _this._progress = e.loaded;
                _this._total = e.total;
                _this._logger.debug('Loading ' + (100 * _this._progress / _this._total).toFixed(0));
            };
            loader.oncomplete = function () {
                setTimeout(function () {
                    _this._isLoading = false;
                    complete.resolve();
                }, 500);
            };
            loader.load();
            return complete;
        };
        return Engine;
    })(ex.Class);
    ex.Engine = Engine;
    /**
     * Enum representing the different display modes available to Excalibur
     */
    (function (DisplayMode) {
        /**
         * Show the game as full screen
         */
        DisplayMode[DisplayMode["FullScreen"] = 0] = "FullScreen";
        /**
         * Scale the game to the parent DOM container
         */
        DisplayMode[DisplayMode["Container"] = 1] = "Container";
        /**
         * Show the game as a fixed size
         */
        DisplayMode[DisplayMode["Fixed"] = 2] = "Fixed";
    })(ex.DisplayMode || (ex.DisplayMode = {}));
    var DisplayMode = ex.DisplayMode;
    /**
     * @internal
     */
    var AnimationNode = (function () {
        function AnimationNode(animation, x, y) {
            this.animation = animation;
            this.x = x;
            this.y = y;
        }
        return AnimationNode;
    })();
})(ex || (ex = {}));
//# sourceMappingURL=excalibur-0.6.0.js.map
;
// Concatenated onto excalibur after build
// Exports the excalibur module so it can be used with browserify
// https://github.com/excaliburjs/Excalibur/issues/312
if (typeof module !== 'undefined') {module.exports = ex;}