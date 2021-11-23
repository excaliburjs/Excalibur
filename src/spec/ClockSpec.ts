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
        tick: () => {},
        defaultUpdateMs: 1000
      });

      const standard = testClock.toStandardClock();
      expect(standard).toBeInstanceOf(ex.StandardClock);
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

    it('can limit fps', (done) => {
      const tickSpy = jasmine.createSpy('tick');
      const clock = new ex.StandardClock({
        tick: tickSpy,
        maxFps: 15
      });

      clock.start();
      setTimeout(() => {
        expect(clock.fpsSampler.fps).toBeCloseTo(15, 0);
        stop();
        done();
      }, 300)
    });

    it('can handle exceptions and stop', () => {
      const errorSpy = jasmine.createSpy('error');
      const clock = new ex.StandardClock({
        tick: () => { throw new Error('some error') },
        onFatalException: errorSpy
      });
      spyOn(clock, 'stop');

      clock.start();

      expect(errorSpy).toHaveBeenCalledWith(new Error('some error'));
      expect(clock.stop).toHaveBeenCalled();
    });

    it('can return the elapsed time', () => {
      const clock = new ex.StandardClock({
        tick: () => {}
      });
      (clock as any).update(100);
      expect(clock.elapsed()).toBe(100);
    });

    it('can be converted to a test clock', () => {
      const clock = new ex.StandardClock({
        tick: () => {}
      });

      const test = clock.toTestClock();

      expect(test).toBeInstanceOf(ex.TestClock);
    });
  });
})