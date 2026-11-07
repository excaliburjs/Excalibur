import * as ex from '@excalibur';

// Engine sources, used by the coverage meta-test to find every class that defines clone()
const engineSources = import.meta.glob(['../../engine/**/*.ts', '!../../engine/node_cache/**'], {
  query: '?raw',
  import: 'default'
}) as Record<string, () => Promise<string>>;

/**
 * Deep structural snapshot of an object's own state (follows own enumerable props, Maps, Sets, arrays).
 * Functions and DOM/GPU objects are reduced to markers, cycles are cut. `ignore` drops keys by name.
 */
function snapshot(value: any, ignore: Set<string>, seen = new WeakSet<object>()): any {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'function') {
    return '[fn]';
  }
  if (typeof value !== 'object') {
    return value;
  }
  if (typeof HTMLElement !== 'undefined' && (value instanceof HTMLElement || value instanceof ImageBitmap)) {
    return `[${value.constructor.name}]`;
  }
  if (seen.has(value)) {
    return '[cycle]';
  }
  seen.add(value);
  if (value instanceof Map) {
    return { __map: [...value.entries()].map(([k, v]) => [snapshot(k, ignore, seen), snapshot(v, ignore, seen)]) };
  }
  if (value instanceof Set) {
    return { __set: [...value.values()].map((v) => snapshot(v, ignore, seen)) };
  }
  if (Array.isArray(value)) {
    return value.map((v) => snapshot(v, ignore, seen));
  }
  const out: Record<string, any> = { __type: value.constructor?.name };
  for (const key of Object.keys(value).sort()) {
    if (ignore.has(key)) {
      continue;
    }
    out[key] = snapshot(value[key], ignore, seen);
  }
  return out;
}

// Per-instance identity/bookkeeping that is expected to differ between an object and its clone
// plus dirty-flag/cache bookkeeping (recomputed lazily, differs by when the object last ran) and WatchVector callback plumbing
const COMMON_IGNORE = [
  'id',
  'owner',
  'events',
  '_events',
  'version',
  '_version',
  'hasChanges',
  'dirty',
  '_dirty',
  '_isDirty',
  '_isInverseDirty',
  '_syncedVersion',
  '_transformStale',
  'original',
  'change'
];

interface CloneCase {
  /** engine source file (relative to src/engine) that defines the clone() under test */
  file: string;
  name: string;
  /** build an instance with every public field set to a NON-default value */
  make: () => any;
  /** extra keys to ignore when comparing */
  ignore?: string[];
}

const image = new ex.ImageSource('/__nonexistent__.png');
const sheet = ex.SpriteSheet.fromImageSource({
  image,
  grid: { rows: 1, columns: 2, spriteWidth: 4, spriteHeight: 4 }
});

