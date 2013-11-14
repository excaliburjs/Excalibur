// https://github.com/pivotal/jasmine
// http://pivotal.github.com/jasmine/jsdoc/index.html
// v 1.1.0

declare function describe(description : string, specDefinitions : () => void ): void;
declare function xdescribe(description : string, specDefinitions : () => void ): void;
declare function it(description : string, func : () => void ): void;
declare function xit(description : string, func : () => void ): void;
declare function expect(actual: any): jasmine.Matchers;
declare function beforeEach(afterEachFunction:() => void ): void;
declare function afterEach(afterEachFunction:() => void): void;
declare function spyOn(obj, methodName:string, ignoreMethodDoesntExist?:boolean): jasmine.Spy;

declare function runs(func: () => void ) : void;
declare function waitsFor(latchFunction:() => void, optional_timeoutMessage?:string, optional_timeout?:number) : void;
declare function waits(timeout:number) : void;

declare module jasmine {
    function any(clazz:any);
    function createSpy(name: string): any;
    function createSpyObj(baseName: string, methodNames: any[]): any ;

    interface Matchers {
        toBe(expected): boolean;
        toBeCloseTo(expected: number, precision: number): boolean;
        toBeDefined(): boolean;
        toBeFalsy(): boolean;
        toBeGreaterThan(expected): boolean;
        toBeLessThan(expected): boolean;
        toBeNull(): boolean;
        toBeTruthy(): boolean;
        toBeUndefined(): boolean;
        toContain(expected): boolean;
        toEqual(expected): boolean;
        toHaveBeenCalled();
        toHaveBeenCalledWith(...params: any[]): boolean;
        toMatch(expected): boolean;
        toThrow(expected? : string): boolean;
        not: Matchers;  // dynamically added in jasmine code
        //Deprecated: toNotBe(expected);  toNotContain(expected) toNotEqual(expected) toNotMatch(expected) wasNotCalled() wasNotCalledWith(
    }

    interface Spy {
        andReturn(value): void;
        andCallThrough(): void;
        andCallFake(fakeFunc: Function): void;
        
        identity: string;
        calls: any[];
        mostRecentCall: { args: any[]; };
        argsForCall: any[];
        wasCalled: boolean;
        callCount: number;
    }

    interface Clock {
        useMock() : void;
        uninstallMock() : void;
        tick(millis: number): void;
    }

    var Clock: Clock;
}

