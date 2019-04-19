Tile maps are made up of [[Cell|Cells]] which can draw [[TileSprite|TileSprites]]. Tile
maps support multiple layers and work well for building tile-based games such as RPGs,
adventure games, strategy games, and others. Cells can be [[Cell.solid|solid]] so
that Actors can't pass through them.

We recommend using the [Tiled map editor](http://www.mapeditor.org/) to build your maps
and export them to JSON. You can then load them using a [[Resource|Generic Resource]]
and process them to create your levels. A [[TileMap]] can then be used as part of a
level or map class that adds enemies and builds game objects from the Tiled map.

## Creating a tile map

A [[TileMap]] is meant to be used in conjunction with a map editor. Creating
a tile map is fairly straightforward.

You need a tile sheet (see [[SpriteSheet]]) that holds all the available tiles to
draw. [[TileMap]] supports multiple sprite sheets, letting you organize tile sheets
to your liking.

Next, you need to populate each [[Cell]] with one or more [[TileSprite|TileSprites]]
using [[Cell.pushSprite]].

Once the [[TileMap]] is added to a [[Scene]], it will be drawn and updated.

You can then add [[Actor|Actors]] to the [[Scene]] and interact with the [[TileMap]].

In this example, we take in a map configuration that we designed (for example,
based on the exported structure of a JSON file).

```typescript
// define TypeScript interfaces to make our life easier
public interface MapDefinition {
  cells: MapCellDefinition[];
  tileSheets: IMapTileSheet[];
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
}

public interface MapCellDefinition {
  x: number;
  y: number;
  tileId: number;
  sheetId: number;
}

public interface MapTileSheet {
  id: number;
  path: string;
  columns: number;
  rows: number;
}

// create a Map class that creates a game map
// based on JSON configuration
public class Map extends ex.Scene {
  private _mapDefinition: IMapDefinition;
  private _tileMap: ex.TileMap;
  constructor(mapDef: IMapDefinition) {
    // store reference to definition
    this._mapDefinition = mapDef;
    // create a tile map
    this._tileMap = new ex.TileMap(0, 0, mapDef.tileWidth, mapDef.tileHeight,
      mapDef.width / mapDef.tileWidth, mapDef.height / mapDef.tileHeight);
  }
  public onInitialize() {
    // build our map based on JSON config
    // build sprite sheets
    this._mapDefinition.tileSheets.forEach(sheet => {

      // register sprite sheet with the tile map
      // normally, you will want to ensure you load the Texture before
      // creating the SpriteSheet
      // this can be done outside the Map class, in a Loader
      this._tileMap.registerSpriteSheet(sheet.id.toString(),
        new ex.SpriteSheet(new ex.Texture(sheet.path), sheet.columns, sheet.rows,
          this._mapDefinition.tileWidth, this._mapDefinition.tileHeight));
    });
    // fill cells with sprites
    this._mapDefinition.cells.forEach(cell => {
      // create a TileSprite
      // assume tileId is the index of the frame in the sprite sheet
      var ts = new ex.TileSprite(cell.sheetId.toString(), cell.spriteId);
      // add to cell
      this._tileMap.getCell(cell.x, cell.y).pushSprite(ts);
    }
  }
}

// create a game
var game = new ex.Engine();

// add our level (JSON from external source)
var map1 = new Map({ ... });
game.add("map1", map1);
game.start();
```

In a real game, you will want to ensure all the textures for the sprite sheets
have been loaded. You could do this in the [[Resource.processData]] function
of the generic resource when loading your JSON, before creating your `Map` object.

## Off-screen culling

The [[TileMap]] takes care of only drawing the portion of the map that is on-screen.
This significantly improves performance and essentially means Excalibur can support
huge maps. Since Actors off-screen are not drawn, this also means maps can support
many actors.

## Collision checks

You can use [[TileMap.collides]] to check if a given [[Actor]] is colliding with a
solid [[Cell]]. This method returns an intersection [[Vector]] that represents
the smallest overlap with colliding cells.
