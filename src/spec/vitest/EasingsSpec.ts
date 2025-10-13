import * as ex from '@excalibur';

describe('An Easing Function', () => {
  it('can interpolate linearly', () => {
    const zeroTime = ex.lerp(10, 20, ex.linear(0 / 100));
    const quarterTime = ex.lerp(10, 20, ex.linear(25 / 100));
    const threeQuarterTime = ex.lerp(10, 20, ex.linear(75 / 100));
    const finalTime = ex.lerp(10, 20, ex.linear(100 / 100));

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(12.5);
    expect(threeQuarterTime).toBe(17.5);
    expect(finalTime).toBe(20);
  });

  it('can be linearly reversible', () => {
    const zeroTime = ex.lerp(20, 10, ex.linear(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.linear(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.linear(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.linear(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(17.5);
    expect(threeQuarterTime).toBe(12.5);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInQuad', () => {
    const zeroTime = ex.lerp(10, 20, ex.easeInQuad(0 / 100));
    const quarterTime = ex.lerp(10, 20, ex.easeInQuad(25 / 100));
    const threeQuarterTime = ex.lerp(10, 20, ex.easeInQuad(75 / 100));
    const finalTime = ex.lerp(10, 20, ex.easeInQuad(100 / 100));

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(10.625);
    expect(threeQuarterTime).toBe(15.625);
    expect(finalTime).toBe(20);
  });

  it('can be EaseInQuad reversible', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInQuad(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInQuad(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInQuad(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInQuad(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.375);
    expect(threeQuarterTime).toBe(14.375);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutQuad', () => {
    const zeroTime = ex.lerp(10, 20, ex.easeOutQuad(0 / 100));
    const quarterTime = ex.lerp(10, 20, ex.easeOutQuad(25 / 100));
    const threeQuarterTime = ex.lerp(10, 20, ex.easeOutQuad(75 / 100));
    const finalTime = ex.lerp(10, 20, ex.easeOutQuad(100 / 100));

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(14.375);
    expect(threeQuarterTime).toBe(19.375);
    expect(finalTime).toBe(20);
  });

  it('can be EaseOutQuad reversible', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeOutQuad(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeOutQuad(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeOutQuad(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeOutQuad(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(15.625);
    expect(threeQuarterTime).toBe(10.625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutQuad', () => {
    const zeroTime = ex.lerp(10, 20, ex.easeInOutQuad(0 / 100));
    const quarterTime = ex.lerp(10, 20, ex.easeInOutQuad(25 / 100));
    const threeQuarterTime = ex.lerp(10, 20, ex.easeInOutQuad(75 / 100));
    const finalTime = ex.lerp(10, 20, ex.easeInOutQuad(100 / 100));

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(11.25);
    expect(threeQuarterTime).toBe(18.75);
    expect(finalTime).toBe(20);
  });

  it('can be EaseInOutQuad reversible', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInOutQuad(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInOutQuad(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInOutQuad(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInOutQuad(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(18.75);
    expect(threeQuarterTime).toBe(11.25);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInCubic', () => {
    const zeroTime = ex.lerp(10, 20, ex.easeInCubic(0 / 100));
    const quarterTime = ex.lerp(10, 20, ex.easeInCubic(25 / 100));
    const threeQuarterTime = ex.lerp(10, 20, ex.easeInCubic(75 / 100));
    const finalTime = ex.lerp(10, 20, ex.easeInCubic(100 / 100));

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(10.15625);
    expect(threeQuarterTime).toBe(14.21875);
    expect(finalTime).toBe(20);
  });

  it('can be EaseInCubic reversible', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInCubic(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInCubic(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInCubic(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInCubic(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.84375);
    expect(threeQuarterTime).toBe(15.78125);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutCubic', () => {
    const zeroTime = ex.lerp(10, 20, ex.easeOutCubic(0 / 100));
    const quarterTime = ex.lerp(10, 20, ex.easeOutCubic(25 / 100));
    const threeQuarterTime = ex.lerp(10, 20, ex.easeOutCubic(75 / 100));
    const finalTime = ex.lerp(10, 20, ex.easeOutCubic(100 / 100));

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(15.78125);
    expect(threeQuarterTime).toBe(19.84375);
    expect(finalTime).toBe(20);
  });

  it('can be EaseOutCubic reversible', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeOutCubic(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeOutCubic(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeOutCubic(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeOutCubic(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(14.21875);
    expect(threeQuarterTime).toBe(10.15625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutCubic', () => {
    const zeroTime = ex.lerp(10, 20, ex.easeInOutCubic(0 / 100));
    const quarterTime = ex.lerp(10, 20, ex.easeInOutCubic(25 / 100));
    const threeQuarterTime = ex.lerp(10, 20, ex.easeInOutCubic(75 / 100));
    const finalTime = ex.lerp(10, 20, ex.easeInOutCubic(100 / 100));

    expect(zeroTime).toBe(10);
    expect(quarterTime).toBe(10.625);
    expect(threeQuarterTime).toBe(19.375);
    expect(finalTime).toBe(20);
  });

  it('can be EaseInOutCubic reversible', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInOutCubic(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInOutCubic(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInOutCubic(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInOutCubic(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.375);
    expect(threeQuarterTime).toBe(10.625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInQuart', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInQuart(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInQuart(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInQuart(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInQuart(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.9609375);
    expect(threeQuarterTime).toBe(16.8359375);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutQuart', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeOutQuart(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeOutQuart(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeOutQuart(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeOutQuart(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(13.1640625);
    expect(threeQuarterTime).toBe(10.0390625);
    expect(finalTime).toBe(10);
  });
});
