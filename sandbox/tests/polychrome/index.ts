var game = new ex.Engine({
  width: 800,
  height: 800,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  suppressPlayButton: true,
  pixelArt: true,
  pixelRatio: 2
});

var glsl: (x: any) => any = function (strings: TemplateStringsArray, ...values: any[]): string {
  // Combine template strings and values
  let source = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] !== undefined ? values[i] : '');
  }, '');

  // Add pixel art sampler
  if (source.includes('pixel_texture(')) {
    source =
      `
// Inigo Quilez pixel art filter https://jorenjoestar.github.io/post/pixel_art_filtering/
vec4 pixel_texture(in sampler2D tex, in vec2 uv) {
  vec2 pixel = uv * vec2(textureSize(tex, 0));

  vec2 seam=floor(pixel+.5);
  vec2 dudv=fwidth(pixel);
  pixel=seam+clamp((pixel-seam)/dudv,-.5,.5);

  vec2 pixel_uv =  pixel/vec2(textureSize(tex, 0));

  return texture(tex, pixel_uv);

}\n` + source;

    // TODODthis insertion is problematic because it must go before the function def above,
    // BUT it's possible it already exists in the source below
    if (!source.includes(`uniform vec2 u_graphic_resolution;\n`)) {
      source = `uniform vec2 u_graphic_resolution;\n` + source;
    }
  }

  // Add precision pragma
  const precisionRegex = /^\s*precision\s+(lowp|mediump|highp)\s+(float|int)\s*;/m;
  if (!precisionRegex.test(source)) {
    source = 'precision mediump float;\n' + source;
  }

  // Add WebGL2 version directive if not present
  if (!source.trim().startsWith('#version')) {
    source = '#version 300 es\n' + source;
  }
  return source;
} as any;

var cards = new ex.ImageSource('./kenny-cards.png');
var cardSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: cards,
  grid: {
    rows: 4,
    columns: 14,
    spriteWidth: 42,
    spriteHeight: 60
  },
  spacing: {
    originOffset: { x: 11, y: 2 },
    margin: { x: 23, y: 5 }
  }
});

cardSpriteSheet.sprites.forEach((s) => (s.scale = ex.vec(2, 2)));

var chromeCard = cardSpriteSheet.getSprite(0, 0);

var loader = new ex.Loader([cards]);

var polychrome = game.graphicsContext.createMaterial({
  name: 'polychrome',
  fragmentSource: glsl`

  in vec2 v_uv;

  uniform sampler2D u_graphic;

  uniform float u_time_ms;

  uniform vec2 u_size; // size of the sprite

  out vec4 fragColor;

  vec2 fade(vec2 t) {
      return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  vec4 permute(vec4 x) {
      return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float perlin(vec2 P) {
      vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
      vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
      Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
      vec4 ix = Pi.xzxz;
      vec4 iy = Pi.yyww;
      vec4 fx = Pf.xzxz;
      vec4 fy = Pf.yyww;
      vec4 i = permute(permute(ix) + iy);
      vec4 gx = 2.0 * fract(i / 41.0) - 1.0;
      vec4 gy = abs(gx) - 0.5;
      vec4 tx = floor(gx + 0.5);
      gx = gx - tx;
      vec2 g00 = vec2(gx.x, gy.x);
      vec2 g10 = vec2(gx.y, gy.y);
      vec2 g01 = vec2(gx.z, gy.z);
      vec2 g11 = vec2(gx.w, gy.w);
      vec4 norm = 1.79284291400159 - 0.85373472095314 * 
          vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
      g00 *= norm.x;
      g01 *= norm.y;
      g10 *= norm.z;
      g11 *= norm.w;
      float n00 = dot(g00, vec2(fx.x, fy.x));
      float n10 = dot(g10, vec2(fx.y, fy.y));
      float n01 = dot(g01, vec2(fx.z, fy.z));
      float n11 = dot(g11, vec2(fx.w, fy.w));
      vec2 fade_xy = fade(Pf.xy);
      vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
      float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
      return 2.3 * n_xy;
  }

  void main() {
    const float scale = 3.;
    const vec3 cols[7] = vec3[](
      vec3(204., 102., 255.) / 255.,
      vec3(102., 102., 255.) / 255.,
      vec3(0.  , 153., 255.) / 255.,
      vec3(102., 255., 153.) / 255.,
      vec3(255., 255., 102.) / 255.,
      vec3(255., 153., 102.) / 255.,
      vec3(254., 51. , 51. ) / 255.
    );

    // sample our color
    vec4 color = pixel_texture(u_graphic, v_uv);

    // pseudo rotate a camera around
    vec3 viewDirection = normalize(vec3(.8 * -cos(u_time_ms/1000.), 0.25 * sin(u_time_ms/1000.), -.7));
    
    // perturb the normal with sampled perlin across uv to give it some flare, this gives the banding effect
    vec3 fakeNormal = vec3(0., 0., -1.) + perlin((2. * v_uv + u_size) * 5.);

    float d = abs(dot(viewDirection, fakeNormal));

    // 7 possible colors in our rainbow
    d *= 7. * scale;
    d = mod(d, 7.);

    // Find the 2 color segments above and below
    float lower = floor(d);
    float upper = ceil(d);

    int lowerIndex = int(mod(lower, 7.0));
    int upperIndex = int(mod(upper, 7.0));

    vec3 lowerColor = cols[lowerIndex];
    vec3 upperColor = cols[upperIndex];

    // lerp em! between the fraction of the normal pointing at us
    vec4 polyColor = vec4(
      mix(lowerColor.r, upperColor.r, fract(d)),
      mix(lowerColor.g, upperColor.g, fract(d)),
      mix(lowerColor.b, upperColor.b, fract(d)),
      1.
    );

    // if far enough away from white, apply the color
    // remove this "if" condition if you want to apply to all pixels
    if (distance(color, vec4(1.)) >= .2) {
      color *= polyColor;
    }

    fragColor = color;
    fragColor.rgb *= fragColor.a;
  }`
});

game.start(loader).then(() => {
  var cardActor = new ex.Actor({
    pos: ex.vec(400, 400),
    scale: ex.vec(5, 5),
    material: polychrome
  });
  cardActor.graphics.use(chromeCard);
  game.add(cardActor);

  let currentCard = 0;
  let cardTimer = new ex.Timer({
    interval: 1000,
    repeats: true,
    action: () => {
      cardActor.graphics.use(cardSpriteSheet.sprites[currentCard]);
      currentCard = (currentCard + 1) % 52;
    }
  });
  cardTimer.start();
  game.add(cardTimer);
});
