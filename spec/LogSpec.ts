/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Log.ts" />

describe("Logger", () => {

   var logger: ex.Logger;

   describe("ConsoleAppender", () => {
      var appender: ex.IAppender;
      var spiedAppender: jasmine.Spy;
      var spiedConsoleLog: jasmine.Spy;
      var spiedConsoleWarn: jasmine.Spy;
      var spiedConsoleError: jasmine.Spy;

      beforeEach(() => {
         appender = new ex.ConsoleAppender();

         if (ex.Logger["_instance"]) {
            ex.Logger["_instance"] = null;
         }

         logger = ex.Logger.getInstance();
         logger.addAppender(appender);
         spiedAppender = spyOn(appender, "log");
         spiedAppender.andCallThrough();

         logger.defaultLevel = ex.Log.Debug;

         spiedConsoleLog = spyOn(console, "log");
         spiedConsoleWarn = spyOn(console, "warn");
         spiedConsoleError = spyOn(console, "error");
      });

      it("should log a message", () => {

         logger.info("test");

         expect(spiedAppender).toHaveBeenCalled();
      });

      it("should log a message with the Info level", () => {

         logger.info("test");

         expect(spiedAppender).toHaveBeenCalledWith(ex.Log.Info, ["test"]);
      });

      it("should log a message with the Warn level", () => {

         logger.warn("test");

         expect(spiedAppender).toHaveBeenCalledWith(ex.Log.Warn, ["test"]);
      });

      it("should log a message with the Debug level", () => {

         logger.debug("test");

         expect(spiedAppender).toHaveBeenCalledWith(ex.Log.Debug, ["test"]);
      });

      it("should log a message with the Error level", () => {

         logger.error("test");

         expect(spiedAppender).toHaveBeenCalledWith(ex.Log.Error, ["test"]);
      });

      it("should log a message with the Fatal level", () => {

         logger.fatal("test");

         expect(spiedAppender).toHaveBeenCalledWith(ex.Log.Fatal, ["test"]);
      });

      it("should call console log for level Debug", () => {

         logger.debug("test");

         expect(spiedConsoleLog).toHaveBeenCalled();
      });

      it("should call console log for level Info", () => {

         logger.info("test");

         expect(spiedConsoleLog).toHaveBeenCalled();
      });

      it("should call console warn for level Warn", () => {

         logger.warn("test");

         expect(spiedConsoleWarn).toHaveBeenCalled();
      });

      it("should call console error for level Error", () => {

         logger.error("test");

         expect(spiedConsoleError).toHaveBeenCalled();
      });

      it("should call console error for level Fatal", () => {

         logger.fatal("test");

         expect(spiedConsoleError).toHaveBeenCalled();
      });

      it("should format message to console with appropriate level", () => {

         logger.info("test");

         expect(spiedConsoleLog).toHaveBeenCalledWith("[Info] : ", "test");

      });
   });
});