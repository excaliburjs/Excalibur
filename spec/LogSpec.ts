/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Log.ts" />

describe("Logger", () => {
    
    var logger: ex.Logger;

    describe("ConsoleAppender", ()=> {
        var appender: ex.IAppender = new ex.ConsoleAppender();
        var spiedAppender: jasmine.Spy;
        var spiedConsoleLog: jasmine.Spy;
        var spiedConsoleWarn: jasmine.Spy;
        var spiedConsoleError: jasmine.Spy;

        beforeEach(()=> {
            logger = ex.Logger.getInstance();
            logger.addAppender(appender);
            spiedAppender = spyOn(appender, "log");
            spiedAppender.andCallThrough();

            logger.defaultLevel = ex.Log.Debug;

            spiedConsoleLog = spyOn(console, "log");
            spiedConsoleWarn = spyOn(console, "warn");
            spiedConsoleError = spyOn(console, "error");
        });

        it("should log a message", ()=> {

            logger.log("test");

            expect(spiedAppender).toHaveBeenCalled();
        });

        it("should log a message with the Info level", ()=> {

            logger.log("test", ex.Log.Info);

            expect(spiedAppender).toHaveBeenCalledWith("test", ex.Log.Info);
        });

        it("should log a message with the Warn level", ()=> {

            logger.log("test", ex.Log.Warn);

            expect(spiedAppender).toHaveBeenCalledWith("test", ex.Log.Warn);
        });

        it("should log a message with the Debug level", ()=> {
            
            logger.log("test", ex.Log.Debug);

            expect(spiedAppender).toHaveBeenCalledWith("test", ex.Log.Debug);
        });

        it("should log a message with the Error level", ()=> {

            logger.log("test", ex.Log.Error);

            expect(spiedAppender).toHaveBeenCalledWith("test", ex.Log.Error);
        });

        it("should log a message with the Fatal level", ()=> {

            logger.log("test", ex.Log.Fatal);

            expect(spiedAppender).toHaveBeenCalledWith("test", ex.Log.Fatal);
        });            

        it("should call console log for level Debug", ()=> {
                
            logger.log("test", ex.Log.Debug);

            expect(spiedConsoleLog).toHaveBeenCalled();
        });

        it("should call console log for level Info", () => {

            logger.log("test", ex.Log.Info);

            expect(spiedConsoleLog).toHaveBeenCalled();
        });

        it("should call console warn for level Warn", () => {

            logger.log("test", ex.Log.Warn);

            expect(spiedConsoleWarn).toHaveBeenCalled();
        });

        it("should call console error for level Error", () => {

            logger.log("test", ex.Log.Error);

            expect(spiedConsoleError).toHaveBeenCalled();
        });

        it("should call console error for level Fatal", () => {

            logger.log("test", ex.Log.Fatal);

            expect(spiedConsoleError).toHaveBeenCalled();
        });

        it("should format message to console with appropriate level", ()=> {

            logger.log("test", ex.Log.Info);

            expect(spiedConsoleLog).toHaveBeenCalledWith("[Info] : test");

        });
    });
});