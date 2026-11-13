import * as ex from 'excalibur';

// A renderer plugin is not limited to textured quads. This one uploads its own triangle mesh:
// a spring-simulated water surface, with per-vertex depth and foam, drawn in a single call.
// Art is from Gem Jam, our Ludum Dare 58 entry: https://excaliburjs.com/ludum-58/

// --- Simulation: a row of springs that pull toward rest height and pass motion to their neighbours
class WaterSim {
  heights: Float32Array;
  velocities: Float32Array;
  private _left: Float32Array;
  private _right: Float32Array;
  private _accumulator = 0;

  constructor(
    public columns: number,
    public tension = 0.018,
    public dampening = 0.012,
    public spread = 0.18
  ) {
    this.heights = new Float32Array(columns);
    this.velocities = new Float32Array(columns);
    this._left = new Float32Array(columns);
    this._right = new Float32Array(columns);
  }

  // Push a column, `strength` is in pixels per step
  splash(column: number, strength: number) {
    const c = ex.clamp(Math.round(column), 0, this.columns - 1);
    this.velocities[c] += strength;
  }

  update(elapsedMs: number) {
    this._accumulator += Math.min(elapsedMs, 100);
    while (this._accumulator >= 1000 / 60) {
      this._accumulator -= 1000 / 60;
      this._step();
    }
  }

  private _step() {
    const { heights, velocities, _left: left, _right: right, columns } = this;
    for (let i = 0; i < columns; i++) {
      velocities[i] += -this.tension * heights[i] - this.dampening * velocities[i];
      heights[i] += velocities[i];
    }
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < columns; i++) {
        if (i > 0) {
          left[i] = this.spread * (heights[i] - heights[i - 1]);
          velocities[i - 1] += left[i];
        }
        if (i < columns - 1) {
          right[i] = this.spread * (heights[i] - heights[i + 1]);
          velocities[i + 1] += right[i];
        }
      }
      for (let i = 0; i < columns; i++) {
        if (i > 0) {
          heights[i - 1] += left[i];
        }
        if (i < columns - 1) {
          heights[i + 1] += right[i];
        }
      }
    }
  }
}

// --- Renderer: builds 2 triangles per column, batched across every body of water in the frame
const FLOATS_PER_VERTEX = 5; // position (2) + depth (1) + foam (1) + phase (1)
const MAX_COLUMNS = 4096;

class WaterRenderer implements ex.RendererPlugin {
  readonly type = 'water';
  priority = 0;

  private _gl!: WebGL2RenderingContext;
  private _context!: ex.ExcaliburGraphicsContextWebGL;
  private _shader!: ex.Shader;
  private _layout!: ex.VertexLayout;
  private _vertexCount = 0;
  private _time = 0;
  private _shallow = ex.Color.fromHex('#4fb3e0a6');
  private _deep = ex.Color.fromHex('#0b2a4ad9');
  private _scratch = ex.vec(0, 0);

  initialize(gl: WebGL2RenderingContext, context: ex.ExcaliburGraphicsContextWebGL) {
    this._gl = gl;
    this._context = context;
    this._shader = new ex.Shader({
      name: 'water',
      graphicsContext: context,
      vertexSource: `#version 300 es
        in vec2 a_position;
        in float a_depth;
        in float a_foam;
        in float a_phase;
        uniform mat4 u_matrix;
        out float v_depth;
        out float v_foam;
        out float v_phase;
        void main() {
          gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
          v_depth = a_depth;
          v_foam = a_foam;
          v_phase = a_phase;
        }`,
      fragmentSource: `#version 300 es
        precision mediump float;
        in float v_depth;
        in float v_foam;
        in float v_phase;
        uniform float u_time;
        uniform vec4 u_shallow;
        uniform vec4 u_deep;
        out vec4 fragColor;
        void main() {
          vec4 color = mix(u_shallow, u_deep, pow(v_depth, 0.7));
          // drifting caustic cells, strongest near the surface
          float caustic = sin(v_phase * 5.0 + u_time * 1.3) * sin(v_depth * 22.0 - u_time * 0.9 + v_phase * 2.0);
          color.rgb += max(caustic, 0.0) * 0.18 * (1.0 - v_depth) * (1.0 - v_depth);
          // bright surface line plus foam where the water is moving fast
          float surface = smoothstep(0.05, 0.0, v_depth);
          float foam = clamp(surface * 0.7 + v_foam * (1.0 - v_depth), 0.0, 1.0);
          color.rgb = mix(color.rgb, vec3(0.9, 0.97, 1.0), foam);
          color.a = mix(color.a, 1.0, foam * 0.6);
          fragColor = vec4(color.rgb * color.a, color.a); // premultiplied alpha
        }`
    });
    this._shader.compile();
    const vertexBuffer = new ex.VertexBuffer({ gl, size: FLOATS_PER_VERTEX * 6 * MAX_COLUMNS, type: 'dynamic' });
    this._layout = new ex.VertexLayout({
      gl,
      shader: this._shader,
      vertexBuffer,
      attributes: [
        ['a_position', 2],
        ['a_depth', 1],
        ['a_foam', 1],
        ['a_phase', 1]
      ]
    });
  }

