import * as ex from '../../build/dist/excalibur';

describe('Logger', () => {
  var logger: ex.Logger;

  describe('ConsoleAppender', () => {
    var appender: ex.IAppender;
    var spiedAppender: jasmine.Spy;
    var spiedConsoleLog: jasmine.Spy;
    var spiedConsoleWarn: jasmine.Spy;
    var spiedConsoleError: jasmine.Spy;

    beforeEach(() => {
      appender = new ex.ConsoleAppender();

      logger = ex.Logger.getInstance();
      logger.addAppender(appender);
      spiedAppender = spyOn(appender, 'log');
      spiedAppender.and.callThrough();

      logger.defaultLevel = ex.LogLevel.Debug;

      spiedConsoleLog = spyOn(console, 'log');
      spiedConsoleWarn = spyOn(console, 'warn');
      spiedConsoleError = spyOn(console, 'error');
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

    it('should call console log for level Info', () => {
      logger.info('test');

      expect(spiedConsoleLog).toHaveBeenCalled();
    });

    it('should call console warn for level Warn', () => {
      logger.warn('test');

      expect(spiedConsoleWarn).toHaveBeenCalled();
    });

    it('should call console error for level Error', () => {
      logger.error('test');

      expect(spiedConsoleError).toHaveBeenCalled();
    });

    it('should call console error for level Fatal', () => {
      logger.fatal('test');

      expect(spiedConsoleError).toHaveBeenCalled();
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