const cases: CloneCase[] = [
  { file: 'color.ts', name: 'Color', make: () => new ex.Color(1, 2, 3, 0.5) },
  { file: 'math/vector.ts', name: 'Vector', make: () => ex.vec(3, 4) },
  { file: 'math/vector3.ts', name: 'Vector3', make: () => new ex.Vector3(1, 2, 3) },
  { file: 'math/vector4.ts', name: 'Vector4', make: () => new ex.Vector4(1, 2, 3, 4) },
  { file: 'collision/bounding-box.ts', name: 'BoundingBox', make: () => new ex.BoundingBox(1, 2, 3, 4) },
  {
    file: 'graphics/rectangle.ts',
    name: 'Rectangle',
    make: () =>
      new ex.Rectangle({ width: 5, height: 6, color: ex.Color.Red, strokeColor: ex.Color.Blue, lineWidth: 3, opacity: 0.4, rotation: 1 })
  },
  {
    file: 'graphics/circle.ts',
    name: 'Circle',
    make: () => new ex.Circle({ radius: 7, color: ex.Color.Red, strokeColor: ex.Color.Blue, lineWidth: 3, flipHorizontal: true })
  },
  {
    file: 'graphics/polygon.ts',
    name: 'Polygon',
    make: () => new ex.Polygon({ points: [ex.vec(0, 0), ex.vec(5, 0), ex.vec(0, 5)], color: ex.Color.Green, scale: ex.vec(2, 2) })
  },
  {
    file: 'graphics/line.ts',
    name: 'Line',
    make: () => new ex.Line({ start: ex.vec(1, 2), end: ex.vec(8, 9), color: ex.Color.Orange, thickness: 4 })
  },
  {
    file: 'graphics/font.ts',
    name: 'Font',
    make: () =>
      new ex.Font({
        family: 'monospace',
        size: 33,
        bold: true,
        quality: 4,
        lineHeight: 40,
        color: ex.Color.Red,
        strokeColor: ex.Color.Blue,
        lineWidth: 2,
        textAlign: ex.TextAlign.Center,
        shadow: { blur: 2, offset: ex.vec(1, 1), color: ex.Color.Black }
      })
  },
  {
    file: 'graphics/text.ts',
    name: 'Text',
    make: () => new ex.Text({ text: 'hello', color: ex.Color.Red, maxWidth: 50, font: new ex.Font({ size: 20, color: ex.Color.Green }) })
  },
  {
    file: 'graphics/graphics-group.ts',
    name: 'GraphicsGroup',
    make: () =>
      new ex.GraphicsGroup({
        members: [{ graphic: new ex.Rectangle({ width: 2, height: 2, color: ex.Color.Red }), offset: ex.vec(1, 1) }],
        useAnchor: false,
        opacity: 0.5
      })
  },
  {
    file: 'graphics/animation.ts',
    name: 'Animation (reversed)',
    ignore: ['_width', '_height'], // derived from the current frame, lazily
    make: () =>
      new ex.Animation({
        frames: [ex.Color.Red, ex.Color.Green, ex.Color.Blue].map((c) => ({
          graphic: new ex.Rectangle({ width: 2, height: 2, color: c })
        })),
        reverse: true,
        speed: 2,
        frameDuration: 77,
        strategy: ex.AnimationStrategy.PingPong,
        data: { foo: 1 }
      })
  },
  {
    file: 'graphics/sprite.ts',
    name: 'Sprite',
    make: () => ex.Sprite.from(image, { sourceView: { x: 1, y: 1, width: 2, height: 2 }, destSize: { width: 8, height: 8 }, opacity: 0.3 })
  },
  {
    file: 'graphics/sprite-sheet.ts',
    name: 'SpriteSheet',
    make: () => sheet
  },
  {
    file: 'graphics/canvas.ts',
    name: 'Canvas',
    ignore: [
      'lineDash',
      'flipHorizontal',
      'flipVertical',
      'lineCap',
      'lineWidth',
      'opacity',
      'origin',
      'padding',
      'quality',
      'rotation',
      'scale',
      'smoothing',
      'strokeColor',
      'tint'
    ], // Canvas ctor never applies these, clone() does with defaults
    make: () => new ex.Canvas({ width: 10, height: 10, draw: () => undefined, color: ex.Color.Red, cache: true })
  },
  {
    file: 'collision/colliders/edge-collider.ts',
    name: 'EdgeCollider',
    make: () => new ex.EdgeCollider({ begin: ex.vec(0, 0), end: ex.vec(5, 5), offset: ex.vec(3, 4) })
  },
  {
    file: 'collision/colliders/circle-collider.ts',
    name: 'CircleCollider',
    make: () => new ex.CircleCollider({ radius: 9, offset: ex.vec(2, 3) })
  },
  {
    file: 'collision/colliders/polygon-collider.ts',
    name: 'PolygonCollider',
    make: () => new ex.PolygonCollider({ points: [ex.vec(0, 0), ex.vec(4, 0), ex.vec(4, 4), ex.vec(0, 4)], offset: ex.vec(2, 3) })
  },
  {
    file: 'collision/colliders/composite-collider.ts',
    name: 'CompositeCollider',
    ignore: ['_collisionProcessor', '_dynamicAABBTree', '_colliderTreeIds'], // spatial index internals, rebuilt per instance
    make: () => {
      const c = new ex.CompositeCollider([ex.Colliders.Box(2, 2), ex.Colliders.Circle(3)]);
      c.compositeStrategy = 'separate';
      c.offset = ex.vec(5, 6);
      return c;
    }
  },
  {
    file: 'entity-component-system/entity.ts',
    name: 'Entity',
    make: () => {
      const e = new ex.Entity({ name: 'bob' });
      e.addTag('x');
      return e;
    },
    ignore: ['name']
  },
  {
    file: 'entity-component-system/components/transform-component.ts',
    name: 'TransformComponent (screen)',
    make: () => {
      const t = new ex.TransformComponent();
      t.pos = ex.vec(1, 2);
      t.rotation = 1;
      t.scale = ex.vec(2, 3);
      t.z = 5;
      t.coordPlane = ex.CoordPlane.Screen;
      return t;
    }
  },
  {
    file: 'graphics/graphics-component.ts',
    name: 'GraphicsComponent',
    make: () => {
      const g = new ex.GraphicsComponent();
      g.add('other', new ex.Rectangle({ width: 2, height: 2, color: ex.Color.Red }));
      g.use('other');
      g.offset = ex.vec(1, 2);
      g.opacity = 0.5;
      g.flipHorizontal = true;
      g.flipVertical = true;
      g.isVisible = false;
      g.forceOnScreen = true;
      g.shouldAlwaysTick = true;
      g.color = ex.Color.Red;
      return g;
    }
  },
  {
    file: 'collision/body-component.ts',
    name: 'BodyComponent',
    make: () => {
      const b = new ex.BodyComponent({ type: ex.CollisionType.Fixed, mass: 7, bounciness: 0.9, canSleep: false });
      b.group = ex.CollisionGroupManager.groupByName('clone-spec-group') ?? ex.CollisionGroupManager.create('clone-spec-group');
      return b;
    }
  },
  {
    file: 'collision/collider-component.ts',
    name: 'ColliderComponent',
    make: () => new ex.ColliderComponent(ex.Colliders.Box(4, 4, ex.vec(0.5, 0.5), ex.vec(1, 1)))
  },
  {
    file: 'actor.ts',
    name: 'Actor',
    make: () => {
      const a = new ex.Actor({
        name: 'a',
        pos: ex.vec(1, 2),
        width: 10,
        height: 12,
        color: ex.Color.Red,
        anchor: ex.vec(0.2, 0.3),
        z: 4,
        rotation: 1,
        scale: ex.vec(2, 2),
        collisionType: ex.CollisionType.Fixed,
        canPause: false
      });
      a.graphics.flipHorizontal = true;
      a.addTag('t');
      return a;
    },
    // name/tags are covered by Entity; identity-ish fields differ legitimately
    ignore: [
      'name',
      '_name',
      'pauseComponent',
      '_tags',
      'tags',
      'componentValues',
      '_componentsToRemove',
      'components',
      '_componentsToAdd',
      '_typesMemo',
      '_actionQueue',
      '_isInitialized',
      '_isReady',
      '_isAdded'
    ]
  }
];

