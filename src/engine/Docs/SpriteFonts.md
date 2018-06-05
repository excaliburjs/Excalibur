## Generating the font sheet

You can use tools such as [Bitmap Font Builder](http://www.lmnopc.com/bitmapfontbuilder/) to
generate a sprite sheet for you to load into Excalibur.

## Creating a sprite font

Start with an image with a grid containing all the letters you want to support.

Once you load it into Excalibur using a [[Texture]] resource, you can create
a [[SpriteFont]] using the constructor.

For example, here is a representation of a font sprite sheet for an uppercase alphabet
with 4 columns and 7 rows:

```
ABCD
EFGH
IJKL
MNOP
QRST
UVWX
YZ
```

Each letter is 30x30 and after Z is a blank one to represent a space.

Then to create the [[SpriteFont]]:

```js
var game = new ex.Engine();
var txFont = new ex.Texture('/assets/tx/font.png');
// load assets
var loader = new ex.Loader(txFont);

// start game
game.start(loader).then(function() {
  // create a font
  var font = new ex.SpriteFont(txFont, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ', true, 4, 7, 30, 30);
  // create a label using this font
  var label = new ex.Label('Hello World', 0, 0, null, font);
  // display in-game
  game.add(label);
});
```

If you want to use a lowercase representation in the font, you can pass `false` for `caseInsensitive`
and the matching will be case-sensitive. In our example, you would need another 7 rows of
lowercase characters.

## Font colors

When using sprite fonts with a [[Label]], you can set the [[Label.color]] property
to use different colors.

## Known Issues

**One font per Label**  
[Issue #172](https://github.com/excaliburjs/Excalibur/issues/172)

If you intend on changing colors or applying opacity effects, you have to use
a new [[SpriteFont]] instance per [[Label]].

**Using opacity removes other effects**  
[Issue #148](https://github.com/excaliburjs/Excalibur/issues/148)

If you apply any custom effects to the sprites in a SpriteFont, including trying to
use [[Label.color]], they will be removed when modifying [[Label.opacity]].
