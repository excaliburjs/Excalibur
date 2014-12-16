declare module ex {
    module Effects {
        /**
         * The interface that all sprite effects must implement
         * @class ISpriteEffect
         */
        interface ISpriteEffect {
            /**
             * Should update individual pixels values
             * @method updatePixel
             * @param x {number} The pixel's x coordinate
             * @param y {number} The pixel's y coordinate
             * @param imageData {ImageData} The sprites raw pixel data
             */
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Grayscale" effect to a sprite, removing color information.
         * @class Effects.Grayscale
         * @constructor
         * @extends ISpriteEffect
         */
        class Grayscale implements ISpriteEffect {
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Invert" effect to a sprite, inverting the pixel colors.
         * @class Effects.Invert
         * @constructor
         * @extends ISpriteEffect
         */
        class Invert implements ISpriteEffect {
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Opacity" effect to a sprite, setting the alpha of all pixels to a given value.
         * @class Effects.Opacity
         * @extends ISpriteEffect
         * @constructor
         * @param opacity {number} The new opacity of the sprite from 0-1.0
         */
        class Opacity implements ISpriteEffect {
            opacity: number;
            constructor(opacity: number);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Colorize" effect to a sprite, changing the color channels of all the pixels to an
         * average of the original color and the provided color
         * @class Effects.Colorize
         * @extends ISpriteEffect
         * @constructor
         * @param color {Color} The color to apply to the sprite
         */
        class Colorize implements ISpriteEffect {
            color: Color;
            constructor(color: Color);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
        /**
         * Applies the "Fill" effect to a sprite, changing the color channels of all non-transparent pixels to match
         * a given color
         * @class Effects.Fill
         * @extends ISpriteEffect
         * @constructor
         * @param color {Color} The color to apply to the sprite
         */
        class Fill implements ISpriteEffect {
            color: Color;
            constructor(color: Color);
            updatePixel(x: number, y: number, imageData: ImageData): void;
        }
    }
}
declare module ex {
    /**
     * Interface for implementing anything in Excalibur that can be drawn to the screen.
     * @class IDrawable
     */
    interface IDrawable {
        /**
         * Indicates whether the drawing is to be flipped vertically
         * @property flipVertical {boolean}
         */
        flipVertical: boolean;
        /**
         * Indicates whether the drawing is to be flipped horizontally
         * @property flipHorizontal {boolean}
         */
        flipHorizontal: boolean;
        /**
         * Indicates the width of the drawing in pixels
         * @property width {number}
         */
        width: number;
        /**
         * Indicates the height of the drawing in pixels
         * @property height {number}
         */
        height: number;
        /**
         * Adds a new {{#crossLink ISpriteEffect}}{{/crossLink}} to this drawing.
         * @method addEffect
         * @param effect {ISpriteEffect} Effect to add to the this drawing
         */
        addEffect(effect: Effects.ISpriteEffect): any;
        /**
         * Removes an effect {{#crossLink ISpriteEffect}}{{/crossLink}} from this drawing.
         * @method removeEffect
         * @param effect {{ISpriteEffect}} Effect to remove from this drawing
         */
        removeEffect(effect: Effects.ISpriteEffect): any;
        /**
         * Removes an effect by index from this drawing.
         * @method removeEffect
         * @param index {{number}} Index of the effect to remove from this drawing
         */
        removeEffect(index: number): any;
        removeEffect(param: any): any;
        /**
         * Clears all effects from the drawing and return it to its original state.
         * @method clearEffects
         */
        clearEffects(): any;
        /**
         * Sets the point about which to apply transformations to the drawing relative to the
         * top left corner of the drawing.
         * @method transformAbotPoint
         * @param point {Point} The point about which to apply transformations
         */
        transformAboutPoint(point: Point): any;
        /**
         * Sets the scale trasformation
         * @method setScale
         * @param scale {number} The magnitude to scale the drawing in the x direction
         */
        setScaleX(scale: number): any;
        /**
         * Sets the scale trasformation
         * @method setScale
         * @param scale {number} The magnitude to scale the drawing in the y direction
         */
        setScaleY(scale: number): any;
        /**
         * Returns the current magnitude of the drawing's scale in the x direction.
         * @method getScaleX
         * @returns number
         */
        getScaleX(): number;
        /**
         * Returns the current magnitude of the drawing's scale in the y direction.
         * @method getScaleY
         * @returns number
         */
        getScaleY(): number;
        /**
         * Sets the current rotation transformation for the drawing.
         * @method setRotation
         * @param radians {number} The rotation to apply to the drawing.
         */
        setRotation(radians: number): any;
        /**
         * Returns the current rotation for the drawing.
         * @method getRotation
         * @returns number
         */
        getRotation(): number;
        /**
         * Resets the internal state of the drawing (if any)
         * @method reset
         */
        reset(): any;
        /**
         * Draws the sprite appropriately to the 2D rendering context.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The 2D rendering context
         * @param x {number} The x coordinate of where to draw
         * @param y {number} The y coordinate of where to draw
         */
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): any;
    }
}
declare module ex {
    /**
    * An interface describing actor update pipeline modules
    * @class ILoadable
    */
    interface IPipelineModule {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex {
    class MovementModule implements IPipelineModule {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex {
    class OffscreenCullingModule implements IPipelineModule {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex {
    interface ICapturePointerConfig {
        /**
         * Capture PointerMove events (may be expensive!)
         * @property
         */
        captureMoveEvents: boolean;
    }
    /**
     * Propogates pointer events to the actor
     */
    class CapturePointerModule implements IPipelineModule {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex {
    class CollisionDetectionModule implements IPipelineModule {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module ex {
    /**
     * An enum that describes the sides of an Actor for collision
     * @class Side
     */
    enum Side {
        /**
        @property None {Side}
        @static
        @final
        */
        None = 0,
        /**
        @property Top {Side}
        @static
        @final
        */
        Top = 1,
        /**
        @property Bottom {Side}
        @static
        @final
        */
        Bottom = 2,
        /**
        @property Left {Side}
        @static
        @final
        */
        Left = 3,
        /**
        @property Right {Side}
        @static
        @final
        */
        Right = 4,
    }
}
declare module ex {
    /**
     * A simple 2D point on a plane
     * @class Point
     * @constructor
     * @param x {number} X coordinate of the point
     * @param y {number} Y coordinate of the point
     *
     */
    class Point {
        x: number;
        y: number;
        constructor(x: number, y: number);
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
        toVector(): Vector;
        /**
         * Rotates the current point around another by a certain number of
         * degrees in radians
         * @method rotate
         * @returns Point
         */
        rotate(angle: number, anchor?: Point): Point;
        /**
         * Translates the current point by a vector
         * @method add
         * @returns Point
         */
        add(vector: Vector): Point;
        /**
         * Sets the x and y components at once
         * @method setTo
         * @param x {number}
         * @param y {number}
         */
        setTo(x: number, y: number): void;
        /**
         * Clones a new point that is a copy of this one.
         * @method clone
         * @returns Point
         */
        clone(): Point;
    }
    /**
     * A 2D vector on a plane.
     * @class Vector
     * @extends Point
     * @constructor
     * @param x {number} X component of the Vector
     * @param y {number} Y component of the Vector
     */
    class Vector extends Point {
        x: number;
        y: number;
        /**
         * Returns a vector of unit length in the direction of the specified angle.
         * @method fromAngle
         * @static
         * @param angle {number} The angle to generate the vector
         * @returns Vector
         */
        static fromAngle(angle: number): Vector;
        constructor(x: number, y: number);
        /**
         * The distance to another vector
         * @method distance
         * @param v {Vector} The other vector
         * @returns number
         */
        distance(v?: Vector): number;
        /**
         * Normalizes a vector to have a magnitude of 1.
         * @method normalize
         * @return Vector
         */
        normalize(): Vector;
        /**
         * Scales a vector's by a factor of size
         * @method scale
         * @param size {number} The factor to scale the magnitude by
         * @returns Vector
         */
        scale(size: any): Vector;
        /**
         * Adds one vector to another
         * @method add
         * @param v {Vector} The vector to add
         * @returns Vector
         */
        add(v: Vector): Vector;
        /**
         * Subtracts a vector from the current vector
         * @method minus
         * @param v {Vector} The vector to subtract
         * @returns Vector
         */
        minus(v: Vector): Vector;
        /**
         * Performs a dot product with another vector
         * @method dot
         * @param v {Vector} The vector to dot
         * @returns number
         */
        dot(v: Vector): number;
        /**
         * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
         * @method cross
         * @param v {Vector} The vector to cross
         * @returns number
         */
        cross(v: Vector): number;
        /**
         * Returns the perpendicular vector to this one
         * @method perpendicular
         * @return Vector
         */
        perpendicular(): Vector;
        /**
         * Returns the normal vector to this one
         * @method normal
         * @return Vector
         */
        normal(): Vector;
        /**
         * Returns the angle of this vector.
         * @method toAngle
         * @returns number
         */
        toAngle(): number;
        /**
         * Returns the point represention of this vector
         * @method toPoint
         * @returns Point
         */
        toPoint(): Point;
        /**
         * Rotates the current vector around a point by a certain number of
         * degrees in radians
         * @method rotate
         * @returns Vector
         */
        rotate(angle: number, anchor: Point): Vector;
    }
    /**
     * A 2D ray that can be cast into the scene to do collision detection
     * @class Ray
     * @constructor
     * @param pos {Point} The starting position for the ray
     * @param dir {Vector} The vector indicating the direction of the ray
     */
    class Ray {
        pos: Point;
        dir: Vector;
        constructor(pos: Point, dir: Vector);
        /**
         * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
         * This number indicates the mathematical intersection time.
         * @method intersect
         * @param line {Line} The line to test
         * @returns number
         */
        intersect(line: Line): number;
        /**
         * Returns the point of intersection given the intersection time
         * @method getPoint
         * @returns Point
         */
        getPoint(time: number): Point;
    }
    /**
     * A 2D line segment
     * @class Line
     * @constructor
     * @param begin {Point} The starting point of the line segment
     * @param end {Point} The ending point of the line segment
     */
    class Line {
        begin: Point;
        end: Point;
        constructor(begin: Point, end: Point);
        /**
         * Returns the slope of the line in the form of a vector
         * @method getSlope
         * @returns Vector
         */
        getSlope(): Vector;
        /**
         * Returns the length of the line segment in pixels
         * @method getLength
         * @returns number
         */
        getLength(): number;
    }
    class Projection {
        min: number;
        max: number;
        constructor(min: number, max: number);
        overlaps(projection: Projection): boolean;
        getOverlap(projection: Projection): number;
    }
}
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
    function getOppositeSide(side: Side): Side;
    /**
     * Excaliburs dynamically resizing collection
     * @class Collection
     * @constructor
     * @param [initialSize=200] {number} Initial size of the internal backing array
     */
    class Collection<T> {
        /**
         * Default collection size
         * @property DefaultSize {number}
         * @static
         * @final
         */
        static DefaultSize: number;
        private internalArray;
        private endPointer;
        constructor(initialSize?: number);
        private resize();
        /**
         * Push elements to the end of the collection
         * @method push
         * @param element {T}
         * @returns T
         */
        push(element: T): T;
        /**
         * Removes elements from the end of the collection
         * @method pop
         * @returns T
         */
        pop(): T;
        /**
         * Returns the count of the collection
         * @method count
         * @returns number
         */
        count(): number;
        /**
         * Empties the collection
         * @method clear
         */
        clear(): void;
        /**
         * Returns the size of the internal backing array
         * @method internalSize
         * @returns number
         */
        internalSize(): number;
        /**
         * Returns an element at a specific index
         * @method elementAt
         * @param index {number} Index of element to retreive
         * @returns T
         */
        elementAt(index: number): T;
        /**
         * Inserts an element at a specific index
         * @method insert
         * @param index {number} Index to insert the element
         * @returns T
         */
        insert(index: number, value: T): T;
        /**
         * Removes an element at a specific index
         * @method remove
         * @param index {number} Index of element to remove
         * @returns T
         */
        remove(index: number): T;
        /**
         * Removes an element by reference
         * @method removeElement
         * @param element {T} Index of element to retreive
         */
        removeElement(element: T): void;
        /**
         * Returns a array representing the collection
         * @method toArray
         * @returns T[]
         */
        toArray(): T[];
        /**
         * Iterate over every element in the collection
         * @method forEach
         * @param func {(T,number)=>any} Callback to call for each element passing a reference to the element and its index, returned values are ignored
         */
        forEach(func: (element: T, index: number) => any): void;
        /**
         * Mutate every element in the collection
         * @method map
         * @param func {(T,number)=>any} Callback to call for each element passing a reference to the element and its index, any values returned mutate the collection
         */
        map(func: (element: T, index: number) => any): void;
    }
}
declare module ex {
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
    class Sprite implements IDrawable {
        sx: number;
        sy: number;
        swidth: number;
        sheight: number;
        private texture;
        private scaleX;
        private scaleY;
        private rotation;
        private transformPoint;
        logger: Logger;
        flipVertical: boolean;
        flipHorizontal: boolean;
        width: number;
        height: number;
        effects: Effects.ISpriteEffect[];
        private internalImage;
        private spriteCanvas;
        private spriteCtx;
        private pixelData;
        private pixelsLoaded;
        private dirtyEffect;
        constructor(image: Texture, sx: number, sy: number, swidth: number, sheight: number);
        private loadPixels();
        /**
         * Adds a new {{#crossLink Effects.ISpriteEffect}}{{/crossLink}} to this drawing.
         * @method addEffect
         * @param effect {Effects.ISpriteEffect} Effect to add to the this drawing
         */
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes a {{#crossLink Effects.ISpriteEffect}}{{/crossLink}} from this sprite.
         * @method removeEffect
         * @param effect {Effects.ISpriteEffect} Effect to remove from this sprite
         */
        removeEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an effect given the index from this sprite.
         * @method removeEffect
         * @param index {number} Index of the effect to remove from this sprite
         */
        removeEffect(index: number): void;
        private applyEffects();
        /**
         * Clears all effects from the drawing and return it to its original state.
         * @method clearEffects
         */
        clearEffects(): void;
        /**
         * Sets the point about which to apply transformations to the drawing relative to the
         * top left corner of the drawing.
         * @method transformAbotPoint
         * @param point {Point} The point about which to apply transformations
         */
        transformAboutPoint(point: Point): void;
        /**
         * Sets the current rotation transformation for the drawing.
         * @method setRotation
         * @param radians {number} The rotation to apply to the drawing.
         */
        setRotation(radians: number): void;
        /**
         * Returns the current rotation for the drawing in radians.
         * @method getRotation
         * @returns number
         */
        getRotation(): number;
        /**
         * Sets the scale trasformation in the x direction
         * @method setScale
         * @param scale {number} The magnitude to scale the drawing in the x direction
         */
        setScaleX(scaleX: number): void;
        /**
         * Sets the scale trasformation in the x direction
         * @method setScale
         * @param scale {number} The magnitude to scale the drawing in the x direction
         */
        setScaleY(scaleY: number): void;
        /**
         * Returns the current magnitude of the drawing's scale in the x direction
         * @method getScale
         * @returns number
         */
        getScaleX(): number;
        /**
         * Returns the current magnitude of the drawing's scale in the y direction
         * @method getScale
         * @returns number
         */
        getScaleY(): number;
        /**
         * Resets the internal state of the drawing (if any)
         * @method reset
         */
        reset(): void;
        /**
         * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The 2D rendering context
         * @param x {number} The x coordinate of where to draw
         * @param y {number} The y coordinate of where to draw
         */
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Produces a copy of the current sprite
         * @method clone
         * @returns Sprite
         */
        clone(): Sprite;
    }
}
declare module ex {
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
    class SpriteSheet {
        image: Texture;
        private columns;
        private rows;
        sprites: Sprite[];
        private internalImage;
        constructor(image: Texture, columns: number, rows: number, spWidth: number, spHeight: number);
        /**
         * Create an animation from the this SpriteSheet by listing out the
         * sprite indices. Sprites are organized in row major order in the SpriteSheet.
         * @method getAnimationByIndices
         * @param engine {Engine} Reference to the current game Engine
         * @param indices {number[]} An array of sprite indices to use in the animation
         * @param speed {number} The number in milliseconds to display each frame in the animation
         * @returns Animation
         */
        getAnimationByIndices(engine: Engine, indices: number[], speed: number): Animation;
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
        getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number): Animation;
        /**
         * Treat the entire SpriteSheet as one animation, organizing the frames in
         * row major order.
         * @method getAnimationForAll
         * @param engine {Engine} Reference to the current game Engine
         * @param speed {number} The number in milliseconds to display each frame the animation
         * @returns Animation
         */
        getAnimationForAll(engine: Engine, speed: number): Animation;
        /**
         * Retreive a specific sprite from the SpriteSheet by its index. Sprites are organized
         * in row major order in the SpriteSheet.
         * @method getSprite
         * @param index {number} The index of the sprite
         * @returns Sprite
         */
        getSprite(index: number): Sprite;
    }
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
    class SpriteFont extends SpriteSheet {
        image: Texture;
        private alphabet;
        private caseInsensitive;
        private spriteLookup;
        private colorLookup;
        private _currentColor;
        constructor(image: Texture, alphabet: string, caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number);
        /**
         * Returns a dictionary that maps each character in the alphabet to the appropriate Sprite.
         * @method getTextSprites
         * @returns {Object}
         */
        getTextSprites(): {
            [x: string]: Sprite;
        };
    }
}
declare module ex {
    class TileSprite {
        spriteSheetKey: string;
        spriteId: number;
        constructor(spriteSheetKey: string, spriteId: number);
    }
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
    class Cell {
        /**
         * Gets or sets x coordinate of the cell in world coordinates
         * @property x {number}
         */
        x: number;
        /**
         * Gets or sets y coordinate of the cell in world coordinates
         * @property y {number}
         */
        y: number;
        /**
         * Gets or sets the width of the cell
         * @property width {number}
         */
        width: number;
        /**
         * Gets or sets the height of the cell
         * @property height {number}
         */
        height: number;
        /**
         * The index of the cell in row major order
         * @property index {number}
         */
        index: number;
        /**
         * Gets or sets whether this cell is solid
         * @property solid {boolean}
         */
        solid: boolean;
        /**
         * The index of the sprite to use from the CollisionMap SpriteSheet, if -1 is specified nothing is drawn.
         * @property number {number}
         */
        sprites: TileSprite[];
        private _bounds;
        constructor(
            /**
             * Gets or sets x coordinate of the cell in world coordinates
             * @property x {number}
             */
            x: number, 
            /**
             * Gets or sets y coordinate of the cell in world coordinates
             * @property y {number}
             */
            y: number, 
            /**
             * Gets or sets the width of the cell
             * @property width {number}
             */
            width: number, 
            /**
             * Gets or sets the height of the cell
             * @property height {number}
             */
            height: number, 
            /**
             * The index of the cell in row major order
             * @property index {number}
             */
            index: number, 
            /**
             * Gets or sets whether this cell is solid
             * @property solid {boolean}
             */
            solid?: boolean, 
            /**
             * The index of the sprite to use from the CollisionMap SpriteSheet, if -1 is specified nothing is drawn.
             * @property number {number}
             */
            sprites?: TileSprite[]);
        /**
         * Returns the bounding box for this cell
         * @method getBounds
         * @returns BoundingBox
         */
        getBounds(): BoundingBox;
        getCenter(): Vector;
        pushSprite(tileSprite: TileSprite): void;
        removeSprite(tileSprite: TileSprite): void;
        clearSprites(): void;
    }
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
        constructor(x: number, y: number, cellWidth: number, cellHeight: number, rows: number, cols: number);
        registerSpriteSheet(key: string, spriteSheet: SpriteSheet): void;
        /**
         * Returns the intesection vector that can be used to resolve collisions with actors. If there
         * is no collision null is returned.
         * @method collides
         * @param actor {Actor}
         * @returns Vector
         */
        collides(actor: Actor): Vector;
        /**
         * Returns the cell by index (row major order)
         * @method getCellByIndex
         * @param index {number}
         * @returns Cell
         */
        getCellByIndex(index: number): Cell;
        /**
         * Returns the cell by it's x and y coordinates
         * @method getCell
         * @param x {number}
         * @param y {number}
         * @returns Cell
         */
        getCell(x: number, y: number): Cell;
        /**
         * Returns the cell by testing a point in global coordinates,
         * returns null if no cell was found.
         * @method getCellByPoint
         * @param x {number}
         * @param y {number}
         * @returns Cell
         */
        getCellByPoint(x: number, y: number): Cell;
        update(engine: Engine, delta: number): void;
        /**
         * Draws the collision map to the screen. Called by the Scene.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The current rendering context
         * @param delta {number} The number of milliseconds since the last draw
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Draws all the collision map's debug info. Called by the Scene.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The current rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
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
     * @class ICollidable
     */
    interface ICollidable {
        /**
         * Test wether this collidable with another returning,
         * the intersection vector that can be used to resovle the collision. If there
         * is no collision null is returned.
         * @method collides
         * @param collidable {ICollidable} Other collidable to test
         * @returns Vector
         */
        collides(collidable: ICollidable): Vector;
        /**
         * Tests wether a point is contained within the collidable
         * @method contains
         * @param p {Point} The point to test
         * @returns boolean
         */
        contains(point: Point): boolean;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Axis Aligned collision primitive for Excalibur.
     * @class BoundingBox
     * @constructor
     * @param left {number} x coordinate of the left edge
     * @param top {number} y coordinate of the top edge
     * @param right {number} x coordinate of the right edge
     * @param bottom {number} y coordinate of the bottom edge
     */
    class BoundingBox implements ICollidable {
        left: number;
        top: number;
        right: number;
        bottom: number;
        constructor(left?: number, top?: number, right?: number, bottom?: number);
        /**
         * Returns the calculated width of the bounding box
         * @method getWidth
         * @returns number
         */
        getWidth(): number;
        /**
         * Returns the calculated height of the bounding box
         * @method getHeight
         * @returns number
         */
        getHeight(): number;
        /**
         * Returns the perimeter of the bounding box
         * @method getPerimeter
         * @returns number
         */
        getPerimeter(): number;
        /**
         * Tests wether a point is contained within the bounding box
         * @method contains
         * @param p {Point} The point to test
         * @returns boolean
         */
        contains(p: Point): boolean;
        /**
         * Tests whether another bounding box is totally contained in this one
         * @method contains
         * @param other {BoundingBox} The bounding box to test
         * @returns boolean
         */
        contains(bb: BoundingBox): boolean;
        /**
         * Combines this bounding box and another together returning a new bounding box
         * @method combine
         * @param other {BoundingBox} The bounding box to combine
         * @returns BoundingBox
         */
        combine(other: BoundingBox): BoundingBox;
        /**
         * Test wether this bounding box collides with another returning,
         * the intersection vector that can be used to resovle the collision. If there
         * is no collision null is returned.
         * @method collides
         * @param collidable {ICollidable} Other collidable to test
         * @returns Vector
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
         * @method getWidth
         * @returns number
         */
        getWidth(): number;
        /**
         * Returns the calculated height of the bounding box, by generating an axis aligned box around the current
         * @method getHeight
         * @returns number
         */
        getHeight(): number;
        /**
         * Tests wether a point is contained within the bounding box, using the PIP algorithm
         * http://en.wikipedia.org/wiki/Point_in_polygon
         * @method contains
         * @param p {Point} The point to test
         * @returns boolean
         */
        contains(p: Point): boolean;
        collides(collidable: ICollidable): Vector;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    /**
     * Excalibur base class
     * @class Class
     * @constructor
     */
    class Class {
        /**
         * Direct access to the game object event dispatcher.
         * @property eventDispatcher {EventDispatcher}
         */
        eventDispatcher: EventDispatcher;
        constructor();
        /**
         * Add an event listener. You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @method addEventListener
         * @param eventName {string} Name of the event to listen for
         * @param handler {event=>void} Event handler for the thrown event
         */
        addEventListener(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Removes an event listener. If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified just that handler will be removed.
         *
         * @method removeEventListener
         * @param eventName {string} Name of the event to listen for
         * @param [handler=undefined] {event=>void} Event handler for the thrown event
         */
        removeEventListener(eventName: string, handler?: (event?: GameEvent) => void): void;
        /**
         * Alias for "addEventListener". You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @method on
         * @param eventName {string} Name of the event to listen for
         * @param handler {event=>void} Event handler for the thrown event
         */
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Alias for "removeEventListener". If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified only that handler will be removed.
         *
         * @method off
         * @param eventName {string} Name of the event to listen for
         * @param [handler=undefined] {event=>void} Event handler for the thrown event
         */
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
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
        static extend(methods: any): any;
    }
}
declare module ex {
    class Timer {
        static id: number;
        id: number;
        interval: number;
        fcn: () => void;
        repeats: boolean;
        private elapsedTime;
        private _totalTimeAlive;
        complete: boolean;
        scene: Scene;
        /**
         * The Excalibur timer hooks into the internal timer and fires callbacks, after a certain interval, optionally repeating.
         *
         * @class Timer
         * @constructor
         * @param callback {callback} The callback to be fired after the interval is complete.
         * @param [repeats=false] {boolean} Indicates whether this call back should be fired only once, or repeat after every interval as completed.
         */
        constructor(fcn: () => void, interval: number, repeats?: boolean);
        /**
         * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
         * @method update
         * @param delta {number} Number of elapsed milliseconds since the last update.
         */
        update(delta: number): void;
        getTimeRunning(): number;
        /**
         * Cancels the timer, preventing any further executions.
         * @method cancel
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
        constructor();
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
        constructor();
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
     * @class CollisionPair
     * @constructor
     * @param left {Actor} The first actor in the collision pair
     * @param right {Actor} The second actor in the collision pair
     * @param intersect {Vector} The minimum translation vector to separate the actors from the perspective of the left actor
     * @param side {Side} The side on which the collision occured from the perspective of the left actor
     */
    class CollisionPair {
        left: Actor;
        right: Actor;
        intersect: Vector;
        side: Side;
        constructor(left: Actor, right: Actor, intersect: Vector, side: Side);
        /**
         * Determines if this collision pair and another are equivalent.
         * @method equals
         * @param collisionPair {CollisionPair}
         * @returns boolean
         */
        equals(collisionPair: CollisionPair): boolean;
        /**
         * Evaluates the collision pair, performing collision resolution and event publishing appropriate to each collision type.
         * @method evaluate
         */
        evaluate(): void;
    }
}
declare module ex {
    /**
    * A base implementation of a camera. This class is meant to be extended.
    * @class Camera
    * @constructor
    * @param engine {Engine} Reference to the current engine
    */
    class BaseCamera {
        follow: Actor;
        focus: Point;
        lerp: boolean;
        private _cameraMoving;
        private _currentLerpTime;
        private _lerpDuration;
        private _totalLerpTime;
        private _lerpStart;
        private _lerpEnd;
        isShaking: boolean;
        private shakeMagnitudeX;
        private shakeMagnitudeY;
        private shakeDuration;
        private elapsedShakeTime;
        isZooming: boolean;
        private currentZoomScale;
        private maxZoomScale;
        private zoomDuration;
        private elapsedZoomTime;
        private zoomIncrement;
        private easeInOutCubic(currentTime, startValue, endValue, duration);
        /**
        * Sets the {{#crossLink Actor}}{{/crossLink}} to follow with the camera
        * @method setActorToFollow
        * @param actor {Actor} The actor to follow
        */
        setActorToFollow(actor: Actor): void;
        /**
        * Returns the focal point of the camera
        * @method getFocus
        * @returns Point
        */
        getFocus(): Point;
        /**
        * Sets the focal point of the camera. This value can only be set if there is no actor to be followed.
        * @method setFocus
        * @param x {number} The x coordinate of the focal point
        * @param y {number} The y coordinate of the focal point
        */
        setFocus(x: number, y: number): void;
        /**
        * Sets the camera to shake at the specified magnitudes for the specified duration
        * @method shake
        * @param magnitudeX {number} the x magnitude of the shake
        * @param magnitudeY {number} the y magnitude of the shake
        * @param duration {number} the duration of the shake
        */
        shake(magnitudeX: number, magnitudeY: number, duration: number): void;
        /**
        * Zooms the camera in or out by the specified scale over the specified duration.
        * If no duration is specified, it will zoom by a set amount until the scale is reached.
        * @method zoom
        * @param scale {number} the scale of the zoom
        * @param [duration] {number} the duration of the zoom
        */
        zoom(scale: number, duration?: number): void;
        /**
        * gets the current zoom scale
        * @method getZoom
        * @returns {Number} the current zoom scale
        */
        getZoom(): number;
        private setCurrentZoomScale(zoomScale);
        /**
        * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
        * @method update
        * @param delta {number} The number of milliseconds since the last update
        */
        update(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
        private isDoneShaking();
        private isDoneZooming();
    }
    /**
    * An extension of BaseCamera that is locked vertically; it will only move side to side.
    * @class SideCamera
    * @extends BaseCamera
    * @constructor
    * @param engine {Engine} Reference to the current engine
    */
    class SideCamera extends BaseCamera {
        getFocus(): Point;
    }
    /**
    * An extension of BaseCamera that is locked to an actor or focal point; the actor will appear in the center of the screen.
    * @class TopCamera
    * @extends BaseCamera
    * @constructor
    * @param engine {Engine} Reference to the current engine
    */
    class TopCamera extends BaseCamera {
        getFocus(): Point;
    }
}
declare module ex {
    /**
     * Actors are composed together into groupings called Scenes in
     * Excalibur. The metaphor models the same idea behind real world
     * actors in a scene. Only actors in scenes will be updated and drawn.
     * @class Scene
     * @constructor
     */
    class Scene extends Class {
        actor: Actor;
        /**
         * Gets or sets the current camera for the scene
         * @property camera {Camera}
         */
        camera: BaseCamera;
        /**
         * The actors in the current scene
         * @property children {Actor[]}
         */
        children: Actor[];
        tileMaps: TileMap[];
        engine: Engine;
        uiActors: Actor[];
        private _collisionResolver;
        private _killQueue;
        private _timers;
        private _cancelQueue;
        private _isInitialized;
        constructor(engine?: Engine);
        /**
         * This is called when the scene is made active and started. It is meant to be overriden,
         * this is where you should setup any DOM UI or event handlers needed for the scene.
         * @method onActivate
         */
        onActivate(): void;
        /**
         * This is called when the scene is made transitioned away from and stopped. It is meant to be overriden,
         * this is where you should cleanup any DOM UI or event handlers needed for the scene.
         * @method onDeactivate
         */
        onDeactivate(): void;
        /**
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         * @method onInitialize
         * @param engine {Engine}
         */
        onInitialize(engine: Engine): void;
        /**
         * Publish an event to all actors in the scene
         * @method publish
         * @param eventType {string} The name of the event to publish
         * @param event {GameEvent} The event object to send
         */
        publish(eventType: string, event: GameEvent): void;
        /**
         * Updates all the actors and timers in the Scene. Called by the Engine.
         * @method update
         * @param engine {Engine} Reference to the current Engine
         * @param delta {number} The number of milliseconds since the last update
         */
        update(engine: Engine, delta: number): void;
        /**
         * Draws all the actors in the Scene. Called by the Engine.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The current rendering context
         * @param delta {number} The number of milliseconds since the last draw
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Draws all the actors' debug information in the Scene. Called by the Engine.
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The current rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
        /**
         * Adds an excalibur Timer to the current scene.
         * @param timer {Timer} The timer to add to the current scene.
         * @method add
         */
        add(timer: Timer): void;
        /**
         * Adds a TileMap to the Scene, once this is done the TileMap will be drawn and updated.
         * @method add
         * @param tileMap {TileMap}
         */
        add(tileMap: TileMap): void;
        /**
         * Adds an actor to the Scene, once this is done the Actor will be drawn and updated.
         * @method add
         * @param actor {Actor} The actor to add to the current scene
         */
        add(actor: Actor): void;
        /**
         * Adds a UIActor to the scene, UIActors do not participate in collisions, instead the remain in the same place on the screen.
         * @method add
         * @param uiActor {UIActor} The UIActor to add to the current scene
         */
        add(uiActor: UIActor): void;
        /**
          * Removes an excalibur Timer from the current scene.
          * @method remove
          * @param timer {Timer} The timer to remove to the current scene.
          */
        remove(timer: Timer): void;
        /**
         * Removes a TileMap from the Scene, it will no longer be drawn or updated.
         * @method remove
         * @param tileMap {TileMap}
         */
        remove(tileMap: TileMap): void;
        /**
         * Removes an actor from the Scene, it will no longer be drawn or updated.
         * @method remove
         * @param actor {Actor} The actor to remove from the current scene.
         */
        remove(actor: Actor): void;
        /**
         * Removes a UIActor to the scene, it will no longer be drawn or updated
         * @method remove
         * @param uiActor {UIActor} The UIActor to remove from the current scene
         */
        remove(uiActor: UIActor): void;
        /**
         * Adds an actor to act as a piece of UI, meaning it is always positioned
         * in screen coordinates. UI actors do not participate in collisions
         * @method addUIActor
         * @param actor {Actor}
         */
        addUIActor(actor: Actor): void;
        /**
         * Removes an actor as a piec of UI
         * @method removeUIActor
         * @param actor {Actor}
         */
        removeUIActor(actor: Actor): void;
        /**
         * Adds an actor to the Scene, once this is done the actor will be drawn and updated.
         * @method addChild
         * @param actor {Actor}
         */
        addChild(actor: Actor): void;
        /**
         * Adds a TileMap to the Scene, once this is done the TileMap will be drawn and updated.
         * @method addTileMap
         * @param tileMap {TileMap}
         */
        addTileMap(tileMap: TileMap): void;
        /**
         * Removes a TileMap from the Scene, it willno longer be drawn or updated.
         * @method removeTileMap
         * @param tileMap {TileMap}
         */
        removeTileMap(tileMap: TileMap): void;
        /**
         * Removes an actor from the Scene, it will no longer be drawn or updated.
         * @method removeChild
         * @param actor {Actor} The actor to remove
         */
        removeChild(actor: Actor): void;
        /**
         * Adds a timer to the Scene
         * @method addTimer
         * @param timer {Timer} The timer to add
         * @returns Timer
         */
        addTimer(timer: Timer): Timer;
        /**
         * Removes a timer to the Scene, can be dangerous
         * @method removeTimer
         * @private
         * @param timer {Timer} The timer to remove
         * @returns Timer
         */
        removeTimer(timer: Timer): Timer;
        /**
         * Cancels a timer, removing it from the scene nicely
         * @method cancelTimer
         * @param timer {Timer} The timer to cancel
         * @returns Timer
         */
        cancelTimer(timer: Timer): Timer;
        /**
         * Tests whether a timer is active in the scene
         * @method isTimerActive
         * @param timer {Timer}
         * @returns boolean
         */
        isTimerActive(timer: Timer): boolean;
    }
}
declare module ex.Internal.Actions {
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
        private actor;
        x: number;
        y: number;
        private start;
        private end;
        private dir;
        private speed;
        private distance;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, speed: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class MoveBy implements IAction {
        private actor;
        x: number;
        y: number;
        private distance;
        private speed;
        private time;
        private start;
        private end;
        private dir;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, time: number);
        update(delta: Number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Follow implements IAction {
        private actor;
        private actorToFollow;
        x: number;
        y: number;
        private current;
        private end;
        private dir;
        private speed;
        private maximumDistance;
        private distanceBetween;
        private _started;
        private _stopped;
        constructor(actor: Actor, actorToFollow: Actor, followDistance?: number);
        update(delta: number): void;
        stop(): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
    }
    class Meet implements IAction {
        private actor;
        private actorToMeet;
        x: number;
        y: number;
        private current;
        private end;
        private dir;
        private speed;
        private distanceBetween;
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
        private actor;
        x: number;
        y: number;
        private start;
        private end;
        private speed;
        private distance;
        private _started;
        private _stopped;
        constructor(actor: Actor, angleRadians: number, speed: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class RotateBy implements IAction {
        private actor;
        x: number;
        y: number;
        private start;
        private end;
        private time;
        private distance;
        private _started;
        private _stopped;
        private speed;
        constructor(actor: Actor, angleRadians: number, time: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class ScaleTo implements IAction {
        private actor;
        x: number;
        y: number;
        private startX;
        private startY;
        private endX;
        private endY;
        private speedX;
        private speedY;
        private distanceX;
        private distanceY;
        private _started;
        private _stopped;
        constructor(actor: Actor, scaleX: number, scaleY: number, speedX: number, speedY: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class ScaleBy implements IAction {
        private actor;
        x: number;
        y: number;
        private startX;
        private startY;
        private endX;
        private endY;
        private time;
        private distanceX;
        private distanceY;
        private _started;
        private _stopped;
        private speedX;
        private speedY;
        constructor(actor: Actor, scaleX: number, scaleY: number, time: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Delay implements IAction {
        x: number;
        y: number;
        private actor;
        private elapsedTime;
        private delay;
        private _started;
        private _stopped;
        constructor(actor: Actor, delay: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    class Blink implements IAction {
        private timeVisible;
        private timeNotVisible;
        private elapsedTime;
        private totalTime;
        private actor;
        private duration;
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
        private actor;
        private endOpacity;
        private speed;
        private multiplyer;
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
        private actor;
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
        private actor;
        private actionQueue;
        private repeat;
        private originalRepeat;
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
        private actor;
        private actionQueue;
        private _stopped;
        constructor(actor: Actor, actions: IAction[]);
        update(delta: any): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
    class ActionQueue {
        private actor;
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
}
declare module ex {
    class EasingFunctions {
        static Linear: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseInQuad: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseOutQuad: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseInOutQuad: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseInCubic: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseOutCubic: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseInOutCubic: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
    }
}
declare module ex {
    /**
     * An enum that describes the types of collisions actors can participate in
     * @class CollisionType
     */
    enum CollisionType {
        /**
         * Actors with the PreventCollision setting do not participate in any
         * collisions and do not raise collision events.
         * @property PreventCollision {CollisionType}
         * @static
         */
        PreventCollision = 0,
        /**
         * Actors with the Passive setting only raise collision events, but are not
         * influenced or moved by other actors and do not influence or move other actors.
         * @property Passive {CollisionType}
         * @static
         */
        Passive = 1,
        /**
         * Actors with the Active setting raise collision events and participate
         * in collisions with other actors and will be push or moved by actors sharing
         * the Active or Fixed setting.
         * @property Active {CollisionType}
         * @static
         */
        Active = 2,
        /**
         * Actors with the Elastic setting will behave the same as Active, except that they will
         * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
         * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
         * @property Elastic {CollisionType}
         * @static
         */
        Elastic = 3,
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
        Fixed = 4,
    }
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
    class Actor extends Class {
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
         * @property x {number}
         */
        x: number;
        /**
         * The y coordinate of the actor (top edge)
         * @property y {number}
         */
        y: number;
        /**
         * The anchor to apply all actor related transformations like rotation,
         * translation, and rotation. By default the anchor is in the center of
         * the actor.
         * @property anchor {Point}
         */
        anchor: Point;
        /**
         * Gets the calculated anchor point, should not be set.
         * @property calculatedAnchor {Point}
         */
        calculatedAnchor: Point;
        private height;
        private width;
        /**
         * The rotation of the actor in radians
         * @property rotation {number}
         */
        rotation: number;
        /**
         * The rotational velocity of the actor in radians/second
         * @property rx {number}
         */
        rx: number;
        /**
         * The scale vector of the actor
         * @property scale
         */
        scale: Vector;
        /**
         * The x scalar velocity of the actor in scale/second
         * @property sx {number}
         */
        sx: number;
        /**
         * The y scalar velocity of the actor in scale/second
         * @property sy {number}
         */
        sy: number;
        /**
         * The x velocity of the actor in pixels/second
         * @property dx {number}
         */
        dx: number;
        /**
         * The x velocity of the actor in pixels/second
         * @property dx {number}
         */
        dy: number;
        /**
         * The x acceleration of the actor in pixels/second^2
         * @property ax {number}
         */
        ax: number;
        /**
         * The y acceleration of the actor in pixels/second^2
         * @property ay {number}
         */
        ay: number;
        /**
         * Indicates wether the actor is physically in the viewport
         * @property isOffScreen {boolean}
         */
        isOffScreen: boolean;
        /**
         * The visibility of an actor
         * @property visible {boolean}
         */
        visible: boolean;
        /**
         * The opacity of an actor
         * @property opacity {number}
         */
        opacity: number;
        previousOpacity: number;
        /**
         * Direct access to the actor's action queue. Useful if you are building custom actions.
         * @property actionQueue {ActionQueue}
         */
        actionQueue: Internal.Actions.ActionQueue;
        private sceneNode;
        /**
         * Convenience reference to the global logger
         * @property logger {Logger}
         */
        logger: Logger;
        /**
        * The scene that the actor is in
        * @property scene {Scene}
        */
        scene: Scene;
        /**
        * The parent of this actor
        * @property parent {Actor}
        */
        parent: Actor;
        /**
         * Gets or sets the current collision type of this actor. By
         * default all actors participate in Active collisions.
         * @property collisionType {CollisionType}
         */
        collisionType: CollisionType;
        collisionGroups: string[];
        private _collisionHandlers;
        private _isInitialized;
        frames: {
            [x: string]: IDrawable;
        };
        /**
         * Access to the current drawing on for the actor, this can be an {{#crossLink "Animation"}}{{/crossLink}},
         * {{#crossLink "Sprite"}}{{/crossLink}}, or {{#crossLink "Polygon"}}{{/crossLink}}.
         * Set drawings with the {{#crossLink "Actor/setDrawing:method"}}{{/crossLink}}.
         * @property currentDrawing {IDrawable}
         */
        currentDrawing: IDrawable;
        private centerDrawingX;
        private centerDrawingY;
        /**
         * Modify the current actor update pipeline.
         *
         *
         */
        pipeline: IPipelineModule[];
        /**
         * Sets the color of the actor. A rectangle of this color will be drawn if now IDrawable is specified as the actors drawing.
         * @property color {Color}
         */
        color: Color;
        /**
         * Whether or not to enable the CapturePointer trait that propogates pointer events to this actor
         * @property [enableCapturePointer=false] {boolean}
         */
        enableCapturePointer: boolean;
        /**
         * Configuration for CapturePointer trait
         * @property capturePointer {ICapturePointerConfig}
         */
        capturePointer: ICapturePointerConfig;
        private _isKilled;
        constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
        /**
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         * @method onInitialize
         * @param engine {Engine}
         */
        onInitialize(engine: Engine): void;
        /**
         * If the current actors is a member of the scene. This will remove
         * it from the scene graph. It will no longer be drawn or updated.
         * @method kill
         */
        kill(): void;
        /**
         * Indicates wether the actor has been killed.
         * @method isKilled
         * @returns boolean
         */
        isKilled(): boolean;
        /**
         * Adds a child actor to this actor. All movement of the child actor will be
         * relative to the parent actor. Meaning if the parent moves the child will
         * move with
         * @method addChild
         * @param actor {Actor} The child actor to add
         */
        addChild(actor: Actor): void;
        /**
         * Removes a child actor from this actor.
         * @method removeChild
         * @param actor {Actor} The child actor to remove
         */
        removeChild(actor: Actor): void;
        /**
         * Sets the current drawing of the actor to the drawing correspoding to
         * the key.
         * @method setDrawing
         * @param key {string} The key of the drawing
         */
        setDrawing(key: any): void;
        /**
         * Adds a whole texture as the "default" drawing.
         * @method addDrawing
         * @param texture {Texture}
         */
        addDrawing(texture: Texture): any;
        /**
         * Adds a whole sprite as the "default" drawing.
         * @method addDrawing
         * @param sprite {Texture}
         */
        addDrawing(sprite: Sprite): any;
        /**
         * Adds a drawing to the list of available drawings for an actor.
         * @method addDrawing
         * @param key {string} The key to associate with a drawing for this actor
         * @param drawing {IDrawable} this can be an {{#crossLink "Animation"}}{{/crossLink}},
         * {{#crossLink "Sprite"}}{{/crossLink}}, or {{#crossLink "Polygon"}}{{/crossLink}}.
         */
        addDrawing(key: any, drawing: IDrawable): any;
        /**
         * Artificially trigger an event on an actor, useful when creating custom events.
         * @method triggerEvent
         * @param eventName {string} The name of the event to trigger
         * @param [event=undefined] {GameEvent} The event object to pass to the callback
         */
        triggerEvent(eventName: string, event?: GameEvent): void;
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
        addCollisionGroup(name: string): void;
        /**
         * Remove an actor from a collision group.
         * @method removeCollisionGroup
         * @param name {string} The name of the collision group
         */
        removeCollisionGroup(name: string): void;
        /**
         * Get the center point of an actor
         * @method getCenter
         * @returns Vector
         */
        getCenter(): Vector;
        /**
         * Gets the calculated width of an actor
         * @method getWidth
         * @returns number
         */
        getWidth(): number;
        /**
         * Sets the width of an actor, factoring in the current scale
         * @method setWidth
         */
        setWidth(width: any): void;
        /**
         * Gets the calculated height of an actor
         * @method getHeight
         * @returns number
         */
        getHeight(): number;
        /**
         * Sets the height of an actor, factoring in the current scale
         * @method setHeight
         */
        setHeight(height: any): void;
        /**
         * Centers the actor's drawing around the center of the actor's bounding box
         * @method setCenterDrawing
         * @param center {boolean} Indicates to center the drawing around the actor
         */
        setCenterDrawing(center: boolean): void;
        /**
         * Gets the left edge of the actor
         * @method getLeft
         * @returns number
         */
        getLeft(): number;
        /**
         * Gets the right edge of the actor
         * @method getRight
         * @returns number
         */
        getRight(): number;
        /**
         * Gets the top edge of the actor
         * @method getTop
         * @returns number
         */
        getTop(): number;
        /**
         * Gets the bottom edge of the actor
         * @method getBottom
         * @returns number
         */
        getBottom(): number;
        /**
        * Gets the x value of the Actor in global coordinates
        * @method getGlobalX
        * @returns number
        */
        getGlobalX(): any;
        /**
        * Gets the y value of the Actor in global coordinates
        * @method getGlobalY
        * @returns number
        */
        getGlobalY(): any;
        /**
         * Gets the global scale of the Actor
         * @method getGlobalScale
         * @returns Point
         */
        getGlobalScale(): any;
        /**
         * Returns the actor's bounding box calculated for this instant.
         * @method getBounds
         * @returns BoundingBox
         */
        getBounds(): BoundingBox;
        /**
         * Tests whether the x/y specified are contained in the actor
         * @method contains
         * @param x {number} X coordinate to test (in world coordinates)
         * @param y {number} Y coordinate to test (in world coordinates)
         */
        contains(x: number, y: number): boolean;
        /**
         * Returns the side of the collision based on the intersection
         * @method getSideFromIntersect
         * @param intersect {Vector} The displacement vector returned by a collision
         * @returns Side
        */
        getSideFromIntersect(intersect: Vector): Side;
        /**
         * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
         * @method collides
         * @param actor {Actor} The other actor to test
         * @returns Side
         */
        collidesWithSide(actor: Actor): Side;
        /**
         * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
         * null when there is no collision;
         * @method collides
         * @param actor {Actor} The other actor to test
         * @returns Vector
         */
        collides(actor: Actor): Vector;
        /**
         * Register a handler to fire when this actor collides with another in a specified group
         * @method onCollidesWith
         * @param group {string} The group name to listen for
         * @param func {callback} The callback to fire on collision with another actor from the group. The callback is passed the other actor.
         */
        onCollidesWith(group: string, func: (actor: Actor) => void): void;
        getCollisionHandlers(): {
            [x: string]: {
                (actor: Actor): void;
            }[];
        };
        /**
         * Removes all collision handlers for this group on this actor
         * @method removeCollidesWith
         * @param group {string} Group to remove all handlers for on this actor.
         */
        removeCollidesWith(group: string): void;
        /**
         * Returns true if the two actors are less than or equal to the distance specified from each other
         * @method within
         * @param actor {Actor} Actor to test
         * @param distance {number} Distance in pixels to test
         * @returns boolean
         */
        within(actor: Actor, distance: number): boolean;
        /**
         * Clears all queued actions from the Actor
         * @method clearActions
         */
        clearActions(): void;
        easeTo(x: number, y: number, duration: number, easingFcn?: (currentTime: number, startValue: number, endValue: number, duration: number) => number): Actor;
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
        moveTo(x: number, y: number, speed: number): Actor;
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
        moveBy(x: number, y: number, time: number): Actor;
        /**
         * This method will rotate an actor to the specified angle at the speed
         * specified (in radians per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @method rotateTo
         * @param angleRadians {number} The angle to rotate to in radians
         * @param speed {number} The angular velocity of the rotation specified in radians per second
         * @returns Actor
         */
        rotateTo(angleRadians: number, speed: number): Actor;
        /**
         * This method will rotate an actor to the specified angle by a certain
         * time (in milliseconds) and return back the actor. This method is part
         * of the actor 'Action' fluent API allowing action chaining.
         * @method rotateBy
         * @param angleRadians {number} The angle to rotate to in radians
         * @param time {number} The time it should take the actor to complete the rotation in milliseconds
         * @returns Actor
         */
        rotateBy(angleRadians: number, time: number): Actor;
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
        scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): Actor;
        /**
         * This method will scale an actor to the specified size by a certain time
         * (in milliseconds) and return back the actor. This method is part of the
         * actor 'Action' fluent API allowing action chaining.
         * @method scaleBy
         * @param size {number} The scaling factor to apply
         * @param time {number} The time it should take to complete the scaling in milliseconds
         * @returns Actor
         */
        scaleBy(sizeX: number, sizeY: number, time: number): Actor;
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
        blink(timeVisible: number, timeNotVisible: number, numBlinks?: number): Actor;
        /**
         * This method will cause an actor's opacity to change from its current value
         * to the provided value by a specified time (in milliseconds). This method is
         * part of the actor 'Action' fluent API allowing action chaining.
         * @method fade
         * @param opacity {number} The ending opacity
         * @param time {number} The time it should take to fade the actor (in milliseconds)
         * @returns Actor
         */
        fade(opacity: number, time: number): Actor;
        /**
         * This method will delay the next action from executing for a certain
         * amount of time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @method delay
         * @param time {number} The amount of time to delay the next action in the queue from executing in milliseconds
         * @returns Actor
         */
        delay(time: number): Actor;
        /**
         * This method will add an action to the queue that will remove the actor from the
         * scene once it has completed its previous actions. Any actions on the
         * action queue after this action will not be executed.
         * @method die
         * @returns Actor
         */
        die(): Actor;
        /**
         * This method allows you to call an arbitrary method as the next action in the
         * action queue. This is useful if you want to execute code in after a specific
         * action, i.e An actor arrives at a destinatino after traversing a path
         * @method callMethod
         * @returns Actor
         */
        callMethod(method: () => any): Actor;
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions a certain number of times. If the number of repeats
         * is not specified it will repeat forever. This method is part of
         * the actor 'Action' fluent API allowing action chaining
         * @method repeat
         * @param [times=undefined] {number} The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions will repeat forever
         * @returns Actor
         */
        repeat(times?: number): Actor;
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions forever. This method is part of the actor 'Action'
         * fluent API allowing action chaining.
         * @method repeatForever
         * @returns Actor
         */
        repeatForever(): Actor;
        /**
         * This method will cause the actor to follow another at a specified distance
         * @method follow
         * @param actor {Actor} The actor to follow
         * @param [followDistance=currentDistance] {number} The distance to maintain when following, if not specified the actor will follow at the current distance.
         * @returns Actor
         */
        follow(actor: Actor, followDistance?: number): Actor;
        /**
         * This method will cause the actor to move towards another until they
         * collide "meet" at a specified speed.
         * @method meet
         * @param actor {Actor} The actor to meet
         * @param [speed=0] {number} The speed in pixels per second to move, if not specified it will match the speed of the other actor
         * @returns Actor
         */
        meet(actor: Actor, speed?: number): Actor;
        /**
         * Returns a promise that resolves when the current action queue up to now
         * is finished.
         * @method asPromise
         * @returns Promise
         */
        asPromise<T>(): Promise<T>;
        /**
         * Called by the Engine, updates the state of the actor
         * @method update
         * @param engine {Engine} The reference to the current game engine
         * @param delta {number} The time elapsed since the last update in milliseconds
         */
        update(engine: Engine, delta: number): void;
        /**
         * Called by the Engine, draws the actor to the screen
         * @method draw
         * @param ctx {CanvasRenderingContext2D} The rendering context
         * @param delta {number} The time since the last draw in milliseconds
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Called by the Engine, draws the actors debugging to the screen
         * @method debugDraw
         * @param ctx {CanvasRenderingContext2D} The rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    /**
     * Logging level that Excalibur will tag
     * @class LogLevel
     */
    enum LogLevel {
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
        Debug = 0,
        Info = 1,
        Warn = 2,
        Error = 3,
        Fatal = 4,
    }
    /**
     * Static singleton that represents the logging facility for Excalibur.
     * Excalibur comes built-in with a ConsoleAppender and ScreenAppender.
     * Derive from IAppender to create your own logging appenders.
     * @class Logger
     * @static
     */
    class Logger {
        private static _instance;
        private appenders;
        constructor();
        /**
         * Gets or sets the default logging level. Excalibur will only log
         * messages if equal to or above this level.
         * @property defaultLevel {LogLevel}
         */
        defaultLevel: LogLevel;
        /**
         * Gets the current static instance of Logger
         * @method getInstance
         * @static
         * @returns Logger
         */
        static getInstance(): Logger;
        /**
         * Adds a new IAppender to the list of appenders to write to
         * @method addAppender
         * @param appender {IAppender} Appender to add
         */
        addAppender(appender: IAppender): void;
        /**
         * Clears all appenders from the logger
         * @method clearAppenders
         */
        clearAppenders(): void;
        /**
         * Logs a message at a given LogLevel
         * @method _log
         * @private
         * @param level {LogLevel}The LogLevel`to log the message at
         * @param args An array of arguments to write to an appender
         */
        private _log(level, args);
        /**
         * Writes a log message at the LogLevel.Debug level
         * @method debug
         * @param ...args Accepts any number of arguments
         */
        debug(...args: any[]): void;
        /**
         * Writes a log message at the LogLevel.Info level
         * @method info
         * @param ...args Accepts any number of arguments
         */
        info(...args: any[]): void;
        /**
         * Writes a log message at the LogLevel.Warn level
         * @method warn
         * @param ...args Accepts any number of arguments
         */
        warn(...args: any[]): void;
        /**
         * Writes a log message at the LogLevel.Error level
         * @method error
         * @param ...args Accepts any number of arguments
         */
        error(...args: any[]): void;
        /**
         * Writes a log message at the LogLevel.Fatal level
         * @method fatal
         * @param ...args Accepts any number of arguments
         */
        fatal(...args: any[]): void;
    }
    /**
     * Contract for any log appender (such as console/screen)
     * @class IAppender
     */
    interface IAppender {
        /**
         * Logs a message at the given LogLevel
         * @method log
         * @param level {LogLevel} Level to log at
         * @param args {any[]} Arguments to log
         */
        log(level: LogLevel, args: any[]): void;
    }
    /**
     * Console appender for browsers (i.e. console.log)
     * @class ConsoleAppender
     * @constructor
     * @extends IAppender
     */
    class ConsoleAppender implements IAppender {
        log(level: LogLevel, args: any[]): void;
    }
    /**
     * On-screen (canvas) appender
     * @todo Clean this up
     * @class ScreenAppender
     * @extends IAppender
     * @constructor
     * @param width {number} Width of the screen appender in pixels
     * @param height {number} Height of the screen appender in pixels
     */
    class ScreenAppender implements IAppender {
        private _messages;
        private canvas;
        private ctx;
        constructor(width?: number, height?: number);
        log(level: LogLevel, args: any[]): void;
    }
}
declare module ex {
    /**
     * An enum representing all of the built in event types for Excalibur
     * @class EventType
     */
    enum EventType {
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
     *
     * @class GameEvent
     * @constructor
     * @param target {any} Events can have target game object, like the Engine, or an Actor.
     */
    class GameEvent {
        /**
         * Target object for this event.
         * @property target {any}
         */
        target: any;
        constructor();
    }
    /**
     * Event received by the Engine when the browser window is visible
     *
     * @class VisibleEvent
     * @extends GameEvent
     * @constructor
     */
    class VisibleEvent extends GameEvent {
        constructor();
    }
    /**
     * Event received by the Engine when the browser window is hidden
     *
     * @class HiddenEvent
     * @extends GameEvent
     * @constructor
     */
    class HiddenEvent extends GameEvent {
        constructor();
    }
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
    class CollisionEvent extends GameEvent {
        actor: Actor;
        other: Actor;
        side: Side;
        intersection: Vector;
        constructor(actor: Actor, other: Actor, side: Side, intersection: Vector);
    }
    /**
     * Event thrown on a game object on Excalibur update
     *
     * @class UpdateEvent
     * @extends GameEvent
     * @constructor
     * @param delta {number} The number of milliseconds since the last update
     */
    class UpdateEvent extends GameEvent {
        delta: number;
        constructor(delta: number);
    }
    /**
     * Event thrown on an Actor only once before the first update call
     *
     * @class InitializeEvent
     * @extends GameEvent
     * @constructor
     * @param engine {Engine} The reference to the current engine
     */
    class InitializeEvent extends GameEvent {
        engine: Engine;
        constructor(engine: Engine);
    }
    /**
     * Event thrown on a Scene on activation
     *
     * @class ActivateEvent
     * @extends GameEvent
     * @constructor
     * @param oldScene {Scene} The reference to the old scene
     */
    class ActivateEvent extends GameEvent {
        oldScene: Scene;
        constructor(oldScene: Scene);
    }
    /**
     * Event thrown on a Scene on deactivation
     *
     * @class DeactivateEvent
     * @extends GameEvent
     * @constructor
     * @param newScene {Scene} The reference to the new scene
     */
    class DeactivateEvent extends GameEvent {
        newScene: Scene;
        constructor(newScene: Scene);
    }
    /**
     * Event thrown on an Actor when it completely leaves the screen.
     * @class ExitViewPortEvent
     * @constructor
     */
    class ExitViewPortEvent extends GameEvent {
        constructor();
    }
    /**
     * Event thrown on an Actor when it completely leaves the screen.
     * @class EnterViewPortEvent
     * @constructor
     */
    class EnterViewPortEvent extends GameEvent {
        constructor();
    }
    /**
     * Enum representing the different mouse buttons
     * @class MouseButton
     */
    enum MouseButton {
        /**
         * @property Left
         * @static
         */
        Left = 0,
        /**
         * @property Left
         * @static
         */
        Middle = 1,
        /**
         * @property Left
         * @static
         */
        Right = 2,
    }
}
declare module ex {
    /**
     * Excalibur's internal event dispatcher implementation. Callbacks are fired immediately after an event is published
     * @class EventDispatcher
     * @constructor
     * @param target {any} The object that will be the recipient of events from this event dispatcher
     */
    class EventDispatcher {
        private _handlers;
        private target;
        private log;
        constructor(target: any);
        /**
         * Publish an event for target
         * @method publish
         * @param eventName {string} The name of the event to publish
         * @param [event=undefined] {GameEvent} Optionally pass an event data object to the handler
         */
        publish(eventName: string, event?: GameEvent): void;
        /**
         * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
         * @method subscribe
         * @param eventName {string} The name of the event to subscribe to
         * @param handler {GameEvent=>void} The handler callback to fire on this event
         */
        subscribe(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Unsubscribe a event handler(s) from an event. If a specific handler
         * is specified for an event, only that handler will be unsubscribed.
         * Otherwise all handlers will be unsubscribed for that event.
         * @method unsubscribe
         * @param eventName {string} The name of the event to unsubscribe
         * @param [handler=undefined] Optionally the specific handler to unsubscribe
         *
         */
        unsubscribe(eventName: string, handler?: (event?: GameEvent) => void): void;
    }
}
declare module ex {
    class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        /**
         * Color constant
         * @property Black {ex.Color}
         * @static
         * @final
         */
        static Black: Color;
        /**
         * Color constant
         * @property White {ex.Color}
         * @static
         * @final
         */
        static White: Color;
        /**
         * Color constant
         * @property Gray {ex.Color}
         * @static
         * @final
         */
        static Gray: Color;
        /**
         * Color constant
         * @property LightGray {ex.Color}
         * @static
         * @final
         */
        static LightGray: Color;
        /**
         * Color constant
         * @property DarkGray {ex.Color}
         * @static
         * @final
         */
        static DarkGray: Color;
        /**
         * Color constant
         * @property Yellow {ex.Color}
         * @static
         * @final
         */
        static Yellow: Color;
        /**
         * Color constant
         * @property Orange {ex.Color}
         * @static
         * @final
         */
        static Orange: Color;
        /**
         * Color constant
         * @property Red {ex.Color}
         * @static
         * @final
         */
        static Red: Color;
        /**
         * Color constant
         * @property Vermillion {ex.Color}
         * @static
         * @final
         */
        static Vermillion: Color;
        /**
         * Color constant
         * @property Rose {ex.Color}
         * @static
         * @final
         */
        static Rose: Color;
        /**
         * Color constant
         * @property Magenta {ex.Color}
         * @static
         * @final
         */
        static Magenta: Color;
        /**
         * Color constant
         * @property Violet {ex.Color}
         * @static
         * @final
         */
        static Violet: Color;
        /**
         * Color constant
         * @property Blue {ex.Color}
         * @static
         * @final
         */
        static Blue: Color;
        /**
         * Color constant
         * @property Azure {ex.Color}
         * @static
         * @final
         */
        static Azure: Color;
        /**
         * Color constant
         * @property Cyan {ex.Color}
         * @static
         * @final
         */
        static Cyan: Color;
        /**
         * Color constant
         * @property Viridian {ex.Color}
         * @static
         * @final
         */
        static Viridian: Color;
        /**
         * Color constant
         * @property Green {ex.Color}
         * @static
         * @final
         */
        static Green: Color;
        /**
         * Color constant
         * @property Chartreuse {ex.Color}
         * @static
         * @final
         */
        static Chartreuse: Color;
        /**
         * Color constant
         * @property Transparent {ex.Color}
         * @static
         * @final
         */
        static Transparent: Color;
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
        constructor(r: number, g: number, b: number, a?: number);
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
        static fromRGB(r: number, g: number, b: number, a?: number): Color;
        /**
         * Creates a new inscance of Color from a hex string
         *
         * @method fromHex
         * @static
         * @param hex {string} CSS color string of the form #ffffff, the alpha component is optional
         */
        static fromHex(hex: string): Color;
        /**
         * Returns a CSS string representation of a color.
         * @method toString
         * @returns string
         */
        toString(): string;
        /**
         * Returns a CSS string representation of a color.
         * @method fillStyle
         * @returns string
         */
        fillStyle(): string;
        /**
         * Returns a clone of the current color.
         * @method clone
         * @returns Color
         */
        clone(): Color;
    }
}
declare module ex {
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
    class UIActor extends Actor {
        protected _engine: Engine;
        constructor(x?: number, y?: number, width?: number, height?: number);
        onInitialize(engine: Engine): void;
        contains(x: number, y: number, useWorld?: boolean): boolean;
    }
}
declare module ex {
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
    class Trigger extends Actor {
        private action;
        repeats: number;
        target: Actor;
        constructor(x?: number, y?: number, width?: number, height?: number, action?: () => void, repeats?: number);
        update(engine: Engine, delta: number): void;
        private dispatchAction();
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
    /**
     * An enum that represents the types of emitter nozzles
     * @class EmitterType
     */
    enum EmitterType {
        /**
         * Constant for the circular emitter type
         * @property Circle {EmitterType}
         */
        Circle = 0,
        /**
         * Constant for the rectangular emitter type
         * @property Rectangle {EmitterType}
         */
        Rectangle = 1,
    }
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
        private rRate;
        private gRate;
        private bRate;
        private aRate;
        private currentColor;
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
    class ParticleEmitter extends Actor {
        private _particlesToEmit;
        numParticles: number;
        /**
         * Gets or sets the isEmitting flag
         * @property isEmitting {boolean}
         */
        isEmitting: boolean;
        /**
         * Gets or sets the backing particle collection
         * @property particles {Util.Collection&lt;Particle&gt;}
         */
        particles: Util.Collection<Particle>;
        /**
         * Gets or sets the backing deadParticle collection
         * @property particles {Util.Collection&lt;Particle&gt;}
         */
        deadParticles: Util.Collection<Particle>;
        /**
         * Gets or sets the minimum partical velocity
         * @property [minVel=0] {number}
         */
        minVel: number;
        /**
         * Gets or sets the maximum partical velocity
         * @property [maxVel=0] {number}
         */
        maxVel: number;
        /**
         * Gets or sets the acceleration vector for all particles
         * @property [acceleration=new Vector(0,0)] {Vector}
         */
        acceleration: Vector;
        /**
         * Gets or sets the minimum angle in radians
         * @property [minAngle=0] {number}
         */
        minAngle: number;
        /**
         * Gets or sets the maximum angle in radians
         * @property [maxAngle=0] {number}
         */
        maxAngle: number;
        /**
         * Gets or sets the emission rate for particles (particles/sec)
         * @property [emitRate=1] {number}
         */
        emitRate: number;
        /**
         * Gets or sets the life of each particle in milliseconds
         * @property [particleLife=2000] {number}
         */
        particleLife: number;
        /**
         * Gets or sets the opacity of each particle from 0 to 1.0
         * @property [opacity=1.0] {number}
         */
        opacity: number;
        /**
         * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
         * @property [fade=false] {boolean}
         */
        fadeFlag: boolean;
        /**
         * Gets or sets the optional focus where all particles should accelerate towards
         * @property [focus=null] {Vector}
         */
        focus: Vector;
        /**
         * Gets or sets the acceleration for focusing particles if a focus has been specified
         * @property [focusAccel=1] {number}
         */
        focusAccel: number;
        startSize: number;
        endSize: number;
        /**
         * Gets or sets the minimum size of all particles
         * @property [minSize=5] {number}
         */
        minSize: number;
        /**
         * Gets or sets the maximum size of all particles
         * @property [maxSize=5] {number}
         */
        maxSize: number;
        /**
         * Gets or sets the beginning color of all particles
         * @property [beginColor=Color.White] {Color}
         */
        beginColor: Color;
        /**
         * Gets or sets the ending color of all particles
         * @property [endColor=Color.White] {Color}
         */
        endColor: Color;
        /**
         * Gets or sets the sprite that a particle should use
         * @property [particleSprite=null] {Sprite}
         */
        particleSprite: Sprite;
        /**
         * Gets or sets the emitter type for the particle emitter
         * @property [emitterType=EmitterType.Rectangle] {EmitterType}
         */
        emitterType: EmitterType;
        /**
         * Gets or sets the emitter radius, only takes effect when the emitterType is Circle
         * @property [radius=0] {number}
         */
        radius: number;
        /**
         * Gets or sets the particle rotational speed velocity
         * @property [particleRotationalVelocity=0] {number}
         */
        particleRotationalVelocity: number;
        /**
         * Indicates whether particles should start with a random rotation
         * @property [randomRotation=false] {boolean}
         */
        randomRotation: boolean;
        constructor(x?: number, y?: number, width?: number, height?: number);
        removeParticle(particle: Particle): void;
        /**
         * Causes the emitter to emit particles
         * @method emit
         * @param particleCount {number} Number of particles to emit right now
         */
        emit(particleCount: number): void;
        clearParticles(): void;
        private createParticle();
        update(engine: Engine, delta: number): void;
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module ex {
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
    class Animation implements IDrawable {
        sprites: Sprite[];
        private speed;
        private currIndex;
        private oldTime;
        private rotation;
        private scaleX;
        private scaleY;
        /**
         * Indicates whether the animation should loop after it is completed
         * @property [loop=false] {boolean}
         */
        loop: boolean;
        freezeFrame: number;
        private engine;
        flipVertical: boolean;
        flipHorizontal: boolean;
        width: number;
        height: number;
        constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean);
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes a {{#crossLink Effects.ISpriteEffect}}{{/crossLink}} from this animation.
         * @method removeEffect
         * @param effect {Effects.ISpriteEffect} Effect to remove from this animation
         */
        removeEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an effect given the index from this animation.
         * @method removeEffect
         * @param index {number} Index of the effect to remove from this animation
         */
        removeEffect(index: number): void;
        clearEffects(): void;
        transformAboutPoint(point: Point): void;
        setRotation(radians: number): void;
        getRotation(): number;
        setScaleX(scaleX: number): void;
        setScaleY(scaleY: number): void;
        getScaleX(): number;
        getScaleY(): number;
        /**
         * Resets the animation to first frame.
         * @method reset
         */
        reset(): void;
        /**
         * Indicates whether the animation is complete, animations that loop are never complete.
         * @method isDone
         * @returns boolean
         */
        isDone(): boolean;
        /**
         * Not meant to be called by game developers. Ticks the animation forward internally an
         * calculates whether to change to teh frame.
         * @method tick
         */
        tick(): void;
        /**
         * Skips ahead a specified number of frames in the animation
         * @method skip
         * @param frames {number} Frames to skip ahead
         */
        skip(frames: number): void;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Plays an animation at an arbitrary location in the game.
         * @method play
         * @param x {number} The x position in the game to play
         * @param y {number} The y position in the game to play
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
        private soundImpl;
        private log;
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
        private audioElements;
        private _loadedAudio;
        private isLoaded;
        private index;
        private log;
        private _isPlaying;
        private _playingTimer;
        private _currentOffset;
        constructor(path: string, volume?: number);
        isPlaying(): boolean;
        private audioLoaded();
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
        private context;
        private volume;
        private buffer;
        private sound;
        private path;
        private isLoaded;
        private loop;
        private _isPlaying;
        private _isPaused;
        private _playingTimer;
        private _currentOffset;
        private _playPromise;
        private logger;
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
     * @class PromiseState
     */
    enum PromiseState {
        /**
        @property Resolved {PromiseState}
        */
        Resolved = 0,
        /**
        @property Rejected {PromiseState}
        */
        Rejected = 1,
        /**
        @property Pending {PromiseState}
        */
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
     * @class Promise
     * @constructor
     */
    class Promise<T> implements IPromise<T> {
        private _state;
        private value;
        private successCallbacks;
        private rejectCallback;
        private errorCallback;
        private logger;
        /**
         * Wrap a value in a resolved promise
         * @method wrap<T>
         * @param [value=undefined] {T} An optional value to wrap in a resolved promise
         * @returns Promise&lt;T&gt;
         */
        static wrap<T>(value?: T): Promise<T>;
        /**
         * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
         * when at least 1 promise rejects.
         * @param promises {Promise[]}
         * @returns Promise
         */
        static join<T>(...promises: Promise<T>[]): Promise<T>;
        constructor();
        /**
         * Chain success and reject callbacks after the promise is resovled
         * @method then
         * @param successCallback {T=>any} Call on resolution of promise
         * @param rejectCallback {any=>any} Call on rejection of promise
         * @returns Promise&lt;T&gt;
         */
        then(successCallback?: (value?: T) => any, rejectCallback?: (value?: any) => any): Promise<T>;
        /**
         * Add an error callback to the promise
         * @method error
         * @param errorCallback {any=>any} Call if there was an error in a callback
         * @returns Promise&lt;T&gt;
         */
        error(errorCallback?: (value?: any) => any): Promise<T>;
        /**
         * Resolve the promise and pass an option value to the success callbacks
         * @method resolve
         * @param [value=undefined] {T} Value to pass to the success callbacks
         */
        resolve(value?: T): Promise<T>;
        /**
         * Reject the promise and pass an option value to the reject callbacks
         * @method reject
         * @param [value=undefined] {T} Value to pass to the reject callbacks
         */
        reject(value?: any): Promise<T>;
        /**
         * Inpect the current state of a promise
         * @method state
         * @returns PromiseState
         */
        state(): PromiseState;
        private handleError(e);
    }
}
declare module ex {
    /**
     * An interface describing loadable resources in Excalibur
     * @class ILoadable
     */
    interface ILoadable {
        /**
         * Begins loading the resource and returns a promise to be resolved on completion
         * @method load
         * @returns Promise&lt;any&gt;
         */
        load(): Promise<any>;
        /**
         * Wires engine into loadable to receive game level events
         * @method wireEngine
         */
        wireEngine(engine: Engine): void;
        /**
         * onprogress handler
         * @property onprogress {any=>void}
         */
        onprogress: (e: any) => void;
        /**
         * oncomplete handler
         * @property oncomplete {any=>void}
         */
        oncomplete: () => void;
        /**
         * onerror handler
         * @property onerror {any=>void}
         */
        onerror: (e: any) => void;
        /**
         * Returns true if the loadable is loaded
         * @method isLoaded
         * @returns boolean
         */
        isLoaded(): boolean;
    }
}
declare module ex {
    /**
     * The Resource type allows games built in Excalibur to load generic resources.
     * For any type of remote resource it is recome
     * @class Resource
     * @extend ILoadable
     * @constructor
     * @param path {string} Path to the remote resource
     */
    class Resource<T> implements ILoadable {
        path: string;
        responseType: string;
        bustCache: boolean;
        data: T;
        logger: Logger;
        private _engine;
        constructor(path: string, responseType: string, bustCache?: boolean);
        /**
         * Returns true if the Resource is completely loaded and is ready
         * to be drawn.
         * @method isLoaded
         * @returns boolean
         */
        isLoaded(): boolean;
        wireEngine(engine: Engine): void;
        private cacheBust(uri);
        private _start(e);
        /**
         * Begin loading the resource and returns a promise to be resolved on completion
         * @method load
         * @returns Promise&lt;any&gt;
         */
        load(): Promise<T>;
        /**
         * Returns the loaded data once the resource is loaded
         * @method GetData
         * @returns any
         */
        getData(): any;
        /**
         * This method is meant to be overriden to handle any additional
         * processing. Such as decoding downloaded audio bits.
         * @method ProcessDownload
         */
        processDownload(data: T): any;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: (e: any) => void;
    }
}
declare module ex {
    /**
     * The Texture object allows games built in Excalibur to load image resources.
     * It is generally recommended to preload images using the "Texture" object.
     * @class Texture
     * @extend Resource
     * @constructor
     * @param path {string} Path to the image resource
     * @param [bustCache=true] {boolean} Optionally load texture with cache busting
     */
    class Texture extends Resource<HTMLImageElement> {
        path: string;
        bustCache: boolean;
        width: number;
        height: number;
        loaded: Promise<any>;
        private _isLoaded;
        private _sprite;
        /**
         * Populated once loading is complete
         * @property image {HTMLImageElement}
         */
        image: HTMLImageElement;
        private progressCallback;
        private doneCallback;
        private errorCallback;
        constructor(path: string, bustCache?: boolean);
        /**
         * Returns true if the Texture is completely loaded and is ready
         * to be drawn.
         * @method isLoaded
         * @returns boolean
         */
        isLoaded(): boolean;
        /**
         * Begins loading the texture and returns a promise to be resolved on completion
         * @method load
         * @returns Promise&lt;HTMLImageElement&gt;
         */
        load(): Promise<HTMLImageElement>;
        asSprite(): Sprite;
    }
    /**
     * The Sound object allows games built in Excalibur to load audio
     * components, from soundtracks to sound effects. It is generally
     * recommended to load sound resources when using Excalibur
     * @class Sound
     * @extend Resource
     * @constructor
     * @param ...paths {string[]} A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
     */
    class Sound implements ILoadable, Internal.ISound {
        private logger;
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
         * @property sound {Sound}
         */
        sound: Internal.FallbackAudio;
        static canPlayFile(file: string): boolean;
        constructor(...paths: string[]);
        wireEngine(engine: Engine): void;
        /**
         * Sets the volume of the sound clip
         * @method setVolume
         * @param volume {number} A volume value between 0-1.0
         */
        setVolume(volume: number): void;
        /**
         * Indicates whether the clip should loop when complete
         * @method setLoop
         * @param loop {boolean} Set the looping flag
         */
        setLoop(loop: boolean): void;
        isPlaying(): boolean;
        /**
         * Play the sound, returns a promise that resolves when the sound is done playing
         * @method play
         * @return ex.Promise
         */
        play(): Promise<any>;
        /**
         * Stop the sound, and do not rewind
         * @method pause
         */
        pause(): void;
        /**
         * Stop the sound and rewind
         * @method stop
         */
        stop(): void;
        /**
         * Returns true if the sound is loaded
         * @method isLoaded
         */
        isLoaded(): boolean;
        /**
         * Begins loading the sound and returns a promise to be resolved on completion
         * @method load
         * @returns Promise&lt;Sound&gt;
         */
        load(): Promise<Internal.FallbackAudio>;
    }
    /**
     * The loader provides a mechanism to preload multiple resources at
     * one time. The loader must be passed to the engine in order to
     * trigger the loading progress bar
     * @class Loader
     * @extend ILoadable
     * @constructor
     * @param [loadables=undefined] {ILoadable[]} Optionally provide the list of resources you want to load at constructor time
     */
    class Loader implements ILoadable {
        private resourceList;
        private index;
        private resourceCount;
        private numLoaded;
        private progressCounts;
        private totalCounts;
        private _engine;
        constructor(loadables?: ILoadable[]);
        wireEngine(engine: Engine): void;
        /**
         * Add a resource to the loader to load
         * @method addResource
         * @param loadable {ILoadable} Resource to add
         */
        addResource(loadable: ILoadable): void;
        /**
         * Add a list of resources to the loader to load
         * @method addResources
         * @param loadables {ILoadable[]} The list of resources to load
         */
        addResources(loadables: ILoadable[]): void;
        private sumCounts(obj);
        /**
         * Returns true if the loader has completely loaded all resources
         * @method isLoaded
         */
        isLoaded(): boolean;
        /**
         * Begin loading all of the supplied resources, returning a promise that resolves when loading of all is complete
         * @method load
         * @returns Promsie&lt;any&gt;
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
     * allowing bindings of the type data-text="this.obj.someprop",
     * data-style="color:this.obj.color.toString()". Bindings allow all valid
     * javascript expressions.
     * @class Template
     * @extends ILoadable
     * @constructor
     * @param path {string} Location of the html template
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
        constructor(path: string);
        wireEngine(engine: Engine): void;
        /**
         * Returns the full html template string once loaded.
         * @method getTemplateString
         * @returns string
         */
        getTemplateString(): string;
        private _compile();
        private _evaluateExpresion(expression, ctx);
        /**
         * Applies any ctx object you wish and evaluates the template.
         * Overload this method to include your favorite template library.
         * You may return either an HTML string or a Dom node.
         * @method apply
         * @param ctx {any} Any object you wish to apply to the template
         * @returns any
         */
        apply(ctx: any): any;
        /**
         * Begins loading the template. Returns a promise that resolves with the template string when loaded.
         * @method load
         * @returns {Promise}
         */
        load(): Promise<string>;
        /**
         * Indicates whether the template has been loaded
         * @method isLoaded
         * @returns {boolean}
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
     * @class Binding
     * @constructor
     * @param parentElementId {string} The id of the element in the dom to attach the template binding
     * @param template {Template} The template you wish to bind
     * @param ctx {any} The context of the binding, which can be any object
     */
    class Binding {
        parent: HTMLElement;
        template: Template;
        private _renderedTemplate;
        private _ctx;
        constructor(parentElementId: string, template: Template, ctx: any);
        /**
         * Listen to any arbitrary object's events to update this binding
         * @method listen
         * @param obj {any} Any object that supports addEventListener
         * @param events {string[]} A list of events to listen for
         * @param [hander=defaultHandler] {callback} A optional handler to fire on any event
         */
        listen(obj: {
            addEventListener: any;
        }, events: string[], handler?: (evt?: GameEvent) => void): void;
        /**
         * Update this template binding with the latest values from the ctx reference passed to the constructor
         * @method update
         */
        update(): void;
        private _applyTemplate(template, ctx);
    }
}
declare module ex {
    /**
     * Enum representing the different horizontal text alignments
     * @class TextAlign
     */
    enum TextAlign {
        /**
         * The text is left-aligned.
         * @property Left
         * @static
         */
        Left = 0,
        /**
         * The text is right-aligned.
         * @property Right
         * @static
         */
        Right = 1,
        /**
         * The text is centered.
         * @property Center
         * @static
         */
        Center = 2,
        /**
         * The text is aligned at the normal start of the line (left-aligned for left-to-right locales, right-aligned for right-to-left locales).
         * @property Start
         * @static
         */
        Start = 3,
        /**
         * The text is aligned at the normal end of the line (right-aligned for left-to-right locales, left-aligned for right-to-left locales).
         * @property End
         * @static
         */
        End = 4,
    }
    /**
     * Enum representing the different baseline text alignments
     * @class BaseAlign
     */
    enum BaseAlign {
        /**
         * The text baseline is the top of the em square.
         * @property Top
         * @static
         */
        Top = 0,
        /**
         * The text baseline is the hanging baseline.  Currently unsupported; this will act like alphabetic.
         * @property Hanging
         * @static
         */
        Hanging = 1,
        /**
         * The text baseline is the middle of the em square.
         * @property Middle
         * @static
         */
        Middle = 2,
        /**
         * The text baseline is the normal alphabetic baseline.
         * @property Alphabetic
         * @static
         */
        Alphabetic = 3,
        /**
         * The text baseline is the ideographic baseline; this is the bottom of
         * the body of the characters, if the main body of characters protrudes
         * beneath the alphabetic baseline.  Currently unsupported; this will
         * act like alphabetic.
         * @property Ideographic
         * @static
         */
        Ideographic = 4,
        /**
         * The text baseline is the bottom of the bounding box.  This differs
         * from the ideographic baseline in that the ideographic baseline
         * doesn't consider descenders.
         * @property Bottom
         * @static
         */
        Bottom = 5,
    }
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
    class Label extends Actor {
        text: string;
        spriteFont: SpriteFont;
        font: string;
        /**
         * Gets or sets the horizontal text alignment property for the label.
         * @property textAlign {TextAlign}
         */
        textAlign: TextAlign;
        /**
         * Gets or sets the baseline alignment property for the label.
         * @property textBaseline {BaseAlign}
         */
        baseAlign: BaseAlign;
        /**
         * Gets or sets the maximum width (in pixels) that the label should occupy
         * @property maxWidth {number}
         */
        maxWidth: number;
        /**
         * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
         * @property [letterSpacing=0] {number}
         */
        letterSpacing: number;
        caseInsensitive: boolean;
        private _textShadowOn;
        private _shadowOffsetX;
        private _shadowOffsetY;
        private _shadowColor;
        private _shadowColorDirty;
        private _textSprites;
        private _shadowSprites;
        private _color;
        constructor(text?: string, x?: number, y?: number, font?: string, spriteFont?: SpriteFont);
        /**
         * Returns the width of the text in the label (in pixels);
         * @method getTextWidth {number}
         * @param ctx {CanvasRenderingContext2D} Rending context to measure the string with
         */
        getTextWidth(ctx: CanvasRenderingContext2D): number;
        private _lookupTextAlign(textAlign);
        private _lookupBaseAlign(baseAlign);
        /**
         * Sets the text shadow for sprite fonts
         * @method setTextShadow
         * @param offsetX {number} The x offset in pixels to place the shadow
         * @param offsetY {number} The y offset in pixles to place the shadow
         * @param shadowColor {Color} The color of the text shadow
         */
        setTextShadow(offsetX: number, offsetY: number, shadowColor: Color): void;
        /**
         * Clears the current text shadow
         * @method clearTextShadow
         */
        clearTextShadow(): void;
        update(engine: Engine, delta: number): void;
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        private _fontDraw(ctx, delta, sprites);
        debugDraw(ctx: CanvasRenderingContext2D): void;
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
    enum PointerType {
        Touch = 0,
        Mouse = 1,
        Pen = 2,
        Unknown = 3,
    }
    enum PointerButton {
        Left = 0,
        Middle = 1,
        Right = 2,
        Unknown = 3,
    }
    class PointerEvent extends GameEvent {
        x: number;
        y: number;
        index: number;
        pointerType: PointerType;
        button: PointerButton;
        ev: any;
        constructor(x: number, y: number, index: number, pointerType: PointerType, button: PointerButton, ev: any);
    }
    /**
     * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to W3C Pointer Events.
     * There is always at least one pointer available (primary).
     *
     * @class Pointers
     * @extends Class
     * @constructor
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
         * @property primary {Pointer}
         */
        primary: Pointer;
        /**
         * Initializes pointer event listeners
         */
        init(): void;
        update(delta: number): void;
        /**
         * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
         * @param index {number} The pointer index to retrieve
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
         * @private
         */
        private _getPointerIndex(pointerId);
        private _stringToPointerType(s);
    }
    /**
     * Captures and dispatches PointerEvents
     * @class Pointer
     * @constructor
     * @extends Class
     */
    class Pointer extends Class {
    }
}
declare module ex.Input {
    /**
    * Enum representing input key codes
    * @class Keys
    *
    */
    enum Keys {
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
        /**
        @property Numlock {Keys}
        */
        Numlock = 144,
        /**
        @property Semicolon {Keys}
        */
        Semicolon = 186,
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
     *
     * @class KeyEvent
     * @extends GameEvent
     * @constructor
     * @param key {InputKey} The key responsible for throwing the event
     */
    class KeyEvent extends GameEvent {
        key: Keys;
        constructor(key: Keys);
    }
    /**
     * Manages Keyboard input events that you can query or listen for events on
     *
     * @class Keyboard
     * @extends Class
     * @constructor
     *
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
         *  Tests if a certain key is down.
         * @method isKeyDown
         * @param key {Keys} Test wether a key is down
         * @returns boolean
         */
        isKeyDown(key: Keys): boolean;
        /**
         *  Tests if a certain key is pressed.
         * @method isKeyPressed
         * @param key {Keys} Test wether a key is pressed
         * @returns boolean
         */
        isKeyPressed(key: Keys): boolean;
        /**
         *  Tests if a certain key is up.
         * @method isKeyUp
         * @param key {Keys} Test wether a key is up
         * @returns boolean
         */
        isKeyUp(key: Keys): boolean;
    }
}
declare module ex.Input {
    /**
     * Manages Gamepad API input. You can query the gamepads that are connected
     * or listen to events ("button" and "axis").
     * @class Gamepads
     * @extends Class
     * @param pads {Gamepad[]} The connected gamepads.
     * @param supported {boolean} Whether or not the Gamepad API is present
     */
    class Gamepads extends Class {
        /**
         * Whether or not to poll for Gamepad input (default: false)
         * @property enabled {boolean}
         */
        enabled: boolean;
        /**
         * Whether or not Gamepad API is supported
         * @property supported {boolean}
         */
        supported: boolean;
        /**
         * The minimum value an axis has to move before considering it a change
         * @property MinAxisMoveThreshold {number}
         * @static
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
     * Individual state for a Gamepad
     * @class Gamepad
     * @extends Class
     */
    class Gamepad extends Class {
        connected: boolean;
        private _buttons;
        private _axes;
        constructor();
        /**
         * Whether or not the given button is pressed
         * @param button {Buttons}
         * @param [threshold=1] {number} The threshold over which the button is considered to be pressed
         */
        isButtonPressed(button: Buttons, threshold?: number): boolean;
        /**
         * Gets the given button value
         * @param button {Buttons}
         */
        getButton(button: Buttons): number;
        /**
         * Gets the given axis value
         * @param axes {Axes}
         */
        getAxes(axes: Axes): number;
        updateButton(buttonIndex: number, value: number): void;
        updateAxes(axesIndex: number, value: number): void;
    }
    /**
     * Gamepad Buttons enumeration
     * @class Buttons
     */
    enum Buttons {
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
        Face1 = 0,
        Face2 = 1,
        Face3 = 2,
        Face4 = 3,
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
        LeftBumper = 4,
        RightBumper = 5,
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
        LeftTrigger = 6,
        RightTrigger = 7,
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
        Select = 8,
        Start = 9,
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
        LeftStick = 10,
        RightStick = 11,
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
        DpadUp = 12,
        DpadDown = 13,
        DpadLeft = 14,
        DpadRight = 15,
    }
    /**
     * Gamepad Axes enumeration
     * @class Axes
     */
    enum Axes {
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
        LeftStickX = 0,
        LeftStickY = 1,
        RightStickX = 2,
        RightStickY = 3,
    }
    class GamepadButtonEvent extends GameEvent {
        button: Buttons;
        value: number;
        constructor(button: Buttons, value: number);
    }
    class GamepadAxisEvent extends GameEvent {
        axis: Axes;
        value: number;
        constructor(axis: Axes, value: number);
    }
    interface INavigatorGamepad {
        axes: number[];
        buttons: INavigatorGamepadButton[];
        connected: boolean;
        id: string;
        index: number;
        mapping: string;
        timestamp: number;
    }
    interface INavigatorGamepadButton {
        pressed: boolean;
        value: number;
    }
    interface INavigatorGamepadEvent {
        gamepad: INavigatorGamepad;
    }
}
declare module ex {
    /**
     * Enum representing the different display modes available to Excalibur
     * @class DisplayMode
     */
    enum DisplayMode {
        /**
         * Show the game as full screen
         * @property FullScreen {DisplayMode}
         */
        FullScreen = 0,
        /**
         * Scale the game to the parent DOM container
         * @property Container {DisplayMode}
         */
        Container = 1,
        /**
         * Show the game as a fixed size
         * @Property Fixed {DisplayMode}
         */
        Fixed = 2,
    }
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
    class Engine extends Class {
        /**
         * Direct access to the engine's canvas element
         * @property canvas {HTMLCanvasElement}
         */
        canvas: HTMLCanvasElement;
        /**
         * Direct access to the engine's 2D rendering context
         * @property ctx {CanvasRenderingContext2D}
         */
        ctx: CanvasRenderingContext2D;
        /**
         * Direct access to the canvas element id, if an id exists
         * @property canvasElementId {string}
         */
        canvasElementId: string;
        /**
         * The width of the game canvas in pixels
         * @property width {number}
         */
        width: number;
        /**
         * The height of the game canvas in pixels
         * @property height {number}
         */
        height: number;
        /**
         * Access engine input like pointer, keyboard, or gamepad
         * @property input {IEngineInput}
         */
        input: Input.IEngineInput;
        /**
         * Sets or gets the collision strategy for Excalibur
         * @property collisionStrategy {CollisionStrategy}
         */
        collisionStrategy: CollisionStrategy;
        private hasStarted;
        currentScene: Scene;
        /**
         * The default scene of the game, use {{#crossLink "Engine/goToScene"}}{{/crossLink}} to transition to different scenes.
         * @property rootScene {Scene}
         */
        rootScene: Scene;
        private sceneHash;
        private animations;
        /**
         * Indicates whether the engine is set to fullscreen or not
         * @property isFullscreen {boolean}
         */
        isFullscreen: boolean;
        /**
         * Indicates the current DisplayMode of the engine.
         * @property [displayMode=FullScreen] {DisplayMode}
         */
        displayMode: DisplayMode;
        /**
         * Indicates whether audio should be paused when the game is no longer visible.
         * @property [pauseAudioWhenHidden=true] {boolean}
         */
        pauseAudioWhenHidden: boolean;
        /**
         * Indicates whether the engine should draw with debug information
         * @property [isDebug=false] {boolean}
         */
        isDebug: boolean;
        debugColor: Color;
        /**
         * Sets the background color for the engine.
         * @property [backgroundColor=new Color(0, 0, 100)] {Color}
         */
        backgroundColor: Color;
        private logger;
        private isSmoothingEnabled;
        private loader;
        private isLoading;
        private progress;
        private total;
        private loadingDraw;
        constructor(width?: number, height?: number, canvasElementId?: string, displayMode?: DisplayMode);
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
        playAnimation(animation: Animation, x: number, y: number): void;
        /**
         * Adds an actor to the current scene of the game. This is synonymous
         * to calling engine.currentScene.addChild(actor : Actor).
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the 'currentScene' may be drawn or updated.
         * @method addChild
         * @param actor {Actor} The actor to add to the current scene
         */
        addChild(actor: Actor): void;
        /**
         * Removes an actor from the currentScene of the game. This is synonymous
         * to calling engine.currentScene.removeChild(actor : Actor).
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @method removeChild
         * @param actor {Actor} The actor to remove from the current scene.
         */
        removeChild(actor: Actor): void;
        /**
         * Adds a TileMap to the Scene, once this is done the TileMap will be drawn and updated.
         * @method addTileMap
         * @param tileMap {TileMap}
         */
        addTileMap(tileMap: TileMap): void;
        /**
         * Removes a TileMap from the Scene, it willno longer be drawn or updated.
         * @method removeTileMap
         * @param tileMap {TileMap}
         */
        removeTileMap(tileMap: TileMap): void;
        /**
         * Adds an excalibur timer to the current scene.
         * @param timer {Timer} The timer to add to the current scene.
         * @method addTimer
         */
        addTimer(timer: Timer): Timer;
        /**
         * Removes an excalibur timer from the current scene.
         * @method removeTimer
         * @param timer {Timer} The timer to remove to the current scene.
         */
        removeTimer(timer: Timer): Timer;
        /**
         * Adds a scene to the engine, think of scenes in excalibur as you
         * would scenes in a play.
         * @method addScene
         * @param name {string} The name of the scene, must be unique
         * @param scene {Scene} The scene to add to the engine
         */
        addScene(name: string, scene: Scene): void;
        /**
         * Removes a scene from the engine
         * @method removeScene
         * @param scene {Scene} The scene to remove
         */
        removeScene(scene: Scene): void;
        /**
         * Removes a scene from the engine
         * @method removeScene
         * @param sceneName {string} The scene to remove
         */
        removeScene(sceneName: string): void;
        /**
         * Adds a scene to the engine, think of scenes in excalibur as you
         * would scenes in a play.
         * @method add
         * @param name {string} The name of the scene, must be unique
         * @param scene {Scene} The scene to add to the engine
         */
        add(sceneName: string, scene: Scene): void;
        /**
         * Adds an excalibur timer to the current scene.
         * @param timer {Timer} The timer to add to the current scene.
         * @method add
         */
        add(timer: Timer): void;
        /**
         * Adds a TileMap to the Scene, once this is done the TileMap will be drawn and updated.
         * @method add
         * @param tileMap {TileMap}
         */
        add(tileMap: TileMap): void;
        /**
        * Adds an actor to the current scene of the game. This is synonymous
        * to calling engine.currentScene.addChild(actor : Actor).
        *
        * Actors can only be drawn if they are a member of a scene, and only
        * the 'currentScene' may be drawn or updated.
        * @method add
        * @param actor {Actor} The actor to add to the current scene
        */
        add(actor: Actor): void;
        /**
         * Adds a UIActor to the current scene of the game, UIActors do not participate in collisions, instead the remain in the same place on the screen.
         * @method add
         * @param uiActor {UIActor} The UIActor to add to the current scene
         */
        add(uiActor: UIActor): void;
        /**
         * Removes a scene from the engine
         * @method removeScene
         * @param scene {Scene} The scene to remove
         */
        remove(scene: Scene): void;
        /**
         * Removes a scene from the engine
         * @method removeScene
         * @param sceneName {string} The scene to remove
         */
        remove(sceneName: string): void;
        /**
         * Removes an excalibur timer from the current scene.
         * @method remove
         * @param timer {Timer} The timer to remove to the current scene.
         */
        remove(timer: Timer): void;
        /**
         * Removes a TileMap from the Scene, it willno longer be drawn or updated.
         * @method remove
         * @param tileMap {TileMap}
         */
        remove(tileMap: TileMap): void;
        /**
         * Removes an actor from the currentScene of the game. This is synonymous
         * to calling engine.currentScene.removeChild(actor : Actor).
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @method remove
         * @param actor {Actor} The actor to remove from the current scene.
         */
        remove(actor: Actor): void;
        /**
        * Removes a UIActor to the scene, it will no longer be drawn or updated
        * @method remove
        * @param uiActor {UIActor} The UIActor to remove from the current scene
        */
        remove(uiActor: UIActor): void;
        /**
         * Changes the currently updating and drawing scene to a different,
         * named scene.
         * @method goToScene
         * @param name {string} The name of the scene to trasition to.
         */
        goToScene(name: string): void;
        /**
         * Returns the width of the engines drawing surface in pixels.
         * @method getWidth
         * @returns number The width of the drawing surface in pixels.
         */
        getWidth(): number;
        /**
         * Returns the height of the engines drawing surface in pixels.
         * @method getHeight
         * @returns number The height of the drawing surface in pixels.
         */
        getHeight(): number;
        /**
         * Transforms the current x, y from screen coordinates to world coordinates
         * @method screenToWorldCoordinates
         * @param point {Point} screen coordinate to convert
         */
        screenToWorldCoordinates(point: Point): Point;
        /**
         * Transforms a world coordinate, to a screen coordinate
         * @method worldToScreenCoordinates
         * @param point {Point} world coordinate to convert
         *
         */
        worldToScreenCoordinates(point: Point): Point;
        /**
         * Sets the internal canvas height based on the selected display mode.
         * @method setHeightByDisplayMode
         * @private
         */
        private setHeightByDisplayMode(parent);
        /**
         * Initializes the internal canvas, rendering context, displaymode, and native event listeners
         * @method initialize
         * @private
         */
        private initialize();
        /**
         * If supported by the browser, this will set the antialiasing flag on the
         * canvas. Set this to false if you want a 'jagged' pixel art look to your
         * image resources.
         * @method setAntialiasing
         * @param isSmooth {boolean} Set smoothing to true or false
         */
        setAntialiasing(isSmooth: boolean): void;
        /**
         *  Return the current smoothing status of the canvas
         * @method getAntialiasing
         * @returns boolean
         */
        getAntialiasing(): boolean;
        /**
         * Updates the entire state of the game
         * @method update
         * @private
         * @param delta {number} Number of milliseconds elapsed since the last update.
         */
        private update(delta);
        /**
         * Draws the entire game
         * @method draw
         * @private
         * @param draw {number} Number of milliseconds elapsed since the last draw.
         */
        private draw(delta);
        /**
         * Starts the internal game loop for Excalibur after loading
         * any provided assets.
         * @method start
         * @param [loader=undefined] {ILoadable} Optional resources to load before
         * starting the mainloop. Some loadable such as a Loader collection, Sound, or Texture.
         * @returns Promise
         */
        start(loader?: ILoadable): Promise<any>;
        /**
         * Stops Excalibur's mainloop, useful for pausing the game.
         * @method stop
         */
        stop(): void;
        /**
         * Draws the Excalibur loading bar
         * @method drawLoadingBar
         * @private
         * @param ctx {CanvasRenderingContext2D} The canvas rendering context
         * @param loaded {number} Number of bytes loaded
         * @param total {number} Total number of bytes to load
         */
        private drawLoadingBar(ctx, loaded, total);
        /**
         * Sets the loading screen draw function if you want to customize the draw
         * @method setLoadingDrawFunction
         * @param fcn {ctx: CanvasRenderingContext2D, loaded: number, total: number) => void}
         * Callback to draw the loading screen which is passed a rendering context, the number of bytes loaded, and the total number of bytes to load.
         */
        setLoadingDrawFunction(fcn: (ctx: CanvasRenderingContext2D, loaded: number, total: number) => void): void;
        /**
         * Another option available to you to load resources into the game.
         * Immediately after calling this the game will pause and the loading screen
         * will appear.
         * @method load
         * @param loader {ILoadable} Some loadable such as a Loader collection, Sound, or Texture.
         */
        load(loader: ILoadable): Promise<any>;
    }
}
