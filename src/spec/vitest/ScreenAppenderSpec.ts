import * as ex from '@excalibur';
import { TestUtils } from '../__util__/TestUtils';

describe('A ScreenAppender', () => {
  it('exists', () => {
    expect(ex.ScreenAppender).toBeDefined();
  });

  it('can be constructed', () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
    const sut = new ex.ScreenAppender({ engine });
    expect(sut).toBeDefined();
    engine.dispose();
  });

  describe('@visual', () => {
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
        await expect(sut.canvas).toEqualImage('/src/spec/assets/images/ScreenAppenderSpec/screen-log.png');
      });

      // FIXME CI chokes on this one for some reason
      // await TestUtils.runOnLinux(async () => {
      //   await expect(sut.canvas).toEqualImage('src/spec/assets/images/ScreenAppenderSpec/screen-log-linux.png');
      // });
      engine.dispose();
    });
  });
});
