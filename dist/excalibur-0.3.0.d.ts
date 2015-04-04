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
        addEffect(effect: ex.Effects.ISpriteEffect): any;
        /**
         * Removes an effect [[ISpriteEffect]] from this drawing.
         * @param effect  Effect to remove from this drawing
         */
        removeEffect(effect: ex.Effects.ISpriteEffect): any;
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
        anchor: ex.Point;
        /**
         * Gets or sets the scale trasformation
         */
        scale: ex.Point;
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
    * An interface describing actor update pipeline modules
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
    function getOppositeSide(side: ex.Side): Side;
    /**
     * Excaliburs dynamically resizing collection
     */
    class Collection<T> {
        /**
         * Default collection size
         */
        static DefaultSize: number;
        private internalArray;
        private endPointer;
        /**
         * @param initialSize  Initial size of the internal backing array
         */
        constructor(initialSize?: number);
        private resize();
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
         * @param func  Callback to call for each element passing a reference to the element and its index, any values returned mutate the collection
         */
        map(func: (element: T, index: number) => any): void;
    }
}
declare module ex {
    /**
     * Sprites
     *
     * A `Sprite` is one of the main drawing primitives. It is responsible for drawing
     * images or parts of images known as [[Texture]]s to the screen.
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
        flipVertical: boolean;
        flipHorizontal: boolean;
        width: number;
        height: number;
        effects: Effects.ISpriteEffect[];
        internalImage: HTMLImageElement;
        private spriteCanvas;
        private spriteCtx;
        private pixelData;
        private pixelsLoaded;
        private dirtyEffect;
        /**
         * @param image   The backing image texture to build the Sprite
         * @param sx      The x position of the sprite
         * @param sy      The y position of the sprite
         * @param swidth  The width of the sprite in pixels
         * @param sheight The height of the sprite in pixels
         */
        constructor(image: Texture, sx: number, sy: number, swidth: number, sheight: number);
        private loadPixels();
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
         * Applies the [[Effects.Colorize]] to a sprite, changing the color channels of all pixesl to be the average of the original color and the provided color.
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
        private applyEffects();
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
     * separate sprites or for generating in game animations. [[Sprite]]s are organized
     * in row major order in the `SpriteSheet`.
     */
    class SpriteSheet {
        image: Texture;
        private columns;
        private rows;
        sprites: Sprite[];
        private internalImage;
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
     * SpriteFonts are a used in conjunction with a [[Label]] to specify
     * a particular bitmap as a font.
     */
    class SpriteFont extends SpriteSheet {
        image: Texture;
        private alphabet;
        private caseInsensitive;
        private spriteLookup;
        private colorLookup;
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
            [key: string]: Sprite;
        };
    }
}
declare module ex {
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
    /**
     * Tile Maps
     *
     * The `TileMap` object provides a lightweight way to do large complex scenes with collision
     * without the overhead of actors.
     *
     * Tile maps are made up of [[Cell]]s which can draw [[TileSprite]]s.
     *
     * Example usage: Load pre-built maps using the [Tiled map editor](http://www.mapeditor.org/).
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
         * Test wether this collidable with another returning,
         * the intersection vector that can be used to resovle the collision. If there
         * is no collision null is returned.
         * @param collidable  Other collidable to test
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
        private elapsedTime;
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
            [key: number]: TreeNode;
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
    * A base implementation of a camera. This class is meant to be extended.
    * @abstract
    */
    class BaseCamera {
        protected follow: Actor;
        protected focus: Point;
        protected lerp: boolean;
        private _cameraMoving;
        private _currentLerpTime;
        private _lerpDuration;
        private _totalLerpTime;
        private _lerpStart;
        private _lerpEnd;
        protected isShaking: boolean;
        private shakeMagnitudeX;
        private shakeMagnitudeY;
        private shakeDuration;
        private elapsedShakeTime;
        protected isZooming: boolean;
        private currentZoomScale;
        private maxZoomScale;
        private zoomDuration;
        private elapsedZoomTime;
        private zoomIncrement;
        private easeInOutCubic(currentTime, startValue, endValue, duration);
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
        * If no duration is specified, it will zoom by a set amount until the scale is reached.
        * @param scale    The scale of the zoom
        * @param duration The duration of the zoom in milliseconds
        */
        zoom(scale: number, duration?: number): void;
        /**
        * Gets the current zoom scale
        */
        getZoom(): number;
        private setCurrentZoomScale(zoomScale);
        /**
        * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
        * @param delta  The number of milliseconds since the last update
        */
        update(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
        private isDoneShaking();
        private isDoneZooming();
    }
    /**
    * An extension of BaseCamera that is locked vertically; it will only move side to side.
    */
    class SideCamera extends BaseCamera {
        getFocus(): Point;
    }
    /**
    * An extension of BaseCamera that is locked to an actor or focal point; the actor will appear in the center of the screen.
    */
    class TopCamera extends BaseCamera {
        getFocus(): Point;
    }
}
declare module ex {
    interface IActionable {
        actions: ActionContext;
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
         * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions will repeat forever
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
    /**
     * Scenes
     *
     * [[Actor]]s are composed together into groupings called Scenes in
     * Excalibur. The metaphor models the same idea behind real world
     * actors in a scene. Only actors in scenes will be updated and drawn.
     *
     * Typical usages of a scene include: levels, menus, loading screens, etc.
     */
    class Scene extends ex.Class {
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
            [key: string]: Group;
        };
        /**
         * Access to the Excalibur engine
         */
        engine: Engine;
        /**
         * The [[UIActor]]s in a scene, if any; these are drawn last
         */
        uiActors: Actor[];
        private _collisionResolver;
        private _killQueue;
        private _timers;
        private _cancelQueue;
        private _isInitialized;
        private _logger;
        constructor(engine?: Engine);
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
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        onInitialize(engine: Engine): void;
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
    }
}
declare module ex {
    /**
     * Standard easing functions for motion in Excalibur
     */
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
     */
    enum CollisionType {
        /**
         * Actors with the PreventCollision setting do not participate in any
         * collisions and do not raise collision events.
         */
        PreventCollision = 0,
        /**
         * Actors with the Passive setting only raise collision events, but are not
         * influenced or moved by other actors and do not influence or move other actors.
         */
        Passive = 1,
        /**
         * Actors with the Active setting raise collision events and participate
         * in collisions with other actors and will be push or moved by actors sharing
         * the Active or Fixed setting.
         */
        Active = 2,
        /**
         * Actors with the Elastic setting will behave the same as Active, except that they will
         * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
         * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
         */
        Elastic = 3,
        /**
         * Actors with the Fixed setting raise collision events and participate in
         * collisions with other actors. Actors with the Fixed setting will not be
         * pushed or moved by other actors sharing the Fixed or Actors. Think of Fixed
         * actors as "immovable/onstoppable" objects. If two Fixed actors meet they will
         * not be pushed or moved by each other, they will not interact except to throw
         * collision events.
         */
        Fixed = 4,
    }
    /**
     * The most important primitive in Excalibur is an "Actor." Anything that
     * can move on the screen, collide with another Actor, respond to events,
     * or interact with the current scene, must be an actor. An Actor **must**
     * be part of a [[Scene]] for it to be drawn to the screen.
     */
    class Actor extends ex.Class implements IActionable {
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
         */
        anchor: Point;
        private height;
        private width;
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
        scale: ex.Vector;
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
         * Indicates wether the actor is physically in the viewport
         */
        isOffScreen: boolean;
        /**
         * The visibility of an actor
         */
        visible: boolean;
        /**
         * The opacity of an actor
         */
        opacity: number;
        previousOpacity: number;
        /**
         * Direct access to the actor's action queue. Useful if you are building custom actions.
         */
        actionQueue: ex.Internal.Actions.ActionQueue;
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
         * default all actors participate in Active collisions.
         */
        collisionType: CollisionType;
        collisionGroups: string[];
        private _collisionHandlers;
        private _isInitialized;
        frames: {
            [key: string]: IDrawable;
        };
        /**
         * Access to the current drawing on for the actor, this can be
         * an [[Animation]], [[Sprite]], or [[Polygon]].
         * Set drawings with [[Actor.setDrawing]].
         */
        currentDrawing: IDrawable;
        centerDrawingX: boolean;
        centerDrawingY: boolean;
        /**
         * Modify the current actor update pipeline.
         */
        pipeline: IPipelineModule[];
        /**
         * Sets the color of the actor. A rectangle of this color will be drawn if no [[IDrawable]] is specified as the actors drawing.
         */
        color: Color;
        /**
         * Whether or not to enable the [[CapturePointerModule]] trait that propogates pointer events to this actor
         */
        enableCapturePointer: boolean;
        /**
         * Configuration for [[CapturePointerModule]] trait
         */
        capturePointer: ex.ICapturePointerConfig;
        private _isKilled;
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         * @param color   The starting color of the actor
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
         * Adds a whole texture as the "default" drawing.
         */
        addDrawing(texture: Texture): any;
        /**
         * Adds a whole sprite as the "default" drawing.
         */
        addDrawing(sprite: Sprite): any;
        /**
         * Adds a drawing to the list of available drawings for an actor.
         * @param key     The key to associate with a drawing for this actor
         * @param drawing This can be an [[Animation]], [[Sprite]], or [[Polygon]].
         */
        addDrawing(key: any, drawing: IDrawable): any;
        /**
         * Artificially trigger an event on an actor, useful when creating custom events.
         * @param eventName   The name of the event to trigger
         * @param event       The event object to pass to the callback
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
         * Get the center point of an actor, factoring in `anchor`
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
         */
        contains(x: number, y: number): boolean;
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
            [key: string]: {
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
        rotateTo(angleRadians: number, speed: number): Actor;
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
         * @param times The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions will repeat forever
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
        private appenders;
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
        private canvas;
        private ctx;
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
        constructor();
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
     * Triggers are a method of firing arbitrary code on collision. These are useful
     * as 'buttons', 'switches', or to trigger effects in a game. By defualt triggers
     * are invisible, and can only be seen with debug mode enabled on the [[Engine]].
     */
    class Trigger extends Actor {
        private action;
        repeats: number;
        target: Actor;
        /**
         * @param x       The x position of the trigger
         * @param y       The y position of the trigger
         * @param width   The width of the trigger
         * @param height  The height of the trigger
         * @param action  Callback to fire when trigger is activated
         * @param repeats The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
         */
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
     * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
     * extend [[Actor]] allowing you to use all of the features that come with.
     *
     * The easiest way to create a `ParticleEmitter` is to use the
     * [Particle Tester](http://erikonarheim.com/labs/particle-tester/).
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
        particleSprite: ex.Sprite;
        /**
         * Gets or sets the emitter type for the particle emitter
         */
        emitterType: ex.EmitterType;
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
     */
    class Animation implements IDrawable {
        sprites: Sprite[];
        speed: number;
        currentFrame: number;
        private oldTime;
        anchor: Point;
        rotation: number;
        scale: Point;
        /**
         * Indicates whether the animation should loop after it is completed
         */
        loop: boolean;
        freezeFrame: number;
        private engine;
        flipVertical: boolean;
        flipHorizontal: boolean;
        width: number;
        height: number;
        /**
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
         * Applies the colorize effect to a sprite, changing the color channels of all pixesl to be the average of the original color and the provided color.
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
        play(): ex.Promise<any>;
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
        play(): ex.Promise<any>;
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
         * @param value  An optional value to wrap in a resolved promise
         */
        static wrap<T>(value?: T): Promise<T>;
        /**
         * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
         * when at least 1 promise rejects.
         */
        static join<T>(...promises: Promise<T>[]): Promise<T>;
        constructor();
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
        private handleError(e);
    }
}
declare module ex {
    /**
     * An interface describing loadable resources in Excalibur
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
     * The Resource type allows games built in Excalibur to load generic resources.
     * For any type of remote resource it is recommended to use `Resource` for preloading.
     *
     * Example usages: maps, levels, config, compressed files, blobs.
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
        private cacheBust(uri);
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
     * The `Texture` object allows games built in Excalibur to load image resources.
     * It is generally recommended to preload images using the `Texture` object.
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
        private progressCallback;
        private doneCallback;
        private errorCallback;
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
     * The `Sound` object allows games built in Excalibur to load audio
     * components, from soundtracks to sound effects. It is generally
     * recommended to preload sound resources using `Sound` when using Excalibur.
     */
    class Sound implements ILoadable, ex.Internal.ISound {
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
         */
        sound: ex.Internal.FallbackAudio;
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
        play(): ex.Promise<any>;
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
        load(): Promise<ex.Internal.FallbackAudio>;
    }
    /**
     * The loader provides a mechanism to preload multiple resources at
     * one time. The loader must be passed to the engine in order to
     * trigger the loading progress bar.
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
        private resourceList;
        private index;
        private resourceCount;
        private numLoaded;
        private progressCounts;
        private totalCounts;
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
        private sumCounts(obj);
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
        load(): ex.Promise<string>;
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
         * The text is aligned at the normal start of the line (left-aligned for left-to-right locales, right-aligned for right-to-left locales).
         */
        Start = 3,
        /**
         * The text is aligned at the normal end of the line (right-aligned for left-to-right locales, left-aligned for right-to-left locales).
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
         * The text baseline is the hanging baseline.  Currently unsupported; this will act like alphabetic.
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
     * Labels are the way to draw small amounts of text to the screen in Excalibur. They are
     * actors and inherit all of the benifits and capabilities.
     *
     * It is recommended to use a [[SpriteFont]] for labels as the raw Canvas
     * API for drawing text is slow (`fillText`).
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
         * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precendence over a css font.
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
    enum PointerScope {
        Canvas = 0,
        Document = 1,
    }
    class PointerEvent extends ex.GameEvent {
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
     */
    class Pointers extends ex.Class {
        private _engine;
        private _pointerDown;
        private _pointerUp;
        private _pointerMove;
        private _pointerCancel;
        private _pointers;
        private _activePointers;
        constructor(engine: ex.Engine);
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
     * Manages Keyboard input events that you can query or listen for events on
     */
    class Keyboard extends ex.Class {
        private _keys;
        private _keysUp;
        private _keysDown;
        private _engine;
        constructor(engine: ex.Engine);
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
         * Tests if a certain key is down.
         * @param key  Test wether a key is down
         */
        isKeyDown(key: Keys): boolean;
        /**
         * Tests if a certain key is pressed.
         * @param key  Test wether a key is pressed
         */
        isKeyPressed(key: Keys): boolean;
        /**
         * Tests if a certain key is up.
         * @param key  Test wether a key is up
         */
        isKeyUp(key: Keys): boolean;
    }
}
declare module ex.Input {
    /**
     * Manages Gamepad API input. You can query the gamepads that are connected
     * or listen to events ("button" and "axis").
     */
    class Gamepads extends ex.Class {
        /**
         * Whether or not to poll for Gamepad input (default: false)
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
        constructor(engine: ex.Engine);
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
     */
    class Gamepad extends ex.Class {
        connected: boolean;
        private _buttons;
        private _axes;
        constructor();
        /**
         * Whether or not the given button is pressed
         * @param threshold  The threshold over which the button is considered to be pressed
         */
        isButtonPressed(button: Buttons, threshold?: number): boolean;
        /**
         * Gets the given button value
         */
        getButton(button: Buttons): number;
        /**
         * Gets the given axis value
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
    class GamepadButtonEvent extends ex.GameEvent {
        button: Buttons;
        value: number;
        constructor(button: Buttons, value: number);
    }
    class GamepadAxisEvent extends ex.GameEvent {
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
/**
 * # Welcome to the Excalibur API
 *
 * This documentation is automatically generated from the Excalibur
 * source code on GitHub.
 *
 * If you're just starting out, we recommend reading the tutorials and guides
 * on Excaliburjs.com.
 *
 * If you're looking for something specific, you can search the documentation
 * using the search icon at the top.
 */
declare module ex {
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
        displayMode?: ex.DisplayMode;
        /**
         * Configures the pointer scope. Pointers scoped to the 'Canvas' can only fire events within the canvas viewport; whereas, 'Document' (default) scoped will fire anywhere on the page.
         */
        pointerScope?: ex.Input.PointerScope;
    }
    /**
     * The `Engine` is the main driver for a game. It is responsible for
     * starting/stopping the game, maintaining state, transmitting events,
     * loading resources, and managing the scene.
     */
    class Engine extends ex.Class {
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
        input: ex.Input.IEngineInput;
        /**
         * Gets or sets the [[CollisionStrategy]] for Excalibur actors
         */
        collisionStrategy: CollisionStrategy;
        private hasStarted;
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
            [key: string]: Scene;
        };
        private animations;
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
        private logger;
        private isSmoothingEnabled;
        private loader;
        private isLoading;
        private progress;
        private total;
        private loadingDraw;
        /**
         * Creates a new game using the given [[IEngineOptions]]
         */
        constructor(options: IEngineOptions);
        /**
         * Creates a new game with the given options
         * @param width            The width in pixels of the Excalibur game viewport
         * @param height           The height in pixels of the Excalibur game viewport
         * @param canvasElementId  If this is not specified, then a new canvas will be created and inserted into the body.
         * @param displayMode      If this is not specified, then it will fall back to fixed if a height and width are specified, else the display mode will be FullScreen.
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
         * named scene.
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
        private setHeightByDisplayMode(parent);
        /**
         * Initializes the internal canvas, rendering context, displaymode, and native event listeners
         */
        private initialize(options?);
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
        private update(delta);
        /**
         * Draws the entire game
         * @param draw  Number of milliseconds elapsed since the last draw.
         */
        private draw(delta);
        /**
         * Starts the internal game loop for Excalibur after loading
         * any provided assets.
         * @param loader  Optional resources to load before starting the main loop. Some [[ILoadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
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
        private drawLoadingBar(ctx, loaded, total);
        /**
         * Sets the loading screen draw function if you want to customize the draw
         * @param fcn  Callback to draw the loading screen which is passed a rendering context, the number of bytes loaded, and the total number of bytes to load.
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
}
