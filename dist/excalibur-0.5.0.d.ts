declare module ex {
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
    module Effects {
        /**
         * The interface that all sprite effects must implement
         */
        interface ISpriteEffect {
            /**
             * Should update individual pixels values
             * @param x          The pixel's x coordinate
             * @param y          The pixel's y coordinate
             * @param imageData  The sprite's raw pixel data
             */
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Grayscale" effect to a sprite, removing color information.
         */
        class Grayscale implements ISpriteEffect {
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Invert" effect to a sprite, inverting the pixel colors.
         */
        class Invert implements ISpriteEffect {
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Opacity" effect to a sprite, setting the alpha of all pixels to a given value.
         */
        class Opacity implements ISpriteEffect {
            opacity: number;
            /**
             * @param opacity  The new opacity of the sprite from 0-1.0
             */
            constructor(opacity: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Colorize" effect to a sprite, changing the color channels of all the pixels to an
         * average of the original color and the provided color
         */
        class Colorize implements ISpriteEffect {
            color: Color;
            /**
             * @param color  The color to apply to the sprite
             */
            constructor(color: Color);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Lighten" effect to a sprite, changes the lightness of the color according to HSL
         */
        class Lighten implements ISpriteEffect {
            factor: number;
            /**
             * @param factor  The factor of the effect between 0-1
             */
            constructor(factor?: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Darken" effect to a sprite, changes the darkness of the color according to HSL
         */
        class Darken implements ISpriteEffect {
            factor: number;
            /**
             * @param factor  The factor of the effect between 0-1
             */
            constructor(factor?: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Saturate" effect to a sprite, saturates the color acccording to HSL
         */
        class Saturate implements ISpriteEffect {
            factor: number;
            /**
             * @param factor  The factor of the effect between 0-1
             */
            constructor(factor?: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Desaturate" effect to a sprite, desaturates the color acccording to HSL
         */
        class Desaturate implements ISpriteEffect {
            factor: number;
            /**
             * @param factor  The factor of the effect between 0-1
             */
            constructor(factor?: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Fill" effect to a sprite, changing the color channels of all non-transparent pixels to match
         * a given color
         */
        class Fill implements ISpriteEffect {
            color: Color;
            /**
             * @param color  The color to apply to the sprite
             */
            constructor(color: Color);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
    }
}
declare module ex {
    /**
     * Interface for implementing anything in Excalibur that can be drawn to the screen.
     */
    interface IDrawable {
        /**
         * Indicates whether the drawing is to be flipped vertically
         */
        flipVertical: boolean;
        /**
         * Indicates whether the drawing is to be flipped horizontally
         */
        flipHorizontal: boolean;
        /**
         * Indicates the width of the drawing in pixels
         */
        width: number;
        /**
         * Indicates the height of the drawing in pixels
         */
        height: number;
        /**
         * Adds a new [[ISpriteEffect]] to this drawing.
         * @param effect  Effect to add to the this drawing
         */
        addEffect(effect: Effects.ISpriteEffect): any;
        /**
         * Removes an effect [[ISpriteEffect]] from this drawing.
         * @param effect  Effect to remove from this drawing
         */
        removeEffect(effect: Effects.ISpriteEffect): any;
        /**
         * Removes an effect by index from this drawing.
         * @param index  Index of the effect to remove from this drawing
         */
        removeEffect(index: number): any;
        removeEffect(param: any): any;
        /**
         * Clears all effects from the drawing and return it to its original state.
         */
        clearEffects(): any;
        /**
         * Gets or sets the point about which to apply transformations to the drawing relative to the
         * top left corner of the drawing.
         */
        anchor: Point;
        /**
         * Gets or sets the scale trasformation
         */
        scale: Point;
        /**
         * Sets the current rotation transformation for the drawing.
         */
        rotation: number;
        /**
         * Resets the internal state of the drawing (if any)
         */
        reset(): any;
        /**
         * Draws the sprite appropriately to the 2D rendering context.
         * @param ctx  The 2D rendering context
         * @param x    The x coordinate of where to draw
         * @param y    The y coordinate of where to draw
         */
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): any;
    }
}
declare module ex {
    /**
     * An interface describing actor update pipeline traits
     */
    interface IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex.Traits {
    class Movement implements IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex {
    class CullingBox {
        private _topLeft;
        private _topRight;
        private _bottomLeft;
        private _bottomRight;
        private _xCoords;
        private _yCoords;
        private _xMin;
        private _yMin;
        private _xMax;
        private _yMax;
        isSpriteOffScreen(actor: Actor, engine: Engine): boolean;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex.Traits {
    class OffscreenCulling implements IActorTrait {
        cullingBox: CullingBox;
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex.Traits {
    interface ICapturePointerConfig {
        /**
         * Capture PointerMove events (may be expensive!)
         */
        captureMoveEvents: boolean;
    }
    /**
     * Propogates pointer events to the actor
     */
    class CapturePointer implements IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex.Traits {
    class CollisionDetection implements IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex {
    /**
     * An enum that describes the sides of an Actor for collision
     */
    enum Side {
        None = 0,
        Top = 1,
        Bottom = 2,
        Left = 3,
        Right = 4,
    }
}
declare module ex {
    /**
     * A simple 2D point on a plane
     */
    class Point {
        x: number;
        y: number;
        /**
         * @param x  X coordinate of the point
         * @param y  Y coordinate of the point
         */
        constructor(x: number, y: number);
        /**
         * Convert this point to a vector
         */
        toVector(): Vector;
        /**
         * Rotates the current point around another by a certain number of
         * degrees in radians
         * @param angle  The angle in radians
         * @param anchor The point to rotate around
         */
        rotate(angle: number, anchor?: Point): Point;
        /**
         * Translates the current point by a vector
         * @param vector  The other vector to add to
         */
        add(vector: Vector): Point;
        /**
         * Sets the x and y components at once
         */
        setTo(x: number, y: number): void;
        /**
         * Clones a new point that is a copy of this one.
         */
        clone(): Point;
        /**
         * Compares this point against another and tests for equality
         * @param point  The other point to compare to
         */
        equals(point: Point): boolean;
    }
    /**
     * A 2D vector on a plane.
     */
    class Vector extends Point {
        x: number;
        y: number;
        /**
         * A (0, 0) vector
         */
        static Zero: Vector;
        /**
         * Returns a vector of unit length in the direction of the specified angle.
         * @param angle The angle to generate the vector
         */
        static fromAngle(angle: number): Vector;
        /**
         * @param x  X component of the Vector
         * @param y  Y component of the Vector
         */
        constructor(x: number, y: number);
        /**
         * The distance to another vector
         * @param v  The other vector
         */
        distance(v?: Vector): number;
        /**
         * Normalizes a vector to have a magnitude of 1.
         */
        normalize(): Vector;
        /**
         * Scales a vector's by a factor of size
         * @param size  The factor to scale the magnitude by
         */
        scale(size: any): Vector;
        /**
         * Adds one vector to another, alias for add
         * @param v  The vector to add
         */
        plus(v: Vector): Vector;
        /**
         * Adds one vector to another
         * @param v The vector to add
         */
        add(v: Vector): Vector;
        /**
         * Subtracts a vector from another, alias for minus
         * @param v The vector to subtract
         */
        subtract(v: Vector): Vector;
        /**
         * Subtracts a vector from the current vector
         * @param v The vector to subtract
         */
        minus(v: Vector): Vector;
        /**
         * Performs a dot product with another vector
         * @param v  The vector to dot
         */
        dot(v: Vector): number;
        /**
         * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
         * @param v  The vector to cross
         */
        cross(v: Vector): number;
        /**
         * Returns the perpendicular vector to this one
         */
        perpendicular(): Vector;
        /**
         * Returns the normal vector to this one
         */
        normal(): Vector;
        /**
         * Returns the angle of this vector.
         */
        toAngle(): number;
        /**
         * Returns the point represention of this vector
         */
        toPoint(): Point;
        /**
         * Rotates the current vector around a point by a certain number of
         * degrees in radians
         */
        rotate(angle: number, anchor: Point): Vector;
        /**
         * Creates new vector that has the same values as the previous.
         */
        clone(): Vector;
    }
    /**
     * A 2D ray that can be cast into the scene to do collision detection
     */
    class Ray {
        pos: Point;
        dir: Vector;
        /**
         * @param pos The starting position for the ray
         * @param dir The vector indicating the direction of the ray
         */
        constructor(pos: Point, dir: Vector);
        /**
         * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
         * This number indicates the mathematical intersection time.
         * @param line  The line to test
         */
        intersect(line: Line): number;
        /**
         * Returns the point of intersection given the intersection time
         */
        getPoint(time: number): Point;
    }
    /**
     * A 2D line segment
     */
    class Line {
        begin: Point;
        end: Point;
        /**
         * @param begin  The starting point of the line segment
         * @param end  The ending point of the line segment
         */
        constructor(begin: Point, end: Point);
        /**
         * Returns the slope of the line in the form of a vector
         */
        getSlope(): Vector;
        /**
         * Returns the length of the line segment in pixels
         */
        getLength(): number;
    }
    /**
     * A projection
     * @todo
     */
    class Projection {
        min: number;
        max: number;
        constructor(min: number, max: number);
        overlaps(projection: Projection): boolean;
        getOverlap(projection: Projection): number;
    }
}
/**
 * Utilities
 *
 * Excalibur utilities for math, string manipulation, etc.
 */
declare module ex.Util {
    var TwoPI: number;
    function base64Encode(inputStr: string): string;
    function clamp(val: any, min: any, max: any): any;
    function drawLine(ctx: CanvasRenderingContext2D, color: string, startx: any, starty: any, endx: any, endy: any): void;
    function randomInRange(min: number, max: number): number;
    function randomIntInRange(min: number, max: number): number;
    function canonicalizeAngle(angle: number): number;
    function toDegrees(radians: number): number;
    function toRadians(degrees: number): number;
    function getPosition(el: HTMLElement): Point;
    function addItemToArray<T>(item: T, array: T[]): boolean;
    function removeItemToArray<T>(item: T, array: T[]): boolean;
    function getOppositeSide(side: Side): Side;
    /**
     * Excaliburs dynamically resizing collection
     */
    class Collection<T> {
        /**
         * Default collection size
         */
        static DefaultSize: number;
        private _internalArray;
        private _endPointer;
        /**
         * @param initialSize  Initial size of the internal backing array
         */
        constructor(initialSize?: number);
        private _resize();
        /**
         * Push elements to the end of the collection
         */
        push(element: T): T;
        /**
         * Removes elements from the end of the collection
         */
        pop(): T;
        /**
         * Returns the count of the collection
         */
        count(): number;
        /**
         * Empties the collection
         */
        clear(): void;
        /**
         * Returns the size of the internal backing array
         */
        internalSize(): number;
        /**
         * Returns an element at a specific index
         * @param index  Index of element to retreive
         */
        elementAt(index: number): T;
        /**
         * Inserts an element at a specific index
         * @param index  Index to insert the element
         */
        insert(index: number, value: T): T;
        /**
         * Removes an element at a specific index
         * @param index  Index of element to remove
         */
        remove(index: number): T;
        /**
         * Removes an element by reference
         * @param element  Element to retreive
         */
        removeElement(element: T): void;
        /**
         * Returns a array representing the collection
         */
        toArray(): T[];
        /**
         * Iterate over every element in the collection
         * @param func  Callback to call for each element passing a reference to the element and its index, returned values are ignored
         */
        forEach(func: (element: T, index: number) => any): void;
        /**
         * Mutate every element in the collection
         * @param func  Callback to call for each element passing a reference to the element and its index, any values returned mutate
         * the collection
         */
        map(func: (element: T, index: number) => any): void;
    }
}
declare module ex {
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
     * constraints and hurt performance.
     *
     * It's still recommended to create an [[Animation]] or build in your effects to the sprites
     * for optimal performance.
     */
    class Sprite implements IDrawable {
        sx: number;
        sy: number;
        swidth: number;
        sheight: number;
        private _texture;
        rotation: number;
        anchor: Point;
        scale: Point;
        logger: Logger;
        /**
         * Draws the sprite flipped vertically
         */
        flipVertical: boolean;
        /**
         * Draws the sprite flipped horizontally
         */
        flipHorizontal: boolean;
        width: number;
        height: number;
        effects: Effects.ISpriteEffect[];
        internalImage: HTMLImageElement;
        private _spriteCanvas;
        private _spriteCtx;
        private _pixelData;
        private _pixelsLoaded;
        private _dirtyEffect;
        /**
         * @param image   The backing image texture to build the Sprite
         * @param sx      The x position of the sprite
         * @param sy      The y position of the sprite
         * @param swidth  The width of the sprite in pixels
         * @param sheight The height of the sprite in pixels
         */
        constructor(image: Texture, sx: number, sy: number, swidth: number, sheight: number);
        private _loadPixels();
        /**
         * Applies the [[Effects.Opacity]] to a sprite, setting the alpha of all pixels to a given value
         */
        opacity(value: number): void;
        /**
         * Applies the [[Effects.Grayscale]] to a sprite, removing color information.
         */
        grayscale(): void;
        /**
         * Applies the [[Effects.Invert]] to a sprite, inverting the pixel colors.
         */
        invert(): void;
        /**
         * Applies the [[Effects.Fill]] to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        fill(color: Color): void;
        /**
         * Applies the [[Effects.Colorize]] to a sprite, changing the color channels of all pixesl to be the average of the original color
         * and the provided color.
         */
        colorize(color: Color): void;
        /**
         * Applies the [[Effects.Lighten]] to a sprite, changes the lightness of the color according to HSL
         */
        lighten(factor?: number): void;
        /**
         * Applies the [[Effects.Darken]] to a sprite, changes the darkness of the color according to HSL
         */
        darken(factor?: number): void;
        /**
         * Applies the [[Effects.Saturate]] to a sprite, saturates the color acccording to HSL
         */
        saturate(factor?: number): void;
        /**
         * Applies the [[Effects.Desaturate]] to a sprite, desaturates the color acccording to HSL
         */
        desaturate(factor?: number): void;
        /**
         * Adds a new [[Effects.ISpriteEffect]] to this drawing.
         * @param effect  Effect to add to the this drawing
         */
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes a [[Effects.ISpriteEffect]] from this sprite.
         * @param effect  Effect to remove from this sprite
         */
        removeEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an effect given the index from this sprite.
         * @param index  Index of the effect to remove from this sprite
         */
        removeEffect(index: number): void;
        private _applyEffects();
        /**
         * Clears all effects from the drawing and return it to its original state.
         */
        clearEffects(): void;
        /**
         * Resets the internal state of the drawing (if any)
         */
        reset(): void;
        debugDraw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
         * @param ctx  The 2D rendering context
         * @param x    The x coordinate of where to draw
         * @param y    The y coordinate of where to draw
         */
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Produces a copy of the current sprite
         */
        clone(): Sprite;
    }
}
declare module ex {
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
    class SpriteSheet {
        image: Texture;
        private columns;
        private rows;
        sprites: Sprite[];
        private _internalImage;
        /**
         * @param image     The backing image texture to build the SpriteSheet
         * @param columns   The number of columns in the image texture
         * @param rows      The number of rows in the image texture
         * @param spWidth   The width of each individual sprite in pixels
         * @param spHeight  The height of each individual sprite in pixels
         */
        constructor(image: Texture, columns: number, rows: number, spWidth: number, spHeight: number);
        /**
         * Create an animation from the this SpriteSheet by listing out the
         * sprite indices. Sprites are organized in row major order in the SpriteSheet.
         * @param engine   Reference to the current game [[Engine]]
         * @param indices  An array of sprite indices to use in the animation
         * @param speed    The number in milliseconds to display each frame in the animation
         */
        getAnimationByIndices(engine: Engine, indices: number[], speed: number): Animation;
        /**
         * Create an animation from the this SpriteSheet by specifing the range of
         * images with the beginning and ending index
         * @param engine      Reference to the current game Engine
         * @param beginIndex  The index to start taking frames
         * @param endIndex    The index to stop taking frames
         * @param speed       The number in milliseconds to display each frame in the animation
         */
        getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number): Animation;
        /**
         * Treat the entire SpriteSheet as one animation, organizing the frames in
         * row major order.
         * @param engine  Reference to the current game [[Engine]]
         * @param speed   The number in milliseconds to display each frame the animation
         */
        getAnimationForAll(engine: Engine, speed: number): Animation;
        /**
         * Retreive a specific sprite from the SpriteSheet by its index. Sprites are organized
         * in row major order in the SpriteSheet.
         * @param index  The index of the sprite
         */
        getSprite(index: number): Sprite;
    }
    /**
     * Sprite Fonts
     *
     * Sprite fonts are a used in conjunction with a [[Label]] to specify
     * a particular bitmap as a font.
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
    class SpriteFont extends SpriteSheet {
        image: Texture;
        private alphabet;
        private caseInsensitive;
        private _spriteLookup;
        private _colorLookup;
        private _currentColor;
        /**
         * @param image           The backing image texture to build the SpriteFont
         * @param alphabet        A string representing all the characters in the image, in row major order.
         * @param caseInsensitve  Indicate whether this font takes case into account
         * @param columns         The number of columns of characters in the image
         * @param rows            The number of rows of characters in the image
         * @param spWdith         The width of each character in pixels
         * @param spHeight        The height of each character in pixels
         */
        constructor(image: Texture, alphabet: string, caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number);
        /**
         * Returns a dictionary that maps each character in the alphabet to the appropriate [[Sprite]].
         */
        getTextSprites(): {
            [x: string]: Sprite;
        };
    }
}
declare module ex {
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
    class TileMap {
        x: number;
        y: number;
        cellWidth: number;
        cellHeight: number;
        rows: number;
        cols: number;
        private _collidingX;
        private _collidingY;
        private _onScreenXStart;
        private _onScreenXEnd;
        private _onScreenYStart;
        private _onScreenYEnd;
        private _spriteSheets;
        logger: Logger;
        data: Cell[];
        /**
         * @param x             The x coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
         * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
         * @param rows          The number of rows in the TileMap (should not be changed once set)
         * @param cols          The number of cols in the TileMap (should not be changed once set)
         * @param spriteSheet   The spriteSheet to use for drawing
         */
        constructor(x: number, y: number, cellWidth: number, cellHeight: number, rows: number, cols: number);
        registerSpriteSheet(key: string, spriteSheet: SpriteSheet): void;
        /**
         * Returns the intersection vector that can be used to resolve collisions with actors. If there
         * is no collision null is returned.
         */
        collides(actor: Actor): Vector;
        /**
         * Returns the [[Cell]] by index (row major order)
         */
        getCellByIndex(index: number): Cell;
        /**
         * Returns the [[Cell]] by its x and y coordinates
         */
        getCell(x: number, y: number): Cell;
        /**
         * Returns the [[Cell]] by testing a point in global coordinates,
         * returns `null` if no cell was found.
         */
        getCellByPoint(x: number, y: number): Cell;
        update(engine: Engine, delta: number): void;
        /**
         * Draws the tile map to the screen. Called by the [[Scene]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Draws all the tile map's debug info. Called by the [[Scene]].
         * @param ctx  The current rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Tile sprites are used to render a specific sprite from a [[TileMap]]'s spritesheet(s)
     */
    class TileSprite {
        spriteSheetKey: string;
        spriteId: number;
        /**
         * @param spriteSheetKey  The key of the spritesheet to use
         * @param spriteId        The index of the sprite in the [[SpriteSheet]]
         */
        constructor(spriteSheetKey: string, spriteId: number);
    }
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
    class Cell {
        x: number;
        y: number;
        width: number;
        height: number;
        index: number;
        solid: boolean;
        sprites: TileSprite[];
        private _bounds;
        /**
         * @param x       Gets or sets x coordinate of the cell in world coordinates
         * @param y       Gets or sets y coordinate of the cell in world coordinates
         * @param width   Gets or sets the width of the cell
         * @param height  Gets or sets the height of the cell
         * @param index   The index of the cell in row major order
         * @param solid   Gets or sets whether this cell is solid
         * @param sprites The list of tile sprites to use to draw in this cell (in order)
         */
        constructor(x: number, y: number, width: number, height: number, index: number, solid?: boolean, sprites?: TileSprite[]);
        /**
         * Returns the bounding box for this cell
         */
        getBounds(): BoundingBox;
        /**
         * Gets the center coordinate of this cell
         */
        getCenter(): Vector;
        /**
         * Add another [[TileSprite]] to this cell
         */
        pushSprite(tileSprite: TileSprite): void;
        /**
         * Remove an instance of [[TileSprite]] from this cell
         */
        removeSprite(tileSprite: TileSprite): void;
        /**
         * Clear all sprites from this cell
         */
        clearSprites(): void;
    }
}
declare module ex {
    enum CollisionStrategy {
        Naive = 0,
        DynamicAABBTree = 1,
        SeparatingAxis = 2,
    }
    /**
     * Interface all collidable objects must implement
     */
    interface ICollidable {
        /**
         * Test whether this bounding box collides with another one.
         *
         * @param collidable  Other collidable to test
         * @returns           The intersection vector that can be used to resolve the collision. If there is no collision, `null` is returned.
         */
        collides(collidable: ICollidable): Vector;
        /**
         * Tests wether a point is contained within the collidable
         * @param point  The point to test
         */
        contains(point: Point): boolean;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Axis Aligned collision primitive for Excalibur.
     */
    class BoundingBox implements ICollidable {
        left: number;
        top: number;
        right: number;
        bottom: number;
        /**
         * @param left    x coordinate of the left edge
         * @param top     y coordinate of the top edge
         * @param right   x coordinate of the right edge
         * @param bottom  y coordinate of the bottom edge
         */
        constructor(left?: number, top?: number, right?: number, bottom?: number);
        /**
         * Returns the calculated width of the bounding box
         */
        getWidth(): number;
        /**
         * Returns the calculated height of the bounding box
         */
        getHeight(): number;
        /**
         * Returns the perimeter of the bounding box
         */
        getPerimeter(): number;
        /**
         * Tests wether a point is contained within the bounding box
         * @param p  The point to test
         */
        contains(p: Point): boolean;
        /**
         * Tests whether another bounding box is totally contained in this one
         * @param bb  The bounding box to test
         */
        contains(bb: BoundingBox): boolean;
        /**
         * Combines this bounding box and another together returning a new bounding box
         * @param other  The bounding box to combine
         */
        combine(other: BoundingBox): BoundingBox;
        /**
         * Test wether this bounding box collides with another returning,
         * the intersection vector that can be used to resovle the collision. If there
         * is no collision null is returned.
         * @param collidable  Other collidable to test
         */
        collides(collidable: ICollidable): Vector;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    class SATBoundingBox implements ICollidable {
        private _points;
        constructor(points: Point[]);
        getSides(): Line[];
        getAxes(): Vector[];
        project(axis: Vector): Projection;
        /**
         * Returns the calculated width of the bounding box, by generating an axis aligned box around the current
         */
        getWidth(): number;
        /**
         * Returns the calculated height of the bounding box, by generating an axis aligned box around the current
         */
        getHeight(): number;
        /**
         * Tests wether a point is contained within the bounding box,
         * using the [PIP algorithm](http://en.wikipedia.org/wiki/Point_in_polygon)
         *
         * @param p  The point to test
         */
        contains(p: Point): boolean;
        collides(collidable: ICollidable): Vector;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    /**
     * Excalibur base class that provides basic functionality such as [[EventDispatcher]]
     * and extending abilities for vanilla Javascript projects
     */
    class Class {
        /**
         * Direct access to the game object event dispatcher.
         */
        eventDispatcher: EventDispatcher;
        constructor();
        /**
         * Add an event listener. You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         * @obsolete Use [[Class.on]] instead
         */
        addEventListener(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Removes an event listener. If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified just that handler will be removed.
         *
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         * @obsolete Use [[Class.off]] instead
         */
        removeEventListener(eventName: string, handler?: (event?: GameEvent) => void): void;
        /**
         * Alias for `addEventListener`. You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Alias for `removeEventListener`. If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified only that handler will be removed.
         *
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
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
        static extend(methods: any): any;
    }
}
declare module ex {
    /**
     * The Excalibur timer hooks into the internal timer and fires callbacks,
     * after a certain interval, optionally repeating.
     */
    class Timer {
        static id: number;
        id: number;
        interval: number;
        fcn: () => void;
        repeats: boolean;
        private _elapsedTime;
        private _totalTimeAlive;
        complete: boolean;
        scene: Scene;
        /**
         * @param callback   The callback to be fired after the interval is complete.
         * @param repeats    Indicates whether this call back should be fired only once, or repeat after every interval as completed.
         */
        constructor(fcn: () => void, interval: number, repeats?: boolean);
        /**
         * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
         * @param delta  Number of elapsed milliseconds since the last update.
         */
        update(delta: number): void;
        getTimeRunning(): number;
        /**
         * Cancels the timer, preventing any further executions.
         */
        cancel(): void;
    }
}
declare module ex {
    interface ICollisionResolver {
        register(target: Actor): any;
        remove(tartet: Actor): any;
        evaluate(targets: Actor[]): CollisionPair[];
        update(targets: Actor[]): number;
        debugDraw(ctx: any, delta: any): void;
    }
}
declare module ex {
    class NaiveCollisionResolver implements ICollisionResolver {
        register(target: Actor): void;
        remove(tartet: Actor): void;
        evaluate(targets: Actor[]): CollisionPair[];
        update(targets: Actor[]): number;
        debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
    }
}
declare module ex {
    class TreeNode {
        parent: any;
        left: TreeNode;
        right: TreeNode;
        bounds: BoundingBox;
        height: number;
        actor: Actor;
        constructor(parent?: any);
        isLeaf(): boolean;
    }
    class DynamicTree {
        root: TreeNode;
        nodes: {
            [x: number]: TreeNode;
        };
        constructor();
        insert(leaf: TreeNode): void;
        remove(leaf: TreeNode): void;
        registerActor(actor: Actor): void;
        updateActor(actor: Actor): boolean;
        removeActor(actor: Actor): void;
        balance(node: TreeNode): TreeNode;
        getHeight(): number;
        query(actor: Actor, callback: (other: Actor) => boolean): void;
        rayCast(ray: Ray, max: any): Actor;
        getNodes(): TreeNode[];
        debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
    }
}
declare module ex {
    class DynamicTreeCollisionResolver implements ICollisionResolver {
        private _dynamicCollisionTree;
        register(target: Actor): void;
        remove(target: Actor): void;
        evaluate(targets: Actor[]): CollisionPair[];
        update(targets: Actor[]): number;
        debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
    }
}
declare module ex {
    /**
     * Collision pairs are used internally by Excalibur to resolve collision between actors. The
     * Pair prevents collisions from being evaluated more than one time
     */
    class CollisionPair {
        left: Actor;
        right: Actor;
        intersect: Vector;
        side: Side;
        /**
         * @param left       The first actor in the collision pair
         * @param right      The second actor in the collision pair
         * @param intersect  The minimum translation vector to separate the actors from the perspective of the left actor
         * @param side       The side on which the collision occured from the perspective of the left actor
         */
        constructor(left: Actor, right: Actor, intersect: Vector, side: Side);
        /**
         * Determines if this collision pair and another are equivalent.
         */
        equals(collisionPair: CollisionPair): boolean;
        /**
         * Evaluates the collision pair, performing collision resolution and event publishing appropriate to each collision type.
         */
        evaluate(): void;
    }
}
declare module ex {
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
    class BaseCamera {
        protected _follow: Actor;
        protected _focus: Point;
        protected _lerp: boolean;
        private _cameraMoving;
        private _currentLerpTime;
        private _lerpDuration;
        private _totalLerpTime;
        private _lerpStart;
        private _lerpEnd;
        protected _isShaking: boolean;
        private _shakeMagnitudeX;
        private _shakeMagnitudeY;
        private _shakeDuration;
        private _elapsedShakeTime;
        protected _isZooming: boolean;
        private _currentZoomScale;
        private _maxZoomScale;
        private _zoomDuration;
        private _elapsedZoomTime;
        private _zoomIncrement;
        private _easeInOutCubic(currentTime, startValue, endValue, duration);
        /**
         * Sets the [[Actor]] to follow with the camera
         * @param actor  The actor to follow
         */
        setActorToFollow(actor: Actor): void;
        /**
         * Returns the focal point of the camera
         */
        getFocus(): Point;
        /**
         * Sets the focal point of the camera. This value can only be set if there is no actor to be followed.
         * @param x The x coordinate of the focal point
         * @param y The y coordinate of the focal point
         */
        setFocus(x: number, y: number): void;
        /**
         * Sets the camera to shake at the specified magnitudes for the specified duration
         * @param magnitudeX  The x magnitude of the shake
         * @param magnitudeY  The y magnitude of the shake
         * @param duration    The duration of the shake in milliseconds
         */
        shake(magnitudeX: number, magnitudeY: number, duration: number): void;
        /**
         * Zooms the camera in or out by the specified scale over the specified duration.
         * If no duration is specified, it take effect immediately.
         * @param scale    The scale of the zoom
         * @param duration The duration of the zoom in milliseconds
         */
        zoom(scale: number, duration?: number): void;
        /**
         * Gets the current zoom scale
         */
        getZoom(): number;
        private _setCurrentZoomScale(zoomScale);
        /**
         * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
         * @param delta  The number of milliseconds since the last update
         */
        update(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
        private _isDoneShaking();
        private _isDoneZooming();
    }
    /**
     * An extension of [[BaseCamera]] that is locked vertically; it will only move side to side.
     *
     * Common usages: platformers.
     */
    class SideCamera extends BaseCamera {
        getFocus(): Point;
    }
    /**
     * An extension of [[BaseCamera]] that is locked to an [[Actor]] or
     * [[LockedCamera.focus|focal point]]; the actor will appear in the
     * center of the screen.
     *
     * Common usages: RPGs, adventure games, top-down games.
     */
    class LockedCamera extends BaseCamera {
        getFocus(): Point;
    }
}
declare module ex {
    interface IActionable {
        actions: ActionContext;
    }
}
/**
 * See [[ActionContext|Action API]] for more information about Actions.
 */
declare module ex.Internal.Actions {
    /**
     * Used for implementing actions for the [[ActionContext|Action API]].
     */
    interface IAction {
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    class EaseTo implements IAction {
        actor: Actor;
        easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        private _currentLerpTime;
        private _lerpDuration;
        private _lerpStart;
        private _lerpEnd;
        private _initialized;
        private _stopped;
        private _distance;
        constructor(actor: Actor, x: number, y: number, duration: number, easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number);
        private _initialize();
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    class MoveTo implements IAction {
        private _actor;
        x: number;
        y: number;
        private _start;
        private _end;
        private _dir;
        private _speed;
        private _distance;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, speed: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class MoveBy implements IAction {
        private _actor;
        x: number;
        y: number;
        private _distance;
        private _speed;
        private _time;
        private _start;
        private _end;
        private _dir;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, time: number);
        update(delta: Number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Follow implements IAction {
        private _actor;
        private _actorToFollow;
        x: number;
        y: number;
        private _current;
        private _end;
        private _dir;
        private _speed;
        private _maximumDistance;
        private _distanceBetween;
        private _started;
        private _stopped;
        constructor(actor: Actor, actorToFollow: Actor, followDistance?: number);
        update(delta: number): void;
        stop(): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
    }
    class Meet implements IAction {
        private _actor;
        private _actorToMeet;
        x: number;
        y: number;
        private _current;
        private _end;
        private _dir;
        private _speed;
        private _distanceBetween;
        private _started;
        private _stopped;
        private _speedWasSpecified;
        constructor(actor: Actor, actorToMeet: Actor, speed?: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class RotateTo implements IAction {
        private _actor;
        x: number;
        y: number;
        private _start;
        private _end;
        private _speed;
        private _rotationType;
        private _direction;
        private _distance;
        private _shortDistance;
        private _longDistance;
        private _shortestPathIsPositive;
        private _started;
        private _stopped;
        constructor(actor: Actor, angleRadians: number, speed: number, rotationType?: RotationType);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class RotateBy implements IAction {
        private _actor;
        x: number;
        y: number;
        private _start;
        private _end;
        private _speed;
        private _time;
        private _rotationType;
        private _direction;
        private _distance;
        private _shortDistance;
        private _longDistance;
        private _shortestPathIsPositive;
        private _started;
        private _stopped;
        constructor(actor: Actor, angleRadians: number, time: number, rotationType?: RotationType);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class ScaleTo implements IAction {
        private _actor;
        x: number;
        y: number;
        private _startX;
        private _startY;
        private _endX;
        private _endY;
        private _speedX;
        private _speedY;
        private _distanceX;
        private _distanceY;
        private _started;
        private _stopped;
        constructor(actor: Actor, scaleX: number, scaleY: number, speedX: number, speedY: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class ScaleBy implements IAction {
        private _actor;
        x: number;
        y: number;
        private _startX;
        private _startY;
        private _endX;
        private _endY;
        private _time;
        private _distanceX;
        private _distanceY;
        private _started;
        private _stopped;
        private _speedX;
        private _speedY;
        constructor(actor: Actor, scaleX: number, scaleY: number, time: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Delay implements IAction {
        x: number;
        y: number;
        private _actor;
        private _elapsedTime;
        private _delay;
        private _started;
        private _stopped;
        constructor(actor: Actor, delay: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Blink implements IAction {
        private _timeVisible;
        private _timeNotVisible;
        private _elapsedTime;
        private _totalTime;
        private _actor;
        private _duration;
        private _stopped;
        private _started;
        constructor(actor: Actor, timeVisible: number, timeNotVisible: number, numBlinks?: number);
        update(delta: any): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Fade implements IAction {
        x: number;
        y: number;
        private _actor;
        private _endOpacity;
        private _speed;
        private _multiplyer;
        private _started;
        private _stopped;
        constructor(actor: Actor, endOpacity: number, speed: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Die implements IAction {
        x: number;
        y: number;
        private _actor;
        private _started;
        private _stopped;
        constructor(actor: Actor);
        update(delta: number): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
    class CallMethod implements IAction {
        x: number;
        y: number;
        private _method;
        private _actor;
        private _hasBeenCalled;
        constructor(actor: Actor, method: () => any);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    class Repeat implements IAction {
        x: number;
        y: number;
        private _actor;
        private _actionQueue;
        private _repeat;
        private _originalRepeat;
        private _stopped;
        constructor(actor: Actor, repeat: number, actions: IAction[]);
        update(delta: any): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
    class RepeatForever implements IAction {
        x: number;
        y: number;
        private _actor;
        private _actionQueue;
        private _stopped;
        constructor(actor: Actor, actions: IAction[]);
        update(delta: any): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
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
    class ActionQueue {
        private _actor;
        private _actions;
        private _currentAction;
        private _completedActions;
        constructor(actor: Actor);
        add(action: IAction): void;
        remove(action: IAction): void;
        clearActions(): void;
        getActions(): IAction[];
        hasNext(): boolean;
        reset(): void;
        update(delta: number): void;
    }
    /**
     * An enum that describes the strategies that rotation actions can use
     */
    enum RotationType {
        /**
         * Rotation via `ShortestPath` will use the smallest angle
         * between the starting and ending points. This strategy is the default behavior.
         */
        ShortestPath = 0,
        /**
         * Rotation via `LongestPath` will use the largest angle
         * between the starting and ending points.
         */
        LongestPath = 1,
        /**
         * Rotation via `Clockwise` will travel in a clockwise direction,
         * regardless of the starting and ending points.
         */
        Clockwise = 2,
        /**
         * Rotation via `CounterClockwise` will travel in a counterclockwise direction,
         * regardless of the starting and ending points.
         */
        CounterClockwise = 3,
    }
}
declare module ex {
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
     * ## Known Issues
     *
     * **Rotation actions do not use shortest angle**
     * [Issue #282](https://github.com/excaliburjs/Excalibur/issues/282)
     *
     */
    class ActionContext {
        private _actors;
        private _queues;
        constructor();
        constructor(actor: Actor);
        constructor(actors: Actor[]);
        /**
         * Clears all queued actions from the Actor
         */
        clearActions(): void;
        addActorToContext(actor: Actor): void;
        removeActorFromContext(actor: Actor): void;
        /**
         * This method will move an actor to the specified x and y position at the
         * speed specified (in pixels per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x      The x location to move the actor to
         * @param y      The y location to move the actor to
         * @param speed  The speed in pixels per second to move
         */
        moveTo(x: number, y: number, speed: number): ActionContext;
        /**
         * This method will move an actor to the specified x and y position by a
         * certain time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param x     The x location to move the actor to
         * @param y     The y location to move the actor to
         * @param time  The time it should take the actor to move to the new location in milliseconds
         */
        moveBy(x: number, y: number, time: number): ActionContext;
        /**
         * This method will rotate an actor to the specified angle at the speed
         * specified (in radians per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param speed         The angular velocity of the rotation specified in radians per second
         */
        rotateTo(angleRadians: number, speed: number): ActionContext;
        /**
         * This method will rotate an actor to the specified angle by a certain
         * time (in milliseconds) and return back the actor. This method is part
         * of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param time          The time it should take the actor to complete the rotation in milliseconds
         */
        rotateBy(angleRadians: number, time: number): ActionContext;
        /**
         * This method will scale an actor to the specified size at the speed
         * specified (in magnitude increase per second) and return back the
         * actor. This method is part of the actor 'Action' fluent API allowing
         * action chaining.
         * @param size   The scaling factor to apply
         * @param speed  The speed of scaling specified in magnitude increase per second
         */
        scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): ActionContext;
        /**
         * This method will scale an actor to the specified size by a certain time
         * (in milliseconds) and return back the actor. This method is part of the
         * actor 'Action' fluent API allowing action chaining.
         * @param size   The scaling factor to apply
         * @param time   The time it should take to complete the scaling in milliseconds
         */
        scaleBy(sizeX: number, sizeY: number, time: number): ActionContext;
        /**
         * This method will cause an actor to blink (become visible and not
         * visible). Optionally, you may specify the number of blinks. Specify the amount of time
         * the actor should be visible per blink, and the amount of time not visible.
         * This method is part of the actor 'Action' fluent API allowing action chaining.
         * @param timeVisible     The amount of time to stay visible per blink in milliseconds
         * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
         * @param numBlinks       The number of times to blink
         */
        blink(timeVisible: number, timeNotVisible: number, numBlinks?: number): ActionContext;
        /**
         * This method will cause an actor's opacity to change from its current value
         * to the provided value by a specified time (in milliseconds). This method is
         * part of the actor 'Action' fluent API allowing action chaining.
         * @param opacity  The ending opacity
         * @param time     The time it should take to fade the actor (in milliseconds)
         */
        fade(opacity: number, time: number): ActionContext;
        /**
         * This method will delay the next action from executing for a certain
         * amount of time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param time  The amount of time to delay the next action in the queue from executing in milliseconds
         */
        delay(time: number): ActionContext;
        /**
         * This method will add an action to the queue that will remove the actor from the
         * scene once it has completed its previous actions. Any actions on the
         * action queue after this action will not be executed.
         */
        die(): ActionContext;
        /**
         * This method allows you to call an arbitrary method as the next action in the
         * action queue. This is useful if you want to execute code in after a specific
         * action, i.e An actor arrives at a destinatino after traversing a path
         */
        callMethod(method: () => any): ActionContext;
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions a certain number of times. If the number of repeats
         * is not specified it will repeat forever. This method is part of
         * the actor 'Action' fluent API allowing action chaining
         * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions
         * will repeat forever
         */
        repeat(times?: number): ActionContext;
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions forever. This method is part of the actor 'Action'
         * fluent API allowing action chaining.
         */
        repeatForever(): ActionContext;
        /**
         * This method will cause the actor to follow another at a specified distance
         * @param actor           The actor to follow
         * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
         */
        follow(actor: Actor, followDistance?: number): ActionContext;
        /**
         * This method will cause the actor to move towards another until they
         * collide "meet" at a specified speed.
         * @param actor  The actor to meet
         * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
         */
        meet(actor: Actor, speed?: number): ActionContext;
        /**
         * Returns a promise that resolves when the current action queue up to now
         * is finished.
         */
        asPromise<T>(): Promise<T>;
    }
}
declare module ex {
    /**
     * Grouping
     *
     * Groups are used for logically grouping Actors so they can be acted upon
     * in bulk.
     *
     * @todo Document this
     */
    class Group extends Class implements IActionable {
        name: string;
        scene: Scene;
        private _logger;
        private _members;
        actions: ActionContext;
        constructor(name: string, scene: Scene);
        add(actor: Actor): any;
        add(actors: Actor[]): any;
        remove(actor: Actor): void;
        move(vector: Vector): void;
        move(dx: number, dy: number): void;
        rotate(angle: number): void;
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
        emit(topic: string, event?: GameEvent): void;
        contains(actor: Actor): boolean;
        getMembers(): Actor[];
        getRandomMember(): Actor;
        getBounds(): BoundingBox;
    }
}
declare module ex {
    class SortedList<T> {
        private _getComparable;
        private _root;
        constructor(getComparable: () => any);
        find(element: any): boolean;
        private _find(node, element);
        get(key: number): any[];
        private _get(node, key);
        add(element: any): boolean;
        private _insert(node, element);
        removeByComparable(element: any): void;
        private _remove(node, element);
        private _cleanup(node, element);
        private _findMinNode(node);
        list(): T[];
        private _list(treeNode, results);
    }
    class BinaryTreeNode {
        private _key;
        private _data;
        private _left;
        private _right;
        constructor(key: number, data: any[], left: BinaryTreeNode, right: BinaryTreeNode);
        getKey(): number;
        setKey(key: number): void;
        getData(): any[];
        setData(data: any): void;
        getLeft(): BinaryTreeNode;
        setLeft(left: BinaryTreeNode): void;
        getRight(): BinaryTreeNode;
        setRight(right: BinaryTreeNode): void;
    }
    class MockedElement {
        private _key;
        constructor(key: number);
        getTheKey(): number;
        setKey(key: number): void;
    }
}
declare module ex {
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
    class Scene extends Class {
        /**
         * The actor this scene is attached to, if any
         */
        actor: Actor;
        /**
         * Gets or sets the current camera for the scene
         */
        camera: BaseCamera;
        /**
         * The actors in the current scene
         */
        children: Actor[];
        /**
         * The [[TileMap]]s in the scene, if any
         */
        tileMaps: TileMap[];
        /**
         * The [[Group]]s in the scene, if any
         */
        groups: {
            [x: string]: Group;
        };
        /**
         * Access to the Excalibur engine
         */
        engine: Engine;
        /**
         * The [[UIActor]]s in a scene, if any; these are drawn last
         */
        uiActors: Actor[];
        /**
         * Whether or the [[Scene]] has been initialized
         */
        isInitialized: boolean;
        private _sortedDrawingTree;
        private _collisionResolver;
        private _killQueue;
        private _timers;
        private _cancelQueue;
        private _logger;
        constructor(engine?: Engine);
        /**
         * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        onInitialize(engine: Engine): void;
        /**
         * This is called when the scene is made active and started. It is meant to be overriden,
         * this is where you should setup any DOM UI or event handlers needed for the scene.
         */
        onActivate(): void;
        /**
         * This is called when the scene is made transitioned away from and stopped. It is meant to be overriden,
         * this is where you should cleanup any DOM UI or event handlers needed for the scene.
         */
        onDeactivate(): void;
        /**
         * Publish an event to all actors in the scene
         * @param eventType  The name of the event to publish
         * @param event      The event object to send
         */
        publish(eventType: string, event: GameEvent): void;
        /**
         * Updates all the actors and timers in the scene. Called by the [[Engine]].
         * @param engine  Reference to the current Engine
         * @param delta   The number of milliseconds since the last update
         */
        update(engine: Engine, delta: number): void;
        /**
         * Draws all the actors in the Scene. Called by the [[Engine]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
         * @param ctx  The current rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
        /**
         * Checks whether an actor is contained in this scene or not
         */
        contains(actor: Actor): boolean;
        /**
         * Adds a [[Timer]] to the current scene.
         * @param timer  The timer to add to the current scene.
         */
        add(timer: Timer): void;
        /**
         * Adds a [[TileMap]] to the Scene, once this is done the TileMap will be drawn and updated.
         */
        add(tileMap: TileMap): void;
        /**
         * Adds an actor to the scene, once this is done the [[Actor]] will be drawn and updated.
         * @param actor  The actor to add to the current scene
         */
        add(actor: Actor): void;
        /**
         * Adds a [[UIActor]] to the scene.
         * @param uiActor  The UIActor to add to the current scene
         */
        add(uiActor: UIActor): void;
        /**
         * Removes a [[Timer]] from the current scene, it will no longer be updated.
         * @param timer  The timer to remove to the current scene.
         */
        remove(timer: Timer): void;
        /**
         * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
         * @param tileMap {TileMap}
         */
        remove(tileMap: TileMap): void;
        /**
         * Removes an actor from the scene, it will no longer be drawn or updated.
         * @param actor  The actor to remove from the current scene.
         */
        remove(actor: Actor): void;
        /**
         * Removes a [[UIActor]] to the scene, it will no longer be drawn or updated
         * @param uiActor  The UIActor to remove from the current scene
         */
        remove(uiActor: UIActor): void;
        /**
         * Adds (any) actor to act as a piece of UI, meaning it is always positioned
         * in screen coordinates. UI actors do not participate in collisions.
         * @todo Should this be `UIActor` only?
         */
        addUIActor(actor: Actor): void;
        /**
         * Removes an actor as a piece of UI
         */
        removeUIActor(actor: Actor): void;
        /**
         * Adds an actor to the scene, once this is done the actor will be drawn and updated.
         */
        addChild(actor: Actor): void;
        /**
         * Adds a [[TileMap]] to the scene, once this is done the TileMap will be drawn and updated.
         */
        addTileMap(tileMap: TileMap): void;
        /**
         * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
         */
        removeTileMap(tileMap: TileMap): void;
        /**
         * Removes an actor from the scene, it will no longer be drawn or updated.
         */
        removeChild(actor: Actor): void;
        /**
         * Adds a [[Timer]] to the scene
         * @param timer  The timer to add
         */
        addTimer(timer: Timer): Timer;
        /**
         * Removes a [[Timer]] from the scene.
         * @warning Can be dangerous, use [[cancelTimer]] instead
         * @param timer  The timer to remove
         */
        removeTimer(timer: Timer): Timer;
        /**
         * Cancels a [[Timer]], removing it from the scene nicely
         * @param timer  The timer to cancel
         */
        cancelTimer(timer: Timer): Timer;
        /**
         * Tests whether a [[Timer]] is active in the scene
         */
        isTimerActive(timer: Timer): boolean;
        /**
         * Creates and adds a [[Group]] to the scene with a name
         */
        createGroup(name: string): Group;
        /**
         * Returns a [[Group]] by name
         */
        getGroup(name: string): Group;
        /**
         * Removes a [[Group]] by name
         */
        removeGroup(name: string): void;
        /**
         * Removes a [[Group]] by reference
         */
        removeGroup(group: Group): void;
        /**
         * Removes the given actor from the sorted drawing tree
         */
        cleanupDrawTree(actor: Actor): void;
        /**
         * Updates the given actor's position in the sorted drawing tree
         */
        updateDrawTree(actor: Actor): void;
    }
}
declare module ex {
    /**
     * Standard easing functions for motion in Excalibur
     *
     * easeInQuad: function (t) { return t * t },
     * // decelerating to zero velocity
     * easeOutQuad: function (t) { return t * (2 - t) },
     * // acceleration until halfway, then deceleration
     * easeInOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
     * // accelerating from zero velocity
     * easeInCubic: function (t) { return t * t * t },
     * // decelerating to zero velocity
     * easeOutCubic: function (t) { return (--t) * t * t + 1 },
     * // acceleration until halfway, then deceleration
     * easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
     * // accelerating from zero velocity
     * easeInQuart: function (t) { return t * t * t * t },
     * // decelerating to zero velocity
     * easeOutQuart: function (t) { return 1 - (--t) * t * t * t },
     * // acceleration until halfway, then deceleration
     * easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
     * // accelerating from zero velocity
     * easeInQuint: function (t) { return t * t * t * t * t },
     * // decelerating to zero velocity
     * easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t },
     * // acceleration until halfway, then deceleration
     * easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
     *
     */
    class EasingFunctions {
        static Linear: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseInQuad: (currentTime: number, startValue: number, endValue: number, duration: number) => void;
        static EaseOutQuad: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseInOutQuad: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseInCubic: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseOutCubic: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseInOutCubic: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
    }
}
declare module ex {
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
     * ```
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
     * passed `delta` which is the time since the last frame, which can be used
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
     *       this.triggerEvent("death");
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
     *       this.triggerEvent("death");
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
     * to manipulate the textures/animations that the actor is using.
     *
     * ### Working with Textures & Sprites
     *
     * A common usage is to use a [[Texture]] or [[Sprite]] for an actor. If you are using the [[Loader]] to
     * pre-load assets, you can simply assign an actor a [[Texture]] to draw. You can
     * also create a [[Texture.asSprite|sprite from a Texture]] to quickly create a [[Sprite]] instance.
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
     * for example, to draw complex shapes or to use the raw Canvas API.
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
     * an actor participate, you need to enable the [[CollisionDetectionModule]]
     *
     * ```ts
     * public Player extends ex.Actor {
     *   constructor() {
     *     super();
     *
     *     // enable the pipeline
     *     this.pipelines.push(new ex.CollisionDetectionModule());
     *
     *     // set preferred CollisionType
     *     this.collisionType = ex.CollisionType.Active;
     *   }
     * }
     * ```
     *
     * ### Collision Groups
     *
     * TODO, needs more information.
     *
     * ## Known Issues
     *
     * **Actor bounding boxes do not rotate**
     * [Issue #68](https://github.com/excaliburjs/Excalibur/issues/68)
     *
     * **Setting opacity when using a color doesn't do anything**
     * [Issue #364](https://github.com/excaliburjs/Excalibur/issues/364)
     *
     * **Spawning an Actor next to another sometimes causes unexpected placement**
     * [Issue #319](https://github.com/excaliburjs/Excalibur/issues/319)
     *
     * **[[Actor.contains]] doesn't work with child actors and relative coordinates**
     * [Issue #147](https://github.com/excaliburjs/Excalibur/issues/147)
     */
    class Actor extends Class implements IActionable {
        /**
         * Indicates the next id to be set
         */
        static maxId: number;
        /**
         * The unique identifier for the actor
         */
        id: number;
        /**
         * The x coordinate of the actor (left edge)
         */
        x: number;
        /**
         * The y coordinate of the actor (top edge)
         */
        y: number;
        /**
         * The anchor to apply all actor related transformations like rotation,
         * translation, and rotation. By default the anchor is in the center of
         * the actor.
         *
         * Use `anchor.setTo` to set the anchor to a different point using
         * values between 0 and 1. For example, anchoring to the top-left would be
         * `Actor.anchor.setTo(0, 0)` and top-right would be `Actor.anchor.setTo(0, 1)`.
         */
        anchor: Point;
        private _height;
        private _width;
        /**
         * The rotation of the actor in radians
         */
        rotation: number;
        /**
         * The rotational velocity of the actor in radians/second
         */
        rx: number;
        /**
         * The scale vector of the actor
         */
        scale: Vector;
        /**
         * The x scalar velocity of the actor in scale/second
         */
        sx: number;
        /**
         * The y scalar velocity of the actor in scale/second
         */
        sy: number;
        /**
         * The x velocity of the actor in pixels/second
         */
        dx: number;
        /**
         * The x velocity of the actor in pixels/second
         */
        dy: number;
        /**
         * The x acceleration of the actor in pixels/second^2
         */
        ax: number;
        /**
         * The y acceleration of the actor in pixels/second^2
         */
        ay: number;
        /**
         * Indicates whether the actor is physically in the viewport
         */
        isOffScreen: boolean;
        /**
         * The visibility of an actor
         */
        visible: boolean;
        /**
         * The opacity of an actor. Passing in a color in the [[constructor]] will use the
         * color's opacity.
         */
        opacity: number;
        previousOpacity: number;
        /**
         * Direct access to the actor's [[ActionQueue]]. Useful if you are building custom actions.
         */
        actionQueue: Internal.Actions.ActionQueue;
        actions: ActionContext;
        /**
         * Convenience reference to the global logger
         */
        logger: Logger;
        /**
         * The scene that the actor is in
         */
        scene: Scene;
        /**
         * The parent of this actor
         */
        parent: Actor;
        /**
         * The children of this actor
         */
        children: Actor[];
        /**
         * Gets or sets the current collision type of this actor. By
         * default it is ([[CollisionType.PreventCollision]]).
         */
        collisionType: CollisionType;
        collisionGroups: string[];
        private _collisionHandlers;
        private _isInitialized;
        frames: {
            [x: string]: IDrawable;
        };
        /**
         * Access to the current drawing for the actor, this can be
         * an [[Animation]], [[Sprite]], or [[Polygon]].
         * Set drawings with [[setDrawing]].
         */
        currentDrawing: IDrawable;
        centerDrawingX: boolean;
        centerDrawingY: boolean;
        /**
         * Modify the current actor update pipeline.
         */
        traits: IActorTrait[];
        /**
         * Sets the color of the actor. A rectangle of this color will be
         * drawn if no [[IDrawable]] is specified as the actors drawing.
         *
         * The default is `null` which prevents a rectangle from being drawn.
         */
        color: Color;
        /**
         * Whether or not to enable the [[CapturePointer]] trait that propogates
         * pointer events to this actor
         */
        enableCapturePointer: boolean;
        /**
         * Configuration for [[CapturePointer]] trait
         */
        capturePointer: Traits.ICapturePointerConfig;
        private _zIndex;
        private _isKilled;
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
         * initial [[opacity]].
         */
        constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
        /**
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        onInitialize(engine: Engine): void;
        private _checkForPointerOptIn(eventName);
        /**
         * Add an event listener. You can listen for a variety of
         * events off of the engine; see [[GameEvent]]
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         * @obsolete Use [[on]] instead.
         */
        addEventListener(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Alias for `addEventListener`. You can listen for a variety of
         * events off of the engine; see [[GameEvent]]
         * @param eventName   Name of the event to listen for
         * @param handler     Event handler for the thrown event
         */
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * If the current actor is a member of the scene, this will remove
         * it from the scene graph. It will no longer be drawn or updated.
         */
        kill(): void;
        /**
         * Indicates wether the actor has been killed.
         */
        isKilled(): boolean;
        /**
         * Adds a child actor to this actor. All movement of the child actor will be
         * relative to the parent actor. Meaning if the parent moves the child will
         * move with it.
         * @param actor The child actor to add
         */
        addChild(actor: Actor): void;
        /**
         * Removes a child actor from this actor.
         * @param actor The child actor to remove
         */
        removeChild(actor: Actor): void;
        /**
         * Sets the current drawing of the actor to the drawing corresponding to
         * the key.
         * @param key The key of the drawing
         */
        setDrawing(key: string): any;
        /**
         * Sets the current drawing of the actor to the drawing corresponding to
         * an `enum` key (e.g. `Animations.Left`)
         * @param key The `enum` key of the drawing
         */
        setDrawing(key: number): any;
        /**
         * Adds a whole texture as the "default" drawing. Set a drawing using [[setDrawing]].
         */
        addDrawing(texture: Texture): any;
        /**
         * Adds a whole sprite as the "default" drawing. Set a drawing using [[setDrawing]].
         */
        addDrawing(sprite: Sprite): any;
        /**
         * Adds a drawing to the list of available drawings for an actor. Set a drawing using [[setDrawing]].
         * @param key     The key to associate with a drawing for this actor
         * @param drawing This can be an [[Animation]], [[Sprite]], or [[Polygon]].
         */
        addDrawing(key: any, drawing: IDrawable): any;
        /**
         * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         */
        getZIndex(): number;
        /**
         * Sets the z-index of an actor and updates it in the drawing list for the scene.
         * The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         * @param actor The child actor to remove
         */
        setZIndex(newIndex: number): void;
        /**
         * Artificially trigger an event on an actor, useful when creating custom events.
         * @param eventName   The name of the event to trigger
         * @param event       The event object to pass to the callback
         *
         * @obsolete  Will be replaced with `emit`
         */
        triggerEvent(eventName: string, event?: GameEvent): void;
        /**
         * Adds an actor to a collision group. Actors with no named collision groups are
         * considered to be in every collision group.
         *
         * Once in a collision group(s) actors will only collide with other actors in
         * that group.
         *
         * @param name The name of the collision group
         */
        addCollisionGroup(name: string): void;
        /**
         * Removes an actor from a collision group.
         * @param name The name of the collision group
         */
        removeCollisionGroup(name: string): void;
        /**
         * Get the center point of an actor
         */
        getCenter(): Vector;
        /**
         * Gets the calculated width of an actor, factoring in scale
         */
        getWidth(): number;
        /**
         * Sets the width of an actor, factoring in the current scale
         */
        setWidth(width: any): void;
        /**
         * Gets the calculated height of an actor, factoring in scale
         */
        getHeight(): number;
        /**
         * Sets the height of an actor, factoring in the current scale
         */
        setHeight(height: any): void;
        /**
         * Centers the actor's drawing around the center of the actor's bounding box
         * @param center Indicates to center the drawing around the actor
         */
        setCenterDrawing(center: boolean): void;
        /**
         * Gets the left edge of the actor
         */
        getLeft(): number;
        /**
         * Gets the right edge of the actor
         */
        getRight(): number;
        /**
         * Gets the top edge of the actor
         */
        getTop(): number;
        /**
         * Gets the bottom edge of the actor
         */
        getBottom(): number;
        /**
         * Gets the x value of the Actor in global coordinates
         */
        getWorldX(): any;
        /**
         * Gets the y value of the Actor in global coordinates
         */
        getWorldY(): any;
        /**
         * Gets the global scale of the Actor
         */
        getGlobalScale(): any;
        /**
         * Returns the actor's [[BoundingBox]] calculated for this instant.
         */
        getBounds(): BoundingBox;
        /**
         * Tests whether the x/y specified are contained in the actor
         * @param x  X coordinate to test (in world coordinates)
         * @param y  Y coordinate to test (in world coordinates)
         * @param recurse checks whether the x/y are contained in any child actors (if they exist).
         */
        contains(x: number, y: number, recurse?: boolean): boolean;
        /**
         * Returns the side of the collision based on the intersection
         * @param intersect The displacement vector returned by a collision
         */
        getSideFromIntersect(intersect: Vector): Side;
        /**
         * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
         * @param actor The other actor to test
         */
        collidesWithSide(actor: Actor): Side;
        /**
         * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
         * `null` when there is no collision;
         * @param actor The other actor to test
         */
        collides(actor: Actor): Vector;
        /**
         * Register a handler to fire when this actor collides with another in a specified group
         * @param group The group name to listen for
         * @param func The callback to fire on collision with another actor from the group. The callback is passed the other actor.
         */
        onCollidesWith(group: string, func: (actor: Actor) => void): void;
        getCollisionHandlers(): {
            [x: string]: {
                (actor: Actor): void;
            }[];
        };
        /**
         * Removes all collision handlers for this group on this actor
         * @param group Group to remove all handlers for on this actor.
         */
        removeCollidesWith(group: string): void;
        /**
         * Returns true if the two actors are less than or equal to the distance specified from each other
         * @param actor     Actor to test
         * @param distance  Distance in pixels to test
         */
        within(actor: Actor, distance: number): boolean;
        /**
         * Clears all queued actions from the Actor
         */
        clearActions(): void;
        /**
         * This method will move an actor to the specified `x` and `y` position over the
         * specified duration using a given [[EasingFunctions]] and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x         The x location to move the actor to
         * @param y         The y location to move the actor to
         * @param duration  The time it should take the actor to move to the new location in milliseconds
         * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position
         */
        easeTo(x: number, y: number, duration: number, easingFcn?: (currentTime: number, startValue: number, endValue: number, duration: number) => number): Actor;
        /**
         * This method will move an actor to the specified `x` and `y` position at the
         * `speed` specified (in pixels per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x       The x location to move the actor to
         * @param y       The y location to move the actor to
         * @param speed   The speed in pixels per second to move
         */
        moveTo(x: number, y: number, speed: number): Actor;
        /**
         * This method will move an actor to the specified `x` and `y` position by a
         * certain `duration` (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param x         The x location to move the actor to
         * @param y         The y location to move the actor to
         * @param duration  The time it should take the actor to move to the new location in milliseconds
         */
        moveBy(x: number, y: number, duration: number): Actor;
        /**
         * This method will rotate an actor to the specified angle (in radians) at the `speed`
         * specified (in radians per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param speed         The angular velocity of the rotation specified in radians per second
         */
        rotateTo(angleRadians: number, speed: number, rotationType?: any): Actor;
        /**
         * This method will rotate an actor to the specified angle by a certain
         * `duration` (in milliseconds) and return back the actor. This method is part
         * of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param duration          The time it should take the actor to complete the rotation in milliseconds
         */
        rotateBy(angleRadians: number, duration: number): Actor;
        /**
         * This method will scale an actor to the specified size at the speed
         * specified (in magnitude increase per second) and return back the
         * actor. This method is part of the actor 'Action' fluent API allowing
         * action chaining.
         * @param sizeX  The scaling factor in the x direction to apply
         * @param sizeY  The scaling factor in the y direction to apply
         * @param speedX The speed of scaling in the x direction specified in magnitude increase per second
         * @param speedY The speed of scaling in the y direction specified in magnitude increase per second
         */
        scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): Actor;
        /**
         * This method will scale an actor to the specified size by a certain duration
         * (in milliseconds) and return back the actor. This method is part of the
         * actor 'Action' fluent API allowing action chaining.
         * @param sizeX     The scaling factor in the x direction to apply
         * @param sizeY     The scaling factor in the y direction to apply
         * @param duration  The time it should take to complete the scaling in milliseconds
         */
        scaleBy(sizeX: number, sizeY: number, duration: number): Actor;
        /**
         * This method will cause an actor to blink (become visible and not
         * visible). Optionally, you may specify the number of blinks. Specify the amount of time
         * the actor should be visible per blink, and the amount of time not visible.
         * This method is part of the actor 'Action' fluent API allowing action chaining.
         * @param timeVisible     The amount of time to stay visible per blink in milliseconds
         * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
         * @param numBlinks       The number of times to blink
         */
        blink(timeVisible: number, timeNotVisible: number, numBlinks?: number): Actor;
        /**
         * This method will cause an actor's opacity to change from its current value
         * to the provided value by a specified `duration` (in milliseconds). This method is
         * part of the actor 'Action' fluent API allowing action chaining.
         * @param opacity   The ending opacity
         * @param duration  The time it should take to fade the actor (in milliseconds)
         */
        fade(opacity: number, duration: number): Actor;
        /**
         * This method will delay the next action from executing for the specified
         * `duration` (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param duration The amount of time to delay the next action in the queue from executing in milliseconds
         */
        delay(duration: number): Actor;
        /**
         * This method will add an action to the queue that will remove the actor from the
         * scene once it has completed its previous actions. Any actions on the
         * action queue after this action will not be executed.
         */
        die(): Actor;
        /**
         * This method allows you to call an arbitrary method as the next action in the
         * action queue. This is useful if you want to execute code in after a specific
         * action, i.e An actor arrives at a destination after traversing a path
         */
        callMethod(method: () => any): Actor;
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions a certain number of times. If the number of repeats
         * is not specified it will repeat forever. This method is part of
         * the actor 'Action' fluent API allowing action chaining
         * @param times The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions will
         * repeat forever
         */
        repeat(times?: number): Actor;
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions forever. This method is part of the actor 'Action'
         * fluent API allowing action chaining.
         */
        repeatForever(): Actor;
        /**
         * This method will cause the actor to follow another at a specified distance
         * @param actor           The actor to follow
         * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
         */
        follow(actor: Actor, followDistance?: number): Actor;
        /**
         * This method will cause the actor to move towards another Actor until they
         * collide ("meet") at a specified speed.
         * @param actor  The actor to meet
         * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
         */
        meet(actor: Actor, speed?: number): Actor;
        /**
         * Returns a promise that resolves when the current action queue up to now
         * is finished.
         */
        asPromise<T>(): Promise<T>;
        private _getCalculatedAnchor();
        /**
         * Called by the Engine, updates the state of the actor
         * @param engine The reference to the current game engine
         * @param delta  The time elapsed since the last update in milliseconds
         */
        update(engine: Engine, delta: number): void;
        /**
         * Called by the Engine, draws the actor to the screen
         * @param ctx   The rendering context
         * @param delta The time since the last draw in milliseconds
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Called by the Engine, draws the actors debugging to the screen
         * @param ctx The rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * An enum that describes the types of collisions actors can participate in
     */
    enum CollisionType {
        /**
         * Actors with the `PreventCollision` setting do not participate in any
         * collisions and do not raise collision events.
         */
        PreventCollision = 0,
        /**
         * Actors with the `Passive` setting only raise collision events, but are not
         * influenced or moved by other actors and do not influence or move other actors.
         */
        Passive = 1,
        /**
         * Actors with the `Active` setting raise collision events and participate
         * in collisions with other actors and will be push or moved by actors sharing
         * the `Active` or `Fixed` setting.
         */
        Active = 2,
        /**
         * Actors with the `Elastic` setting will behave the same as `Active`, except that they will
         * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
         * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
         */
        Elastic = 3,
        /**
         * Actors with the `Fixed` setting raise collision events and participate in
         * collisions with other actors. Actors with the `Fixed` setting will not be
         * pushed or moved by other actors sharing the `Fixed`. Think of Fixed
         * actors as "immovable/onstoppable" objects. If two `Fixed` actors meet they will
         * not be pushed or moved by each other, they will not interact except to throw
         * collision events.
         */
        Fixed = 4,
    }
}
declare module ex {
    /**
     * Logging level that Excalibur will tag
     */
    enum LogLevel {
        Debug = 0,
        Info = 1,
        Warn = 2,
        Error = 3,
        Fatal = 4,
    }
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
    class Logger {
        private static _instance;
        private _appenders;
        constructor();
        /**
         * Gets or sets the default logging level. Excalibur will only log
         * messages if equal to or above this level. Default: [[LogLevel.Info]]
         */
        defaultLevel: LogLevel;
        /**
         * Gets the current static instance of Logger
         */
        static getInstance(): Logger;
        /**
         * Adds a new [[IAppender]] to the list of appenders to write to
         */
        addAppender(appender: IAppender): void;
        /**
         * Clears all appenders from the logger
         */
        clearAppenders(): void;
        /**
         * Logs a message at a given LogLevel
         * @param level  The LogLevel`to log the message at
         * @param args   An array of arguments to write to an appender
         */
        private _log(level, args);
        /**
         * Writes a log message at the [[LogLevel.Debug]] level
         * @param args  Accepts any number of arguments
         */
        debug(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Info]] level
         * @param args  Accepts any number of arguments
         */
        info(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Warn]] level
         * @param args  Accepts any number of arguments
         */
        warn(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Error]] level
         * @param args  Accepts any number of arguments
         */
        error(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Fatal]] level
         * @param args  Accepts any number of arguments
         */
        fatal(...args: any[]): void;
    }
    /**
     * Contract for any log appender (such as console/screen)
     */
    interface IAppender {
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        log(level: LogLevel, args: any[]): void;
    }
    /**
     * Console appender for browsers (i.e. `console.log`)
     */
    class ConsoleAppender implements IAppender {
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        log(level: LogLevel, args: any[]): void;
    }
    /**
     * On-screen (canvas) appender
     */
    class ScreenAppender implements IAppender {
        private _messages;
        private _canvas;
        private _ctx;
        /**
         * @param width   Width of the screen appender in pixels
         * @param height  Height of the screen appender in pixels
         */
        constructor(width?: number, height?: number);
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        log(level: LogLevel, args: any[]): void;
    }
}
declare module ex {
    /**
     * An enum representing all of the built in event types for Excalibur
     * @obsolete Phasing this out in favor of classes
     */
    enum EventType {
        Collision = 0,
        EnterViewPort = 1,
        ExitViewPort = 2,
        Blur = 3,
        Focus = 4,
        Update = 5,
        Activate = 6,
        Deactivate = 7,
        Initialize = 8,
    }
    /**
     * Base event type in Excalibur that all other event types derive from.
     */
    class GameEvent {
        /**
         * Target object for this event.
         */
        target: any;
    }
    /**
     * Subscribe event thrown when handlers for events other than subscribe are added
     */
    class SubscribeEvent extends GameEvent {
        topic: string;
        handler: (event?: GameEvent) => void;
        constructor(topic: string, handler: (event?: GameEvent) => void);
    }
    /**
     * Unsubscribe event thrown when handlers for events other than unsubscribe are removed
     */
    class UnsubscribeEvent extends GameEvent {
        topic: string;
        handler: (event?: GameEvent) => void;
        constructor(topic: string, handler: (event?: GameEvent) => void);
    }
    /**
     * Event received by the Engine when the browser window is visible
     */
    class VisibleEvent extends GameEvent {
        constructor();
    }
    /**
     * Event received by the Engine when the browser window is hidden
     */
    class HiddenEvent extends GameEvent {
        constructor();
    }
    /**
     * Event thrown on an actor when a collision has occured
     */
    class CollisionEvent extends GameEvent {
        actor: Actor;
        other: Actor;
        side: Side;
        intersection: Vector;
        /**
         * @param actor  The actor the event was thrown on
         * @param other  The actor that was collided with
         * @param side   The side that was collided with
         */
        constructor(actor: Actor, other: Actor, side: Side, intersection: Vector);
    }
    /**
     * Event thrown on a game object on Excalibur update
     */
    class UpdateEvent extends GameEvent {
        delta: number;
        /**
         * @param delta  The number of milliseconds since the last update
         */
        constructor(delta: number);
    }
    /**
     * Event thrown on an Actor only once before the first update call
     */
    class InitializeEvent extends GameEvent {
        engine: Engine;
        /**
         * @param engine  The reference to the current engine
         */
        constructor(engine: Engine);
    }
    /**
     * Event thrown on a Scene on activation
     */
    class ActivateEvent extends GameEvent {
        oldScene: Scene;
        /**
         * @param oldScene  The reference to the old scene
         */
        constructor(oldScene: Scene);
    }
    /**
     * Event thrown on a Scene on deactivation
     */
    class DeactivateEvent extends GameEvent {
        newScene: Scene;
        /**
         * @param newScene  The reference to the new scene
         */
        constructor(newScene: Scene);
    }
    /**
     * Event thrown on an Actor when it completely leaves the screen.
     */
    class ExitViewPortEvent extends GameEvent {
        constructor();
    }
    /**
     * Event thrown on an Actor when it completely leaves the screen.
     */
    class EnterViewPortEvent extends GameEvent {
        constructor();
    }
}
declare module ex {
    /**
     * Excalibur's internal event dispatcher implementation.
     * Callbacks are fired immediately after an event is published.
     * Typically you'd use [[Class.eventDispatcher]] since most classes in
     * Excalibur inherit from [[Class]]. You'd rarely create an `EventDispatcher`
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
     * player.triggerEvent("death", new DeathEvent());
     *
     * ```
     *
     * ## Example: Pub/Sub with Excalibur
     *
     * You can also create an EventDispatcher for any arbitrary object, for example
     * a global game event aggregator (`vent`). Anything in your game can subscribe to
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
     * vent.publish("someevent", new ex.GameEvent());
     * ```
     */
    class EventDispatcher {
        private _handlers;
        private _wiredEventDispatchers;
        private _target;
        private _log;
        /**
         * @param target  The object that will be the recipient of events from this event dispatcher
         */
        constructor(target: any);
        /**
         * Publish an event for target
         * @param eventName  The name of the event to publish
         * @param event      Optionally pass an event data object to the handler
         */
        publish(eventName: string, event?: GameEvent): void;
        /**
         * Alias for [[publish]], publishes an event for target
         * @param eventName  The name of the event to publish
         * @param event      Optionally pass an event data object to the handler
         */
        emit(eventName: string, event?: GameEvent): void;
        /**
         * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
         * @param eventName  The name of the event to subscribe to
         * @param handler    The handler callback to fire on this event
         */
        subscribe(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Unsubscribe an event handler(s) from an event. If a specific handler
         * is specified for an event, only that handler will be unsubscribed.
         * Otherwise all handlers will be unsubscribed for that event.
         *
         * @param eventName  The name of the event to unsubscribe
         * @param handler    Optionally the specific handler to unsubscribe
         *
         */
        unsubscribe(eventName: string, handler?: (event?: GameEvent) => void): void;
        /**
         * Wires this event dispatcher to also recieve events from another
         */
        wire(eventDispatcher: EventDispatcher): void;
        /**
         * Unwires this event dispatcher from another
         */
        unwire(eventDispatcher: EventDispatcher): void;
    }
}
declare module ex {
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
    class Color {
        /**
         * Black (#000000)
         */
        static Black: Color;
        /**
         * White (#FFFFFF)
         */
        static White: Color;
        /**
         * Gray (#808080)
         */
        static Gray: Color;
        /**
         * Light gray (#D3D3D3)
         */
        static LightGray: Color;
        /**
         * Dark gray (#A9A9A9)
         */
        static DarkGray: Color;
        /**
         * Yellow (#FFFF00)
         */
        static Yellow: Color;
        /**
         * Orange (#FFA500)
         */
        static Orange: Color;
        /**
         * Red (#FF0000)
         */
        static Red: Color;
        /**
         * Vermillion (#FF5B31)
         */
        static Vermillion: Color;
        /**
         * Rose (#FF007F)
         */
        static Rose: Color;
        /**
         * Magenta (#FF00FF)
         */
        static Magenta: Color;
        /**
         * Violet (#7F00FF)
         */
        static Violet: Color;
        /**
         * Blue (#0000FF)
         */
        static Blue: Color;
        /**
         * Azure (#007FFF)
         */
        static Azure: Color;
        /**
         * Cyan (#00FFFF)
         */
        static Cyan: Color;
        /**
         * Viridian (#59978F)
         */
        static Viridian: Color;
        /**
         * Green (#00FF00)
         */
        static Green: Color;
        /**
         * Chartreuse (#7FFF00)
         */
        static Chartreuse: Color;
        /**
         * Transparent (#FFFFFF00)
         */
        static Transparent: Color;
        /**
         * Red channel
         */
        r: number;
        /**
         * Green channel
         */
        g: number;
        /**
         * Blue channel
         */
        b: number;
        /**
         * Alpha channel (between 0 and 1)
         */
        a: number;
        /**
         * Hue
         */
        h: number;
        /**
         * Saturation
         */
        s: number;
        /**
         * Lightness
         */
        l: number;
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        constructor(r: number, g: number, b: number, a?: number);
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        static fromRGB(r: number, g: number, b: number, a?: number): Color;
        /**
         * Creates a new inscance of Color from a hex string
         *
         * @param hex  CSS color string of the form #ffffff, the alpha component is optional
         */
        static fromHex(hex: string): Color;
        /**
         * Creats a new instance of Color from hsla values
         *
         * @param h  Hue is represented [0-1]
         * @param s  Saturation is represented [0-1]
         * @param l  Luminance is represented [0-1]
         * @param a  Alpha is represented [0-1]
         */
        static fromHSL(h: number, s: number, l: number, a?: number): Color;
        /**
         * Lightens the current color by a specified amount
         *
         * @param factor  The amount to lighten by [0-1]
         */
        lighten(factor?: number): Color;
        /**
         * Darkens the current color by a specified amount
         *
         * @param factor  The amount to darken by [0-1]
         */
        darken(factor?: number): Color;
        /**
         * Saturates the current color by a specified amount
         *
         * @param factor  The amount to saturate by [0-1]
         */
        saturate(factor?: number): Color;
        /**
         * Desaturates the current color by a specified amount
         *
         * @param factor  The amount to desaturate by [0-1]
         */
        desaturate(factor?: number): Color;
        /**
         * Multiplies a color by another, results in a darker color
         *
         * @param color  The other color
         */
        mulitiply(color: Color): Color;
        /**
         * Screens a color by another, results in a lighter color
         *
         * @param color  The other color
         */
        screen(color: Color): Color;
        /**
         * Inverts the current color
         */
        invert(): Color;
        /**
         * Averages the current color with another
         *
         * @param color  The other color
         */
        average(color: Color): Color;
        /**
         * Returns a CSS string representation of a color.
         */
        toString(): string;
        /**
         * Returns a CSS string representation of a color.
         */
        fillStyle(): string;
        /**
         * Returns a clone of the current color.
         */
        clone(): Color;
    }
}
declare module ex {
    /**
     * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
     * not participate in collisions. Drawn on top of all other actors.
     */
    class UIActor extends Actor {
        protected _engine: Engine;
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         */
        constructor(x?: number, y?: number, width?: number, height?: number);
        onInitialize(engine: Engine): void;
        contains(x: number, y: number, useWorld?: boolean): boolean;
    }
}
declare module ex {
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
    class Trigger extends Actor {
        private _action;
        repeats: number;
        target: Actor;
        /**
         * @param x       The x position of the trigger
         * @param y       The y position of the trigger
         * @param width   The width of the trigger
         * @param height  The height of the trigger
         * @param action  Callback to fire when trigger is activated, `this` will be bound to the Trigger instance
         * @param repeats The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
         */
        constructor(x?: number, y?: number, width?: number, height?: number, action?: () => void, repeats?: number);
        update(engine: Engine, delta: number): void;
        private _dispatchAction();
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    /**
     * An enum that represents the types of emitter nozzles
     */
    enum EmitterType {
        /**
         * Constant for the circular emitter type
         */
        Circle = 0,
        /**
         * Constant for the rectangular emitter type
         */
        Rectangle = 1,
    }
    /**
     * Particle is used in a [[ParticleEmitter]]
     */
    class Particle {
        position: Vector;
        velocity: Vector;
        acceleration: Vector;
        particleRotationalVelocity: number;
        currentRotation: number;
        focus: Vector;
        focusAccel: number;
        opacity: number;
        beginColor: Color;
        endColor: Color;
        life: number;
        fadeFlag: boolean;
        private _rRate;
        private _gRate;
        private _bRate;
        private _aRate;
        private _currentColor;
        emitter: ParticleEmitter;
        particleSize: number;
        particleSprite: Sprite;
        startSize: number;
        endSize: number;
        sizeRate: number;
        elapsedMultiplier: number;
        constructor(emitter: ParticleEmitter, life?: number, opacity?: number, beginColor?: Color, endColor?: Color, position?: Vector, velocity?: Vector, acceleration?: Vector, startSize?: number, endSize?: number);
        kill(): void;
        update(delta: number): void;
        draw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Particle Emitters
     *
     * Using a particle emitter is a great way to create interesting effects
     * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
     * extend [[Actor]] allowing you to use all of the features that come with.
     *
     * The easiest way to create a `ParticleEmitter` is to use the
     * [Particle Tester](http://excaliburjs.com/particle-tester/).
     *
     * ## Example: Adding an emitter
     *
     * ```js
     * var actor = new ex.Actor(...);
     * var emitter = new ex.ParticleEmitter(...);
     *
     * // set emitter settings
     * emitter.isEmitting = true;
     *
     * // add the emitter as a child actor, it will draw on top of the parent actor
     * // and move with the parent
     * actor.addChild(emitter);
     *
     * // or, alternatively, add it to the current scene
     * engine.add(emitter);
     * ```
     */
    class ParticleEmitter extends Actor {
        private _particlesToEmit;
        numParticles: number;
        /**
         * Gets or sets the isEmitting flag
         */
        isEmitting: boolean;
        /**
         * Gets or sets the backing particle collection
         */
        particles: Util.Collection<Particle>;
        /**
         * Gets or sets the backing deadParticle collection
         */
        deadParticles: Util.Collection<Particle>;
        /**
         * Gets or sets the minimum partical velocity
         */
        minVel: number;
        /**
         * Gets or sets the maximum partical velocity
         */
        maxVel: number;
        /**
         * Gets or sets the acceleration vector for all particles
         */
        acceleration: Vector;
        /**
         * Gets or sets the minimum angle in radians
         */
        minAngle: number;
        /**
         * Gets or sets the maximum angle in radians
         */
        maxAngle: number;
        /**
         * Gets or sets the emission rate for particles (particles/sec)
         */
        emitRate: number;
        /**
         * Gets or sets the life of each particle in milliseconds
         */
        particleLife: number;
        /**
         * Gets or sets the opacity of each particle from 0 to 1.0
         */
        opacity: number;
        /**
         * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
         */
        fadeFlag: boolean;
        /**
         * Gets or sets the optional focus where all particles should accelerate towards
         */
        focus: Vector;
        /**
         * Gets or sets the acceleration for focusing particles if a focus has been specified
         */
        focusAccel: number;
        startSize: number;
        endSize: number;
        /**
         * Gets or sets the minimum size of all particles
         */
        minSize: number;
        /**
         * Gets or sets the maximum size of all particles
         */
        maxSize: number;
        /**
         * Gets or sets the beginning color of all particles
         */
        beginColor: Color;
        /**
         * Gets or sets the ending color of all particles
         */
        endColor: Color;
        /**
         * Gets or sets the sprite that a particle should use
         * @warning Performance intensive
         */
        particleSprite: Sprite;
        /**
         * Gets or sets the emitter type for the particle emitter
         */
        emitterType: EmitterType;
        /**
         * Gets or sets the emitter radius, only takes effect when the [[emitterType]] is [[EmitterType.Circle]]
         */
        radius: number;
        /**
         * Gets or sets the particle rotational speed velocity
         */
        particleRotationalVelocity: number;
        /**
         * Indicates whether particles should start with a random rotation
         */
        randomRotation: boolean;
        /**
         * @param x       The x position of the emitter
         * @param y       The y position of the emitter
         * @param width   The width of the emitter
         * @param height  The height of the emitter
         */
        constructor(x?: number, y?: number, width?: number, height?: number);
        removeParticle(particle: Particle): void;
        /**
         * Causes the emitter to emit particles
         * @param particleCount  Number of particles to emit right now
         */
        emit(particleCount: number): void;
        clearParticles(): void;
        private _createParticle();
        update(engine: Engine, delta: number): void;
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
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
    class Animation implements IDrawable {
        /**
         * The sprite frames to play, in order. See [[SpriteSheet.getAnimationForAll]] to quickly
         * generate an [[Animation]].
         */
        sprites: Sprite[];
        /**
         * Duration to show each frame (in milliseconds)
         */
        speed: number;
        /**
         * Current frame index being shown
         */
        currentFrame: number;
        private _oldTime;
        anchor: Point;
        rotation: number;
        scale: Point;
        /**
         * Indicates whether the animation should loop after it is completed
         */
        loop: boolean;
        /**
         * Indicates the frame index the animation should freeze on for a non-looping
         * animation. By default it is the last frame.
         */
        freezeFrame: number;
        private _engine;
        /**
         * Flip each frame vertically. Sets [[Sprite.flipVertical]].
         */
        flipVertical: boolean;
        /**
         * Flip each frame horizontally. Sets [[Sprite.flipHorizontal]].
         */
        flipHorizontal: boolean;
        width: number;
        height: number;
        /**
         * Typically you will use a [[SpriteSheet]] to generate an [[Animation]].
         *
         * @param engine  Reference to the current game engine
         * @param images  An array of sprites to create the frames for the animation
         * @param speed   The number in milliseconds to display each frame in the animation
         * @param loop    Indicates whether the animation should loop after it is completed
         */
        constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean);
        /**
         * Applies the opacity effect to a sprite, setting the alpha of all pixels to a given value
         */
        opacity(value: number): void;
        /**
         * Applies the grayscale effect to a sprite, removing color information.
         */
        grayscale(): void;
        /**
         * Applies the invert effect to a sprite, inverting the pixel colors.
         */
        invert(): void;
        /**
         * Applies the fill effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        fill(color: Color): void;
        /**
         * Applies the colorize effect to a sprite, changing the color channels of all pixesl to be the average of the original color and the
         * provided color.
         */
        colorize(color: Color): void;
        /**
         * Applies the lighten effect to a sprite, changes the lightness of the color according to hsl
         */
        lighten(factor?: number): void;
        /**
         * Applies the darken effect to a sprite, changes the darkness of the color according to hsl
         */
        darken(factor?: number): void;
        /**
         * Applies the saturate effect to a sprite, saturates the color acccording to hsl
         */
        saturate(factor?: number): void;
        /**
         * Applies the desaturate effect to a sprite, desaturates the color acccording to hsl
         */
        desaturate(factor?: number): void;
        /**
         * Add a [[ISpriteEffect]] manually
         */
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an [[ISpriteEffect]] from this animation.
         * @param effect Effect to remove from this animation
         */
        removeEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an effect given the index from this animation.
         * @param index  Index of the effect to remove from this animation
         */
        removeEffect(index: number): void;
        /**
         * Clear all sprite effects
         */
        clearEffects(): void;
        private _setAnchor(point);
        private _setRotation(radians);
        private _setScale(scale);
        /**
         * Resets the animation to first frame.
         */
        reset(): void;
        /**
         * Indicates whether the animation is complete, animations that loop are never complete.
         */
        isDone(): boolean;
        /**
         * Not meant to be called by game developers. Ticks the animation forward internally and
         * calculates whether to change to the frame.
         * @internal
         */
        tick(): void;
        private _updateValues();
        /**
         * Skips ahead a specified number of frames in the animation
         * @param frames  Frames to skip ahead
         */
        skip(frames: number): void;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Plays an animation at an arbitrary location in the game.
         * @param x  The x position in the game to play
         * @param y  The y position in the game to play
         */
        play(x: number, y: number): void;
    }
}
declare module ex.Internal {
    interface ISound {
        setVolume(volume: number): any;
        setLoop(loop: boolean): any;
        isPlaying(): boolean;
        play(): Promise<any>;
        pause(): any;
        stop(): any;
        load(): any;
        onload: (e: any) => void;
        onprogress: (e: any) => void;
        onerror: (e: any) => void;
    }
    class FallbackAudio implements ISound {
        private _soundImpl;
        private _log;
        constructor(path: string, volume?: number);
        setVolume(volume: number): void;
        setLoop(loop: boolean): void;
        onload: (e: any) => void;
        onprogress: (e: any) => void;
        onerror: (e: any) => void;
        load(): void;
        isPlaying(): boolean;
        play(): Promise<any>;
        pause(): void;
        stop(): void;
    }
    class AudioTag implements ISound {
        path: string;
        private _audioElements;
        private _loadedAudio;
        private _isLoaded;
        private _index;
        private _log;
        private _isPlaying;
        private _playingTimer;
        private _currentOffset;
        constructor(path: string, volume?: number);
        isPlaying(): boolean;
        private _audioLoaded();
        setVolume(volume: number): void;
        setLoop(loop: boolean): void;
        getLoop(): void;
        onload: (e: any) => void;
        onprogress: (e: any) => void;
        onerror: (e: any) => void;
        load(): void;
        play(): Promise<any>;
        pause(): void;
        stop(): void;
    }
    class WebAudio implements ISound {
        private _context;
        private _volume;
        private _buffer;
        private _sound;
        private _path;
        private _isLoaded;
        private _loop;
        private _isPlaying;
        private _isPaused;
        private _playingTimer;
        private _currentOffset;
        private _playPromise;
        private _logger;
        constructor(soundPath: string, volume?: number);
        setVolume(volume: number): void;
        onload: (e: any) => void;
        onprogress: (e: any) => void;
        onerror: (e: any) => void;
        load(): void;
        setLoop(loop: boolean): void;
        isPlaying(): boolean;
        play(): Promise<any>;
        pause(): void;
        stop(): void;
    }
}
declare module ex {
    /**
     * Valid states for a promise to be in
     */
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
    class Promise<T> implements IPromise<T> {
        private _state;
        private _value;
        private _successCallbacks;
        private _rejectCallback;
        private _errorCallback;
        private _logger;
        /**
         * Wrap a value in a resolved promise
         * @param value  An optional value to wrap in a resolved promise
         */
        static wrap<T>(value?: T): Promise<T>;
        /**
         * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
         * when at least 1 promise rejects.
         */
        static join<T>(...promises: Promise<T>[]): Promise<T>;
        /**
         * Chain success and reject callbacks after the promise is resovled
         * @param successCallback  Call on resolution of promise
         * @param rejectCallback   Call on rejection of promise
         */
        then(successCallback?: (value?: T) => any, rejectCallback?: (value?: any) => any): Promise<T>;
        /**
         * Add an error callback to the promise
         * @param errorCallback  Call if there was an error in a callback
         */
        error(errorCallback?: (value?: any) => any): Promise<T>;
        /**
         * Resolve the promise and pass an option value to the success callbacks
         * @param value  Value to pass to the success callbacks
         */
        resolve(value?: T): Promise<T>;
        /**
         * Reject the promise and pass an option value to the reject callbacks
         * @param value  Value to pass to the reject callbacks
         */
        reject(value?: any): Promise<T>;
        /**
         * Inpect the current state of a promise
         */
        state(): PromiseState;
        private _handleError(e);
    }
}
declare module ex {
    /**
     * Loadables
     *
     * An interface describing loadable resources in Excalibur. Built-in loadable
     * resources include [[Texture]], [[Sound]], and a generic [[Resource]].
     *
     * ## Advanced: Custom loadables
     *
     * You can implement the [[ILoadable]] interface to create your own custom loadables.
     * This is an advanced feature, as the [[Resource]] class already wraps logic around
     * blob/plain data for usages like JSON, configuration, levels, etc through XHR (Ajax).
     *
     * However, as long as you implement the facets of a loadable, you can create your
     * own.
     */
    interface ILoadable {
        /**
         * Begins loading the resource and returns a promise to be resolved on completion
         */
        load(): Promise<any>;
        /**
         * Wires engine into loadable to receive game level events
         */
        wireEngine(engine: Engine): void;
        /**
         * onprogress handler
         */
        onprogress: (e: any) => void;
        /**
         * oncomplete handler
         */
        oncomplete: () => void;
        /**
         * onerror handler
         */
        onerror: (e: any) => void;
        /**
         * Returns true if the loadable is loaded
         */
        isLoaded(): boolean;
    }
}
declare module ex {
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
    class Resource<T> implements ILoadable {
        path: string;
        responseType: string;
        bustCache: boolean;
        data: T;
        logger: Logger;
        private _engine;
        /**
         * @param path          Path to the remote resource
         * @param responseType  The Content-Type to expect (e.g. `application/json`)
         * @param bustCache     Whether or not to cache-bust requests
         */
        constructor(path: string, responseType: string, bustCache?: boolean);
        /**
         * Returns true if the Resource is completely loaded and is ready
         * to be drawn.
         */
        isLoaded(): boolean;
        wireEngine(engine: Engine): void;
        private _cacheBust(uri);
        private _start(e);
        /**
         * Begin loading the resource and returns a promise to be resolved on completion
         */
        load(): Promise<T>;
        /**
         * Returns the loaded data once the resource is loaded
         */
        getData(): any;
        /**
         * This method is meant to be overriden to handle any additional
         * processing. Such as decoding downloaded audio bits.
         */
        processDownload(data: T): any;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: (e: any) => void;
    }
}
declare module ex {
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
    class Texture extends Resource<HTMLImageElement> {
        path: string;
        bustCache: boolean;
        /**
         * The width of the texture in pixels
         */
        width: number;
        /**
         * The height of the texture in pixels
         */
        height: number;
        /**
         * A [[Promise]] that resolves when the Texture is loaded.
         */
        loaded: Promise<any>;
        private _isLoaded;
        private _sprite;
        /**
         * Populated once loading is complete
         */
        image: HTMLImageElement;
        private _progressCallback;
        private _doneCallback;
        private _errorCallback;
        /**
         * @param path       Path to the image resource
         * @param bustCache  Optionally load texture with cache busting
         */
        constructor(path: string, bustCache?: boolean);
        /**
         * Returns true if the Texture is completely loaded and is ready
         * to be drawn.
         */
        isLoaded(): boolean;
        /**
         * Begins loading the texture and returns a promise to be resolved on completion
         */
        load(): Promise<HTMLImageElement>;
        asSprite(): Sprite;
    }
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
     * var sndPlayerDeath = new ex.Sound("/assets/snd/player-death.mp3", "/assets/snd/player-wav.mp3");
     *
     * var loader = new ex.Loader(sndPlayerDeath);
     *
     * game.start(loader).then(function () {
     *
     *   sndPlayerDeath.play();
     * });
     * ```
     */
    class Sound implements ILoadable, Internal.ISound {
        private _logger;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: (e: any) => void;
        onload: (e: any) => void;
        private _isLoaded;
        private _selectedFile;
        private _engine;
        private _wasPlayingOnHidden;
        /**
         * Populated once loading is complete
         */
        sound: Internal.FallbackAudio;
        /**
         * Whether or not the browser can play this file as HTML5 Audio
         */
        static canPlayFile(file: string): boolean;
        /**
         * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
         */
        constructor(...paths: string[]);
        wireEngine(engine: Engine): void;
        /**
         * Sets the volume of the sound clip
         * @param volume  A volume value between 0-1.0
         */
        setVolume(volume: number): void;
        /**
         * Indicates whether the clip should loop when complete
         * @param loop  Set the looping flag
         */
        setLoop(loop: boolean): void;
        /**
         * Whether or not the sound is playing right now
         */
        isPlaying(): boolean;
        /**
         * Play the sound, returns a promise that resolves when the sound is done playing
         */
        play(): Promise<any>;
        /**
         * Stop the sound, and do not rewind
         */
        pause(): void;
        /**
         * Stop the sound and rewind
         */
        stop(): void;
        /**
         * Returns true if the sound is loaded
         */
        isLoaded(): boolean;
        /**
         * Begins loading the sound and returns a promise to be resolved on completion
         */
        load(): Promise<Internal.FallbackAudio>;
    }
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
    class Loader implements ILoadable {
        private _resourceList;
        private _index;
        private _resourceCount;
        private _numLoaded;
        private _progressCounts;
        private _totalCounts;
        private _engine;
        /**
         * @param loadables  Optionally provide the list of resources you want to load at constructor time
         */
        constructor(loadables?: ILoadable[]);
        wireEngine(engine: Engine): void;
        /**
         * Add a resource to the loader to load
         * @param loadable  Resource to add
         */
        addResource(loadable: ILoadable): void;
        /**
         * Add a list of resources to the loader to load
         * @param loadables  The list of resources to load
         */
        addResources(loadables: ILoadable[]): void;
        private _sumCounts(obj);
        /**
         * Returns true if the loader has completely loaded all resources
         */
        isLoaded(): boolean;
        /**
         * Begin loading all of the supplied resources, returning a promise
         * that resolves when loading of all is complete
         */
        load(): Promise<any>;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: () => void;
    }
}
declare module ex {
    /**
     * Excalibur's built in templating class, it is a loadable that will load
     * and html fragment from a url. Excalibur templating is very basic only
     * allowing bindings of the type `data-text="this.obj.someprop"`,
     * `data-style="color:this.obj.color.toString()"`. Bindings allow all valid
     * Javascript expressions.
     */
    class Template implements ILoadable {
        path: string;
        private _htmlString;
        private _styleElements;
        private _textElements;
        private _innerElement;
        private _isLoaded;
        private _engine;
        logger: Logger;
        /**
         * @param path  Location of the html template
         */
        constructor(path: string);
        wireEngine(engine: Engine): void;
        /**
         * Returns the full html template string once loaded.
         */
        getTemplateString(): string;
        private _compile();
        private _evaluateExpresion(expression, ctx);
        /**
         * Applies any ctx object you wish and evaluates the template.
         * Overload this method to include your favorite template library.
         * You may return either an HTML string or a Dom node.
         * @param ctx Any object you wish to apply to the template
         */
        apply(ctx: any): any;
        /**
         * Begins loading the template. Returns a promise that resolves with the template string when loaded.
         */
        load(): Promise<string>;
        /**
         * Indicates whether the template has been loaded
         */
        isLoaded(): boolean;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: (e: any) => void;
    }
    /**
     * Excalibur's binding library that allows you to bind an html
     * template to the dom given a certain context. Excalibur bindings are only updated
     * when the update() method is called
     */
    class Binding {
        parent: HTMLElement;
        template: Template;
        private _renderedTemplate;
        private _ctx;
        /**
         * @param parentElementId  The id of the element in the dom to attach the template binding
         * @param template         The template you wish to bind
         * @param ctx              The context of the binding, which can be any object
         */
        constructor(parentElementId: string, template: Template, ctx: any);
        /**
         * Listen to any arbitrary object's events to update this binding
         * @param obj     Any object that supports addEventListener
         * @param events  A list of events to listen for
         * @param handler A optional handler to fire on any event
         */
        listen(obj: {
            addEventListener: any;
        }, events: string[], handler?: (evt?: GameEvent) => void): void;
        /**
         * Update this template binding with the latest values from
         * the ctx reference passed to the constructor
         */
        update(): void;
        private _applyTemplate(template, ctx);
    }
}
declare module ex {
    /**
     * Enum representing the different horizontal text alignments
     */
    enum TextAlign {
        /**
         * The text is left-aligned.
         */
        Left = 0,
        /**
         * The text is right-aligned.
         */
        Right = 1,
        /**
         * The text is centered.
         */
        Center = 2,
        /**
         * The text is aligned at the normal start of the line (left-aligned for left-to-right locales,
         * right-aligned for right-to-left locales).
         */
        Start = 3,
        /**
         * The text is aligned at the normal end of the line (right-aligned for left-to-right locales,
         * left-aligned for right-to-left locales).
         */
        End = 4,
    }
    /**
     * Enum representing the different baseline text alignments
     */
    enum BaseAlign {
        /**
         * The text baseline is the top of the em square.
         */
        Top = 0,
        /**
         * The text baseline is the hanging baseline.  Currently unsupported; this will act like
         * alphabetic.
         */
        Hanging = 1,
        /**
         * The text baseline is the middle of the em square.
         */
        Middle = 2,
        /**
         * The text baseline is the normal alphabetic baseline.
         */
        Alphabetic = 3,
        /**
         * The text baseline is the ideographic baseline; this is the bottom of
         * the body of the characters, if the main body of characters protrudes
         * beneath the alphabetic baseline.  Currently unsupported; this will
         * act like alphabetic.
         */
        Ideographic = 4,
        /**
         * The text baseline is the bottom of the bounding box.  This differs
         * from the ideographic baseline in that the ideographic baseline
         * doesn't consider descenders.
         */
        Bottom = 5,
    }
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
    class Label extends Actor {
        /**
         * The text to draw.
         */
        text: string;
        /**
         * The [[SpriteFont]] to use, if any. Overrides [[font]] if present.
         */
        spriteFont: SpriteFont;
        /**
         * The CSS font string (e.g. `10px sans-serif`, `10px Droid Sans Pro`). Web fonts
         * are supported, same as in CSS.
         */
        font: string;
        /**
         * Gets or sets the horizontal text alignment property for the label.
         */
        textAlign: TextAlign;
        /**
         * Gets or sets the baseline alignment property for the label.
         */
        baseAlign: BaseAlign;
        /**
         * Gets or sets the maximum width (in pixels) that the label should occupy
         */
        maxWidth: number;
        /**
         * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
         */
        letterSpacing: number;
        /**
         * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
         */
        caseInsensitive: boolean;
        private _textShadowOn;
        private _shadowOffsetX;
        private _shadowOffsetY;
        private _shadowColor;
        private _shadowColorDirty;
        private _textSprites;
        private _shadowSprites;
        private _color;
        /**
         * @param text        The text of the label
         * @param x           The x position of the label
         * @param y           The y position of the label
         * @param font        Use any valid CSS font string for the label's font. Web fonts are supported. Default is `10px sans-serif`.
         * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precendence
         * over a css font.
         */
        constructor(text?: string, x?: number, y?: number, font?: string, spriteFont?: SpriteFont);
        /**
         * Returns the width of the text in the label (in pixels);
         * @param ctx  Rending context to measure the string with
         */
        getTextWidth(ctx: CanvasRenderingContext2D): number;
        private _lookupTextAlign(textAlign);
        private _lookupBaseAlign(baseAlign);
        /**
         * Sets the text shadow for sprite fonts
         * @param offsetX      The x offset in pixels to place the shadow
         * @param offsetY      The y offset in pixles to place the shadow
         * @param shadowColor  The color of the text shadow
         */
        setTextShadow(offsetX: number, offsetY: number, shadowColor: Color): void;
        /**
         * Clears the current text shadow
         */
        clearTextShadow(): void;
        update(engine: Engine, delta: number): void;
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        private _fontDraw(ctx, delta, sprites);
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    interface IPostProcessor {
        process(image: ImageData, out: CanvasRenderingContext2D): void;
    }
}
declare module ex.Input {
    interface IEngineInput {
        keyboard: Keyboard;
        pointers: Pointers;
        gamepads: Gamepads;
    }
}
declare module ex.Input {
    /**
     * The type of pointer for a [[PointerEvent]].
     */
    enum PointerType {
        Touch = 0,
        Mouse = 1,
        Pen = 2,
        Unknown = 3,
    }
    /**
     * The mouse button being pressed.
     */
    enum PointerButton {
        Left = 0,
        Middle = 1,
        Right = 2,
        Unknown = 3,
    }
    /**
     * Determines the scope of handling mouse/touch events. See [[Pointers]] for more information.
     */
    enum PointerScope {
        /**
         * Handle events on the `canvas` element only. Events originating outside the
         * `canvas` will not be handled.
         */
        Canvas = 0,
        /**
         * Handles events on the entire document. All events will be handled by Excalibur.
         */
        Document = 1,
    }
    /**
     * Pointer events
     *
     * Represents a mouse, touch, or stylus event. See [[Pointers]] for more information on
     * handling pointer input.
     *
     * For mouse-based events, you can inspect [[PointerEvent.button]] to see what button was pressed.
     */
    class PointerEvent extends GameEvent {
        x: number;
        y: number;
        index: number;
        pointerType: PointerType;
        button: PointerButton;
        ev: any;
        /**
         * @param x            The `x` coordinate of the event (in world coordinates)
         * @param y            The `y` coordinate of the event (in world coordinates)
         * @param index        The index of the pointer (zero-based)
         * @param pointerType  The type of pointer
         * @param button       The button pressed (if [[PointerType.Mouse]])
         * @param ev           The raw DOM event being handled
         */
        constructor(x: number, y: number, index: number, pointerType: PointerType, button: PointerButton, ev: any);
    }
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
     * You can subscribe to pointer events through `engine.input.pointers`. A [[PointerEvent]] object is
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
     * canvas. This is useful if you don't care about events that occur outside.
     *
     * One real-world example is dragging and gestures. Sometimes a player will drag their
     * finger outside your game and then into it, expecting it to work. If [[PointerScope]]
     * is set to [[PointerScope.Canvas|Canvas]] this will not work. If it is set to
     * [[PointerScope.Document|Document]], it will.
     *
     * ## Responding to input
     *
     * The primary pointer can be a mouse, stylus, or 1 finger touch event. You
     * can inspect what it is from the [[PointerEvent]] handled.
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
     * high and allow actors to "opt-in" to handling pointer events.
     *
     * To opt-in, set [[Actor.enableCapturePointer]] to `true` and the [[Actor]] will
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
    class Pointers extends Class {
        private _engine;
        private _pointerDown;
        private _pointerUp;
        private _pointerMove;
        private _pointerCancel;
        private _pointers;
        private _activePointers;
        constructor(engine: Engine);
        /**
         * Primary pointer (mouse, 1 finger, stylus, etc.)
         */
        primary: Pointer;
        /**
         * Initializes pointer event listeners
         */
        init(scope?: PointerScope): void;
        update(delta: number): void;
        /**
         * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
         * @param index  The pointer index to retrieve
         */
        at(index: number): Pointer;
        /**
         * Get number of pointers being watched
         */
        count(): number;
        /**
         * Propogates events to actor if necessary
         */
        propogate(actor: any): void;
        private _handleMouseEvent(eventName, eventArr);
        private _handleTouchEvent(eventName, eventArr);
        private _handlePointerEvent(eventName, eventArr);
        /**
         * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
         * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
         */
        private _getPointerIndex(pointerId);
        private _stringToPointerType(s);
    }
    /**
     * Captures and dispatches PointerEvents
     */
    class Pointer extends Class {
    }
}
declare module ex.Input {
    /**
     * Enum representing input key codes
     */
    enum Keys {
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
    /**
     * Event thrown on a game object for a key event
     */
    class KeyEvent extends GameEvent {
        key: Keys;
        /**
         * @param key  The key responsible for throwing the event
         */
        constructor(key: Keys);
    }
    /**
     * Keyboard input
     *
     * Working with the keyboard is easy in Excalibur. You can inspect
     * whether a button is [[Keyboard.isKeyDown|down]], [[Keyboard.isKeyUp|up]], or
     * [[Keyboard.isKeyPressed|pressed]]. Common keys are held in the [[Input.Keys]]
     * enumeration but you can pass any character code to the methods.
     *
     * Excalibur subscribes to the browser events and keeps track of
     * what keys are currently down, up, or pressed. A key can be pressed
     * for multiple frames, but a key cannot be down or up for more than one
     * update frame.
     *
     * ## Inspecting the keyboard
     *
     * You can inspect [[Engine.input]] to see what the state of the keyboard
     * is during an update.
     *
     * ```ts
     * class Player extends ex.Actor {
     *   public update(engine, delta) {
     *
     *     if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.W) ||
     *         engine.input.keyboard.isKeyPressed(ex.Input.Keys.Up)) {
     *
     *       player._moveForward();
     *     }
     *
     *   }
     * }
     * ```
     */
    class Keyboard extends Class {
        private _keys;
        private _keysUp;
        private _keysDown;
        private _engine;
        constructor(engine: Engine);
        /**
         * Initialize Keyboard event listeners
         */
        init(): void;
        update(delta: number): void;
        /**
         * Gets list of keys being pressed down
         */
        getKeys(): Keys[];
        /**
         * Tests if a certain key is down. This is cleared at the end of the update frame.
         * @param key  Test wether a key is down
         */
        isKeyDown(key: Keys): boolean;
        /**
         * Tests if a certain key is pressed. This is persisted between frames.
         * @param key  Test wether a key is pressed
         */
        isKeyPressed(key: Keys): boolean;
        /**
         * Tests if a certain key is up. This is cleared at the end of the update frame.
         * @param key  Test wether a key is up
         */
        isKeyUp(key: Keys): boolean;
    }
}
declare module ex.Input {
    /**
     * Controller Support (Gamepads)
     *
     * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
     * to provide controller support for your games.
     *
     * You can query any [[Gamepad|Gamepads]] that are connected or listen to events ("button" and "axis").
     *
     * You must opt-in to controller support ([[Gamepads.enabled]]) because it is a polling-based
     * API, so we have to check it each update frame.
     *
     * Any number of gamepads are supported using the [[Gamepads.at]] method. If a [[Gamepad]] is
     * not connected, it will simply not throw events.
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
    class Gamepads extends Class {
        /**
         * Whether or not to poll for Gamepad input (default: `false`)
         */
        enabled: boolean;
        /**
         * Whether or not Gamepad API is supported
         */
        supported: boolean;
        /**
         * The minimum value an axis has to move before considering it a change
         */
        static MinAxisMoveThreshold: number;
        private _gamePadTimeStamps;
        private _oldPads;
        private _pads;
        private _initSuccess;
        private _engine;
        private _navigator;
        constructor(engine: Engine);
        init(): void;
        /**
         * Updates Gamepad state and publishes Gamepad events
         */
        update(delta: number): void;
        /**
         * Safely retrieves a Gamepad at a specific index and creates one if it doesn't yet exist
         */
        at(index: number): Gamepad;
        /**
         * Gets the number of connected gamepads
         */
        count(): number;
        private _clonePads(pads);
        /**
         * Fastest way to clone a known object is to do it yourself
         */
        private _clonePad(pad);
    }
    /**
     * Gamepad holds state information for a connected controller. See [[Gamepads]]
     * for more information on handling controller input.
     */
    class Gamepad extends Class {
        connected: boolean;
        private _buttons;
        private _axes;
        constructor();
        /**
         * Whether or not the given button is pressed
         * @param button     The button to query
         * @param threshold  The threshold over which the button is considered to be pressed
         */
        isButtonPressed(button: Buttons, threshold?: number): boolean;
        /**
         * Gets the given button value between 0 and 1
         */
        getButton(button: Buttons): number;
        /**
         * Gets the given axis value between -1 and 1. Values below
         * [[MinAxisMoveThreshold]] are considered 0.
         */
        getAxes(axes: Axes): number;
        updateButton(buttonIndex: number, value: number): void;
        updateAxes(axesIndex: number, value: number): void;
    }
    /**
     * Gamepad Buttons enumeration
     */
    enum Buttons {
        /**
         * Face 1 button (e.g. A)
         */
        Face1 = 0,
        /**
         * Face 2 button (e.g. B)
         */
        Face2 = 1,
        /**
         * Face 3 button (e.g. X)
         */
        Face3 = 2,
        /**
         * Face 4 button (e.g. Y)
         */
        Face4 = 3,
        /**
         * Left bumper button
         */
        LeftBumper = 4,
        /**
         * Right bumper button
         */
        RightBumper = 5,
        /**
         * Left trigger button
         */
        LeftTrigger = 6,
        /**
         * Right trigger button
         */
        RightTrigger = 7,
        /**
         * Select button
         */
        Select = 8,
        /**
         * Start button
         */
        Start = 9,
        /**
         * Left analog stick press (e.g. L3)
         */
        LeftStick = 10,
        /**
         * Right analog stick press (e.g. R3)
         */
        RightStick = 11,
        /**
         * D-pad up
         */
        DpadUp = 12,
        /**
         * D-pad down
         */
        DpadDown = 13,
        /**
         * D-pad left
         */
        DpadLeft = 14,
        /**
         * D-pad right
         */
        DpadRight = 15,
    }
    /**
     * Gamepad Axes enumeration
     */
    enum Axes {
        /**
         * Left analogue stick X direction
         */
        LeftStickX = 0,
        /**
         * Left analogue stick Y direction
         */
        LeftStickY = 1,
        /**
         * Right analogue stick X direction
         */
        RightStickX = 2,
        /**
         * Right analogue stick Y direction
         */
        RightStickY = 3,
    }
    /**
     * Gamepad button event. See [[Gamepads]] for information on responding to controller input.
     */
    class GamepadButtonEvent extends GameEvent {
        button: Buttons;
        value: number;
        /**
         * @param button  The Gamepad button
         * @param value   A numeric value between 0 and 1
         */
        constructor(button: Buttons, value: number);
    }
    /**
     * Gamepad axis event. See [[Gamepads]] for information on responding to controller input.
     */
    class GamepadAxisEvent extends GameEvent {
        axis: Axes;
        value: number;
        /**
         * @param axis  The Gamepad axis
         * @param value A numeric value between -1 and 1
         */
        constructor(axis: Axes, value: number);
    }
    /**
     * @internal
     */
    interface INavigatorGamepad {
        axes: number[];
        buttons: INavigatorGamepadButton[];
        connected: boolean;
        id: string;
        index: number;
        mapping: string;
        timestamp: number;
    }
    /**
     * @internal
     */
    interface INavigatorGamepadButton {
        pressed: boolean;
        value: number;
    }
    /**
     * @internal
     */
    interface INavigatorGamepadEvent {
        gamepad: INavigatorGamepad;
    }
}
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
 * These are the core concepts of Excalibur that you should be
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
 *
 * ## Effects and Particles
 *
 * Every game needs an explosion or two. Add sprite effects such as lighten,
 * darken, and colorize.
 *
 * - [[Effects|Sprite Effects]]
 * - [[ParticleEmitter|Particle Emitters]]
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
declare module ex {
    /**
     * Defines the available options to configure the Excalibur engine at constructor time.
     */
    interface IEngineOptions {
        /**
         * Configures the width of the game optionlaly.
         */
        width?: number;
        /**
         * Configures the height of the game optionally.
         */
        height?: number;
        /**
         * Configures the canvas element Id to use optionally.
         */
        canvasElementId?: string;
        /**
         * Configures the display mode.
         */
        displayMode?: DisplayMode;
        /**
         * Configures the pointer scope. Pointers scoped to the 'Canvas' can only fire events within the canvas viewport; whereas, 'Document'
         * (default) scoped will fire anywhere on the page.
         */
        pointerScope?: Input.PointerScope;
    }
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
     * scene. Only one [[Scene]] can be active at once, the engine does not update/draw any other
     * scene, which means any actors will not be updated/drawn if they are part of a deactivated scene.
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
     * The first operation run is the [[Engine.update|update]] loop. [[Actor]] and [[Scene]] both implement
     * an overridable/extendable `update` method. Use it to perform any logic-based operations
     * in your game for a particular class.
     *
     * ### Draw Loop
     *
     * The next step is the [[Engine.draw|draw]] loop. A [[Scene]] loops through its child [[Actor|actors]] and
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
    class Engine extends Class {
        /**
         * Direct access to the engine's canvas element
         */
        canvas: HTMLCanvasElement;
        /**
         * Direct access to the engine's 2D rendering context
         */
        ctx: CanvasRenderingContext2D;
        /**
         * Direct access to the canvas element ID, if an ID exists
         */
        canvasElementId: string;
        /**
         * The width of the game canvas in pixels
         */
        width: number;
        /**
         * The height of the game canvas in pixels
         */
        height: number;
        /**
         * Access engine input like pointer, keyboard, or gamepad
         */
        input: Input.IEngineInput;
        /**
         * Gets or sets the [[CollisionStrategy]] for Excalibur actors
         */
        collisionStrategy: CollisionStrategy;
        private _hasStarted;
        /**
         * Current FPS
         */
        fps: number;
        /**
         * Gets or sets the list of post processors to apply at the end of drawing a frame (such as [[ColorBlindCorrector]])
         */
        postProcessors: IPostProcessor[];
        /**
         * The current [[Scene]] being drawn and updated on screen
         */
        currentScene: Scene;
        /**
         * The default [[Scene]] of the game, use [[Engine.goToScene]] to transition to different scenes.
         */
        rootScene: Scene;
        /**
         * Contains all the scenes currently registered with Excalibur
         */
        scenes: {
            [x: string]: Scene;
        };
        private _animations;
        /**
         * Indicates whether the engine is set to fullscreen or not
         */
        isFullscreen: boolean;
        /**
         * Indicates the current [[DisplayMode]] of the engine.
         */
        displayMode: DisplayMode;
        /**
         * Indicates whether audio should be paused when the game is no longer visible.
         */
        pauseAudioWhenHidden: boolean;
        /**
         * Indicates whether the engine should draw with debug information
         */
        isDebug: boolean;
        debugColor: Color;
        /**
         * Sets the background color for the engine.
         */
        backgroundColor: Color;
        private _logger;
        private _isSmoothingEnabled;
        private _loader;
        private _isLoading;
        private _progress;
        private _total;
        private _loadingDraw;
        /**
         * Creates a new game using the given [[IEngineOptions]]
         */
        constructor(options: IEngineOptions);
        /**
         * Creates a new game with the given options
         * @param width            The width in pixels of the Excalibur game viewport
         * @param height           The height in pixels of the Excalibur game viewport
         * @param canvasElementId  If this is not specified, then a new canvas will be created and inserted into the body.
         * @param displayMode      If this is not specified, then it will fall back to fixed if a height and width are specified, else the
         * display mode will be FullScreen.
         * @obsolete Use [[Engine.constructor]] with [[IEngineOptions]]
         */
        constructor(width?: number, height?: number, canvasElementId?: string, displayMode?: DisplayMode);
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
        playAnimation(animation: Animation, x: number, y: number): void;
        /**
         * Adds an actor to the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.addChild(actor)`.
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the [[currentScene]] may be drawn or updated.
         *
         * @param actor  The actor to add to the [[currentScene]]
         */
        addChild(actor: Actor): void;
        /**
         * Removes an actor from the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.removeChild(actor)`.
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @param actor  The actor to remove from the [[currentScene]].
         */
        removeChild(actor: Actor): void;
        /**
         * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
         * will be drawn and updated.
         */
        addTileMap(tileMap: TileMap): void;
        /**
         * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
         */
        removeTileMap(tileMap: TileMap): void;
        /**
         * Adds a [[Timer]] to the [[currentScene]].
         * @param timer  The timer to add to the [[currentScene]].
         */
        addTimer(timer: Timer): Timer;
        /**
         * Removes a [[Timer]] from the [[currentScene]].
         * @param timer  The timer to remove to the [[currentScene]].
         */
        removeTimer(timer: Timer): Timer;
        /**
         * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
         * would levels or menus.
         *
         * @param key  The name of the scene, must be unique
         * @param scene The scene to add to the engine
         */
        addScene(key: string, scene: Scene): void;
        /**
         * Removes a [[Scene]] instance from the engine
         * @param scene  The scene to remove
         */
        removeScene(scene: Scene): void;
        /**
         * Removes a scene from the engine by key
         * @param key  The scene key to remove
         */
        removeScene(key: string): void;
        /**
         * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
         * would levels or menus.
         * @param sceneKey  The key of the scene, must be unique
         * @param scene     The scene to add to the engine
         */
        add(sceneKey: string, scene: Scene): void;
        /**
         * Adds a [[Timer]] to the [[currentScene]].
         * @param timer  The timer to add to the [[currentScene]].
         */
        add(timer: Timer): void;
        /**
         * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
         * will be drawn and updated.
         */
        add(tileMap: TileMap): void;
        /**
         * Adds an actor to the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.addChild(actor)`.
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the [[currentScene]] may be drawn or updated.
         *
         * @param actor  The actor to add to the [[currentScene]]
         */
        add(actor: Actor): void;
        /**
         * Adds a [[UIActor]] to the [[currentScene]] of the game,
         * UIActors do not participate in collisions, instead the
         * remain in the same place on the screen.
         * @param uiActor  The UIActor to add to the [[currentScene]]
         */
        add(uiActor: UIActor): void;
        /**
         * Removes a scene instance from the engine
         * @param scene  The scene to remove
         */
        remove(scene: Scene): void;
        /**
         * Removes a scene from the engine by key
         * @param sceneKey  The scene to remove
         */
        remove(sceneKey: string): void;
        /**
         * Removes a [[Timer]] from the [[currentScene]].
         * @param timer  The timer to remove to the [[currentScene]].
         */
        remove(timer: Timer): void;
        /**
         * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
         */
        remove(tileMap: TileMap): void;
        /**
         * Removes an actor from the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.removeChild(actor)`.
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @param actor  The actor to remove from the [[currentScene]].
         */
        remove(actor: Actor): void;
        /**
         * Removes a [[UIActor]] to the scene, it will no longer be drawn or updated
         * @param uiActor  The UIActor to remove from the [[currentScene]]
         */
        remove(uiActor: UIActor): void;
        /**
         * Changes the currently updating and drawing scene to a different,
         * named scene. Calls the [[Scene]] lifecycle events.
         * @param key  The key of the scene to trasition to.
         */
        goToScene(key: string): void;
        /**
         * Returns the width of the engine's drawing surface in pixels.
         */
        getWidth(): number;
        /**
         * Returns the height of the engine's drawing surface in pixels.
         */
        getHeight(): number;
        /**
         * Transforms the current x, y from screen coordinates to world coordinates
         * @param point  Screen coordinate to convert
         */
        screenToWorldCoordinates(point: Point): Point;
        /**
         * Transforms a world coordinate, to a screen coordinate
         * @param point  World coordinate to convert
         */
        worldToScreenCoordinates(point: Point): Point;
        /**
         * Sets the internal canvas height based on the selected display mode.
         */
        private _setHeightByDisplayMode(parent);
        /**
         * Initializes the internal canvas, rendering context, displaymode, and native event listeners
         */
        private _initialize(options?);
        /**
         * If supported by the browser, this will set the antialiasing flag on the
         * canvas. Set this to `false` if you want a 'jagged' pixel art look to your
         * image resources.
         * @param isSmooth  Set smoothing to true or false
         */
        setAntialiasing(isSmooth: boolean): void;
        /**
         * Return the current smoothing status of the canvas
         */
        getAntialiasing(): boolean;
        /**
         * Updates the entire state of the game
         * @param delta  Number of milliseconds elapsed since the last update.
         */
        private _update(delta);
        /**
         * Draws the entire game
         * @param draw  Number of milliseconds elapsed since the last draw.
         */
        private _draw(delta);
        /**
         * Starts the internal game loop for Excalibur after loading
         * any provided assets.
         * @param loader  Optional resources to load before starting the main loop. Some [[ILoadable]] such as a [[Loader]] collection,
         * [[Sound]], or [[Texture]].
         */
        start(loader?: ILoadable): Promise<any>;
        /**
         * Stops Excalibur's main loop, useful for pausing the game.
         */
        stop(): void;
        /**
         * Takes a screen shot of the current viewport and returns it as an
         * HTML Image Element.
         */
        screenshot(): HTMLImageElement;
        /**
         * Draws the Excalibur loading bar
         * @param ctx     The canvas rendering context
         * @param loaded  Number of bytes loaded
         * @param total   Total number of bytes to load
         */
        private _drawLoadingBar(ctx, loaded, total);
        /**
         * Sets the loading screen draw function if you want to customize the draw
         * @param fcn  Callback to draw the loading screen which is passed a rendering context, the number of bytes loaded, and the total
         * number of bytes to load.
         */
        setLoadingDrawFunction(fcn: (ctx: CanvasRenderingContext2D, loaded: number, total: number) => void): void;
        /**
         * Another option available to you to load resources into the game.
         * Immediately after calling this the game will pause and the loading screen
         * will appear.
         * @param loader  Some [[ILoadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
         */
        load(loader: ILoadable): Promise<any>;
    }
    /**
     * Enum representing the different display modes available to Excalibur
     */
    enum DisplayMode {
        /**
         * Show the game as full screen
         */
        FullScreen = 0,
        /**
         * Scale the game to the parent DOM container
         */
        Container = 1,
        /**
         * Show the game as a fixed size
         */
        Fixed = 2,
    }
}
