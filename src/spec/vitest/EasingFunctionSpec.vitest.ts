import * as ex from '@excalibur';

describe('An Easing Function', () => {
  it('can interpolate linearly', () => {
    const zeroTime = ex.EasingFunctions.Linear(0, 10, 20, 100);
    const quarterTime = ex.EasingFunctions.Linear(25, 10, 20, 100);
    const threeQuarterTime = ex.EasingFunctions.Linear(75, 10, 20, 100);
    const finalTime = ex.EasingFunctions.Linear(100, 10, 20, 100);

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(12.5);
    expect(threeQuarterTime).toBe(17.5);
    expect(finalTime).toBe(20);
  });

  it('can be linearly reversible', () => {
    const zeroTime = ex.EasingFunctions.Linear(0, 20, 10, 100);
    const quarterTime = ex.EasingFunctions.Linear(25, 20, 10, 100);
    const threeQuarterTime = ex.EasingFunctions.Linear(75, 20, 10, 100);
    const finalTime = ex.EasingFunctions.Linear(100, 20, 10, 100);

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(17.5);
    expect(threeQuarterTime).toBe(12.5);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInQuad', () => {
    const zeroTime = ex.EasingFunctions.EaseInQuad(0, 10, 20, 100);
    const quarterTime = ex.EasingFunctions.EaseInQuad(25, 10, 20, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseInQuad(75, 10, 20, 100);
    const finalTime = ex.EasingFunctions.EaseInQuad(100, 10, 20, 100);

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(10.625);
    expect(threeQuarterTime).toBe(15.625);
    expect(finalTime).toBe(20);
  });

  it('can be EaseInQuad reversible', () => {
    const zeroTime = ex.EasingFunctions.EaseInQuad(0, 20, 10, 100);
    const quarterTime = ex.EasingFunctions.EaseInQuad(25, 20, 10, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseInQuad(75, 20, 10, 100);
    const finalTime = ex.EasingFunctions.EaseInQuad(100, 20, 10, 100);

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.375);
    expect(threeQuarterTime).toBe(14.375);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutQuad', () => {
    const zeroTime = ex.EasingFunctions.EaseOutQuad(0, 10, 20, 100);
    const quarterTime = ex.EasingFunctions.EaseOutQuad(25, 10, 20, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseOutQuad(75, 10, 20, 100);
    const finalTime = ex.EasingFunctions.EaseOutQuad(100, 10, 20, 100);

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(14.375);
    expect(threeQuarterTime).toBe(19.375);
    expect(finalTime).toBe(20);
  });

  it('can be EaseOutQuad reversible', () => {
    const zeroTime = ex.EasingFunctions.EaseOutQuad(0, 20, 10, 100);
    const quarterTime = ex.EasingFunctions.EaseOutQuad(25, 20, 10, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseOutQuad(75, 20, 10, 100);
    const finalTime = ex.EasingFunctions.EaseOutQuad(100, 20, 10, 100);

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(15.625);
    expect(threeQuarterTime).toBe(10.625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutQuad', () => {
    const zeroTime = ex.EasingFunctions.EaseInOutQuad(0, 10, 20, 100);
    const quarterTime = ex.EasingFunctions.EaseInOutQuad(25, 10, 20, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseInOutQuad(75, 10, 20, 100);
    const finalTime = ex.EasingFunctions.EaseInOutQuad(100, 10, 20, 100);

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(11.25);
    expect(threeQuarterTime).toBe(18.75);
    expect(finalTime).toBe(20);
  });

  it('can be EaseInOutQuad reversible', () => {
    const zeroTime = ex.EasingFunctions.EaseInOutQuad(0, 20, 10, 100);
    const quarterTime = ex.EasingFunctions.EaseInOutQuad(25, 20, 10, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseInOutQuad(75, 20, 10, 100);
    const finalTime = ex.EasingFunctions.EaseInOutQuad(100, 20, 10, 100);

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(18.75);
    expect(threeQuarterTime).toBe(11.25);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInCubic', () => {
    const zeroTime = ex.EasingFunctions.EaseInCubic(0, 10, 20, 100);
    const quarterTime = ex.EasingFunctions.EaseInCubic(25, 10, 20, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseInCubic(75, 10, 20, 100);
    const finalTime = ex.EasingFunctions.EaseInCubic(100, 10, 20, 100);

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(10.15625);
    expect(threeQuarterTime).toBe(14.21875);
    expect(finalTime).toBe(20);
  });

  it('can be EaseInCubic reversible', () => {
    const zeroTime = ex.EasingFunctions.EaseInCubic(0, 20, 10, 100);
    const quarterTime = ex.EasingFunctions.EaseInCubic(25, 20, 10, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseInCubic(75, 20, 10, 100);
    const finalTime = ex.EasingFunctions.EaseInCubic(100, 20, 10, 100);

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.84375);
    expect(threeQuarterTime).toBe(15.78125);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutCubic', () => {
    const zeroTime = ex.EasingFunctions.EaseOutCubic(0, 10, 20, 100);
    const quarterTime = ex.EasingFunctions.EaseOutCubic(25, 10, 20, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseOutCubic(75, 10, 20, 100);
    const finalTime = ex.EasingFunctions.EaseOutCubic(100, 10, 20, 100);

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(15.78125);
    expect(threeQuarterTime).toBe(19.84375);
    expect(finalTime).toBe(20);
  });

  it('can be EaseOutCubic reversible', () => {
    const zeroTime = ex.EasingFunctions.EaseOutCubic(0, 20, 10, 100);
    const quarterTime = ex.EasingFunctions.EaseOutCubic(25, 20, 10, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseOutCubic(75, 20, 10, 100);
    const finalTime = ex.EasingFunctions.EaseOutCubic(100, 20, 10, 100);

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(14.21875);
    expect(threeQuarterTime).toBe(10.15625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutCubic', () => {
    const zeroTime = ex.EasingFunctions.EaseInOutCubic(0, 10, 20, 100);
    const quarterTime = ex.EasingFunctions.EaseInOutCubic(25, 10, 20, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseInOutCubic(75, 10, 20, 100);
    const finalTime = ex.EasingFunctions.EaseInOutCubic(100, 10, 20, 100);

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(10.625);
    expect(threeQuarterTime).toBe(19.375);
    expect(finalTime).toBe(20);
  });

  it('can be EaseInOutCubic reversible', () => {
    const zeroTime = ex.EasingFunctions.EaseInOutCubic(0, 20, 10, 100);
    const quarterTime = ex.EasingFunctions.EaseInOutCubic(25, 20, 10, 100);
    const threeQuarterTime = ex.EasingFunctions.EaseInOutCubic(75, 20, 10, 100);
    const finalTime = ex.EasingFunctions.EaseInOutCubic(100, 20, 10, 100);

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.375);
    expect(threeQuarterTime).toBe(10.625);
    expect(finalTime).toBe(10);
  });

  it('can be used with vectors', () => {
    const vectorEasing = ex.EasingFunctions.CreateVectorEasingFunction(ex.EasingFunctions.Linear);

    const zeroTime = vectorEasing(0, new ex.Vector(10, 10), new ex.Vector(20, 20), 100);
    const quarterTime = vectorEasing(25, new ex.Vector(10, 10), new ex.Vector(20, 20), 100);
    const threeQuarterTime = vectorEasing(75, new ex.Vector(10, 10), new ex.Vector(20, 20), 100);
    const finalTime = vectorEasing(100, new ex.Vector(10, 10), new ex.Vector(20, 20), 100);

    expect(zeroTime.x).toBe(10);
    expect(zeroTime.y).toBe(10);
    expect(quarterTime.x).toBe(12.5);
    expect(quarterTime.y).toBe(12.5);
    expect(threeQuarterTime.x).toBe(17.5);
    expect(threeQuarterTime.y).toBe(17.5);
    expect(finalTime.x).toBe(20);
    expect(finalTime.y).toBe(20);
  });
});
