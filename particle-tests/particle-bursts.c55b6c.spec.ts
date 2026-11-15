import * as ex from '@excalibur';
import { TestUtils } from '../src/spec/__util__/test-utils';

type Schedule = { duration: number; bursts: { time: number; count: number }[]; loop?: boolean };
type Scheduled = (ex.ParticleEmitter | ex.GpuParticleEmitter) & { emissionSchedule?: Schedule; restartEmission(): void };
const constructors = [
  ['CPU', ex.ParticleEmitter],
  ['GPU', ex.GpuParticleEmitter]
] as const;
let engines: ex.Engine[];
async function game() {
  const engine = TestUtils.engine({ width: 220, height: 220, backgroundColor: ex.Color.Transparent });
  await TestUtils.runToReady(engine);
  (engine.clock as ex.TestClock).step(1);
  engines.push(engine);
  return engine;
}
function make(Ctor: typeof ex.ParticleEmitter | typeof ex.GpuParticleEmitter, schedule?: Schedule, extra: any = {}) {
  return new Ctor({
    x: 110,
    y: 110,
    width: 80,
    height: 80,
    emitRate: 0,
    isEmitting: true,
    random: new ex.Random(374),
    particle: {
      life: 1000,
      size: 5,
      minSize: 5,
      maxSize: 5,
      minSpeed: 0,
      maxSpeed: 0,
      beginColor: ex.Color.Red,
      endColor: ex.Color.Blue,
      fade: false
    },
    ...(schedule ? { emissionSchedule: schedule } : {}),
    ...extra
  } as any) as Scheduled;
}
function update(e: ex.Engine, ms: number) {
  e.currentScene.update(e, ms);
}
function pixels(e: ex.Engine, elapsed = 0) {
  e.graphicsContext.beginDrawLifecycle();
  e.graphicsContext.clear();
  e.currentScene.draw(e.graphicsContext, elapsed);
  e.graphicsContext.flush();
  e.graphicsContext.endDrawLifecycle();
  return snapshot(e);
}
function snapshot(e: ex.Engine) {
  const canvas = document.createElement('canvas');
  canvas.width = 220;
  canvas.height = 220;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(e.canvas, 0, 0);
  return ctx.getImageData(0, 0, 220, 220).data;
}
function samePixels(actual: Uint8ClampedArray, expected: Uint8ClampedArray) {
  let wrong = 0,
    visible = 0;
  for (let i = 0; i < expected.length; i += 4) {
    if (expected[i + 3] > 0) visible++;
    if ([0, 1, 2, 3].some((c) => Math.abs(actual[i + c] - expected[i + c]) > 3)) wrong++;
  }
  expect(visible).toBeGreaterThan(10);
  expect(wrong).toBeLessThanOrEqual(Math.max(2, visible * 0.015));
}

function particles(e: ex.Engine) {
  return e.currentScene.entities.filter((p) => p instanceof ex.Particle) as ex.Particle[];
}
async function verifyContinuousCadence(Ctor: typeof ex.ParticleEmitter | typeof ex.GpuParticleEmitter) {
  const e = await game(),
    reference = await game();
  const actual = make(Ctor, undefined, { emitRate: 25 });
  const expected = make(Ctor);
  e.add(actual);
  reference.add(expected);
  update(e, 0);
  update(reference, 0);
  pixels(e, 0);
  pixels(reference, 0);
  // The pinned continuous accumulator emits two particles, then carries the half particle forward.
  for (const [count, total] of [
    [2, 2],
    [3, 5]
  ]) {
    expected.emitParticles(count);
    update(e, 100);
    update(reference, 100);
    if (Ctor === ex.ParticleEmitter) expect(particles(e)).toHaveLength(total);
    samePixels(pixels(e, 100), pixels(reference, 100));
  }
}

beforeEach(() => {
  engines = [];
});
afterEach(() => {
  for (const e of engines) {
    e.stop();
    e.dispose();
  }
});