  // Queue one body of water, `pos` is its top left corner in the current transform
  draw(sim: WaterSim, pos: ex.Vector, width: number, height: number, time: number, shallow: ex.Color, deep: ex.Color) {
    if (this._vertexCount + sim.columns * 6 > MAX_COLUMNS * 6 || !this._shallow.equals(shallow) || !this._deep.equals(deep)) {
      this.flush();
    }
    this._time = time;
    this._shallow = shallow;
    this._deep = deep;

    const transform = this._context.getTransform();
    const data = this._layout.vertexBuffer.bufferData;
    const columnWidth = width / (sim.columns - 1);
    const bottom = pos.y + height;
    let i = this._vertexCount * FLOATS_PER_VERTEX;

    const push = (x: number, y: number, depth: number, foam: number, phase: number) => {
      this._scratch.setTo(x, y);
      transform.multiply(this._scratch, this._scratch);
      data[i++] = this._scratch.x;
      data[i++] = this._scratch.y;
      data[i++] = depth;
      data[i++] = foam;
      data[i++] = phase;
    };

    for (let c = 0; c < sim.columns - 1; c++) {
      const x0 = pos.x + c * columnWidth;
      const x1 = x0 + columnWidth;
      const y0 = pos.y + sim.heights[c];
      const y1 = pos.y + sim.heights[c + 1];
      const foam0 = Math.min(1, Math.abs(sim.velocities[c]) * 0.15);
      const foam1 = Math.min(1, Math.abs(sim.velocities[c + 1]) * 0.15);
      const phase0 = x0 * 0.03;
      const phase1 = x1 * 0.03;
      push(x0, y0, 0, foam0, phase0);
      push(x0, bottom, 1, 0, phase0);
      push(x1, y1, 0, foam1, phase1);
      push(x1, y1, 0, foam1, phase1);
      push(x0, bottom, 1, 0, phase0);
      push(x1, bottom, 1, 0, phase1);
    }
    this._vertexCount = i / FLOATS_PER_VERTEX;
  }

  get hasPendingDraws() {
    return this._vertexCount > 0;
  }

  flush() {
    if (this._vertexCount === 0) {
      return;
    }
    const gl = this._gl;
    this._shader.use();
    this._layout.use(true, this._vertexCount * FLOATS_PER_VERTEX);
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);
    this._shader.setUniformFloat('u_time', this._time);
    this._shader.setUniformFloatColor('u_shallow', this._shallow);
    this._shader.setUniformFloatColor('u_deep', this._deep);
    gl.drawArrays(gl.TRIANGLES, 0, this._vertexCount);
    this._vertexCount = 0;
  }

  dispose() {
    this._layout.vertexBuffer.dispose();
    this._shader.dispose();
  }
}

// --- The Graphic picks the renderer by name, like any built-in graphic does
class Water extends ex.Graphic {
  time = 0;
  constructor(
    public sim: WaterSim,
    width: number,
    height: number,
    public shallow = ex.Color.fromHex('#4fb3e0a6'), // translucent, what sinks stays visible
    public deep = ex.Color.fromHex('#0b2a4ad9')
  ) {
    super({ width, height });
  }

  protected _drawImage(context: ex.ExcaliburGraphicsContext, x: number, y: number) {
    if (context instanceof ex.ExcaliburGraphicsContextWebGL) {
      context.draw<WaterRenderer>('water', this.sim, ex.vec(x, y), this.width, this.height, this.time, this.shallow, this.deep);
    }
  }

  clone(): Water {
    return new Water(this.sim, this.width, this.height, this.shallow, this.deep);
  }
}

// --- The plugin installs the renderer on the graphics context
class WaterPlugin extends ex.Plugin {
  constructor() {
    super('water');
  }

  override onGraphicsPostInitialize(context: ex.ExcaliburGraphicsContext) {
    if (context instanceof ex.ExcaliburGraphicsContextWebGL) {
      context.lazyRegister('water', () => new WaterRenderer());
    }
  }
}

// --- A flooded mine shaft to try it in
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1a1410'),
  pixelArt: true,
  physics: { gravity: ex.vec(0, 600) },
  plugins: [new WaterPlugin()]
});

const gemJam = 'https://excaliburjs.com/ludum-58/';
const images = {
  dirt: new ex.ImageSource(gemJam + 'images/dirt_back.png'),
  ledge: new ex.ImageSource(gemJam + 'images/dirt_front.png'),
  dwarf: new ex.ImageSource(gemJam + 'images/dwarf_idle.png'),
  emerald: new ex.ImageSource(gemJam + 'images/emerald.png'),
  ruby: new ex.ImageSource(gemJam + 'images/ruby.png'),
  gold: new ex.ImageSource(gemJam + 'images/gold.png')
};
const splashSound = new ex.Sound(gemJam + 'sounds/player_dig.mp3');

const SURFACE_Y = 230;
const sim = new WaterSim(150);
const water = new Water(sim, 600, 400 - SURFACE_Y);
const pool = new ex.Actor({ name: 'pool', pos: ex.vec(300, SURFACE_Y + (400 - SURFACE_Y) / 2), z: 5 });
pool.graphics.use(water);
pool.onPostUpdate = (_engine, elapsed) => {
  sim.update(elapsed);
  water.time += elapsed / 1000;
};
game.add(pool);

