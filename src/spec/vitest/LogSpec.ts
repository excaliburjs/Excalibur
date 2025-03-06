import * as ex from '@excalibur';
import { type MockInstance } from 'vitest';

describe('Logger', () => {
  let logger: ex.Logger;

  describe('ConsoleAppender', () => {
    let appender: ex.Appender;
    let spiedAppender: MockInstance;
    let spiedConsoleLog: MockInstance;
    let spiedConsoleWarn: MockInstance;
    let spiedConsoleError: MockInstance;

    beforeEach(() => {
      appender = new ex.ConsoleAppender();

      logger = ex.Logger.getInstance();
      logger.clearAppenders();
      logger.addAppender(appender);
      spiedAppender = vi.spyOn(appender, 'log');

      logger.defaultLevel = ex.LogLevel.Debug;

      spiedConsoleLog = vi.spyOn(console, 'log');
      spiedConsoleWarn = vi.spyOn(console, 'warn');
      spiedConsoleError = vi.spyOn(console, 'error');
    });

    afterEach(() => {
      // reset
      logger.defaultLevel = ex.LogLevel.Info;
    });

    it('should log a message', () => {
      logger.info('test');

      expect(spiedAppender).toHaveBeenCalled();
    });

    it('should log a message with the Info level', () => {
      logger.info('test');

      expect(spiedAppender).toHaveBeenCalledWith(ex.LogLevel.Info, ['test']);
    });

    it('should log a message with the Warn level', () => {
      logger.warn('test');

      expect(spiedAppender).toHaveBeenCalledWith(ex.LogLevel.Warn, ['test']);
    });

    it('should log a message with the Debug level', () => {
      logger.debug('test');

      expect(spiedAppender).toHaveBeenCalledWith(ex.LogLevel.Debug, ['test']);
    });

    it('should log a message with the Error level', () => {
      logger.error('test');

      expect(spiedAppender).toHaveBeenCalledWith(ex.LogLevel.Error, ['test']);
    });

    it('should log a message with the Fatal level', () => {
      logger.fatal('test');

      expect(spiedAppender).toHaveBeenCalledWith(ex.LogLevel.Fatal, ['test']);
    });

    it('should call console log for level Debug', () => {
      logger.debug('test');

      expect(spiedConsoleLog).toHaveBeenCalled();
    });

    it('should call console debug once', () => {
      logger.debugOnce('test');
      logger.debugOnce('test');
      logger.debugOnce('test');
      logger.debugOnce('test');
      logger.debugOnce('test');
      logger.debugOnce('test');

      expect(spiedConsoleLog).toHaveBeenCalledTimes(1);
    });

    it('should call console log for level Info', () => {
      logger.info('test');

      expect(spiedConsoleLog).toHaveBeenCalled();
    });

    it('should call console info once', () => {
      logger.infoOnce('test');
      logger.infoOnce('test');
      logger.infoOnce('test');
      logger.infoOnce('test');
      logger.infoOnce('test');
      logger.infoOnce('test');

      expect(spiedConsoleLog).toHaveBeenCalledTimes(1);
    });

    it('should call console warn for level Warn', () => {
      logger.warn('test');

      expect(spiedConsoleWarn).toHaveBeenCalled();
    });

    it('should call console warn once', () => {
      logger.warnOnce('test');
      logger.warnOnce('test');
      logger.warnOnce('test');
      logger.warnOnce('test');
      logger.warnOnce('test');
      logger.warnOnce('test');

      expect(spiedConsoleWarn).toHaveBeenCalledTimes(1);
    });

    it('should call console error for level Error', () => {
      logger.error('test');

      expect(spiedConsoleError).toHaveBeenCalled();
    });

    it('should call console error once', () => {
      logger.errorOnce('test');
      logger.errorOnce('test');
      logger.errorOnce('test');
      logger.errorOnce('test');
      logger.errorOnce('test');
      logger.errorOnce('test');

      expect(spiedConsoleError).toHaveBeenCalledTimes(1);
    });

    it('should call console error for level Fatal', () => {
      logger.fatal('test');

      expect(spiedConsoleError).toHaveBeenCalled();
    });

    it('should call console fatal once', () => {
      logger.fatalOnce('test');
      logger.fatalOnce('test');
      logger.fatalOnce('test');
      logger.fatalOnce('test');
      logger.fatalOnce('test');
      logger.fatalOnce('test');

      expect(spiedConsoleError).toHaveBeenCalledTimes(1);
    });

    it('should format message to console with appropriate level', () => {
      logger.info('test');

      expect(spiedConsoleLog).toHaveBeenCalledWith('[Info] : ', 'test');
    });

    it('should support variable number of arguments and output appropriately to console', () => {
      logger.info(1, 2, 'foo', []);

      expect(spiedConsoleLog).toHaveBeenCalledWith('[Info] : ', 1, 2, 'foo', []);
    });
  });
});