it.each(constructors)('%s validates schedules and preserves the working schedule after invalid assignments', async (_label, Ctor) => {
  const valid: Schedule = {
    duration: 40,
    bursts: [
      { time: 0, count: 2 },
      { time: 15, count: 3 }
    ]
  };
  const bad = [
    { bursts: [] } as any,
    { ...valid, bursts: [{ count: 1 }] } as any,
    { ...valid, bursts: [{ time: 0 }] } as any,
    { duration: valid.duration } as any,
    { ...valid, bursts: {} } as any,
    { ...valid, duration: 0 },
    { ...valid, duration: -1 },
    { ...valid, duration: Infinity },
    { ...valid, duration: NaN },
    { ...valid, bursts: [{ time: -1, count: 1 }] },
    { ...valid, bursts: [{ time: 40, count: 1 }] },
    { ...valid, bursts: [{ time: Infinity, count: 1 }] },
    { ...valid, bursts: [{ time: NaN, count: 1 }] },
    { ...valid, bursts: [{ time: 0, count: -1 }] },
    { ...valid, bursts: [{ time: 0, count: 0.5 }] },
    { ...valid, bursts: [{ time: 0, count: Infinity }] },
    { ...valid, bursts: [{ time: 0, count: NaN }] },
    { ...valid, bursts: [{ time: 0, count: 1 }, { time: 40, count: 1 }] },
    { ...valid, bursts: [{ time: 0, count: 1 }, { time: 10, count: NaN }] }
  ];
  for (const value of bad) expect(() => make(Ctor, value)).toThrow();
  const e = await game(),
    reference = await game();
  const actual = make(Ctor, valid),
    expected = make(Ctor);
  e.add(actual);
  reference.add(expected);
  update(reference, 0);
  pixels(reference, 0);
  update(e, 5);
  for (const value of bad)
    expect(() => {
      actual.emissionSchedule = value;
    }).toThrow();
  expected.emitParticles(2);
  update(reference, 15);
  pixels(reference, 15);
  expected.emitParticles(3);
  update(reference, 5);
  update(e, 15);
  samePixels(pixels(e, 20), pixels(reference, 5));
});

it.each(constructors)('%s emits all crossed loops and zero-time boundaries without duplicates', async (_label, Ctor) => {
  const e = await game(),
    reference = await game();
  const actual = make(Ctor, {
    duration: 40,
    loop: true,
    bursts: [
      { time: 25, count: 3 },
      { time: 0, count: 1 },
      { time: 25, count: 2 },
      { time: 10, count: 0 }
    ]
  });
  const expected = make(Ctor);
  e.add(actual);
  reference.add(expected);
  update(reference, 0);
  pixels(reference, 0);
  for (const ms of [0, 0, 25, 15, 65]) update(e, ms);
  expected.emitParticles(1);
  update(reference, 25);
  pixels(reference, 25);
  expected.emitParticles(5);
  update(reference, 15);
  pixels(reference, 15);
  expected.emitParticles(1);
  update(reference, 25);
  pixels(reference, 25);
  expected.emitParticles(5);
  update(reference, 15);
  pixels(reference, 15);
  expected.emitParticles(1);
  update(reference, 25);
  pixels(reference, 25);
  expected.emitParticles(5);
  update(reference, 0);
  samePixels(pixels(e, 105), pixels(reference, 0));
});

it.each(constructors)('%s defaults to one cycle and pauses and restarts without clearing live particles', async (_label, Ctor) => {
  const e = await game(),
    reference = await game();
  const actual = make(Ctor, {
    duration: 50,
    bursts: [
      { time: 0, count: 2 },
      { time: 20, count: 3 }
    ]
  });
  const expected = make(Ctor);
  e.add(actual);
  reference.add(expected);
  update(reference, 0);
  pixels(reference, 0);
  update(e, 10);
  expected.emitParticles(2);
  update(reference, 10);
  pixels(reference, 10);
  actual.isEmitting = false;
  update(e, 40);
  update(reference, 40);
  pixels(reference, 40);
  actual.isEmitting = true;
  update(e, 10);
  update(reference, 10);
  pixels(reference, 10);
  expected.emitParticles(3);
  actual.isEmitting = false;
  expect(actual.restartEmission).toBeTypeOf('function');
  actual.restartEmission();
  expect(actual.isEmitting).toBe(false);
  update(e, 10);
  update(reference, 10);
  pixels(reference, 10);
  actual.isEmitting = true;
  update(e, 100);
  expected.emitParticles(2);
  update(reference, 20);
  pixels(reference, 20);
  expected.emitParticles(3);
  update(reference, 80);
  samePixels(pixels(e, 170), pixels(reference, 80));
});

