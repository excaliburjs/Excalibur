## Creating colors

```js
// RGBA
new ex.Color(r, g, b, a);
ex.Color.fromRGB(r, g, b, a);

// HSLA
ex.Color.fromHSL(h, s, l, a);
// Hex, alpha optional
ex.Color.fromHex('#000000');
ex.Color.fromHex('#000000FF');

// String representation of a color with rgb as default
// Options include rgb,hsl,hex
ex.Color.toString('rgb');
```

## Working with colors

Since Javascript does not support structs, if you change a color "constant" like [[Color.Black]]
it will change it across the entire game. You can safely use the color operations
like [[Color.lighten]] and [[Color.darken]] because they `clone` the color to
return a new color. However, be aware that this can use up memory if used excessively.

Just be aware that if you directly alter properties (i.e. [[Color.r]], etc.) , this will change it
for all the code that uses that instance of Color.
