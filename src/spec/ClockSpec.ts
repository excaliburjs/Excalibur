import * as ex from '@excalibur';

describe('Clocks', () => {
  describe('A TestClock', () => {
    it('exists', () => {
      expect(ex.TestClock).toBeDefined();
    });

    it('can manually tick', () => {
      const tickSpy = jasmine.createSpy('tick');
      const testClock = new ex.TestClock({
        tick: tickSpy,
        defaultUpdateMs: 1000
      });
      testClock.start();
      expect(testClock.isRunning()).toBe(true);
      expect(tickSpy).not.toHaveBeenCalled();

      testClock.step();
      expect(tickSpy).toHaveBeenCalledWith(1000);
      expect(testClock.elapsed()).toBe(1000);

      testClock.step();
      expect(testClock.now()).toBe(2000);

      testClock.step(22);
      expect(testClock.elapsed()).toBe(22);
      expect(testClock.now()).toBe(2022);

      testClock.stop();
      expect(testClock.isRunning()).toBe(false);
    });

    it('can be converted to a standard clock', () => {
      const testClock = new ex.TestClock({
        tick: () => { /* nothing */ },
        defaultUpdateMs: 1000
      });

      const standard = testClock.toStandardClock();
      expect(standard).toBeInstanceOf(ex.StandardClock);
    });

    it('will log a warning if not started', () => {
      const logger = ex.Logger.getInstance();
      spyOn(logger, 'warn');

      const testClock = new ex.TestClock({
        tick: () => { /* nothing */ },
        defaultUpdateMs: 1000
      });

      testClock.step();
      expect(testClock.isRunning()).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('The clock is not running, no step will be performed');
    });

    it('works with delay()', (done) => {
      const testClock = new ex.TestClock({
        tick: () => { /* nothing */ },
        defaultUpdateMs: 1000
      });
      testClock.start();
      ex.Util.delay(1000, testClock).then(() => {
        done();
      });

      testClock.step(500);
      testClock.step(500);
    });

    it('can schedule a callbacks to fire', async () => {
      const testClock = new ex.TestClock({
        tick: () => { /* nothing */ },
        defaultUpdateMs: 1000
      });
      testClock.start();

      const scheduledCb = jasmine.createSpy('scheduled');
      const scheduledCb2 = jasmine.createSpy('scheduled2');

      testClock.schedule(scheduledCb, 1000);
      testClock.schedule(scheduledCb2, 1500);

      expect(scheduledCb).not.toHaveBeenCalled();
      expect(scheduledCb2).not.toHaveBeenCalled();

      await testClock.step(500);
      expect(scheduledCb).not.toHaveBeenCalled();
      expect(scheduledCb2).not.toHaveBeenCalled();

      await testClock.step(500);
      expect(scheduledCb).toHaveBeenCalledTimes(1);
      expect(scheduledCb2).not.toHaveBeenCalled();

      await testClock.step(500);
      expect(scheduledCb2).toHaveBeenCalledTimes(1);
    });

    it('can limit fps', () => {
      const tickSpy = jasmine.createSpy('tick');
      const clock = new ex.TestClock({
        tick: tickSpy,
        maxFps: 15,
        defaultUpdateMs: null
      });

      clock.start();
      clock.step(1000 / 15);
      clock.step(1000 / 15);
      clock.step(1000 / 15);
      expect(clock.fpsSampler.fps).toBeCloseTo(15, -1);
      expect(tickSpy).toHaveBeenCalledWith(1000 / 15);
      clock.stop();
    });
  });

  describe('A StandardClock', () => {
    it('exists', () => {
      expect(ex.StandardClock).toBeDefined();
    });

    it('can tick', () => {
      const tickSpy = jasmine.createSpy('tick');
      const clock = new ex.StandardClock({
        tick: tickSpy
      });

      expect(tickSpy).not.toHaveBeenCalled();
      clock.start();

      expect(clock.isRunning()).toBe(true);
      expect(tickSpy).toHaveBeenCalled();

      clock.stop();
      expect(clock.isRunning()).toBe(false);
    });

    it('can handle exceptions and stop', () => {
      const errorSpy = jasmine.createSpy('error');
      const clock = new ex.StandardClock({
        tick: () => {
          throw new Error('some error');
        },
        onFatalException: errorSpy
      });
      spyOn(clock, 'stop');

      clock.start();

      expect(errorSpy).toHaveBeenCalledWith(new Error('some error'));
      expect(clock.stop).toHaveBeenCalled();
    });

    it('can return the elapsed time', () => {
      const clock = new ex.StandardClock({
        tick: () => { /* nothing */ }
      });
      (clock as any).update(100);
      expect(clock.elapsed()).toBe(100);
    });

    it('can be converted to a test clock', () => {
      const clock = new ex.StandardClock({
        tick: () => { /* nothing */ }
      });

      const test = clock.toTestClock();

      expect(test).toBeInstanceOf(ex.TestClock);
    });
  });
});