it.each([ex.ParticleTransform.Global, ex.ParticleTransform.Local])(
  'CPU particles in %s space age and move only after their birth',
  async (transform) => {
    const e = await game();
    const emitter = make(
      ex.ParticleEmitter,
      {
        duration: 200,
        bursts: [
          { time: 0, count: 1 },
          { time: 30, count: 1 },
          { time: 90, count: 1 }
        ]
      },
      { width: 0, height: 0, particle: { life: 200, minSpeed: 100, maxSpeed: 100, minAngle: 0.5, maxAngle: 0.5, transform, fade: true } }
    );
    e.add(emitter);
    update(e, 100);
    const ps = particles(e);
    expect(ps).toHaveLength(3);
    expect(ps.map((p) => p.life).sort((a, b) => a - b)).toEqual([100, 130, 190]);
    for (const p of ps) {
      const age = 200 - p.life,
        origin = transform === ex.ParticleTransform.Global ? 110 : 0;
      const expectedEngine = await game();
      const expectedEmitter = make(ex.ParticleEmitter, undefined, {
        width: 0,
        height: 0,
        particle: { life: 200, minSpeed: 100, maxSpeed: 100, minAngle: 0.5, maxAngle: 0.5, transform, fade: true }
      });
      expectedEngine.add(expectedEmitter);
      expectedEmitter.emitParticles(1);
      update(expectedEngine, age);
      expect(p.transform.pos.x).toBeCloseTo(particles(expectedEngine)[0].transform.pos.x, 5);
      expect(p.graphics.opacity).toBeCloseTo(p.life / 200, 5);
    }
    emitter.isEmitting = false;
    update(e, 20);
    expect(ps.map((p) => p.life).sort((a, b) => a - b)).toEqual([80, 110, 170]);
  }
);

it.each([ex.ParticleTransform.Global, ex.ParticleTransform.Local])(
  'GPU particles in %s space preserve birth age across frames',
  async (transform) => {
    const e = await game(),
      reference = await game();
    const options = {
      width: 80,
      height: 80,
      particle: {
        life: 300,
        transform,
        size: 7,
        minSpeed: 35,
        maxSpeed: 35,
        minAngle: 0.6,
        maxAngle: 0.6,
        beginColor: ex.Color.Red,
        endColor: ex.Color.Blue,
        fade: true
      }
    };
    const actual = make(
      ex.GpuParticleEmitter,
      {
        duration: 200,
        bursts: [
          { time: 20, count: 3 },
          { time: 70, count: 4 }
        ]
      },
      options
    );
    const expected = make(ex.GpuParticleEmitter, undefined, options);
    e.add(actual);
    reference.add(expected);
    update(reference, 0);
    pixels(reference, 0);
    update(e, 100);
    update(reference, 20);
    pixels(reference, 20);
    expected.emitParticles(3);
    update(reference, 50);
    pixels(reference, 50);
    expected.emitParticles(4);
    update(reference, 30);
    samePixels(pixels(e, 100), pixels(reference, 30));
    actual.isEmitting = false;
    update(e, 35);
    update(reference, 35);
    samePixels(pixels(e, 35), pixels(reference, 35));
  }
);

it.each(constructors)(
  '%s combines scheduled, continuous and manual emissions without changing unscheduled behavior',
  async (_label, Ctor) => {
    await verifyContinuousCadence(Ctor);
    const e = await game(),
      reference = await game();
    const options = {
      emitRate: 25,
      particle: { life: 1000, size: 5, minSize: 5, maxSize: 5, minSpeed: 0, maxSpeed: 0,
        beginColor: ex.Color.Red, endColor: ex.Color.Red, fade: false }
    };
    const actual = make(Ctor, { duration: 500, bursts: [{ time: 0, count: 3 }] }, options);
    const expected = make(Ctor, undefined, options);
    e.add(actual);
    reference.add(expected);
    update(reference, 0);
    pixels(reference, 0);
    actual.emitParticles(2);
    expected.emitParticles(2);
    expected.emitParticles(3);
    update(e, 100);
    update(reference, 100);
    if (Ctor === ex.ParticleEmitter) expect(particles(e)).toHaveLength(7);
    samePixels(pixels(e, 100), pixels(reference, 100));
    update(e, 100);
    update(reference, 100);
    if (Ctor === ex.ParticleEmitter) expect(particles(e)).toHaveLength(10);
    samePixels(pixels(e, 100), pixels(reference, 100));
    actual.isEmitting = expected.isEmitting = false;
    actual.clearParticles();
    expected.clearParticles();
    update(reference, 0);
    pixels(reference, 0);
    actual.emitParticles(3);
    expected.emitParticles(3);
    for (const elapsed of [10, 20]) {
      update(e, elapsed);
      update(reference, elapsed);
      if (Ctor === ex.ParticleEmitter) expect(particles(e)).toHaveLength(3);
      samePixels(pixels(e, elapsed), pixels(reference, elapsed));
    }
  }
);

