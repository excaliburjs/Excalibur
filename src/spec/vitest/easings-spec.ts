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

  it('can interpolate EaseInOutQuart', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInOutQuart(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInOutQuart(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInOutQuart(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInOutQuart(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.6875);
    expect(threeQuarterTime).toBe(10.3125);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInQuint', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInQuint(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInQuint(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInQuint(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInQuint(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.990234375);
    expect(threeQuarterTime).toBe(17.626953125);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutQuint', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeOutQuint(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeOutQuint(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeOutQuint(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeOutQuint(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(12.373046875);
    expect(threeQuarterTime).toBe(10.009765625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutQuint', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInOutQuint(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInOutQuint(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInOutQuint(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInOutQuint(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.84375);
    expect(threeQuarterTime).toBe(10.15625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInExpo', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInExpo(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInExpo(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInExpo(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInExpo(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.9447572827198);
    expect(threeQuarterTime).toBe(18.23223304703363);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutExpo', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeOutExpo(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeOutExpo(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeOutExpo(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeOutExpo(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(11.767766952966369);
    expect(threeQuarterTime).toBe(10.0552427172802);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutExpo', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInOutExpo(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInOutExpo(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInOutExpo(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInOutExpo(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.84375);
    expect(threeQuarterTime).toBe(10.15625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInCirc', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInCirc(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInCirc(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInCirc(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInCirc(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.682458365518542);
    expect(threeQuarterTime).toBe(16.614378277661476);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutCirc', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeOutCirc(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeOutCirc(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeOutCirc(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeOutCirc(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(13.385621722338524);
    expect(threeQuarterTime).toBe(10.317541634481458);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutCirc', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInOutCirc(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInOutCirc(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInOutCirc(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInOutCirc(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.33012701892219);
    expect(threeQuarterTime).toBe(10.669872981077807);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInBack', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInBack(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInBack(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInBack(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInBack(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(20.641365625000002);
    expect(threeQuarterTime).toBe(18.174096875);
    expect(finalTime).toBe(10.000000000000004);
  });

  it('can interpolate EaseOutBack', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeOutBack(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeOutBack(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeOutBack(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeOutBack(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(11.825903124999998);
    expect(threeQuarterTime).toBe(9.358634374999998);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutBack', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInOutBack(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInOutBack(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInOutBack(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInOutBack(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(20.9968184375);
    expect(threeQuarterTime).toBe(9.0031815625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInElastic', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInElastic(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInElastic(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInElastic(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInElastic(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(20.0552427172802);
    expect(threeQuarterTime).toBe(19.11611652351682);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutElastic', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeOutElastic(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeOutElastic(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeOutElastic(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeOutElastic(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(9.84375);
    expect(threeQuarterTime).toBe(10.00030517578125);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutElastic', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInOutElastic(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInOutElastic(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInOutElastic(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInOutElastic(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(20.14077638560975);
    expect(threeQuarterTime).toBe(9.859223614390245);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInBounce', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInBounce(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInBounce(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInBounce(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInBounce(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(19.7265625);
    expect(threeQuarterTime).toBe(14.7265625);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseOutBounce', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeOutBounce(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeOutBounce(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeOutBounce(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeOutBounce(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(15.2734375);
    expect(threeQuarterTime).toBe(10.2734375);
    expect(finalTime).toBe(10);
  });

  it('can interpolate EaseInOutBounce', () => {
    const zeroTime = ex.lerp(20, 10, ex.easeInOutBounce(0 / 100));
    const quarterTime = ex.lerp(20, 10, ex.easeInOutBounce(25 / 100));
    const threeQuarterTime = ex.lerp(20, 10, ex.easeInOutBounce(75 / 100));
    const finalTime = ex.lerp(20, 10, ex.easeInOutBounce(100 / 100));

    expect(zeroTime).toBe(20);
    expect(quarterTime).toBe(18.828125);
    expect(threeQuarterTime).toBe(11.171875);
    expect(finalTime).toBe(10);
  });
});
