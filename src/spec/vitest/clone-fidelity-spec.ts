import * as ex from '@excalibur';

describe('clone() fidelity', () => {
  it('Animation clone keeps frame order, reversed flag, and data', () => {
    const a = (c: ex.Color) => new ex.Rectangle({ width: 2, height: 2, color: c });
    const g = [a(ex.Color.Red), a(ex.Color.Green), a(ex.Color.Blue)];
    const anim = new ex.Animation({ frames: g.map((graphic) => ({ graphic })), reverse: true, data: { foo: 1 } });
    const before = anim.frames.map((f) => f.graphic);
    const clone = anim.clone();
    expect(clone.isReversed).toBe(true);
    expect(clone.frames.map((f) => f.graphic)).toEqual(before);
    expect(clone.data.get('foo')).toBe(1);
    expect(anim.frames.map((f) => f.graphic)).toEqual(before);
  });

  it('EdgeCollider clone keeps offset', () => {
    const e = new ex.EdgeCollider({ begin: ex.vec(0, 0), end: ex.vec(5, 0), offset: ex.vec(3, 4) });
    expect(e.clone().offset).toEqual(ex.vec(3, 4));
  });

  it('CompositeCollider clone keeps compositeStrategy', () => {
    const c = new ex.CompositeCollider([ex.Shape.Box(1, 1)]);
    c.compositeStrategy = 'separate';
    expect(c.clone().compositeStrategy).toBe('separate');
  });

  it('Font clone keeps styling', () => {
    const f = new ex.Font({ color: ex.Color.Red, strokeColor: ex.Color.Blue, quality: 4, lineHeight: 30, lineWidth: 2 });
    const c = f.clone();
    expect(c.color.toString()).toBe(ex.Color.Red.toString());
    expect(c.strokeColor?.toString()).toBe(ex.Color.Blue.toString());
    expect(c.quality).toBe(4);
    expect(c.lineHeight).toBe(30);
    expect(c.lineWidth).toBe(2);
  });

  it('Text clone does not force black', () => {
    expect(new ex.Text({ text: 'a' }).clone().color).toBeUndefined();
  });

  it('GraphicsGroup clone keeps useAnchor', () => {
    expect(new ex.GraphicsGroup({ members: [], useAnchor: false }).clone().useAnchor).toBe(false);
  });

  it('Entity clone keeps name and tags', () => {
    const e = new ex.Entity({ name: 'bob' });
    e.addTag('x');
    const c = e.clone();
    expect(c.name).toBe('bob');
    expect(c.hasTag('x')).toBe(true);
  });
});
