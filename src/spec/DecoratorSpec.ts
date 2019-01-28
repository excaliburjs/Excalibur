import * as ex from '../../build/dist/excalibur';

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
  var testObsolete: TestObsolete = null;
  var logger = null;
  beforeEach(() => {
    testObsolete = new TestObsolete();
    logger = ex.Logger.getInstance();
    spyOn(logger, 'warn');
  });
  it('exists', () => {
    expect(ex.obsolete).toBeDefined();
  });

  it('can be used on a function', () => {
    var value = testObsolete.method();
    expect(logger.warn).toHaveBeenCalled();
    expect(value).toBe('hello world');
  });

  it('can be used on a getter', () => {
    var value = testObsolete.getter;
    expect(logger.warn).toHaveBeenCalled();
    expect(value).toBe('things');
  });

  it('can be used on a setter', () => {
    testObsolete.setter = 'stuff2';
    expect(logger.warn).toHaveBeenCalled();
    expect(testObsolete.getter).toBe('stuff2');
  });

  it('can have a custom message', () => {
    var value = testObsolete.customMessage();
    expect(logger.warn).toHaveBeenCalledWith('customMessage is marked obsolete: mymessage');
    expect(value).toBe('stuff');
  });

  it('can specify an alternate method', () => {
    var value = testObsolete.altmethod();
    expect(logger.warn).toHaveBeenCalledWith(
      'altmethod is marked obsolete: This feature will be ' + 'removed in future versions of Excalibur. Use altMethod instead'
    );
    expect(value).toBe('stuff');
  });

  it('can be used on a class', () => {
    var instance = new ObsoleteClass();
    expect(logger.warn).toHaveBeenCalledWith(
      'ObsoleteClass is marked obsolete: This feature will be ' + 'removed in future versions of Excalibur.'
    );
  });
});
