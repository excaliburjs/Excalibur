import * as ex from '@excalibur';

type Policies = {
  wordWrap?: 'normal' | 'break-word';
};
type PolicyText = ex.Text & Policies;
type FontKind = 'font' | 'sprite';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ';
let sheet: ex.SpriteSheet;
let canvas: HTMLCanvasElement;
let context: ex.ExcaliburGraphicsContext2DCanvas;

beforeAll(async () => {
  const face = new FontFace('LayoutFixture', 'url(/src/spec/assets/images/graphics-text-spec/fonts/normal-400.woff2)');
  document.fonts.add(await face.load());
  const image = new ex.ImageSource('/src/spec/assets/images/graphics-text-spec/spritefont.png');
  await image.load();
  sheet = ex.SpriteSheet.fromImageSource({ image, grid: { rows: 3, columns: 16, spriteWidth: 16, spriteHeight: 16 } });
});

beforeEach(() => {
  ex.FontCache.clearCache();
  canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 320;
  context = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement: canvas });
});

afterEach(() => {
  ex.FontCache.clearCache();
  canvas.remove();
});

function font(kind: FontKind): ex.Font | ex.SpriteFont {
  return kind === 'font'
    ? new ex.Font({ family: 'LayoutFixture', size: 16, padding: 0, quality: 1, color: ex.Color.Black })
    : new ex.SpriteFont({ alphabet, spriteSheet: sheet, spacing: -5 });
}

function variableWidthFont(kind: FontKind): ex.Font | ex.SpriteFont {
  const face = font(kind);
  if (face instanceof ex.SpriteFont) {
    const sprites = face.spriteSheet.sprites.map((sprite) => sprite.clone());
    sprites[alphabet.indexOf('w')].scale = ex.vec(2, 1);
    sprites[alphabet.indexOf('i')].scale = ex.vec(0.5, 1);
    face.spriteSheet = new ex.SpriteSheet({ sprites });
  }
  return face;
}

function maximalCharacterRuns(value: string, face: ex.Font | ex.SpriteFont, maxWidth: number): string[] {
  const result: string[] = [];
  let remaining = value;
  while (remaining.length) {
    let run = '';
    for (const character of remaining) {
      if (face.measureText(run + character).width <= maxWidth) {
        run += character;
      } else {
        break;
      }
    }
    if (!run) {
      run = remaining[0];
    }
    result.push(run);
    remaining = remaining.slice(run.length);
  }
  return result;
}

function text(value: string, face: ex.Font | ex.SpriteFont, policies: Policies, maxWidth?: number): PolicyText {
  const options: ex.TextOptions = {
    text: value,
    font: face,
    maxWidth,
    wordWrap: policies.wordWrap
  };
  const result = new ex.Text(options) as PolicyText;
  expect(result.wordWrap, 'constructor exposes requested wrapping policy').toBe(policies.wordWrap);
  return result;
}

function pixels(graphic: ex.Text): Uint8ClampedArray {
  context.clear();
  graphic.draw(context, 24, 48);
  context.flush();
  return canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
}

function equalPixels(actual: Uint8ClampedArray, expected: Uint8ClampedArray) {
  let hasInk = false;
  for (let i = 4; i < expected.length; i++) {
    if (expected[i] !== expected[i % 4]) {
      hasInk = true;
    }
  }
  expect(hasInk, 'explicit-line control must draw visible text').toBe(true);
  let differences = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      differences++;
    }
  }
  expect(differences, 'rendered pixels differ from explicit-line control').toBe(0);
}

function assertLayout(graphic: PolicyText, lines: string[], softBreaks: number[] = []) {
  // Existing explicit-newline rendering is the independent control. At a soft
  // boundary, accept consuming the space or keeping it on either adjacent line.
  let alternatives = [lines];
  for (const index of softBreaks) {
    alternatives = alternatives.flatMap((candidate) => [
      candidate,
      candidate.map((line, i) => (i === index ? line + ' ' : line)),
      candidate.map((line, i) => (i === index + 1 ? ' ' + line : line))
    ]);
  }
  const controls = alternatives.map((candidate) => {
    const control = new ex.Text({ text: candidate.join('\n'), font: graphic.font });
    return { data: pixels(control), bounds: control.localBounds };
  });
  const original = graphic.text;
  const actualPixels = pixels(graphic);
  const actualBounds = graphic.localBounds;
  const match = controls.find(
    (control) =>
      actualPixels.every((value, i) => value === control.data[i]) &&
      Math.abs(actualBounds.width - control.bounds.width) < 0.000005 &&
      Math.abs(actualBounds.height - control.bounds.height) < 0.000005
  );
  expect(match, 'drawing must match an explicit-line control with valid separator placement').toBeDefined();
  if (match) {
    equalPixels(actualPixels, match.data);
    expect(graphic.localBounds.width).toBeCloseTo(match.bounds.width, 5);
    expect(graphic.localBounds.height).toBeCloseTo(match.bounds.height, 5);
  }
  expect(graphic.text).toBe(original);
}