const backdrop = new ex.Actor({ name: 'backdrop', pos: ex.vec(300, 200), z: -2 });
backdrop.graphics.use(new ex.TiledSprite({ image: images.dirt, width: 600, height: 400 }));
game.add(backdrop);

const ledge = new ex.Actor({ name: 'ledge', pos: ex.vec(96, SURFACE_Y + 12), z: -1 });
ledge.graphics.use(new ex.TiledSprite({ image: images.ledge, width: 192, height: 64 }));
game.add(ledge);

const dwarf = new ex.Actor({ name: 'dwarf', pos: ex.vec(60, SURFACE_Y - 52), z: 0 });
dwarf.graphics.use(images.dwarf.toSprite());
game.add(dwarf);

// Gems pile up on the floor below the water
const floor = new ex.Actor({ name: 'floor', pos: ex.vec(300, 420), width: 700, height: 40, collisionType: ex.CollisionType.Fixed });
game.add(floor);
for (const x of [-20, 620]) {
  game.add(new ex.Actor({ name: 'wall', pos: ex.vec(x, 200), width: 40, height: 800, collisionType: ex.CollisionType.Fixed }));
}

const splashes = new ex.ParticleEmitter({
  pos: ex.vec(0, SURFACE_Y),
  z: 6,
  emitRate: 0,
  particle: {
    life: 700,
    minSpeed: 120,
    maxSpeed: 260,
    minAngle: Math.PI * 1.15,
    maxAngle: Math.PI * 1.85,
    acc: ex.vec(0, 600),
    startSize: 4,
    endSize: 1,
    beginColor: ex.Color.fromHex('#cdefff'),
    endColor: ex.Color.fromHex('#3fa7d6'),
    fade: true
  }
});
game.add(splashes);

// Anything that crosses the surface pushes the spring under it and slows down in the water
function sinkable(actor: ex.Actor, drag: number) {
  let wet = false;
  actor.onPostUpdate = () => {
    if (!wet && actor.pos.y > SURFACE_Y) {
      wet = true;
      const column = (actor.pos.x / 600) * (sim.columns - 1);
      const strength = ex.clamp(actor.vel.y / 25, 3, 26);
      sim.splash(column, strength);
      sim.splash(column - 1, strength / 2);
      sim.splash(column + 1, strength / 2);
      splashes.pos.x = actor.pos.x;
      splashes.emitParticles(Math.round(strength * 2));
      splashSound.play({ volume: 0.25 + Math.min(0.5, strength / 32) });
    }
    if (wet) {
      actor.vel = actor.vel.scale(drag);
    }
  };
}

const random = new ex.Random(1234);
const gemSprites = [images.emerald, images.ruby, images.gold].map((image) => image.toSprite({ destSize: { width: 32, height: 32 } }));
function dropGem(x: number) {
  const gem = new ex.Actor({
    name: 'gem',
    pos: ex.vec(ex.clamp(x, 20, 580), -20),
    radius: 14,
    collisionType: ex.CollisionType.Active,
    z: 2
  });
  gem.graphics.use(random.pickOne(gemSprites));
  gem.angularVelocity = random.floating(-2, 2);
  sinkable(gem, 0.9);
  game.add(gem);
}

// Ambient drips from the ceiling keep the surface alive
game.currentScene.add(
  new ex.Timer({
    interval: 700,
    repeats: true,
    randomRange: [0, 900],
    action: () => {
      const drip = new ex.Actor({ name: 'drip', pos: ex.vec(random.floating(140, 580), -4), radius: 2, color: ex.Color.fromHex('#9fd8f5'), z: 1 });
      drip.acc = ex.vec(0, 600);
      sinkable(drip, 0.5);
      drip.actions.delay(1600).die();
      game.add(drip);
    }
  })
);

let dragging = false;
game.input.pointers.primary.on('down', (evt) => {
  dragging = true;
  if (evt.worldPos.y < SURFACE_Y - 10) {
    dropGem(evt.worldPos.x);
  }
});
game.input.pointers.primary.on('up', () => (dragging = false));
game.input.pointers.primary.on('move', (evt) => {
  if (dragging && Math.abs(evt.worldPos.y - SURFACE_Y) < 40) {
    sim.splash((evt.worldPos.x / 600) * (sim.columns - 1), 6);
  }
});

const hint = new ex.Label({
  text: 'click above the water to drop gems, drag along the surface to stir it',
  pos: ex.vec(300, 20),
  z: 10,
  font: new ex.Font({ size: 14, family: 'sans-serif', color: ex.Color.fromHex('#e6edf3'), textAlign: ex.TextAlign.Center, shadow: { blur: 2, color: ex.Color.Black } })
});
game.add(hint);

game.start(new ex.Loader([...Object.values(images), splashSound])).then(() => {
  for (let i = 0; i < 5; i++) {
    game.clock.schedule(() => dropGem(random.floating(200, 560)), i * 350);
  }
});
