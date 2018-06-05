## Creating a Label

You can pass in arguments to the [[Label.constructor]] or simply set the
properties you need after creating an instance of the [[Label]].
Since labels are [[Actor|Actors]], they need to be added to a [[Scene]]
to be drawn and updated on-screen.

```js
var game = new ex.Engine();
// constructor
var label = new ex.Label('Hello World', 50, 50, '10px Arial');
// properties
var label = new ex.Label();
label.x = 50;
label.y = 50;
label.fontFamily = 'Arial';
label.fontSize = 10;
label.fontUnit = ex.FontUnit.Px; // pixels are the default
label.text = 'Foo';
label.color = ex.Color.White;
label.textAlign = ex.TextAlign.Center;
// add to current scene
game.add(label);
// start game
game.start();
```

## Adjusting Fonts

You can use the [[fontFamily]], [[fontSize]], [[fontUnit]], [[textAlign]], and [[baseAlign]]
properties to customize how the label is drawn.

You can also use [[getTextWidth]] to retrieve the measured width of the rendered text for
helping in calculations.

## Web Fonts

The HTML5 Canvas API draws text using CSS syntax. Because of this, web fonts
are fully supported. To draw a web font, follow the same procedure you use
for CSS. Then simply pass in the font string to the [[Label]] constructor
or set [[Label.fontFamily]].

**index.html**

```html
<!doctype html>
<html>
<head>
  <!-- Include the web font per usual -->
  <script src="//google.com/fonts/foobar"></script>
</head>
<body>
  <canvas id="game"></canvas>
  <script src="game.js"></script>
</body>
</html>
```

**game.js**

```js
var game = new ex.Engine();
var label = new ex.Label();
label.fontFamily = 'Foobar, Arial, Sans-Serif';
label.fontSize = 10;
label.fontUnit = ex.FontUnit.Em;
label.text = 'Hello World';
game.add(label);
game.start();
```

## Performance Implications

It is recommended to use a [[SpriteFont]] for labels as the raw Canvas
API for drawing text is slow (`fillText`). Too many labels that
do not use sprite fonts will visibly affect the frame rate of your game.

Alternatively, you can always use HTML and CSS to draw UI elements, but
currently Excalibur does not provide a way to easily interact with the
DOM. Still, this will not affect canvas performance and is a way to
lighten your game, if needed.