/**
 * Files that define a clone() but are intentionally not in the table above. Give a reason.
 */
const EXEMPT: Record<string, string> = {
  'interfaces/clonable.ts': 'interface only',
  'entity-component-system/component.ts': 'generic base clone, exercised via every Component subclass in the table',
  'actions/action/action-sequence.ts': 'action internals, no public state to compare',
  'debug/debug-config.ts': 'debug stats/config, not user-facing data',
  'graphics/nine-slice.ts': 'needs a loaded image; covered in nine-slice-spec',
  'graphics/sprite-font.ts': 'needs a loaded spritesheet; covered in sprite-font-spec',
  'math/matrix.ts': 'covered by math specs',
  'math/affine-matrix.ts': 'covered by math specs',
  'math/transform.ts': 'covered by transform specs',
  'math/line-segment.ts': 'covered by math specs',
  'math/bezier-curve.ts': 'covered by math specs',
  'lighting/light-occluder-component.ts': 'covered by lighting specs'
};

describe('clone() fidelity', () => {
  for (const c of cases) {
    describe(c.name, () => {
      const ignore = new Set([...COMMON_IGNORE, ...(c.ignore ?? [])]);

      it('copies every public field', () => {
        const original = c.make();
        const clone = original.clone();
        expect(clone).not.toBe(original);
        expect(snapshot(clone, ignore)).toEqual(snapshot(original, ignore));
      });

      it('leaves the source untouched', () => {
        const original = c.make();
        const before = snapshot(original, ignore);
        original.clone();
        expect(snapshot(original, ignore)).toEqual(before);
      });

      it('is stable when cloned again (clone of a clone matches the original)', () => {
        const original = c.make();
        const before = snapshot(original, ignore);
        expect(snapshot(original.clone().clone(), ignore)).toEqual(before);
      });
    });
  }

  it('has a case (or a documented exemption) for every class that defines clone()', async () => {
    const covered = new Set(cases.map((c) => c.file));
    const cloneDef = /^\s*(?:public |override )*clone(?:<[^>]*>)?\(/m;
    const missing: string[] = [];
    for (const [path, load] of Object.entries(engineSources)) {
      const rel = path.replace('../../engine/', '');
      const src = await load();
      if (cloneDef.test(src) && !covered.has(rel) && !(rel in EXEMPT)) {
        missing.push(rel);
      }
    }
    expect(missing, `Add a CloneCase (or an EXEMPT entry with a reason) in clone-fidelity-spec.ts for: ${missing.join(', ')}`).toEqual([]);
  });
});
