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
declare function spyOn(obj, methodName:string, ignoreMethodDoesntExist?:bool): jasmine.Spy;

declare function runs(func: () => void ) : void;
declare function waitsFor(latchFunction:() => void, optional_timeoutMessage?:string, optional_timeout?:number) : void;
declare function waits(timeout:number) : void;

declare module jasmine {
    function any(clazz:any);
    function createSpy(name: string): any;
    function createSpyObj(baseName: string, methodNames: any[]): any ;

    interface Matchers {
        toBe(expected): bool;
        toBeCloseTo(expected: number, precision: number): bool;
        toBeDefined(): bool;
        toBeFalsy(): bool;
        toBeGreaterThan(expected): bool;
        toBeLessThan(expected): bool;
        toBeNull(): bool;
        toBeTruthy(): bool;
        toBeUndefined(): bool;
        toContain(expected): bool;
        toEqual(expected): bool;
        toHaveBeenCalled();
        toHaveBeenCalledWith(...params: any[]): bool;
        toMatch(expected): bool;
        toThrow(expected: string): bool;
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
        wasCalled: bool;
        callCount: number;
    }

    interface Clock {
        useMock() : void;
        uninstallMock() : void;
        tick(millis: number): void;
    }

    var Clock: Clock;
}