it.each(constructors)('%s replaces a valid schedule through the instance after emission has started', async (_label, Ctor) => {
  const e = await game(),
    ref = await game();
  const a = make(Ctor, {
      duration: 40,
      bursts: [
        { time: 0, count: 2 },
        { time: 30, count: 7 }
      ]
    }),
    b = make(Ctor);
  e.add(a);
  ref.add(b);
  update(ref, 0);
  pixels(ref, 0);
  update(e, 5);
  b.emitParticles(2);
  update(ref, 5);
  pixels(ref, 5);
  a.emissionSchedule = { duration: 40, bursts: [{ time: 12, count: 3 }] };
  expect(a.restartEmission).toBeTypeOf('function');
  a.restartEmission();
  update(e, 20);
  update(ref, 12);
  pixels(ref, 12);
  b.emitParticles(3);
  update(ref, 8);
  samePixels(pixels(e, 25), pixels(ref, 8));
});

it('GPU wrapped bursts retain the youngest particles at their actual ages', async () => {
  const e = await game();
  const options = {
    particle: { life: 300, size: 7, minSpeed: 0, maxSpeed: 0, beginColor: ex.Color.Red, endColor: ex.Color.Blue, fade: true }
  };
  const a = make(
    ex.GpuParticleEmitter,
    {
      duration: 40,
      loop: true,
      bursts: [
        { time: 0, count: 3 },
        { time: 10, count: 2 }
      ]
    },
    { ...options, maxParticles: 4 }
  );
  e.add(a);
  for (const [step, discard, earlier, age, newest] of [
    [200, 24, 1, 30, 3],
    [10, 26, 2, 10, 2],
    [30, 29, 1, 30, 3]
  ]) {
    update(e, step);
    const ref = await game(),
      b = make(ex.GpuParticleEmitter, undefined, options);
    ref.add(b);
    update(ref, 0);
    pixels(ref, 0);
    b.emitParticles(discard);
    b.clearParticles();
    update(ref, 0);
    pixels(ref, 0);
    b.emitParticles(earlier);
    update(ref, age);
    pixels(ref, age);
    b.emitParticles(newest);
    update(ref, 0);
    samePixels(pixels(e, step), pixels(ref, 0));
  }
});

it('GPU activates its first schedule on a running emitter when bursts fill the particle buffer', async () => {
  const e = await game(),
    reference = await game();
  const actual = make(ex.GpuParticleEmitter, undefined, { maxParticles: 4 }),
    expected = make(ex.GpuParticleEmitter);
  e.add(actual);
  reference.add(expected);
  for (const elapsed of [0, 40]) {
    update(e, elapsed);
    update(reference, elapsed);
    pixels(e, elapsed);
    pixels(reference, elapsed);
  }
  actual.emissionSchedule = {
    duration: 120,
    bursts: [
      { time: 20, count: 3 },
      { time: 60, count: 1 }
    ]
  };
  actual.restartEmission();
  update(e, 100);
  update(reference, 20);
  pixels(reference, 20);
  expected.emitParticles(3);
  update(reference, 40);
  pixels(reference, 40);
  expected.emitParticles(1);
  update(reference, 40);
  samePixels(pixels(e, 100), pixels(reference, 40));
  update(e, 35);
  update(reference, 35);
  samePixels(pixels(e, 35), pixels(reference, 35));
});

it.each(constructors.flatMap(([label, Ctor]) =>
  [ex.ParticleTransform.Global, ex.ParticleTransform.Local].map(transform => [label, transform, Ctor] as const)
))('%s scheduled particles in %s space stay at their last fixed update between rendered frames', async (_label, transform, Ctor) => {
  const e = TestUtils.engine({
    width: 220,
    height: 220,
    backgroundColor: ex.Color.Transparent,
    fixedUpdateTimestep: 100
  });
  engines.push(e);
  await TestUtils.runToReady(e);
  const actual = make(Ctor, { duration: 1000, bursts: [{ time: 0, count: 5 }] }, {
    particle: {
      transform,
      life: 1000,
      size: 7,
      minSpeed: 35,
      maxSpeed: 35,
      minAngle: 0.6,
      maxAngle: 0.6,
      beginColor: ex.Color.Red,
      endColor: ex.Color.Blue,
      fade: true
    }
  });
  e.add(actual);
  let updates = 0;
  e.on('postupdate', () => updates++);
  const clock = e.clock as ex.TestClock;
  clock.step(100);
  expect(updates).toBe(1);
  const before = snapshot(e);
  const states = particles(e).map(p => ({ life: p.life, x: p.transform.pos.x, y: p.transform.pos.y }));
  clock.step(25);
  expect(updates).toBe(1);
  samePixels(snapshot(e), before);
  if (Ctor === ex.ParticleEmitter) {
    expect(states).toHaveLength(5);
    expect(particles(e).map(p => ({ life: p.life, x: p.transform.pos.x, y: p.transform.pos.y }))).toEqual(states);
  }
  clock.step(75);
  expect(updates).toBe(2);
  expect(Array.from(snapshot(e))).not.toEqual(Array.from(before));
});

