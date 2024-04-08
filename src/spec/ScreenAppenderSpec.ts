import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburAsyncMatchers } from 'excalibur-jasmine';

describe('A ScreenAppender', () => {
  beforeAll(() => {
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  it('exists', () => {
    expect(ex.ScreenAppender).toBeDefined();
  });

  it('can be constructed', () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
    const sut = new ex.ScreenAppender({ engine });
    expect(sut).toBeDefined();
    engine.dispose();
  });

  it('can be configured to log', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
    const sut = new ex.ScreenAppender({
      engine,
      color: ex.Color.Yellow,
      xPos: 0
    });

    sut.log(ex.LogLevel.Info, ['this is a log']);
    sut.log(ex.LogLevel.Info, ['this is a log']);
    sut.log(ex.LogLevel.Info, ['this is a log']);
    sut.log(ex.LogLevel.Info, ['this is a log']);
    sut.log(ex.LogLevel.Info, ['this is a log']);
    sut.log(ex.LogLevel.Info, ['this is a log']);

    await TestUtils.runOnWindows(async () => {
      await expectAsync(sut.canvas).toEqualImage('src/spec/images/ScreenAppenderSpec/screen-log.png');
    });

    // FIXME CI chokes on this one for some reason
    // await TestUtils.runOnLinux(async () => {
    //   await expectAsync(sut.canvas).toEqualImage('src/spec/images/ScreenAppenderSpec/screen-log-linux.png');
    // });
    engine.dispose();
  });
});
