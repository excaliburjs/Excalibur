
class GameScene extends ex.Scene {
  private tilemap!: ex.TileMap;
  private font!: ex.Font;

  onInitialize(engine: ex.Engine): void {
    this.tilemap = new ex.TileMap({
      pos: ex.Vector.Zero,
      rows: 24,
      columns: 16,
      tileWidth: 32,
      tileHeight: 32,
    });
    engine.add(this.tilemap);
    this.font = new ex.Font();
    // this.font.showDebug = true;

    this.tilemap.tiles.forEach((tile) => {
      tile.data.set("id", 0);
    });

    engine.input.pointers.primary.on("down", (event: ex.Input.PointerEvent): void => {
      this.tilemap.tiles.forEach((tile) => {
        const id = tile.data.get("id")!;
        tile.data.set("id", id + 1);
      });

      this.updateTilemap();
    });
  }

  updateTilemap(): void {
    this.tilemap.tiles.forEach((tile) => {
      const id = tile.data.get("id")!;

      const text = new ex.Text({
        text: `${id}`,
        color: ex.Color.White,
        // font: this.font
      });
      tile.clearGraphics();
      tile.addGraphic(text);
    });
  }
}

var game = new ex.Engine({
  width: 1080/2,
  height: 1920/2,
  displayMode: ex.DisplayMode.FitScreen
});
game.addScene('scene', new GameScene());
game.start().then(() => {
  game.goToScene('scene');
});