it.each(constructors)('%s lets paused particles expire without advancing the schedule', async (_label, Ctor) => {
  const e = await game(),
    reference = await game();
  const options = {
    particle: { life: 50, size: 7, minSpeed: 0, maxSpeed: 0, beginColor: ex.Color.Red, endColor: ex.Color.Red, fade: false }
  };
  const actual = make(Ctor, {
    duration: 200,
    loop: true,
    bursts: [{ time: 0, count: 3 }, { time: 80, count: 2 }]
  }, options);
  const expected = make(Ctor, undefined, options);
  e.add(actual);
  reference.add(expected);
  update(reference, 0);
  pixels(reference, 0);
  expected.emitParticles(3);
  update(reference, 10);
  update(e, 10);
  samePixels(pixels(e, 10), pixels(reference, 10));

  actual.isEmitting = false;
  update(e, 70);
  update(reference, 70);
  pixels(e, 70);
  pixels(reference, 70);
  // Allow the existing deferred particle-removal queue to drain without advancing time.
  update(e, 0);
  update(reference, 0);
  const expired = pixels(e, 0);
  expect(expired.some((value, index) => index % 4 === 3 && value > 0)).toBe(false);
  if (Ctor === ex.ParticleEmitter) expect(particles(e)).toHaveLength(0);

  actual.isEmitting = true;
  update(e, 69);
  update(reference, 69);
  pixels(reference, 69);
  const beforeNextBurst = pixels(e, 69);
  expect(beforeNextBurst.some((value, index) => index % 4 === 3 && value > 0)).toBe(false);
  update(e, 1);
  update(reference, 1);
  pixels(reference, 1);
  expected.emitParticles(2);
  update(reference, 0);
  samePixels(pixels(e, 1), pixels(reference, 0));
  if (Ctor === ex.ParticleEmitter) expect(particles(e)).toHaveLength(2);
});


it('GPU late schedule assignment preserves live particles on a draw-only fixed frame', async () => {
  const e = TestUtils.engine({ width: 220, height: 220, backgroundColor: ex.Color.Transparent, fixedUpdateTimestep: 100 });
  engines.push(e);
  await TestUtils.runToReady(e);
  const actual = make(ex.GpuParticleEmitter, undefined, {
    particle: { life: 2000, size: 7, minSpeed: 65, maxSpeed: 65, minAngle: 0.6, maxAngle: 0.6,
      beginColor: ex.Color.Red, endColor: ex.Color.Blue, fade: true }
  });
  e.add(actual);
  let updates = 0;
  e.on('postupdate', () => updates++);
  const clock = e.clock as ex.TestClock;
  clock.step(100);
  actual.emitParticles(5);
  clock.step(100);
  expect(updates).toBe(2);
  clock.step(50);
  expect(updates).toBe(2);
  const before = snapshot(e);
  actual.emissionSchedule = { duration: 1000, bursts: [{ time: 500, count: 1 }] };
  clock.step(25);
  expect(updates).toBe(2);
  samePixels(snapshot(e), before);
});

it('GPU schedule keeps emission disabled by default until explicitly enabled', async () => {
  const e = await game();
  const actual = new ex.GpuParticleEmitter({
    x: 110, y: 110, width: 80, height: 80, emitRate: 0, random: new ex.Random(374),
    particle: { life: 1000, size: 7, minSpeed: 0, maxSpeed: 0, beginColor: ex.Color.Red, endColor: ex.Color.Red, fade: false },
    emissionSchedule: { duration: 500, bursts: [{ time: 0, count: 3 }] }
  } as any);
  expect(actual.isEmitting).toBe(false);
  e.add(actual);
  update(e, 100);
  const paused = pixels(e, 100);
  expect(paused.some((value, index) => index % 4 === 3 && value > 0)).toBe(false);
  actual.isEmitting = true;
  update(e, 1);
  const emitting = pixels(e, 1);
  expect(emitting.filter((value, index) => index % 4 === 3 && value > 0).length).toBeGreaterThan(10);
});
