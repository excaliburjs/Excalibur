// highlight-start
const image = new ex.ImageSource('./path/to/player.png');
// highlight-end

class PlayerSpriteGraphicsExample extends ex.Actor {
  public onInitialize() {
    // highlight-start
    // set as the "default" drawing
    this.graphics.use(image.toSprite());
    // highlight-end
  }
}