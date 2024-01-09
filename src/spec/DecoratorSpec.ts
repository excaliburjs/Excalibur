import * as ex from '@excalibur';

class TestObsolete {
  private _stuff = 'things';

  @ex.obsolete()
  method() {
    return 'hello world';
  }

  @ex.obsolete()
  get getter(): string {
    return this._stuff;
  }

  @ex.obsolete()
  set setter(value: string) {
    this._stuff = value;
  }

  @ex.obsolete({ alternateMethod: 'altMethod' })
  altmethod() {
    return 'stuff';
  }

  @ex.obsolete({ message: 'mymessage' })
  customMessage() {
    return 'stuff';
  }
}

@ex.obsolete()
class ObsoleteClass {}

describe('An @obsolete decorator', () => {
  let testObsolete: TestObsolete = null;
  let logger = null;
  beforeEach(() => {
    ex.Flags._reset();
    ex.Flags.disable('suppress-obsolete-message');
    testObsolete = new TestObsolete();
    logger = ex.Logger.getInstance();
    spyOn(logger, 'warn');
  });

  afterEach(() => {
    ex.resetObsoleteCounter();
  });

  it('exists', () => {
    expect(ex.obsolete).toBeDefined();
  });

  it('can be used on a function', () => {
    const value = testObsolete.method();
    expect(logger.warn).toHaveBeenCalled();
    expect(value).toBe('hello world');
  });

  it('can be used on a getter', () => {
    const value = testObsolete.getter;
    expect(logger.warn).toHaveBeenCalled();
    expect(value).toBe('things');
  });

  it('can be used on a setter', () => {
    testObsolete.setter = 'stuff2';
    expect(logger.warn).toHaveBeenCalled();
    expect(testObsolete.getter).toBe('stuff2');
  });

  it('can have a custom message', () => {
    const value = testObsolete.customMessage();
    expect(logger.warn).toHaveBeenCalledWith('customMessage is marked obsolete: mymessage');
    expect(value).toBe('stuff');
  });

  it('can specify an alternate method', () => {
    const value = testObsolete.altmethod();
    expect(logger.warn).toHaveBeenCalledWith(
      'altmethod is marked obsolete: This feature will be ' + 'removed in future versions of Excalibur. Use altMethod instead'
    );
    expect(value).toBe('stuff');
  });

  it('can be used on a class', () => {
    const instance = new ObsoleteClass();
    expect(logger.warn).toHaveBeenCalledWith(
      'ObsoleteClass is marked obsolete: This feature will be ' + 'removed in future versions of Excalibur.'
    );
  });

  it('is rate limited on method', () => {
    for (let i = 0; i < 10; i++) {
      testObsolete.method();
    }
    expect(logger.warn).toHaveBeenCalledTimes(5);
  });

  it('is rate limited on setter', () => {
    for (let i = 0; i < 10; i++) {
      testObsolete.setter = 'stuff';
    }
    expect(logger.warn).toHaveBeenCalledTimes(5);
  });

  it('is rate limited on getter', () => {
    for (let i = 0; i < 10; i++) {
      const value = testObsolete.getter;
    }
    expect(logger.warn).toHaveBeenCalledTimes(5);
  });

  it('is rate limited on classes', () => {
    for (let i = 0; i < 10; i++) {
      const value = new ObsoleteClass();
    }
    expect(logger.warn).toHaveBeenCalledTimes(5);
  });
});