describe('Font quality cache identity', () => {
  it('refreshes measured and rendered Text when only Font quality changes', () => {
    const first = new ex.Font({ family: 'LayoutFixture', size: 16, padding: 2, quality: 1, color: ex.Color.Black });
    const assigned = new ex.Font({ family: 'LayoutFixture', size: 16, padding: 2, quality: 2, color: ex.Color.Black });
    const graphic = text('ab ab', first, { wordWrap: 'normal' }, 120);

    pixels(graphic);
    graphic.font = assigned;
    const updatedPixels = pixels(graphic);
    const updatedBounds = graphic.localBounds;

    ex.FontCache.clearCache();
    const control = text('ab ab', assigned, { wordWrap: 'normal' }, 120);
    const controlPixels = pixels(control);

    expect(updatedPixels).toEqual(controlPixels);
    expect(updatedBounds.width).toBeCloseTo(control.localBounds.width, 5);
    expect(updatedBounds.height).toBeCloseTo(control.localBounds.height, 5);
  });
});

for (const kind of ['font', 'sprite'] as const) {
  describe(`${kind} optional word wrapping`, () => {
    it('packs exact-fit whole words and leaves an overwide word intact', () => {
      const f = font(kind);
      const width = f.measureText('ab ab').width;
      assertLayout(text('ab ab ab', f, { wordWrap: 'normal' }, width), ['ab ab', 'ab'], [0]);
      assertLayout(text('ab ab ab', f, { wordWrap: 'normal' }, width - 0.1), ['ab', 'ab', 'ab'], [0, 1]);
      assertLayout(text('a aaaaaaaaaa a', f, { wordWrap: 'normal' }, f.measureText('aaaa').width), ['a', 'aaaaaaaaaa', 'a'], [0, 1]);

      const varied = variableWidthFont(kind);
      const variedWidth = varied.measureText('iw iw').width;
      assertLayout(text('iw iw iw', varied, { wordWrap: 'normal' }, variedWidth), ['iw iw', 'iw'], [0]);
      assertLayout(text('iwiwiw', varied, { wordWrap: 'normal' }, varied.measureText('iw').width), ['iwiwiw']);
    });

    it('splits overwide words into maximal fitting character runs', () => {
      const f = font(kind);
      assertLayout(text('aaaaaaaaaa', f, { wordWrap: 'break-word' }, f.measureText('aaaa').width), ['aaaa', 'aaaa', 'aa']);
      assertLayout(text('ab ab ab', f, { wordWrap: 'break-word' }, f.measureText('ab ab').width), ['ab ab', 'ab'], [0]);
      expect(f.measureText('a').width).toBeGreaterThan(1);
      assertLayout(text('a', f, { wordWrap: 'break-word' }, 1), ['a']);

      const varied = variableWidthFont(kind);
      const width = varied.measureText('iwii').width;
      const runs = maximalCharacterRuns('iwiwiw', varied, width);
      expect(
        runs.some((run) => run.length !== runs[0].length),
        'variable glyph widths should change the longest fitting run'
      ).toBe(true);
      assertLayout(text('iwiwiw', varied, { wordWrap: 'break-word' }, width), runs);
    });

    it('preserves internal spaces and later explicit lines without new whitespace modes', () => {
      const f = font(kind);
      for (const wordWrap of ['normal', 'break-word'] as const) {
        const source = 'ab  cd\nef';
        const unconstrained = text(source, f, { wordWrap });
        assertLayout(unconstrained, ['ab  cd', 'ef']);
        assertLayout(text(source, f, { wordWrap }, f.measureText('ab  cd').width), ['ab  cd', 'ef']);
        assertLayout(text('ab ab ab\ncd cd', f, { wordWrap }, f.measureText('ab ab').width), ['ab ab', 'ab', 'cd cd'], [0]);

        const longWord = 'iwiw'.repeat(10);
        assertLayout(text(`${longWord} ab  cd\n${longWord}`, f, { wordWrap }), [`${longWord} ab  cd`, longWord]);
        const boundaries = text('  ab  cd\n\n  ef  ', f, { wordWrap }, f.measureText('  ab').width);
        assertLayout(boundaries, ['  ab', 'cd', '', '  ef  '], [0]);
      }
    });

    it('updates drawing and bounds after policy, width, text, and font assignment', () => {
      const f = font(kind);
      const t = text('aaaaaaaa', f, { wordWrap: 'normal' }, f.measureText('aaaa').width);
      assertLayout(t, ['aaaaaaaa']);
      t.wordWrap = 'break-word';
      assertLayout(t, ['aaaa', 'aaaa']);
      t.maxWidth = f.measureText('aa').width;
      assertLayout(t, ['aa', 'aa', 'aa', 'aa']);
      t.text = 'aaaa';
      assertLayout(t, ['aa', 'aa']);
      t.maxWidth = f.measureText('aaaa').width;
      assertLayout(t, ['aaaa']);
      const larger = font(kind);
      if (larger instanceof ex.Font) {
        larger.size = 32;
      } else {
        larger.spacing = 5;
      }
      t.font = larger;
      assertLayout(t, ['aa', 'aa']);

      const changes = [
        { name: 'text', update: (graphic: PolicyText) => (graphic.text = 'aaaa') },
        { name: 'maxWidth', update: (graphic: PolicyText) => (graphic.maxWidth = f.measureText('aa').width) },
        { name: 'wordWrap', update: (graphic: PolicyText) => (graphic.wordWrap = 'break-word') },
        {
          name: 'font',
          update: (graphic: PolicyText) => {
            const replacement = font(kind);
            if (replacement instanceof ex.Font) {
              replacement.size = 32;
            } else {
              replacement.spacing = 5;
            }
            graphic.font = replacement;
          }
        }
      ];
      for (const change of changes) {
        const source = change.name === 'wordWrap' ? 'aa aaaaaaaa aa' : 'aa aa aa aa';
        const width = f.measureText(change.name === 'wordWrap' ? 'aaaa' : 'aa aa').width;
        const warm = text(source, f, { wordWrap: 'normal' }, width);
        const beforePixels = pixels(warm);
        const beforeBounds = warm.localBounds;
        change.update(warm);
        const updatedSize = [warm.width, warm.height];
        const updatedBounds = warm.localBounds;
        const updatedPixels = pixels(warm);
        expect(updatedBounds, `${change.name} mutation should change bounds`).not.toEqual(beforeBounds);
        expect(updatedPixels, `${change.name} mutation should change drawing`).not.toEqual(beforePixels);

        ex.FontCache.clearCache();
        const control = text(warm.text, warm.font, { wordWrap: warm.wordWrap }, warm.maxWidth);
        expect(updatedSize[0]).toBeCloseTo(control.width, 5);
        expect(updatedSize[1]).toBeCloseTo(control.height, 5);
        expect(updatedBounds.width).toBeCloseTo(control.localBounds.width, 5);
        expect(updatedBounds.height).toBeCloseTo(control.localBounds.height, 5);
        equalPixels(updatedPixels, pixels(control));
      }
    });

    it('keeps the legacy path when omitted or reset to undefined', () => {
      const f = font(kind);
      const source = 'ab  cd';
      const width = f.measureText('ab ').width;
      const control = new ex.Text({ text: source, font: f, maxWidth: width });
      const expectedPixels = pixels(control);
      const expectedBounds = control.localBounds;
      const omitted = text(source, f, {}, width);
      equalPixels(pixels(omitted), expectedPixels);
      expect(omitted.localBounds).toEqual(expectedBounds);
      const changed = text(source, f, { wordWrap: 'normal' }, width);
      pixels(changed);
      changed.wordWrap = undefined;
      equalPixels(pixels(changed), expectedPixels);
      expect(changed.localBounds).toEqual(expectedBounds);

      if (f instanceof ex.Font) {
        const legacySource = 'ab cd ab cd';
        const wide = f.measureText('ab cd').width;
        const narrow = f.measureText('ab').width;
        const resizing = new ex.Text({ text: legacySource, font: f, maxWidth: wide });
        const widePixels = pixels(resizing);
        const wideBounds = resizing.localBounds;
        const wideSize = [resizing.width, resizing.height];
        expect(resizing.wordWrap).toBeUndefined();

        resizing.maxWidth = narrow;
        const narrowSize = [resizing.width, resizing.height];
        const narrowBounds = resizing.localBounds;
        const narrowPixels = pixels(resizing);
        expect(narrowBounds.height).toBeGreaterThan(wideBounds.height);
        expect(narrowSize[1]).toBeGreaterThan(wideSize[1]);
        expect(narrowPixels).not.toEqual(widePixels);

        ex.FontCache.clearCache();
        const control = new ex.Text({ text: legacySource, font: f, maxWidth: narrow });
        const controlPixels = pixels(control);
        expect(narrowSize[0]).toBeCloseTo(control.width, 5);
        expect(narrowSize[1]).toBeCloseTo(control.height, 5);
        expect(narrowBounds.width).toBeCloseTo(control.localBounds.width, 5);
        expect(narrowBounds.height).toBeCloseTo(control.localBounds.height, 5);
        equalPixels(narrowPixels, controlPixels);
      }
    });
  });
}
